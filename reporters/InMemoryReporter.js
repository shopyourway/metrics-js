const map = new Map();

module.exports = function InMemoryReporter(arr) {
  this.report = (key, value) => {
    arr.push({ key, value });
  };

  this.value = (key, value) => {
    arr.push({ key, value });
  };

  this.increment = (key, value = 1) => {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    arr.push({ key, value: oldValue });
  };
};
