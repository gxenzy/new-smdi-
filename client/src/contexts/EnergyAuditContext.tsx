import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import energyAuditService, { 
  EnergyAuditData, 
  FindingData, 
  AuditMetrics
} from '../services/energyAuditService';
import energyAuditWebSocketService, { WebSocketEvent } from '../services/energyAuditWebSocketService';

// Import ActivityLogEvent type from the ActivityLog component
import { ActivityLogEvent } from '../components/EnergyAudit/ActivityLog';

// Define types for the context
type Audit = EnergyAuditData;
type Finding = FindingData;
type Metrics = AuditMetrics;

interface EnergyAuditContextType {
  audits: Audit[];
  findings: Finding[];
  metrics: Metrics;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getAuditById: (id: string) => Promise<Audit | null>;
  createAudit: (auditData: EnergyAuditData) => Promise<Audit | null>;
  updateAudit: (id: string, auditData: Partial<EnergyAuditData>) => Promise<Audit | null>;
  deleteAudit: (id: string) => Promise<boolean>;
  getFindings: (auditId?: string) => Promise<Finding[]>;
  createFinding: (findingData: FindingData) => Promise<Finding | null>;
  updateFinding: (id: string, findingData: Partial<FindingData>) => Promise<Finding | null>;
  deleteFinding: (id: string) => Promise<boolean>;
  hasRealTimeConnections: boolean;
  lastRealTimeUpdate: Date | null;
  activityLog: ActivityLogEvent[];
  logActivity: (event: ActivityLogEvent) => void;
  selectedAudit: Audit | null;
  selectAudit: (auditId: string) => void;
  clearActivityLog: () => void;
  isLoading: boolean;
}

// Create the context
const EnergyAuditContext = createContext<EnergyAuditContextType | undefined>(undefined);

