import React, { createContext, useContext, useState, useCallback } from 'react';

interface TestResult {
  id: string;
  date: string;
  testType: 'power' | 'lighting' | 'hvac';
  results: {
    powerUsage?: number;
    lightingEfficiency?: number;
    hvacEfficiency?: number;
    compliance: {
      power?: boolean;
      lighting?: boolean;
      hvac?: boolean;
    };
  };
  standard: string;
  notes?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EnergyAuditHistoryContextType {
  testHistory: TestResult[];
  addTestResult: (result: Omit<TestResult, 'id' | 'date'>) => void;
  updateTestStatus: (id: string, status: 'approved' | 'rejected', approvedBy: string) => void;
  getTestHistory: (testType?: 'power' | 'lighting' | 'hvac') => TestResult[];
  getLatestResults: () => {
    power?: TestResult;
    lighting?: TestResult;
    hvac?: TestResult;
  };
}

const EnergyAuditHistoryContext = createContext<EnergyAuditHistoryContextType | undefined>(undefined);

export const EnergyAuditHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  const addTestResult = useCallback((result: Omit<TestResult, 'id' | 'date'>) => {
    const newResult: TestResult = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setTestHistory(prev => [...prev, newResult]);
  }, []);

  const updateTestStatus = useCallback((id: string, status: 'approved' | 'rejected', approvedBy: string) => {
    setTestHistory(prev =>
      prev.map(test =>
        test.id === id
          ? { ...test, status, approvedBy }
          : test
      )
    );
  }, []);

  const getTestHistory = useCallback((testType?: 'power' | 'lighting' | 'hvac') => {
    if (!testType) return testHistory;
    return testHistory.filter(test => test.testType === testType);
  }, [testHistory]);

  const getLatestResults = useCallback(() => {
    const latest = {
      power: testHistory.filter(t => t.testType === 'power').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
      lighting: testHistory.filter(t => t.testType === 'lighting').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
      hvac: testHistory.filter(t => t.testType === 'hvac').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
    };
    return latest;
  }, [testHistory]);

  return (
    <EnergyAuditHistoryContext.Provider
      value={{
        testHistory,
        addTestResult,
        updateTestStatus,
        getTestHistory,
        getLatestResults,
      }}
    >
      {children}
    </EnergyAuditHistoryContext.Provider>
  );
};

export const useEnergyAuditHistory = () => {
  const context = useContext(EnergyAuditHistoryContext);
  if (context === undefined) {
    throw new Error('useEnergyAuditHistory must be used within an EnergyAuditHistoryProvider');
  }
  return context;
}; 