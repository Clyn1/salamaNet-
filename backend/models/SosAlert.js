/**
 * models/SosAlert.js
 * MongoDB schema for SOS emergency alerts.
 * Stores who sent the alert, when, and simulated location.
 */

const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    // Reference to the user who triggered the SOS
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Simulated GPS coordinates (in production, from browser Geolocation API)
    location: {
      latitude: { type: Number, default: -1.2921 },  // Default: Nairobi
      longitude: { type: Number, default: 36.8219 },
      accuracy: { type: Number, default: 50 },        // Meters
      address: { type: String, default: 'Nairobi, Kenya (simulated)' },
    },

    // Contacts who received the alert
    contactsNotified: [
      {
        name: String,
        phone: String,
        notifiedAt: { type: Date, default: Date.now },
      },
    ],

    // Delivery status (simulated in MVP)
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent',
    },

    // Optional message included in the alert
    message: {
      type: String,
      default: 'I need help! Please check on me immediately.',
    },

    // Whether emergency services were also contacted
    emergencyServicesContacted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt = exact time of alert
  }
);

module.exports = mongoose.model('SosAlert', sosAlertSchema);
