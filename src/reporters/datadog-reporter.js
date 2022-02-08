const { StatsdSocket } = require('../network/statsd-socket');

function DataDogReporter({
  host,
  tags: defaultTags,
  port = 8125,
  prefix,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
}) {
  const socket = new StatsdSocket({
    port, host, batch, maxBufferSize, flushInterval, prefix, tags: defaultTags,
  });

  function report(key, value, tags, errorCallback) {
    socket.send({
      key, value, type: 'ms', tags, callback: errorCallback,
    });
  }

  function _value(key, value, tags, errorCallback) {
    socket.send({
      key, value, type: 'g', tags, callback: errorCallback,
    });
  }

  function increment(key, value = 1, tags, errorCallback) {
    socket.send({
      key, value, type: 'c', tags, callback: errorCallback,
    });
  }

  function close() {
    socket.close();
  }

  return {
    report,
    increment,
    value: _value,
    close,
  };
}

module.exports = {
  DataDogReporter,
};
