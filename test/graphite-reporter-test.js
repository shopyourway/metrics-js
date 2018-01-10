var assert = require('assert');
var sinon = require('sinon');
var dgram = require('dgram');
var metrics = require('../index');
var Metrics = metrics.Metrics;
var GraphiteReporter = metrics.GraphiteReporter;

var createSocketStub;
var DateStub;

describe('GraphiteReporter', function() {
  describe('report', function () {
    beforeEach(function() {
      createSocketStub = sinon.stub(dgram, 'createSocket');
      DateStub = sinon.stub(Date, 'now');
    });
    afterEach(function() {
      createSocketStub.restore();
      DateStub.restore();
    });

    it('should send data to Graphite in the form of "key:value|ms"', function(done) {
      var socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      stubDateNow(1464260419000);
      var graphiteOptions = { host: '1.2.3.4' };
      var reporter = new GraphiteReporter(graphiteOptions);
      var metrics = new Metrics([ reporter ]);
      var func = getAsyncFunc(1000);
      var wrappedFunc = metrics.space('SYW.Adder').meter(func);

      wrappedFunc(1, 1, function() {
        assert.ok(socketSendSpy.calledOnce);
        var args = socketSendSpy.getCall(0).args;
        var resultParts = splitGraphite(args[0].toString());

        assert.equal(resultParts[0], 'SYW.Adder');
        assert.ok(resultParts[1] >= 1000 && resultParts[1] < 1020);
        assert.equal(resultParts[2], 'ms');
        done();
      });
    });

    it('should use the default Graphite port if no port is provided', function(done) {
      var socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      var graphiteOptions = { host: '1.2.3.4' };
      var reporter = new GraphiteReporter(graphiteOptions);
      var metrics = new Metrics([ reporter ]);
      var func = getAsyncFunc(1000);
      var wrappedFunc = metrics.space('SYW.Adder').meter(func);
      var expected = 2003;

      wrappedFunc(1, 1, function() {
        assert.ok(socketSendSpy.calledOnce);
        var args = socketSendSpy.getCall(0).args;
        var result = args[3];
        assert.equal(result, expected);
        done();
      });
    });

    it('should add a valid prefix to the Graphite key when one is provided with a trailing dot', function(done) {
      var socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      var graphiteOptions = { host: '1.2.3.4', prefix: 'Foo.' };
      var reporter = new GraphiteReporter(graphiteOptions);
      var metrics = new Metrics([ reporter ]);
      var func = getAsyncFunc(1000);
      var wrappedFunc = metrics.space('SYW.Adder').meter(func);
      var expected = 'Foo.SYW.Adder';

      wrappedFunc(1, 1, function() {
        assert.ok(socketSendSpy.calledOnce);
        var args = socketSendSpy.getCall(0).args;
        var data = args[0].toString();
        var result = splitGraphite(data)[0];
        assert.equal(result, expected);
        done();
      });
    });

    it('should add a valid prefix to the Graphite key when one is provided without a trailing dot', function(done) {
      var socketSendSpy = sinon.spy();
      stubCreateSocket(socketSendSpy);
      var graphiteOptions = { host: '1.2.3.4', prefix: 'Foo' };
      var reporter = new GraphiteReporter(graphiteOptions);
      var metrics = new Metrics([ reporter ]);
      var func = getAsyncFunc(1000);
      var wrappedFunc = metrics.space('SYW.Adder').meter(func);
      var expected = 'Foo.SYW.Adder';

      wrappedFunc(1, 1, function() {
        assert.ok(socketSendSpy.calledOnce);
        var args = socketSendSpy.getCall(0).args;
        var data = args[0].toString();
        var result = splitGraphite(data)[0];
        assert.equal(result, expected);
        done();
      });
    });
  });
});

function getAsyncFunc(duration) {
  return function(a, b, callback) {
    setTimeout(function() {
      var result = a+b;
      callback(null, result);
    }, duration);
  };
}

function stubCreateSocket(sendFunc) {
  var socketStub = {
    send: sendFunc
  };
  createSocketStub.withArgs('udp4').returns(socketStub);
}

function stubDateNow(timestamp) {
  var date = new Date(timestamp);
  DateStub.withArgs().returns(date);
}

function splitGraphite(str) {
  var parts1 = str.split(':',2);
  var parts2 = parts1[1].split('|', 2);
  return [ parts1[0], parts2[0], parts2[1] ];
}