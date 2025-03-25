const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const GarageSchema = new mongoose.Schema({
  name : { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  images: { type: [String] },
  description: { type: String },
  horaires: [
    {
      day: { type: String, required: true }, // e.g., "Monday", "Tuesday"
      open: { type: String, required: true }, // e.g., "09:00"
      close: { type: String, required: true }, // e.g., "18:00"
      closed: { type: Boolean, default: false } // Optional: for days the garage is closed
    }
  ],
  services: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: false } // Price can be null for services that might be vehicle dependant.
    }
  ],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  isPermanentClosed: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
});

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Garage', GarageSchema);