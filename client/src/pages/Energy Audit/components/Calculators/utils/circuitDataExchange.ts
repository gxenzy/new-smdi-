/**
 * Circuit Data Exchange Utilities
 * 
 * This module provides utilities for exchanging data between
 * the Voltage Drop Calculator and Schedule of Loads Calculator
 */

import { VoltageDropInputs, CircuitType } from './voltageDropUtils';
import { LoadSchedule, LoadItem } from '../ScheduleOfLoads/types';
import { InsulationType } from './enhancedVoltageDropUtils';

/**
 * Interface that represents a circuit with all necessary information
 * for both Voltage Drop and Schedule of Loads calculations
 */
export interface UnifiedCircuitData {
  id: string;
  name: string;
  description?: string;
  
  // Voltage drop parameters
  voltage: number;
  current: number;
  conductorLength: number;
  conductorSize: string;
  conductorMaterial: 'copper' | 'aluminum';
  conduitMaterial: 'PVC' | 'steel' | 'aluminum';
  phaseConfiguration: 'single-phase' | 'three-phase';
  temperature: number;
  powerFactor: number;
  
  // Enhanced voltage drop parameters
  insulationType?: InsulationType;
  ambientTemperature?: number;
  harmonicFactor?: number;
  parallelSets?: number;
  bundleAdjustmentFactor?: number;
  distanceToFurthestOutlet?: number;
  startingCurrentMultiplier?: number;
  diversityFactor?: number;
  demandFactor?: number;
  
  // Circuit configuration
  circuitType: CircuitType;
  
  // Schedule of loads parameters
  connectedLoad: number;
  demandLoad: number;
  
  // Circuit protection
  circuitBreaker?: string;
  
  // Calculation results
  voltageDropPercent?: number;
  voltageDrop?: number;
  
  // Source tracking
  source: 'voltage-drop' | 'schedule-of-loads';
  sourceId: string;
  
  // Timestamp for tracking last update
  timestamp: number;
}

/**
 * Convert a LoadSchedule to a UnifiedCircuitData object
 * 
 * @param loadSchedule - The load schedule data from Schedule of Loads calculator
 * @returns A unified circuit data object
 */
export function loadScheduleToUnifiedCircuit(loadSchedule: LoadSchedule): UnifiedCircuitData {
  return {
    id: loadSchedule.id,
    name: loadSchedule.name,
    description: `Panel: ${loadSchedule.panelName}`,
    
    voltage: loadSchedule.voltage,
    current: loadSchedule.current,
    conductorLength: loadSchedule.conductorLength || 50, // Default, will need to be set by the user
    conductorSize: loadSchedule.conductorSize || '12 AWG', // Default
    conductorMaterial: 'copper', // Default
    conduitMaterial: 'PVC', // Default
    phaseConfiguration: loadSchedule.phaseConfiguration || 'single-phase',
    temperature: 30, // Default, will need to be set by the user
    powerFactor: loadSchedule.powerFactor,
    
    // Enhanced voltage drop parameters
    insulationType: loadSchedule.insulationType || 'THWN',
    ambientTemperature: loadSchedule.ambientTemperature || 30,
    harmonicFactor: loadSchedule.harmonicFactor || 1.0,
    parallelSets: loadSchedule.parallelSets || 1,
    bundleAdjustmentFactor: loadSchedule.bundleAdjustmentFactor || 1.0,
    
    circuitType: 'feeder', // Default, will need to be verified
    
    connectedLoad: loadSchedule.totalConnectedLoad,
    demandLoad: loadSchedule.totalDemandLoad,
    
    circuitBreaker: loadSchedule.circuitBreaker,
    
    source: 'schedule-of-loads',
    sourceId: loadSchedule.id,
    
    timestamp: Date.now()
  };
}

