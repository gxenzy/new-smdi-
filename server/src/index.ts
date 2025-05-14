import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createWebSocketServer, attachWebSocketHandlers } from './config/websocket';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import authRouter from './routes/authRoutes';
import { login } from './controllers/authController';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/database';
import { RowDataPacket } from 'mysql2';
import userRouter from './routes/userRoutes';
import { authenticateToken } from './middleware/auth';
import debugRouter from './routes/debugRoutes';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// WebSocket setup
const io = createWebSocketServer(httpServer);
attachWebSocketHandlers(io);

// Middleware
app.use(morgan('dev'));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Add wider CORS settings to allow all origins during development
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:3000', 'http://127.0.0.1:8000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Basic middleware setup
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/floorplan', express.static(path.join(__dirname, '../../uploads/floorplans')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ======= AUTHENTICATION ROUTES =======
console.log('Registering authentication routes at multiple paths');

// 1. Standard auth route
app.use('/auth', authRouter);

// 2. API prefixed auth route
app.use('/api/auth', authRouter);

// 3. Direct login endpoints
app.post('/login', (_req, res) => {
  console.log('Direct /login endpoint hit');
  return login(_req, res);
});

app.post('/api/login', (_req, res) => {
  console.log('API /api/login endpoint hit');
  return login(_req, res);
});

// Add diagnostic route for login testing
app.post('/test-auth', (_req, res) => {
  console.log('Test auth endpoint hit with data:', _req.body);
  res.json({
    success: true,
    message: 'Auth test endpoint working',
    receivedData: _req.body,
    time: new Date().toISOString()
  });
});

// API ROUTES
console.log('Registering API routes');
app.use('/api', routes);

// Register user management routes
app.use('/api/users', userRouter);
app.use('/users', userRouter); // Add direct route without /api prefix

// Register debug routes
app.use('/debug', debugRouter);
app.use('/api/debug', debugRouter); // Add API prefixed debug route

