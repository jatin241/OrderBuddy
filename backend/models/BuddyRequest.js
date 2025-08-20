// models/BuddyRequest.js
const mongoose = require("mongoose");

const buddyRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    
    // Only filled once accepted
    senderContact: {
      email: String,
      phone: String,
    },
    receiverContact: {
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuddyRequest", buddyRequestSchema);
