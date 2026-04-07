/**
 * tests/setup.js
 * Runs before every test file.
 * Sets environment variables so tests don't need a real .env file.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'salamanet_test_secret_do_not_use_in_production';
process.env.JWT_EXPIRES_IN = '1h';
// Use a separate test database so tests never touch your real data
process.env.MONGODB_URI = 'mongodb://localhost:27017/salamanet_test';
process.env.PORT = '5001';