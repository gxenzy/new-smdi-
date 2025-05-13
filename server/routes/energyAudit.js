const express = require('express');
const router = express.Router();

// Assuming you have a data model or service to interact with energy audit data
const energyAuditService = require('../services/energyAuditService');
const ActivityLog = require('../models/ActivityLog');

// Endpoint to get energy audit data
router.get('/', async (req, res) => {
  try {
    // For database errors, prevent 500 by returning empty array with error message
    try {
      const data = await energyAuditService.getAllAudits();
      res.json(data);
    } catch (dbError) {
      console.error('Database error fetching energy audit data:', dbError);
      res.json({ 
        data: [], 
        error: 'Database error, please check server configuration',
        message: 'Could not retrieve energy audits'
      });
    }
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
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({ type: 'energyAuditUpdate', data: newAudit }));
        }
      });
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
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({ type: 'energyAuditUpdate', data: updatedAudit }));
        }
      });
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
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({ type: 'energyAuditDelete', data: req.params.id }));
        }
      });
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
    
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({ type: 'activityLog', data: activity }));
        }
      });
    }
    
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    // Placeholder metrics data - replace with actual implementation
    const metrics = {
      totalAudits: 0,
      completedAudits: 0,
      totalFindings: 0,
      criticalFindings: 0,
      potentialSavings: 0,
      implementedSavings: 0,
      energyConsumption: {
        current: 0,
        previous: 0,
        trend: 0,
      }
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
