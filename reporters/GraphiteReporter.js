const dgram = require('dgram');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function GraphiteReporter(opts) {
  const { host } = opts;
  const port = opts.port || 2003;
  const prefix = typeof opts.prefix === 'string' && opts.prefix.length ? removeRedundantDots(`${opts.prefix}.`) : '';

  this.report = (key, value) => {
    const plaintext = `${prefix}${key}:${value}|ms`;
    send(plaintext);
  };

  this.value = (key, value) => {
    const plaintext = `${prefix}${key}:${value}|v`;
    send(plaintext);
  };

  this.increment = (key, value = 1) => {
    const plaintext = `${prefix}${key}:${value}|c`;
    send(plaintext);
  };

  function send(stat) {
    const socket = dgram.createSocket('udp4');
    const buff = Buffer.from(stat);

    socket.send(buff, 0, buff.length, port, host, () => { socket.close(); });
  }
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}
