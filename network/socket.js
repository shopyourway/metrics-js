const dgram = require('dgram');

module.exports = function Socket({
  port, host, buffer = true, maxBufferSize = 1000,
}) {
  const socket = dgram.createSocket('udp4');
  socket.unref();

  this.send = ({ message, callback }) => {
    const bytes = Buffer.from(message);
    socket.send(bytes, 0, bytes.length, port, host, err => {
      socket.close();

      if (err && typeof callback === 'function') {
        callback(err);
      }
    });
  };
};
