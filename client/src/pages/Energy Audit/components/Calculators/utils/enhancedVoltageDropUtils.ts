/**
 * Enhanced Voltage Drop Analysis Utilities
 * 
 * This module extends the base voltage drop utilities with enhanced functionality:
 * - Temperature derating based on insulation type
 * - Harmonic content analysis
 * - Parallel conductor calculations
 * - Bundle adjustment factors
 */

import { 
  VoltageDropInputs, 
  VoltageDropResult,
  CircuitType,
  CircuitConfiguration,
  RESISTIVITY,
  TEMP_COEFFICIENT,
  REACTANCE,
  COPPER_AMPACITY,
  ALUMINUM_AMPACITY,
  getVoltageDropLimit,
  calculateAmpacityRating
} from './voltageDropUtils';
import { CONDUCTOR_SIZES } from './voltageRegulationUtils';
import { memoizeCalculationWithInvalidation } from './voltageDropCaching';

/**
 * Enhanced inputs for voltage drop calculation
 */
export interface EnhancedVoltageDropInputs extends VoltageDropInputs {
  insulationType: InsulationType;
  ambientTemperature: number;
  harmonicFactor: number;
  parallelSets: number;
  bundleAdjustmentFactor: number;
  distanceToFurthestOutlet?: number; // For branch circuits
  startingCurrentMultiplier?: number; // For motor circuits
  diversityFactor?: number; // For feeder circuits
  demandFactor?: number; // For service entrance
}

/**
 * Insulation types for conductors
 */
export type InsulationType = 'THHN' | 'THWN' | 'XHHW' | 'RHW' | 'USE';

/**
 * Temperature ratings for insulation types (°C)
 */
export const INSULATION_TEMPERATURE_RATINGS: Record<InsulationType, number> = {
  'THHN': 90,
  'THWN': 75,
  'XHHW': 90,
  'RHW': 75,
  'USE': 75
};

/**
 * Temperature correction factors based on insulation type and ambient temperature
 * Based on PEC 2017 Table 2.10
 */
export const TEMPERATURE_CORRECTION_FACTORS: Record<string, Record<number, number>> = {
  // For 60°C rated conductors (not common but included for completeness)
  '60°C': {
    21: 1.05, 26: 1.00, 31: 0.94, 36: 0.88, 41: 0.82, 46: 0.75, 51: 0.67, 56: 0.58, 61: 0.33
  },
  // For 75°C rated conductors (THWN, RHW, USE)
  '75°C': {
    21: 1.05, 26: 1.00, 31: 0.94, 36: 0.88, 41: 0.82, 46: 0.75, 51: 0.67, 56: 0.58, 61: 0.33
  },
  // For 90°C rated conductors (THHN, XHHW)
  '90°C': {
    21: 1.05, 26: 1.00, 31: 0.94, 36: 0.88, 41: 0.82, 46: 0.75, 51: 0.67, 56: 0.58, 61: 0.33
  }
};

/**
 * Get the temperature rating for a given insulation type
 * 
 * @param insulationType - Insulation type
 * @returns Temperature rating in °C
 */
export function getInsulationTemperatureRating(insulationType: InsulationType): number {
  return INSULATION_TEMPERATURE_RATINGS[insulationType] || 75; // Default to 75°C if type not found
}

/**
 * Get the temperature correction factor based on insulation type and ambient temperature
 * 
 * @param insulationType - Insulation type
 * @param ambientTemperature - Ambient temperature in °C
 * @returns Temperature correction factor
 */
export function getTemperatureCorrectionFactor(insulationType: InsulationType, ambientTemperature: number): number {
  // Get temperature rating
  const temperatureRating = getInsulationTemperatureRating(insulationType);
  
  // Get the appropriate temperature correction table
  const temperatureTable = TEMPERATURE_CORRECTION_FACTORS[`${temperatureRating}°C`];
  
  // Find the closest temperature key in the table
  const temperatureKeys = Object.keys(temperatureTable).map(Number).sort((a, b) => a - b);
  
  // Handle temperatures below or above the range
  if (ambientTemperature <= temperatureKeys[0]) {
    return temperatureTable[temperatureKeys[0]];
  } else if (ambientTemperature >= temperatureKeys[temperatureKeys.length - 1]) {
    return temperatureTable[temperatureKeys[temperatureKeys.length - 1]];
  }
  
  // Find the closest temperature key that's less than or equal to the ambient temperature
  let closestKey = temperatureKeys[0];
  for (const key of temperatureKeys) {
    if (key <= ambientTemperature) {
      closestKey = key;
    } else {
      break;
    }
  }
  
  // Find the next temperature key
  const nextKey = temperatureKeys[temperatureKeys.indexOf(closestKey) + 1];
  
  // If we found an exact match, return it
  if (closestKey === ambientTemperature) {
    return temperatureTable[closestKey];
  }
  
  // Otherwise, interpolate between the closest keys
  const lowerValue = temperatureTable[closestKey];
  const upperValue = temperatureTable[nextKey];
  const ratio = (ambientTemperature - closestKey) / (nextKey - closestKey);
  
  return lowerValue + (upperValue - lowerValue) * ratio;
}

