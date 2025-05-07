import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    console.log('Get notifications request received:', {
      user: req.user,
      query: req.query
    });

    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    console.log('Getting total count');
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get paginated notifications
    console.log('Getting paginated notifications');
    const [notifications] = await pool.query<RowDataPacket[]>(
      `SELECT 
        n.*,
        f.title as finding_title,
        f.severity as finding_severity,
        f.status as finding_status
      FROM notifications n
      JOIN findings f ON n.finding_id = f.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limitNum, offset]
    );

    console.log('Found notifications:', notifications.length);
    return res.json({
      notifications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error fetching notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    console.log('Mark as read request received:', {
      params: req.params,
      user: req.user
    });

    const userId = req.user?.id;
    const { notificationId } = req.params;

    // Check if notification exists and belongs to user
    console.log('Checking notification ownership:', notificationId);
    const [notifications] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      console.log('Notification not found or unauthorized:', notificationId);
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    // Mark as read
    console.log('Marking notification as read');
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [notificationId]
    );

    console.log('Notification marked as read successfully:', notificationId);
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error marking notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    console.log('Mark all as read request received:', {
      user: req.user
    });

    const userId = req.user?.id;

    // Mark all as read
    console.log('Marking all notifications as read');
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = ?',
      [userId]
    );

    console.log('All notifications marked as read successfully');
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({
      message: 'Error marking all notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 