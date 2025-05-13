const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Log database configuration
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const sequelize = require('./models/sequelize');

// Import routes
const authRoutes = require('./routes/auth');
const logoutRoutes = require('./routes/logout');
const energyAuditRoutes = require('./routes/energyAudit');
const userRoutes = require('./routes/user');
const findingRoutes = require('./routes/finding');
const activityLogsRoutes = require('./routes/activityLogs');

// Sync models (create tables if they do not exist)
sequelize.sync()
  .then(() => {
    console.log('Database models synchronized');
    
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(helmet());

    // Enable CORS with credentials support
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/auth', logoutRoutes);
    app.use('/api/energy-audit', energyAuditRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/findings', findingRoutes);
    app.use('/api/activity-logs', activityLogsRoutes);

    // Websocket connection handling
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Export io for use in other modules
    app.set('io', io);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
      });
    });

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });
