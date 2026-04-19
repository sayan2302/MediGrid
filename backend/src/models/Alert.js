const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['LOW_STOCK', 'EXPIRY'], required: true },
    severity: { type: String, enum: ['CRITICAL', 'WARNING', 'INFO'], required: true },
    message: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryBatch', default: null },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
