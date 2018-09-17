import { deprecate } from 'util';
import redisCache from './redis-cache';

export default deprecate(
  app => app.loopback.modelBuilder.mixins.define('RedisCache', redisCache),
  'DEPRECATED: Add this mixin via the mixins array of model-config.json'
);
