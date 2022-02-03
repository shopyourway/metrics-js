const Space = require('./space');

module.exports = function Metrics(reporters, errback) {
  if (!reporters.every(r => r && typeof r.report === 'function' && typeof r.value === 'function' && typeof r.increment === 'function')) {
    throw new Error('must pass valid reporters with a `report` function');
  }

  this.space = (key, tags) => new Space(key, tags, reporters, errback);
};
