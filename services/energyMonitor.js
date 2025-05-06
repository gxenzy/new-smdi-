const mysql = require('mysql2');
const WebSocket = require('ws');

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'smdi',
  password: 'SMD1SQLADM1N',
  database: 'smdidb'
});

class EnergyMonitorService {
  constructor() {
    this.devices = new Map();
    this.clients = new Set();
    this.monitoringInterval = null;
  }

  async initialize() {
    try {
      // Initialize WebSocket server
      this.wss = new WebSocket.Server({ port: 8080 });
      
      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        
        ws.on('close', () => {
          this.clients.delete(ws);
        });
      });

      // Load registered devices from MySQL
      console.log('Loading registered devices from MySQL...');
      db.query('SELECT * FROM MonitoringDevice WHERE status = "active"', (err, results) => {
        if (err) {
          console.error('Error loading devices:', err);
          return;
        }
        results.forEach(device => {
          this.devices.set(device.deviceId, {
            ...device,
            baseLoad: Math.random() * 500 + 200, // Random base load between 200-700W
            variation: Math.random() * 0.2 + 0.1, // Random variation 10-30%
          });
        });
      });

      // Start monitoring
      this.startMonitoring();
    } catch (error) {
      console.error('Error initializing energy monitor service:', error);
    }
  }

  startMonitoring() {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(async () => {
      try {
        const readings = [];
        const timestamp = new Date();

        // Generate readings for each device
        for (const [deviceId, device] of this.devices) {
          const reading = this.generateReading(device, timestamp);
          readings.push(reading);

          // Save to MySQL
          const query = 'INSERT INTO EnergyReading (timestamp, consumption, voltage, current, powerFactor, location, deviceId) VALUES (?, ?, ?, ?, ?, ?, ?)';
          db.query(query, [timestamp, reading.consumption, reading.voltage, reading.current, reading.powerFactor, reading.location, deviceId], (err) => {
            if (err) {
              console.error(`Error saving reading for device ${deviceId}:`, err);
            }
          });
        }

        // Broadcast readings to connected clients
        const message = JSON.stringify({
          type: 'readings',
          data: readings,
          timestamp
        });

        this.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });

      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  async addDevice(deviceData) {
    try {
      const query = 'INSERT INTO MonitoringDevice (deviceId, name, location, type, status) VALUES (?, ?, ?, ?, ?)';
      await db.promise().query(query, [deviceData.deviceId, deviceData.name, deviceData.location, deviceData.type, deviceData.status]);
      this.devices.set(deviceData.deviceId, deviceData);
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  }

  async updateDevice(deviceId, updates) {
    try {
      const query = 'UPDATE MonitoringDevice SET ? WHERE deviceId = ?';
      await db.promise().query(query, [updates, deviceId]);
      // Update the local devices map
      if (this.devices.has(deviceId)) {
        this.devices.set(deviceId, { ...this.devices.get(deviceId), ...updates });
      }
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  async removeDevice(deviceId) {
    try {
      const query = 'DELETE FROM MonitoringDevice WHERE deviceId = ?';
      await db.promise().query(query, [deviceId]);
      this.devices.delete(deviceId);
    } catch (error) {
      console.error('Error removing device:', error);
      throw error;
    }
  }

  generateReading(device, timestamp) {
    // Generate realistic-looking energy consumption data
    const timeOfDay = timestamp.getHours();
    let loadFactor = 1;

    // Simulate daily load patterns
    if (timeOfDay >= 9 && timeOfDay <= 17) {
      // Peak hours (9 AM - 5 PM)
      loadFactor = 1.5;
    } else if (timeOfDay >= 23 || timeOfDay <= 5) {
      // Off-peak hours (11 PM - 5 AM)
      loadFactor = 0.5;
    }

    // Add some random variation
    const variation = (Math.random() * 2 - 1) * device.variation;
    const baseConsumption = device.baseLoad * loadFactor;
    const consumption = Math.max(0, baseConsumption * (1 + variation));

    // Generate correlated electrical parameters
    const voltage = 220 + (Math.random() * 10 - 5); // 220V ±5V
    const current = consumption / voltage;
    const powerFactor = 0.85 + Math.random() * 0.1; // 0.85-0.95

    return {
      deviceId: device.deviceId,
      timestamp,
      consumption,
      voltage,
      current,
      powerFactor,
      location: device.location
    };
  }

  getDeviceStatus(deviceId) {
    return this.devices.has(deviceId) ? 'active' : 'inactive';
  }

  getConnectedClientsCount() {
    return this.clients.size;
  }
}

// Create singleton instance
const energyMonitor = new EnergyMonitorService();

module.exports = energyMonitor;
