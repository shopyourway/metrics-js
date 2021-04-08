const dgram = require('dgram');

module.exports = function Socket({
  port, host, batch = true, connectCallback,
}) {
  const socket = connect();

  this.send = (message, callback) => {
    const bytes = Buffer.from(message);
    socket.send(bytes, err => {
      if (callback) {
        callback(err);
      }
    });
  };

  function connect() {
    // eslint-disable-next-line no-shadow
    const socket = dgram.createSocket('udp4');
    socket.unref();
    socket.connect(port, host, err => {
      if (typeof connectCallback === 'function') {
        connectCallback(err);
      }
    });

    return socket;
  }
};