// Create a hook for using the context
export const useEnergyAudit = () => {
  const context = useContext(EnergyAuditContext);
  if (context === undefined) {
    throw new Error('useEnergyAudit must be used within an EnergyAuditProvider');
  }
  return context;
};

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
  const [hasRealTimeConnections, setHasRealTimeConnections] = useState(false);
  const [lastRealTimeUpdate, setLastRealTimeUpdate] = useState<Date | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEvent[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch audits
      const auditsData = await energyAuditService.getAudits();
      setAudits(auditsData);
      
      // Fetch all findings
      const findingsData = await energyAuditService.getFindings();
      setFindings(findingsData);
      
      // Fetch metrics
      const metricsData = await energyAuditService.getAuditMetrics();
      setMetrics(metricsData);
      
    } catch (err: any) {
      console.error('Error fetching energy audit data:', err);
      setError(err.message || 'Failed to load energy audit data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to create and log activity events
  const logActivity = useCallback((event: ActivityLogEvent) => {
    const newEvent: ActivityLogEvent = {
      ...event,
      id: event.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: typeof event.timestamp === 'string' ? new Date(event.timestamp).getTime() : (event.timestamp || Date.now())
    };
    
    setActivityLog(prevLog => {
      const newLog = [newEvent, ...prevLog].slice(0, 1000); // Keep last 1000 events
      return newLog;
    });
  }, []);

  // Helper to convert WebSocket events to ActivityLogEvents
  const convertWebSocketToActivityEvent = useCallback((event: WebSocketEvent): ActivityLogEvent => {
    // Determine the type of event (create, update, delete, etc.)
    let type = 'system';
    if (event.type.includes('Created')) type = 'create';
    if (event.type.includes('Updated')) type = 'update';
    if (event.type.includes('Deleted')) type = 'delete';
    if (event.type.includes('Sync')) type = 'sync';
    
    // Determine the resource type (audit, finding, dataPoint, etc.)
    let resourceType = 'system';
    if (event.type.includes('audit')) resourceType = 'audit';
    if (event.type.includes('finding')) resourceType = 'finding';
    if (event.type.includes('dataPoint')) resourceType = 'dataPoint';
    if (event.type.includes('area')) resourceType = 'area';
    if (event.type.includes('comment')) resourceType = 'comment';

    // Create activity event
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message: getEventDetails(type, resourceType, event.data),
      userId: event.userId || 'unknown-user',
      userName: event.userName || 'Unknown User',
      timestamp: event.timestamp || Date.now(),
      details: event.data
    };
  }, []);

  // Helper functions to improve event descriptions
  const getResourceName = (resourceType: string, data: any): string => {
    if (data?.name) return data.name;
    if (data?.title) return data.title;
    
    switch (resourceType) {
      case 'audit': return 'Energy Audit';
      case 'finding': return 'Energy Finding';
      case 'dataPoint': return 'Data Point';
      case 'area': return 'Audit Area';
      default: return 'Unknown Resource';
    }
  };

  const getEventDetails = (type: string, resourceType: string, data: any): string => {
    switch (type) {
      case 'create':
        return `Created new ${resourceType}${data?.name ? `: ${data.name}` : ''}`;
      case 'update':
        return `Updated ${resourceType}${data?.name ? `: ${data.name}` : ''}`;
      case 'delete':
        return `Deleted ${resourceType}${data?.name ? `: ${data.name}` : ''}`;
      case 'sync':
        return `Synchronized ${resourceType} data`;
      default:
        return `System event for ${resourceType}`;
    }
  };

  // Set up WebSocket event handlers for real-time updates
  useEffect(() => {
    // Handler for WebSocket events
    const handleWebSocketEvent = (event: WebSocketEvent) => {
      setLastRealTimeUpdate(new Date());
      setHasRealTimeConnections(true);
      
      // Log this event as an activity
      const activityEvent = convertWebSocketToActivityEvent(event);
      logActivity(activityEvent);
      
      // Let's check which type of event we received and update our state accordingly
      switch (event.type) {
        case 'auditCreated':
          const newAudit = event.data as unknown as Audit;
          if (newAudit && newAudit.id) {
            setAudits(prevAudits => {
              // Only add if it doesn't already exist
              if (!prevAudits.some(a => a.id === newAudit.id)) {
                return [...prevAudits, newAudit];
              }
              return prevAudits;
            });
          }
          break;
          
        case 'auditUpdated':
          const updatedAudit = event.data as unknown as Audit;
          if (updatedAudit && updatedAudit.id) {
            setAudits(prevAudits => 
              prevAudits.map(audit => 
                audit.id === updatedAudit.id ? updatedAudit : audit
              )
            );
          }
          break;
          
        case 'auditDeleted':
          const deletedAudit = event.data as unknown as Audit;
          if (deletedAudit && deletedAudit.id) {
            setAudits(prevAudits => 
              prevAudits.filter(audit => audit.id !== deletedAudit.id)
            );
          }
          break;
          
        case 'findingCreated':
          const newFinding = event.data as unknown as Finding;
          if (newFinding && newFinding.id) {
            setFindings(prevFindings => {
              // Only add if it doesn't already exist
              if (!prevFindings.some(f => f.id === newFinding.id)) {
                return [...prevFindings, newFinding];
              }
              return prevFindings;
            });
          }
          break;
          
        case 'findingUpdated':
          const updatedFinding = event.data as unknown as Finding;
          if (updatedFinding && updatedFinding.id) {
            setFindings(prevFindings => 
              prevFindings.map(finding => 
                finding.id === updatedFinding.id ? updatedFinding : finding
              )
            );
          }
          break;
          
        case 'findingDeleted':
          const deletedFinding = event.data as unknown as Finding;
          if (deletedFinding && deletedFinding.id) {
            setFindings(prevFindings => 
              prevFindings.filter(finding => finding.id !== deletedFinding.id)
            );
          }
          break;
          
        // For other event types, we might want to trigger a full refresh
        // since they affect data that might be more complex to update incrementally
        case 'syncCompleted':
          fetchData();
          break;
          
        default:
          // For other event types not explicitly handled, we might just log them
          console.log('Received WebSocket event:', event);
      }
    };
    
    // Subscribe to WebSocket events
    energyAuditWebSocketService.onEvent(handleWebSocketEvent);
    
    return () => {
      // Unsubscribe from WebSocket events
      energyAuditWebSocketService.offEvent(handleWebSocketEvent);
    };
  }, [convertWebSocketToActivityEvent, logActivity]);

  // Method to get audit by ID
  const getAuditById = async (id: string): Promise<Audit | null> => {
    try {
      return await energyAuditService.getAuditById(id);
    } catch (err: any) {
      console.error(`Error fetching audit with ID ${id}:`, err);
      setError(err.message || `Failed to load audit with ID ${id}`);
      return null;
    }
  };

  // Method to create a new audit
  const createAudit = async (auditData: EnergyAuditData): Promise<Audit | null> => {
    try {
      const newAudit = await energyAuditService.createAudit(auditData);
      setAudits(prevAudits => [...prevAudits, newAudit]);
      return newAudit;
    } catch (err: any) {
      console.error('Error creating audit:', err);
      setError(err.message || 'Failed to create audit');
      return null;
    }
  };

  // Method to update an existing audit
  const updateAudit = async (id: string, auditData: Partial<EnergyAuditData>): Promise<Audit | null> => {
    try {
      const updatedAudit = await energyAuditService.updateAudit(id, auditData);
      setAudits(prevAudits => 
        prevAudits.map(audit => audit.id === id ? updatedAudit : audit)
      );
      return updatedAudit;
    } catch (err: any) {
      console.error(`Error updating audit with ID ${id}:`, err);
      setError(err.message || `Failed to update audit with ID ${id}`);
      return null;
    }
  };

  // Method to delete an audit
  const deleteAudit = async (id: string): Promise<boolean> => {
    try {
      await energyAuditService.deleteAudit(id);
      setAudits(prevAudits => prevAudits.filter(audit => audit.id !== id));
      return true;
    } catch (err: any) {
      console.error(`Error deleting audit with ID ${id}:`, err);
      setError(err.message || `Failed to delete audit with ID ${id}`);
      return false;
    }
  };

  // Method to get findings (optionally filtered by audit ID)
  const getFindings = async (auditId?: string): Promise<Finding[]> => {
    try {
      const findingsData = await energyAuditService.getFindings(auditId);
      return findingsData;
    } catch (err: any) {
      console.error('Error fetching findings:', err);
      setError(err.message || 'Failed to load findings');
      return [];
    }
  };

  // Method to create a new finding
  const createFinding = async (findingData: FindingData): Promise<Finding | null> => {
    try {
      const newFinding = await energyAuditService.createFinding(findingData);
      setFindings(prevFindings => [...prevFindings, newFinding]);
      return newFinding;
    } catch (err: any) {
      console.error('Error creating finding:', err);
      setError(err.message || 'Failed to create finding');
      return null;
    }
  };

  // Method to update an existing finding
  const updateFinding = async (id: string, findingData: Partial<FindingData>): Promise<Finding | null> => {
    try {
      const updatedFinding = await energyAuditService.updateFinding(id, findingData);
      setFindings(prevFindings => 
        prevFindings.map(finding => finding.id === id ? updatedFinding : finding)
      );
      return updatedFinding;
    } catch (err: any) {
      console.error(`Error updating finding with ID ${id}:`, err);
      setError(err.message || `Failed to update finding with ID ${id}`);
      return null;
    }
  };

  // Method to delete a finding
  const deleteFinding = async (id: string): Promise<boolean> => {
    try {
      await energyAuditService.deleteFinding(id);
      setFindings(prevFindings => prevFindings.filter(finding => finding.id !== id));
      return true;
    } catch (err: any) {
      console.error(`Error deleting finding with ID ${id}:`, err);
      setError(err.message || `Failed to delete finding with ID ${id}`);
      return false;
    }
  };

  // Function to select an audit by ID
  const selectAudit = (auditId: string) => {
    setIsLoading(true);
    
    // In a real app, this would fetch from an API
    setTimeout(() => {
      getAuditById(auditId).then(audit => {
        if (audit) {
          setSelectedAudit(audit);
          setIsLoading(false);
          
          // Log the audit selection as an activity
          logActivity({
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'view',
            message: `Viewing audit: ${audit.title || 'Energy Audit'}`,
            userId: 'current-user', // In a real app, this would come from auth context
            userName: 'Current User', // In a real app, this would come from auth context
            timestamp: Date.now(),
            details: audit
          });
        }
      });
    }, 500);
  };

  // Function to clear the activity log
  const clearActivityLog = () => {
    setActivityLog([]);
  };

  // Provide the context value
  const contextValue: EnergyAuditContextType = {
    audits,
    findings,
    metrics,
    loading,
    error,
    refreshData: fetchData,
    getAuditById,
    createAudit,
    updateAudit,
    deleteAudit,
    getFindings,
    createFinding,
    updateFinding,
    deleteFinding,
    hasRealTimeConnections,
    lastRealTimeUpdate,
    activityLog,
    logActivity,
    selectedAudit,
    selectAudit,
    clearActivityLog,
    isLoading
  };

  return (
    <EnergyAuditContext.Provider value={contextValue}>
      {children}
    </EnergyAuditContext.Provider>
  );
};

export default EnergyAuditContext; 