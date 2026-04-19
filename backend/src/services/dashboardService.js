const Item = require('../models/Item');
const InventoryBatch = require('../models/InventoryBatch');
const PurchaseOrder = require('../models/PurchaseOrder');
const Alert = require('../models/Alert');

const getOverview = async () => {
  const totalItems = await Item.countDocuments({ isActive: true });
  const pendingPurchaseOrders = await PurchaseOrder.countDocuments({ status: { $in: ['Draft', 'Submitted', 'Approved'] } });
  const unresolvedAlerts = await Alert.countDocuments({ resolved: false });

  const now = new Date();
  const batches = await InventoryBatch.find({ quantity: { $gt: 0 } }).lean();
  const expiringItemsSet = new Set();
  batches.forEach((batch) => {
    const days = (new Date(batch.expiryDate) - now) / (1000 * 60 * 60 * 24);
    if (days >= 0 && days <= Number(process.env.EXPIRY_THRESHOLD_DAYS || 30)) {
      expiringItemsSet.add(String(batch.itemId));
    }
  });

  const lowStockItems = await Alert.countDocuments({ type: 'LOW_STOCK', resolved: false });

  return {
    totalItems,
    lowStockItems,
    expiringItems: expiringItemsSet.size,
    pendingPurchaseOrders,
    unresolvedAlerts
  };
};

const getAlertDistribution = async () => {
  const rows = await Alert.aggregate([
    { $match: { resolved: false } },
    { $group: { _id: '$severity', count: { $sum: 1 } } }
  ]);

  return rows.map((row) => ({ severity: row._id, count: row.count }));
};

const getStockTrend = async () => {
  const rows = await InventoryBatch.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        stockAdded: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return rows.map((row) => ({
    period: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
    stockAdded: row.stockAdded
  }));
};

module.exports = { getOverview, getAlertDistribution, getStockTrend };
