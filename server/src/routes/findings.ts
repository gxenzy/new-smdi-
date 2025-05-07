import express from 'express';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Get all findings
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Get findings request received:', {
      user: req.user,
      query: req.query
    });

    console.log('Fetching findings');
    const [findings] = await pool.query<RowDataPacket[]>('SELECT * FROM findings');
    console.log('Found findings:', findings.length);
    return res.json(findings);
  } catch (error) {
    console.error('Error fetching findings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new finding
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Create finding request received:', {
      body: req.body,
      user: req.user
    });

    const { title, description, type, status, auditId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Creating finding');
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO findings (title, description, type, status, auditId, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, type, status, auditId, userId]
    );

    console.log('Fetching new finding');
    const [newFinding] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM findings WHERE id = ?',
      [result.insertId]
    );

    console.log('Finding created successfully:', {
      id: result.insertId,
      title,
      userId
    });

    return res.status(201).json(newFinding[0]);
  } catch (error) {
    console.error('Error creating finding:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a finding
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete finding request received:', {
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    console.log('Deleting finding:', id);
    await pool.query('DELETE FROM findings WHERE id = ?', [id]);

    console.log('Finding deleted successfully:', id);
    return res.status(200).json({ message: 'Finding deleted successfully' });
  } catch (error) {
    console.error('Error deleting finding:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 