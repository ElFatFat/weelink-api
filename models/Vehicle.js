const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who owns the vehicle
  maker: { type: String, required: true }, // Vehicle manufacturer (e.g., "Toyota")
  model: { type: String, required: true }, // Vehicle model (e.g., "Corolla")
  year: { type: Number, required: true }, // Year of manufacture
  license_plate: { type: String, required: true, unique: true }, // License plate number
  vin: { type: String, default: null }, // Vehicle Identification Number (optional but useful for tracking)
  type: { 
    type: String, 
    enum: ['Voiture', 'Moto', 'Camion'],
    required: true,
  },
  mileage: { type: Number }, // Current mileage of the vehicle
  color: { type: String }, // Color of the vehicle
  main_garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' }, // Reference to the main garage for the vehicle
  fuel_type: { 
    type: String, 
    enum: ['Essence', 'Diesel', 'Electrique', 'Hybride'], 
    required: true 
  }, // Fuel type
  created_at: { type: Date, default: Date.now }, // Date the vehicle was added
  updated_at: { type: Date, default: Date.now } // Date the vehicle details were last updated
});

// Middleware to update `updated_at` before saving
VehicleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

VehicleSchema.index({ vin: 1 }, { unique: true, partialFilterExpression: { vin: { $exists: true, $type: 'string' } } });
module.exports = mongoose.model('Vehicle', VehicleSchema);