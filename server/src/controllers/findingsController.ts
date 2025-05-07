import { Request, Response } from 'express';
import { pool } from '../config/database';
import { Finding } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const getAllFindings = async (_req: Request, res: Response) => {
  try {
    const [findings] = await pool.query<Finding[]>('SELECT * FROM findings');
    res.json(findings);
  } catch (error) {
    console.error('Error fetching findings:', error);
    res.status(500).json({ message: 'Error fetching findings' });
  }
};

export const getFindingById = async (req: Request, res: Response) => {
  try {
    const [findings] = await pool.query<Finding[]>(
      'SELECT * FROM findings WHERE id = ?',
      [req.params.id]
    );

    if (findings.length === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    res.json(findings[0]);
  } catch (error) {
    console.error('Error fetching finding:', error);
    res.status(500).json({ message: 'Error fetching finding' });
  }
};

export const createFinding = async (req: Request, res: Response) => {
  try {
    const { title, description, severity, status, assignedTo } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO findings (title, description, severity, status, assigned_to) VALUES (?, ?, ?, ?, ?)',
      [title, description, severity, status, assignedTo]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      severity,
      status,
      assignedTo
    });
  } catch (error) {
    console.error('Error creating finding:', error);
    res.status(500).json({ message: 'Error creating finding' });
  }
};

export const updateFinding = async (req: Request, res: Response) => {
  try {
    const { title, description, severity, status, assignedTo } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE findings SET title = ?, description = ?, severity = ?, status = ?, assigned_to = ? WHERE id = ?',
      [title, description, severity, status, assignedTo, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    res.json({
      id: parseInt(req.params.id),
      title,
      description,
      severity,
      status,
      assignedTo
    });
  } catch (error) {
    console.error('Error updating finding:', error);
    res.status(500).json({ message: 'Error updating finding' });
  }
};

export const deleteFinding = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM findings WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    res.json({ message: 'Finding deleted successfully' });
  } catch (error) {
    console.error('Error deleting finding:', error);
    res.status(500).json({ message: 'Error deleting finding' });
  }
};

export const assignFinding = async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE findings SET assigned_to = ? WHERE id = ?',
      [assignedTo, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    res.json({ message: 'Finding assigned successfully' });
  } catch (error) {
    console.error('Error assigning finding:', error);
    res.status(500).json({ message: 'Error assigning finding' });
  }
}; 