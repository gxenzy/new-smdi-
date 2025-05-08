const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let latestAudits = [];

wss.on('connection', (ws) => {
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
    }
  });

  ws.on('close', () => {
    // Optionally handle disconnects
  });
});

console.log('WebSocket server running on ws://localhost:8080'); 