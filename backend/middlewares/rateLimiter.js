const rateLimit = require('express-rate-limit');

/**
 * AI rate limiter - 10 requests per minute per user
 */
const aiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.id ? String(req.id) : 'anon',
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { success: false, message: 'AI rate limit exceeded. Please wait before making more AI requests.' },
});

/**
 * Embedding rate limiter - 30 requests per minute
 */
const embeddingRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.id ? String(req.id) : 'anon',
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { success: false, message: 'Embedding rate limit exceeded.' },
});

/**
 * General rate limiter - 100 requests per minute
 */
const generalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { success: false, message: 'General rate limit exceeded.' },
});

module.exports = {
    aiRateLimiter,
    embeddingRateLimiter,
    generalRateLimiter
};
