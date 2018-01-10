module.exports = function InMemoryReporter(arr) {
  this.report = function(key, value) {
    arr.push({ key: key, value: value });
  };
};