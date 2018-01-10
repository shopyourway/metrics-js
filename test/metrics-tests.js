var assert = require('assert');
var metrics = require('../index');
var Metrics = metrics.Metrics;
var InMemoryReporter = metrics.InMemoryReporter;

describe('Metrics', function() {
  describe('constructor', function() {
    it('should throw an error if called with reporters that are not valid functions', function() {
      var reports = [];
      var validReporter = new InMemoryReporter(reports);
      var invalidReporter = null;

      var errMsg;
      try {
        new Metrics([ validReporter, invalidReporter ]);
      }
      catch (e) {
        errMsg = e.message;
      }

      assert.equal(errMsg, 'must pass valid reporters with a `report` function');
    });
  });

  describe('space', function () {
    it('should throw an error if not called with a non-empty string as argument', function () {
      var reports = [];
      var reporter = new InMemoryReporter(reports);
      var metrics = new Metrics([reporter]);
      var func = function() {};
      try {
        metrics.space(func);
      }
      catch (e) {
        assert.equal(e.message, 'must pass non-empty key string as argument')
      }
    });

    it('should return a `Space` object', function() {
      var reports = [];
      var reporter = new InMemoryReporter(reports);
      var metrics = new Metrics([ reporter ]);

      var result = metrics.space('SYW.Adder');

      assert.equal(result.constructor.name, 'Space');
    });
  });
});