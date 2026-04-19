const express = require('express');
const Alert = require('../models/Alert');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(500);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    alert.resolved = true;
    alert.resolvedAt = new Date();
    await alert.save();
    return res.json(alert);
  } catch (error) {
    return next(error);
  }
});

router.post('/recompute', async (req, res, next) => {
  try {
    await recomputeAlerts();
    return res.json({ message: 'Alerts recomputed' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
