var assert = require('assert');
var sinon = require('sinon');
var metrics = require('../index');
var Metrics = metrics.Metrics;
var StringReporter = metrics.StringReporter;

describe('StringReporter', function() {
  describe('report', function () {
    it('should call the underlying function of the StringReporter', function(done) {
      var logFunc = sinon.spy();
      var reporter = new StringReporter(logFunc);
      var metrics = new Metrics([ reporter ]);
      var func = getAsyncFunc(1000);
      var wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, function() {
        assert.ok(logFunc.calledOnce);
        var args = logFunc.getCall(0).args;
        assert.equal(args.length, 1);
        assert.ok(args[0].indexOf('METRICS SYW.Adder : 100') == 0);
        done();
      });
    });
  });
});

function getAsyncFunc(duration) {
  return function(a, b, callback) {
    setTimeout(function() {
      var result = a+b;
      callback(null, result);
    }, duration);
  };
}