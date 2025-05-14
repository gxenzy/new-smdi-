import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import energyAuditWebSocketService, { UserPresence, WebSocketEvent } from '../services/energyAuditWebSocketService';

/**
 * Hook for real-time energy audit collaboration and activity tracking
 * 
 * Manages WebSocket connections, user presence, and real-time events
 */
const useEnergyAuditRealTime = (auditId: string) => {
  const { currentUser } = useAuthContext();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline' | 'pending' | 'completed' | 'idle'>('offline');

  // Connect to the WebSocket service when the audit ID changes
  useEffect(() => {
    if (!auditId || !currentUser) return;

    // Connect to the WebSocket service
    const connectToService = async () => {
      try {
        const connected = await energyAuditWebSocketService.connect(
          auditId,
          currentUser.id,
          currentUser.name || 'Anonymous'
        );

        if (connected) {
          setIsConnected(true);
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Failed to connect to real-time service:', error);
        setSyncStatus('error');
      }
    };

    connectToService();

    // Set up simulation of mock active users
    setActiveUsers(energyAuditWebSocketService.getMockActiveUsers());

    // Disconnect when component unmounts or auditId changes
    return () => {
      energyAuditWebSocketService.disconnect();
      setIsConnected(false);
      setSyncStatus('offline');
    };
  }, [auditId, currentUser]);

  // Handle WebSocket events
  useEffect(() => {
    if (!auditId) return;

    // Event handler
    const handleEvent = (event: WebSocketEvent) => {
      setLastEvent(event);

      // Handle different event types
      switch (event.type) {
        case 'userList':
        case 'presence':
          // Update active users
          if (event.data.users) {
            setActiveUsers(event.data.users);
          } else if (event.data.userId) {
            // Single user presence update
            setActiveUsers(prevUsers => {
              const existingUserIndex = prevUsers.findIndex(u => u.userId === event.data.userId);
              
              if (existingUserIndex >= 0) {
                // Update existing user
                const updatedUsers = [...prevUsers];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  ...event.data
                };
                return updatedUsers;
              } else {
                // Add new user
                return [...prevUsers, event.data];
              }
            });
          }
          break;
          
        case 'sync':
          // Sync status update
          setSyncStatus(event.data.status);
          break;
          
        default:
          // Handle other event types as needed
          break;
      }
    };

    // Register event handler
    energyAuditWebSocketService.onEvent(handleEvent);

    // Cleanup
    return () => {
      energyAuditWebSocketService.offEvent(handleEvent);
    };
  }, [auditId]);

  // Update user presence (status and activity)
  const updateUserPresence = useCallback((status: string, activity?: string) => {
    if (isConnected) {
      // Map status string to one of the expected values
      const normalizedStatus = 
        status === 'viewing' || status === 'editing' ? 'online' :
        status === 'away' ? 'away' : 
        status === 'offline' ? 'offline' : 'online';
        
      energyAuditWebSocketService.updatePresence(normalizedStatus as 'online' | 'offline' | 'away', activity || status);
    }
  }, [isConnected]);

  // Send notification about an event
  const sendNotification = useCallback((type: string, message: string) => {
    if (isConnected) {
      energyAuditWebSocketService.sendEvent('notification', { type, message });
    }
  }, [isConnected]);

  // Notify that a sync has started
  const notifySyncStarted = useCallback((resourceId: string, resourceType: string) => {
    if (isConnected) {
      energyAuditWebSocketService.sendEvent('sync', {
        status: 'syncing',
        resourceId,
        resourceType,
        userId: currentUser?.id,
        userName: currentUser?.name
      });
      setSyncStatus('syncing');
    }
  }, [isConnected, currentUser]);

  // Notify that a sync has completed
  const notifySyncCompleted = useCallback((resourceId: string, status: 'success' | 'error') => {
    if (isConnected) {
      energyAuditWebSocketService.sendEvent('sync', {
        status: status === 'success' ? 'synced' : 'error',
        resourceId,
        userId: currentUser?.id,
        userName: currentUser?.name
      });
      setSyncStatus(status === 'success' ? 'synced' : 'error');
    }
  }, [isConnected, currentUser]);

  // Refresh data with notification
  const refreshWithNotification = useCallback(async () => {
    // This would trigger a data refresh in a real app
    notifySyncStarted(auditId, 'audit');
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    notifySyncCompleted(auditId, 'success');
    return true;
  }, [auditId, notifySyncStarted, notifySyncCompleted]);

  // Log user activity
  const logAuditActivity = useCallback((type: string, resourceId: string) => {
    if (isConnected) {
      energyAuditWebSocketService.sendEvent('activity', {
        type,
        resourceId,
        auditId,
        timestamp: Date.now()
      });
    }
  }, [isConnected, auditId]);

  return {
    isConnected,
    activeUsers,
    lastEvent,
    syncStatus,
    updateUserPresence,
    sendNotification,
    notifySyncStarted,
    notifySyncCompleted,
    refreshWithNotification,
    logAuditActivity
  };
};

// Export the hook as both default and named export
export { useEnergyAuditRealTime };
export default useEnergyAuditRealTime; 