import { useState, useEffect, useCallback } from 'react';
import energyAuditWebSocketService, { WebSocketEvent } from '../services/energyAuditWebSocketService';

type UserPresenceStatus = 'viewing' | 'editing' | 'idle';

interface ActiveUser {
  id: string;
  name: string;
  status: UserPresenceStatus;
  lastActive: string;
  color?: string;
}

interface UseEnergyAuditRealTimeReturn {
  isConnected: boolean;
  activeUsers: ActiveUser[];
  lastEvent: WebSocketEvent<any> | null;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  updateUserPresence: (auditId: string, status: UserPresenceStatus) => void;
  notifySyncCompleted: (auditId: string, status: 'success' | 'error', message: string) => void;
  subscribeToEvent: <T>(eventType: string, callback: (event: WebSocketEvent<T>) => void) => () => void;
  refreshWithNotification: () => Promise<boolean>;
  unsubscribeFromAllEvents: () => void;
}

// Random color generator for user avatars
const getRandomColor = () => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const useEnergyAuditRealTime = (auditId: string): UseEnergyAuditRealTimeReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent<any> | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');

  // Initialize the WebSocket connection when the component mounts
  useEffect(() => {
    const connect = async () => {
      try {
        await energyAuditWebSocketService.connect();
        setIsConnected(true);
        setSyncStatus('synced');
        
        // Send initial presence
        updateUserPresence(auditId, 'viewing');
      } catch (error) {
        console.error('Failed to connect to WebSocket', error);
        setIsConnected(false);
        setSyncStatus('offline');
      }
    };
    
    connect();
    
    // Clean up the WebSocket connection when the component unmounts
    return () => {
      energyAuditWebSocketService.disconnect();
    };
  }, [auditId]);
  
  // Set up listeners for presence events
  useEffect(() => {
    if (!isConnected) return;
    
    const handlePresenceEvent = (event: WebSocketEvent<any>) => {
      // Update active users based on presence events
      if (event.type === 'userPresence') {
        // Extract user data from the event
        const userData = event.data;
        
        setActiveUsers(prev => {
          // If user already exists, update their status
          if (prev.some(u => u.id === userData.userId)) {
            return prev.map(user => 
              user.id === userData.userId
                ? { 
                    ...user, 
                    status: userData.status,
                    lastActive: event.timestamp
                  }
                : user
            );
          }
          
          // Otherwise add new user
          return [
            ...prev,
            {
              id: userData.userId,
              name: userData.userName || `User ${userData.userId.substring(0, 5)}`,
              status: userData.status,
              lastActive: event.timestamp,
              color: getRandomColor()
            }
          ];
        });
      }
      
      // Handle user disconnect
      if (event.type === 'userDisconnected') {
        setActiveUsers(prev => 
          prev.filter(user => user.id !== event.userId)
        );
      }
      
      // Update last event
      setLastEvent(event);
    };
    
    // Subscribe to presence events
    const unsubPresence = energyAuditWebSocketService.presenceEvents$.subscribe(handlePresenceEvent);
    
    // Subscribe to connection status events
    const unsubConnection = energyAuditWebSocketService.connectionStatusEvents$.subscribe(status => {
      setIsConnected(status === 'connected');
      setSyncStatus(status === 'connected' ? 'synced' : 'offline');
    });
    
    // Subscribe to all audit events to update lastEvent
    const unsubAudit = energyAuditWebSocketService.auditEvents$.subscribe(event => {
      setLastEvent(event);
    });
    
    return () => {
      unsubPresence.unsubscribe();
      unsubConnection.unsubscribe();
      unsubAudit.unsubscribe();
    };
  }, [isConnected, auditId]);
  
  // Get active users on initial load
  useEffect(() => {
    if (!isConnected) return;
    
    // Request active users for this audit
    energyAuditWebSocketService.sendMessage({
      type: 'getActiveUsers',
      auditId,
      timestamp: new Date().toISOString()
    });
  }, [isConnected, auditId]);
  
  // Update user presence
  const updateUserPresence = useCallback((auditId: string, status: UserPresenceStatus) => {
    if (!isConnected) return;
    
    energyAuditWebSocketService.sendMessage({
      type: 'userPresence',
      auditId,
      timestamp: new Date().toISOString(),
      data: {
        userId: 'current-user', // In a real app, this would come from auth
        userName: 'Current User', // In a real app, this would come from auth
        status
      }
    });
  }, [isConnected]);
  
  // Notify others about sync status
  const notifySyncCompleted = useCallback((auditId: string, status: 'success' | 'error', message: string) => {
    if (!isConnected) return;
    
    energyAuditWebSocketService.sendMessage({
      type: 'syncCompleted',
      auditId,
      timestamp: new Date().toISOString(),
      data: {
        status,
        message,
        userId: 'current-user' // In a real app, this would come from auth
      }
    });
  }, [isConnected]);
  
  // Subscribe to a specific WebSocket event
  const subscribeToEvent = useCallback(<T extends any>(
    eventType: string,
    callback: (event: WebSocketEvent<T>) => void
  ): (() => void) => {
    // Create a filter function that matches events by type
    const filterFn = (event: WebSocketEvent<any>) => {
      return event.type === eventType && (!auditId || event.auditId === auditId);
    };
    
    // Subscribe to event streams based on event type category
    if (eventType.includes('audit')) {
      const subscription = energyAuditWebSocketService.auditEvents$
        .filter(filterFn)
        .subscribe(callback);
      return () => subscription.unsubscribe();
    }
    
    if (eventType.includes('finding')) {
      const subscription = energyAuditWebSocketService.findingEvents$
        .filter(filterFn)
        .subscribe(callback);
      return () => subscription.unsubscribe();
    }
    
    if (eventType.includes('sync')) {
      const subscription = energyAuditWebSocketService.syncEvents$
        .filter(filterFn)
        .subscribe(callback);
      return () => subscription.unsubscribe();
    }
    
    if (eventType.includes('presence') || eventType.includes('user')) {
      const subscription = energyAuditWebSocketService.presenceEvents$
        .filter(filterFn)
        .subscribe(callback);
      return () => subscription.unsubscribe();
    }
    
    // Default to all events
    const subscription = energyAuditWebSocketService.allEvents$
      .filter(filterFn)
      .subscribe(callback);
    return () => subscription.unsubscribe();
  }, [auditId]);
  
  // Refresh data and notify others
  const refreshWithNotification = useCallback(async (): Promise<boolean> => {
    setSyncStatus('syncing');
    
    try {
      // In a real app, this would refresh data from the server
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Notify others that we've refreshed
      notifySyncCompleted(auditId, 'success', 'Data refreshed successfully');
      
      setSyncStatus('synced');
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSyncStatus('error');
      
      // Notify others about the failure
      notifySyncCompleted(auditId, 'error', 'Failed to refresh data');
      
      return false;
    }
  }, [auditId, notifySyncCompleted]);
  
  // Unsubscribe from all events
  const unsubscribeFromAllEvents = useCallback(() => {
    energyAuditWebSocketService.unsubscribeAll();
  }, []);
  
  // Clean up when component unmounts or auditId changes
  useEffect(() => {
    return () => {
      // Let others know we're no longer viewing this audit
      if (isConnected) {
        energyAuditWebSocketService.sendMessage({
          type: 'userDisconnected',
          auditId,
          timestamp: new Date().toISOString(),
          userId: 'current-user' // In a real app, this would come from auth
        });
      }
    };
  }, [auditId, isConnected]);
  
  return {
    isConnected,
    activeUsers,
    lastEvent,
    syncStatus,
    updateUserPresence,
    notifySyncCompleted,
    subscribeToEvent,
    refreshWithNotification,
    unsubscribeFromAllEvents
  };
};

export default useEnergyAuditRealTime;
export { useEnergyAuditRealTime }; 