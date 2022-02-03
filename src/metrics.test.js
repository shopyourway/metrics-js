const { Metrics, InMemoryReporter } = require('../index');

describe('Metrics', () => {
  describe('constructor', () => {
    it('should throw an error if called with reporters that are not valid functions', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = null;

      expect(() => new Metrics({ reporters: [validReporter, invalidReporter] }))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have report function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.report;

      expect(() => new Metrics({ reporters: [validReporter, invalidReporter] }))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have value function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.value;

      expect(() => new Metrics({ reporters: [validReporter, invalidReporter] }))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it('should throw an error if called with reporters that does not have increment function', () => {
      const reports = [];
      const validReporter = new InMemoryReporter({ buffer: reports });
      const invalidReporter = new InMemoryReporter({ buffer: [] });
      delete invalidReporter.increment;

      expect(() => new Metrics({ reporters: [validReporter, invalidReporter] }))
        .toThrow('must pass valid reporters with a `report` function');
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['empty array', []],
      ['number', 1],
      ['string', 'no strings on me'],
      ['object', { key: 'value' }],
    ])('should throw an error when reporters is %s', (title, reporters) => {
      expect(() => new Metrics({ reporters }))
        .toThrow('reporters is missing or empty');
    });

    it.each([
      ['array', ['a', 'b']],
      ['number', 1],
      ['string', 'no strings on me'],
      ['object', { key: 'value' }],
    ])('should throw error when errback is %s', (title, errback) => {
      const reporters = [new InMemoryReporter({ buffer: [] })];

      expect(() => new Metrics({ reporters, errback }))
        .toThrow('errback must be a function');
    });

    it('should create a metrics object', () => {
      const reporters = [new InMemoryReporter({ buffer: [] })];
      const errback = jest.fn();

      expect(() => new Metrics({ reporters, errback }))
        .not.toThrow();
    });
  });

  describe('space', () => {
    it('should throw an error if not called with a non-empty string as argument', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });
      const func = () => {};

      expect(() => metrics.space(func)).toThrow('must pass non-empty key string as argument');
    });

    it('when tags is a string, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      expect(() => metrics.space('metric.test', 'tag'))
        .toThrow('tags must be an object');
    });

    it('when tags is an array, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      expect(() => metrics.space('metric.test', ['tag']))
        .toThrow('tags must be an object');
    });

    it('should return a `Space` object', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      const result = metrics.space('metric.test');

      expect(result.constructor.name).toEqual('Space');
    });
  });
});
