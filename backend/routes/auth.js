/**
 * routes/auth.js
 * Authentication routes: register and login.
 *
 * POST /api/auth/register  — Create a new account
 * POST /api/auth/login     — Sign in and get JWT token
 * GET  /api/auth/me        — Get current user (protected)
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper: Generate a signed JWT token for a user.
 * The token payload contains the user's ID.
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                          // Payload: what we embed in the token
    process.env.JWT_SECRET,                  // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Token lifetime
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Create a new user account
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, email, and password are required.',
      });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 8 characters.',
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists.',
      });
    }

    // Create new user — password will be hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password });

    // Generate JWT for immediate login after registration
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toSafeObject(),
    });

  } catch (err) {
    console.error('Register error:', err);

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: 'Validation failed', messages });
    }

    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Authenticate user and return JWT token
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required.',
      });
    }

    // Find user by email — we must explicitly select password (it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Use generic message to avoid revealing whether email exists
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect email or password.',
      });
    }

    // Check if password matches the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect email or password.',
      });
    }

    // Password is correct — generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me (protected)
// Return current authenticated user's profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  // req.user is set by the protect middleware
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
