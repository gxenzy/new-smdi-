import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import { useAuthContext } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  on: <T = any>(event: string, handler: (data: T) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser, isAuthenticated } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Only connect socket when user is authenticated
      const newSocket = socketService.connect();
      setSocket(newSocket);

      // Subscribe to connection status
      const subscription = socketService.connectionStatus$.subscribe(
        status => setIsConnected(status)
      );

      // Handle user presence
      if (currentUser.id) {
        socketService.emitUserOnline(currentUser.id);
      }

      return () => {
        subscription.unsubscribe();
        if (newSocket) {
          newSocket.disconnect();
        }
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, currentUser]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    on: (event, handler) => {
      if (socket) {
        socket.on(event, handler);
      }
    },
    off: (event, handler) => {
      if (socket) {
        socket.off(event, handler);
      }
    },
    emit: (event, ...args) => {
      if (socket) {
        socket.emit(event, ...args);
      }
    }
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 