/**
 * Calculate the ampacity adjustment based on parallel conductors and bundle factors
 * 
 * @param baseAmpacity - Base ampacity value
 * @param parallelSets - Number of parallel sets
 * @param bundleAdjustmentFactor - Bundle adjustment factor (0-1)
 * @returns Adjusted ampacity
 */
export function calculateAdjustedAmpacity(
  baseAmpacity: number,
  parallelSets: number = 1,
  bundleAdjustmentFactor: number = 1.0
): number {
  // Adjust for parallel sets
  const parallelAmpacity = baseAmpacity * parallelSets;
  
  // Apply bundle adjustment factor
  return parallelAmpacity * bundleAdjustmentFactor;
}

/**
 * Calculate the harmonic current adjustment for a given harmonic factor
 * 
 * @param current - Base current value
 * @param harmonicFactor - Harmonic factor (>= 1.0)
 * @returns Adjusted current value
 */
export function calculateHarmonicCurrentAdjustment(
  current: number,
  harmonicFactor: number = 1.0
): number {
  // Harmonics increase the effective current due to additional heating
  return current * harmonicFactor;
}

/**
 * Enhanced ampacity tables with insulation types
 */
export const INSULATION_BASED_AMPACITY: Record<InsulationType, Record<'copper' | 'aluminum', Record<string, number>>> = {
  'THHN': {
    'copper': { ...COPPER_AMPACITY },
    'aluminum': { ...ALUMINUM_AMPACITY }
  },
  'THWN': {
    'copper': { ...COPPER_AMPACITY },
    'aluminum': { ...ALUMINUM_AMPACITY }
  },
  'XHHW': {
    'copper': { ...COPPER_AMPACITY },
    'aluminum': { ...ALUMINUM_AMPACITY }
  },
  'RHW': {
    'copper': { ...COPPER_AMPACITY },
    'aluminum': { ...ALUMINUM_AMPACITY }
  },
  'USE': {
    'copper': { ...COPPER_AMPACITY },
    'aluminum': { ...ALUMINUM_AMPACITY }
  }
};

/**
 * Calculate the derated ampacity based on insulation type and environment
 * 
 * @param inputs - Enhanced voltage drop inputs
 * @returns Derated ampacity and adequacy status
 */
export function calculateDeratedAmpacity(inputs: EnhancedVoltageDropInputs): {
  baseAmpacity: number;
  deratedAmpacity: number;
  isAdequate: boolean;
  derationFactor: number;
} {
  const { 
    conductorSize, 
    conductorMaterial,
    loadCurrent,
    circuitConfiguration,
    insulationType = 'THWN',
    ambientTemperature = 30,
    bundleAdjustmentFactor = 1.0,
    parallelSets = 1
  } = inputs;
  
  // Get the appropriate ampacity table
  const ampacityTable = INSULATION_BASED_AMPACITY[insulationType][conductorMaterial];
  
  // Get the base ampacity for the conductor size
  const baseAmpacity = ampacityTable[conductorSize] || 0;
  
  // Calculate temperature derating
  const temperatureDerating = getTemperatureCorrectionFactor(insulationType, ambientTemperature);
  
  // Calculate final derated ampacity
  const derationFactor = temperatureDerating * bundleAdjustmentFactor;
  const deratedAmpacity = baseAmpacity * derationFactor * parallelSets;
  
  // For motor circuits, we need to compare against the starting current
  let currentToCompare = loadCurrent;
  if (circuitConfiguration.circuitType === 'motor' && inputs.startingCurrentMultiplier) {
    currentToCompare = loadCurrent * inputs.startingCurrentMultiplier;
  }
  
  // Account for diversity factor for feeder circuits
  if (circuitConfiguration.circuitType === 'feeder' && inputs.diversityFactor) {
    currentToCompare = loadCurrent * inputs.diversityFactor;
  }
  
  // Account for demand factor for service entrance
  if (circuitConfiguration.circuitType === 'service' && inputs.demandFactor) {
    currentToCompare = loadCurrent * inputs.demandFactor;
  }
  
  return {
    baseAmpacity,
    deratedAmpacity,
    isAdequate: deratedAmpacity >= currentToCompare,
    derationFactor
  };
}

