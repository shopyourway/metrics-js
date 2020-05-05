const assert = require('assert');
const sinon = require('sinon');
const { Metrics, StringReporter } = require('../index');

describe('StringReporter', () => {
  describe('report', () => {
    it('should call the underlying function of the StringReporter', done => {
      const logFunc = sinon.spy();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(logFunc.calledOnce);
        const { args } = logFunc.getCall(0);
        assert.equal(args.length, 1);
        assert.ok(args[0].indexOf('METRICS SYW.Adder : 100') === 0);
        done();
      });
    });

    it('when tags are specified, tags should be included in the report', done => {
      const logFunc = sinon.spy();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      const func = getAsyncFunc(1000);
      const wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, () => {
        assert.ok(logFunc.calledOnce);
        const { args } = logFunc.getCall(0);
        assert.equal(args.length, 1);
        assert.ok(args[0].indexOf('METRICS SYW.Adder : 100') === 0);
        done();
      });
    });
  });

  describe('value', () => {
    it('should call the underlying function of the StringReporter', () => {
      const logFunc = sinon.spy();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('SYW.Adder').value(10);

      assert.ok(logFunc.calledOnce);
      const { args } = logFunc.getCall(0);
      assert.equal(args.length, 1);
      assert.ok(args[0].indexOf('METRICS SYW.Adder : 10') === 0);
    });
  });

  describe('increment', () => {
    it('should call the underlying function of the StringReporter', () => {
      const logFunc = sinon.spy();
      const reporter = new StringReporter(logFunc);
      const metrics = new Metrics([reporter]);
      metrics.space('SYW.Adder').increment(5);
      metrics.space('SYW.Adder').increment(10);
      metrics.space('SYW.Adder').increment(15);

      assert.ok(logFunc.calledThrice);
      const { args } = logFunc.getCall(2);
      assert.equal(args.length, 1);
      assert.ok(args[0].indexOf('METRICS SYW.Adder : 30') === 0);
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
