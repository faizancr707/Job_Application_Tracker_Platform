/**
 * Redis Cache Service
 * With in-memory Map fallback when Redis unavailable
 */
const Redis = require('ioredis');

let redis = null;
let useMemoryFallback = false;
const memoryCache = new Map();
const memoryTTLs = new Map();

// Try to connect to Redis
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });
    redis.on('error', (err) => {
      console.error('Redis error, falling back to memory:', err.message);
      useMemoryFallback = true;
    });
    redis.on('connect', () => {
      console.log('✅ Redis connected');
      useMemoryFallback = false;
    });
    redis.connect().catch(() => {
      useMemoryFallback = true;
      console.log('⚠️ Redis unavailable, using in-memory cache');
    });
  } else {
    useMemoryFallback = true;
    console.log('⚠️ No REDIS_URL, using in-memory cache');
  }
} catch {
  useMemoryFallback = true;
}

// Clean expired memory cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryTTLs.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryTTLs.delete(key);
    }
  }
}, 60000);

/**
 * Get a cached value
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function get(key) {
  try {
    if (!useMemoryFallback && redis) {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    }
    if (memoryTTLs.has(key) && Date.now() > memoryTTLs.get(key)) {
      memoryCache.delete(key);
      memoryTTLs.delete(key);
      return null;
    }
    const val = memoryCache.get(key);
    return val !== undefined ? val : null;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=3600]
 */
async function set(key, value, ttlSeconds = 3600) {
  try {
    if (!useMemoryFallback && redis) {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      memoryCache.set(key, value);
      memoryTTLs.set(key, Date.now() + ttlSeconds * 1000);
      // Limit memory cache size
      if (memoryCache.size > 500) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
        memoryTTLs.delete(firstKey);
      }
    }
  } catch (err) {
    console.error('Cache set error:', err.message);
  }
}

/**
 * Delete a cached value
 * @param {string} key
 */
async function del(key) {
  try {
    if (!useMemoryFallback && redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
      memoryTTLs.delete(key);
    }
  } catch (err) {
    console.error('Cache delete error:', err.message);
  }
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - e.g., 'ai:cache:123:*'
 */
async function delPattern(pattern) {
  try {
    if (!useMemoryFallback && redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } else {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
          memoryTTLs.delete(key);
        }
      }
    }
  } catch (err) {
    console.error('Cache pattern delete error:', err.message);
  }
}

/**
 * Build a namespaced cache key
 * @param {number} userId
 * @param {string} feature
 * @param {string} [hash='']
 */
function buildKey(userId, feature, hash = '') {
  return `ai:cache:${userId}:${feature}${hash ? ':' + hash : ''}`;
}

/** Get the Redis client (for BullMQ) */
function getRedisClient() {
  return (!useMemoryFallback && redis) ? redis : null;
}

module.exports = { get, set, del, delPattern, buildKey, getRedisClient };
