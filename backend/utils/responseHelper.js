/**
 * utils/responseHelper.js
 * Standardized API response format.
 * Every endpoint returns the same shape — makes the frontend
 * easier to code against because you always know what to expect.
 *
 * Success:  { success: true,  data: {...},  message: '...' }
 * Error:    { success: false, error: '...', message: '...' }
 */

/**
 * Send a successful response.
 * @param {object} res - Express response object
 * @param {object} data - Payload to return
 * @param {string} message - Human-readable success message
 * @param {number} statusCode - HTTP status (default 200)
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {string} message - User-facing error message
 * @param {number} statusCode - HTTP status (default 500)
 * @param {string} error - Short error code for frontend handling
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, error = 'Error') => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};

/**
 * Send a 400 validation error.
 */
const sendValidationError = (res, message) => {
  return sendError(res, message, 400, 'ValidationError');
};

/**
 * Send a 401 unauthorized error.
 */
const sendUnauthorized = (res, message = 'Unauthorized. Please sign in.') => {
  return sendError(res, message, 401, 'Unauthorized');
};

/**
 * Send a 404 not found error.
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found.`, 404, 'NotFound');
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendNotFound,
};
