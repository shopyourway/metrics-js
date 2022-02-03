const { Metrics, InMemoryReporter } = require('../index');

describe('Metrics', () => {
  describe('constructor', () => {
    it('should throw an error if called with reporters that are not valid functions', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = null;

      expect(() => new Metrics([validReporter, invalidReporter]))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have report function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.report;

      expect(() => new Metrics([validReporter, invalidReporter]))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have value function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.value;

      expect(() => new Metrics([validReporter, invalidReporter]))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have increment function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.increment;

      expect(() => new Metrics([validReporter, invalidReporter]))
        .toThrow('must pass valid reporters with a `report` function');
    });
  });

  describe('space', () => {
    it('should throw an error if not called with a non-empty string as argument', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);
      const func = () => {};

      expect(() => metrics.space(func)).toThrow('must pass non-empty key string as argument');
    });

    it('when tags is a string, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);

      expect(() => metrics.space('metric.test', 'tag'))
        .toThrow('tags must be an object');
    });

    it('when tags is an array, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);

      expect(() => metrics.space('metric.test', ['tag']))
        .toThrow('tags must be an object');
    });

    it('should return a `Space` object', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics([reporter]);

      const result = metrics.space('metric.test');

      expect(result.constructor.name).toEqual('Space');
    });
  });
});
