const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE',
      'UPDATE',
      'DELETE',
      'VIEW',
      'EXPORT',
      'IMPORT',
      'AUDIT',
      'TEST',
      'CONFIGURE',
      'ANALYZE'
    ]
  },
  module: {
    type: String,
    required: true,
    enum: [
      'AUTH',
      'USER',
      'ELECTRICAL_SYSTEM',
      'ENERGY_AUDIT',
      'SYSTEM_TOOLS',
      'TESTING',
      'TAM_EVALUATION',
      'SETTINGS',
      'ADMIN'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING'],
    default: 'SUCCESS'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, action: 1 });
activityLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs (e.g., after 90 days)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this({
      userId: data.userId,
      action: data.action,
      module: data.module,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'SUCCESS',
      metadata: data.metadata
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Static method to get user activity summary
activityLogSchema.statics.getUserActivitySummary = async function(userId, startDate, endDate) {
  try {
    const matchStage = { userId: mongoose.Types.ObjectId(userId) };
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            module: '$module',
            action: '$action'
          },
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $group: {
          _id: '$_id.module',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count',
              lastActivity: '$lastActivity'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    return summary;
  } catch (error) {
    console.error('Error getting user activity summary:', error);
    throw error;
  }
};

// Static method to get system activity metrics
activityLogSchema.statics.getSystemMetrics = async function(startDate, endDate) {
  try {
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const metrics = await this.aggregate([
      { $match: matchStage },
      {
        $facet: {
          moduleStats: [
            {
              $group: {
                _id: '$module',
                count: { $sum: 1 },
                successCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
                },
                failureCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] }
                }
              }
            }
          ],
          timeStats: [
            {
              $group: {
                _id: {
                  year: { $year: '$timestamp' },
                  month: { $month: '$timestamp' },
                  day: { $dayOfMonth: '$timestamp' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          userStats: [
            {
              $group: {
                _id: '$userId',
                count: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    return metrics[0];
  } catch (error) {
    console.error('Error getting system metrics:', error);
    throw error;
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
