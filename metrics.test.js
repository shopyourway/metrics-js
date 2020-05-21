const assert = require('assert');
const { Metrics, InMemoryReporter } = require('./index');

describe('Metrics', () => {
  describe('constructor', () => {
    it('should throw an error if called with reporters that are not valid functions', () => {
      const reports = [];
      const validReporter = new InMemoryReporter(reports);
      const invalidReporter = null;

      let errMsg;
      try {
        // eslint-disable-next-line no-new
        new Metrics([validReporter, invalidReporter]);
      } catch (e) {
        errMsg = e.message;
      }

      assert.equal(errMsg, 'must pass valid reporters with a `report` function');
    });
  });

  describe('space', () => {
    it('should throw an error if not called with a non-empty string as argument', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);
      const func = () => {};

      assert.throws(() => {
        metrics.space(func);
      }, {
        message: 'must pass non-empty key string as argument',
      });
    });

    it('when tags is a string, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);

      assert.throws(() => {
        metrics.space('metric.test', 'tag');
      }, {
        message: 'tags must be an object',
      });
    });

    it('when tags is an array, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);

      assert.throws(() => {
        metrics.space('metric.test', ['tag']);
      }, {
        message: 'tags must be an object',
      });
    });

    it('should return a `Space` object', () => {
      const reports = [];
      const reporter = new InMemoryReporter(reports);
      const metrics = new Metrics([reporter]);

      const result = metrics.space('metric.test');

      assert.equal(result.constructor.name, 'Space');
    });
  });
});
