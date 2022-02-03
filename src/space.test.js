const { Metrics, InMemoryReporter } = require('../index');

describe('Space', () => {
  describe('meter', () => {
    it('should throw an error if not called with a function as argument', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);

      expect(() => metrics.space('space.meter').meter()).toThrow('must pass a function as argument');
    });

    describe('called on a promise', () => {
      it('should return a Promise', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getPromise(1000);

        const result = metrics.space('space.meter').meter(func);

        expect(result).toBeInstanceOf(Promise);
      });

      it('upon promise resolve, should create a report where the value is the execution time of the original function it receives as argument', async () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getPromise(1000);

        await metrics.space('SYW.Adder').meter(func);

        const report = reports[reports.length - 1];
        const result = report.value;

        assertReport(result);
      });

      it('upon promise error, should create a report where the value is the execution time of the original function it receives as argument', async () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getPromiseError(1000);

        await expect(() => metrics.space('space.meter').meter(func)).rejects.toThrow();

        expect(reports).toHaveLength(1);

        const report = reports[reports.length - 1];
        const result = report.value;

        assertReport(result);
      });
    });

    describe('called on a async function', () => {
      it('should return a async function', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getAsyncFunction(1000);

        const result = metrics.space('space.meter').meter(func);

        expect(typeof result).toBe('function');
        expect(result.constructor.name).toEqual('AsyncFunction');
      });

      it('upon await successful execution, should create a report where the value is the execution time of the original function it receives as argument', async () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getAsyncFunction(1000);

        const wrapper = metrics.space('space.meter').meter(func);
        await wrapper();

        const report = reports[reports.length - 1];
        const result = report.value;

        assertReport(result);
      });

      it('upon await error, should create a report where the value is the execution time of the original function it receives as argument', async () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getAsyncErrorFunction(1000);

        const wrapper = metrics.space('space.meter').meter(func);
        await expect(() => wrapper()).rejects.toThrow();

        expect(reports).toHaveLength(1);

        const report = reports[reports.length - 1];
        const result = report.value;

        assertReport(result);
      });
    });

    describe('called on a callback function', () => {
      it('should return a function', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);

        const result = metrics.space('space.meter').meter(func);

        expect(typeof result).toBe('function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', done => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1, () => {
          const report = reports[reports.length - 1];
          const result = report.value;

          assertReport(result);
          done();
        });
      });

      it('should create a report where the key is the argument passed to the Space constructor', done => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1, () => {
          const report = reports[reports.length - 1];
          const result = report.key;

          expect(result).toBe('space.meter');
          done();
        });
      });

      it('should call the original function with the same arguments that the wrapped function is called with', done => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = jest.fn(getCallbackFunc(1000));
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 2, () => {
          expect(func).toBeCalledWith(1, 2, expect.any(Function));
          done();
        });
      });

      it('should call the original callback with the same arguments that the original function would call', done => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('SYW.Adder').meter(func);

        wrappedFunc(1, 1, (err, result) => {
          expect(err).toBeNull();
          expect(result).toBe(2);
          done();
        });
      });

      it('should not throw an error when a reporter throws an error', done => {
        const reporter = new FailingReporter();
        const metrics = new Metrics([reporter]);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1, (err, result) => {
          expect(err).toBeNull();
          expect(result).toBe(2);
          done();
        });
      });

      it('should call the errback when a reporter throws an error', done => {
        const reporter = new FailingReporter();
        const errback = jest.fn();
        const metrics = new Metrics([reporter], errback);
        const func = getCallbackFunc(1000);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1, () => {
          expect(errback).toBeCalledTimes(1);
          expect(errback).toBeCalledWith(expect.objectContaining({
            message: 'I just failed, did you expected something else?',
          }));
          done();
        });
      });
    });

    describe('called on an synchronous function', () => {
      it('should return a function', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);

        const result = metrics.space('space.meter').meter(func);

        expect(typeof result).toBe('function');
      });

      it('should create a report where the value is the execution time of the original function it receives as argument', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1);
        const report = reports[reports.length - 1];
        const result = report.value;

        expect(result).toBeGreaterThanOrEqual(490);
        expect(result).toBeLessThan(510);
      });

      it('should create a report where the key is the argument passed to the Space constructor', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1);
        const report = reports[reports.length - 1];
        const result = report.key;

        expect(result).toBe('space.meter');
      });

      it('should call the original function with the same arguments that the wrapped function is called with', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = jest.fn(getSyncFunc(500));
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 2);

        expect(func).toBeCalledWith(1, 2);
      });

      it('should return the result of the original function', () => {
        const reports = [];
        const reporter = new InMemoryReporter({ buffer: reports });
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        const result = wrappedFunc(1, 1);

        expect(result).toBe(2);
      });

      it('should not throw an error when a reporter throws an error', () => {
        const reporter = new FailingReporter();
        const metrics = new Metrics([reporter]);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        const result = wrappedFunc(1, 1);

        expect(result).toBe(2);
      });

      it('should call the errback when a reporter throws an error', () => {
        const reporter = new FailingReporter();
        const errback = jest.fn();
        const metrics = new Metrics([reporter], errback);
        const func = getSyncFunc(500);
        const wrappedFunc = metrics.space('space.meter').meter(func);

        wrappedFunc(1, 1);

        expect(errback).toBeCalledTimes(1);
        expect(errback).toBeCalledWith(expect.objectContaining({
          message: 'I just failed, did you expected something else?',
        }));
      });
    });
  });

  describe('space', () => {
    it('should create a report with the concatenated key', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('space').space('subspace').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 1);
      const report = reports[reports.length - 1];

      expect(report.key).toBe('space.subspace.Foo.Bar');
    });

    it('when space has tags, should create a report with all the tags from all spaces', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      const func = getSyncFunc(500);

      const wrappedFunc = metrics.space('space', { source: 'test' }).space('subspace').space('Foo', { cause: 'error' }).space('Bar')
        .meter(func);

      wrappedFunc(1, 1);
      const report = reports[reports.length - 1];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        tags: {
          source: 'test',
          cause: 'error',
        },
      }));
    });

    it('should call the original function with the same arguments that the wrapped function is called with', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      const func = jest.fn(getSyncFunc(500));
      const wrappedFunc = metrics.space('space').space('subspace').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 2);

      expect(func).toBeCalledWith(1, 2);
    });

    it('should return the result of the original function', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('space').space('subspace').space('Foo').space('Bar')
        .meter(func);

      const result = wrappedFunc(1, 2);

      expect(result).toBe(3);
    });

    it('should call the errback when a reporter throws an error', () => {
      const reporter = new FailingReporter();
      const errback = jest.fn();
      const metrics = new Metrics([reporter], errback);
      const func = getSyncFunc(500);
      const wrappedFunc = metrics.space('space').space('subspace').space('Foo').space('Bar')
        .meter(func);

      wrappedFunc(1, 2);

      expect(errback).toBeCalledTimes(1);
      expect(errback).toBeCalledWith(expect.objectContaining({
        message: 'I just failed, did you expected something else?',
      }));
    });
  });

  describe('increment', () => {
    it('when value is not specify, increment by one', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      metrics.space('space').space('subspace').space('Foo').space('Bar')
        .increment();

      expect(reports).toHaveLength(1);

      let report = reports[0];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        value: 1,
      }));

      metrics.space('space').space('subspace').space('Foo').space('Bar')
        .increment();

      expect(reports).toHaveLength(2);
      // eslint-disable-next-line prefer-destructuring
      report = reports[1];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        value: 2,
      }));
    });

    it('when value is specified, increment by given value', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      metrics.space('space').space('subspace').space('Foo').space('Bar')
        .increment(3);

      expect(reports).toHaveLength(1);
      const report = reports[0];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        value: 3,
      }));
    });

    it('when tags are specified, key should have tags', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      metrics.space('space', { source: 'test' }).space('subspace').space('Foo', { cause: 'error' }).space('Bar')
        .increment();

      expect(reports).toHaveLength(1);
      const report = reports[0];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        tags: { source: 'test', cause: 'error' },
      }));
    });
  });

  describe('value', () => {
    it('should set value', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      metrics.space('space').space('subspace').space('Foo').space('Bar')
        .value(2);

      expect(reports).toHaveLength(1);
      const report = reports[0];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        value: 2,
      }));
    });

    it('when tags are specified, should set value', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      metrics.space('space', { source: 'test' }).space('subspace').space('Foo', { cause: 'error' }).space('Bar')
        .value(2);

      expect(reports).toHaveLength(1);
      const report = reports[0];

      expect(report).toEqual(expect.objectContaining({
        key: 'space.subspace.Foo.Bar',
        tags: { source: 'test', cause: 'error' },
      }));
    });
  });
});

function assertReport(reportedTime) {
  expect(reportedTime).toBeGreaterThanOrEqual(900);
  expect(reportedTime).toBeLessThan(1100);
}

function getPromiseError(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('timeout completed');
      reject(new Error('ERROR'));
    }, delay);
  });
}

function getPromise(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

function getAsyncFunction(delay) {
  return async () => {
    await getPromise(delay);
  };
}

function getAsyncErrorFunction(delay) {
  return async () => {
    await getPromiseError(delay);
  };
}

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

  // eslint-disable-next-line no-unused-vars
  this.increment = (key, value) => {
    throw new Error('I just failed, did you expected something else?');
  };

  // eslint-disable-next-line no-unused-vars
  this.value = (key, value) => {
    throw new Error('I just failed, did you expected something else?');
  };
}
