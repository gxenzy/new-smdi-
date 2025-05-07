import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';
import { Finding } from '../types';

export const getAllFindings = async (_req: Request, res: Response) => {
  try {
    const [findings] = await pool.query<Finding[]>('SELECT * FROM findings');
    return res.json(findings);
  } catch (error) {
    console.error('Error fetching findings:', error);
    return res.status(500).json({ message: 'Error fetching findings' });
  }
};

export const getFindingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [findings] = await pool.query<Finding[]>(
      'SELECT * FROM findings WHERE id = ?',
      [id]
    );

    if (findings.length === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    return res.json(findings[0]);
  } catch (error) {
    console.error('Error fetching finding:', error);
    return res.status(500).json({ message: 'Error fetching finding' });
  }
};

export const createFinding = async (req: Request, res: Response) => {
  try {
    const { title, description, type, status, severity, auditId } = req.body;
    const userId = req.user?.id;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO findings (title, description, type, status, severity, audit_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, type, status, severity, auditId, userId]
    );

    return res.status(201).json({
      message: 'Finding created successfully',
      findingId: result.insertId
    });
  } catch (error) {
    console.error('Error creating finding:', error);
    return res.status(500).json({ message: 'Error creating finding' });
  }
};

export const updateFinding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status, severity } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE findings SET title = ?, description = ?, type = ?, status = ?, severity = ? WHERE id = ?',
      [title, description, type, status, severity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    return res.json({ message: 'Finding updated successfully' });
  } catch (error) {
    console.error('Error updating finding:', error);
    return res.status(500).json({ message: 'Error updating finding' });
  }
};

export const deleteFinding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM findings WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    return res.json({ message: 'Finding deleted successfully' });
  } catch (error) {
    console.error('Error deleting finding:', error);
    return res.status(500).json({ message: 'Error deleting finding' });
  }
};

export const assignFinding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE findings SET assigned_to = ? WHERE id = ?',
      [assignedTo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    return res.json({ message: 'Finding assigned successfully' });
  } catch (error) {
    console.error('Error assigning finding:', error);
    return res.status(500).json({ message: 'Error assigning finding' });
  }
}; 