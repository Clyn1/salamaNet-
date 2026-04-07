/**
 * middleware/requestLogger.js
 * HTTP request logger using morgan.
 * In development: colourful, human-readable logs.
 * In production: compact JSON logs suitable for log aggregators (Datadog, Papertrail).
 *
 * Usage in server.js:
 *   const { requestLogger } = require('./middleware/requestLogger');
 *   app.use(requestLogger);
 */

const morgan = require('morgan');

// Custom token: extract user ID from JWT payload if present on req.user
morgan.token('user-id', (req) => req.user?._id?.toString() || 'anon');

// Development format: GET /api/auth/login 200 45ms — u:anon
const devFormat = ':method :url :status :response-time ms — u::user-id';

// Production format: structured, machine-parseable
const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':remote-addr',
  userId: ':user-id',
  date: ':date[iso]',
});

const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  {
    // Skip logging health checks to reduce noise
    skip: (req) => req.url === '/api/health' && process.env.NODE_ENV === 'production',
  }
);

module.exports = { requestLogger };
