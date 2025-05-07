import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { findingId } = req.params;

    const [comments] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.finding_id = ?
      ORDER BY c.created_at DESC`,
      [findingId]
    );

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.status(500).json({
      message: 'Error fetching comments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { findingId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if finding exists
    const [findings] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM findings WHERE id = ?',
      [findingId]
    );

    if (findings.length === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    // Create comment
    const [result] = await pool.query(
      'INSERT INTO comments (finding_id, user_id, content) VALUES (?, ?, ?)',
      [findingId, userId, content]
    );

    // Get the created comment with user info
    const [comments] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [(result as any).insertId]
    );

    // Create notification for finding owner
    const [findingOwner] = await pool.query<RowDataPacket[]>(
      'SELECT assigned_to FROM findings WHERE id = ?',
      [findingId]
    );

    if (findingOwner[0]?.assigned_to && findingOwner[0].assigned_to !== userId) {
      await pool.query(
        'INSERT INTO notifications (user_id, finding_id, type, message) VALUES (?, ?, ?, ?)',
        [
          findingOwner[0].assigned_to,
          findingId,
          'COMMENTED',
          `New comment on finding #${findingId}`
        ]
      );
    }

    res.status(201).json(comments[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.status(500).json({
      message: 'Error creating comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if comment exists and belongs to user
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Update comment
    await pool.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, commentId]
    );

    // Get updated comment with user info
    const [updatedComments] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    );

    res.json(updatedComments[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.status(500).json({
      message: 'Error updating comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    // Check if comment exists and belongs to user
    const [comments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Delete comment
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.status(500).json({
      message: 'Error deleting comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 