/**
 * models/User.js
 * MongoDB schema for user accounts.
 * Passwords are hashed with bcrypt before saving.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,           // Remove leading/trailing whitespace
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // No two users can share the same email
      lowercase: true,      // Store email in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // select: false means password won't be returned in queries by default
      select: false,
    },
    // Trusted emergency contacts for SOS alerts
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relationship: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * Pre-save hook: Hash password before saving to database.
 * This runs automatically every time we call user.save().
 * The "function" keyword is important here — arrow functions
 * don't bind "this" correctly in Mongoose hooks.
 */
userSchema.pre('save', async function (next) {
  // Only hash if the password field was actually changed
  if (!this.isModified('password')) return next();

  // bcrypt salt rounds: 12 is a good balance of security vs speed
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compare plain password against stored hash.
 * Called during login to verify credentials.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method: Return user data safe to send to frontend.
 * Removes password from the response object.
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    emergencyContacts: this.emergencyContacts,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
