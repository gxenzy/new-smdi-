import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

const debugRouter = express.Router();

// Debug endpoint to get all users
debugRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    console.log('Debug endpoint: Getting all users');
    const [users] = await pool.query(
      'SELECT id, username, email, role FROM users LIMIT 10'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error checking users:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Debug endpoint to get user by ID
debugRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    console.log(`Debug endpoint: Getting user with ID ${userId}`);
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at, student_id FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
      });
    }
    
    return res.json({ 
      success: true, 
      user: users[0]
    });
  } catch (error) {
    console.error(`Error getting user ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// Debug endpoint to update user
debugRouter.put('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    console.log(`Debug endpoint: Updating user with ID ${userId}`);
    
    // Remove any fields that shouldn't be directly updated
    const { password, ...updateData } = userData;
    
    // Build the SQL query dynamically based on the fields provided
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updateData[field]), userId];
    
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    console.log('Debug update query:', query);
    
    await pool.query(query, values);
    
    // Get the updated user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at, student_id FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found after update' });
    }
    
    return res.json({ 
      success: true, 
      user: users[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// Add a direct database update endpoint
debugRouter.post('/direct-update-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing userId or userData in request body'
      });
    }
    
    console.log(`Debug direct-update-user: Updating user ${userId} with:`, userData);
    
    // Remove any fields that shouldn't be directly updated
    const { password, ...updateData } = userData;
    
    // Build the update query parts
    const setClauseParts: string[] = [];
    const values: any[] = [];
    
    // Process each field in userData to create SQL update values
    Object.entries(updateData).forEach(([key, value]) => {
      setClauseParts.push(`${key} = ?`);
      values.push(value);
    });
    
    if (setClauseParts.length === 0) {
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }
    
    // Add the userId as the last parameter for the WHERE clause
    values.push(userId);
    
    // Create the SQL query
    const query = `UPDATE users SET ${setClauseParts.join(', ')} WHERE id = ?`;
    console.log('Debug direct update query:', query, 'with values:', values);
    
    // Execute the query directly
    const [result] = await pool.query(query, values);
    console.log('Query result:', result);
    
    // Get the updated user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at, student_id FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found after update' });
    }
    
    return res.json({ 
      success: true, 
      user: users[0],
      message: 'User updated successfully via direct update'
    });
  } catch (error) {
    console.error(`Error in direct-update-user:`, error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

export default debugRouter; 