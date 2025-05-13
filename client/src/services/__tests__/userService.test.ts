import axios from 'axios';
import userService from '../userService';
import { User } from '../../types/users';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
    ];

    it('should fetch users successfully', async () => {
      // Setup
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUsers
        }
      });

      // Execute
      const result = await userService.getAllUsers();

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle API errors', async () => {
      // Setup
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Failed to fetch users'
        }
      });

      // Execute and verify
      await expect(userService.getAllUsers()).rejects.toThrow('Failed to fetch users');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users');
    });

    it('should handle network errors', async () => {
      // Setup
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Execute and verify
      await expect(userService.getAllUsers()).rejects.toThrow('Network error');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users');
    });
  });

  describe('getUserById', () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    };

    it('should fetch a user by ID successfully', async () => {
      // Setup
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUser
        }
      });

      // Execute
      const result = await userService.getUserById(1);

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should handle API errors when fetching by ID', async () => {
      // Setup
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'User not found'
        }
      });

      // Execute and verify
      await expect(userService.getUserById(999)).rejects.toThrow('User not found');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users/999');
    });

    it('should handle network errors when fetching by ID', async () => {
      // Setup
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Execute and verify
      await expect(userService.getUserById(1)).rejects.toThrow('Network error');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/users/1');
    });
  });
}); 