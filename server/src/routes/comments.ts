import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get comments for a finding
router.get('/findings/:findingId/comments', authenticateToken, async (req, res) => {
  try {
    const { findingId } = req.params;
    const [comments] = await pool.query(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.finding_id = ? ORDER BY c.created_at DESC',
      [findingId]
    );
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a comment
router.post('/findings/:findingId/comments', authenticateToken, async (req, res) => {
  try {
    const { findingId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const [result] = await pool.query(
      'INSERT INTO comments (finding_id, user_id, content) VALUES (?, ?, ?)',
      [findingId, userId, content]
    );

    const [newComment] = await pool.query(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [result.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    // Check if user owns the comment
    const [comments] = await pool.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!comments[0]) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    await pool.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );

    const [updatedComment] = await pool.query(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [id]
    );

    res.json(updatedComment[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user owns the comment
    const [comments] = await pool.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!comments[0]) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 