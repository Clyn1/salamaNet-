/**
 * utils/validators.js
 * Input validation helpers used across routes.
 * Returns null on success, or an error message string on failure.
 */

/**
 * Validate email format.
 * @param {string} email
 * @returns {string|null} error message or null
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const trimmed = email.trim();
  if (trimmed.length > 254) return 'Email is too long.';
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Please provide a valid email address.';
  return null;
};

/**
 * Validate password strength.
 * @param {string} password
 * @returns {string|null}
 */
const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (typeof password !== 'string') return 'Invalid password format.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (password.length > 128) return 'Password is too long (max 128 characters).';
  return null;
};

/**
 * Validate name field.
 * @param {string} name
 * @returns {string|null}
 */
const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 100) return 'Name is too long (max 100 characters).';
  return null;
};

/**
 * Validate a description field.
 * @param {string} description
 * @param {number} maxLength
 * @returns {string|null}
 */
const validateDescription = (description, maxLength = 2000) => {
  if (!description || typeof description !== 'string') return 'Description is required.';
  const trimmed = description.trim();
  if (trimmed.length < 5) return 'Description is too short (min 5 characters).';
  if (trimmed.length > maxLength) return `Description is too long (max ${maxLength} characters).`;
  return null;
};

/**
 * Sanitize a string by trimming and limiting length.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
const sanitize = (str, maxLen = 500) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
};

/**
 * Run multiple validators and return the first error found.
 * @param  {...Function} validators - Functions that return string|null
 * @returns {string|null}
 */
const runValidators = (...validators) => {
  for (const validator of validators) {
    const error = validator();
    if (error) return error;
  }
  return null;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateDescription,
  sanitize,
  runValidators,
};
