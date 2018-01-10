module.exports = function Space(key, reporters, errback) {
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

  function report(key, start, finish) {
    var duration = finish.getTime() - start.getTime();
    reporters.forEach(function(reporter) {
      try {
        reporter.report(key, duration);
      }
      catch (e) {
        var errMsg = e && e.message ? e.message : 'Error in reporter';
        (typeof errback == 'function' ? errback : console.log)(errMsg);
      }
    });
  }
};

function isAsyncFunc(args) {
  return typeof args[args.length - 1] === 'function';
}