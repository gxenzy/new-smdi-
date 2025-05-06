import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, NotificationPreferences, NotificationType } from '../types';

interface UserContextType {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setNotificationPreferences: (prefs: NotificationPreferences) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Auditor', email: 'alice@example.com', role: UserRole.AUDITOR, team: 'Team A' },
  { id: '2', name: 'Bob Manager', email: 'bob@example.com', role: UserRole.MANAGER, team: 'Team A' },
  { id: '3', name: 'Carol Admin', email: 'carol@example.com', role: UserRole.ADMIN, team: 'HQ' },
  { id: '4', name: 'Dave Auditor', email: 'dave@example.com', role: UserRole.AUDITOR, team: 'Team B' },
];

const defaultUser = { ...mockUsers[0], notificationPreferences: { enabled: true, types: [NotificationType.Info, NotificationType.Success, NotificationType.Warning, NotificationType.Error] } };

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(mockUsers.map(u => ({ ...u, notificationPreferences: { enabled: true, types: [NotificationType.Info, NotificationType.Success, NotificationType.Warning, NotificationType.Error] } })));
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const setNotificationPreferences = (prefs: NotificationPreferences) => {
    setCurrentUser(prev => ({ ...prev, notificationPreferences: prefs }));
  };

  return (
    <UserContext.Provider value={{ users, currentUser, setCurrentUser, setNotificationPreferences }}>
      {children}
    </UserContext.Provider>
  );
}; 