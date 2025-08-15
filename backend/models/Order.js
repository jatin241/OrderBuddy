const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurant: { type: String, required: true },
  items: [{ type: String, required: true }],
  deliveryTime: { type: String }, // e.g., "30 mins"
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String } // new field to store human-readable address
  }
}, { timestamps: true });

// Create a 2dsphere index for location to support geo queries
orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
