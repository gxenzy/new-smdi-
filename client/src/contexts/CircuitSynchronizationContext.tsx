import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UnifiedCircuitData } from '../pages/Energy Audit/components/Calculators/utils/circuitDataExchange';
import { LoadSchedule, LoadItem } from '../pages/Energy Audit/components/Calculators/ScheduleOfLoads/types';

// Define property comparison result for conflicts
export interface PropertyComparison {
  property: string;
  voltageDropValue: any;
  scheduleOfLoadsValue: any;
  displayName: string;
  unit?: string;
  conflict: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation?: 'voltage-drop' | 'schedule-of-loads' | 'newer';
}

// Define conflict type
export interface Conflict {
  id: string;
  name: string;
  circuitId: string;
  loadScheduleId?: string;
  type: 'circuit-data' | 'load-schedule';
  timestamp: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  propertyComparisons: PropertyComparison[];
  resolved: boolean;
  resolution?: 'voltage-drop' | 'schedule-of-loads' | 'merge' | 'manual';
}

// Define sync event type
export interface SyncEvent {
  id: string;
  type:
  | 'sync-requested'
  | 'sync-completed'
  | 'conflict-detected'
    | 'conflict-resolved'
    | 'circuit-updated'
    | 'load-schedule-updated'
    | 'circuit-created'
    | 'circuit-deleted'
    | 'load-item-updated';
  timestamp: number;
  source: 'voltage-drop' | 'schedule-of-loads' | 'system';
  details: {
    circuitId?: string;
    loadScheduleId?: string;
    conflictId?: string;
    message: string;
  };
  data?: any;
}

// Define sync status
interface SyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  autoSync: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
}

// Define sync stats
interface SyncStats {
  syncedCircuits: number;
  changedCircuits: number;
  conflicts: number;
}

// Define filter for sync events
export interface SyncEventFilter {
  types: string[];
  sources: string[];
  startDate: string | null;
  endDate: string | null;
  search: string;
  offset: number;
  limit: number;
  startTime?: string | number | null;
  endTime?: string | number | null;
  searchTerm?: string;
}

// Define context type
interface CircuitSyncContextType {
  // Circuit data
  circuitData: UnifiedCircuitData[];
  loadSchedules: LoadSchedule[];
  
  // Sync status and stats
  syncStatus: SyncStatus;
  syncStats: SyncStats;
  
  // Conflicts
  conflicts: Conflict[];
  
  // Sync events
  syncEvents: SyncEvent[];
  
  // Methods
  enableSync: (enabled: boolean) => void;
  setAutoSync: (autoSync: boolean) => void;
  syncNow: () => Promise<void>;
  clearChanges: () => void;
  
  // Circuit operations
  getCircuitById: (id: string) => UnifiedCircuitData | undefined;
  updateCircuit: (circuit: UnifiedCircuitData) => void;
  deleteCircuit: (id: string) => void;
  
  // Load schedule operations
  getLoadScheduleById: (id: string) => LoadSchedule | undefined;
  updateLoadSchedule: (loadSchedule: LoadSchedule) => void;
  deleteLoadSchedule: (id: string) => void;
  
  // Conflict operations
  resolveConflict: (conflictId: string, resolution: 'voltage-drop' | 'schedule-of-loads' | 'manual' | 'merge') => void;
  
  // History operations
  getSyncEvents: (filter: SyncEventFilter) => Promise<{ events: SyncEvent[], total: number }>;
  
  // Undo/redo
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  
  // Load item operations
  updateLoadItem: (item: LoadItem) => void;
}

// Create the context
const CircuitSyncContext = createContext<CircuitSyncContextType | undefined>(undefined);

