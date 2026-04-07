/**
 * tests/evidence.test.js
 * Integration tests for the Evidence Locker API.
 * Tests data isolation (users can only see their own evidence).
 */

const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const app = require('../server');

// ── HELPERS ────────────────────────────────────────────────────────────────────

const registerAndLogin = async (email = 'user@test.com') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password: 'password123' });
  return res.body.token;
};

// ── EVIDENCE: POST ─────────────────────────────────────────────────────────────

describe('POST /api/evidence', () => {

  let token;
  beforeEach(async () => { token = await registerAndLogin(); });

  test('creates evidence with text only (no file)', async () => {
    const res = await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Someone sent threatening messages to my inbox')
      .field('category', 'harassment');

    expect(res.status).toBe(201);
    expect(res.body.evidence).toHaveProperty('description');
    expect(res.body.evidence.category).toBe('harassment');
    expect(res.body.evidence).toHaveProperty('createdAt'); // Timestamp must be set
  });

  test('rejects evidence without description', async () => {
    const res = await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('category', 'harassment');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('rejects request without auth token', async () => {
    const res = await request(app)
      .post('/api/evidence')
      .field('description', 'Test')
      .field('category', 'other');

    expect(res.status).toBe(401);
  });
});

// ── EVIDENCE: GET ──────────────────────────────────────────────────────────────

describe('GET /api/evidence', () => {

  let token;
  beforeEach(async () => { token = await registerAndLogin(); });

  test('returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/evidence')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.evidence).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  test('returns only this user\'s evidence (data isolation)', async () => {
    // User 1 uploads evidence
    await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'User 1 evidence')
      .field('category', 'other');

    // User 2 registers and queries evidence
    const token2 = await registerAndLogin('user2@test.com');
    const res = await request(app)
      .get('/api/evidence')
      .set('Authorization', `Bearer ${token2}`);

    // User 2 should see ZERO items — not user 1's evidence
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.evidence).toEqual([]);
  });

  test('returns all evidence for a user', async () => {
    // Create 3 items
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/evidence')
        .set('Authorization', `Bearer ${token}`)
        .field('description', `Evidence item ${i + 1}`)
        .field('category', 'cyberstalking');
    }

    const res = await request(app)
      .get('/api/evidence')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.evidence).toHaveLength(3);
  });

  test('returns evidence sorted newest first', async () => {
    await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'First item')
      .field('category', 'other');

    await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Second item')
      .field('category', 'other');

    const res = await request(app)
      .get('/api/evidence')
      .set('Authorization', `Bearer ${token}`);

    // Most recent should be first
    expect(res.body.evidence[0].description).toBe('Second item');
  });
});

// ── EVIDENCE: DELETE ───────────────────────────────────────────────────────────

describe('DELETE /api/evidence/:id', () => {

  let token;
  beforeEach(async () => { token = await registerAndLogin(); });

  test('deletes own evidence', async () => {
    // Create item
    const createRes = await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'To be deleted')
      .field('category', 'other');

    const id = createRes.body.evidence._id;

    // Delete it
    const deleteRes = await request(app)
      .delete(`/api/evidence/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    // Confirm it's gone
    const getRes = await request(app)
      .get('/api/evidence')
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.body.count).toBe(0);
  });

  test('cannot delete another user\'s evidence', async () => {
    // User 1 creates evidence
    const createRes = await request(app)
      .post('/api/evidence')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'User 1 private evidence')
      .field('category', 'other');

    const id = createRes.body.evidence._id;

    // User 2 tries to delete it
    const token2 = await registerAndLogin('attacker@test.com');
    const deleteRes = await request(app)
      .delete(`/api/evidence/${id}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(deleteRes.status).toBe(404); // Should be 404, not 403 (don't reveal existence)
  });
});

// ── CLEANUP ────────────────────────────────────────────────────────────────────

afterEach(async () => {
  const User = require('../models/User');
  const Evidence = require('../models/Evidence');
  await Promise.all([User.deleteMany({}), Evidence.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.connection.close();
});
