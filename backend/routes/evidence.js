/**
 * routes/evidence.js
 * Evidence Locker routes — protected (require JWT).
 *
 * POST /api/evidence       — Upload and store new evidence
 * GET  /api/evidence       — Get all evidence for logged-in user
 * GET  /api/evidence/:id   — Get single evidence item
 * DELETE /api/evidence/:id — Delete evidence item
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Evidence = require('../models/Evidence');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── FILE UPLOAD CONFIG ───────────────────────────────────────────────────────

// Configure where and how uploaded files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File type filter — only allow safe file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('File type not allowed. Supported: images, videos, PDF, Word docs'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// ─── ALL ROUTES BELOW ARE PROTECTED ──────────────────────────────────────────
// The protect middleware runs first on every route in this file
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/evidence
// Upload new evidence file with description and category
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { description, category, isDeepfakeScan, deepfakeResult, deepfakeConfidence } = req.body;

    if (!description) {
      // Clean up uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Description is required' });
    }

    // Build evidence object
    const evidenceData = {
      userId: req.user._id,
      description,
      category: category || 'other',
      isDeepfakeScan: isDeepfakeScan === 'true',
      deepfakeResult: deepfakeResult || null,
      deepfakeConfidence: deepfakeConfidence ? Number(deepfakeConfidence) : null,
    };

    // Add file info if a file was uploaded
    if (req.file) {
      evidenceData.fileName = req.file.originalname;
      evidenceData.filePath = req.file.filename; // Relative path within /uploads
      evidenceData.mimeType = req.file.mimetype;
      evidenceData.fileSize = req.file.size;
    } else {
      evidenceData.fileName = 'Text record';
    }

    const evidence = await Evidence.create(evidenceData);

    res.status(201).json({
      message: 'Evidence secured successfully',
      evidence,
    });

  } catch (err) {
    console.error('Upload evidence error:', err);
    if (req.file) fs.unlinkSync(req.file.path); // Clean up on error
    res.status(500).json({ error: 'Failed to save evidence. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/evidence
// Fetch all evidence belonging to the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Sort by newest first; userId filter ensures data isolation between users
    const items = await Evidence.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      count: items.length,
      evidence: items,
    });

  } catch (err) {
    console.error('Get evidence error:', err);
    res.status(500).json({ error: 'Failed to fetch evidence.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/evidence/:id
// Get a single evidence item (must belong to current user)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id, // Security: ensure user owns this evidence
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json({ evidence });

  } catch (err) {
    console.error('Get single evidence error:', err);
    res.status(500).json({ error: 'Failed to fetch evidence.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/evidence/:id
// Delete an evidence item (only owner can delete)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Delete the physical file from disk
    if (evidence.filePath) {
      const filePath = path.join(__dirname, '../uploads', evidence.filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await evidence.deleteOne();

    res.json({ message: 'Evidence deleted' });

  } catch (err) {
    console.error('Delete evidence error:', err);
    res.status(500).json({ error: 'Failed to delete evidence.' });
  }
});

// Handle multer file size errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;