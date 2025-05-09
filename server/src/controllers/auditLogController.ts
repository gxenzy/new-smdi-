import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const [logs] = await pool.query<RowDataPacket[]>(
      'SELECT l.*, u.username FROM audit_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM audit_logs');
    const count = countRows[0]?.count || 0;
    return res.json({ logs, page, limit, count });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ message: 'Error fetching audit logs' });
  }
}; 