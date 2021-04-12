const { Metrics, DataDogReporter } = require('..');

const agent = '127.0.0.1'; // Graphite server IP address
const port = 8125; // Optional - port number. Defaults to 8125
const spacePrefix = 'metric.test'; // Optional - prefix to all metrics spaces

const dataDogReporter = new DataDogReporter({
  host: agent,
  port,
  prefix: spacePrefix,
});

const metrics = new Metrics([dataDogReporter]);

metrics.space('example.metrics.datadog', { tag1: 'value1', env: 'test' }).value(123);

// DataDog reporter requires to be closed - in order to flush pending metric reports
dataDogReporter.close();
