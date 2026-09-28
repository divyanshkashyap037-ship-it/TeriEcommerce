const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be under 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // This stores the bcrypt hash, never plaintext.
    },
    // buyer can purchase, seller can manage inventory (create/edit/delete).
    // Chosen at registration. Defaults to buyer for old accounts too.
    role: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'buyer',
    },
    // We store a SHA-256 hash of the refresh token, not the raw token.
    // Why: if DB leaks, attacker cannot reuse the raw refresh token.
    refreshToken: {
      type: String,
      default: null,
      select: false, // do not return it by default
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
