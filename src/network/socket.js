const dgram = require('dgram');
const { validate } = require('../validation/validator');

function Socket({
  port, host, batch = true, maxBufferSize = 1000, flushInterval = 1000, errback,
}) {
  validate({ name: 'port', value: port, type: 'number' });
  validate({ name: 'host', value: host, type: 'string' });
  validate({ name: 'batch', value: batch, type: 'boolean' });
  validate({ name: 'maxBufferSize', value: maxBufferSize, type: 'number' });
  validate({ name: 'flushInterval', value: flushInterval, type: 'number' });
  validate({
    name: 'errback', value: errback, type: 'function', required: false,
  });

  const socket = dgram.createSocket('udp4');
  socket.unref();

  let buffer = [];
  let bufferSize = 0;
  let interval;

  if (batch) {
    interval = setInterval(flushBuffer, flushInterval);
    // Allow node to shutdown regardless of this handle
    interval.unref();
  }

  function send({ message }) {
    if (!message) {
      throw new TypeError('message is mandatory');
    }

    if (batch === true) {
      append({ message });
    } else {
      sendImmediate({ message });
    }
  }

  function close() {
    flushBuffer();
    if (interval) {
      clearInterval(interval);
    }
  }

  function append({ message }) {
    buffer.push({ message });
    bufferSize += message.length;

    if (bufferSize > maxBufferSize) {
      flushBuffer();
    }
  }

  function flushBuffer() {
    if (buffer.length === 0) {
      return;
    }

    const bufferedMessage = buffer.map(x => x.message).join('\n');
    // We capture the messages to send first to avoid concurrency issues for handling the buffer.
    // If we purge it after, new messages added to the buffer won't be sent, or worse, resent.
    bufferSize = 0;
    buffer = [];

    sendImmediate({
      message: bufferedMessage,
    });
  }

  function sendImmediate({ message }) {
    const bytes = Buffer.from(message);
    socket.send(bytes, 0, bytes.length, port, host, err => {
      if (!errback || !err) {
        return;
      }

      errback(err);
    });
  }

  return {
    send,
    close,
  };
}

module.exports = {
  Socket,
};
