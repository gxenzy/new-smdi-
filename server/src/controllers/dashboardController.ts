import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getTotalEnergyUsage = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(power_usage), 0) as total 
       FROM energy_audits 
       WHERE status = 'APPROVED' 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    return res.json({ total: Number(rows[0]?.total) || 0 });
  } catch (error) {
    console.error('Error fetching total energy usage:', error);
    return res.status(500).json({ error: 'Failed to fetch total energy usage' });
  }
};

export const getActiveUsers = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT ua.user_id) as count 
       FROM user_activity ua 
       JOIN users u ON ua.user_id = u.id 
       WHERE ua.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
       AND u.is_active = true`
    );
    return res.json({ count: Number(rows[0]?.count) || 0 });
  } catch (error) {
    console.error('Error fetching active users:', error);
    return res.status(500).json({ error: 'Failed to fetch active users' });
  }
};

export const getCompletedAudits = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM energy_audits 
       WHERE status = 'APPROVED' 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    return res.json({ count: Number(rows[0]?.count) || 0 });
  } catch (error) {
    console.error('Error fetching completed audits:', error);
    return res.status(500).json({ error: 'Failed to fetch completed audits' });
  }
};

export const getAlertsCount = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM findings 
       WHERE status != 'Closed' 
       AND severity IN ('High', 'Medium') 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    return res.json({ count: Number(rows[0]?.count) || 0 });
  } catch (error) {
    console.error('Error fetching alerts count:', error);
    return res.status(500).json({ error: 'Failed to fetch alerts count' });
  }
};

export const getEnergyUsageTrend = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        DATE_FORMAT(created_at, '%b %Y') as name,
        COALESCE(SUM(power_usage), 0) as value
       FROM energy_audits
       WHERE status = 'APPROVED' 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month, name
       ORDER BY month ASC`
    );
    return res.json({ trend: rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }))});
  } catch (error) {
    console.error('Error fetching energy usage trend:', error);
    return res.status(500).json({ error: 'Failed to fetch energy usage trend' });
  }
};

export const getRecentActivity = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ua.id,
        ua.activity_type as title,
        ua.details,
        ua.created_at as createdAt,
        CONCAT(u.first_name, ' ', u.last_name) as username,
        CASE 
          WHEN ua.activity_type LIKE '%finding%' THEN f.title
          WHEN ua.activity_type LIKE '%audit%' THEN ea.title
          ELSE NULL 
        END as related_item
       FROM user_activity ua
       JOIN users u ON ua.user_id = u.id
       LEFT JOIN findings f ON ua.details LIKE CONCAT('%finding_id:', f.id, '%')
       LEFT JOIN energy_audits ea ON ua.details LIKE CONCAT('%audit_id:', ea.id, '%')
       WHERE ua.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY ua.created_at DESC 
       LIMIT 10`
    );
    return res.json({ activity: rows });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

export const getAllEnergyAudits = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, user_id, title, power_usage, lighting_efficiency, hvac_efficiency, status, created_at, updated_at
       FROM energy_audits`
    );
    return res.json({ audits: rows });
  } catch (error) {
    console.error('Error fetching energy audits:', error);
    return res.status(500).json({ error: 'Failed to fetch energy audits' });
  }
}; 