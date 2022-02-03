const { Space } = require('./space');

function Metrics({ reporters, errback }) {
  if (!reporters || !Array.isArray(reporters) || reporters.length === 0) throw new TypeError('reporters is missing or empty');
  if (errback && typeof errback !== 'function') throw new TypeError('errback must be a function');

  if (!reporters.every(r => r && typeof r.report === 'function' && typeof r.value === 'function' && typeof r.increment === 'function')) {
    throw new TypeError('must pass valid reporters with a `report` function');
  }

  function space(key, tags) {
    return new Space(key, tags, reporters, errback);
  }

  return {
    space,
  };
}

module.exports = {
  Metrics,
};
