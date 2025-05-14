import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('AUTH CONTROLLER: Login attempt...');
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Get user from database - with case insensitive username match or student_id match
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, student_id, password, email, first_name as firstName, last_name as lastName, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE LOWER(username) = LOWER(?) OR student_id = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password with bcrypt
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1',
      { expiresIn: '24h' }
    );

    // Exclude password from user object in response
    const { password: _pw, ...userWithoutPassword } = user;

    // Add isActive field to match client's expected format
    const userResponse = {
      ...userWithoutPassword,
      isActive: true
    };

    // Update last login time
    try {
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    } catch (updateErr) {
      console.warn('Could not update last login time:', updateErr);
    }

    return res.json({ user: userResponse, token });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 