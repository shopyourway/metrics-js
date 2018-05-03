const map = new Map();

module.exports = function StringReporter(func) {
  this.report = function(key, value) {
    func('METRICS ' + key + ' : ' + value);
  };

  this.value = function(key, value) {
    func('METRICS ' + key + ' : ' + value);
  };

  this.increment = function(key, value = 1) {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    func('METRICS ' + key + ' : ' + oldValue);
  };
};