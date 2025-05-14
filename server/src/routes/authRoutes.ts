import express, { Request, Response } from 'express';
import { login } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { UserRole } from '../types';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: UserRole;
      };
    }
  }
}

const authRouter = express.Router();

// Add lots of debug logging
authRouter.post('/login', (req: Request, res: Response) => {
  console.log('authRoutes.ts: /login endpoint hit');
  console.log('Request body:', req.body);
  return login(req, res);
});

// Echo route to help diagnose issues
authRouter.post('/echo', (req: Request, res: Response) => {
  console.log('AUTH ECHO: Endpoint hit');
  console.log('Request body:', req.body);
  return res.json({
    success: true,
    message: 'Echo endpoint working',
    receivedData: req.body,
    time: new Date().toISOString()
  });
});

// Direct test to fetch all users for diagnosis
authRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all users for diagnosis');
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role FROM users LIMIT 10'
    );
    
    console.log(`Found ${users.length} users`);
    
    return res.json({ 
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users', error: String(error) });
  }
});

// Get current user profile
authRouter.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('Getting user profile...');
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('No user ID in token');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('Fetching user with ID:', userId);
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log('No user found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    console.log('User found:', user);
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default authRouter; 