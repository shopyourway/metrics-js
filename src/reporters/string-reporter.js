function StringReporter(func) {
  const map = new Map();

  function report(key, value, tags) {
    func(format(key, value, tags));
  }

  function _value(key, value, tags) {
    func(format(key, value, tags));
  }

  function increment(key, value = 1, tags) {
    const k = getKey(key, tags);

    let oldValue = map.get(k) || 0;

    oldValue += value;

    map.set(k, oldValue);
    func(format(key, oldValue, tags));
  }

  function getKey(key, tags) {
    return `${key}${formatTags(tags)}`;
  }

  function format(key, value, tags) {
    return `METRICS ${getKey(key, tags)} : ${value}`;
  }

  function formatTags(tags) {
    if (!tags) return '';

    return `{${Object.entries(tags).map(x => `${x[0]}:${x[1]}`).join(',')}}`;
  }

  return {
    report,
    value: _value,
    increment,
  };
}

module.exports = {
  StringReporter,
};
