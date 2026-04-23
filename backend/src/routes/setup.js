const express = require('express');
const Item = require('../models/Item');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryBatch = require('../models/InventoryBatch');
const UsageHistory = require('../models/UsageHistory');
const Alert = require('../models/Alert');
const { recomputeAlerts } = require('../services/alertService');

const StockOutEvent = require('../models/StockOutEvent');
const InventoryTransaction = require('../models/InventoryTransaction');
const ExpiredInventoryLog = require('../models/ExpiredInventoryLog');

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
        Alert.deleteMany({}),
        StockOutEvent.deleteMany({}),
        InventoryTransaction.deleteMany({}),
        ExpiredInventoryLog.deleteMany({})
      ]);
    }

    const itemCount = await Item.countDocuments({});
    if (itemCount > 0 && !forceReset) {
      return res.status(200).json({
        message: 'Seed skipped. Data already exists. Use forceReset=true to re-seed.',
        seeded: false
      });
    }

    const [gloves, syringe, saline, monitor] = await Item.create([
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
      },
      {
        name: 'Patient Monitor',
        sku: 'EQ-PM-009',
        category: 'Equipment',
        unit: 'units',
        reorderLevel: 2
      }
    ]);

    const [vendorA, vendorB, vendorC] = await Vendor.create([
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
      },
      {
        name: 'Global Equips Ltd',
        contactPerson: 'J. Doe',
        phone: '+91-7777777777',
        email: 'info@globalequips.test',
        address: 'Mumbai'
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
      },
      {
        itemId: monitor._id,
        batchCode: 'PM-M9',
        quantity: 5,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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
      },
      {
        poNumber: 'PO-2026-003',
        vendorId: vendorC._id,
        lines: [
          {
            itemId: monitor._id,
            quantity: 2,
            unitPrice: 1500,
            batchCode: 'PM-R1',
            expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
          }
        ],
        status: 'Draft',
        createdBy: 'demo-seeder'
      }
    ]);

    const usageHistory = [];
    const itemsToSeed = [gloves, syringe, saline];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      for (const item of itemsToSeed) {
        const baseUsage = item.name === 'Surgical Gloves' ? 10 : item.name === 'Sterile Syringe 5ml' ? 15 : 5;
        const randomness = Math.floor(Math.random() * 5);
        usageHistory.push({
          itemId: item._id,
          date,
          consumedQuantity: baseUsage + randomness
        });
      }
    }

    await UsageHistory.create(usageHistory);

    const inventoryTransactions = usageHistory.map(usage => ({
      itemId: usage.itemId,
      type: 'OUT',
      quantity: usage.consumedQuantity,
      reference: 'seed',
      date: usage.date
    }));
    await InventoryTransaction.create(inventoryTransactions);

    const inTransactions = [
      { itemId: gloves._id, type: 'IN', quantity: 18, reference: 'seed', date: new Date() },
      { itemId: syringe._id, type: 'IN', quantity: 85, reference: 'seed', date: new Date() },
      { itemId: saline._id, type: 'IN', quantity: 44, reference: 'seed', date: new Date() },
      { itemId: monitor._id, type: 'IN', quantity: 5, reference: 'seed', date: new Date() }
    ];
    await InventoryTransaction.create(inTransactions);

    await StockOutEvent.create([
      { itemId: gloves._id, requestedQty: 100, availableQty: 18, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { itemId: syringe._id, requestedQty: 200, availableQty: 85, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ]);

    await ExpiredInventoryLog.create([
      { itemId: gloves._id, batchCode: 'GLV-OLD', quantity: 20, expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 200 }
    ]);

    await recomputeAlerts();

    return res.status(201).json({ message: 'Demo data seeded successfully', seeded: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
