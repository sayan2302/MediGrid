const mongoose = require('mongoose');

const stockOutEventSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    requestedQty: { type: Number, required: true },
    availableQty: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockOutEvent', stockOutEventSchema);
