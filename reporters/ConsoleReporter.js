var StringReporter = require('./StringReporter');

module.exports = function ConsoleReporter() {
  var stringReporter = new StringReporter(console.log);

  this.report = function(key, value) {
    stringReporter.report(key, value);
  }
};