// In graphite query series by tag: `seriesByTag("tag1=value1", "defaultTag=defaultValue")`
const { Metrics, GraphiteReporter } = require('..');

const graphiteHost = '127.0.0.1'; // Graphite server IP address
const graphitePort = 8125; // Optional - port number. Defaults to 8125
const spacePrefix = 'My.Project'; // Optional - prefix to all metrics spaces

const graphiteReporter = new GraphiteReporter({
  host: graphiteHost,
  port: graphitePort,
  prefix: spacePrefix,
  tags: { defaultTag: 'defaultValue' },
});

const metrics = new Metrics([graphiteReporter]);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  for (let i = 0; i < 1000; i++) {
    metrics.space('example.metrics.graphite', { tag1: 'value1' }).value(i);
    // eslint-disable-next-line no-await-in-loop
    await timeout(10);
  }

  for (let i = 1000; i < 2000; i++) {
    metrics.space('example.metrics.graphite', { tag2: 'value2' }).value(i);
    // eslint-disable-next-line no-await-in-loop
    await timeout(10);
  }
})();
