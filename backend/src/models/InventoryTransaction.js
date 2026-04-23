const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now, index: true },
    reference: { type: String, trim: true, default: '' } // Optional e.g., PO ID or Usage ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
