import axios from 'axios';
import { User, ProfileUpdateData, UserPreferences } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

export const getProfile = async (): Promise<User> => {
  const response = await axios.get(`${API_URL}/profile`);
  return response.data;
};

export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
  const response = await axios.put(`${API_URL}/profile`, data);
  return response.data;
};

export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> => {
  await axios.put(`${API_URL}/profile/password`, data);
};

export const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<User> => {
  const response = await axios.put(`${API_URL}/profile/preferences`, { preferences });
  return response.data;
};

export const uploadProfilePicture = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await axios.post(`${API_URL}/profile/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const deleteProfilePicture = async (): Promise<void> => {
  await axios.delete(`${API_URL}/profile/picture`);
};

export const getActivityHistory = async (): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/profile/activity`);
  return response.data;
};

export const getNotificationPreferences = async (): Promise<UserPreferences['notifications']> => {
  const response = await axios.get(`${API_URL}/profile/notifications`);
  return response.data;
};

export const updateNotificationPreferences = async (
  preferences: UserPreferences['notifications']
): Promise<User> => {
  const response = await axios.put(`${API_URL}/profile/notifications`, { preferences });
  return response.data;
};

export const requestDataExport = async (): Promise<{ downloadUrl: string }> => {
  const response = await axios.post(`${API_URL}/profile/export-data`);
  return response.data;
};

export const deleteAccount = async (password: string): Promise<void> => {
  await axios.post(`${API_URL}/profile/delete-account`, { password });
}; 