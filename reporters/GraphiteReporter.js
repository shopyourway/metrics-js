var dgram = require('dgram');

var redundantDotsRegex = new RegExp('\\.\\.+', 'g');

module.exports = function GraphiteReporter(opts) {
  var host = opts.host;
  var port = opts.port || 2003;
  var prefix = typeof opts.prefix == 'string' && opts.prefix.length ? removeRedundantDots(opts.prefix+'.') : '';

  this.report = function(key, value) {
    var socket = dgram.createSocket('udp4');
    var plaintext = prefix + key + ':' + value + '|ms';
    var buff = new Buffer(plaintext);

    socket.send(buff, 0, buff.length, port, host, function(err) { socket.close(); });
  }
};

function removeRedundantDots(str) {
  return str.replace(redundantDotsRegex, '.');
}