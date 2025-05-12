import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as compressionMiddleware from 'compression';
import { createWebSocketServer, attachWebSocketHandlers } from './config/websocket';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import dotenv from 'dotenv';
import path from 'path';

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

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:3000', 'http://127.0.0.1:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Basic middleware setup
app.use(compressionMiddleware.default());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/floorplan', express.static(path.join(__dirname, '../../uploads/floorplans')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', routes);

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
}); 