/**
 * middleware/authMiddleware.js
 * JWT authentication middleware for protected routes.
 *
 * Usage: Add as a middleware to any route you want to protect:
 *   router.get('/my-data', protect, myController);
 *
 * How it works:
 *   1. Reads the Authorization header: "Bearer <token>"
 *   2. Verifies the token using our JWT_SECRET
 *   3. Loads the user from the database
 *   4. Attaches user to req.user so route handlers can use it
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token from header ─────────────────────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Please sign in.',
      });
    }

    // "Bearer abc123..." → "abc123..."
    const token = authHeader.split(' ')[1];

    // ── 2. Verify token ───────────────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token is invalid or expired
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please sign in again.'
          : 'Invalid token. Please sign in again.';

      return res.status(401).json({ error: 'Unauthorized', message });
    }

    // ── 3. Find user in database ──────────────────────────────────────────────
    // We use the user ID stored in the token payload (set during login)
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or account deactivated.',
      });
    }

    // ── 4. Attach user to request object ─────────────────────────────────────
    // Route handlers can now access req.user
    req.user = user;
    next(); // Pass control to the actual route handler

  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { protect };
