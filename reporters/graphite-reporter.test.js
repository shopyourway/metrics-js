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
        const resultParts = splitGraphite(args[0].toString());

        expect(resultParts[0]).toEqual('space.subspace');
        expect(resultParts[1]).toBeGreaterThanOrEqual(900);
        expect(resultParts[1]).toBeLessThanOrEqual(1100);
        expect(resultParts[2]).toEqual('ms');
        done();
      });
    }));

    it('when tags are used, should report error to callback and do not report metric', () => new Promise(done => {
      const { send } = stubCreateSocket();
      setDate(1464260419000);
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      let error;
      const metrics = new Metrics([reporter], e => { error = e; });
      const func = getAsyncFunc(1000);

      const wrappedFunc = metrics.space('metric.test', { tag1: 'value1' }).meter(func);

      wrappedFunc(1, 1, () => {
        expect(send).not.toBeCalled();
        expect(error).toBeInstanceOf(Error);
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
        const result = splitGraphite(data)[0];
        expect(result).toEqual(expected);
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
        const result = splitGraphite(data)[0];

        expect(result).toEqual(expected);
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
      const resultParts = splitGraphite(args[0].toString());
      expect(resultParts[0]).toEqual('space.subspace');
      expect(resultParts[1]).toEqual(5);
      expect(resultParts[2]).toEqual('v');
    });

    it('when tags are specified, should call the error callback and do not send metric', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      let error;
      const metrics = new Metrics([reporter], e => { error = e; });

      metrics.space('metric.test', { tag1: 'value1' }).value(5);

      expect(send).not.toBeCalled();
      expect(error).toBeInstanceOf(Error);
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
      const result = splitGraphite(data)[0];
      expect(result).toEqual(expected);
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
      const result = splitGraphite(data)[0];
      expect(result).toEqual(expected);
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
      const resultParts = splitGraphite(args[0].toString());
      expect(resultParts[0]).toEqual('space.subspace');
      expect(resultParts[1]).toEqual(10);
      expect(resultParts[2]).toEqual('c');
    });

    it('when tags are specified, should send error to error callback and do not report metric', () => {
      const { send } = stubCreateSocket();
      const graphiteOptions = { host: '1.2.3.4' };
      const reporter = new GraphiteReporter(graphiteOptions);
      let error;
      const metrics = new Metrics([reporter], e => { error = e; });

      metrics.space('metric.test', { tag1: 'value1' }).increment(10);

      expect(send).not.toBeCalled();
      expect(error).toBeInstanceOf(Error);
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
      const result = splitGraphite(data)[0];
      expect(result).toEqual(expected);
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
      const result = splitGraphite(data)[0];
      expect(result).toEqual(expected);
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

function splitGraphite(str) {
  const parts1 = str.split(':', 2);
  const parts2 = parts1[1].split('|', 2);
  return [parts1[0], parseInt(parts2[0], 10), parts2[1]];
}
