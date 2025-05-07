import { User, SystemSettings, UserRole } from '../types';
import api from './api';

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const toggleUserStatus = async (id: string): Promise<User> => {
  const response = await api.patch(`/users/${id}/toggle-status`);
  return response.data;
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put('/settings', settings);
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
export const getAuditLogs = async (params: {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: any[]; total: number }> => {
  const response = await api.get('/audit-logs', { params });
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