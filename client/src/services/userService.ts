import axios from 'axios';
import { User } from '../types/users';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Service for user-related API operations
 */
const userService = {
  /**
   * Get all users
   * @returns Promise with array of users
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get users');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param id User ID
   * @returns Promise with user data
   */
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get user');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      throw error;
    }
  },
};

export default userService; 