const mongoose = require('mongoose');

const usageHistorySchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    date: { type: Date, required: true, index: true },
    consumedQuantity: { type: Number, min: 0, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsageHistory', usageHistorySchema);
