const { validate } = require('../validation/validator');
const { Socket } = require('./socket');

const redundantDotsRegex = new RegExp('\\.\\.+', 'g');

function StatsdSocket({
  port = 8125,
  host,
  batch = true,
  maxBufferSize = 1000,
  flushInterval = 1000,
  tags: defaultTags,
  prefix,
  errback,
}) {
  if (defaultTags && (Array.isArray(defaultTags) || typeof defaultTags !== 'object')) throw new TypeError('tags should be an object');

  const metricPrefix = typeof prefix === 'string' && prefix.length ? removeRedundantDots(`${prefix}.`) : '';

  const socket = new Socket({
    host, port, batch, maxBufferSize, flushInterval, errback,
  });

  function send({
    key, value, type, tags,
  }) {
    validate({ name: 'key', value: key, type: 'string' });
    validate({ name: 'value', value, type: 'number' });
    validate({ name: 'type', value: type, type: 'string' });
    if (tags && (Array.isArray(tags) || typeof tags !== 'object')) throw new TypeError('tags should be an object');

    const metric = `${metricPrefix}${key}:${value}|${type}${stringifyTags(tags)}`;

    socket.send({ message: metric });
  }

  function close() {
    socket.close();
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
    send,
    close,
  };
}

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}

module.exports = {
  StatsdSocket,
};
