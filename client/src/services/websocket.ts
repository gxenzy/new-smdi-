import { Subject } from 'rxjs';

interface EnergyReading {
  deviceId: string;
  timestamp: Date;
  consumption: number;
  voltage: number;
  current: number;
  powerFactor: number;
  location: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 5000; // 5 seconds
  private readingsSubject = new Subject<EnergyReading[]>();

  public readings$ = this.readingsSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'readings') {
            // Convert timestamps to Date objects
            const readings = message.data.map((reading: any) => ({
              ...reading,
              timestamp: new Date(reading.timestamp)
            }));
            this.readingsSubject.next(readings);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Energy monitoring hooks
export const useEnergyReadings = () => {
  return wsService.readings$;
};

export default wsService;
