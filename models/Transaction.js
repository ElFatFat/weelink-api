const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user making the transaction
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true }, // Reference to the garage
  service: { type: String, required: true }, // Name of the service purchased
  amount: { type: Number, required: true }, // Transaction amount
  payment_method: { type: String, required: true }, // e.g., "Credit Card", "PayPal", "Cash"
  status: { 
    type: String, 
    enum: ['En attente', 'Completée', 'Echouée', 'Rembourssée'], 
    default: 'En attente' 
  }, // Status of the transaction
  transaction_date: { type: Date, default: Date.now }, // Date of the transaction
  reference_id: { type: String, unique: true, required: true }, // Unique transaction reference ID
  notes: { type: String } // Optional notes about the transaction
});

module.exports = mongoose.model('Transaction', TransactionSchema);