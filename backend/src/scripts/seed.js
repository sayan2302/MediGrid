const { connectDb } = require('../config/db');
const env = require('../config/env');
const Item = require('../models/Item');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryBatch = require('../models/InventoryBatch');
const UsageHistory = require('../models/UsageHistory');
const { recomputeAlerts } = require('../services/alertService');

const run = async () => {
  await connectDb(env.mongoUri);

  await Promise.all([
    Item.deleteMany({}),
    Vendor.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    InventoryBatch.deleteMany({}),
    UsageHistory.deleteMany({})
  ]);

  const [gloves, syringe] = await Item.create([
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
    }
  ]);

  const vendor = await Vendor.create({
    name: 'Healthline Supplies',
    contactPerson: 'R. Sen',
    phone: '+91-9000000000',
    email: 'ops@healthline.test',
    address: 'Kolkata'
  });

  await InventoryBatch.create([
    {
      itemId: gloves._id,
      batchCode: 'GLV-A1',
      quantity: 12,
      expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    },
    {
      itemId: syringe._id,
      batchCode: 'SYR-B1',
      quantity: 70,
      expiryDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
    }
  ]);

  await PurchaseOrder.create({
    poNumber: 'PO-2026-001',
    vendorId: vendor._id,
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
    createdBy: 'seed-script'
  });

  await UsageHistory.create([
    { itemId: gloves._id, date: new Date('2026-04-10'), consumedQuantity: 8 },
    { itemId: gloves._id, date: new Date('2026-04-11'), consumedQuantity: 9 },
    { itemId: gloves._id, date: new Date('2026-04-12'), consumedQuantity: 10 },
    { itemId: gloves._id, date: new Date('2026-04-13'), consumedQuantity: 9 },
    { itemId: gloves._id, date: new Date('2026-04-14'), consumedQuantity: 11 }
  ]);

  await recomputeAlerts();
  console.log('Seed completed');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
