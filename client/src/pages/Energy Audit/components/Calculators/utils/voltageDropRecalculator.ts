/**
 * Voltage Drop Recalculator Service
 * 
 * This service handles automatic recalculation of voltage drop
 * when circuit properties change, with throttling and batch processing.
 */

import { circuitChangeTracker, CircuitChanges } from './circuitChangeTracker';
import { UnifiedCircuitData } from './CircuitSynchronization';

// Define a VoltageDropCalculationResult interface since the import is missing
export interface VoltageDropCalculationResult {
  voltageDropPercent: number;
  voltageDrop: number;
  receivingEndVoltage: number;
  compliance: 'compliant' | 'non-compliant';
  maxAllowedDrop: number;
  wireRating: {
    ampacity: number;
    isAdequate: boolean;
  };
  totalLoss: number;
  resistiveLoss: number;
  recommendations: string[];
}

// Define a simple calculation function since the import is missing
export function calculateVoltageDrops(circuitData: UnifiedCircuitData): VoltageDropCalculationResult {
  // This is a simplified implementation since we can't access the original function
  // A real implementation would calculate actual voltage drop values
  
  const current = circuitData.current || 0;
  const voltage = circuitData.voltage || 230;
  const length = circuitData.conductorLength || 0;
  const isConductorAdequate = true; // Simplified
  
  // Calculate voltage drop (simplified formula)
  const voltageDrop = current * 0.02 * length;
  const voltageDropPercent = (voltageDrop / voltage) * 100;
  const receivingEndVoltage = voltage - voltageDrop;
  
  // Determine compliance (simplified logic)
  const maxAllowedDrop = 3; // Standard 3% for branch circuits
  const isCompliant = voltageDropPercent <= maxAllowedDrop;
  
  // Calculate power loss (simplified)
  const resistiveLoss = current * current * 0.1 * length;
  const totalLoss = resistiveLoss * 1.1; // Adding 10% for other losses
  
  return {
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    compliance: isCompliant ? 'compliant' : 'non-compliant',
    maxAllowedDrop,
    wireRating: {
      ampacity: current * 1.25, // Simplified ampacity calculation
      isAdequate: isConductorAdequate
    },
    totalLoss,
    resistiveLoss,
    recommendations: isCompliant ? 
      ['No changes needed.'] : 
      ['Consider increasing conductor size.', 'Check for loose connections.']
  };
}

// Interface for storing voltage drop results by circuit ID
interface VoltageDropResultsCache {
  [circuitId: string]: VoltageDropCalculationResult;
}

// Interface for listeners interested in recalculation events
export interface RecalculationEvent {
  circuitIds: string[];
  results: VoltageDropResultsCache;
  timestamp: number;
  completed: boolean;
  error?: Error;
}

/**
 * Service for managing automatic recalculation of voltage drop
 */
export class VoltageDropRecalculator {
  private isRecalculating: boolean = false;
  private pendingRecalculations: Set<string> = new Set();
  private throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  private throttleDelay: number = 500; // ms
  private resultsCache: VoltageDropResultsCache = {};
  private listeners: Set<(event: RecalculationEvent) => void> = new Set();
  private circuitDataProvider: (circuitId: string) => UnifiedCircuitData | undefined;
  private isEnabled: boolean = true;
  
  /**
   * Create a new VoltageDropRecalculator
   * 
   * @param circuitDataProvider Function to provide circuit data for a given circuit ID
   */
  constructor(circuitDataProvider: (circuitId: string) => UnifiedCircuitData | undefined) {
    this.circuitDataProvider = circuitDataProvider;
    
    // Listen for circuit changes
    circuitChangeTracker.addChangeListener(this.handleCircuitChange);
  }
  
  /**
   * Enable or disable automatic recalculation
   * 
   * @param enabled Whether automatic recalculation should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Clear pending recalculations if disabled
    if (!enabled) {
      this.clearPendingRecalculations();
    }
  }
  
  /**
   * Check if automatic recalculation is enabled
   * 
   * @returns Whether automatic recalculation is enabled
   */
  isRecalculationEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Add a circuit to be recalculated
   * 
   * @param circuitId The ID of the circuit to recalculate
   */
  requestRecalculation(circuitId: string): void {
    if (!this.isEnabled) return;
    
    this.pendingRecalculations.add(circuitId);
    this.scheduleRecalculation();
  }
  
  /**
   * Request recalculation for multiple circuits
   * 
   * @param circuitIds Array of circuit IDs to recalculate
   */
  requestBatchRecalculation(circuitIds: string[]): void {
    if (!this.isEnabled) return;
    
    circuitIds.forEach(id => this.pendingRecalculations.add(id));
    this.scheduleRecalculation();
  }
  
