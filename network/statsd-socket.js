const { Socket } = require('./socket');

function StatsdSocket({
  port,
  host,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
  defaultTags,
}) {
  const socket = new Socket({
    host, port, batch, maxBufferSize, flushInterval,
  });

  function send({
    key, value, type, tags, callback,
  }) {

  }

  function close() {

  }

  return {
    send,
    close,
  };
}

module.exports = {
  StatsdSocket,
};
