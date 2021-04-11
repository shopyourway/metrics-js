const dgram = require('dgram');

module.exports = function Socket({
  port, host, buffer = true, maxBufferSize = 1000,
}) {
  if (!port) {
    throw new TypeError('port is mandatory');
  }
  if (!host) {
    throw new TypeError('host is mandatory');
  }

  const socket = dgram.createSocket('udp4');
  socket.unref();

  this.send = ({ message, callback }) => {
    if (!message) {
      throw new TypeError('message is mandatory');
    }
    if (callback && typeof callback !== 'function') {
      throw new TypeError('callback should be a function');
    }

    const bytes = Buffer.from(message);
    socket.send(bytes, 0, bytes.length, port, host, err => {
      socket.close();

      if (!callback) {
        return;
      }

      if (err) {
        callback(err);
        return;
      }

      callback();
    });
  };
};
