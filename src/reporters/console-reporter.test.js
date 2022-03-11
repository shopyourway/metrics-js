const { Metrics, ConsoleReporter } = require('../index');

describe('ConsoleReporter', () => {
  describe('constructor', () => {
    it('should create a new instance', () => {
      expect(() => new ConsoleReporter()).not.toThrow();
    });
  });

  describe('report', () => {
    it('should not throw when called', () => {
      const errback = jest.fn();
      const reporter = new ConsoleReporter();
      const metrics = new Metrics({ reporters: [reporter], errback });

      metrics.space('space.meter').meter(() => console.log('do something'))();

      expect(errback).not.toHaveBeenCalled();
    });
  });

  describe('increment', () => {
    it('should not throw when called', () => {
      const errback = jest.fn();
      const reporter = new ConsoleReporter();
      const metrics = new Metrics({ reporters: [reporter], errback });

      metrics.space('space.meter').increment();

      expect(errback).not.toHaveBeenCalled();
    });
  });

  describe('value', () => {
    it('should not throw when called', () => {
      const errback = jest.fn();
      const reporter = new ConsoleReporter();
      const metrics = new Metrics({ reporters: [reporter], errback });

      metrics.space('space.meter').value(5);

      expect(errback).not.toHaveBeenCalled();
    });
  });
});
