module.exports = function StringReporter(func) {
  this.report = function(key, value) {
    func('METRICS ' + key + ' : ' + value);
  }
};