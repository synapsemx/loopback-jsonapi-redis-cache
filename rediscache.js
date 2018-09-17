/* Mixin name: 'RedisCache' (case-sensitive)
 * Purpose: Cache every GET request with our cache query param
 *          Invalidate cache on every create, update, delete, or ttl expiration
 *
 * Options: custom redis server per loopback model
 *          'RedisCache': {
 *             'client': {
 *               'host': 'redis.server.ip.address',
 *               'password': 'redis-password'
 *             }
 *           }
 */
const redis = require('redis');
const redisDeletePattern = require('redis-delete-pattern');
const serialize = require('loopback-jsonapi-model-serializer');
const debug = require('debug')('loopback:mixin:jsonapi-redis-cache');

module.exports = function(Model, options) {
  var clientSettings;
  if (options && options.client) {
    clientSettings = options && options.client;
  } else {
    let rootApp = require('../../server/server.js');
    clientSettings = rootApp.get('redis');
  }
  var client = redis.createClient(clientSettings);

  function handleError(err) {
    debug(err);
    // try to connect again with server config
    if (err.toString().indexOf('invalid password') !== -1) {
      debug('Invalid password... reconnecting with server config...');
      var app = require('../../server/server');
      var clientSettings = app.get('redis');
      client = redis.createClient(clientSettings);
    }
  };

  client.on('error', handleError);

  Model.beforeRemote('**', function(ctx, res, next) {
    // get all find methods and search first in cache
    if ((ctx.method.name.indexOf('find') !== -1 ||
      ctx.method.name.indexOf('__get') !== -1) && client.connected) {
      if (typeof ctx.req.query.cache != 'undefined') {
        var modelName = ctx.method.sharedClass.name;
        var cacheExpire = ctx.req.query.cache;
        let id = res.id || 'idx';

        // set key name
        var cacheKey = modelName + '_' + id + '_' +
          new Buffer(JSON.stringify(ctx.req.query)).toString('base64');

        // search for cache
        client.get(cacheKey, function(err, val) {
          debug('***** cacheKey *****', cacheKey);
          if (err) {
            debug(err);
          }

          if (val !== null) {
            debug('***** val *****', JSON.parse(val));
            ctx.result = JSON.parse(val);
            ctx.done(function(err) {
              if (err) return next(err);
            });
          } else {
            // return data
            next();
          }
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  Model.afterRemote('**', function(ctx, res, next) {
    // get all find methods and search first in cache - if not exist save in cache
    if ((ctx.method.name.indexOf('find') !== -1 ||
      ctx.method.name.indexOf('__get') !== -1) && client.connected) {
      if (typeof ctx.req.query.cache != 'undefined') {
        var modelName = ctx.method.sharedClass.name;
        var cacheExpire = ctx.req.query.cache;
        let id = res.id || 'idx';

        // set key name
        var cacheKey = modelName + '_' + id + '_' +
         new Buffer(JSON.stringify(ctx.req.query)).toString('base64');

        // search for cache
        client.get(cacheKey, function(err, val) {
          if (err) {
            debug(err);
          }

          if (val == null) {
            // set cache key
            let _model = Model.app.models[`${modelName}`];
            client.set(cacheKey,
              JSON.stringify(serialize(res, _model))); // serialize for json-api
            client.expire(cacheKey, cacheExpire);
            next();
          } else {
            next();
          }
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  Model.afterRemote('**', function(ctx, res, next) {
    // delete cache on patchOrCreate, create, delete, update, destroy, upsert
    if ((ctx.method.name.indexOf('find') == -1 &&
      ctx.method.name.indexOf('__get') == -1) && client.connected) {
      var modelName = ctx.method.sharedClass.name;
      var cacheExpire = ctx.req.query.cache;
      let id = res.id || 'idx';

      // set key name
      var cacheKey = modelName + '_' + id + '_*';

      // delete cache
      redisDeletePattern({
        redis: client,
        pattern: cacheKey,
      }, function handleError(err) {
        if (err) {
          debug(err);
        }
        next();
      });
    } else {
      next();
    }
  });
};
