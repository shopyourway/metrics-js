const { ConsoleReporter } = require('./src/reporters/console-reporter');
const { DataDogReporter } = require('./src/reporters/datadog-reporter');
const { GraphiteReporter } = require('./src/reporters/graphite-reporter');
const { InMemoryReporter } = require('./src/reporters/in-memory-reporter');
const { StringReporter } = require('./src/reporters/string-reporter');
const { Metrics } = require('./src/metrics');

module.exports = {
  Metrics,
  ConsoleReporter,
  DataDogReporter,
  GraphiteReporter,
  InMemoryReporter,
  StringReporter,
};
