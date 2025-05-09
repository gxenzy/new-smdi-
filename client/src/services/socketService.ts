import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

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
  totalConsumption: number;
  peakDemand: number;
  averageLoad: number;
  powerFactor: number;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8000';
  private powerDataSubject = new Subject<PowerUsageData>();
  private energyMetricsSubject = new Subject<EnergyMetrics>();
  private connectionStatusSubject = new Subject<boolean>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  public powerData$ = this.powerDataSubject.asObservable();
  public energyMetrics$ = this.energyMetricsSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring() {
    setInterval(() => {
      if (!this.socket?.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect();
      }
    }, 5000);
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.setupEventHandlers();
    }
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('powerUsage', (data: PowerUsageData) => {
      this.powerDataSubject.next(data);
    });

    this.socket.on('energyMetrics', (data: EnergyMetrics) => {
      this.energyMetricsSubject.next(data);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  public startMonitoring() {
    const socket = this.connect();
    socket.emit('startMonitoring');
  }

  public stopMonitoring() {
    if (this.socket) {
      this.socket.emit('stopMonitoring');
    }
  }

  public getEnergyMetrics(): Promise<EnergyMetrics> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('getEnergyMetrics', (response: { data?: EnergyMetrics; error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.data) {
          resolve(response.data);
        } else {
          reject(new Error('Invalid response format'));
        }
      });
    });
  }

  public getHistoricalData(startDate: Date, endDate: Date): Promise<PowerUsageData[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('getHistoricalData', { startDate, endDate }, 
        (response: { data?: PowerUsageData[]; error?: string }) => {
          if (response.error) {
            reject(new Error(response.error));
          } else if (response.data) {
            resolve(response.data);
          } else {
            reject(new Error('Invalid response format'));
          }
        }
      );
    });
  }

  public onUserPresence(): Observable<string[]> {
    const subject = new Subject<string[]>();
    
    if (this.socket) {
      this.socket.on('onlineUsers', (users: string[]) => {
        subject.next(users);
      });
    }

    return subject.asObservable();
  }

  public emitUserOnline(userId: string) {
    if (this.socket) {
      this.socket.emit('userOnline', userId);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService; 