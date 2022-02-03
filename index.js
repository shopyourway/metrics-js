const { ConsoleReporter } = require('./src/reporters/console-reporter');
const { DataDogReporter } = require('./src/reporters/datadog-reporter');

exports.Metrics = require('./src/metrics');
exports.StringReporter = require('./src/reporters/string-reporter');
exports.GraphiteReporter = require('./src/reporters/graphite-reporter');
exports.InMemoryReporter = require('./src/reporters/in-memory-reporter');

exports.ConsoleReporter = ConsoleReporter;
exports.DataDogReporter = DataDogReporter;
