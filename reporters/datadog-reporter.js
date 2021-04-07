const dgram = require('dgram');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function DataDogReporter({
  host,
  defaultTags,
  port = 8125,
  prefix }) {
  const metricsPrefix = typeof prefix === 'string' && prefix.length ? removeRedundantDots(`${prefix}.`) : '';

  this.report = (key, value, tags, errorCallback) => {
    send(key, value, 'ms', tags, errorCallback);
  };

  this.value = (key, value, tags, errorCallback) => {
    send(key, value, 'g', tags, errorCallback);
  };

  this.increment = (key, value = 1, tags, errorCallback) => {
    send(key, value, 'c', tags, errorCallback);
  };

  function send(key, value, type, tags, errorCallback) {
    const stat = `${metricsPrefix}${key}:${value}|${type}${stringifyTags(tags)}`;

    const socket = dgram.createSocket('udp4');
    const buff = Buffer.from(stat);

    socket.send(buff, 0, buff.length, port, host, err => {
      socket.close();

      if (err && typeof errorCallback === 'function') {
        errorCallback(err);
      }
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
