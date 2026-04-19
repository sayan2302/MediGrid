const mongoose = require('mongoose');

const purchaseOrderLineSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
    batchCode: { type: String, trim: true, default: '' },
    expiryDate: { type: Date, required: true }
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lines: { type: [purchaseOrderLineSchema], default: [] },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Received'],
      default: 'Draft'
    },
    remarks: { type: String, trim: true, default: '' },
    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    createdBy: { type: String, trim: true, default: 'system' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
