import express from 'express';
import { login } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const authRouter = express.Router();

authRouter.post('/login', login);

// Get current user profile
authRouter.get('/user', authenticateToken, async (req, res) => {
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