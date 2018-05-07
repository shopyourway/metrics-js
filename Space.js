module.exports = function Space(key, reporters, errback) {

  function forEachReporter(func) {
    reporters.forEach(function(reporter) {
      try {
        func(reporter);
      }
      catch (e) {
        var errMsg = e && e.message ? e.message : 'Error in reporter';
        (typeof errback === 'function' ? errback : console.log)(errMsg);
      }
    });
  }

  this.value = function (val) {
    forEachReporter(reporter => reporter.value(key, val));
  };

  this.increment = function (val = 1) {
    forEachReporter(reporter => reporter.increment(key, val));
  };

  this.meter = function(func) {
    if(typeof func !== 'function') {
      throw new Error('must pass a function as argument');
    }

    return function() {
      var args = Array.prototype.slice.call(arguments);
      var start = new Date();

      if(isAsyncFunc(args)) {
        var callback = args.pop();
        args.push(function() {
          var callbackArgs = Array.prototype.slice.call(arguments);
          var finish = new Date();
          report(key, start, finish);
          callback.apply(this, callbackArgs);
        });

        func.apply(this, args);
      } else {
        var result = func.apply(this, args);
        var finish = new Date();
        report(key, start, finish);
        return result;
      }
    };
  };

  this.space = function(nextKey) {
    return new Space(`${key}.${nextKey}`, reporters, errback);
  };

  function report(key, start, finish) {
    var duration = finish.getTime() - start.getTime();
    forEachReporter(reporter => reporter.report(key, duration));
  }
};

function isAsyncFunc(args) {
  return typeof args[args.length - 1] === 'function';
}