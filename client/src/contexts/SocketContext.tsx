import React, { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { realTimeService } from '../services/realTimeService';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket!;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  useEffect(() => {
    const socket = realTimeService.connect();

    return () => {
      realTimeService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: realTimeService.connect() }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 