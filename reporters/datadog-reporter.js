const Socket = require('../network/socket');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function DataDogReporter({
  host,
  defaultTags,
  port = 8125,
  prefix,
  batch = true,
  maxBufferSize,
}) {
  const metricsPrefix = typeof prefix === 'string' && prefix.length ? removeRedundantDots(`${prefix}.`) : '';
  const socket = new Socket({
    port, host, batch, maxBufferSize,
  });

  this.report = (key, value, tags, errorCallback) => {
    send(key, value, 'ms', tags, errorCallback);
  };

  this.value = (key, value, tags, errorCallback) => {
    send(key, value, 'g', tags, errorCallback);
  };

  this.increment = (key, value = 1, tags, errorCallback) => {
    send(key, value, 'c', tags, errorCallback);
  };

  this.close = () => {
    socket.close();
  };

  function send(key, value, type, tags, errorCallback) {
    const stat = `${metricsPrefix}${key}:${value}|${type}${stringifyTags(tags)}`;

    socket.send({ message: stat, callback: errorCallback });
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
