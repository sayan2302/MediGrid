const express = require('express');
const { z } = require('zod');
const Item = require('../models/Item');
const InventoryBatch = require('../models/InventoryBatch');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

const itemSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().optional(),
  unit: z.string().optional(),
  reorderLevel: z.number().min(0),
  isActive: z.boolean().optional()
});

router.post('/', async (req, res, next) => {
  try {
    const payload = itemSchema.parse(req.body);
    const item = await Item.create(payload);
    await recomputeAlerts();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const batches = await InventoryBatch.find({ itemId: item._id });
    return res.json({ item, batches });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const payload = itemSchema.partial().parse(req.body);
    const item = await Item.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await recomputeAlerts();
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await InventoryBatch.deleteMany({ itemId: req.params.id });
    await recomputeAlerts();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
