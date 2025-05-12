/**
 * Energy Audit WebSocket Service
 * Handles real-time collaboration and events for energy audit components
 */

// Define types for user presence information
export interface UserPresence {
  userId: string;
  userName: string;
  status: string;
  currentView?: string;
  lastActivity?: number;
  auditId?: string;
}

// Define WebSocket event type
export interface WebSocketEvent {
  type: string;
  data: any;
  userId?: string;
  userName?: string;
  timestamp?: number;
}

class EnergyAuditWebSocketService {
  private socket: WebSocket | null = null;
  private eventListeners: Array<(event: WebSocketEvent) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private auditId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendEvent = this.sendEvent.bind(this);
    this.onEvent = this.onEvent.bind(this);
    this.offEvent = this.offEvent.bind(this);
    this.updatePresence = this.updatePresence.bind(this);
  }

  public connect(auditId: string, userId: string, userName: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.auditId = auditId;
        this.userId = userId;
        this.userName = userName;
        this.updatePresence('online', 'viewing');
        resolve(true);
        return;
      }

      this.auditId = auditId;
      this.userId = userId;
      this.userName = userName;

      // In a real implementation, we would connect to an actual WebSocket server
      // For now, we're creating a mock implementation
      console.log(`Connecting to WebSocket server for audit ${auditId}...`);
      
      // Simulate a successful connection
      setTimeout(() => {
        console.log('Connected to WebSocket server');
        this.isConnecting = false;
        resolve(true);
        
        // Simulate receiving initial user list
        this.notifyListeners({
          type: 'userList',
          data: {
            users: [
              {
                userId,
                userName,
                status: 'online',
                currentView: 'viewing',
                lastActivity: Date.now()
              }
            ]
          }
        });
      }, 500);
    });
  }

  public disconnect(): void {
    // Simulate disconnection from WebSocket server
    console.log('Disconnecting from WebSocket server');
    this.auditId = null;
    this.userId = null;
    this.userName = null;
  }

  public sendEvent(eventType: string, data: any): void {
    if (!this.auditId) {
      console.warn('Cannot send event: not connected to an audit');
      return;
    }

    // In a real implementation, we would send the event to the WebSocket server
    console.log(`Sending event: ${eventType}`, data);
    
    // Simulate the event being broadcasted back to all clients
    setTimeout(() => {
      this.notifyListeners({
        type: eventType,
        data,
        userId: this.userId || undefined,
        userName: this.userName || undefined,
        timestamp: Date.now()
      });
    }, 100);
  }

  public onEvent(callback: (event: WebSocketEvent) => void): void {
    this.eventListeners.push(callback);
  }

  public offEvent(callback: (event: WebSocketEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
  }

  public updatePresence(status: 'online' | 'offline' | 'away', activity?: string): void {
    if (!this.auditId || !this.userId) {
      console.warn('Cannot update presence: not connected to an audit');
      return;
    }
    
    const presenceData: UserPresence = {
      userId: this.userId,
      userName: this.userName || 'Unknown',
      status,
      currentView: activity,
      lastActivity: Date.now(),
      auditId: this.auditId
    };
    
    // Send presence update event
    this.sendEvent('presence', presenceData);
  }

  private notifyListeners(event: WebSocketEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  // Returns a static list of mock active users for development purposes
  public getMockActiveUsers(): UserPresence[] {
    return [
      {
        userId: this.userId || 'current-user',
        userName: this.userName || 'Current User',
        status: 'online',
        currentView: 'viewing',
        lastActivity: Date.now()
      },
      {
        userId: 'user-2',
        userName: 'Jane Doe',
        status: 'online',
        currentView: 'viewing dashboard',
        lastActivity: Date.now() - 120000
      },
      {
        userId: 'user-3',
        userName: 'John Smith',
        status: 'away',
        currentView: 'editing',
        lastActivity: Date.now() - 600000
      }
    ];
  }
}

// Create a singleton instance
const energyAuditWebSocketService = new EnergyAuditWebSocketService();

export default energyAuditWebSocketService; 