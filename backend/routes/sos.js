/**
 * routes/sos.js
 * SOS Emergency Alert routes — protected (require JWT).
 *
 * POST /api/sos       — Trigger an emergency alert
 * GET  /api/sos       — Get alert history for current user
 */

const express = require('express');
const SosAlert = require('../models/SosAlert');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect); // All SOS routes require authentication

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sos
// Trigger an emergency SOS alert
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, accuracy, message } = req.body;

    // Get the user's emergency contacts from their profile
    const user = await User.findById(req.user._id);
    const contacts = user.emergencyContacts || [];

    // Default contacts if none are saved
    const defaultContacts = [
      { name: 'Befrienders Kenya', phone: '0800 723 253' },
      { name: 'Gender Violence Helpline', phone: '0800 720 592' },
    ];

    const contactsToNotify = contacts.length > 0 ? contacts : defaultContacts;

    // Build alert record
    const alertData = {
      userId: req.user._id,
      location: {
        latitude: latitude || -1.2921,    // Default: Nairobi CBD
        longitude: longitude || 36.8219,
        accuracy: accuracy || 50,
        address: 'Kenya (location approximated)',
      },
      contactsNotified: contactsToNotify.map((c) => ({
        name: c.name,
        phone: c.phone,
        notifiedAt: new Date(),
      })),
      message: message || 'I need help! Please check on me immediately.',
      status: 'sent',
    };

    const alert = await SosAlert.create(alertData);

    // ── SIMULATE SENDING SMS ─────────────────────────────────────────────────
    // In production, integrate with Africa's Talking SMS API or Twilio:
    //
    //   const AfricasTalking = require('africastalking');
    //   const at = AfricasTalking({ apiKey: process.env.AT_API_KEY, username: process.env.AT_USERNAME });
    //   await at.SMS.send({
    //     to: contactsToNotify.map(c => c.phone),
    //     message: `🚨 SOS from ${user.name}! They need help. Location: ${googleMapsLink}`,
    //   });
    //
    // For now, we log to console:
    console.log(`\n🚨 SOS ALERT TRIGGERED`);
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Location: lat ${alertData.location.latitude}, lng ${alertData.location.longitude}`);
    console.log(`Notifying ${contactsToNotify.length} contacts:`);
    contactsToNotify.forEach((c) => console.log(`  → ${c.name}: ${c.phone}`));
    console.log('');

    res.status(201).json({
      message: 'SOS alert sent successfully',
      alert,
      contactsNotified: contactsToNotify.length,
    });

  } catch (err) {
    console.error('SOS alert error:', err);
    res.status(500).json({ error: 'Failed to send SOS alert. Please call 999 directly.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sos
// Get alert history for the current user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const alerts = await SosAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Last 20 alerts

    res.json({
      count: alerts.length,
      alerts,
    });

  } catch (err) {
    console.error('Get SOS history error:', err);
    res.status(500).json({ error: 'Failed to fetch alert history.' });
  }
});

module.exports = router;
