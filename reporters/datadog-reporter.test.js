const assert = require('assert');
const sinon = require('sinon');
const dgram = require('dgram');

const { Metrics, DataDogReporter } = require('../index');

let createSocketStub;
let DateStub;

describe('DataDogReporter', () => {
  describe('report', () => {
    beforeEach(() => {
      createSocketStub = sinon.stub(dgram, 'createSocket');
      DateStub = sinon.stub(Date, 'now');
    });
    afterEach(() => {
      createSocketStub.restore();
      DateStub.restore();
    });

    it('should send data to DataDog in the form of "key:value|ms"', () => new Promise(done => {
      const { send } = stubCreateSocket();
      stubDateNow(1464260419000);
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test.datadog').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(send.calledOnce);
        const { args } = send.getCall(0);

        const result = splitStat(args[0].toString());

        assert.equal(result[0], 'metric.test.datadog');
        assert.ok(result[1] >= 900 && result[1] < 1500);
        assert.equal(result[2], 'ms');
        done();
      });
    }));

    it('should use the default DataDog port if no port is provided', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 8125;

      const wrappedFunc = metrics.space('metric.test.datadog').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(send.calledOnce);
        const { args } = send.getCall(0);
        const result = args[3];
        assert.equal(result, expected);
        done();
      });
    }));

    it('should add a valid prefix to the key when one is provided with a trailing dot', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix.', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'prefix.metric.test.datadog';

      const wrappedFunc = metrics.space('metric.test.datadog').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(send.calledOnce);
        const { args } = send.getCall(0);
        const result = splitStat(args[0].toString())[0];
        assert.equal(result, expected);
        done();
      });
    }));

    it('should add a valid prefix to the key when one is provided without a trailing dot', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'prefix.metric.test.datadog';

      const wrappedFunc = metrics.space('metric.test.datadog').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(send.calledOnce);
        const { args } = send.getCall(0);
        const result = splitStat(args[0].toString())[0];
        assert.equal(result, expected);
        done();
      });
    }));

    it('when tags are specified, should send data to DataDog in the form of "key:value|ms|#tag:value"', () => new Promise(done => {
      const { send } = stubCreateSocket();
      stubDateNow(1464260419000);
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test.datadog', { tag1: 'value1', tag2: 'value2' }).meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(send.calledOnce);
        const { args } = send.getCall(0);

        const result = splitStat(args[0].toString());

        assert.equal(result[0], 'metric.test.datadog');
        assert.ok(result[1] >= 900 && result[1] < 1100);
        assert.equal(result[2], 'ms');
        assert.equal(result[3], '#tag1:value1,tag2:value2');
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

    it('should send data to DataDog in the form of "key:value|g"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.value').value(5);

      const { args } = send.getCall(0);
      assert.ok(send.calledOnce);
      const result = args[0].toString();
      assert.equal(result, 'metric.test.value:5|g');
    });

    it('should use the default DataDog port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('metric.test.value').value(5);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[3];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix.', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.value:10|g';

      metrics.space('metric.test.value').value(10);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[0].toString();
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.value:20|g';

      metrics.space('metric.test.value').value(20);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[0].toString();
      assert.equal(result, expected);
    });

    it('when tags are specified, should send data to DataDog in the form of "key:value|g|#tag:value"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.value', { tag1: 'value1', tag2: 'value2' }).value(5);

      const { args } = send.getCall(0);
      assert.ok(send.calledOnce);
      const result = args[0].toString();
      assert.equal(result, 'metric.test.value:5|g|#tag1:value1,tag2:value2');
    });
  });

  describe('increment', () => {
    beforeEach(() => {
      createSocketStub = sinon.stub(dgram, 'createSocket');
    });
    afterEach(() => {
      createSocketStub.restore();
    });

    it('should send data to DataDog in the form of "key:value|c"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.inc').increment(10);

      const { args } = send.getCall(0);
      assert.ok(send.calledOnce);
      const result = args[0].toString();
      assert.equal(result, 'metric.test.inc:10|c');
    });

    it('should use the default DataDog port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('metric.test.inc').increment(5);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[3];
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix.', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.inc:10|c';

      metrics.space('metric.test.inc').increment(10);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[0].toString();
      assert.equal(result, expected);
    });

    it('should add a valid prefix to the key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.inc:20|c';

      metrics.space('metric.test.inc').increment(20);

      assert.ok(send.calledOnce);
      const { args } = send.getCall(0);
      const result = args[0].toString();
      assert.equal(result, expected);
    });

    it('when tags are specified, should send data to DataDog in the form of "key:value|c|#tag:value"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.inc', { tag1: 'value1', tag2: 'value2' }).increment(10);

      const { args } = send.getCall(0);
      assert.ok(send.calledOnce);
      const result = args[0].toString();
      assert.equal(result, 'metric.test.inc:10|c|#tag1:value1,tag2:value2');
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

function stubCreateSocket() {
  const socketStub = {
    send: sinon.spy(),
    unref: sinon.spy(),
  };
  createSocketStub.withArgs('udp4').returns(socketStub);

  return socketStub;
}

function stubDateNow(timestamp) {
  const date = new Date(timestamp);
  DateStub.withArgs().returns(date);
}

function splitStat(str) {
  const firstPart = str.substr(0, str.indexOf(':'));
  const secondPart = str.substr(str.indexOf(':') + 1);
  const parts2 = secondPart.split('|');
  return [firstPart, ...parts2];
}
