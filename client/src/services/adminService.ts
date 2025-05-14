import { User, SystemSettings, UserRole } from '../types';
import api from './api';

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/admin/users', userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const toggleUserStatus = async (userId: string): Promise<User> => {
  const response = await api.put<User>(`/admin/users/${userId}/toggle-status`);
  return response.data;
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get<SystemSettings>('/admin/settings');
  return response.data;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put<SystemSettings>('/admin/settings', settings);
  return response.data;
};

// Role Management
export const getRoles = async (): Promise<UserRole[]> => {
  const response = await api.get('/roles');
  return response.data;
};

export const updateUserRole = async (userId: number, role: UserRole): Promise<User> => {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
};

// Audit Logs
export const getAuditLogs = async (
  page: number = 1,
  limit: number = 20,
  filters?: {
    username?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }
): Promise<{
  logs: Array<{
    id: string;
    username: string;
    action: string;
    details: string;
    created_at: string;
  }>;
  count: number;
}> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filters) {
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
    if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
  }
  
  const response = await api.get(`/admin/audit-logs?${queryParams.toString()}`);
  return response.data;
};

// User Activity
export const getUserActivity = async (userId: number): Promise<any[]> => {
  const response = await api.get(`/users/${userId}/activity`);
  return response.data;
};

// Password Reset
export const resetUserPassword = async (userId: number): Promise<void> => {
  await api.post(`/users/${userId}/reset-password`);
};

// Bulk Operations
export const bulkUpdateUsers = async (userIds: string[], updates: Partial<User>): Promise<void> => {
  await api.patch('/users/bulk-update', { userIds, updates });
};

export const bulkDeleteUsers = async (userIds: string[]): Promise<void> => {
  await api.post('/users/bulk-delete', { userIds });
};

/**
 * Get system backup status
 */
export const getBackupStatus = async (): Promise<{ 
  lastBackupDate: Date | null;
  backupEnabled: boolean;
  nextBackupDate: Date | null;
  backupCount: number;
}> => {
  const response = await api.get('/admin/backup/status');
  return response.data;
};

/**
 * Trigger system backup
 */
export const createBackup = async (): Promise<{ success: boolean; message: string; backupId: string }> => {
  const response = await api.post('/admin/backup/create');
  return response.data;
};

/**
 * Restore system from backup
 */
export const restoreFromBackup = async (backupId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/admin/backup/restore/${backupId}`);
  return response.data;
};

/**
 * Get list of available backups
 */
export const getBackupList = async (): Promise<{ 
  id: string; 
  createdAt: Date; 
  size: string; 
  name: string 
}[]> => {
  const response = await api.get('/admin/backup/list');
  return response.data;
}; 