const dgram = require('dgram');
const { when } = require('jest-when');
const { Socket } = require('./socket');

jest.mock('dgram');

describe('Socket', () => {
  describe('constructor', () => {
    describe('validations', () => {
      it.each([
        ['undefined', undefined],
        ['null', null],
        ['string', 'strings'],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
        ['function', () => {}]])('should throw when port is %s', (title, port) => {
        stubCreateSocket();

        expect(() => new Socket({
          host: '127.0.0.1',
          port,
        })).toThrow(TypeError);
      });

      it.each([
        ['undefined', undefined],
        ['null', null],
        ['number', 1],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
        ['function', () => {}],
      ])('should throw when host is %s', (title, host) => {
        stubCreateSocket();

        expect(() => new Socket({
          port: 1234,
          host,
        })).toThrow(TypeError);
      });

      it.each([
        ['null', null],
        ['number', 1],
        ['string', 'strings'],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
        ['function', () => {}],
      ])('should throw when batch is %s', (title, batch) => {
        stubCreateSocket();

        expect(() => new Socket({
          port: 1234,
          host: '127.0.0.1',
          batch,
        })).toThrow(TypeError);
      });

      it.each([
        ['null', null],
        ['boolean', true],
        ['string', 'strings'],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
        ['function', () => {}],
      ])('should throw when maxBufferSize is %s', (title, maxBufferSize) => {
        stubCreateSocket();

        expect(() => new Socket({
          port: 1234,
          host: '127.0.0.1',
          maxBufferSize,
        })).toThrow(TypeError);
      });

      it.each([
        ['null', null],
        ['boolean', true],
        ['string', 'strings'],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
        ['function', () => {}],
      ])('should throw when flushInterval is %s', (title, flushInterval) => {
        stubCreateSocket();

        expect(() => new Socket({
          port: 1234,
          host: '127.0.0.1',
          flushInterval,
        })).toThrow(TypeError);
      });
    });

    it('should create a socket', () => {
      stubCreateSocket();

      // eslint-disable-next-line no-new
      new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      expect(dgram.createSocket).toBeCalledTimes(1);
    });

    it('should unref socket upon creation', () => {
      const { unref } = stubCreateSocket();

      // eslint-disable-next-line no-new
      new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      expect(unref).toBeCalled();
    });
  });

  describe('send', () => {
    it('should throw when message is undefined', () => {
      stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      expect(() => target.send({ callback: () => {} })).toThrow(TypeError);
    });

    it('should send message', () => {
      const { send } = stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        batch: false,
      });

      target.send({ message: 'a message from beyond' });

      expect(send).toBeCalledWith(Buffer.from('a message from beyond'), 0, 21, 1234, '127.0.0.1', expect.any(Function));
    });

    it('should trigger callback when callback is specified', () => {
      stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        batch: false,
      });

      const callback = jest.fn();

      target.send({ message: 'a message from beyond', callback });

      expect(callback).toBeCalledTimes(1);
    });

    it('should trigger callback with error when error from send occurs', () => {
      const error = new Error();
      stubCreateSocket({ err: error });

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        batch: false,
      });

      const callback = jest.fn();

      target.send({ message: 'a message from beyond', callback });

      expect(callback).toBeCalledWith(error);
    });

    it('should not throw when callback is undefined', () => {
      const { send } = stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        batch: false,
      });

      target.send({ message: 'a message from beyond' });

      expect(send).toBeCalledTimes(1);
    });

    it('should throw when callback is not a function', () => {
      stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
      });

      expect(() => target.send({ message: 'a message from beyond', callback: 'not a function' })).toThrow(TypeError);
    });

    describe('buffer', () => {
      it('should not send message if buffer size is less then max size', () => {
        const { send } = stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 100,
        });

        const callback = jest.fn();

        target.send({ message: 'a message from beyond' });

        expect(send).not.toBeCalled();
        expect(callback).not.toBeCalled();
      });

      it('should send message when buffer is filled', () => {
        const { send } = stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
        });

        target.send({ message: 'a message from beyond' });
        target.send({ message: 'another message from beyond' });

        expect(send).toBeCalledTimes(1);
        expect(send).toBeCalledWith(Buffer.from('a message from beyond\nanother message from beyond'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
      });

      it('should not additional message until buffer is filled again', () => {
        const { send } = stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
        });

        target.send({ message: 'a message from beyond' });
        target.send({ message: 'another message from beyond' });
        target.send({ message: 'a third message' });

        expect(send).toBeCalledTimes(1);
        expect(send).toBeCalledWith(Buffer.from('a message from beyond\nanother message from beyond'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
      });

      it('should send additional message only when buffer was already sent', () => {
        const { send } = stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
        });

        target.send({ message: 'a message from beyond' });
        target.send({ message: 'another message from beyond' });
        target.send({ message: 'a third message' });
        target.send({ message: 'a forth message, too many messages, so little time' });

        expect(send).toBeCalledTimes(2);
        expect(send).toBeCalledWith(Buffer.from('a third message\na forth message, too many messages, so little time'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
      });

      it('should trigger all the callbacks when buffer is flushed', () => {
        stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
        });

        const callback1 = jest.fn();
        const callback2 = jest.fn();

        target.send({ message: 'a message from beyond', callback: callback1 });
        target.send({ message: 'another message from beyond', callback: callback2 });

        expect(callback1).toBeCalledTimes(1);
        expect(callback2).toBeCalledTimes(1);
      });

      it('should trigger defined callbacks when buffer is flushed', () => {
        stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
        });

        const callback = jest.fn();

        target.send({ message: 'a message from beyond', callback });
        target.send({ message: 'another message from beyond' });

        expect(callback).toBeCalledTimes(1);
      });

      it('should send message after interval even if buffer is not full', async () => {
        const { send } = stubCreateSocket();

        const target = new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
          flushInterval: 100,
        });

        target.send({ message: 'a message from beyond' });

        expect(send).not.toBeCalled();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 150);
        });

        expect(send).toBeCalledTimes(1);
      });

      it('should not send on interval when buffer is empty', async () => {
        const { send } = stubCreateSocket();

        // eslint-disable-next-line no-new
        new Socket({
          port: 1234,
          host: '127.0.0.1',
          buffer: true,
          maxBufferSize: 30,
          flushInterval: 100,
        });

        await new Promise(resolve => {
          setTimeout(() => resolve(), 200);
        });

        expect(send).not.toBeCalled();
      });
    });
  });

  describe('close', () => {
    it('should flush buffer when batch is true and there are items in the buffer', () => {
      const { send } = stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        buffer: true,
        maxBufferSize: 30,
      });

      target.send({ message: 'a message from beyond' });

      expect(send).not.toBeCalled();

      target.close();

      expect(send).toBeCalledTimes(1);
      expect(send).toBeCalledWith(Buffer.from('a message from beyond'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
    });

    it('should clear interval', async () => {
      const { send } = stubCreateSocket();

      const target = new Socket({
        port: 1234,
        host: '127.0.0.1',
        buffer: true,
        maxBufferSize: 30,
        flushInterval: 200,
      });

      target.send({ message: 'a message from beyond' });

      expect(send).not.toBeCalled();

      target.close();

      target.send({ message: 'second message' });
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(send).toBeCalledTimes(1);
      expect(send).toBeCalledWith(Buffer.from('a message from beyond'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
    });
  });

  function stubCreateSocket({ err } = {}) {
    const socketStub = {
      send: jest.fn((message, offset, length, port, host, callback) => callback && callback(err)),
      unref: jest.fn(),
    };

    when(dgram.createSocket)
      .calledWith('udp4')
      .mockReturnValue(socketStub);

    return socketStub;
  }
});