/**
 * Convert a LoadItem to a UnifiedCircuitData object
 * 
 * @param loadItem - The load item data from Schedule of Loads calculator
 * @param voltage - System voltage
 * @param powerFactor - System power factor
 * @returns A unified circuit data object
 */
export function loadItemToUnifiedCircuit(
  loadItem: LoadItem, 
  voltage: number,
  powerFactor: number
): UnifiedCircuitData {
  // Determine the circuit type based on circuit details if available
  const circuitType = loadItem.circuitDetails?.type === 'motor' ? 'motor' : 'branch';
  
  return {
    id: loadItem.id,
    name: loadItem.description,
    
    voltage: voltage,
    current: loadItem.current || (loadItem.demandLoad / voltage),
    conductorLength: loadItem.conductorLength || 30, // Default, will need to be set by the user
    conductorSize: loadItem.conductorSize || '12 AWG', // Default
    conductorMaterial: 'copper', // Default
    conduitMaterial: 'PVC', // Default
    phaseConfiguration: loadItem.circuitDetails?.phase === 'A-B-C' ? 'three-phase' : 'single-phase',
    temperature: 30, // Default, will need to be set by the user
    powerFactor: powerFactor,
    
    // Enhanced voltage drop parameters
    insulationType: loadItem.insulationType || 'THWN',
    ambientTemperature: loadItem.ambientTemperature || 30,
    harmonicFactor: loadItem.harmonicFactor || 1.0,
    parallelSets: loadItem.parallelSets || 1,
    bundleAdjustmentFactor: loadItem.bundleAdjustmentFactor || 1.0,
    
    circuitType: circuitType, // Use the determined circuit type
    
    connectedLoad: loadItem.connectedLoad,
    demandLoad: loadItem.demandLoad,
    
    circuitBreaker: loadItem.circuitBreaker,
    
    source: 'schedule-of-loads',
    sourceId: loadItem.id,
    
    timestamp: Date.now()
  };
}

/**
 * Convert a UnifiedCircuitData object to VoltageDropInputs
 * 
 * @param circuitData - The unified circuit data
 * @returns Voltage drop inputs
 */
export function unifiedCircuitToVoltageDropInputs(circuitData: UnifiedCircuitData): VoltageDropInputs {
  return {
    systemVoltage: circuitData.voltage,
    loadCurrent: circuitData.current,
    conductorLength: circuitData.conductorLength,
    conductorSize: circuitData.conductorSize,
    conductorMaterial: circuitData.conductorMaterial,
    conduitMaterial: circuitData.conduitMaterial,
    phaseConfiguration: circuitData.phaseConfiguration,
    temperature: circuitData.temperature,
    powerFactor: circuitData.powerFactor,
    // Enhanced voltage drop parameters
    insulationType: circuitData.insulationType,
    ambientTemperature: circuitData.ambientTemperature,
    harmonicFactor: circuitData.harmonicFactor,
    parallelSets: circuitData.parallelSets,
    bundleAdjustmentFactor: circuitData.bundleAdjustmentFactor,
    distanceToFurthestOutlet: circuitData.distanceToFurthestOutlet,
    startingCurrentMultiplier: circuitData.startingCurrentMultiplier,
    diversityFactor: circuitData.diversityFactor,
    demandFactor: circuitData.demandFactor,
    circuitConfiguration: {
      circuitType: circuitData.circuitType,
      // Add other circuit-specific configurations as needed
      hasVFD: false,
      wireway: 'conduit',
      distanceToFurthestOutlet: circuitData.distanceToFurthestOutlet,
      startingCurrentMultiplier: circuitData.startingCurrentMultiplier,
      serviceFactor: 1.15 // Default service factor
    }
  };
}

/**
 * Convert VoltageDropInputs to a UnifiedCircuitData object
 * 
 * @param inputs - The voltage drop inputs
 * @param id - Optional unique identifier
 * @param name - Optional name for the circuit
 * @returns A unified circuit data object
 */
