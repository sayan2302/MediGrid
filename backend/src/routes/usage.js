const express = require('express');
const { z } = require('zod');
const UsageHistory = require('../models/UsageHistory');
const Item = require('../models/Item');
const InventoryBatch = require('../models/InventoryBatch');
const StockOutEvent = require('../models/StockOutEvent');
const InventoryTransaction = require('../models/InventoryTransaction');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

const usageSchema = z.object({
  itemId: z.string(),
  date: z.string(),
  consumedQuantity: z.number().min(0)
});

router.post('/', async (req, res, next) => {
  try {
    const payload = usageSchema.parse(req.body);
    const item = await Item.findById(payload.itemId);
    if (!item) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }

    const now = new Date();
    const batches = await InventoryBatch.find({
      itemId: payload.itemId,
      expiryDate: { $gt: now },
      quantity: { $gt: 0 }
    }).sort({ expiryDate: 1 });

    const availableQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);

    if (payload.consumedQuantity > availableQuantity) {
      await StockOutEvent.create({
        itemId: payload.itemId,
        requestedQty: payload.consumedQuantity,
        availableQty: availableQuantity,
        timestamp: payload.date || now
      });
      return res.status(400).json({ message: 'Insufficient stock. Stock-out event logged.' });
    }

    let remainingToConsume = payload.consumedQuantity;
    for (let batch of batches) {
      if (remainingToConsume <= 0) break;
      if (batch.quantity <= remainingToConsume) {
        remainingToConsume -= batch.quantity;
        batch.quantity = 0;
      } else {
        batch.quantity -= remainingToConsume;
        remainingToConsume = 0;
      }
      await batch.save();
    }

    const usage = await UsageHistory.create(payload);

    await InventoryTransaction.create({
      itemId: payload.itemId,
      type: 'OUT',
      quantity: payload.consumedQuantity,
      reference: usage._id.toString(),
      date: payload.date || now
    });

    await recomputeAlerts();

    return res.status(201).json(usage);
  } catch (error) {
    return next(error);
  }
});

router.get('/:itemId', async (req, res, next) => {
  try {
    const rows = await UsageHistory.find({ itemId: req.params.itemId }).sort({ date: 1 });
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
