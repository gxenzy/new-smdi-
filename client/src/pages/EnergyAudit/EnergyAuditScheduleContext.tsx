import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ScheduledAudit {
  id: string;
  name: string;
  date: string; // ISO string
  location: string;
  team: string;
  status: 'Scheduled' | 'Completed' | 'Missed';
}

interface ScheduleContextType {
  audits: ScheduledAudit[];
  addAudit: (a: Omit<ScheduledAudit, 'id' | 'status'>) => void;
  updateAudit: (id: string, updates: Partial<ScheduledAudit>) => void;
  deleteAudit: (id: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useScheduleContext must be used within ScheduleProvider');
  return ctx;
};

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [audits, setAudits] = useState<ScheduledAudit[]>([]);

  // Mark missed audits
  useEffect(() => {
    const interval = setInterval(() => {
      setAudits(prev => prev.map(a => {
        if (a.status === 'Scheduled' && new Date(a.date) < new Date()) {
          return { ...a, status: 'Missed' };
        }
        return a;
      }));
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []); // Only run on mount

  const addAudit = (a: Omit<ScheduledAudit, 'id' | 'status'>) => {
    setAudits(prev => [
      { ...a, id: Date.now().toString() + Math.random(), status: 'Scheduled' },
      ...prev,
    ]);
  };
  const updateAudit = (id: string, updates: Partial<ScheduledAudit>) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  const deleteAudit = (id: string) => {
    setAudits(prev => prev.filter(a => a.id !== id));
  };

  return (
    <ScheduleContext.Provider value={{ audits, addAudit, updateAudit, deleteAudit }}>
      {children}
    </ScheduleContext.Provider>
  );
}; 