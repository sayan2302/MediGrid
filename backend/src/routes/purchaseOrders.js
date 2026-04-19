const express = require('express');
const { z } = require('zod');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Item = require('../models/Item');
const InventoryBatch = require('../models/InventoryBatch');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

const lineSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0).optional(),
  batchCode: z.string().min(2),
  expiryDate: z.string()
});

const poSchema = z.object({
  poNumber: z.string().min(2),
  vendorId: z.string(),
  lines: z.array(lineSchema).min(1),
  remarks: z.string().optional()
});

const editableStatuses = new Set(['Draft', 'Submitted']);

const assertTransition = (current, next) => {
  const allowed = {
    Draft: ['Submitted'],
    Submitted: ['Approved', 'Rejected'],
    Approved: ['Received'],
    Rejected: [],
    Received: []
  };

  return Boolean(allowed[current] && allowed[current].includes(next));
};

const withDetails = (query) =>
  query.populate('vendorId', 'name').populate('lines.itemId', 'name sku');

router.post('/', async (req, res, next) => {
  try {
    const payload = poSchema.parse(req.body);
    const vendor = await Vendor.findById(payload.vendorId);
    if (!vendor) {
      return res.status(400).json({ message: 'Invalid vendorId' });
    }

    for (const line of payload.lines) {
      const item = await Item.findById(line.itemId);
      if (!item) {
        return res.status(400).json({ message: `Invalid itemId in line: ${line.itemId}` });
      }
    }

    const po = await PurchaseOrder.create({
      ...payload,
      createdBy: req.user?.email || 'system'
    });

    return res.status(201).json(po);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const purchaseOrders = await withDetails(PurchaseOrder.find().sort({ createdAt: -1 }));
    return res.json(purchaseOrders);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const po = await withDetails(PurchaseOrder.findById(req.params.id));
    if (!po) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    return res.json(po);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const payload = poSchema.partial().parse(req.body);
    const existing = await PurchaseOrder.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (!editableStatuses.has(existing.status)) {
      return res.status(400).json({ message: 'Only Draft and Submitted POs can be edited' });
    }

    Object.assign(existing, payload);
    await existing.save();
    return res.json(existing);
  } catch (error) {
    return next(error);
  }
});

const transition = (nextStatus) => async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (!assertTransition(po.status, nextStatus)) {
      return res.status(400).json({ message: `Invalid status transition ${po.status} -> ${nextStatus}` });
    }

    po.status = nextStatus;
    if (nextStatus === 'Submitted') po.submittedAt = new Date();
    if (nextStatus === 'Approved') po.approvedAt = new Date();

    if (nextStatus === 'Received') {
      po.receivedAt = new Date();
      for (const line of po.lines) {
        await InventoryBatch.create({
          itemId: line.itemId,
          batchCode: line.batchCode,
          quantity: line.quantity,
          expiryDate: line.expiryDate,
          receivedDate: new Date(),
          sourcePurchaseOrderId: po._id
        });
      }
      await recomputeAlerts();
    }

    await po.save();
    return res.json(po);
  } catch (error) {
    return next(error);
  }
};

router.post('/:id/submit', transition('Submitted'));
router.post('/:id/approve', transition('Approved'));
router.post('/:id/reject', transition('Rejected'));
router.post('/:id/receive', transition('Received'));

module.exports = router;
