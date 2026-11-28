/**
 * Structured CloudWatch Logger & Request Telemetry Middleware
 * Outputs single-line JSON in production (ingested by CloudWatch Logs Agent)
 * and human-readable logs in local development.
 */

const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

function emit(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'hirehub-backend',
    environment: process.env.NODE_ENV || 'development',
    message,
    ...meta,
  };

  if (isProduction) {
    const stream = level === 'error' ? process.stderr : process.stdout;
    stream.write(JSON.stringify(entry) + '\n');
  } else {
    const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `${icon} [${level.toUpperCase()}] ${message}${metaStr}`
    );
  }
}

const logger = {
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};

/**
 * Express middleware that assigns a correlation ID and logs structured HTTP metrics
 * suitable for CloudWatch Logs Insights & Metric Filters (e.g. 5xx count, p95 latency).
 */
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const correlationId = req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Request-Id', correlationId);

  res.on('finish', () => {
    // Skip noisy health check logs unless they fail
    if (req.path === '/api/v1/health' && res.statusCode < 400) return;

    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    emit(level, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.id || null,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    });
  });

  next();
}

module.exports = { logger, requestLogger };
