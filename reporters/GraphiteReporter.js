var dgram = require('dgram');

var redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function GraphiteReporter(opts) {
  var host = opts.host;
  var port = opts.port || 2003;
  var prefix = typeof opts.prefix === 'string' && opts.prefix.length ? removeRedundantDots(opts.prefix+'.') : '';

  this.report = function(key, value) {
    var plaintext = prefix + key + ':' + value + '|ms';
    send(plaintext);
  };

  this.value = function(key, value) {
    var plaintext = prefix + key + ':' + value + '|v';
    send(plaintext);
  };

  this.increment = function(key, value = 1) {
    var plaintext = prefix + key + ':' + value + '|c';
    send(plaintext);
  };

  function send(stat) {
    var socket = dgram.createSocket('udp4');
    var buff = new Buffer(stat);

    socket.send(buff, 0, buff.length, port, host, function() { socket.close(); });
  }
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}