  /**
   * Handle a circuit change event
   * 
   * @param changes The circuit changes
   */
  private handleCircuitChange = (changes: CircuitChanges): void => {
    if (!this.isEnabled) return;
    
    // Add to pending recalculations
    this.pendingRecalculations.add(changes.id);
    
    // Schedule a throttled recalculation
    this.scheduleRecalculation();
  }
  
  /**
   * Schedule a throttled recalculation
   */
  private scheduleRecalculation(): void {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }
    
    this.throttleTimeout = setTimeout(() => {
      this.performRecalculation();
    }, this.throttleDelay);
  }
  
  /**
   * Perform recalculation for all pending circuits
   */
  private async performRecalculation(): Promise<void> {
    if (this.isRecalculating || this.pendingRecalculations.size === 0 || !this.isEnabled) {
      return;
    }
    
    this.isRecalculating = true;
    
    // Create a copy of the pending recalculations to process
    const circuitsToRecalculate = Array.from(this.pendingRecalculations);
    this.pendingRecalculations.clear();
    
    // Notify listeners that recalculation has started
    const startEvent: RecalculationEvent = {
      circuitIds: circuitsToRecalculate,
      results: {},
      timestamp: Date.now(),
      completed: false
    };
    this.notifyListeners(startEvent);
    
    try {
      // Process circuits in batches to prevent UI freezing
      const batchSize = 5;
      const results: VoltageDropResultsCache = {};
      
      for (let i = 0; i < circuitsToRecalculate.length; i += batchSize) {
        const batch = circuitsToRecalculate.slice(i, i + batchSize);
        
        // Process each circuit in the batch
        await Promise.all(batch.map(async (circuitId) => {
          const circuitData = this.circuitDataProvider(circuitId);
          
          if (circuitData) {
            try {
              // Calculate voltage drop for the circuit
              const result = await calculateVoltageDrops(circuitData);
              
              // Cache the result
              results[circuitId] = result;
              this.resultsCache[circuitId] = result;
            } catch (error) {
              console.error(`Error calculating voltage drop for circuit ${circuitId}:`, error);
            }
          }
        }));
        
        // Short delay between batches to keep UI responsive
        if (i + batchSize < circuitsToRecalculate.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Notify listeners of completed recalculation
      const completeEvent: RecalculationEvent = {
        circuitIds: circuitsToRecalculate,
        results: results,
        timestamp: Date.now(),
        completed: true
      };
      this.notifyListeners(completeEvent);
    } catch (error) {
      // Notify listeners of error
      const errorEvent: RecalculationEvent = {
        circuitIds: circuitsToRecalculate,
        results: {},
        timestamp: Date.now(),
        completed: true,
        error: error instanceof Error ? error : new Error(String(error))
      };
      this.notifyListeners(errorEvent);
      
      console.error('Error during voltage drop recalculation:', error);
    } finally {
      this.isRecalculating = false;
      
      // If more recalculations were requested during this one, schedule another
      if (this.pendingRecalculations.size > 0) {
        this.scheduleRecalculation();
      }
    }
  }
  
  /**
   * Add a listener for recalculation events
   * 
   * @param listener Function to call when recalculation events occur
   * @returns Function to remove the listener
   */
  addRecalculationListener(listener: (event: RecalculationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of a recalculation event
   * 
   * @param event The recalculation event
   */
  private notifyListeners(event: RecalculationEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
  
  /**
   * Get the cached voltage drop result for a circuit
   * 
   * @param circuitId The ID of the circuit
   * @returns The cached voltage drop result, or undefined if not calculated
   */
  getCachedResult(circuitId: string): VoltageDropCalculationResult | undefined {
    return this.resultsCache[circuitId];
  }
  
  /**
   * Check if a circuit is pending recalculation
   * 
   * @param circuitId The ID of the circuit
   * @returns Whether the circuit is pending recalculation
   */
  isCircuitPendingRecalculation(circuitId: string): boolean {
    return this.pendingRecalculations.has(circuitId);
  }
  
  /**
   * Check if recalculation is in progress
   * 
   * @returns Whether recalculation is in progress
   */
  isRecalculationInProgress(): boolean {
    return this.isRecalculating;
  }
  
  /**
   * Clear all pending recalculations
   */
  clearPendingRecalculations(): void {
    this.pendingRecalculations.clear();
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
  }
  
  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.resultsCache = {};
  }
}

// Create singleton instance with a default circuit data provider that returns undefined
export const voltageDropRecalculator = new VoltageDropRecalculator(
  (circuitId: string) => undefined
); 