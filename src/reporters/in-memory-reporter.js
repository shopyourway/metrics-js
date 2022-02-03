module.exports = function InMemoryReporter(arr) {
  const map = new Map();

  function report(key, value, tags) {
    arr.push({ key, value, tags });
  }

  function _value(key, value, tags) {
    arr.push({ key, value, tags });
  }

  function increment(key, value = 1, tags) {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    arr.push({ key, value: oldValue, tags });
  }

  return {
    report,
    value: _value,
    increment,
  };
};
