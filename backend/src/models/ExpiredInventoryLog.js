const mongoose = require('mongoose');

const expiredInventoryLogSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    batchCode: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true, index: true },
    value: { type: Number, default: 0, min: 0 } // Estimated lost value
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpiredInventoryLog', expiredInventoryLogSchema);
