const StringReporter = require('./StringReporter');

module.exports = function ConsoleReporter() {
  // eslint-disable-next-line no-console
  const stringReporter = new StringReporter(console.log);

  this.report = (key, value, tags) => {
    stringReporter.report(key, value, tags);
  };

  this.value = (key, value, tags) => {
    stringReporter.value(key, value, tags);
  };

  this.increment = (key, value = 1, tags) => {
    stringReporter.increment(key, value, tags);
  };
};