/**
 * Calculate enhanced voltage drop with all factors considered
 * 
 * @param inputs - Enhanced voltage drop inputs
 * @returns Voltage drop calculation result
 */
export function calculateEnhancedVoltageDrop(inputs: EnhancedVoltageDropInputs): number {
  const {
    systemVoltage,
    loadCurrent,
    conductorLength,
    conductorSize,
    conductorMaterial,
    conduitMaterial,
    phaseConfiguration,
    powerFactor = 0.85,
    harmonicFactor = 1.0,
    parallelSets = 1
  } = inputs;
  
  // Get the conductor cross-sectional area in circular mils
  const conductorArea = CONDUCTOR_SIZES[conductorSize] || 0;
  
  // Calculate resistance based on conductor properties
  const resistivity = RESISTIVITY[conductorMaterial];
  const resistance = (resistivity * conductorLength * 3.281) / (conductorArea * parallelSets);
  
  // Calculate reactance based on conduit material and phase configuration
  const reactance = REACTANCE[conduitMaterial][phaseConfiguration] * conductorLength * 3.281 / 1000 / parallelSets;
  
  // Calculate voltage drop based on phase configuration and power factor
  const sinPhi = Math.sin(Math.acos(powerFactor));
  const cosPhi = powerFactor;
  
  // Apply harmonic factor to the reactance component
  const enhancedReactance = reactance * harmonicFactor;
  
  // Calculate voltage drop based on circuit type and phase configuration
  let voltageDrop: number;
  
  if (phaseConfiguration === 'single-phase') {
    voltageDrop = 2 * loadCurrent * (resistance * cosPhi + enhancedReactance * sinPhi);
  } else {
    voltageDrop = Math.sqrt(3) * loadCurrent * (resistance * cosPhi + enhancedReactance * sinPhi);
  }
  
  return voltageDrop;
}

/**
 * Calculate the complete enhanced voltage drop results
 * 
 * @param inputs - Enhanced voltage drop inputs
 * @returns Complete voltage drop calculation results
 */
export function calculateEnhancedVoltageDropResults(inputs: EnhancedVoltageDropInputs): VoltageDropResult {
  const {
    systemVoltage,
    circuitConfiguration,
    loadCurrent
  } = inputs;
  
  // Calculate ampacity rating
  const ampacityInfo = calculateDeratedAmpacity(inputs);
  
  // Calculate voltage drop
  const voltageDrop = calculateEnhancedVoltageDrop(inputs);
  
  // Calculate voltage drop percentage
  const voltageDropPercent = (voltageDrop / systemVoltage) * 100;
  
  // Calculate receiving end voltage
  const receivingEndVoltage = systemVoltage - voltageDrop;
  
  // Get the maximum allowed voltage drop for this circuit type
  const maxAllowedDrop = getVoltageDropLimit(circuitConfiguration.circuitType);
  
  // Determine compliance
  const compliance = voltageDropPercent <= maxAllowedDrop ? 'compliant' : 'non-compliant';
  
  // Calculate power loss
  const resistivity = RESISTIVITY[inputs.conductorMaterial];
  const conductorArea = CONDUCTOR_SIZES[inputs.conductorSize] || 0;
  const parallelSets = inputs.parallelSets || 1;
  
  const resistance = (resistivity * inputs.conductorLength * 3.281) / (conductorArea * parallelSets);
  const reactance = REACTANCE[inputs.conduitMaterial][inputs.phaseConfiguration] * 
    inputs.conductorLength * 3.281 / 1000 / parallelSets;
  
  const harmonicFactor = inputs.harmonicFactor || 1.0;
  const enhancedReactance = reactance * harmonicFactor;
  
  const resistiveLoss = Math.pow(loadCurrent, 2) * resistance * 
    (inputs.phaseConfiguration === 'single-phase' ? 2 : 3);
  
  const reactiveLoss = Math.pow(loadCurrent, 2) * enhancedReactance * 
    (inputs.phaseConfiguration === 'single-phase' ? 2 : 3);
  
  const totalLoss = resistiveLoss + reactiveLoss;
  
  // Generate recommendations
  const recommendations = generateEnhancedRecommendations(
    inputs,
    voltageDropPercent,
    maxAllowedDrop,
    ampacityInfo
  );
  
  return {
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    resistiveLoss,
    reactiveLoss,
    totalLoss,
    compliance,
    maxAllowedDrop,
    recommendations,
    wireRating: {
      ampacity: ampacityInfo.deratedAmpacity,
      isAdequate: ampacityInfo.isAdequate
    }
  };
}

