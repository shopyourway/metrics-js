module.exports = function Space(key, reporters, errback) {

  function forEachReporter(func) {
    reporters.forEach(reporter => {
      try {
        func(reporter);
      }
      catch (e) {
        const errMsg = e && e.message ? e.message : 'Error in reporter';
        (typeof errback === 'function' ? errback : console.log)(errMsg);
      }
    });
  }

  this.value = val => {
    forEachReporter(reporter => reporter.value(key, val));
  };

  this.increment = (val = 1) => {
    forEachReporter(reporter => reporter.increment(key, val));
  };

  this.meter = func => {
    if (typeof func !== 'function') {
      throw new Error('must pass a function as argument');
    }

    return (...args) => {
      const start = new Date();

      if (isAsyncFunc(args)) {
        const callback = args.pop();
        args.push((...callbackArgs) => {
          const finish = new Date();
          report(key, start, finish);
          callback.apply(this, callbackArgs);
        });

        func.apply(this, args);
      } else {
        const result = func.apply(this, args);
        const finish = new Date();
        report(key, start, finish);
        return result;
      }
    };
  };

  this.space = nextKey => {
    return new Space(`${key}.${nextKey}`, reporters, errback);
  };

  function report(key, start, finish) {
    const duration = finish.getTime() - start.getTime();
    forEachReporter(reporter => reporter.report(key, duration));
  }
};

function isAsyncFunc(args) {
  return typeof args[args.length - 1] === 'function';
}
