const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Make optional for Google users
  profileImageUrl: { type: String, default: null },
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
}, { timestamps: true });

// Hash password before saving (only if password exists)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords (only for local auth)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);