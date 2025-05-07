const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  consumption: {
    type: Number,
    required: true,
    min: 0
  },
  voltage: {
    type: Number,
    required: true,
    min: 0
  },
  current: {
    type: Number,
    required: true,
    min: 0
  },
  powerFactor: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  location: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  }
});

const dailyEnergyUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalConsumption: {
    type: Number,
    required: true,
    min: 0
  },
  peakDemand: {
    type: Number,
    required: true,
    min: 0
  },
  averagePowerFactor: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  readings: [energyReadingSchema],
  deviceId: {
    type: String,
    required: true
  }
});

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meter', 'sensor', 'analyzer'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  lastCalibration: {
    type: Date
  },
  specifications: {
    manufacturer: String,
    model: String,
    accuracy: Number,
    measurementRange: {
      voltage: {
        min: Number,
        max: Number
      },
      current: {
        min: Number,
        max: Number
      }
    }
  }
});

const EnergyReading = mongoose.model('EnergyReading', energyReadingSchema);
const DailyEnergyUsage = mongoose.model('DailyEnergyUsage', dailyEnergyUsageSchema);
const MonitoringDevice = mongoose.model('MonitoringDevice', deviceSchema);

module.exports = {
  EnergyReading,
  DailyEnergyUsage,
  MonitoringDevice
};
