/**
 * AI Observability Service
 * Logging, metrics, and error tracking for AI operations
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Create a correlation context for an AI request
 * @param {string} feature - Feature name
 * @param {number} userId
 * @returns {object} Context with correlationId and timing
 */
function createAIContext(feature, userId) {
  return {
    correlationId: uuidv4(),
    feature,
    userId,
    startTime: Date.now(),
    logs: [],
  };
}

/**
 * Log an AI operation
 * @param {object} ctx - AI context
 * @param {string} level - 'info'|'warn'|'error'
 * @param {string} message
 * @param {object} [data]
 */
function logAI(ctx, level, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    correlationId: ctx.correlationId,
    feature: ctx.feature,
    userId: ctx.userId,
    level,
    message,
    latencyMs: Date.now() - ctx.startTime,
    ...data,
  };
  ctx.logs.push(entry);
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '📊';
    console.log(`${prefix} [AI:${ctx.feature}] ${message}`, data.error ? `Error: ${data.error}` : '');
  }
}

/**
 * Classify an error as transient or permanent
 * @param {Error} error
 * @returns {{ type: string, shouldRetry: boolean }}
 */
function classifyError(error) {
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('rate limit') || msg.includes('timeout') || msg.includes('econnreset') || msg.includes('503')) {
    return { type: 'transient', shouldRetry: true };
  }
  if (msg.includes('invalid api key') || msg.includes('authentication') || msg.includes('billing')) {
    return { type: 'auth', shouldRetry: false };
  }
  if (msg.includes('context length') || msg.includes('maximum')) {
    return { type: 'input_too_large', shouldRetry: false };
  }
  return { type: 'unknown', shouldRetry: false };
}

module.exports = { createAIContext, logAI, classifyError };
