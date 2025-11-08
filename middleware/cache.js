const NodeCache = require('node-cache');

// Initialize cache with 2 minute standard TTL
const cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

// Cache middleware for API responses
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query params
    const key = `__express__${req.originalUrl || req.url}`;

    // Check if response is cached
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      res.set(cachedResponse.headers);
      return res.status(cachedResponse.statusCode).json(cachedResponse.body);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body) {
      // Cache the response
      const responseToCache = {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: body
      };
      cache.set(key, responseToCache, duration);

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

// HTTP Cache headers middleware for public routes
const httpCacheMiddleware = (maxAge = 120) => { // 2 minutes default
  return (req, res, next) => {
    // Set cache headers for GET requests
    if (req.method === 'GET') {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}`,
        'Expires': new Date(Date.now() + maxAge * 1000).toUTCString()
      });
    }
    next();
  };
};

// Clear cache for specific pattern
const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  matchingKeys.forEach(key => cache.del(key));
  return matchingKeys.length;
};

module.exports = {
  cacheMiddleware,
  httpCacheMiddleware,
  clearCache,
  cache
};
