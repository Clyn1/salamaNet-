/**
 * models/Evidence.js
 * MongoDB schema for evidence items stored in the Evidence Locker.
 * Each evidence item belongs to one user and stores file info + metadata.
 */

const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this evidence
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by userId
    },

    // Original filename of the uploaded file
    fileName: {
      type: String,
      required: true,
    },

    // Path where the file is stored on disk (e.g. "uploads/abc123.jpg")
    filePath: {
      type: String,
      default: null,
    },

    // MIME type, e.g. "image/jpeg", "application/pdf"
    mimeType: {
      type: String,
      default: null,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      default: 0,
    },

    // User's description of the incident
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description too long'],
    },

    // Category of TFGBV incident
    category: {
      type: String,
      enum: [
        'cyberstalking',
        'deepfake',
        'nonconsensual',
        'harassment',
        'threat',
        'other',
      ],
      default: 'other',
    },

    // If this evidence came from a deepfake scan
    isDeepfakeScan: {
      type: Boolean,
      default: false,
    },

    // Result of deepfake analysis (if applicable)
    deepfakeResult: {
      type: String,
      enum: ['real', 'fake', null],
      default: null,
    },

    deepfakeConfidence: {
      type: Number, // 0-100
      default: null,
    },

    // Whether evidence has been reviewed (for legal export)
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt serves as the legal timestamp
  }
);

module.exports = mongoose.model('Evidence', evidenceSchema);
