const dgram = require('dgram');

jest.mock('dgram');

const { when } = require('jest-when');
const { Metrics, DataDogReporter } = require('../index');

let dateStub;

describe('DataDogReporter', () => {
  describe('report', () => {
    beforeEach(() => {
      dateStub = jest.spyOn(Date, 'now');
    });
    afterEach(() => {
      dateStub.mockRestore();
    });

    it('should send data to DataDog in the form of "key:value|ms"', () => new Promise(done => {
      const { send } = stubCreateSocket();
      setDate(1464260419000);
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test.datadog').meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];

        const result = splitStat(args[0].toString());

        expect(result[0]).toEqual('metric.test.datadog');
        expect(result[1]).toBeGreaterThanOrEqual(900);
        expect(result[1]).toBeLessThanOrEqual(1500);
        expect(result[2]).toEqual('ms');
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
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = args[3];
        expect(result).toEqual(expected);
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
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = splitStat(args[0].toString())[0];
        expect(result).toEqual(expected);
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
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = splitStat(args[0].toString())[0];
        expect(result).toEqual(expected);
        done();
      });
    }));

    it('when tags are specified, should send data to DataDog in the form of "key:value|ms|#tag:value"', () => new Promise(done => {
      const { send } = stubCreateSocket();
      setDate(1464260419000);
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test.datadog', { tag1: 'value1', tag2: 'value2' }).meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];

        const result = splitStat(args[0].toString());

        expect(result[0]).toEqual('metric.test.datadog');
        expect(result[1]).toBeGreaterThanOrEqual(900);
        expect(result[1]).toBeLessThanOrEqual(1100);
        expect(result[2]).toEqual('ms');
        expect(result[3]).toEqual('#tag1:value1,tag2:value2');
        done();
      });
    }));
  });

  describe('value', () => {
    it('should send data to DataDog in the form of "key:value|g"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.value').value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test.value:5|g');
    });

    it('should use the default DataDog port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('metric.test.value').value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[3];
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix.', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.value:10|g';

      metrics.space('metric.test.value').value(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.value:20|g';

      metrics.space('metric.test.value').value(20);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual(expected);
    });

    it('when tags are specified, should send data to DataDog in the form of "key:value|g|#tag:value"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.value', { tag1: 'value1', tag2: 'value2' }).value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test.value:5|g|#tag1:value1,tag2:value2');
    });
  });

  describe('increment', () => {
    it('should send data to DataDog in the form of "key:value|c"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.inc').increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test.inc:10|c');
    });

    it('should use the default DataDog port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('metric.test.inc').increment(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[3];
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix.', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.inc:10|c';

      metrics.space('metric.test.inc').increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', prefix: 'prefix', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);
      const expected = 'prefix.metric.test.inc:20|c';

      metrics.space('metric.test.inc').increment(20);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual(expected);
    });

    it('when tags are specified, should send data to DataDog in the form of "key:value|c|#tag:value"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.inc', { tag1: 'value1', tag2: 'value2' }).increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test.inc:10|c|#tag1:value1,tag2:value2');
    });

    it('when only default tags are specified, should send data to DataDog in the form of "key:value|c|#tag:value"', () => {
      const { send } = stubCreateSocket();
      const options = { host: '1.2.3.4', batch: false, defaultTags: { tag1: 'value1', tag2: 'value2' } };
      const reporter = new DataDogReporter(options);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test.inc').increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test.inc:10|c|#tag1:value1,tag2:value2');
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
    send: jest.fn(),
    unref: jest.fn(),
  };
  when(dgram.createSocket)
    .calledWith('udp4')
    .mockReturnValueOnce(socketStub);

  return socketStub;
}

function setDate(timestamp) {
  const date = new Date(timestamp);
  dateStub.mockImplementation(() => date);
}

function splitStat(str) {
  const firstPart = str.substr(0, str.indexOf(':'));
  const secondPart = str.substr(str.indexOf(':') + 1);
  const parts2 = secondPart.split('|');
  return [firstPart, parseInt(parts2[0], 10), ...parts2.slice(1)];
}
