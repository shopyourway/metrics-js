const { Metrics, GraphiteReporter } = require('../');

const graphiteHost = '127.0.0.1'; // Graphite server IP address
const graphitePort = 8125; // Optional - port number. Defaults to 8125
const spacePrefix = 'My.Project'; // Optional - prefix to all metrics spaces

const graphiteReporter = new GraphiteReporter({
  host: graphiteHost,
  port: graphitePort,
  prefix: spacePrefix,
});

const metrics = new Metrics([graphiteReporter]);

metrics.space('final.frontier').value(123);
