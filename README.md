# loopback-jsonapi-redis-cache
Mixin for Loopback that provides a Redis cache using the JSON API payload format.

Builds on these great packages:

 - [redis](https://github.com/NodeRedis/node_redis)
 - [redis-delete-pattern](https://github.com/uber/redis-delete-pattern)
 - [loopback-redis-cache](https://github.com/vkatsar/loopback-redis-cache)
 - [loopback-jsonapi-model-serializer](https://github.com/digitalsadhu/loopback-jsonapi-model-serializer)

# Features

  - Cache every GET request with the query param `cache={ttl}` (ie, `cache=3600`).
  - Optional per-model Redis server with fallback to the default Redis server.
  - Invalidate cache on every create, update, delete, or when TTL expires.

### Installation

loopback-jsonapi-redis-cache requires [Node.js](https://nodejs.org/) v4+ to run.

 Install using npm

```
$ npm install loopback-jsonapi-redis-cache --save
```

You can statically define things if you want...
`/server/config.json`
```
  "redis": {
    "host": "127.0.0.1",
    "port": "6379",
    "password": "optional-redis-password"
  }
```  

But we prefer to use Loopback's environment substitutions here, along with .env vars...

`/server/config.development.js`

```
module.exports = {
  ...
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  ...
};

```


Add to /server/model-config.json
```
    "mixins": [
      ...
      "../node_modules/loopback-jsonapi-redis-cache"
      ...
    ]
```

### Plugins

loopback-redis-cache is currently extended with the following plugins.

| Plugin | README |
| ------ | ------ |
| redis | [https://github.com/NodeRedis/node_redis/blob/master/README.md] |
| redis-delete-pattern | [https://github.com/uber-archive/redis-delete-pattern/blob/master/README.md] |
| redis-delete-pattern | [https://github.com/uber-archive/redis-delete-pattern/blob/master/README.md] |
| loopback-jsonapi-model-serializer | [https://github.com/digitalsadhu/loopback-jsonapi-model-serializer/blob/master/README.md] |


### How to use it
In each model you want to provide caching (using the default redis server)
```
  "mixins": {
     "RedisCache": {} // case sensitive!
  }
```  
If you want to provide a per-model redis server (optional)
```
  "mixins": {
     "RedisCache": {
       "client": {
         "host": "redis.server.ip.address",
         "password": "redis-password"
       }
     }    
  }
  ```

  Example
    ``
  http://0.0.0.0:3000/api/games?cache=120
    ``
  cache value in seconds

  ### AngularJS SDK example

  ```
    Category.findOne({
        filter: {
            where: {
                categoryId: $scope.Id
            }
        },
        cache: 120
    }, function (item) {
        console.log(item);
    }, function (err) {
        console.log(err);
    });
  ```

  ### EmberJS example

  ```
    this.get('store').query(modelName, {
          filter: {
            where: {
                categoryId: this.get('categoryId')
              }
          },
          cache: 120
        }).then()...
  ```
