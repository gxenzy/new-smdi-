import express from 'express';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Get comments for a finding
router.get('/findings/:findingId/comments', authenticateToken, async (req, res) => {
  try {
    console.log('Get comments request received:', {
      params: req.params,
      user: req.user
    });

    const { findingId } = req.params;
    console.log('Fetching comments for finding:', findingId);
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.finding_id = ? ORDER BY c.created_at DESC',
      [findingId]
    );

    console.log('Found comments:', comments.length);
    return res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
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

// Create a comment
router.post('/findings/:findingId/comments', authenticateToken, async (req, res) => {
  try {
    console.log('Create comment request received:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { findingId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    console.log('Creating comment');
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comments (finding_id, user_id, content) VALUES (?, ?, ?)',
      [findingId, userId, content]
    );

    console.log('Fetching new comment');
    const [newComment] = await pool.query<RowDataPacket[]>(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [result.insertId]
    );

    console.log('Comment created successfully:', {
      id: result.insertId,
      findingId,
      userId
    });

    return res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
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

// Update a comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Update comment request received:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    // Check if user owns the comment
    console.log('Checking comment ownership:', id);
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!comments[0]) {
      console.log('Comment not found or unauthorized:', id);
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    console.log('Updating comment');
    await pool.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );

    console.log('Fetching updated comment');
    const [updatedComment] = await pool.query<RowDataPacket[]>(
      'SELECT c.*, u.email as user_email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [id]
    );

    console.log('Comment updated successfully:', id);
    return res.json(updatedComment[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
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

// Delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete comment request received:', {
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user owns the comment
    console.log('Checking comment ownership:', id);
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!comments[0]) {
      console.log('Comment not found or unauthorized:', id);
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    console.log('Deleting comment');
    await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    console.log('Comment deleted successfully:', id);
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
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