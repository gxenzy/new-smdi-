import { useState, useEffect, useCallback } from 'react';
import { useEnergyAudit } from '../contexts/EnergyAuditContext';
import energyAuditService, { 
  FieldDataPoint, 
  AuditArea, 
  FindingData 
} from '../services/energyAuditService';

interface OfflineData {
  dataPoints: FieldDataPoint[];
  areas: AuditArea[];
  findings: FindingData[];
}

interface SyncState {
  syncing: boolean;
  lastSyncedAt: Date | null;
  pendingSync: boolean;
  error: string | null;
}

const STORAGE_KEY = 'energy_audit_offline_data';

/**
 * Hook to manage Energy Audit data synchronization between online and offline modes
 * 
 * Provides functions to save data offline and sync when online connection is restored
 */
const useEnergyAuditSync = () => {
  const { refreshData } = useEnergyAudit();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    dataPoints: [],
    areas: [],
    findings: []
  });
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSyncedAt: null,
    pendingSync: false,
    error: null
  });

  // Load any stored offline data when the hook initializes
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as OfflineData;
        setOfflineData(parsedData);
        if (parsedData.dataPoints.length > 0 || 
            parsedData.areas.length > 0 || 
            parsedData.findings.length > 0) {
          setSyncState(prev => ({ ...prev, pendingSync: true }));
        }
      } catch (err) {
        console.error('Error parsing stored offline data:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Attempt to sync when connection is restored
      if (syncState.pendingSync) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncState.pendingSync]);

  // Save data to offline storage
  const persistOfflineData = useCallback((data: OfflineData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Function to store a data point while offline
  const saveDataPointOffline = useCallback((dataPoint: FieldDataPoint) => {
    setOfflineData(prev => {
      // If this is an update to an existing item, replace it
      const updatedPoints = dataPoint.id 
        ? prev.dataPoints.filter(dp => dp.id !== dataPoint.id)
        : [...prev.dataPoints];
      
      // Use a temporary ID if none exists
      const pointToSave = dataPoint.id
        ? dataPoint
        : { ...dataPoint, id: `temp_${Date.now()}` };
      
      const newData = {
        ...prev,
        dataPoints: [...updatedPoints, pointToSave]
      };
      
      persistOfflineData(newData);
      setSyncState(prev => ({ ...prev, pendingSync: true }));
      
      return newData;
    });
    
    return Promise.resolve(dataPoint);
  }, [persistOfflineData]);

  // Function to store an audit area while offline
  const saveAreaOffline = useCallback((area: AuditArea) => {
    setOfflineData(prev => {
      // If this is an update to an existing item, replace it
      const updatedAreas = area.id 
        ? prev.areas.filter(a => a.id !== area.id)
        : [...prev.areas];
      
      // Use a temporary ID if none exists
      const areaToSave = area.id
        ? area
        : { ...area, id: `temp_${Date.now()}` };
      
      const newData = {
        ...prev,
        areas: [...updatedAreas, areaToSave]
      };
      
      persistOfflineData(newData);
      setSyncState(prev => ({ ...prev, pendingSync: true }));
      
      return newData;
    });
    
    return Promise.resolve(area);
  }, [persistOfflineData]);

  // Function to store a finding while offline
  const saveFindingOffline = useCallback((finding: FindingData) => {
    setOfflineData(prev => {
      // If this is an update to an existing item, replace it
      const updatedFindings = finding.id 
        ? prev.findings.filter(f => f.id !== finding.id)
        : [...prev.findings];
      
      // Use a temporary ID if none exists
      const findingToSave = finding.id
        ? finding
        : { ...finding, id: `temp_${Date.now()}` };
      
      const newData = {
        ...prev,
        findings: [...updatedFindings, findingToSave]
      };
      
      persistOfflineData(newData);
      setSyncState(prev => ({ ...prev, pendingSync: true }));
      
      return newData;
    });
    
    return Promise.resolve(finding);
  }, [persistOfflineData]);

  // Function to delete an offline data point
  const deleteDataPointOffline = useCallback((id: string) => {
    setOfflineData(prev => {
      const newData = {
        ...prev,
        dataPoints: prev.dataPoints.filter(dp => dp.id !== id)
      };
      
      persistOfflineData(newData);
      return newData;
    });
    
    return Promise.resolve(true);
  }, [persistOfflineData]);

  // Function to delete an offline area
  const deleteAreaOffline = useCallback((id: string) => {
    setOfflineData(prev => {
      const newData = {
        ...prev,
        areas: prev.areas.filter(a => a.id !== id)
      };
      
      persistOfflineData(newData);
      return newData;
    });
    
    return Promise.resolve(true);
  }, [persistOfflineData]);

  // Function to delete an offline finding
  const deleteFindingOffline = useCallback((id: string) => {
    setOfflineData(prev => {
      const newData = {
        ...prev,
        findings: prev.findings.filter(f => f.id !== id)
      };
      
      persistOfflineData(newData);
      return newData;
    });
    
    return Promise.resolve(true);
  }, [persistOfflineData]);

  // Function to sync offline data with the server
  const syncOfflineData = useCallback(async () => {
    if (!isOnline || !syncState.pendingSync) {
      return;
    }

    setSyncState(prev => ({ ...prev, syncing: true, error: null }));

    try {
      // Send the offline data to be synchronized
      await energyAuditService.syncOfflineData(offlineData);
      
      // Clear offline data after successful sync
      setOfflineData({ dataPoints: [], areas: [], findings: [] });
      persistOfflineData({ dataPoints: [], areas: [], findings: [] });
      
      // Refresh data from the server
      await refreshData();
      
      // Update sync state
      setSyncState({
        syncing: false,
        lastSyncedAt: new Date(),
        pendingSync: false,
        error: null
      });
    } catch (err: any) {
      console.error('Error synchronizing offline data:', err);
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        error: err.message || 'Failed to synchronize data'
      }));
    }
  }, [isOnline, syncState.pendingSync, offlineData, persistOfflineData, refreshData]);

  // Function to force a sync attempt
  const forceSyncOfflineData = useCallback(() => {
    if (!isOnline) {
      setSyncState(prev => ({
        ...prev,
        error: 'Cannot sync while offline'
      }));
      return Promise.resolve(false);
    }
    
    return syncOfflineData();
  }, [isOnline, syncOfflineData]);

  // Function to clear all offline data
  const clearOfflineData = useCallback(() => {
    setOfflineData({ dataPoints: [], areas: [], findings: [] });
    persistOfflineData({ dataPoints: [], areas: [], findings: [] });
    setSyncState(prev => ({ ...prev, pendingSync: false }));
  }, [persistOfflineData]);

  return {
    isOnline,
    offlineData,
    syncState,
    saveDataPointOffline,
    saveAreaOffline,
    saveFindingOffline,
    deleteDataPointOffline,
    deleteAreaOffline,
    deleteFindingOffline,
    syncOfflineData: forceSyncOfflineData,
    clearOfflineData,
    getOfflineDataCount: () => ({
      dataPoints: offlineData.dataPoints.length,
      areas: offlineData.areas.length,
      findings: offlineData.findings.length,
      total: offlineData.dataPoints.length + offlineData.areas.length + offlineData.findings.length
    })
  };
};

export default useEnergyAuditSync; 