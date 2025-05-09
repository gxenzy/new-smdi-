import { io, Socket } from 'socket.io-client';

export interface PowerUsageData {
  timestamp: string;
  powerUsage: number;
  voltage: number;
  current: number;
  powerFactor: number;
  frequency: number;
  temperature: number;
  humidity: number;
}

export interface EnergyMetrics {
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  peakDemand: number;
  averagePowerFactor: number;
  totalCost: number;
}

class RealTimeService {
  private socket: Socket | null = null;
  private readonly serverUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

  connect() {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  startMonitoring(
    onPowerData: (data: PowerUsageData) => void,
    onMetrics: (data: EnergyMetrics) => void
  ) {
    const socket = this.connect();
    socket.emit('startMonitoring');

    socket.on('powerUsage', onPowerData);
    socket.on('energyMetrics', onMetrics);
  }

  stopMonitoring() {
    if (this.socket) {
      this.socket.emit('stopMonitoring');
      this.socket.off('powerUsage');
      this.socket.off('energyMetrics');
    }
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<PowerUsageData[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('getHistoricalData', { startDate, endDate }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  }

  async getEnergyMetrics(): Promise<EnergyMetrics> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('getEnergyMetrics', (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService; 