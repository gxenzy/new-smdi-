const express = require('express');
const router = express.Router();

// Assuming you have a data model or service to interact with energy audit data
const energyAuditService = require('../services/energyAuditService');
const ActivityLog = require('../models/ActivityLog');

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

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const audit = await energyAuditService.getAuditById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    res.json(audit);
  } catch (error) {
    console.error('Error fetching audit by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT (update)
router.put('/:id', async (req, res) => {
  try {
    const updatedAudit = await energyAuditService.updateAudit(req.params.id, req.body);
    if (!updatedAudit) return res.status(404).json({ message: 'Audit not found' });
    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('energyAuditUpdate', updatedAudit);
    }
    res.json(updatedAudit);
  } catch (error) {
    console.error('Error updating audit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await energyAuditService.deleteAudit(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Audit not found' });
    // Emit real-time update event via websocket
    const io = req.app.get('io');
    if (io) {
      io.emit('energyAuditDelete', req.params.id);
    }
    res.json({ message: 'Audit deleted' });
  } catch (error) {
    console.error('Error deleting audit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/activity', async (req, res) => {
  try {
    const activity = await ActivityLog.create(req.body);
    req.app.get('io').emit('activityLog', activity);
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
