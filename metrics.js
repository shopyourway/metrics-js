const Space = require('./space');

module.exports = function Metrics(reporters, errback) {
  if (!reporters.every(r => r && typeof r.report === 'function')) {
    throw new Error('must pass valid reporters with a `report` function');
  }

  this.space = (key, tags) => {
    if (typeof key !== 'string' || key.length < 1) {
      throw new Error('must pass non-empty key string as argument');
    }

    return new Space(key, tags, reporters, errback);
  };
};
