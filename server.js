const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const logoutRoutes = require('./routes/logout');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust to your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

// Enable CORS with credentials support
app.use(cors({
  origin: 'http://localhost:3000', // Adjust to your frontend URL
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', logoutRoutes);

// Websocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules to emit events
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
