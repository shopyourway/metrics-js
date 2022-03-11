const { StatsdSocket } = require('../network/statsd-socket');

function GraphiteReporter({
  host,
  port = 8125,
  prefix,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
  errback,
}) {
  const socket = new StatsdSocket({
    port,
    host,
    prefix,
    batch,
    flushInterval,
    maxBufferSize,
    errback,
  });

  function report(key, value, tags) {
    socket.send({
      key, value, type: 'ms', tags,
    });
  }

  function _value(key, value, tags) {
    socket.send({
      key, value, type: 'v', tags,
    });
  }

  function increment(key, value = 1, tags) {
    socket.send({
      key, value, type: 'c', tags,
    });
  }

  return {
    report,
    increment,
    value: _value,
  };
}

module.exports = {
  GraphiteReporter,
};
