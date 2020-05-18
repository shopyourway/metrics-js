const dgram = require('dgram');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function GraphiteReporter(opts) {
  const { host } = opts;
  const port = opts.port || 8125;
  const prefix = typeof opts.prefix === 'string' && opts.prefix.length ? removeRedundantDots(`${opts.prefix}.`) : '';

  this.report = (key, value, tags) => {
    validateTags('REPORT', key, tags);

    const plaintext = `${prefix}${key}:${value}|ms`;
    send(plaintext);
  };

  this.value = (key, value, tags) => {
    validateTags('VALUE', key, tags);

    const plaintext = `${prefix}${key}:${value}|v`;
    send(plaintext);
  };

  this.increment = (key, value = 1, tags) => {
    validateTags('INCREMENT', key, tags);

    const plaintext = `${prefix}${key}:${value}|c`;
    send(plaintext);
  };

  function validateTags(op, key, tags) {
    if (tags) {
      // eslint-disable-next-line no-console
      throw new Error(`${op}: Tags are not supported in graphite reporter at this time. "${key}" tags will be emitted`);
    }
  }

  function send(stat) {
    const socket = dgram.createSocket('udp4');
    const buff = Buffer.from(stat);

    socket.send(buff, 0, buff.length, port, host, () => {
      socket.close();
    });
  }
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}
