import { Server } from 'socket.io';
import { createServer } from 'http';
import { PowerUsageData, EnergyMetrics } from '../../client/src/services/realTimeService';
import { pool } from './config/database';
import { RowDataPacket } from 'mysql2/promise';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

interface MonitoringState {
  isMonitoring: boolean;
  interval: NodeJS.Timeout | null;
}

const monitoringStates = new Map<string, MonitoringState>();

interface PowerReadingResult extends RowDataPacket {
  daily_usage: number;
  weekly_usage: number;
  monthly_usage: number;
  peak_demand: number;
  avg_power_factor: number;
}

// Simulated power usage data generation
const generatePowerUsageData = (): PowerUsageData => {
  const baseLoad = 50; // Base load in kW
  const randomVariation = Math.random() * 20 - 10; // Random variation ±10 kW
  const timeVariation = Math.sin(Date.now() / 3600000 * Math.PI * 2) * 15; // Daily pattern

  return {
    timestamp: new Date().toISOString(),
    powerUsage: Math.max(0, baseLoad + randomVariation + timeVariation),
    voltage: 220 + (Math.random() * 10 - 5),
    current: (baseLoad + randomVariation + timeVariation) / 220,
    powerFactor: 0.85 + (Math.random() * 0.1),
    frequency: 60 + (Math.random() * 0.2 - 0.1),
    temperature: 25 + (Math.random() * 5),
    humidity: 50 + (Math.random() * 20),
  };
};

// Calculate energy metrics
const calculateEnergyMetrics = async (): Promise<EnergyMetrics> => {
  try {
    // In a real application, you would fetch this data from your database
    const [dailyUsageResult] = await pool.query<PowerReadingResult[]>(
      'SELECT SUM(power_usage) as daily_usage FROM power_readings WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );
    const [weeklyUsageResult] = await pool.query<PowerReadingResult[]>(
      'SELECT SUM(power_usage) as weekly_usage FROM power_readings WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 WEEK)'
    );
    const [monthlyUsageResult] = await pool.query<PowerReadingResult[]>(
      'SELECT SUM(power_usage) as monthly_usage FROM power_readings WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 MONTH)'
    );
    const [peakDemandResult] = await pool.query<PowerReadingResult[]>(
      'SELECT MAX(power_usage) as peak_demand FROM power_readings WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );
    const [powerFactorResult] = await pool.query<PowerReadingResult[]>(
      'SELECT AVG(power_factor) as avg_power_factor FROM power_readings WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );

    const dailyUsage = dailyUsageResult[0]?.daily_usage || 0;
    const weeklyUsage = weeklyUsageResult[0]?.weekly_usage || 0;
    const monthlyUsage = monthlyUsageResult[0]?.monthly_usage || 0;
    const peakDemand = peakDemandResult[0]?.peak_demand || 0;
    const avgPowerFactor = powerFactorResult[0]?.avg_power_factor || 0;

    // Calculate cost based on rate (₱8.50/kWh)
    const rate = 8.50;
    const totalCost = dailyUsage * rate;

    return {
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      peakDemand,
      averagePowerFactor: avgPowerFactor,
      totalCost,
    };
  } catch (error) {
    console.error('Error calculating energy metrics:', error);
    return {
      dailyUsage: 0,
      weeklyUsage: 0,
      monthlyUsage: 0,
      peakDemand: 0,
      averagePowerFactor: 0,
      totalCost: 0,
    };
  }
};

// Store power usage data
const storePowerUsageData = async (data: PowerUsageData) => {
  try {
    await pool.query(
      'INSERT INTO power_readings (timestamp, power_usage, voltage, current, power_factor, frequency, temperature, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.timestamp,
        data.powerUsage,
        data.voltage,
        data.current,
        data.powerFactor,
        data.frequency,
        data.temperature,
        data.humidity,
      ]
    );
  } catch (error) {
    console.error('Error storing power usage data:', error);
  }
};

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('startMonitoring', () => {
    if (monitoringStates.has(socket.id)) {
      return;
    }

    const interval = setInterval(async () => {
      const powerData = generatePowerUsageData();
      await storePowerUsageData(powerData);
      socket.emit('powerUsage', powerData);

      // Update energy metrics every minute
      if (Date.now() % 60000 < 1000) {
        const metrics = await calculateEnergyMetrics();
        socket.emit('energyMetrics', metrics);
      }
    }, 1000);

    monitoringStates.set(socket.id, { isMonitoring: true, interval });
  });

  socket.on('stopMonitoring', () => {
    const state = monitoringStates.get(socket.id);
    if (state?.interval) {
      clearInterval(state.interval);
    }
    monitoringStates.delete(socket.id);
  });

  socket.on('getHistoricalData', async ({ startDate, endDate }, callback) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM power_readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC',
        [startDate, endDate]
      );
      callback({ data: rows });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      callback({ error: 'Failed to fetch historical data' });
    }
  });

  socket.on('getEnergyMetrics', async (callback) => {
    try {
      const metrics = await calculateEnergyMetrics();
      callback({ data: metrics });
    } catch (error) {
      console.error('Error fetching energy metrics:', error);
      callback({ error: 'Failed to fetch energy metrics' });
    }
  });

  socket.on('disconnect', () => {
    const state = monitoringStates.get(socket.id);
    if (state?.interval) {
      clearInterval(state.interval);
    }
    monitoringStates.delete(socket.id);
    console.log('Client disconnected');
  });
});

const PORT = process.env.WS_PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Real-time server running on port ${PORT}`);
}); 