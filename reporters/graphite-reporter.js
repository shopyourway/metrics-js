const dgram = require('dgram');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function GraphiteReporter({
  host,
  port = 8125,
  prefix,
  defaultTags,
}) {
  const metricPrefix = typeof prefix === 'string' && prefix.length ? removeRedundantDots(`${prefix}.`) : '';

  function report(key, value, tags, errorCallback) {
    send(key, value, 'ms', tags, errorCallback);
  }

  function _value(key, value, tags, errorCallback) {
    send(key, value, 'v', tags, errorCallback);
  }

  function increment(key, value = 1, tags, errorCallback) {
    send(key, value, 'c', tags, errorCallback);
  }

  function send(key, value, type, tags, errorCallback) {
    const stat = `${metricPrefix}${key}:${value}|${type}${stringifyTags(tags)}`;
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
    if (!tags && !defaultTags) {
      return '';
    }

    const allTags = {
      ...defaultTags,
      ...tags,
    };

    return `|#${Object.entries(allTags).map(([key, value]) => `${key}:${value}`).join(',')}`;
  }

  return {
    report,
    increment,
    value: _value,
  };
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}
