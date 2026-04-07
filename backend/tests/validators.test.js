/**
 * tests/validators.test.js
 * Unit tests for input validation helpers.
 * These are fast — they don't need the database.
 */

const {
  validateEmail,
  validatePassword,
  validateName,
  validateDescription,
  sanitize,
  runValidators,
} = require('../utils/validators');

// ── EMAIL ──────────────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  test('accepts valid emails', () => {
    expect(validateEmail('amara@example.com')).toBeNull();
    expect(validateEmail('test.user+tag@subdomain.co.ke')).toBeNull();
    expect(validateEmail('user@kenya.org')).toBeNull();
  });

  test('rejects missing email', () => {
    expect(validateEmail('')).not.toBeNull();
    expect(validateEmail(null)).not.toBeNull();
    expect(validateEmail(undefined)).not.toBeNull();
  });

  test('rejects invalid formats', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
    expect(validateEmail('@nodomain.com')).not.toBeNull();
    expect(validateEmail('missing@')).not.toBeNull();
    expect(validateEmail('spaces in@email.com')).not.toBeNull();
  });

  test('rejects emails that are too long', () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    expect(validateEmail(longEmail)).not.toBeNull();
  });
});

// ── PASSWORD ───────────────────────────────────────────────────────────────────

describe('validatePassword', () => {
  test('accepts strong passwords', () => {
    expect(validatePassword('password123')).toBeNull();
    expect(validatePassword('MyS3cur3P@ss!')).toBeNull();
    expect(validatePassword('12345678')).toBeNull(); // 8 chars = OK
  });

  test('rejects passwords under 8 characters', () => {
    expect(validatePassword('1234567')).not.toBeNull();  // 7 chars
    expect(validatePassword('short')).not.toBeNull();
    expect(validatePassword('')).not.toBeNull();
  });

  test('rejects null/undefined password', () => {
    expect(validatePassword(null)).not.toBeNull();
    expect(validatePassword(undefined)).not.toBeNull();
  });

  test('rejects very long passwords', () => {
    const tooLong = 'a'.repeat(129);
    expect(validatePassword(tooLong)).not.toBeNull();
  });
});

// ── NAME ───────────────────────────────────────────────────────────────────────

describe('validateName', () => {
  test('accepts valid names', () => {
    expect(validateName('Amara Wanjiku')).toBeNull();
    expect(validateName('Jo')).toBeNull();  // 2 chars = min
  });

  test('rejects single character names', () => {
    expect(validateName('A')).not.toBeNull();
  });

  test('rejects empty/null names', () => {
    expect(validateName('')).not.toBeNull();
    expect(validateName(null)).not.toBeNull();
  });
});

// ── DESCRIPTION ────────────────────────────────────────────────────────────────

describe('validateDescription', () => {
  test('accepts valid descriptions', () => {
    expect(validateDescription('Someone threatened me online.')).toBeNull();
    expect(validateDescription('This is a detailed description of the incident that occurred.')).toBeNull();
  });

  test('rejects short descriptions', () => {
    expect(validateDescription('Hi')).not.toBeNull();  // Under 5 chars
    expect(validateDescription('')).not.toBeNull();
  });

  test('rejects descriptions exceeding max length', () => {
    const tooLong = 'a'.repeat(2001);
    expect(validateDescription(tooLong, 2000)).not.toBeNull();
  });
});

// ── SANITIZE ───────────────────────────────────────────────────────────────────

describe('sanitize', () => {
  test('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  test('truncates to maxLen', () => {
    expect(sanitize('hello world', 5)).toBe('hello');
  });

  test('handles null/undefined safely', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });
});

// ── RUN VALIDATORS ─────────────────────────────────────────────────────────────

describe('runValidators', () => {
  test('returns null when all validators pass', () => {
    const result = runValidators(
      () => null,
      () => null,
      () => null,
    );
    expect(result).toBeNull();
  });

  test('returns first error message found', () => {
    const result = runValidators(
      () => null,
      () => 'Second validator failed',
      () => 'Third validator also failed',
    );
    expect(result).toBe('Second validator failed');
  });
});