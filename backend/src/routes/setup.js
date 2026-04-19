const express = require('express');
const Item = require('../models/Item');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryBatch = require('../models/InventoryBatch');
const UsageHistory = require('../models/UsageHistory');
const Alert = require('../models/Alert');
const { recomputeAlerts } = require('../services/alertService');

const router = express.Router();

router.get('/status', async (req, res, next) => {
  try {
    const [items, vendors, batches, purchaseOrders, alerts] = await Promise.all([
      Item.countDocuments({}),
      Vendor.countDocuments({}),
      InventoryBatch.countDocuments({}),
      PurchaseOrder.countDocuments({}),
      Alert.countDocuments({ resolved: false })
    ]);

    res.json({ items, vendors, batches, purchaseOrders, unresolvedAlerts: alerts });
  } catch (error) {
    next(error);
  }
});

router.post('/seed-demo', async (req, res, next) => {
  try {
    const forceReset = Boolean(req.body?.forceReset);

    if (forceReset) {
      await Promise.all([
        Item.deleteMany({}),
        Vendor.deleteMany({}),
        PurchaseOrder.deleteMany({}),
        InventoryBatch.deleteMany({}),
        UsageHistory.deleteMany({}),
        Alert.deleteMany({})
      ]);
    }

    const itemCount = await Item.countDocuments({});
    if (itemCount > 0 && !forceReset) {
      return res.status(200).json({
        message: 'Seed skipped. Data already exists. Use forceReset=true to re-seed.',
        seeded: false
      });
    }

    const [gloves, syringe, saline] = await Item.create([
      {
        name: 'Surgical Gloves',
        sku: 'MED-GLV-001',
        category: 'Consumables',
        unit: 'boxes',
        reorderLevel: 40
      },
      {
        name: 'Sterile Syringe 5ml',
        sku: 'MED-SYR-005',
        category: 'Consumables',
        unit: 'units',
        reorderLevel: 120
      },
      {
        name: 'Saline Bottle 500ml',
        sku: 'MED-SAL-500',
        category: 'Fluids',
        unit: 'units',
        reorderLevel: 60
      }
    ]);

    const [vendorA, vendorB] = await Vendor.create([
      {
        name: 'Healthline Supplies',
        contactPerson: 'R. Sen',
        phone: '+91-9000000000',
        email: 'ops@healthline.test',
        address: 'Kolkata'
      },
      {
        name: 'MediMart Distribution',
        contactPerson: 'S. Das',
        phone: '+91-9888888888',
        email: 'supply@medimart.test',
        address: 'Bengaluru'
      }
    ]);

    await InventoryBatch.create([
      {
        itemId: gloves._id,
        batchCode: 'GLV-A1',
        quantity: 18,
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        itemId: syringe._id,
        batchCode: 'SYR-B1',
        quantity: 85,
        expiryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
      },
      {
        itemId: saline._id,
        batchCode: 'SAL-C1',
        quantity: 44,
        expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      }
    ]);

    await PurchaseOrder.create([
      {
        poNumber: 'PO-2026-001',
        vendorId: vendorA._id,
        lines: [
          {
            itemId: gloves._id,
            quantity: 50,
            unitPrice: 8,
            batchCode: 'GLV-R1',
            expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000)
          }
        ],
        status: 'Submitted',
        createdBy: 'demo-seeder'
      },
      {
        poNumber: 'PO-2026-002',
        vendorId: vendorB._id,
        lines: [
          {
            itemId: saline._id,
            quantity: 80,
            unitPrice: 4,
            batchCode: 'SAL-R2',
            expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
          }
        ],
        status: 'Approved',
        createdBy: 'demo-seeder'
      }
    ]);

    await UsageHistory.create([
      { itemId: gloves._id, date: new Date('2026-04-10'), consumedQuantity: 8 },
      { itemId: gloves._id, date: new Date('2026-04-11'), consumedQuantity: 9 },
      { itemId: gloves._id, date: new Date('2026-04-12'), consumedQuantity: 10 },
      { itemId: gloves._id, date: new Date('2026-04-13'), consumedQuantity: 9 },
      { itemId: gloves._id, date: new Date('2026-04-14'), consumedQuantity: 11 },
      { itemId: saline._id, date: new Date('2026-04-10'), consumedQuantity: 7 },
      { itemId: saline._id, date: new Date('2026-04-11'), consumedQuantity: 8 },
      { itemId: saline._id, date: new Date('2026-04-12'), consumedQuantity: 7 }
    ]);

    await recomputeAlerts();

    return res.status(201).json({ message: 'Demo data seeded successfully', seeded: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
