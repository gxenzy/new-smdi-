/**
 * Circuit Synchronization Utilities
 * 
 * This file contains types and utilities for synchronizing circuit data
 * between different calculators.
 */

/**
 * Unified circuit data format used to exchange information between calculators
 */
export interface UnifiedCircuitData {
  id: string;
  description?: string;
  conductorLength?: number;
  conductorSize?: string;
  conductorMaterial?: 'copper' | 'aluminum';
  conduitMaterial?: string;
  phaseConfiguration?: 'single-phase' | 'three-phase';
  current?: number;
  voltage?: number;
  powerFactor?: number;
  efficiency?: number;
  circuitBreaker?: string;
  circuitType?: string;
  [key: string]: any; // Allow additional properties for flexibility
}

/**
 * Convert circuit data from Schedule of Loads format to Voltage Drop format
 * @param circuitData The circuit data from Schedule of Loads
 * @returns The circuit data in Voltage Drop format
 */
export function convertToVoltageDropFormat(circuitData: UnifiedCircuitData): any {
  // Implementation would go here
  return { ...circuitData };
}

/**
 * Convert circuit data from Voltage Drop format to Schedule of Loads format
 * @param circuitData The circuit data from Voltage Drop calculator
 * @returns The circuit data in Schedule of Loads format
 */
export function convertToScheduleOfLoadsFormat(circuitData: UnifiedCircuitData): any {
  // Implementation would go here
  return { ...circuitData };
} 