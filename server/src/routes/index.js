const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const systemSettingsRoutes = require('./systemSettingsRoutes');
const auditTaskRoutes = require('./auditTaskRoutes');

// Apply routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin/settings', systemSettingsRoutes);
router.use('/audit/tasks', auditTaskRoutes);

// Default route for API status
router.get('/', (req, res) => {
  res.json({ 
    status: 'API is running', 
    message: 'Energy Audit System API'
  });
});

module.exports = router; 