const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { EnergyReading, DailyEnergyUsage, MonitoringDevice } = require('../models/EnergyMonitoring');

// Get real-time readings for all devices
router.get('/readings/realtime', auth, async (req, res) => {
  try {
    const readings = await EnergyReading.find()
      .sort({ timestamp: -1 })
      .limit(24) // Last 24 readings
      .populate('deviceId');
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching real-time readings', error: error.message });
  }
});

// Get historical data with aggregation
router.get('/readings/historical', auth, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'hour' } = req.query;
    
    const matchStage = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    let groupStage;
    switch (interval) {
      case 'hour':
        groupStage = {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' }
          }
        };
        break;
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          }
        };
        break;
      case 'month':
        groupStage = {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          }
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid interval' });
    }

    // Add aggregation fields
    groupStage = {
      ...groupStage,
      totalConsumption: { $sum: '$consumption' },
      avgVoltage: { $avg: '$voltage' },
      avgCurrent: { $avg: '$current' },
      avgPowerFactor: { $avg: '$powerFactor' },
      maxDemand: { $max: '$consumption' },
      readingCount: { $sum: 1 }
    };

    const aggregatedData = await EnergyReading.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json(aggregatedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching historical data', error: error.message });
  }
});

// Record new energy reading
router.post('/readings', auth, async (req, res) => {
  try {
    const reading = new EnergyReading(req.body);
    await reading.save();

    // Update daily usage
    const date = new Date(reading.timestamp);
    date.setHours(0, 0, 0, 0);

    await DailyEnergyUsage.findOneAndUpdate(
      {
        date,
        deviceId: reading.deviceId
      },
      {
        $push: { readings: reading },
        $inc: { totalConsumption: reading.consumption },
        $max: { peakDemand: reading.consumption },
        $set: {
          averagePowerFactor: await calculateAveragePowerFactor(reading.deviceId, date)
        }
      },
      { upsert: true }
    );

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Error recording reading', error: error.message });
  }
});

// Get device statistics
router.get('/devices/:deviceId/stats', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { period = '24h' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }

    const stats = await EnergyReading.aggregate([
      {
        $match: {
          deviceId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$consumption' },
          avgVoltage: { $avg: '$voltage' },
          avgCurrent: { $avg: '$current' },
          avgPowerFactor: { $avg: '$powerFactor' },
          maxDemand: { $max: '$consumption' },
          minVoltage: { $min: '$voltage' },
          maxVoltage: { $max: '$voltage' },
          readingCount: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching device statistics', error: error.message });
  }
});

// Register new monitoring device
router.post('/devices', auth, async (req, res) => {
  try {
    const device = new MonitoringDevice(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error registering device', error: error.message });
  }
});

// Update device status
router.patch('/devices/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const updates = req.body;
    
    const device = await MonitoringDevice.findOneAndUpdate(
      { deviceId },
      updates,
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error updating device', error: error.message });
  }
});

// Helper function to calculate average power factor
async function calculateAveragePowerFactor(deviceId, date) {
  const readings = await EnergyReading.find({
    deviceId,
    timestamp: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (readings.length === 0) return 0;

  const sum = readings.reduce((acc, reading) => acc + reading.powerFactor, 0);
  return sum / readings.length;
}

module.exports = router;