// Provider component
export const CircuitSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for circuit data
  const [circuitData, setCircuitData] = useState<UnifiedCircuitData[]>([]);
  const [loadSchedules, setLoadSchedules] = useState<LoadSchedule[]>([]);
  
  // State for sync status and stats
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isEnabled: true,
    isSyncing: false,
    autoSync: false,
    lastSyncTime: null,
    syncError: null
  });
  
  const [syncStats, setSyncStats] = useState<SyncStats>({
    syncedCircuits: 0,
    changedCircuits: 0,
    conflicts: 0
  });
  
  // State for conflicts and events
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  
  // State for undo/redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Enable or disable sync
  const enableSync = useCallback((enabled: boolean) => {
    setSyncStatus(prev => ({ ...prev, isEnabled: enabled }));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: enabled ? 'sync-requested' : 'sync-completed',
      timestamp: Date.now(),
      source: 'system',
      details: {
        message: enabled ? 'Synchronization enabled' : 'Synchronization disabled'
      }
    });
  }, []);
  
  // Set auto sync
  const setAutoSync = useCallback((autoSync: boolean) => {
    setSyncStatus(prev => ({ ...prev, autoSync }));
  }, []);
  
  // Sync now
  const syncNow = useCallback(async () => {
    if (!syncStatus.isEnabled || syncStatus.isSyncing) {
      return;
    }
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'sync-requested',
                timestamp: Date.now(),
      source: 'system',
      details: {
        message: 'Manual synchronization started'
      }
    });
    
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sync status
      setSyncStatus(prev => ({ 
                  ...prev,
        isSyncing: false, 
        lastSyncTime: Date.now() 
      }));
      
      // Add sync completed event
      addSyncEvent({
        id: `event-${Date.now()}`,
        type: 'sync-completed',
        timestamp: Date.now(),
        source: 'system',
        details: {
          message: 'Synchronization completed successfully'
        }
      });
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        syncError: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [syncStatus.isEnabled, syncStatus.isSyncing]);
  
  // Clear changes
  const clearChanges = useCallback(() => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
    // Reset conflicts
    setConflicts([]);
    
    // Update stats
          setSyncStats(prev => ({
            ...prev,
      changedCircuits: 0,
      conflicts: 0
          }));
      
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
        type: 'sync-completed',
        timestamp: Date.now(),
      source: 'system',
      details: {
        message: 'Changes cleared'
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Get circuit by ID
  const getCircuitById = useCallback((id: string) => {
    return circuitData.find(circuit => circuit.id === id);
  }, [circuitData]);
  
  // Update circuit
  const updateCircuit = useCallback((circuit: UnifiedCircuitData) => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
      setCircuitData(prev => {
      const index = prev.findIndex(c => c.id === circuit.id);
      if (index >= 0) {
        // Update existing circuit
        const newCircuits = [...prev];
        newCircuits[index] = circuit;
        return newCircuits;
      } else {
        // Add new circuit
        return [...prev, circuit];
      }
    });
    
    // Update stats
          setSyncStats(prev => ({
            ...prev,
      changedCircuits: prev.changedCircuits + 1
    }));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'circuit-updated',
        timestamp: Date.now(),
      source: 'voltage-drop',
      details: {
        circuitId: circuit.id,
        message: `Circuit "${circuit.name}" updated`
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Delete circuit
  const deleteCircuit = useCallback((id: string) => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
    setCircuitData(prev => prev.filter(circuit => circuit.id !== id));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'circuit-updated',
        timestamp: Date.now(),
      source: 'system',
      details: {
        circuitId: id,
        message: `Circuit deleted`
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Get load schedule by ID
  const getLoadScheduleById = useCallback((id: string) => {
    return loadSchedules.find(schedule => schedule.id === id);
  }, [loadSchedules]);
  
  // Update load schedule
  const updateLoadSchedule = useCallback((loadSchedule: LoadSchedule) => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
          setLoadSchedules(prev => {
      const index = prev.findIndex(s => s.id === loadSchedule.id);
      if (index >= 0) {
        // Update existing load schedule
        const newSchedules = [...prev];
        newSchedules[index] = loadSchedule;
        return newSchedules;
        } else {
        // Add new load schedule
        return [...prev, loadSchedule];
      }
    });
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'load-schedule-updated',
        timestamp: Date.now(),
      source: 'schedule-of-loads',
      details: {
        loadScheduleId: loadSchedule.id,
        message: `Load schedule "${loadSchedule.name}" updated`
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Delete load schedule
  const deleteLoadSchedule = useCallback((id: string) => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
    setLoadSchedules(prev => prev.filter(schedule => schedule.id !== id));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'load-schedule-updated',
        timestamp: Date.now(),
      source: 'system',
      details: {
        loadScheduleId: id,
        message: `Load schedule deleted`
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string, resolution: 'voltage-drop' | 'schedule-of-loads' | 'manual' | 'merge') => {
    // Add to history
    addToHistory({
      circuitData,
      loadSchedules,
      conflicts
    });
    
    // Find the conflict
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;
    
    // Mark conflict as resolved
    setConflicts(prev => prev.map(c => 
      c.id === conflictId 
        ? { ...c, resolved: true, resolution } 
        : c
    ));
    
    // Update stats
    setSyncStats(prev => ({
      ...prev,
      conflicts: prev.conflicts - 1
    }));
    
    // Add sync event
    addSyncEvent({
      id: `event-${Date.now()}`,
      type: 'conflict-resolved',
      timestamp: Date.now(),
      source: 'system',
      details: {
      conflictId,
        circuitId: conflict.circuitId,
        loadScheduleId: conflict.loadScheduleId,
        message: `Conflict "${conflict.name}" resolved using ${resolution} strategy`
      }
    });
  }, [circuitData, loadSchedules, conflicts]);
  
  // Get sync events with filtering
  const getSyncEvents = useCallback(async (filter: SyncEventFilter) => {
    // Apply filters
    let filteredEvents = [...syncEvents];
    
    // Filter by type
    if (filter.types && filter.types.length > 0) {
      filteredEvents = filteredEvents.filter(event => filter.types.includes(event.type));
    }
    
    // Filter by source
    if (filter.sources && filter.sources.length > 0) {
      filteredEvents = filteredEvents.filter(event => filter.sources.includes(event.source));
    }
    
    // Filter by date range
    if (filter.startDate) {
      const startDate = new Date(filter.startDate).getTime();
      filteredEvents = filteredEvents.filter(event => event.timestamp >= startDate);
    }
    
    if (filter.endDate) {
      const endDate = new Date(filter.endDate).getTime();
      filteredEvents = filteredEvents.filter(event => event.timestamp <= endDate);
    }
    
    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.details.message.toLowerCase().includes(searchTerm) ||
        event.type.toLowerCase().includes(searchTerm) ||
        event.source.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp - a.timestamp);
    
    // Get total count
    const total = filteredEvents.length;
    
    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || 10;
    filteredEvents = filteredEvents.slice(offset, offset + limit);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { events: filteredEvents, total };
  }, [syncEvents]);
  
  // Add sync event helper
  const addSyncEvent = useCallback((event: SyncEvent) => {
    setSyncEvents(prev => [event, ...prev]);
  }, []);
  
  // Add to history
  const addToHistory = useCallback((state: any) => {
    // Remove any future states if we're not at the end of the history
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add current state to history
    setHistory([...newHistory, state]);
    
    // Update history index
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex]);
  
  // Check if undo is available
  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);
  
  // Check if redo is available
  const canRedo = useCallback(() => {
    return historyIndex < history.length - 1;
  }, [historyIndex, history.length]);
  
  // Undo
  const undo = useCallback(() => {
    if (!canUndo()) return;
    
    const newIndex = historyIndex - 1;
    const prevState = history[newIndex];
    
    // Restore previous state
    setCircuitData(prevState.circuitData);
    setLoadSchedules(prevState.loadSchedules);
    setConflicts(prevState.conflicts);
    
    // Update history index
    setHistoryIndex(newIndex);
  }, [canUndo, historyIndex, history]);
  
  // Redo
  const redo = useCallback(() => {
    if (!canRedo()) return;
    
    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];
    
    // Restore next state
    setCircuitData(nextState.circuitData);
    setLoadSchedules(nextState.loadSchedules);
    setConflicts(nextState.conflicts);
    
    // Update history index
    setHistoryIndex(newIndex);
  }, [canRedo, historyIndex, history]);
  
  // Update sync stats when conflicts change
  useEffect(() => {
        setSyncStats(prev => ({
          ...prev,
      conflicts: conflicts.filter(c => !c.resolved).length
    }));
  }, [conflicts]);
  
  // Implement updateLoadItem
  const updateLoadItem = useCallback((item: LoadItem) => {
    setLoadSchedules(prev => prev.map(schedule => ({
      ...schedule,
      loads: schedule.loads.map((i: LoadItem) => i.id === item.id ? item : i)
    })));
  }, []);
  
  // Context value
  const value = {
    circuitData,
    loadSchedules,
    syncStatus,
    syncStats,
    conflicts,
    syncEvents,
    enableSync,
    setAutoSync,
    syncNow,
    clearChanges,
    getCircuitById,
    updateCircuit,
    deleteCircuit,
    getLoadScheduleById,
    updateLoadSchedule,
    deleteLoadSchedule,
    resolveConflict,
    getSyncEvents,
    canUndo,
    canRedo,
    undo,
    redo,
    updateLoadItem
  };
  
  return (
    <CircuitSyncContext.Provider value={value}>
      {children}
    </CircuitSyncContext.Provider>
  );
};

// Custom hook to use the circuit sync context
export const useCircuitSync = () => {
  const context = useContext(CircuitSyncContext);
  if (context === undefined) {
    throw new Error('useCircuitSync must be used within a CircuitSyncProvider');
  }
  return context;
}; 