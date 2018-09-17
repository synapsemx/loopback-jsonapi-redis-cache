import { deprecate } from 'util';
import rediscache from './rediscache';

export default deprecate(
  app => app.loopback.modelBuilder.mixins.define('JSONAPIRedisCache', rediscache),
  'DEPRECATED: Add this mixin via the mixins array of model-config.json'
);
