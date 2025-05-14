/**
 * Circuit Change Tracker
 * 
 * This utility tracks changes to circuit properties that affect voltage drop calculations
 * and provides a notification system to trigger automatic recalculations.
 */

// CircuitType isn't used, so we can remove this import
// import { CircuitType } from '../ScheduleOfLoads/types';

/**
 * Interface representing changes made to a circuit's properties
 */
export interface CircuitChanges {
  id: string;
  changedProperties: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: number;
}

/**
 * Properties that affect voltage drop calculations
 */
const VOLTAGE_DROP_PROPERTIES = [
  'conductorLength',
  'conductorSize',
  'conductorMaterial',
  'conduitMaterial',
  'circuitType',
  'phaseConfiguration',
  'current',
  'rating', // Load rating affects current
  'quantity', // Number of items affects total current
  'circuitBreaker', // Indirectly related to circuit sizing
  'powerFactor',
  'efficiency',
  'voltage',
  'phase',
  'wireType',
  'lengthUnit',
  'insulation',
  'temperatureRating',
  'ambientTemperature'
];

/**
 * Circuit Change Tracker class
 * 
 * Tracks changes to circuit properties and notifies listeners when changes occur
 * that might affect voltage drop calculations.
 */
export class CircuitChangeTracker {
  private changes: Map<string, CircuitChanges> = new Map();
  private listeners: Set<(changes: CircuitChanges) => void> = new Set();
  private isEnabled: boolean = true;
  
  /**
   * Track a change to a circuit property
   * 
   * @param circuitId The ID of the circuit being changed
   * @param property The property being changed
   * @param previousValue The previous value of the property
   * @param newValue The new value of the property
   */
  trackChange(
    circuitId: string,
    property: string,
    previousValue: any,
    newValue: any
  ): void {
    if (!this.isEnabled) return;
    
    // Record the change
    let circuitChanges = this.changes.get(circuitId);
    if (!circuitChanges) {
      circuitChanges = {
        id: circuitId,
        changedProperties: [],
        previousValues: {},
        newValues: {},
        timestamp: Date.now()
      };
      this.changes.set(circuitId, circuitChanges);
    }
    
    // Don't track changes if the values are the same
    if (previousValue === newValue) {
      return;
    }
    
    circuitChanges.changedProperties.push(property);
    circuitChanges.previousValues[property] = previousValue;
    circuitChanges.newValues[property] = newValue;
    
    // Only notify listeners if the change affects voltage drop
    if (this.doesChangeAffectVoltageDrop(property)) {
      this.notifyListeners(circuitChanges);
    }
  }
  
  /**
   * Check if a property change affects voltage drop calculations
   * 
   * @param property The property that changed
   * @returns True if the property affects voltage drop calculations
   */
  doesChangeAffectVoltageDrop(property: string): boolean {
    return VOLTAGE_DROP_PROPERTIES.includes(property);
  }
  
  /**
   * Add a listener for circuit changes that affect voltage drop
   * 
   * @param listener The function to call when a relevant change occurs
   * @returns A function to remove the listener
   */
  addChangeListener(listener: (changes: CircuitChanges) => void): () => void {
    this.listeners.add(listener);
    // Return a function to remove the listener
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of a change
   * 
   * @param changes The changes to notify about
   */
  private notifyListeners(changes: CircuitChanges): void {
    this.listeners.forEach(listener => listener(changes));
  }
  
  /**
   * Clear all tracked changes
   */
  clearChanges(): void {
    this.changes.clear();
  }
  
  /**
   * Enable or disable change tracking
   * 
   * @param enabled - Whether tracking is enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Get all tracked changes for a circuit
   * 
   * @param circuitId The ID of the circuit
   * @returns The changes for the circuit, or undefined if none exist
   */
  getChanges(circuitId: string): CircuitChanges | undefined {
    return this.changes.get(circuitId);
  }
  
  /**
   * Get all tracked changes
   * 
   * @returns An array of all tracked changes
   */
  getAllChanges(): CircuitChanges[] {
    return Array.from(this.changes.values());
  }
  
  /**
   * Get the changes for a specific circuit
   * 
   * @param circuitId - ID of the circuit
   * @returns Changes for the circuit, or null if none
   */
  getChangesForCircuit(circuitId: string): CircuitChanges | null {
    return this.changes.get(circuitId) || null;
  }
  
  /**
   * Check if a circuit has any tracked changes
   * 
   * @param circuitId - ID of the circuit
   * @returns Whether the circuit has changes
   */
  hasChanges(circuitId: string): boolean {
    return this.changes.has(circuitId);
  }
}

// Create singleton instance
export const circuitChangeTracker = new CircuitChangeTracker(); 