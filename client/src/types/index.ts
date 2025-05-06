// User roles for permission checks
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AUDITOR = 'AUDITOR',
}

export const enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error'
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  types: NotificationType[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  notifications?: any[];
  createdAt?: string;
  updatedAt?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 