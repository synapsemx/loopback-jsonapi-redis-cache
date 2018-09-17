import debug from 'debug';

export default (name = 'redis-cache') => debug(`loopback:mixins:${name}`);
