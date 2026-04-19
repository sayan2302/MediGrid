const express = require('express');
const { z } = require('zod');
const UsageHistory = require('../models/UsageHistory');
const Item = require('../models/Item');

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
    const usage = await UsageHistory.create(payload);
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
