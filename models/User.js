const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joined_at: { type: Date, default: Date.now },
  last_login: { type: Date },
  isAdmin: { type: Boolean, default: false },
  profile_picture: { type: String, default: 'default.jpg' },
  isBanned: { type: Boolean, default: false },
  token: { type: String }, // Optional: Store the token if needed
  refreshToken: { type: String } // Optional: Store the refresh token if needed
});

// Function to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Function to generate JWT
userSchema.methods.generateJWT = function() {
  const payload = { id: this._id, email: this.email, isAdmin: this.isAdmin };
  const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a secure secret key
  const options = { expiresIn: '1h' }; // Token expiration time
  return jwt.sign(payload, secret, options);
};

// Middleware to hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);