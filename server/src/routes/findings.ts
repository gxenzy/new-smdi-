import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all findings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [findings] = await pool.query('SELECT * FROM findings');
    res.json(findings);
  } catch (error) {
    console.error('Error fetching findings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new finding
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, status, auditId } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO findings (title, description, type, status, auditId, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, type, status, auditId, userId]
    );

    const [newFinding] = await pool.query(
      'SELECT * FROM findings WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newFinding[0]);
  } catch (error) {
    console.error('Error creating finding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a finding
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM findings WHERE id = ?', [id]);
    res.status(200).json({ message: 'Finding deleted successfully' });
  } catch (error) {
    console.error('Error deleting finding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 