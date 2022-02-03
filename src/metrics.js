const { Space } = require('./space');

function Metrics({ reporters, errback }) {
  if (!reporters.every(r => r && typeof r.report === 'function' && typeof r.value === 'function' && typeof r.increment === 'function')) {
    throw new Error('must pass valid reporters with a `report` function');
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
