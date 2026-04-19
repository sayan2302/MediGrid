const express = require('express');
const axios = require('axios');
const env = require('../config/env');
const UsageHistory = require('../models/UsageHistory');

const router = express.Router();

router.post('/forecast-demand', async (req, res, next) => {
  try {
    const { itemId, horizonDays = 14 } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }

    const history = await UsageHistory.find({ itemId }).sort({ date: 1 }).lean();
    const payload = {
      itemId,
      horizonDays,
      usageHistory: history.map((row) => ({
        date: row.date,
        consumedQuantity: row.consumedQuantity
      }))
    };

    const response = await axios.post(`${env.aiServiceUrl}/forecast-demand`, payload, { timeout: 30000 });
    return res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return next(error);
  }
});

router.post('/expiry-risk', async (req, res, next) => {
  try {
    const response = await axios.post(`${env.aiServiceUrl}/expiry-risk`, req.body, { timeout: 30000 });
    return res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return next(error);
  }
});

module.exports = router;
