const express = require('express');
const { z } = require('zod');
const InventoryBatch = require('../models/InventoryBatch');
const Item = require('../models/Item');
const InventoryTransaction = require('../models/InventoryTransaction');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

const batchSchema = z.object({
  itemId: z.string(),
  batchCode: z.string().min(2),
  quantity: z.number().min(0),
  expiryDate: z.string(),
  receivedDate: z.string().optional(),
  sourcePurchaseOrderId: z.string().optional().nullable()
});

router.post('/batches', async (req, res, next) => {
  try {
    const payload = batchSchema.parse(req.body);
    const item = await Item.findById(payload.itemId);
    if (!item) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    const batch = await InventoryBatch.create(payload);

    await InventoryTransaction.create({
      itemId: payload.itemId,
      type: 'IN',
      quantity: payload.quantity,
      reference: batch._id.toString(),
      date: payload.receivedDate || new Date()
    });

    await recomputeAlerts();
    return res.status(201).json(batch);
  } catch (error) {
    return next(error);
  }
});

router.get('/batches', async (req, res, next) => {
  try {
    const batches = await InventoryBatch.find().populate('itemId', 'name sku').sort({ createdAt: -1 });
    return res.json(batches);
  } catch (error) {
    return next(error);
  }
});

router.get('/batches/:id', async (req, res, next) => {
  try {
    const batch = await InventoryBatch.findById(req.params.id).populate('itemId', 'name sku');
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    return res.json(batch);
  } catch (error) {
    return next(error);
  }
});

router.patch('/batches/:id', async (req, res, next) => {
  try {
    const payload = batchSchema.partial().parse(req.body);
    const batch = await InventoryBatch.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    await recomputeAlerts();
    return res.json(batch);
  } catch (error) {
    return next(error);
  }
});

router.delete('/batches/:id', async (req, res, next) => {
  try {
    const batch = await InventoryBatch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    await recomputeAlerts();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    const now = new Date();
    const rows = await InventoryBatch.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      {
        $group: {
          _id: '$itemId',
          totalQuantity: {
            $sum: {
              $cond: [{ $gt: ['$expiryDate', now] }, '$quantity', 0]
            }
          },
          batchCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          _id: 0,
          itemId: '$item._id',
          name: '$item.name',
          sku: '$item.sku',
          reorderLevel: '$item.reorderLevel',
          totalQuantity: 1,
          batchCount: 1
        }
      }
    ]);

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
