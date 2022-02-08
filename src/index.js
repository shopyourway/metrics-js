const { ConsoleReporter } = require('./reporters/console-reporter');
const { DataDogReporter } = require('./reporters/datadog-reporter');
const { GraphiteReporter } = require('./reporters/graphite-reporter');
const { InMemoryReporter } = require('./reporters/in-memory-reporter');
const { StringReporter } = require('./reporters/string-reporter');
const { Metrics } = require('./metrics');

module.exports = {
  Metrics,
  ConsoleReporter,
  DataDogReporter,
  GraphiteReporter,
  InMemoryReporter,
  StringReporter,
};
