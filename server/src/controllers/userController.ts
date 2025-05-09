import { Request, Response } from 'express';
import { pool } from '../config/database';
import * as bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users');
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName, role, department, position, phoneNumber } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password, first_name, last_name, role, department, position, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName, role, department, position, phoneNumber]
    );
    
    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user?.id, 'CREATE_USER', JSON.stringify({ username, email, role })]
    );
    
    return res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, role, department, position, phoneNumber, password } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, role = ?, department = ?, position = ?, phone_number = ?, password = ? WHERE id = ?',
        [firstName, lastName, role, department, position, phoneNumber, hashedPassword, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, role = ?, department = ?, position = ?, phone_number = ? WHERE id = ?',
        [firstName, lastName, role, department, position, phoneNumber, req.params.id]
      );
    }
    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user?.id, 'UPDATE_USER', JSON.stringify({ userId: req.params.id, updates: req.body })]
    );
    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user?.id, 'DELETE_USER', JSON.stringify({ userId: req.params.id })]
    );
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ message: 'Error updating user status' });
  }
};

export const bulkUpdateUsers = async (req: Request, res: Response) => {
  try {
    const { userIds, updates } = req.body;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const userId of userIds) {
        await connection.query(
          'UPDATE users SET ? WHERE id = ?',
          [updates, userId]
        );
      }
      
      // Log the action
      await connection.query(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user?.id, 'BULK_UPDATE_USERS', JSON.stringify({ userIds, updates })]
      );
      
      await connection.commit();
      return res.json({ message: 'Users updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkDeleteUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query('DELETE FROM users WHERE id IN (?)', [userIds]);
      
      // Log the action
      await connection.query(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user?.id, 'BULK_DELETE_USERS', JSON.stringify({ userIds })]
      );
      
      await connection.commit();
      return res.json({ message: 'Users deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 