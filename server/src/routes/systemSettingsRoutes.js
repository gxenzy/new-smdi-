const express = require('express');
const { getSystemSettings, updateSystemSettings } = require('../controllers/systemSettingsController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Require admin authentication for all settings routes
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// Settings routes
router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);

module.exports = router; 