export function voltageDropInputsToUnifiedCircuit(
  inputs: VoltageDropInputs,
  id: string = '',
  name: string = 'Voltage Drop Circuit'
): UnifiedCircuitData {
  return {
    id: id || `vd-${Date.now()}`,
    name: name,
    
    voltage: inputs.systemVoltage,
    current: inputs.loadCurrent,
    conductorLength: inputs.conductorLength,
    conductorSize: inputs.conductorSize,
    conductorMaterial: inputs.conductorMaterial,
    conduitMaterial: inputs.conduitMaterial,
    phaseConfiguration: inputs.phaseConfiguration,
    temperature: inputs.temperature,
    powerFactor: inputs.powerFactor || 0.85,
    
    circuitType: inputs.circuitConfiguration.circuitType,
    
    // Estimate connected load based on current and voltage
    connectedLoad: inputs.loadCurrent * inputs.systemVoltage,
    demandLoad: inputs.loadCurrent * inputs.systemVoltage,
    
    source: 'voltage-drop',
    sourceId: id || `vd-${Date.now()}`,
    
    timestamp: Date.now()
  };
}

/**
 * Update a LoadItem with voltage drop calculation results
 * 
 * @param loadItem - The load item to update
 * @param voltageDropPercent - Calculated voltage drop percentage
 * @param voltageDrop - Calculated voltage drop in volts
 * @param receivingEndVoltage - Voltage at receiving end
 * @param isPECCompliant - Whether it complies with PEC standards
 * @param conductorLength - Length of conductor used in calculation
 * @param optimalConductorSize - Optimal conductor size for compliance
 * @returns Updated load item
 */
export function updateLoadItemWithVoltageDropResults(
  loadItem: LoadItem,
  voltageDropPercent: number,
  voltageDrop: number,
  receivingEndVoltage: number,
  isPECCompliant: boolean,
  conductorLength: number,
  optimalConductorSize?: string
): LoadItem {
  return {
    ...loadItem,
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    isPECCompliant,
    conductorLength,
    optimalConductorSize
  };
}

/**
 * Update a LoadSchedule with voltage drop calculation results
 * 
 * @param loadSchedule - The load schedule to update
 * @param voltageDropPercent - Calculated voltage drop percentage
 * @param voltageDrop - Calculated voltage drop in volts
 * @param receivingEndVoltage - Voltage at receiving end
 * @param isPECCompliant - Whether it complies with PEC standards
 * @param conductorLength - Length of conductor used in calculation
 * @param optimalConductorSize - Optimal conductor size for compliance
 * @param phaseConfiguration - Phase configuration used in calculation
 * @returns Updated load schedule
 */
export function updateLoadScheduleWithVoltageDropResults(
  loadSchedule: LoadSchedule,
  voltageDropPercent: number,
  voltageDrop: number,
  receivingEndVoltage: number,
  isPECCompliant: boolean,
  conductorLength: number,
  optimalConductorSize?: string,
  phaseConfiguration?: 'single-phase' | 'three-phase'
): LoadSchedule {
  return {
    ...loadSchedule,
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    isPECCompliant,
    conductorLength,
    optimalConductorSize,
    phaseConfiguration
  };
}

/**
 * Find optimal conductor size for a load item based on voltage drop and ampacity
 * 
 * @param loadItem - The load item
 * @param voltage - System voltage
 * @param conductorLength - Length of conductor in meters
 * @param maxVoltageDropPercent - Maximum allowed voltage drop percentage
 * @returns Recommended conductor size
 */
export function findOptimalConductorSizeForLoadItem(
  loadItem: LoadItem,
  voltage: number,
  conductorLength: number,
  maxVoltageDropPercent: number = 3
): string {
  // This function would use the voltage drop calculator's optimization function
  // and return the optimal conductor size
  // Implementation would depend on the existing voltage drop optimization logic
  
  // For now, return a placeholder
  return loadItem.conductorSize || '12 AWG';
} 