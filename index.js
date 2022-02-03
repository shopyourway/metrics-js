const { ConsoleReporter } = require('./src/reporters/console-reporter');
const { DataDogReporter } = require('./src/reporters/datadog-reporter');
const { GraphiteReporter } = require('./src/reporters/graphite-reporter');

exports.Metrics = require('./src/metrics');
exports.StringReporter = require('./src/reporters/string-reporter');
exports.InMemoryReporter = require('./src/reporters/in-memory-reporter');

exports.ConsoleReporter = ConsoleReporter;
exports.DataDogReporter = DataDogReporter;
exports.GraphiteReporter = GraphiteReporter;
