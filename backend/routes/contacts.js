/**
 * routes/contacts.js
 * Emergency contacts CRUD — protected routes.
 *
 * GET    /api/contacts         — List all emergency contacts
 * POST   /api/contacts         — Add a new emergency contact
 * PUT    /api/contacts/:index  — Update a contact by its array index
 * DELETE /api/contacts/:index  — Remove a contact
 *
 * Contacts are stored as an array inside the User document.
 * Max 10 contacts per user to keep the SOS message manageable.
 */

const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendSuccess, sendError, sendValidationError, sendNotFound } = require('../utils/responseHelper');
const { sanitize } = require('../utils/validators');

const router = express.Router();
router.use(protect);

const MAX_CONTACTS = 10;

// ── Validate a single contact object ─────────────────────────────────────────
const validateContact = ({ name, phone, relationship }) => {
  if (!name || name.trim().length < 2)
    return 'Contact name must be at least 2 characters.';
  if (!phone || phone.trim().length < 7)
    return 'Please provide a valid phone number.';
  if (name.trim().length > 80)
    return 'Name is too long (max 80 characters).';
  if (phone.trim().length > 20)
    return 'Phone number is too long.';
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contacts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emergencyContacts');
    return sendSuccess(res, {
      contacts: user.emergencyContacts || [],
      count: (user.emergencyContacts || []).length,
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    return sendError(res, 'Failed to fetch contacts.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/contacts
// Add a new emergency contact
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    const validationError = validateContact({ name, phone, relationship });
    if (validationError) return sendValidationError(res, validationError);

    const user = await User.findById(req.user._id);

    if ((user.emergencyContacts || []).length >= MAX_CONTACTS) {
      return sendValidationError(res, `You can have at most ${MAX_CONTACTS} emergency contacts.`);
    }

    const newContact = {
      name: sanitize(name, 80),
      phone: sanitize(phone, 20),
      relationship: sanitize(relationship || 'Contact', 50),
    };

    user.emergencyContacts.push(newContact);
    await user.save();

    return sendSuccess(res, {
      contacts: user.emergencyContacts,
      contact: newContact,
    }, 'Emergency contact added.', 201);

  } catch (err) {
    console.error('Add contact error:', err);
    return sendError(res, 'Failed to add contact.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/contacts/:index
// Update an emergency contact by array index
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const { name, phone, relationship } = req.body;

    const validationError = validateContact({ name, phone, relationship });
    if (validationError) return sendValidationError(res, validationError);

    const user = await User.findById(req.user._id);

    if (isNaN(idx) || idx < 0 || idx >= (user.emergencyContacts || []).length) {
      return sendNotFound(res, 'Contact');
    }

    user.emergencyContacts[idx] = {
      name: sanitize(name, 80),
      phone: sanitize(phone, 20),
      relationship: sanitize(relationship || 'Contact', 50),
    };

    // markModified tells Mongoose the array changed (needed for subdoc arrays)
    user.markModified('emergencyContacts');
    await user.save();

    return sendSuccess(res, { contacts: user.emergencyContacts }, 'Contact updated.');

  } catch (err) {
    console.error('Update contact error:', err);
    return sendError(res, 'Failed to update contact.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/contacts/:index
// Remove a contact by array index
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const user = await User.findById(req.user._id);

    if (isNaN(idx) || idx < 0 || idx >= (user.emergencyContacts || []).length) {
      return sendNotFound(res, 'Contact');
    }

    user.emergencyContacts.splice(idx, 1);
    user.markModified('emergencyContacts');
    await user.save();

    return sendSuccess(res, { contacts: user.emergencyContacts }, 'Contact removed.');

  } catch (err) {
    console.error('Delete contact error:', err);
    return sendError(res, 'Failed to delete contact.');
  }
});

module.exports = router;