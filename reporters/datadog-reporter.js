const { StatsdSocket } = require('../network/statsd-socket');

module.exports = function DataDogReporter({
  host,
  defaultTags,
  port = 8125,
  prefix,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
}) {
  const socket = new StatsdSocket({
    port, host, batch, maxBufferSize, flushInterval, prefix, tags: defaultTags,
  });

  this.report = (key, value, tags, errorCallback) => {
    socket.send({
      key, value, type: 'ms', tags, callback: errorCallback,
    });
  };

  this.value = (key, value, tags, errorCallback) => {
    socket.send({
      key, value, type: 'g', tags, callback: errorCallback,
    });
  };

  this.increment = (key, value = 1, tags, errorCallback) => {
    socket.send({
      key, value, type: 'c', tags, callback: errorCallback,
    });
  };

  this.close = () => {
    socket.close();
  };
};
