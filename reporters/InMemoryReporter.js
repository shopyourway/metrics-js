const map = new Map();

module.exports = function InMemoryReporter(arr) {
  this.report = function(key, value) {
    arr.push({ key: key, value: value });
  };

  this.value = function(key, value) {
    arr.push({ key: key, value: value });
  };

  this.increment = function(key, value = 1) {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    arr.push({ key: key, value: oldValue });
  };
};