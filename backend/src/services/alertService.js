const Alert = require('../models/Alert');
const Item = require('../models/Item');
const InventoryBatch = require('../models/InventoryBatch');
const { daysBetween } = require('../utils/date');

const EXPIRY_THRESHOLD_DAYS = Number(process.env.EXPIRY_THRESHOLD_DAYS || 30);

const upsertAlert = async ({ type, severity, message, itemId = null, batchId = null }) => {
  const existing = await Alert.findOne({
    type,
    itemId,
    batchId,
    resolved: false
  });

  if (existing) {
    existing.severity = severity;
    existing.message = message;
    await existing.save();
    return existing;
  }

  return Alert.create({ type, severity, message, itemId, batchId });
};

const recomputeAlerts = async () => {
  const now = new Date();
  const items = await Item.find({ isActive: true }).lean();

  for (const item of items) {
    const batches = await InventoryBatch.find({ itemId: item._id, quantity: { $gt: 0 } }).lean();
    const totalStock = batches
      .filter((batch) => new Date(batch.expiryDate) > now)
      .reduce((sum, batch) => sum + batch.quantity, 0);

    if (totalStock <= item.reorderLevel) {
      const severity = totalStock <= Math.floor(item.reorderLevel * 0.25) ? 'CRITICAL' : 'WARNING';
      const message = `${item.name} is below reorder level (${totalStock}/${item.reorderLevel}).`;
      await upsertAlert({ type: 'LOW_STOCK', severity, message, itemId: item._id });
    }

    for (const batch of batches) {
      const daysToExpiry = daysBetween(now, batch.expiryDate);
      if (daysToExpiry <= 0 || daysToExpiry > EXPIRY_THRESHOLD_DAYS) {
        continue;
      }
      const severity = daysToExpiry <= 7 ? 'CRITICAL' : 'WARNING';
      const message = `${item.name} batch ${batch.batchCode} expires in ${daysToExpiry} day(s).`;
      await upsertAlert({
        type: 'EXPIRY',
        severity,
        message,
        itemId: item._id,
        batchId: batch._id
      });
    }
  }
};

module.exports = { recomputeAlerts, EXPIRY_THRESHOLD_DAYS };
