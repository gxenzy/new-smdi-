import { useState, useEffect } from 'react';
import useEnergyAuditRealTime from './useEnergyAuditRealTime';
import type { WebSocketEvent, UserPresence } from '../services/energyAuditWebSocketService';
import type { ActivityLogEvent } from '../components/EnergyAudit/ActivityLog';

// Extend the WebSocketEvent interface to include the id property
declare module '../services/energyAuditWebSocketService' {
  interface WebSocketEvent {
    id?: string;
  }
}

/**
 * Custom hook to combine real-time features with activity tracking
 */
const useEnergyAuditRealTimeActivity = (auditId: string) => {
  const realTimeState = useEnergyAuditRealTime(auditId);
  
  const [recentActivities, setRecentActivities] = useState<ActivityLogEvent[]>([]);
  const [recentCollaborators, setRecentCollaborators] = useState<UserPresence[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);

  useEffect(() => {
    // Track when other users join
    if (realTimeState.activeUsers.length > 1) {
      setIsCollaborating(true);
      setRecentCollaborators(realTimeState.activeUsers.filter(u => u.userId !== '1')); // Current user ID would be in a real app
    } else {
      setIsCollaborating(false);
    }
  }, [realTimeState.activeUsers]);

  useEffect(() => {
    // Add new events to activity log
    if (realTimeState.lastEvent && realTimeState.lastEvent.type !== 'heartbeat') {
      const newActivity: ActivityLogEvent = {
        id: realTimeState.lastEvent.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: realTimeState.lastEvent.timestamp || Date.now(),
        type: realTimeState.lastEvent.type,
        message: `${realTimeState.lastEvent.userName || 'Unknown User'} performed ${realTimeState.lastEvent.type}`,
        userId: realTimeState.lastEvent.userId || 'unknown-user',
        userName: realTimeState.lastEvent.userName || 'Unknown User',
        details: realTimeState.lastEvent.data
      };

      setRecentActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
    }
  }, [realTimeState.lastEvent]);

  // Log an activity
  const logAuditActivity = (
    action: string,
    message: string,
    details?: any
  ): void => {
    const activityEvent: ActivityLogEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type: action,
      message,
      userId: '1', // Current user ID would be in a real app
      userName: 'Current User', // Current user name would be in a real app
      details
    };

    // Add to local state
    setRecentActivities(prev => [activityEvent, ...prev].slice(0, 50));

    // In a real implementation, send to server
    console.log('Activity logged:', action, message);
  };

  // Set user online status with optional activity parameter
  const setUserStatus = (status: 'online' | 'away' | 'offline', activity?: string): void => {
    realTimeState.updateUserPresence(status, activity);
  };

  return {
    ...realTimeState,
    recentActivities,
    recentCollaborators,
    isCollaborating,
    logAuditActivity,
    setUserStatus
  };
};

export default useEnergyAuditRealTimeActivity; 