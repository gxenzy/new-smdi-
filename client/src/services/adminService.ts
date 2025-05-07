import axios from 'axios';
import { User, SystemSettings, UserRole } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/api/admin/users`);
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/api/admin/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.post(`${API_URL}/api/admin/users`, userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`${API_URL}/api/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/admin/users/${id}`);
};

export const toggleUserStatus = async (id: number): Promise<User> => {
  const response = await axios.patch(`${API_URL}/api/admin/users/${id}/toggle-status`);
  return response.data;
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await axios.get(`${API_URL}/api/admin/settings`);
  return response.data;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await axios.put(`${API_URL}/api/admin/settings`, settings);
  return response.data;
};

// Role Management
export const getRoles = async (): Promise<UserRole[]> => {
  const response = await axios.get(`${API_URL}/api/admin/roles`);
  return response.data;
};

export const updateUserRole = async (userId: number, role: UserRole): Promise<User> => {
  const response = await axios.patch(`${API_URL}/api/admin/users/${userId}/role`, { role });
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
  const response = await axios.get(`${API_URL}/api/admin/audit-logs`, { params });
  return response.data;
};

// User Activity
export const getUserActivity = async (userId: number): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/api/admin/users/${userId}/activity`);
  return response.data;
};

// Password Reset
export const resetUserPassword = async (userId: number): Promise<void> => {
  await axios.post(`${API_URL}/api/admin/users/${userId}/reset-password`);
};

// Bulk Operations
export const bulkUpdateUsers = async (userIds: number[], updates: Partial<User>): Promise<User[]> => {
  const response = await axios.patch(`${API_URL}/api/admin/users/bulk-update`, {
    userIds,
    updates
  });
  return response.data;
};

export const bulkDeleteUsers = async (userIds: number[]): Promise<void> => {
  await axios.post(`${API_URL}/api/admin/users/bulk-delete`, { userIds });
}; 