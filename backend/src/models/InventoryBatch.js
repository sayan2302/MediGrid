const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    batchCode: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true, index: true },
    receivedDate: { type: Date, default: Date.now },
    sourcePurchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
