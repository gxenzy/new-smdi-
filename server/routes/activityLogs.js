const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLogSQL');
const User = require('../models/UserSQL');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

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

    const where = {};

    // Add filters if provided
    if (startDate && endDate) {
      where.timestamp = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;

    const offset = (page - 1) * limit;
    const { rows: logs, count: total } = await ActivityLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [{ model: User, attributes: ['username', 'firstName', 'lastName'] }],
    });

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
    const { action, module, details, status, metadata } = req.body;

    const log = await ActivityLog.create({
      userId: req.user.id,
      action,
      module,
      details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: status || 'SUCCESS',
      metadata
    });

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

    const where = {};
    if (startDate && endDate) {
      where.timestamp = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // Daily stats
    const dailyStats = await ActivityLog.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'day'],
        'module',
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['day', 'module', 'action'],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']]
    });

    // Top users
    const topUsers = await ActivityLog.findAll({
      where,
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastActivity']
      ],
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['username', 'firstName', 'lastName'] }],
    });

    // Summary
    const totalLogs = await ActivityLog.count({ where });
    const uniqueUsers = await ActivityLog.count({ where, distinct: true, col: 'userId' });
    const modules = await ActivityLog.aggregate ? await ActivityLog.aggregate('module', 'DISTINCT', { plain: false }) : [];
    const actions = await ActivityLog.aggregate ? await ActivityLog.aggregate('action', 'DISTINCT', { plain: false }) : [];

    res.json({
      dailyStats,
      topUsers,
      summary: {
        totalLogs,
        uniqueUsers,
        modules,
        actions
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

    const result = await ActivityLog.destroy({
      where: {
        timestamp: { [Op.lt]: new Date(olderThan) }
      }
    });

    res.json({ deleted: result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
