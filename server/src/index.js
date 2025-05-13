const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

// Log loaded environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
logger.info(`Reading .env from: ${process.cwd()}/${envFile}`);

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });
let latestAudits = [];

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  
  // Send the latest audits to the new client
  if (latestAudits.length > 0) {
    ws.send(JSON.stringify(latestAudits));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (Array.isArray(data) && data[0]?.id && data[0]?.name) {
        latestAudits = data;
        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(latestAudits));
          }
        });
      }
    } catch (e) {
      // Ignore invalid messages
      logger.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

// Make the WebSocket server available to the app
app.set('wss', wss);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API endpoint: http://localhost:${PORT}/api`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}`);
}); 