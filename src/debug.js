import debug from 'debug';

export default (name = 'jsonapi-redis') => debug(`loopback:mixins:${name}`);