// Register direct user route without /api prefix for GET and PUT requests
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`Direct GET /users/${userId} endpoint hit`);
    
    // Get user from database
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`Direct PUT /users/${userId} endpoint hit`);
    
    // Get user data from request body
    const userData = req.body;
    
    // Get current user data
    const [currentUsers] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (currentUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update data
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      isActive,
      student_id 
    } = userData;
    
    // Build dynamic update query
    const updates: string[] = [];
    const queryParams: any[] = [];
    
    if (email !== undefined) {
      updates.push('email = ?');
      queryParams.push(email);
    }
    
    if (firstName !== undefined) {
      updates.push('first_name = ?');
      queryParams.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      queryParams.push(lastName);
    }
    
    if (role !== undefined) {
      updates.push('role = ?');
      queryParams.push(role);
    }
    
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      queryParams.push(isActive ? 1 : 0);
    }
    
    if (student_id !== undefined) {
      updates.push('student_id = ?');
      queryParams.push(student_id);
    }
    
    // Add userId to query params
    queryParams.push(userId);
    
    // Execute update if there are fields to update
    if (updates.length > 0) {
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      console.log('Direct update query:', updateQuery);
      
      await pool.query(updateQuery, queryParams);
    }
    
    // Get updated user
    const [updatedUsers] = await pool.query<RowDataPacket[]>(
      `SELECT id, username, email, student_id, first_name AS firstName, 
       last_name AS lastName, role, is_active AS isActive, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (updatedUsers.length === 0) {
      return res.status(404).json({ message: 'User not found after update' });
    }
    
    return res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
});

// EMERGENCY DIRECT DATABASE UPDATE - NO MIDDLEWARE - TEMPORARY SOLUTION
app.post('/emergency-db-update', async (req: Request, res: Response) => {
  try {
    console.log('🚨 EMERGENCY DB UPDATE 🚨');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      console.log('⚠️ Missing userId or userData');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing userId or userData in request body'
      });
    }
    
    console.log(`🔄 Attempting direct DB update for user ${userId}:`, userData);
    
    // Remove any fields that shouldn't be directly updated
    const { password, ...updateData } = userData;
    
    // Build the update query parts
    const setClauseParts: string[] = [];
    const values: any[] = [];
    
    // Process each field in userData to create SQL update values
    // Handle camelCase to snake_case conversion for field names
    if (updateData.firstName !== undefined) {
      setClauseParts.push('first_name = ?');
      values.push(updateData.firstName);
    }
    
    if (updateData.lastName !== undefined) {
      setClauseParts.push('last_name = ?');
      values.push(updateData.lastName);
    }
    
    if (updateData.first_name !== undefined) {
      setClauseParts.push('first_name = ?');
      values.push(updateData.first_name);
    }
    
    if (updateData.last_name !== undefined) {
      setClauseParts.push('last_name = ?');
      values.push(updateData.last_name);
    }
    
    if (updateData.email !== undefined) {
      setClauseParts.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.role !== undefined) {
      setClauseParts.push('role = ?');
      values.push(updateData.role);
    }
    
    if (updateData.isActive !== undefined) {
      setClauseParts.push('is_active = ?');
      values.push(updateData.isActive ? 1 : 0);
    }
    
    if (updateData.student_id !== undefined) {
      setClauseParts.push('student_id = ?');
      values.push(updateData.student_id);
    }
    
    if (setClauseParts.length === 0) {
      console.log('⚠️ No update data provided');
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }
    
    // Add the userId as the last parameter for the WHERE clause
    values.push(userId);
    
    // Create the SQL query
    const query = `UPDATE users SET ${setClauseParts.join(', ')} WHERE id = ?`;
    console.log('🔄 EMERGENCY SQL query:', query);
    console.log('🔄 EMERGENCY SQL values:', values);
    
    // Execute the query directly
    const [result] = await pool.query(query, values);
    console.log('✅ EMERGENCY update result:', result);
    
    // Get the updated user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, student_id, first_name AS firstName, last_name AS lastName, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log('⚠️ User not found after update');
      return res.status(404).json({ success: false, message: 'User not found after update' });
    }
    
    console.log('✅ EMERGENCY update successful, user data:', users[0]);
    return res.json({ 
      success: true, 
      user: users[0],
      message: 'User updated successfully via EMERGENCY update'
    });
  } catch (error) {
    console.error('❌ EMERGENCY update error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// Original direct update endpoint
app.post('/debug/direct-update-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing userId or userData in request body'
      });
    }
    
    console.log(`DIRECT UPDATE: Updating user ${userId} with:`, userData);
    
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
    console.log('DIRECT UPDATE query:', query, 'with values:', values);
    
    // Execute the query directly
    const [result] = await pool.query(query, values);
    console.log('DIRECT UPDATE query result:', result);
    
    // Get the updated user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, first_name, last_name, role, is_active AS isActive, created_at, updated_at, student_id FROM users WHERE id = ?',
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
    console.error(`DIRECT UPDATE Error:`, error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// Check users endpoint for direct debugging
app.get('/debug/users', async (_req, res) => {
  try {
    console.log('Checking users in database');
    const [users] = await pool.query(
      'SELECT id, username, email, role FROM users LIMIT 10'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error checking users:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Add diagnostic endpoint to check hashed password for admin user
app.get('/debug/check-admin', async (_req, res) => {
  try {
    console.log('Checking admin user in database');
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, password, email, role FROM users WHERE username = 'admin' LIMIT 1"
    );
    
    if (users.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Admin user not found',
        adminExists: false
      });
    }
    
    const user = users[0];
    
    // Don't return the actual password, just info about it
    return res.json({ 
      success: true, 
      adminExists: true,
      passwordLength: user.password?.length,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error checking admin user:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// Mock data endpoints for energy audit
app.get('/api/energy-audit/findings', (_req, res) => {
  console.log('Direct energy-audit findings endpoint hit');
  res.json([
    {
      id: 1,
      title: 'Excessive Energy Consumption',
      description: 'HVAC system running 24/7 regardless of occupancy',
      category: 'HVAC',
      severity: 'High',
      status: 'Open',
      assignedTo: 'john.doe',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Poor Insulation',
      description: 'North-facing windows showing significant heat loss',
      category: 'Building Envelope',
      severity: 'Medium',
      status: 'In Progress',
      assignedTo: 'jane.smith',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);
});

app.get('/api/energy-audit/metrics', (_req, res) => {
  console.log('Direct energy-audit metrics endpoint hit');
  res.json({
    totalFindings: 12,
    findingsByStatus: [
      { status: 'Open', count: 5 },
      { status: 'In Progress', count: 4 },
      { status: 'Resolved', count: 3 }
    ],
    findingsBySeverity: [
      { severity: 'High', count: 3 },
      { severity: 'Medium', count: 6 },
      { severity: 'Low', count: 3 }
    ]
  });
});

// Add a debug endpoint for getting a user by ID
app.get('/debug/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    console.log(`Debug endpoint - getting user with ID ${userId}`);
    
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

// Add a debug endpoint for updating a user
app.put('/debug/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    console.log(`Debug endpoint - updating user with ID ${userId}`);
    
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

// Log available routes for debugging
console.log('Available routes:');
function printRoutes(stack: any[], basePath = ''): void {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newBase = basePath + (layer.regexp ? layer.regexp.toString().replace('/^\\', '').replace('/(?=\\/|$)/i', '').replace(/\\\//g, '/') : '');
      printRoutes(layer.handle.stack, newBase);
    }
  });
  return;
}
printRoutes(app._router.stack);

// Error handling
app.use(errorHandler);

// Handle WebSocket errors
io.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('SIGTERM/SIGINT received. Closing HTTP and WebSocket servers...');
  httpServer.close(() => {
    console.log('HTTP and WebSocket servers closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
  console.log(`Authentication endpoints available at:`);
  console.log(`- http://localhost:${PORT}/login`);
  console.log(`- http://localhost:${PORT}/auth/login`);
  console.log(`- http://localhost:${PORT}/api/auth/login`);
  console.log(`- http://localhost:${PORT}/api/login`);
  console.log(`- http://localhost:3001/auth/login (minimal server)`);
}); 