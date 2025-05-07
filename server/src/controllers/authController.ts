import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt...');
    const { username, password } = req.body;
    console.log('Username:', username);

    // Get user from database
    console.log('Querying database for user...');
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, password, role FROM users WHERE username = ?',
      [username]
    );
    console.log('Found users:', users.length);

    if (users.length === 0) {
      console.log('No user found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('User found:', { id: user.id, username: user.username, role: user.role });

    // Verify password
    console.log('Verifying password...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '24h' }
    );
    console.log('Token created successfully');

    // Exclude password from user object in response
    const { password: _pw, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 