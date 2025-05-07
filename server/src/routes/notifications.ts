import express from 'express';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Get notifications request received:', {
      user: req.user
    });

    const userId = req.user?.id;
    console.log('Fetching notifications for user:', userId);
    const [notifications] = await pool.query<RowDataPacket[]>(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.user_id = ? ORDER BY n.created_at DESC',
      [userId]
    );

    console.log('Found notifications:', notifications.length);
    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
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

// Create a notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Create notification request received:', {
      body: req.body,
      user: req.user
    });

    const { findingId, type, message } = req.body;
    const userId = req.user?.id;

    console.log('Creating notification');
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
      [userId, findingId, type, message]
    );

    console.log('Fetching new notification');
    const [newNotification] = await pool.query<RowDataPacket[]>(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.id = ?',
      [result.insertId]
    );

    console.log('Notification created successfully:', {
      id: result.insertId,
      findingId,
      userId
    });

    return res.status(201).json(newNotification[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
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

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    console.log('Mark notification as read request received:', {
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    const userId = req.user?.id;

    // Check if notification belongs to user
    console.log('Checking notification ownership:', id);
    const [notifications] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notifications[0]) {
      console.log('Notification not found or unauthorized:', id);
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('Marking notification as read');
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    console.log('Fetching updated notification');
    const [updatedNotification] = await pool.query<RowDataPacket[]>(
      'SELECT n.*, f.title as finding_title FROM notifications n JOIN findings f ON n.finding_id = f.id WHERE n.id = ?',
      [id]
    );

    console.log('Notification marked as read successfully:', id);
    return res.json(updatedNotification[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
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