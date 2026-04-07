/**
 * utils/tokenHelper.js
 * Centralized JWT utilities for the backend.
 * Keeps token logic in one place so it's easy to change.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user ID.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set!');
  }
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT string to verify
 * @returns {{ id: string }} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Extract token from an Authorization header.
 * Handles "Bearer <token>" format.
 * @param {string} authHeader - Value of the Authorization header
 * @returns {string|null} The token string, or null if not found
 */
const extractFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token || null;
};

module.exports = { generateToken, verifyToken, extractFromHeader };