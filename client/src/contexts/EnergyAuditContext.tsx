import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Finding {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  potentialSavings?: number;
}

export interface Audit {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in progress' | 'completed';
  startDate: string;
  endDate?: string;
  findings: Finding[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Metrics {
  totalAudits: number;
  completedAudits: number;
  totalFindings: number;
  criticalFindings: number;
  potentialSavings: number;
  implementedSavings: number;
  energyConsumption: {
    current: number;
    previous: number;
    trend: number;
  };
}

interface EnergyAuditContextType {
  audits: Audit[];
  findings: Finding[];
  metrics: Metrics;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const EnergyAuditContext = createContext<EnergyAuditContextType | undefined>(undefined);

interface EnergyAuditProviderProps {
  children: ReactNode;
}

export const EnergyAuditProvider: React.FC<EnergyAuditProviderProps> = ({ children }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalAudits: 0,
    completedAudits: 0,
    totalFindings: 0,
    criticalFindings: 0,
    potentialSavings: 0,
    implementedSavings: 0,
    energyConsumption: {
      current: 0,
      previous: 0,
      trend: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // For now, using mock data
      const mockAudits: Audit[] = [
        {
          id: '1',
          title: 'Building A Energy Audit',
          description: 'Comprehensive energy audit of Building A',
          status: 'completed',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          findings: [],
          createdBy: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
        },
      ];

      const mockFindings: Finding[] = [
        {
          id: '1',
          title: 'HVAC Efficiency Issue',
          description: 'HVAC system operating at suboptimal efficiency',
          category: 'HVAC',
          severity: 'high',
          status: 'open',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
          potentialSavings: 50000,
        },
      ];

      setAudits(mockAudits);
      setFindings(mockFindings);
      setMetrics({
        totalAudits: mockAudits.length,
        completedAudits: mockAudits.filter(a => a.status === 'completed').length,
        totalFindings: mockFindings.length,
        criticalFindings: mockFindings.filter(f => f.severity === 'critical').length,
        potentialSavings: mockFindings.reduce((sum, f) => sum + (f.potentialSavings || 0), 0),
        implementedSavings: 0,
        energyConsumption: {
          current: 1000,
          previous: 1200,
          trend: -16.67,
        },
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch energy audit data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <EnergyAuditContext.Provider
      value={{
        audits,
        findings,
        metrics,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </EnergyAuditContext.Provider>
  );
};

export const useEnergyAudit = () => {
  const context = useContext(EnergyAuditContext);
  if (context === undefined) {
    throw new Error('useEnergyAudit must be used within an EnergyAuditProvider');
  }
  return context;
};

export default EnergyAuditContext; 