var Space = require('./Space');

module.exports = function Metrics(reporters, errback) {
  if(!reporters.every(function(r) { return r && typeof r.report == 'function'; })) {
    throw new Error('must pass valid reporters with a `report` function');
  }

  this.space = function(key) {
    if(typeof key !== 'string' || key.length < 1) {
      throw new Error('must pass non-empty key string as argument');
    }
    
    return new Space(key, reporters, errback);
  };
};

