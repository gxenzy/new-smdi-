import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the context value type
interface EmergencyModeContextType {
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;
  setEmergencyMode: React.Dispatch<React.SetStateAction<boolean>>;
  successfulUpdates: number;
  failedUpdates: number;
  workingEndpoints: Record<string, number>;
  recordSuccessfulUpdate: (endpoint: string) => void;
  recordFailedUpdate: () => void;
}

// Create the context with a default value matching the interface
const EmergencyModeContext = createContext<EmergencyModeContextType | undefined>(undefined);

// Provider component props
interface EmergencyModeProviderProps {
  children: ReactNode;
}

// Provider component
export const EmergencyModeProvider: React.FC<EmergencyModeProviderProps> = ({ children }) => {
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false); // Default to false
  const [successfulUpdates, setSuccessfulUpdates] = useState<number>(0);
  const [failedUpdates, setFailedUpdates] = useState<number>(0);
  
  // Track which endpoints succeeded
  const [workingEndpoints, setWorkingEndpoints] = useState<Record<string, number>>({});
  
  // Record a successful update via a specific endpoint
  const recordSuccessfulUpdate = (endpoint: string) => {
    setSuccessfulUpdates(prev => prev + 1);
    setWorkingEndpoints(prev => ({
      ...prev,
      [endpoint]: (prev[endpoint] || 0) + 1
    }));
  };
  
  // Record a failed update
  const recordFailedUpdate = () => {
    setFailedUpdates(prev => prev + 1);
  };
  
  // Check local storage for emergency mode setting on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('emergencyMode');
    if (storedMode !== null) {
      setIsEmergencyMode(storedMode === 'true');
    }
  }, []);
  
  // Save emergency mode setting to local storage when it changes
  useEffect(() => {
    localStorage.setItem('emergencyMode', isEmergencyMode.toString());
  }, [isEmergencyMode]);
  
  // Value object to be provided by context
  const value: EmergencyModeContextType = {
    isEmergencyMode,
    toggleEmergencyMode: () => setIsEmergencyMode(prev => !prev),
    setEmergencyMode: setIsEmergencyMode,
    successfulUpdates,
    failedUpdates,
    workingEndpoints,
    recordSuccessfulUpdate,
    recordFailedUpdate
  };
  
  return (
    <EmergencyModeContext.Provider value={value}>
      {children}
    </EmergencyModeContext.Provider>
  );
};

// Custom hook for using the emergency mode context
export const useEmergencyMode = (): EmergencyModeContextType => {
  const context = useContext(EmergencyModeContext);
  if (context === undefined) {
    throw new Error('useEmergencyMode must be used within an EmergencyModeProvider');
  }
  return context;
};

export default EmergencyModeContext; 