const StringReporter = require('./StringReporter');

module.exports = function ConsoleReporter() {
  // eslint-disable-next-line no-console
  const stringReporter = new StringReporter(console.log);

  this.report = (key, value) => {
    stringReporter.report(key, value);
  };

  this.value = (key, value) => {
    stringReporter.value(key, value);
  };

  this.increment = (key, value = 1) => {
    stringReporter.increment(key, value);
  };
};
