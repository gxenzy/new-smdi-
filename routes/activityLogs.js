const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/activity-logs
// @desc    Get activity logs with filtering and pagination
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view activity logs' });
    }

    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      userId,
      action,
      module
    } = req.query;

    const query = {};

    // Add filters if provided
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (module) query.module = module;

    // Execute query with pagination
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username firstName lastName');

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/activity-logs
// @desc    Create new activity log
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { action, module, details } = req.body;

    const log = new ActivityLog({
      userId: req.user.id,
      action,
      module,
      details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await log.save();
    res.status(201).json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/activity-logs/stats
// @desc    Get activity statistics
// @access  Private/Admin
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view statistics' });
    }

    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            module: '$module',
            action: '$action',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.day',
          activities: {
            $push: {
              module: '$_id.module',
              action: '$_id.action',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get user activity summary
    const userActivity = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          lastActivity: 1,
          username: { $arrayElemAt: ['$user.username', 0] },
          firstName: { $arrayElemAt: ['$user.firstName', 0] },
          lastName: { $arrayElemAt: ['$user.lastName', 0] }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      dailyStats: stats,
      topUsers: userActivity,
      summary: {
        totalLogs: await ActivityLog.countDocuments(matchStage),
        uniqueUsers: await ActivityLog.distinct('userId', matchStage).length,
        modules: await ActivityLog.distinct('module', matchStage),
        actions: await ActivityLog.distinct('action', matchStage)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/activity-logs
// @desc    Delete old activity logs
// @access  Private/Admin
router.delete('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete logs' });
    }

    const { olderThan } = req.query;
    if (!olderThan) {
      return res.status(400).json({ message: 'olderThan date parameter is required' });
    }

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: new Date(olderThan) }
    });

    res.json({
      message: `Deleted ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
