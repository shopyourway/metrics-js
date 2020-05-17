const dgram = require('dgram');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function DataDogReporter(opts) {
  const { host, defaultTags } = opts;
  const port = opts.port || 8125;
  const prefix = typeof opts.prefix === 'string' && opts.prefix.length ? removeRedundantDots(`${opts.prefix}.`) : '';

  this.report = (key, value, tags) => {
    send(key, value, 'ms', tags);
  };

  this.value = (key, value, tags) => {
    send(key, value, 'g', tags);
  };

  this.increment = (key, value = 1, tags) => {
    send(key, value, 'c', tags);
  };

  function send(key, value, type, tags) {
    const stat = `${prefix}${key}:${value}|${type}${stringifyTags(tags)}`;

    const socket = dgram.createSocket('udp4');
    const buff = Buffer.from(stat);

    socket.send(buff, 0, buff.length, port, host, () => {
      socket.close();
    });
  }

  function stringifyTags(tags) {
    if (!tags) {
      return '';
    }

    const allTags = {
      ...defaultTags,
      ...tags,
    };

    return `|#${Object.keys(allTags).map(x => `${x}:${allTags[x]}`).join(',')}`;
  }
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}
