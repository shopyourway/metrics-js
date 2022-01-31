const dgram = require('dgram');

jest.mock('dgram');
const { when } = require('jest-when');
const { Metrics, GraphiteReporter } = require('../index');

let dateStub;

describe('GraphiteReporter', () => {
  describe('report', () => {
    beforeEach(() => {
      dateStub = jest.spyOn(Date, 'now');
    });
    afterEach(() => {
      dateStub.mockRestore();
    });

    it('should send data to Graphite in the form of "key:value|ms"', () => new Promise(done => {
      const { send } = stubCreateSocket();
      setDate(1464260419000);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('space.subspace').meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = parseReport(args[0].toString());

        expect(result.key).toEqual('space.subspace');
        expect(result.value).toBeGreaterThanOrEqual(900);
        expect(result.value).toBeLessThanOrEqual(1100);
        expect(result.type).toEqual('ms');
        done();
      });
    }));

    it('should append tags to to the metric report', () => new Promise(done => {
      const { send } = stubCreateSocket();
      setDate(1464260419000);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test', { tag1: 'value1', tag2: 'value2' }).meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = parseReport(args[0].toString());

        expect(result.key).toEqual('metric.test');
        expect(result.value).toBeGreaterThanOrEqual(900);
        expect(result.value).toBeLessThanOrEqual(1100);
        expect(result.type).toEqual('ms');
        expect(result.addtionalParts[0]).toEqual('#tag1:value1,tag2:value2');
        done();
      });
    }));

    it('should use the default Graphite port if no port is provided', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 8125;

      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const result = args[3];
        expect(result).toEqual(expected);
        done();
      });
    }));

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'namespace.space.subspace';

      const wrappedFunc = metrics.space('space.subspace').meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const data = args[0].toString();
        const result = parseReport(data);
        expect(result.key).toEqual(expected);
        done();
      });
    }));

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => new Promise(done => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const expected = 'namespace.space.subspace';

      const wrappedFunc = metrics.space('space.subspace').meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).toBeCalledTimes(1);
        const args = send.mock.calls[0];
        const data = args[0].toString();
        const result = parseReport(data);

        expect(result.key).toEqual(expected);
        done();
      });
    }));
  });

  describe('value', () => {
    it('should send data to Graphite in the form of "key:value|v"', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('space.subspace').value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = parseReport(args[0].toString());
      expect(result.key).toEqual('space.subspace');
      expect(result.value).toEqual(5);
      expect(result.type).toEqual('v');
    });

    it('should append tags when tags are available', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test', { tag1: 'value1', tag2: 'value2' }).value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test:5|v|#tag1:value1,tag2:value2');
    });

    it('should use the default Graphite port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('space.subspace').value(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[3];
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'namespace.space.subspace';

      metrics.space('space.subspace').value(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const data = args[0].toString();
      const result = parseReport(data);
      expect(result.key).toEqual(expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'namespace.space.subspace';

      metrics.space('space.subspace').value(20);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const data = args[0].toString();
      const result = parseReport(data);
      expect(result.key).toEqual(expected);
    });
  });

  describe('increment', () => {
    it('should send data to Graphite in the form of "key:value|c"', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('space.subspace').increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('space.subspace:10|c');
    });

    it('should append tags to report when tags are available', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);

      metrics.space('metric.test', { tag1: 'value1', tag2: 'value2' }).increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[0].toString();
      expect(result).toEqual('metric.test:10|c|#tag1:value1,tag2:value2');
    });

    it('should use the default Graphite port if no port is provided', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 8125;

      metrics.space('space.subspace').increment(5);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const result = args[3];
      expect(result).toEqual(expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace.' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'namespace.space.subspace';

      metrics.space('space.subspace').increment(10);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const data = args[0].toString();
      const result = parseReport(data);
      expect(result.key).toEqual(expected);
    });

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4', prefix: 'namespace' };
      const reporter = new GraphiteReporter(graphiteOptions);
      const metrics = new Metrics([reporter]);
      const expected = 'namespace.space.subspace';

      metrics.space('space.subspace').increment(20);

      expect(send).toBeCalledTimes(1);
      const args = send.mock.calls[0];
      const data = args[0].toString();
      const result = parseReport(data);
      expect(result.key).toEqual(expected);
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
  };

  when(dgram.createSocket)
    .calledWith('udp4')
    .mockReturnValue(socketStub);

  return socketStub;
}

function setDate(timestamp) {
  const date = new Date(timestamp);
  dateStub.mockImplementation(() => date);
}

function parseReport(str) {
  const metricKey = str.substr(0, str.indexOf(':'));
  const metricParts = str.substr(str.indexOf(':') + 1).split('|');
  const metricValue = parseInt(metricParts[0], 10);
  return {
    key: metricKey,
    value: metricValue,
    type: metricParts[1],
    addtionalParts: metricParts.slice(2),
  };
}
