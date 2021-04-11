const dgram = require('dgram');
const assert = require('assert');
const sinon = require('sinon');
const Socket = require('./socket');

describe('socket', () => {
  let createSocketStub;
  beforeEach(() => {
    createSocketStub = sinon.stub(dgram, 'createSocket');
  });
  afterEach(() => {
    createSocketStub.restore();
  });

  describe('constructor', () => {
    it('should throw when port is undefined', () => {
      stubCreateSocket();

      assert.throws(() => new Socket({
        host: '127.0.0.1',
      }), TypeError);
    });

    it('should throw when host is undefined', () => {
      stubCreateSocket();

      assert.throws(() => new Socket({
        port: 1234,
      }), TypeError);
    });

    it('should create a socket', () => {
      stubCreateSocket();

      // eslint-disable-next-line no-new
      new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      assert.ok(createSocketStub.calledOnce);
    });

    it('should unref socket upon creation', () => {
      const { unref } = stubCreateSocket();

      // eslint-disable-next-line no-new
      new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      assert.ok(unref.calledOnce);
    });
  });

  describe('send', () => {
    it('should throw when message is undefined', () => {
      stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      assert.throws(() => target.send({ callback: () => {} }), TypeError);
    });

    it('should send message', () => {
      const { send } = stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      target.send({ message: 'a message from beyond' });

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      assert.strictEqual(args[0].toString(), 'a message from beyond', 'message is not equal');
      assert.strictEqual(args[1], 0, 'offset is not 0');
      assert.strictEqual(args[2], 21, 'length is different then expected');
      assert.strictEqual(args[3], 1234, 'port is different then expected');
      assert.strictEqual(args[4], '127.0.0.1', 'hoat is different then expected');
    });

    it('should trigger callback when callback is specified', () => {
      const { send } = stubCreateSocket();
      send.callsArg(5);

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      const callback = sinon.spy();

      target.send({ message: 'a message from beyond', callback });

      assert.ok(callback.calledOnce);
    });

    it('should trigger callback with error when error from send occurs', () => {
      const { send } = stubCreateSocket();
      const error = new Error();
      send.callsArgWith(5, error);

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      const callback = sinon.spy();

      target.send({ message: 'a message from beyond', callback });

      assert.ok(callback.calledOnce);
      assert.strictEqual(callback.getCall(0).args[0], error);
    });

    it('should not throw when callback is undefined', () => {
      const { send } = stubCreateSocket();
      send.callsArgWith(5);

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      target.send({ message: 'a message from beyond' });

      assert.ok(send.calledOnce);
    });

    it('should throw when callback is not a function', () => {
      stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      assert.throws(() => target.send({ message: 'a message from beyond', callback: 'not a function' }), TypeError);
    });
  });

  function stubCreateSocket() {
    const socketStub = {
      send: sinon.stub(),
      unref: sinon.stub(),
    };
    createSocketStub.withArgs('udp4').returns(socketStub);

    return socketStub;
  }
});
