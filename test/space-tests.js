const assert = require('assert');
const sinon = require('sinon');
const { Metrics, InMemoryReporter } = require('../index');

describe('Space', () => {
  describe('meter', () => {
    it('should throw an error if not called with a function as argument', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);
      try {
        metrics.space('SYW.Adder').meter();
      } catch (e) {
        assert.equal(e.message, 'must pass a function as argument');
      }
    });

    context('called on a callback function', () => {
      it('should return a function', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);

        const result = metrics.space('SYW.Adder').meter(func);

        assert.equal(typeof result, 'function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', done => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, () => {
          const report = reports[reports.length - 1];
          const result = report.value;

          assert.ok(result >= 1000 && result < 1020, `duration was ${result.toString()}`);
          done();
        });
      });

      it('should create a report where the key is the argument passed to the Space constructor', done => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, () => {
          const report = reports[reports.length - 1];
          const result = report.key;

          assert.equal(result, 'SYW.Adder');
          done();
        });
      });

      it('should call the original function with the same arguments that the wrapped function is called with', done => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = sinon.spy(getCallbackFunc(1000));
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, () => {
          const args = func.args[0];
          const result = args.slice(0, args.length - 1);

          assert.deepEqual(result, [1, 1]);
          done();
        });
      });

      it('should call the original callback with the same arguments that the original function would call', done => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, (err, result) => {
          assert.equal(err, null);
          assert.equal(result, 2);
          done();
        });
      });

      it('should not throw an error when a reporter throws an error', done => {
        const reporter = new FailingReporter();
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, (err, result) => {
          assert.equal(err, null);
          assert.equal(result, 2);
          done();
        });
      });

      it('should call the errback when a reporter throws an error', done => {
        const reporter = new FailingReporter();
        const errback = sinon.spy();
        const metrics = new Metrics([reporter], errback);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, () => {
          assert.ok(errback.calledOnce);
          assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
          done();
        });
      });
    });

    context('called on an synchronous function', () => {
      it('should return a function', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);

        const result = metrics.space('SYW.Adder').meter(func);

        assert.equal(typeof result, 'function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        const report = reports[reports.length - 1];
        const result = report.value;

        assert.ok(result >= 500 && result < 505);
      });

      it('should create a report where the key is the argument passed to the Space constructor', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        const report = reports[reports.length - 1];
        const result = report.key;

        assert.equal(result, 'SYW.Adder');
      });

      it('should call the original function with the same arguments that the wrapped function is called with', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = sinon.spy(getSyncFunc(500));
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);
        const result = func.args[0];

        assert.deepEqual(result, [1, 1]);
      });

      it('should return the result of the original function', () => {
        const reports = [];
        const reporter = new InMemoryReporter(reports);
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        const result = wrappedFunc(1, 1);

        assert.equal(result, 2);
      });

      it('should not throw an error when a reporter throws an error', () => {
        const reporter = new FailingReporter();
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        const result = wrappedFunc(1, 1);

        assert.equal(result, 2);
      });

      it('should call the errback when a reporter throws an error', () => {
        const reporter = new FailingReporter();
        const errback = sinon.spy();
        const metrics = new Metrics([reporter], errback);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1);

        assert.ok(errback.calledOnce);
        assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
      });
    });
  });

  describe('space', () => {
    it('should create a report with the concatenated key', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 1);
      const report = reports[reports.length - 1];

      assert.equal(report.key, 'SYW.Adder.Foo.Bar');
    });

    it('should call the original function with the same arguments that the wrapped function is called with', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);
      const func = sinon.spy(getSyncFunc(500));
      const wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 1);
      const result = func.args[0];

      assert.deepEqual(result, [1, 1]);
    });

    it('should return the result of the original function', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar')
        .meter(func);

      const result = wrappedFunc(1, 1);

      assert.equal(result, 2);
    });

    it('should call the errback when a reporter throws an error', () => {
      const reporter = new FailingReporter();
      const errback = sinon.spy();
      const metrics = new Metrics([reporter], errback);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('SYW').space('Adder').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 1);

      assert.ok(errback.calledOnce);
      assert.equal(errback.getCall(0).args[0], 'I just failed, did you expected something else?');
    });
  });
});

function getCallbackFunc(duration) {
  return (a, b, callback) => {
    setTimeout(() => {
      const result = a + b;
      callback(null, result);
    }, duration);
  };
}

function getSyncFunc(duration) {
  return (a, b) => {
    const now = new Date().getTime();
    // eslint-disable-next-line no-empty
    while (new Date().getTime() < now + duration) { }
    return a + b;
  };
}

function FailingReporter() {
  // eslint-disable-next-line no-unused-vars
  this.report = (key, value) => {
    throw new Error('I just failed, did you expected something else?');
  };
}
