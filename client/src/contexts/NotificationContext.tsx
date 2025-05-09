import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUserContext } from './UserContext';
import type { Notification, NotificationType } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAllRead: () => void; // alias for markAllAsRead
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentUser } = useUserContext();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Respect user notification preferences
    const prefs = currentUser.notificationPreferences;
    if (prefs && (!prefs.enabled || !prefs.types.includes(notification.type as NotificationType))) {
      return;
    }
    setNotifications(prev => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, markAllRead: markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within a NotificationProvider');
  return context;
}; 