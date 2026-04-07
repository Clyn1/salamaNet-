/**
 * routes/detector.js
 * Deepfake detection route — protected (require JWT).
 *
 * POST /api/detector/scan — Analyze an uploaded file for deepfakes
 *
 * MVP NOTE: This is a simulated detection engine.
 * In production, integrate with a real ML model such as:
 *   - Sensity.ai API
 *   - Microsoft Video Authenticator
 *   - FaceForensics++ model
 *   - Hugging Face deepfake detection models
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Evidence = require('../models/Evidence');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Store scan files temporarily, then delete after analysis
const upload = multer({
  dest: path.join(__dirname, '../uploads/temp'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images and videos are supported'));
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/detector/scan
// Upload a file and receive deepfake analysis results
// ─────────────────────────────────────────────────────────────────────────────
router.post('/scan', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Simulate processing time (real models take 2-10 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // ── SIMULATED DETECTION ENGINE ────────────────────────────────────────────
    // Rule-based heuristics for MVP simulation:
    //   1. Check filename for suspicious keywords
    //   2. Check file size patterns
    //   3. Random baseline with weighted probability
    //
    // In production, replace this block with your ML model API call.

    const fileName = req.file.originalname.toLowerCase();
    const fileSize = req.file.size;

    // Suspicious filename keywords that might indicate a deepfake
    const suspiciousKeywords = ['deepfake', 'fake', 'edited', 'modified', 'ai', 'generated', 'swap', 'altered', 'synthetic'];
    const hasSuspiciousName = suspiciousKeywords.some((kw) => fileName.includes(kw));

    // Very small or very large files can sometimes indicate processing artifacts
    const unusualSize = fileSize < 5000 || fileSize > 10 * 1024 * 1024;

    // Weighted probability: ~35% base fake rate + boosts for suspicious signals
    let fakeScore = Math.random();
    if (hasSuspiciousName) fakeScore += 0.4;
    if (unusualSize) fakeScore += 0.1;

    const isFake = fakeScore > 0.65; // Threshold

    // Generate confidence score
    const confidence = isFake
      ? Math.round(65 + Math.random() * 25) // 65-90%
      : Math.round(75 + Math.random() * 20); // 75-95%

    // Individual analysis checks
    const checks = {
      pixelPatterns: isFake ? (Math.random() > 0.3 ? 'anomalous' : 'mixed') : 'normal',
      facialLandmarks: isFake ? 'inconsistent' : 'consistent',
      compressionArtifacts: Math.random() > 0.5 ? (isFake ? 'unusual' : 'natural') : 'mixed',
      metadataIntegrity: isFake ? (Math.random() > 0.4 ? 'suspicious' : 'missing') : 'intact',
      ganFingerprint: isFake ? (Math.random() > 0.3 ? 'detected' : 'possible') : 'not_detected',
    };

    const result = {
      verdict: isFake ? 'potential_deepfake' : 'likely_authentic',
      confidence,
      label: isFake ? 'Potential Deepfake' : 'Likely Real',
      checks,
      fileName: req.file.originalname,
      fileSize,
      analyzedAt: new Date().toISOString(),
    };

    // ── AUTO-SAVE TO EVIDENCE LOCKER ─────────────────────────────────────────
    // Move the temp file to the permanent uploads directory
    const permanentPath = path.join(__dirname, '../uploads', req.file.filename);
    fs.renameSync(req.file.path, permanentPath);

    await Evidence.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      description: `Deepfake scan result: ${result.label} (${confidence}% confidence)`,
      category: 'deepfake',
      isDeepfakeScan: true,
      deepfakeResult: isFake ? 'fake' : 'real',
      deepfakeConfidence: confidence,
    });

    res.json({
      message: 'Analysis complete',
      result,
      savedToLocker: true,
    });

  } catch (err) {
    console.error('Detector error:', err);
    // Clean up temp file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

module.exports = router;