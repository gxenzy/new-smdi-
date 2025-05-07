const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  manufacturer: String,
  model: String,
  serialNumber: String,
  ratedPower: Number,
  ratedVoltage: Number,
  ratedCurrent: Number,
  efficiency: Number,
  powerFactor: Number,
  operatingTemperature: {
    min: Number,
    max: Number
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm', 'in', 'ft'],
      default: 'mm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb'],
      default: 'kg'
    }
  },
  ipRating: String,
  certifications: [String],
  installationDate: Date,
  warrantyExpiration: Date,
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    interval: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years'],
        default: 'months'
      }
    }
  }
});

const maintenanceLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['INSPECTION', 'REPAIR', 'REPLACEMENT', 'CLEANING', 'CALIBRATION'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  findings: String,
  actions: String,
  parts: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  nextMaintenanceDate: Date,
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

const electricalSystemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'LIGHTING',
      'POWER_OUTLET',
      'HVAC',
      'MOTOR',
      'TRANSFORMER',
      'PANEL_BOARD',
      'UPS',
      'GENERATOR',
      'CAPACITOR_BANK',
      'SWITCHGEAR',
      'OTHER'
    ]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  specifications: {
    type: specificationSchema,
    required: true
  },
  load: {
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
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT'],
    default: 'ACTIVE'
  },
  maintenanceLogs: [maintenanceLogSchema],
  realTimeData: {
    lastUpdate: Date,
    voltage: Number,
    current: Number,
    powerFactor: Number,
    temperature: Number,
    energyConsumption: Number,
    runningHours: Number
  },
  alerts: [{
    type: {
      type: String,
      enum: ['WARNING', 'FAULT', 'MAINTENANCE_DUE'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date
  }],
  dependencies: [{
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ElectricalSystem'
    },
    relationship: {
      type: String,
      enum: ['POWERS', 'CONTROLLED_BY', 'PROTECTS', 'FEEDS_TO'],
      required: true
    }
  }],
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['MANUAL', 'SCHEMATIC', 'DATASHEET', 'CERTIFICATE', 'REPORT', 'OTHER']
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: Date
}, {
  timestamps: true
});

// Indexes
electricalSystemSchema.index({ name: 1 });
electricalSystemSchema.index({ type: 1 });
electricalSystemSchema.index({ location: 1 });
electricalSystemSchema.index({ status: 1 });
electricalSystemSchema.index({ 'specifications.manufacturer': 1 });
electricalSystemSchema.index({ 'specifications.installationDate': 1 });
electricalSystemSchema.index({ 'maintenanceLogs.date': -1 });

// Virtual for total maintenance cost
electricalSystemSchema.virtual('totalMaintenanceCost').get(function() {
  return this.maintenanceLogs.reduce((total, log) => {
    return total + (log.parts || []).reduce((partTotal, part) => {
      return partTotal + (part.cost * part.quantity);
    }, 0);
  }, 0);
});

// Method to schedule maintenance
electricalSystemSchema.methods.scheduleMaintenance = function(date) {
  if (!this.specifications.maintenanceSchedule) {
    this.specifications.maintenanceSchedule = {};
  }
  this.specifications.maintenanceSchedule.nextMaintenance = date;
  return this.save();
};

// Method to add maintenance log
electricalSystemSchema.methods.addMaintenanceLog = function(logData) {
  this.maintenanceLogs.push(logData);
  if (this.specifications.maintenanceSchedule) {
    this.specifications.maintenanceSchedule.lastMaintenance = logData.date;
  }
  return this.save();
};

// Method to add alert
electricalSystemSchema.methods.addAlert = function(alertData) {
  this.alerts.push(alertData);
  return this.save();
};

// Method to acknowledge alert
electricalSystemSchema.methods.acknowledgeAlert = function(alertId, userId) {
  const alert = this.alerts.id(alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
  }
  return this.save();
};

// Method to update real-time data
electricalSystemSchema.methods.updateRealTimeData = function(data) {
  this.realTimeData = {
    ...this.realTimeData,
    ...data,
    lastUpdate: new Date()
  };
  return this.save();
};

const ElectricalSystem = mongoose.model('ElectricalSystem', electricalSystemSchema);

module.exports = ElectricalSystem;
