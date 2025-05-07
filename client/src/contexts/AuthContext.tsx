import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserPreferences } from '../types';
import axios from 'axios';
import * as profileService from '../services/profileService';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateProfile: (data: any) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const userData = await profileService.getProfile();
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (err) {
      console.error('Error refreshing user:', err);
      logout();
    }
  };

  useEffect(() => {
    if (user) {
      // Set up axios interceptor for token refresh
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401) {
            try {
              await refreshUser();
              return axios(error.config);
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            }
          }
          return Promise.reject(error);
        }
      );

      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        username,
        password
      }, {
        withCredentials: true
      });

      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('authUser');
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const updatedUser = await profileService.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const updatedUser = await profileService.updatePreferences(preferences);
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
      throw err;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser: user, 
      login, 
      logout,
      loading,
      error,
      updateProfile,
      updatePreferences,
      refreshUser,
      isAuthenticated: !!user,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
