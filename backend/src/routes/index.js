const express = require('express');
const items = require('./items');
const inventory = require('./inventory');
const vendors = require('./vendors');
const purchaseOrders = require('./purchaseOrders');
const alerts = require('./alerts');
const dashboard = require('./dashboard');
const ai = require('./ai');
const usage = require('./usage');
const setup = require('./setup');
const kpi = require('./kpi');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'medigrid-backend' });
});

router.use('/items', items);
router.use('/inventory', inventory);
router.use('/vendors', vendors);
router.use('/purchase-orders', purchaseOrders);
router.use('/alerts', alerts);
router.use('/dashboard', dashboard);
router.use('/ai', ai);
router.use('/usage', usage);
router.use('/setup', setup);
router.use('/kpi', kpi);

module.exports = router;