/**
 * Generate enhanced recommendations based on calculation results
 * 
 * @param inputs - Enhanced voltage drop inputs
 * @param voltageDropPercent - Calculated voltage drop percentage
 * @param voltageDropLimit - Maximum allowed voltage drop percentage
 * @param ampacityInfo - Ampacity rating information
 * @returns Array of recommendations
 */
function generateEnhancedRecommendations(
  inputs: EnhancedVoltageDropInputs,
  voltageDropPercent: number,
  voltageDropLimit: number,
  ampacityInfo: {
    baseAmpacity: number;
    deratedAmpacity: number;
    isAdequate: boolean;
    derationFactor: number;
  }
): string[] {
  const recommendations: string[] = [];
  
  // Check voltage drop compliance
  if (voltageDropPercent > voltageDropLimit) {
    recommendations.push(`Voltage drop (${voltageDropPercent.toFixed(2)}%) exceeds the maximum allowed (${voltageDropLimit}%) for ${inputs.circuitConfiguration.circuitType} circuits.`);
    
    // Suggest conductor size upgrade
    const availableSizes = Object.keys(CONDUCTOR_SIZES)
      .filter(size => CONDUCTOR_SIZES[size] > CONDUCTOR_SIZES[inputs.conductorSize]);
    
    if (availableSizes.length > 0) {
      recommendations.push(`Consider upgrading conductor size from ${inputs.conductorSize} to ${availableSizes[0]} or larger.`);
    }
    
    // Suggest parallel conductors if applicable
    if (!inputs.parallelSets || inputs.parallelSets === 1) {
      recommendations.push("Consider using parallel conductors to reduce voltage drop.");
    }
  }
  
  // Check ampacity rating
  if (!ampacityInfo.isAdequate) {
    recommendations.push(`Conductor ampacity (${ampacityInfo.deratedAmpacity.toFixed(2)} A) is insufficient for the load current (${inputs.loadCurrent.toFixed(2)} A).`);
    
    // Suggest options for improving ampacity
    if (ampacityInfo.derationFactor < 0.8) {
      recommendations.push("Consider improving installation conditions to reduce temperature derating.");
    }
    
    // Suggest conductor material change if appropriate
    if (inputs.conductorMaterial === 'aluminum') {
      recommendations.push("Consider switching to copper conductors for better ampacity rating.");
    }
  }
  
  // Circuit-specific recommendations
  switch (inputs.circuitConfiguration.circuitType) {
    case 'branch':
      if (inputs.distanceToFurthestOutlet && inputs.distanceToFurthestOutlet > 30) {
        recommendations.push("Long branch circuit detected. Consider adding a sub-panel closer to the loads.");
      }
      break;
      
    case 'motor':
      if (inputs.startingCurrentMultiplier && inputs.startingCurrentMultiplier > 1.5) {
        recommendations.push("High starting current detected. Consider using soft starters or VFDs to reduce voltage drop during motor starting.");
      }
      break;
      
    case 'feeder':
      if (inputs.diversityFactor && inputs.diversityFactor < 0.7) {
        recommendations.push("Low diversity factor may lead to incorrect sizing. Verify the load diversity calculation.");
      }
      break;
      
    case 'service':
      if (inputs.demandFactor && inputs.demandFactor < 0.5) {
        recommendations.push("Very low demand factor detected. Verify demand calculations to avoid oversizing service conductors.");
      }
      break;
  }
  
  // If no issues found
  if (recommendations.length === 0) {
    recommendations.push("Conductor size is adequate for both voltage drop and ampacity requirements.");
  }
  
  return recommendations;
}

