import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ServerOptions } from 'socket.io';

interface WebSocketConfig extends Partial<ServerOptions> {
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  pingTimeout: number;
  pingInterval: number;
  path: string;
}

interface UserConnection {
  userId: string;
  socketId: string;
  lastActive: Date;
}

// Track active connections
const activeConnections = new Map<string, UserConnection>();

export const createWebSocketServer = (httpServer: HTTPServer): Server => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
  ];

  const config: WebSocketConfig = {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    connectTimeout: 45000,
    maxHttpBufferSize: 1e6 // 1MB
  };

  const io = new Server(httpServer, config);

  // Connection monitoring middleware
  io.use((socket: Socket, next) => {
    const clientIp = socket.handshake.address;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] New connection attempt from ${clientIp}`);
    
    // You can add authentication check here
    // if (!socket.handshake.auth.token) {
    //   return next(new Error('Authentication failed'));
    // }
    
    next();
  });

  // Error handling middleware
  io.engine.on('connection_error', (err) => {
    console.error(`[${new Date().toISOString()}] Socket.IO connection error:`, err);
  });

  return io;
};

export const attachWebSocketHandlers = (io: Server): Server => {
  io.on('connection', (socket: Socket) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Client connected: ${socket.id}`);

    // Handle user presence
    socket.on('userOnline', (userId: string) => {
      const connection: UserConnection = {
        userId,
        socketId: socket.id,
        lastActive: new Date()
      };
      
      activeConnections.set(socket.id, connection);
      socket.join(`user:${userId}`);
      
      // Emit updated online users list
      const onlineUsers = Array.from(activeConnections.values());
      io.emit('onlineUsers', onlineUsers);
    });

    // Handle user activity
    socket.on('userActivity', () => {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.lastActive = new Date();
        activeConnections.set(socket.id, connection);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Client disconnected: ${socket.id}, Reason: ${reason}`);
      
      // Clean up connection tracking
      const connection = activeConnections.get(socket.id);
      if (connection) {
        activeConnections.delete(socket.id);
        // Emit updated online users list
        const onlineUsers = Array.from(activeConnections.values());
        io.emit('onlineUsers', onlineUsers);
      }
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`[${new Date().toISOString()}] Socket error for ${socket.id}:`, error);
    });

    // Handle pong (client response to ping)
    socket.on('pong', () => {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.lastActive = new Date();
        activeConnections.set(socket.id, connection);
      }
    });

    // Cleanup inactive connections periodically
    const cleanup = setInterval(() => {
      const now = new Date();
      for (const [socketId, connection] of activeConnections.entries()) {
        const inactiveTime = now.getTime() - connection.lastActive.getTime();
        if (inactiveTime > 5 * 60 * 1000) { // 5 minutes
          console.log(`[${new Date().toISOString()}] Cleaning up inactive connection: ${socketId}`);
          activeConnections.delete(socketId);
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
          }
        }
      }
    }, 60000); // Check every minute

    // Clean up interval on socket disconnect
    socket.on('disconnect', () => {
      clearInterval(cleanup);
    });
  });

  return io;
}; 