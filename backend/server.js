/**
 * SalamaNet Backend — server.js (v2 - FIXED)
 * Entry point with full security, logging, and graceful shutdown.
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { applySecurityMiddleware, authLimiter, sosLimiter, uploadLimiter } = require('./middleware/security');
const { requestLogger } = require('./middleware/requestLogger');

const authRoutes     = require('./routes/auth');
const evidenceRoutes = require('./routes/evidence');
const sosRoutes      = require('./routes/sos');
const detectorRoutes = require('./routes/detector');
const reportRoutes   = require('./routes/report');
const contactRoutes  = require('./routes/contacts');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
applySecurityMiddleware(app);

// CORS config
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logger
app.use(requestLogger);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',     authLimiter,   authRoutes);
app.use('/api/evidence', uploadLimiter, evidenceRoutes);
app.use('/api/sos',      sosLimiter,    sosRoutes);
app.use('/api/detector', uploadLimiter, detectorRoutes);
app.use('/api/report',                 reportRoutes);
app.use('/api/contacts',               contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SalamaNet API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ✅ FIXED: Catch-all 404 handler (REMOVED "*")
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err.stack);
  } else {
    console.error(`Error ${statusCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
  });
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salamanet')
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`\n🛡️  SalamaNet API → http://localhost:${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/api/health\n`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;