/**
 * Find the minimum conductor size that meets enhanced voltage drop requirements
 * 
 * @param inputs - Enhanced voltage drop inputs (without conductorSize)
 * @returns Minimum conductor size that meets requirements
 */
export function findEnhancedMinimumConductorSize(
  inputs: Omit<EnhancedVoltageDropInputs, 'conductorSize'>
): string {
  // Get conductor sizes sorted by size (smallest to largest)
  const conductorSizes = Object.keys(CONDUCTOR_SIZES).sort((a, b) => {
    return CONDUCTOR_SIZES[a] - CONDUCTOR_SIZES[b];
  });
  
  // Apply harmonic adjustment to current
  const adjustedCurrent = calculateHarmonicCurrentAdjustment(
    inputs.loadCurrent,
    inputs.harmonicFactor
  );
  
  // Get the voltage drop limit for this circuit type
  const voltageDropLimit = getVoltageDropLimitByCircuitType(inputs.circuitConfiguration.circuitType);
  
  // Try each conductor size until we find one that meets all requirements
  for (const size of conductorSizes) {
    // Create inputs with the current size
    const sizeInputs: EnhancedVoltageDropInputs = {
      ...inputs,
      conductorSize: size
    } as EnhancedVoltageDropInputs;
    
    // Calculate results
    const results = calculateEnhancedVoltageDropResults(sizeInputs);
    
    // Check if this size meets both voltage drop and ampacity requirements
    if (results.voltageDropPercent <= voltageDropLimit && results.wireRating.isAdequate) {
      return size;
    }
  }
  
  // If no size is adequate, return the largest available
  return conductorSizes[conductorSizes.length - 1];
}

/**
 * Get the voltage drop limit based on circuit type
 * 
 * @param circuitType - Type of circuit
 * @returns Voltage drop limit percentage
 */
export function getVoltageDropLimitByCircuitType(circuitType: string): number {
  switch (circuitType) {
    case 'branch':
      return 3.0;
    case 'feeder':
    case 'service':
      return 2.0;
    case 'motor':
      return 3.0;
    default:
      return 3.0;
  }
}

/**
 * Calculate the voltage profile along a conductor
 * 
 * @param inputs - Enhanced voltage drop inputs
 * @param numPoints - Number of points to calculate (default: 10)
 * @returns Array of voltage values along the conductor
 */
export function calculateVoltageProfile(
  inputs: EnhancedVoltageDropInputs,
  numPoints: number = 10
): { distance: number; voltage: number }[] {
  const voltageProfile: { distance: number; voltage: number }[] = [];
  const results = calculateEnhancedVoltageDropResults(inputs);
  
  // Calculate voltage drop per unit length
  const totalVoltageDrop = results.voltageDrop;
  const voltageDropPerUnitLength = totalVoltageDrop / inputs.conductorLength;
  
  // Calculate voltage at each point
  for (let i = 0; i <= numPoints; i++) {
    const distance = (i / numPoints) * inputs.conductorLength;
    const voltageDropAtPoint = voltageDropPerUnitLength * distance;
    const voltageAtPoint = inputs.systemVoltage - voltageDropAtPoint;
    
    voltageProfile.push({
      distance,
      voltage: voltageAtPoint
    });
  }
  
  return voltageProfile;
}

/**
 * Compare different conductor sizes for a specific circuit
 * 
 * @param inputs - Enhanced voltage drop inputs (without conductorSize)
 * @param conductorSizes - Array of conductor sizes to compare
 * @returns Results for each conductor size
 */
export function compareConductorSizes(
  inputs: Omit<EnhancedVoltageDropInputs, 'conductorSize'>,
  conductorSizes: string[] = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '2 AWG']
): Record<string, VoltageDropResult> {
  const results: Record<string, VoltageDropResult> = {};
  
  // Calculate results for each size
  for (const size of conductorSizes) {
    const sizeInputs: EnhancedVoltageDropInputs = {
      ...inputs,
      conductorSize: size
    } as EnhancedVoltageDropInputs;
    
    results[size] = calculateEnhancedVoltageDropResults(sizeInputs);
  }
  
  return results;
}

// Memoized version of the function for performance
export const memoizedCalculateEnhancedVoltageDropResults = 
  memoizeCalculationWithInvalidation(calculateEnhancedVoltageDropResults, 
    (inputs) => JSON.stringify(inputs)); 