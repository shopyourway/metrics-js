const { StatsdSocket } = require('../network/statsd-socket');

module.exports = function GraphiteReporter({
  host,
  port = 8125,
  prefix,
  tags,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
}) {
  const socket = new StatsdSocket({
    port,
    host,
    prefix,
    tags,
    batch,
    flushInterval,
    maxBufferSize,
  })

  function report(key, value, tags, errorCallback) {
    socket.send({
      key, value, type: 'ms', tags, callback: errorCallback,
    });
  }

  function _value(key, value, tags, errorCallback) {
    socket.send({
      key, value, type: 'v', tags, callback: errorCallback
    });
  }

  function increment(key, value = 1, tags, errorCallback) {
    socket.send({
      key, value, type: 'c', tags, callback: errorCallback
    });
  }

  return {
    report,
    increment,
    value: _value,
  };
};
