var assert = require('assert');
var sinon = require('sinon');
var metrics = require('../index');
var Metrics = metrics.Metrics;
var InMemoryReporter = metrics.InMemoryReporter;

describe('Space', function() {
  describe('meter', function () {
    it('should throw an error if not called with a function as argument', function() {
      var reports = [];
      var reporter = new InMemoryReporter(reports);
      var metrics = new Metrics([ reporter ]);
      try {
        metrics.space('SYW.Adder').meter();
      }
      catch (e) {
        assert.equal(e.message, 'must pass a function as argument')
      }
    });

    context('called on an asynchronous function', function() {
      it('should return a function', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getAsyncFunc(1000);

        var result =  metrics.space('SYW.Adder').meter(func);

        assert.equal(typeof result, 'function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', function(done) {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getAsyncFunc(1000);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function(err, result) {
          var report = reports[reports.length-1];
          var result = report.value;

          assert.ok(result >= 1000 && result < 1020, 'duration was ' + result.toString());
          done();
        });
      });

      it('should create a report where the key is the argument passed to the Space constructor', function(done) {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getAsyncFunc(1000);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function(err, result) {
          var report = reports[reports.length-1];
          var result = report.key;

          assert.equal(result, 'SYW.Adder');
          done();
        });
      });

      it('should call the original function with the same arguments that the wrapped function is called with', function(done) {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = sinon.spy(getAsyncFunc(1000));
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function(err, result) {
          var args = func.args[0];
          var result = args.slice(0,args.length-1);

          assert.deepEqual(result, [1, 1]);
          done();
        });
      });

      it('should call the original callback with the same arguments that the original function would call', function(done) {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getAsyncFunc(1000);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function(err, result) {
          assert.equal(err, null);
          assert.equal(result, 2);
          done();
        });
      });

      it('should not throw an error when a reporter throws an error', function(done) {
        var reporter = new FailingReporter();
        var metrics = new Metrics([ reporter ]);
        var func = getAsyncFunc(1000);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function(err, result) {
          assert.equal(err, null);
          assert.equal(result, 2);
          done();
        });
      });

      it('should call the errback when a reporter throws an error', function(done) {
        var reporter = new FailingReporter();
        var errback = sinon.spy();
        var metrics = new Metrics([ reporter ], errback);
        var func = getAsyncFunc(1000);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, function() {
          assert.ok(errback.calledOnce);
          assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
          done();
        });
      });
    });

    context('called on an synchronous function', function() {
      it('should return a function', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);

        var result =  metrics.space('SYW.Adder').meter(func);

        assert.equal(typeof result, 'function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        var report = reports[reports.length-1];
        var result = report.value;

        assert.ok(result >= 500 && result < 505);
      });

      it('should create a report where the key is the argument passed to the Space constructor', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        var report = reports[reports.length-1];
        var result = report.key;

        assert.equal(result, 'SYW.Adder');
      });

      it('should call the original function with the same arguments that the wrapped function is called with', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = sinon.spy(getSyncFunc(500));
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        var result = func.args[0];

        assert.deepEqual(result, [1, 1]);
      });

      it('should return the result of the original function', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        var result = wrappedFunc(1, 1);

        assert.equal(result, 2);
      });

      it('should not throw an error when a reporter throws an error', function() {
        var reporter = new FailingReporter();
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        var result = wrappedFunc(1, 1);

        assert.equal(result, 2);
      });

      it('should call the errback when a reporter throws an error', function() {
        var reporter = new FailingReporter();
        var errback = sinon.spy();
        var metrics = new Metrics([ reporter ], errback);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);

        assert.ok(errback.calledOnce);
        assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
      });
    });
  });

    describe('space', function () {
      it('should create a report with the concatenated key', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar').meter(func);

        wrappedFunc(1, 1);
        var report = reports[reports.length-1];

        assert.equal(report.key, 'SYW.Adder.Foo.Bar');
      });

      it('should call the original function with the same arguments that the wrapped function is called with', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = sinon.spy(getSyncFunc(500));
        var wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar').meter(func);

        wrappedFunc(1, 1);
        var result = func.args[0];

        assert.deepEqual(result, [1, 1]);
      });

      it('should return the result of the original function', function() {
        var reports = [];
        var reporter = new InMemoryReporter(reports);
        var metrics = new Metrics([ reporter ]);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar').meter(func);

        var result = wrappedFunc(1, 1);

        assert.equal(result, 2);
      });

      it('should call the errback when a reporter throws an error', function() {
        var reporter = new FailingReporter();
        var errback = sinon.spy();
        var metrics = new Metrics([ reporter ], errback);
        var func = getSyncFunc(500);
        var wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar').meter(func);

        wrappedFunc(1, 1);

        assert.ok(errback.calledOnce);
        assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
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

function getSyncFunc(duration) {
  return function(a, b) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + duration) { }
    return a+b;
  };
}

function FailingReporter() {
  this.report = function(key, value) {
    throw new Error('I just failed, did you expected something else?');
  };
}