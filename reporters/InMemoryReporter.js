module.exports = function InMemoryReporter(arr) {
  const map = new Map();

  this.report = (key, value, tags) => {
    arr.push({ key, value, tags });
  };

  this.value = (key, value, tags) => {
    arr.push({ key, value, tags });
  };

  this.increment = (key, value = 1, tags) => {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    arr.push({ key, value: oldValue, tags });
  };
};
