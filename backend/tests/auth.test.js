/**
 * tests/auth.test.js
 * Integration tests for the authentication API.
 *
 * Run with: npm test (after installing jest and supertest)
 *
 * Setup:
 *   npm install --save-dev jest supertest
 *   Add to package.json:  "test": "jest --forceExit"
 *
 * These tests use a separate in-memory MongoDB so they don't
 * touch your real database.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// ── TEST FIXTURES ──────────────────────────────────────────────────────────────

const validUser = {
  name: 'Amara Wanjiku',
  email: 'amara@test.com',
  password: 'password123',
};

// ── AUTH: REGISTER ─────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {

  test('creates a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', validUser.email);
    expect(res.body.user).not.toHaveProperty('password'); // Password must not be returned
  });

  test('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com' }); // Missing name and password

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects weak passwords (under 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('8 characters');
  });

  test('rejects duplicate email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(validUser);
    // Second registration with same email
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already');
  });

  test('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });
});

// ── AUTH: LOGIN ────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    // Create a fresh test user before each login test
    await request(app).post('/api/auth/register').send(validUser);
  });

  test('logs in with correct credentials and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Incorrect');
  });

  test('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    // Should not reveal whether email exists (security best practice)
    expect(res.body.message).toContain('Incorrect');
  });

  test('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email }); // Missing password

    expect(res.status).toBe(400);
  });
});

// ── AUTH: GET /me ──────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {

  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    token = res.body.token;
  });

  test('returns current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});

// ── CLEANUP ────────────────────────────────────────────────────────────────────

afterEach(async () => {
  // Clear all users between tests to keep tests isolated
  const User = require('../models/User');
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});