const express = require('express');
const mongoose = require('mongoose');
const StockOutEvent = require('../models/StockOutEvent');
const UsageHistory = require('../models/UsageHistory');
const InventoryTransaction = require('../models/InventoryTransaction');
const InventoryBatch = require('../models/InventoryBatch');
const ExpiredInventoryLog = require('../models/ExpiredInventoryLog');
const PurchaseOrder = require('../models/PurchaseOrder');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, itemId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    let matchQuery = {};
    if (itemId) {
      matchQuery.itemId = new mongoose.Types.ObjectId(itemId);
    }
    
    // 1. Stock-out Rate
    const stockOutQuery = { ...matchQuery };
    const usageQuery = { ...matchQuery };
    if (dateFilter.$gte) {
      stockOutQuery.timestamp = dateFilter;
      usageQuery.date = dateFilter;
    }
    
    const stockOutCount = await StockOutEvent.countDocuments(stockOutQuery);
    const usageCount = await UsageHistory.countDocuments(usageQuery);
    const totalDemandRequests = stockOutCount + usageCount;
    const stockOutRate = totalDemandRequests > 0 ? (stockOutCount / totalDemandRequests) * 100 : 0;

    // 2. Inventory Turnover Ratio
    const txQuery = { ...matchQuery, type: 'OUT' };
    if (dateFilter.$gte) {
      txQuery.date = dateFilter;
    }
    
    const consumptionResult = await InventoryTransaction.aggregate([
      { $match: txQuery },
      { $group: { _id: null, totalConsumption: { $sum: '$quantity' } } }
    ]);
    const totalConsumption = consumptionResult[0]?.totalConsumption || 0;

    // To get average inventory, we will approximate using current total inventory 
    // as taking daily snapshots is complex retroactively.
    const inventoryResult = await InventoryBatch.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalCurrentStock: { $sum: '$quantity' } } }
    ]);
    const currentStock = inventoryResult[0]?.totalCurrentStock || 0;
    
    // Average inventory = (Opening + Closing) / 2. We use currentStock as proxy if no snapshots exist.
    // In a real system, we'd use daily snapshots. We'll simulate Opening Stock by adding back consumption.
    const openingStock = currentStock + totalConsumption;
    const averageInventory = (openingStock + currentStock) / 2;
    const inventoryTurnover = averageInventory > 0 ? totalConsumption / averageInventory : 0;

    // 3. Expiry Loss Rate
    const expiryQuery = { ...matchQuery };
    if (dateFilter.$gte) {
      expiryQuery.expiryDate = dateFilter;
    }
    const expiredResult = await ExpiredInventoryLog.aggregate([
      { $match: expiryQuery },
      { $group: { _id: null, totalExpiredValue: { $sum: '$value' } } }
    ]);
    const totalExpiredValue = expiredResult[0]?.totalExpiredValue || 0;

    // Total Inventory Value (Proxy: quantity * 10 for simulation, or just use 1000 for demo if empty)
    const totalInventoryValue = currentStock * 10; // Simulated $10 per unit
    const expiryLossRate = (totalInventoryValue + totalExpiredValue) > 0 
      ? (totalExpiredValue / (totalInventoryValue + totalExpiredValue)) * 100 
      : 0;

    // 4. Procurement Cycle Time
    const poQuery = { status: 'Received', submittedAt: { $ne: null }, receivedAt: { $ne: null } };
    if (dateFilter.$gte) {
      poQuery.receivedAt = dateFilter;
    }
    const cycleTimeResult = await PurchaseOrder.aggregate([
      { $match: poQuery },
      {
        $project: {
          cycleTime: { $subtract: ['$receivedAt', '$submittedAt'] } // in milliseconds
        }
      },
      {
        $group: {
          _id: null,
          avgCycleTime: { $avg: '$cycleTime' }
        }
      }
    ]);
    
    // Convert ms to days
    const avgCycleTimeMs = cycleTimeResult[0]?.avgCycleTime || 0;
    const procurementCycleTimeDays = avgCycleTimeMs / (1000 * 60 * 60 * 24);

    res.json({
      stockOutRate: Number(stockOutRate.toFixed(2)),
      inventoryTurnover: Number(inventoryTurnover.toFixed(2)),
      expiryLossRate: Number(expiryLossRate.toFixed(2)),
      procurementCycleTimeDays: Number(procurementCycleTimeDays.toFixed(2)),
      metrics: {
        totalDemandRequests,
        stockOutCount,
        totalConsumption,
        averageInventory,
        totalExpiredValue,
        totalInventoryValue
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
