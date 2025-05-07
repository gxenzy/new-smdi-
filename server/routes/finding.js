const express = require('express');
const router = express.Router();
const findingService = require('../services/findingService');

// GET all findings
router.get('/', async (req, res) => {
  try {
    const findings = await findingService.getAllFindings();
    res.json(findings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET finding by ID
router.get('/:id', async (req, res) => {
  try {
    const finding = await findingService.getFindingById(req.params.id);
    if (!finding) return res.status(404).json({ message: 'Finding not found' });
    res.json(finding);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET findings by audit ID
router.get('/audit/:auditId', async (req, res) => {
  try {
    const findings = await findingService.getFindingsByAuditId(req.params.auditId);
    res.json(findings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST create finding
router.post('/', async (req, res) => {
  try {
    const newFinding = await findingService.createFinding(req.body);
    const io = req.app.get('io');
    if (io) io.emit('findingUpdate', newFinding);
    io.emit('newFinding', newFinding);
    req.app.get('io').emit('notification', { message: 'A new finding was added!', type: 'info' });
    // Example: emit chart update (category and count)
    const category = newFinding.category || 'Unknown';
    // You may want to query the DB for the new count per category
    req.app.get('io').emit('chartUpdate', { category, findings: 1 }); // Replace 1 with real count
    res.status(201).json(newFinding);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update finding
router.put('/:id', async (req, res) => {
  try {
    const updatedFinding = await findingService.updateFinding(req.params.id, req.body);
    if (!updatedFinding) return res.status(404).json({ message: 'Finding not found' });
    const io = req.app.get('io');
    if (io) io.emit('findingUpdate', updatedFinding);
    res.json(updatedFinding);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE finding
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await findingService.deleteFinding(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Finding not found' });
    const io = req.app.get('io');
    if (io) io.emit('findingDelete', req.params.id);
    res.json({ message: 'Finding deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 