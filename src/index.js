import { deprecate } from 'util';
import rediscache from './rediscache';

export default deprecate(
  app => app.loopback.modelBuilder.mixins.define('jsonapi-redis-mixin', rediscache),
  'DEPRECATED: Add this mixin via the mixins array of model-config.json'
);
