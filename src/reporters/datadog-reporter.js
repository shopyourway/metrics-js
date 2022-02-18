const { StatsdSocket } = require('../network/statsd-socket');

function DataDogReporter({
  host,
  tags: defaultTags,
  port = 8125,
  prefix,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
  errback,
}) {
  const socket = new StatsdSocket({
    port, host, batch, maxBufferSize, flushInterval, prefix, tags: defaultTags, errback,
  });

  function report(key, value, tags) {
    socket.send({
      key, value, type: 'ms', tags,
    });
  }

  function _value(key, value, tags) {
    socket.send({
      key, value, type: 'g', tags,
    });
  }

  function increment(key, value = 1, tags) {
    socket.send({
      key, value, type: 'c', tags,
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
