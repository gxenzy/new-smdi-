import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    team: 'Demo',
    notifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Demo User',
    email: 'demo@example.com',
    role: UserRole.AUDITOR,
    team: 'Demo',
    notifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, password: string) => {
    console.log('Login attempt with:', { email, password });
    
    // Check if password is valid
    if (password !== 'admin123' && password !== 'demo123' && password !== 'password') {
      console.log('Invalid password');
      throw new Error('Invalid credentials');
    }

    // Find user by email
    const foundUser = mockUsers.find(u => u.email === email);
    console.log('Found user:', foundUser);
    
    if (!foundUser) {
      console.log('User not found');
      throw new Error('Invalid credentials');
    }

    setUser(foundUser);
    localStorage.setItem('authUser', JSON.stringify(foundUser));
    console.log('Login successful');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, login, logout }}>
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
