function InMemoryReporter({ buffer }) {
  if (!buffer && !Array.isArray(buffer)) throw new TypeError('buffer is missing or is not an array');

  const map = new Map();

  function report(key, value, tags) {
    buffer.push({ key, value, tags });
  }

  function _value(key, value, tags) {
    buffer.push({ key, value, tags });
  }

  function increment(key, value = 1, tags) {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    buffer.push({ key, value: oldValue, tags });
  }

  return {
    report,
    value: _value,
    increment,
  };
}

module.exports = {
  InMemoryReporter,
};
