const cron = require('node-cron');
const InventoryBatch = require('../models/InventoryBatch');
const ExpiredInventoryLog = require('../models/ExpiredInventoryLog');
const { recomputeAlerts } = require('../services/alertService');

const initCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily expiry check...');
    try {
      const now = new Date();
      const expiredBatches = await InventoryBatch.find({
        expiryDate: { $lt: now },
        quantity: { $gt: 0 }
      });

      if (expiredBatches.length === 0) {
        console.log('[CRON] No expired batches found.');
        return;
      }

      let totalExpired = 0;
      for (const batch of expiredBatches) {
        // Value estimation: $10 per unit proxy
        const estimatedValue = batch.quantity * 10;
        
        await ExpiredInventoryLog.create({
          itemId: batch.itemId,
          batchCode: batch.batchCode,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          value: estimatedValue
        });

        batch.quantity = 0;
        await batch.save();
        totalExpired++;
      }

      await recomputeAlerts();
      console.log(`[CRON] Processed ${totalExpired} expired batches.`);
    } catch (error) {
      console.error('[CRON] Error processing expired batches:', error);
    }
  });
  
  console.log('[CRON] Jobs initialized.');
};

module.exports = { initCronJobs };
