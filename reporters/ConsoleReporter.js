var StringReporter = require('./StringReporter');

module.exports = function ConsoleReporter() {
  var stringReporter = new StringReporter(console.log);

  this.report = function(key, value) {
    stringReporter.report(key, value);
  };

  this.value = function(key, value) {
    stringReporter.value(key, value);
  };

  this.increment = function(key, value = 1) {
    stringReporter.increment(key, value);
  };
};