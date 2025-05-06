const express = require('express');
const router = express.Router();

// Assuming you have a data model or service to interact with energy audit data
const energyAuditService = require('../services/energyAuditService');

// Endpoint to get energy audit data
router.get('/', async (req, res) => {
  try {
    const data = await energyAuditService.getAllAudits();
    res.json(data);
  } catch (error) {
    console.error('Error fetching energy audit data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to create a new energy audit entry
router.post('/', async (req, res) => {
  try {
    const auditData = req.body;
    const newAudit = await energyAuditService.createAudit(auditData);

    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('energyAuditUpdate', newAudit);
    }

    res.status(201).json(newAudit);
  } catch (error) {
    console.error('Error creating energy audit entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
