/**
 * middleware/security.js
 * Security middleware stack applied to the entire Express app.
 *
 * Includes:
 *  - helmet: Sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
 *  - express-rate-limit: Blocks brute-force login attempts
 *  - express-mongo-sanitize: Prevents MongoDB injection via query operators ($where, $gt, etc.)
 *  - Custom XSS sanitizer: Strips HTML from text inputs
 *
 * Usage in server.js:
 *   const { applySecurityMiddleware, authLimiter } = require('./middleware/security');
 *   applySecurityMiddleware(app);
 *   app.use('/api/auth', authLimiter, authRoutes);
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

/**
 * Apply all security middleware to the Express app.
 * Call this BEFORE registering any routes.
 * @param {import('express').Application} app
 */
const applySecurityMiddleware = (app) => {

  // ── 1. HELMET — HTTP Security Headers ───────────────────────────────────────
  // Sets headers like:
  //   X-Content-Type-Options: nosniff
  //   X-Frame-Options: DENY
  //   Content-Security-Policy: ...
  //   Strict-Transport-Security: max-age=...
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files
  }));

  app.use(sanitizeMiddleware);

  // ── 2. GLOBAL RATE LIMIT — All API routes ───────────────────────────────────
  // Prevents API abuse: max 100 requests per 15 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,    // Return limit info in RateLimit-* headers
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'You have made too many requests. Please wait 15 minutes and try again.',
    },
    skip: (req) => process.env.NODE_ENV === 'test', // Don't rate-limit during tests
  });

  app.use('/api/', globalLimiter);

  // ── 3. MONGO SANITIZE — Prevent NoSQL Injection ─────────────────────────────
  // Strips characters like $ and . from request body, params, and query
  // This prevents attacks like: { "email": { "$gt": "" } }
  app.use(mongoSanitize({
    replaceWith: '_', // Replace forbidden chars instead of removing (preserves structure)
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  Potential NoSQL injection attempt sanitized: key="${key}" from ${req.ip}`);
    },
  }));

  // ── 4. CUSTOM XSS SANITIZER — Strip HTML from text fields ──────────────────
  // Applied to req.body string values to prevent stored XSS attacks
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  });
};

/**
 * Recursively sanitize all string values in an object.
 * Skips password fields (hashing handles those separately).
 * @param {object} obj
 * @returns {object}
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'password' || key === 'confirmPassword') {
      // Never XSS-sanitize passwords — bcrypt handles them
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = xss(value.trim());
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// ── SPECIFIC RATE LIMITERS ─────────────────────────────────────────────────────

/**
 * Strict limiter for auth endpoints.
 * Max 10 attempts per 15 minutes — blocks brute-force password attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many attempts',
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
  // Store failed attempts (in production, use Redis for multi-server setups)
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * SOS limiter — generous but prevents abuse.
 * Max 20 SOS alerts per hour per IP.
 */
const sosLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many SOS alerts',
    message: 'Too many SOS requests from this device. Call 999 directly in an emergency.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Upload limiter — prevents storage abuse.
 * Max 30 uploads per hour per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    error: 'Upload limit reached',
    message: 'You have uploaded too many files this hour. Please try again later.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (let key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitize(obj[key]); // recursive
    }
  }
};

const sanitizeMiddleware = (req, res, next) => {
  sanitize(req.body);
  sanitize(req.params);
  sanitize(req.headers); // optional
  next();
};

module.exports = {
  applySecurityMiddleware,
  authLimiter,
  sosLimiter,
  uploadLimiter,
};
