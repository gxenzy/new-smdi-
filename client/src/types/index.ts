// User roles for permission checks
export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  MANAGER = 'MANAGER',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER'
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
  username: string;
  email: string;
  role: UserRole;
  name: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout: string;
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

export interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  defaultRole: UserRole;
  passwordPolicy: {
    minLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    requireUppercase: boolean;
    requireLowercase: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  preferences?: Partial<UserPreferences>;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  attachments?: any[];
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Open' | 'In Progress' | 'Resolved';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'; 