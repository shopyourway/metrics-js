module.exports = function Space(key, tags, reporters, errback) {
  if (typeof key !== 'string' || key.length < 1) {
    throw new Error('must pass non-empty key string as argument');
  }

  if (tags && (Array.isArray(tags) || typeof tags !== 'object')) {
    throw new Error('tags must be an object');
  }

  function forEachReporter(func) {
    reporters.forEach(reporter => {
      try {
        func(reporter);
      } catch (e) {
        // eslint-disable-next-line no-console
        (typeof errback === 'function' ? errback : console.log)(e);
      }
    });
  }

  this.value = val => {
    forEachReporter(reporter => reporter.value(key, val, tags));
  };

  this.increment = (val = 1) => {
    forEachReporter(reporter => reporter.increment(key, val, tags));
  };

  this.meter = func => {
    if (typeof func !== 'function' && !isPromise(func)) {
      throw new Error('must pass a function as argument');
    }

    if (isPromise(func)) {
      const start = new Date();
      return func
        .finally(() => {
          const finish = new Date();
          report(key, start, finish);
        });
    }

    if (isAsyncFunc(func)) {
      return async () => {
        const start = new Date();
        try {
          await func();
        } finally {
          const finish = new Date();
          report(key, start, finish);
        }
      };
    }

    // eslint-disable-next-line consistent-return
    return (...args) => {
      const start = new Date();

      if (isCallbackFunc(args)) {
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

  this.space = (nextKey, nextTags) => {
    const newKey = `${key}.${nextKey}`;
    const newTags = { ...tags, ...nextTags };
    return new Space(newKey, newTags, reporters, errback);
  };

  function report(reportKey, start, finish) {
    const duration = finish.getTime() - start.getTime();
    forEachReporter(reporter => reporter.report(reportKey, duration, tags));
  }
};

function isCallbackFunc(args) {
  return typeof args[args.length - 1] === 'function';
}

function isPromise(func) {
  return func instanceof Promise;
}

function isAsyncFunc(func) {
  return func.constructor.name === 'AsyncFunction';
}
