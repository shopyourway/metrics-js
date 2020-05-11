module.exports = function StringReporter(func) {
  const map = new Map();

  this.report = (key, value, tags) => {
    func(format(key, value, tags));
  };

  this.value = (key, value, tags) => {
    func(format(key, value, tags));
  };

  this.increment = (key, value = 1, tags) => {
    const k = getKey(key, tags);

    let oldValue = map.get(k) || 0;

    oldValue += value;

    map.set(k, oldValue);
    func(format(key, oldValue, tags));
  };

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
};
