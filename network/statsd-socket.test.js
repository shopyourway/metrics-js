jest.mock('./socket', () => ({ Socket: jest.fn() }));
const { Socket } = require('./socket');
const { StatsdSocket } = require('./statsd-socket');

describe('StatsdSocket', () => {
  describe('constructor', () => {
    it('should create socket with given host and default values', () => {
      // eslint-disable-next-line no-new
      new StatsdSocket({
        host: '127.0.0.1',
      });

      expect(Socket).toBeCalledWith({
        host: '127.0.0.1',
        port: 8125,
        batch: true,
        maxBufferSize: 1000,
        flushInterval: 1000,
      });
    });

    it('should create socket with given values', () => {
      // eslint-disable-next-line no-new
      new StatsdSocket({
        host: '127.0.0.1',
        port: 1234,
        batch: false,
        maxBufferSize: 10,
        flushInterval: 20,
      });

      expect(Socket).toBeCalledWith({
        host: '127.0.0.1',
        port: 1234,
        batch: false,
        maxBufferSize: 10,
        flushInterval: 20,
      });
    });

    it.each([
      ['string', 'strings'],
      ['number', 1],
      ['array', ['a', 'b']],
    ])('should throw when default tags are %s', (title, tags) => {
      expect(() => {
        // eslint-disable-next-line no-new
        new StatsdSocket({
          host: '127.0.0.1',
          tags,
        });
      }).toThrow(TypeError);
    });
  });

  describe('close', () => {
    it('should close socket', () => {
      const { close } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
      });

      target.close();

      expect(close).toBeCalledTimes(1);
    });
  });

  describe('send', () => {
    describe('validations', () => {
      it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty string', ''],
        ['number', 1],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
      ])('should throw when key is %s', (title, key) => {
        setSocket();

        const target = new StatsdSocket({
          host: '127.0.0.1',
        });

        expect(() => target.send({
          key,
          value: 1.2,
          type: 'ms',
        })).toThrow(TypeError);
      });

      it.each([
        ['null', null],
        ['undefined', undefined],
        ['string', 'no string on me'],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
      ])('should throw when value is %s', (title, value) => {
        setSocket();

        const target = new StatsdSocket({
          host: '127.0.0.1',
        });

        expect(() => target.send({
          key: 'space.the.final.frontier',
          value,
          type: 'ms',
        })).toThrow(TypeError);
      });

      it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty string', ''],
        ['number', 1],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
      ])('should throw when type is %s', (title, type) => {
        setSocket();

        const target = new StatsdSocket({
          host: '127.0.0.1',
        });

        expect(() => target.send({
          key: 'space.the.final.frontier',
          value: 1.2,
          type,
        })).toThrow(TypeError);
      });

      it.each([
        ['string', 'a string'],
        ['number', 1],
        ['array', ['a', 'b']],
      ])('should throw when tags is %s', (title, tags) => {
        setSocket();

        const target = new StatsdSocket({
          host: '127.0.0.1',
        });

        expect(() => target.send({
          key: 'space.the.final.frontier',
          value: 1.2,
          type: 'ms',
          tags,
        })).toThrow(TypeError);
      });

      it.each([
        ['string', 'a string'],
        ['number', 1],
        ['array', ['a', 'b']],
        ['object', { key: 'value' }],
      ])('should throw when callback is %s', (title, callback) => {
        setSocket();

        const target = new StatsdSocket({
          host: '127.0.0.1',
        });

        expect(() => target.send({
          key: 'space.the.final.frontier',
          value: 1.2,
          type: 'ms',
          callback,
        })).toThrow(TypeError);
      });
    });

    it('should send metric', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms' });
    });

    it('should send callback when defined', () => {
      const { send } = setSocket();
      const callback = () => {};

      const target = new StatsdSocket({
        host: '127.0.0.1',
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
        callback,
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms', callback });
    });

    it('should append prefix if defined', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
        prefix: 'namespace.prefix.',
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
      });

      expect(send).toBeCalledWith({ message: 'namespace.prefix.space.subspace:1|ms' });
    });

    it('should append prefix if defined without trailing dots', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
        prefix: 'namespace.prefix',
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
      });

      expect(send).toBeCalledWith({ message: 'namespace.prefix.space.subspace:1|ms' });
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['number', 1],
      ['array', ['a', 'b']],
      ['object', { key: 'value' }],
    ])('should ignore prefix if it is %s', (title, prefix) => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
        prefix,
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms' });
    });

    it('should append tags', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
        tags: { tag1: 'value1', tag2: 'value2' },
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms|#tag1:value1,tag2:value2' });
    });

    it('should append default tags', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
        tags: { tag1: 'value1', tag2: 'value2' },
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms|#tag1:value1,tag2:value2' });
    });

    it('should merge tags and default tags', () => {
      const { send } = setSocket();

      const target = new StatsdSocket({
        host: '127.0.0.1',
        tags: { tag1: 'value1', tag2: 'value2' },
      });

      target.send({
        key: 'space.subspace',
        value: 1,
        type: 'ms',
        tags: { tag2: 'overridden', tag3: 'value3' },
      });

      expect(send).toBeCalledWith({ message: 'space.subspace:1|ms|#tag1:value1,tag2:overridden,tag3:value3' });
    });
  });

  function setSocket() {
    const close = jest.fn();
    const send = jest.fn();

    Socket.mockImplementationOnce(() => ({ close, send }));

    return {
      close,
      send,
    };
  }
});
