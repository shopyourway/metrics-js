const { Metrics, InMemoryReporter } = require('./index');

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
        .toThrow(TypeError);
    });

    it('should create a metrics object', () => {
      const reporters = [new InMemoryReporter({ buffer: [] })];
      const errback = jest.fn();

      expect(() => new Metrics({ reporters, errback }))
        .not.toThrow();
    });

    it.each([
      ['empty array', []],
      ['number', 1],
      ['string', 'no strings on me'],
    ])('should throw an error when tags is %s', (title, tags) => {
      const reporters = [new InMemoryReporter({ buffer: [] })];

      expect(() => new Metrics({ reporters, tags }))
        .toThrow('tags should be an object (key-value)');
    });

    it('should create a metrics objects with tags', () => {
      const reporters = [new InMemoryReporter({ buffer: [] })];
      const tags = { key: 'value' };

      const metrics = new Metrics({ reporters, tags, errback: jest.fn() });

      expect(metrics).toBeDefined();
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
        .toThrow('tags is not a object: tag: string');
    });

    it('when tags is an array, should throw error', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      expect(() => metrics.space('metric.test', ['tag']))
        .toThrow('tags is not a object: tag: object');
    });

    it('should return a `Space` object', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      const result = metrics.space('metric.test');

      expect(result.constructor.name).toEqual('Space');
    });

    it('should return `Space` object with default tags', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter], tags: { tag1: 'value1', tag2: 'value2' } });

      metrics.space('metric.test').increment();

      expect(reports.length).toEqual(1);
      expect(reports).toStrictEqual([expect.objectContaining({ tags: { tag1: 'value1', tag2: 'value2' } })]);
    });

    it('should return `Space` object with tags', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter] });

      metrics.space('metric.test', { tag1: 'value1', tag2: 'value2' }).increment();

      expect(reports.length).toEqual(1);
      expect(reports).toStrictEqual([expect.objectContaining({ tags: { tag1: 'value1', tag2: 'value2' } })]);
    });

    it('should return `Space` object with tags and default tags', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter], tags: { tag1: 'value1', tag2: 'value2' } });

      metrics.space('metric.test', { tag3: 'value3' }).increment();

      expect(reports.length).toEqual(1);
      expect(reports).toStrictEqual([expect.objectContaining({ tags: { tag1: 'value1', tag2: 'value2', tag3: 'value3' } })]);
    });

    it('should override default tags with tags', () => {
      const reports = [];
      const reporter = new InMemoryReporter({ buffer: reports });
      const metrics = new Metrics({ reporters: [reporter], tags: { tag1: 'value1', tag2: 'value2' } });

      metrics.space('metric.test', { tag2: 'overridden', tag3: 'value3' }).increment();

      expect(reports.length).toEqual(1);
      expect(reports).toStrictEqual([expect.objectContaining({ tags: { tag1: 'value1', tag2: 'overridden', tag3: 'value3' } })]);
    });
  });
});
