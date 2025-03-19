const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user making the reservation
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true }, // Reference to the garage
  isPaid: { type: Boolean, default: false }, // Whether the reservation has been paid
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // Reference to the transaction
  service: [
    {
      name: { type: String, required: true }, // Name of the service reserved
      price: { type: Number, required: true } // Price of the service reserved
    }
  ],
  reservation_date: { type: Date, required: true }, // Date and time of the reservation
  status: { 
    type: String, 
    enum: ['En attente', 'Confirmé', 'Annulé', 'Completé'], 
    default: 'En attente' 
  }, // Status of the reservation
  notes: { type: String } // Optional notes about the reservation
});

module.exports = mongoose.model('Reservation', ReservationSchema);