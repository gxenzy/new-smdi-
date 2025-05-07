import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getComments = async (req: Request, res: Response) => {
  try {
    console.log('Get comments request received:', {
      findingId: req.params.findingId,
      user: req.user
    });

    const { findingId } = req.params;
    console.log('Fetching comments for finding:', findingId);

    const [comments] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.username as author_name 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.finding_id = ? 
       ORDER BY c.created_at DESC`,
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
    return res.status(500).json({
      message: 'Error fetching comments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    console.log('Create comment request received:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { findingId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      console.log('No content provided');
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if finding exists
    console.log('Checking if finding exists:', findingId);
    const [findings] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM findings WHERE id = ?',
      [findingId]
    );

    if (findings.length === 0) {
      console.log('Finding not found:', findingId);
      return res.status(404).json({ message: 'Finding not found' });
    }

    // Create comment
    console.log('Creating comment');
    const [result] = await pool.query(
      'INSERT INTO comments (finding_id, user_id, content) VALUES (?, ?, ?)',
      [findingId, userId, content]
    );

    // Create notification
    console.log('Creating notification for comment');
    await pool.query(
      'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
      [
        userId,
        findingId,
        'UPDATED',
        'New comment added'
      ]
    );

    console.log('Comment created successfully:', {
      commentId: (result as any).insertId,
      findingId,
      userId
    });

    return res.status(201).json({
      message: 'Comment created successfully',
      commentId: (result as any).insertId
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error creating comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    console.log('Update comment request received:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      console.log('No content provided');
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if comment exists and belongs to user
    console.log('Checking comment ownership:', commentId);
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      console.log('Comment not found or unauthorized:', commentId);
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Update comment
    console.log('Updating comment');
    await pool.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, commentId]
    );

    console.log('Comment updated successfully:', commentId);
    return res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error updating comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    console.log('Delete comment request received:', {
      params: req.params,
      user: req.user
    });

    const { commentId } = req.params;
    const userId = req.user?.id;

    // Check if comment exists and belongs to user
    console.log('Checking comment ownership:', commentId);
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      console.log('Comment not found or unauthorized:', commentId);
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Delete comment
    console.log('Deleting comment');
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    console.log('Comment deleted successfully:', commentId);
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error deleting comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 