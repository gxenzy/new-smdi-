import api from './api';
import { User, UserRole } from '../types';
import jwt_decode from 'jwt-decode';

interface LoginResponse {
  token: string;
  user: User;
}

interface TokenPayload {
  id: string;
  username: string;
  role: UserRole;
  exp: number;
}

// Login function
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const loginData = { username, password };
  console.log('Starting login with credentials:', username);
  
  // Try all possible login endpoints in sequence until one succeeds
  const endpoints = [
    '/auth/login',     // Will become baseUrl + /auth/login (clean)
    '/login',          // Will become baseUrl + /login (clean)
    'login'            // Direct endpoint without leading slash
  ];
  
  let lastError = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting login at ${endpoint}`);
      const response = await api.post(endpoint, loginData);
      
      // If successful, store token and return
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      
      console.log(`Login successful using ${endpoint}`);
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      console.warn(`Login attempt failed at ${endpoint}:`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If we've exhausted all endpoints, try direct axios call without using our API wrapper
  try {
    console.log('All previous attempts failed, trying direct axios call to server');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    // Remove any trailing /api to get the clean base URL
    const cleanBaseUrl = baseUrl.endsWith('/api') 
      ? baseUrl.substring(0, baseUrl.length - 4) 
      : baseUrl;
    
    const response = await api.post('/login', loginData, {
      baseURL: cleanBaseUrl // Use clean base URL without /api
    });
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (directError) {
    console.error('All login attempts failed:', directError);
    throw new Error('Login failed: Invalid username or password');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout API endpoint if it exists
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed, continuing with local logout');
  } finally {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};

/**
 * Register a new user
 */
export const register = async (userData: Partial<User>, password: string): Promise<User> => {
  const response = await api.post<User>('/auth/register', { ...userData, password });
  return response.data;
};

/**
 * Update user profile
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/auth/reset-password', { email });
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password/confirm', { token, newPassword });
};

/**
 * Verify if token is valid and return user info
 */
export const verifyToken = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    // Instead of verifying with backend (which might 404), check token locally
    try {
      // First try decoding the token to validate locally
      const decoded: any = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (decoded.exp < currentTime) {
        console.log('Token is expired locally');
        throw new Error('Token expired');
      }
      
      // If we have a current user in localStorage, use that instead of making API call
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          const user = JSON.parse(userJson) as User;
          console.log('Using cached user from localStorage');
          return user;
        } catch (parseError) {
          console.error('Failed to parse user from localStorage', parseError);
        }
      }
      
      // Only if we don't have cached user, try API call
      const response = await api.get<User>('/auth/verify');
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      return response.data;
    } catch (tokenError) {
      // If backend verify fails, but token looks valid locally, create a temporary user
      // from the decoded token to prevent logout
      try {
        if (token) {
          const decoded: any = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            // Token is still valid, try to get user from localStorage
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
              return JSON.parse(userJson) as User;
            }
          }
        }
      } catch (fallbackError) {
        console.error('Token restore fallback failed', fallbackError);
      }
      
      throw tokenError;
    }
  } catch (error) {
    console.error('Token verification failed', error);
    
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    return null;
  }
};

/**
 * Get token expiration from JWT
 */
export const getTokenExpiration = (): Date | null => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt_decode<TokenPayload>(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error decoding token', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiration = getTokenExpiration();
  
  if (!expiration) {
    return true;
  }
  
  return expiration < new Date();
};

/**
 * Get current authenticated user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user data', error);
    return null;
  }
};

/**
 * Check if the current token is valid and not expired
 */
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const decoded: any = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      console.log('Token is expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isTokenValid
}; 