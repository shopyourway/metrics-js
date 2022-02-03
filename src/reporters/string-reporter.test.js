const { Metrics, StringReporter } = require('../../index');

describe('StringReporter', () => {
  describe('report', () => {
    it('should call the underlying function of the StringReporter', done => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const wrappedFunc = metrics.space('space.meter').meter(func);

      wrappedFunc(1, 1, () => {
        expect(logFunc).toBeCalledTimes(1);
        expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter : 100'));
        done();
      });
    });

    it('when tags are specified, tags should be included in the report', done => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const wrappedFunc = metrics.space('space.meter', { source: 'test' }).meter(func);

      wrappedFunc(1, 1, () => {
        expect(logFunc).toBeCalledTimes(1);
        expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test} : 100'));
        done();
      });
    });
  });

  describe('value', () => {
    it('should call the underlying function of the StringReporter', () => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('space.meter').value(10);

      expect(logFunc).toBeCalledTimes(1);
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter : 10'));
    });

    it('when space has tags, should add tags to the string argument', () => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('space.meter', { source: 'test', cause: 'error' }).value(10);

      expect(logFunc).toBeCalledTimes(1);
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test,cause:error} : 10'));
    });
  });

  describe('increment', () => {
    it('should call the underlying function of the StringReporter', () => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('space.meter').increment(5);
      metrics.space('space.meter').increment(10);
      metrics.space('space.meter').increment(15);

      expect(logFunc).toBeCalledTimes(3);
      expect(logFunc).toBeCalledWith('METRICS space.meter : 5');
      expect(logFunc).toBeCalledWith('METRICS space.meter : 15');
      expect(logFunc).toBeCalledWith('METRICS space.meter : 30');
    });

    it('when called with tags, should call the underlying function of the StringReporter with tags', () => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('space.meter', { source: 'test' }).increment(5);
      metrics.space('space.meter', { source: 'test' }).increment(10);
      metrics.space('space.meter', { source: 'test' }).increment(15);

      expect(logFunc).toBeCalledTimes(3);
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test} : 5'));
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test} : 15'));
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test} : 30'));
    });

    it('when called with different tags, each tag creates a different value', () => {
      const logFunc = jest.fn();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('space.meter', { source: 'test' }).increment(5);
      metrics.space('space.meter', { source: 'src' }).increment(10);
      metrics.space('space.meter', { source: 'test' }).increment(15);

      expect(logFunc).toBeCalledTimes(3);
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:src} : 10'));
      expect(logFunc).toBeCalledWith(expect.toStartWith('METRICS space.meter{source:test} : 20'));
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
