const assert = require('assert');
const sinon = require('sinon');
const dgram = require('dgram');

const { Metrics, GraphiteReporter } = require('../index');

let createSocketStub;
let DateStub;

describe('GraphiteReporter', () => {
  describe('report', () => {
    beforeEach(() => {
      createSocketStub = sinon.stub(dgram, 'createSocket');
      DateStub = sinon.stub(Date, 'now');
    });
    afterEach(() => {
      createSocketStub.restore();
      DateStub.restore();
    });

    it('should send data to Graphite in the form of "key:value|ms"', () => new Promise(done => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      stubDateNow(1464260419000);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(socketSendSpy.calledOnce);
        const { args } = socketSendSpy.getCall(0);
        const resultParts = splitGraphite(args[0].toString());

        assert.equal(resultParts[0], 'SYW.Adder');
        assert.ok(resultParts[1] >= 900 && resultParts[1] < 1100);
        assert.equal(resultParts[2], 'ms');
        done();
      });
    }));

    it('should use the default Graphite port if no port is provided', () => new Promise(done => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 8125;

      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(socketSendSpy.calledOnce);
        const { args } = socketSendSpy.getCall(0);
        const result = args[3];
        assert.equal(result, expected);
        done();
      });
    }));

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => new Promise(done => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'Foo.SYW.Adder';

      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(socketSendSpy.calledOnce);
        const { args } = socketSendSpy.getCall(0);
        const data = args[0].toString();
        const result = splitGraphite(data)[0];
        assert.equal(result, expected);
        done();
      });
    }));

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => new Promise(done => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'Foo.SYW.Adder';

      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(socketSendSpy.calledOnce);
        const { args } = socketSendSpy.getCall(0);
        const data = args[0].toString();
        const result = splitGraphite(data)[0];
        assert.equal(result, expected);
        done();
      });
    }));
  });

  describe('value', () => {
    beforeEach(() => {
      createSocketStub = sinon.stub(dgram, 'createSocket');
    });
    afterEach(() => {
      createSocketStub.restore();
    });

    it('should send data to Graphite in the form of "key:value|v"', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('SYW.Adder').value(5);

      const { args } = socketSendSpy.getCall(0);
      assert.ok(socketSendSpy.calledOnce);
      const resultParts = splitGraphite(args[0].toString());
      assert.equal(resultParts[0], 'SYW.Adder');
      assert.equal(resultParts[1], 5);
      assert.equal(resultParts[2], 'v');
    });

    it('should use the default Graphite port if no port is provided', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('SYW.Adder').value(5);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const result = args[3];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'Foo.SYW.Adder';

      metrics.space('SYW.Adder').value(10);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const data = args[0].toString();
      const result = splitGraphite(data)[0];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'Foo.SYW.Adder';

      metrics.space('SYW.Adder').value(20);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const data = args[0].toString();
      const result = splitGraphite(data)[0];
      assert.equal(result, expected);
    });
  });

  describe('increment', () => {
    beforeEach(() => {
      createSocketStub = sinon.stub(dgram, 'createSocket');
    });
    afterEach(() => {
      createSocketStub.restore();
    });

    it('should send data to Graphite in the form of "key:value|c"', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('SYW.Adder').increment(10);

      const { args } = socketSendSpy.getCall(0);
      assert.ok(socketSendSpy.calledOnce);
      const resultParts = splitGraphite(args[0].toString());
      assert.equal(resultParts[0], 'SYW.Adder');
      assert.equal(resultParts[1], 10);
      assert.equal(resultParts[2], 'c');
    });

    it('should use the default Graphite port if no port is provided', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('SYW.Adder').increment(5);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const result = args[3];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'Foo.SYW.Adder';

      metrics.space('SYW.Adder').increment(10);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const data = args[0].toString();
      const result = splitGraphite(data)[0];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => {
      const socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      const graphiteOptions = { host: '1.2.3.4', prefix: 'Foo' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'Foo.SYW.Adder';

      metrics.space('SYW.Adder').increment(20);

      assert.ok(socketSendSpy.calledOnce);
      const { args } = socketSendSpy.getCall(0);
      const data = args[0].toString();
      const result = splitGraphite(data)[0];
      assert.equal(result, expected);
    });
  });
});

function getAsyncFunc(duration) {
  return (a, b, callback) => {
    setTimeout(() => {
      const result = a + b;
      callback(null, result);
    }, duration);
  };
}

function stubCreateSocket(sendFunc) {
  const socketStub = {
    send: sendFunc,
  };
  createSocketStub.withArgs('udp4').returns(socketStub);
}

function stubDateNow(timestamp) {
  const date = new Date(timestamp);
  DateStub.withArgs().returns(date);
}

function splitGraphite(str) {
  const parts1 = str.split(':', 2);
  const parts2 = parts1[1].split('|', 2);
  return [parts1[0], parts2[0], parts2[1]];
}
