const StringReporter = require('./string-reporter');

function ConsoleReporter() {
  // eslint-disable-next-line no-console
  const stringReporter = new StringReporter(console.log);

  function report(key, value, tags) {
    stringReporter.report(key, value, tags);
  }

  function _value(key, value, tags) {
    stringReporter.value(key, value, tags);
  }

  function increment(key, value = 1, tags) {
    stringReporter.increment(key, value, tags);
  }

  return {
    report,
    value: _value,
    increment,
  };
}

module.exports = {
  ConsoleReporter,
};
