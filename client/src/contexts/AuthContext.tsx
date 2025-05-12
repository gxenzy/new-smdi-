import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import jwt_decode from 'jwt-decode';

// Define user roles
export type UserRole = 'admin' | 'auditor' | 'viewer';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  profileImage?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  notificationPreferences?: {
    enabled: boolean;
    types: string[];
  };
}

// Define auth context type
interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for currentUser for compatibility
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  isAuthenticated: false,
  hasRole: () => false,
  loading: false,
  error: null,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  updateUser: async () => false,
  resetPassword: async () => false,
  checkAuth: async () => false
});

// Hook to use auth context
export const useAuthContext = () => useContext(AuthContext);

// Mock user data for development
const MOCK_USER: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  department: 'Engineering',
  profileImage: 'https://i.pravatar.cc/150?img=68',
  lastLogin: new Date(),
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date()
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    return currentUser?.role === role;
  };

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // In a real app, this would call an API to verify the token and get user data
        // For this example, we'll simulate a successful authentication
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          // Auto-login with mock user for development
          setCurrentUser(MOCK_USER);
          localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple email/password validation for demo
      if (email.length < 5 || !email.includes('@') || password.length < 6) {
        setError('Invalid email or password');
        return false;
      }

      // Mock successful login
      setCurrentUser(MOCK_USER);
      localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear user data and storage
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, just log the registration attempt
      console.log('Register attempt:', { userData, password });
      
      // Simulate successful registration
      const newUser: User = {
        ...MOCK_USER,
        id: 'new_user_id',
        name: userData.name || 'New User',
        email: userData.email || 'new.user@example.com',
        username: userData.username || 'newuser',
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        role: userData.role || 'viewer',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!currentUser) {
        setError('No user is currently logged in');
        return false;
      }

      // Update user data
      const updatedUser: User = {
        ...currentUser,
        ...userData,
        updatedAt: new Date()
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      console.error('Update user error:', err);
      setError('Failed to update user information. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple validation for demo
      if (!email || !email.includes('@')) {
        setError('Please provide a valid email address');
        return false;
      }

      // In a real app, this would send a password reset email
      console.log('Password reset requested for:', email);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to request password reset. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication function
  const checkAuth = async (): Promise<boolean> => {
    // In a real app, this would verify the auth token with backend
    return !!currentUser;
  };

  // Context value
  const value = {
    currentUser,
    user: currentUser, // Add alias for currentUser
    isAuthenticated: !!currentUser,
    hasRole,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    resetPassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
