const { validate } = require('./validation/validator');
const { Space } = require('./space');

function Metrics({ reporters, tags: defaultTags, errback }) {
  if (!reporters || !Array.isArray(reporters) || reporters.length === 0) throw new TypeError('reporters is missing or empty');
  if (defaultTags && (Array.isArray(defaultTags) || typeof defaultTags !== 'object')) throw new TypeError('tags should be an object (key-value)');

  validate({
    name: 'errback', value: errback, type: 'function', required: false,
  });

  if (!reporters.every(r => r && typeof r.report === 'function' && typeof r.value === 'function' && typeof r.increment === 'function')) {
    throw new TypeError('must pass valid reporters with a `report` function');
  }

  function space(key, tags) {
    validate({
      name: 'tags', value: tags, type: 'object', required: false,
    });

    let allTags;

    if (tags || defaultTags) {
      allTags = {
        ...defaultTags,
        ...tags,
      };
    }

    return new Space({
      key, tags: allTags, reporters, errback,
    });
  }

  return {
    space,
  };
}

module.exports = {
  Metrics,
};
