import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const [notifications] = await pool.query(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.user_id = ? ORDER BY n.created_at DESC',
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { findingId, type, message } = req.body;
    const userId = req.user?.id;

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
      [userId, findingId, type, message]
    );

    const [newNotification] = await pool.query(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.id = ?',
      [result.insertId]
    );

    res.status(201).json(newNotification[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if notification belongs to user
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notifications[0]) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    const [updatedNotification] = await pool.query(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.id = ?',
      [id]
    );

    res.json(updatedNotification[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 