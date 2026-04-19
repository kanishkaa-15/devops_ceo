const NodeCache = require('node-cache');

// Standard TTL is 5 minutes (300 seconds)
const analyticsCache = new NodeCache({ stdTTL: 300, checkperiod: 320, useClones: false });

const cacheMiddleware = (req, res, next) => {
    // We only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl;
    const cachedResponse = analyticsCache.get(key);

    if (cachedResponse) {
        console.log(`[Cache Hit] Returning cached response for ${key}`);
        return res.json(cachedResponse);
    } else {
        console.log(`[Cache Miss] Calculating response for ${key}`);

        // Intercept res.json to store the payload in cache before sending
        res.originalJson = res.json;
        res.json = (body) => {
            analyticsCache.set(key, body);
            res.originalJson(body);
        };
        next();
    }
};

module.exports = { cacheMiddleware, analyticsCache };
