const express = require('express');
const { getOverview, getAlertDistribution, getStockTrend } = require('../services/dashboardService');

const router = express.Router();

router.get('/overview', async (req, res, next) => {
  try {
    const data = await getOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/charts/alert-distribution', async (req, res, next) => {
  try {
    const data = await getAlertDistribution();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/charts/stock-trend', async (req, res, next) => {
  try {
    const data = await getStockTrend();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
