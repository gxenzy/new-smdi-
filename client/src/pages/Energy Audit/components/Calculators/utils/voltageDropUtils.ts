/**
 * Voltage Drop Calculation Utilities
 * 
 * This module provides utility functions for voltage drop calculations
 * for specific circuit types based on the Philippine Electrical Code (PEC) 2017
 */

import { CONDUCTOR_SIZES, VOLTAGE_DROP_LIMITS } from './voltageRegulationUtils';
import { memoizeCalculation } from './voltageDropCaching';

/**
 * Circuit types for voltage drop calculations
 */
export type CircuitType = 'branch' | 'feeder' | 'service' | 'motor';

/**
 * Interface for circuit configuration
 */
export interface CircuitConfiguration {
  circuitType: CircuitType;
  distanceToFurthestOutlet?: number; // For branch circuits
  startingCurrentMultiplier?: number; // For motor circuits (typically 1.25)
  serviceFactor?: number; // For motor circuits
  wireway?: 'conduit' | 'cable' | 'raceway';
  hasVFD?: boolean; // For motor circuits with Variable Frequency Drive
}

/**
 * Interface for voltage drop calculation inputs
 */
export interface VoltageDropInputs {
  circuitConfiguration: CircuitConfiguration;
  systemVoltage: number;
  loadCurrent: number; // In amperes
  conductorLength: number; // In meters
  conductorSize: string; // AWG or MCM size
  conductorMaterial: 'copper' | 'aluminum';
  conduitMaterial: 'PVC' | 'steel' | 'aluminum';
  phaseConfiguration: 'single-phase' | 'three-phase';
  temperature: number; // Ambient temperature in °C
  powerFactor?: number; // Power factor (0-1), default 0.85 for general calculations
}

/**
 * Interface for voltage drop calculation results
 */
export interface VoltageDropResult {
  voltageDropPercent: number;
  voltageDrop: number;
  receivingEndVoltage: number;
  resistiveLoss: number;
  reactiveLoss: number;
  totalLoss: number;
  compliance: 'compliant' | 'non-compliant';
  maxAllowedDrop: number; // Maximum allowed voltage drop for this circuit type
  recommendations: string[];
  wireRating: {
    ampacity: number;
    isAdequate: boolean;
  };
}

/**
 * Resistivity values for conductor materials (ohm-cmil/ft)
 * at standard temperature (75°C)
 */
const RESISTIVITY = {
  copper: 10.371, // ohm-cmil/ft at 75°C
  aluminum: 17.020 // ohm-cmil/ft at 75°C
};

/**
 * Temperature coefficient for conductor materials
 */
const TEMP_COEFFICIENT = {
  copper: 0.00393,     // per °C
  aluminum: 0.00403    // per °C
};

/**
 * Reactance values for different conduit materials (ohms/1000ft)
 * Values are approximate and depend on conductor spacing
 */
const REACTANCE = {
  PVC: {
    'single-phase': 0.050,  // X/1000ft for single-phase in PVC
    'three-phase': 0.043    // X/1000ft for three-phase in PVC
  },
  steel: {
    'single-phase': 0.062,  // X/1000ft for single-phase in steel
    'three-phase': 0.054    // X/1000ft for three-phase in steel
  },
  aluminum: {
    'single-phase': 0.052,  // X/1000ft for single-phase in aluminum
    'three-phase': 0.045    // X/1000ft for three-phase in aluminum
  }
};

/**
 * Type for ampacity tables to ensure type safety
 */
export type AmpacityTable = {
  [key: string]: number;
};

/**
 * Ampacity ratings for copper conductors at 30°C ambient
 * Based on PEC 2017 Table 2.5
 */
export const COPPER_AMPACITY: AmpacityTable = {
  '14 AWG': 15,
  '12 AWG': 20,
  '10 AWG': 30,
  '8 AWG': 40,
  '6 AWG': 55,
  '4 AWG': 70,
  '3 AWG': 85,
  '2 AWG': 95,
  '1 AWG': 110,
  '1/0 AWG': 125,
  '2/0 AWG': 145,
  '3/0 AWG': 165,
  '4/0 AWG': 195,
  '250 MCM': 215,
  '300 MCM': 240,
  '350 MCM': 260,
  '400 MCM': 280,
  '500 MCM': 320,
  '600 MCM': 355,
  '750 MCM': 400,
  '1000 MCM': 455
};

/**
 * Ampacity ratings for aluminum conductors at 30°C ambient
 * Based on PEC 2017 Table 2.5
 */
export const ALUMINUM_AMPACITY: AmpacityTable = {
  '12 AWG': 15,
  '10 AWG': 25,
  '8 AWG': 30,
  '6 AWG': 40,
  '4 AWG': 55,
  '3 AWG': 65,
  '2 AWG': 75,
  '1 AWG': 85,
  '1/0 AWG': 100,
  '2/0 AWG': 115,
  '3/0 AWG': 130,
  '4/0 AWG': 155,
  '250 MCM': 170,
  '300 MCM': 190,
  '350 MCM': 210,
  '400 MCM': 225,
  '500 MCM': 260,
  '600 MCM': 285,
  '750 MCM': 320,
  '1000 MCM': 375
};

/**
 * Get the voltage drop limit based on the circuit type
 * 
 * @param circuitType - Type of circuit
 * @returns Voltage drop limit percentage
 */
export function getVoltageDropLimit(circuitType: CircuitType): number {
  switch (circuitType) {
    case 'branch':
      return VOLTAGE_DROP_LIMITS.branch;
    case 'feeder':
      return VOLTAGE_DROP_LIMITS.feeder;
    case 'service':
      return VOLTAGE_DROP_LIMITS.feeder; // Same as feeder per PEC
    case 'motor':
      return 3.0; // Special case for motors
    default:
      return VOLTAGE_DROP_LIMITS.total;
  }
}

/**
 * Calculate the wire ampacity rating and determine if it's adequate
 * 
 * @param inputs - Voltage drop calculation inputs
 * @returns Ampacity rating and adequacy status
 */
export function calculateAmpacityRating(inputs: VoltageDropInputs): {
  ampacity: number;
  isAdequate: boolean;
} {
  const { 
    conductorSize, 
    conductorMaterial, 
    loadCurrent,
    circuitConfiguration
  } = inputs;
  
  // Get the appropriate ampacity table
  const ampacityTable = 
    conductorMaterial === 'copper' ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
  
  // Get the base ampacity for the conductor size
  const baseAmpacity = ampacityTable[conductorSize] || 0;
  
  // Apply derating factors if necessary (simplified)
  let deratedAmpacity = baseAmpacity;
  
  // For motor circuits, we need to compare against the starting current
  let currentToCompare = loadCurrent;
  if (circuitConfiguration.circuitType === 'motor' && circuitConfiguration.startingCurrentMultiplier) {
    currentToCompare = loadCurrent * circuitConfiguration.startingCurrentMultiplier;
  }
  
  return {
    ampacity: deratedAmpacity,
    isAdequate: deratedAmpacity >= currentToCompare
  };
}

/**
 * Calculate voltage drop percentage for a specific circuit
 * 
 * @param inputs - Voltage drop calculation inputs
 * @returns Voltage drop percentage
 */
export function calculateVoltageDropPercentage(inputs: VoltageDropInputs): number {
  const voltageDrop = calculateVoltageDrop(inputs);
  return (voltageDrop / inputs.systemVoltage) * 100;
}

/**
 * Calculate voltage drop in volts for a specific circuit
 * 
 * @param inputs - Voltage drop calculation inputs
 * @returns Voltage drop in volts
 */
export function calculateVoltageDrop(inputs: VoltageDropInputs): number {
  const {
    systemVoltage,
    loadCurrent,
    conductorLength,
    conductorSize,
    conductorMaterial,
    conduitMaterial,
    phaseConfiguration,
    temperature,
    powerFactor = 0.85 // Default power factor if not provided
  } = inputs;

  // Get circular mils for the selected conductor size
  const circularMils = CONDUCTOR_SIZES[conductorSize];
  if (!circularMils) {
    throw new Error(`Invalid conductor size: ${conductorSize}`);
  }

  // Calculate resistance adjusted for temperature
  const resistivity = RESISTIVITY[conductorMaterial];
  const tempCoefficient = TEMP_COEFFICIENT[conductorMaterial];
  const tempAdjustment = 1 + tempCoefficient * (temperature - 75); // Adjust from 75°C base
  const resistance = (resistivity * tempAdjustment * conductorLength) / circularMils;

  // Get reactance
  const reactance = REACTANCE[conduitMaterial][phaseConfiguration] * (conductorLength / 1000);

  // Calculate voltage drop
  const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
  const cosPhi = powerFactor;

  let voltageDrop: number;
  if (phaseConfiguration === 'single-phase') {
    // Single-phase voltage drop (2-wire): VD = 2 * I * (R * cos(θ) + X * sin(θ))
    voltageDrop = 2 * loadCurrent * (resistance * cosPhi + reactance * sinPhi);
  } else {
    // Three-phase voltage drop: VD = √3 * I * (R * cos(θ) + X * sin(θ))
    voltageDrop = Math.sqrt(3) * loadCurrent * (resistance * cosPhi + reactance * sinPhi);
  }

  return voltageDrop;
}

/**
 * Calculate power loss in a circuit
 * 
 * @param inputs - Voltage drop calculation inputs
 * @returns Power loss components in watts
 */
export function calculatePowerLoss(inputs: VoltageDropInputs): {
  resistiveLoss: number;
  reactiveLoss: number;
  totalLoss: number;
} {
  const {
    loadCurrent,
    conductorLength,
    conductorSize,
    conductorMaterial,
    conduitMaterial,
    phaseConfiguration,
    temperature,
    powerFactor = 0.85 // Default power factor if not provided
  } = inputs;

  // Get circular mils for the selected conductor size
  const circularMils = CONDUCTOR_SIZES[conductorSize];
  if (!circularMils) {
    throw new Error(`Invalid conductor size: ${conductorSize}`);
  }

  // Calculate resistance adjusted for temperature
  const resistivity = RESISTIVITY[conductorMaterial];
  const tempCoefficient = TEMP_COEFFICIENT[conductorMaterial];
  const tempAdjustment = 1 + tempCoefficient * (temperature - 75);
  const resistance = (resistivity * tempAdjustment * conductorLength) / circularMils;

  // Get reactance
  const reactance = REACTANCE[conduitMaterial][phaseConfiguration] * (conductorLength / 1000);

  // Calculate losses
  let resistiveLoss: number;
  let reactiveLoss: number;

  if (phaseConfiguration === 'single-phase') {
    // For single-phase circuits (2 conductors)
    resistiveLoss = 2 * loadCurrent * loadCurrent * resistance;
    reactiveLoss = 2 * loadCurrent * loadCurrent * reactance;
  } else {
    // For three-phase circuits
    resistiveLoss = 3 * loadCurrent * loadCurrent * resistance;
    reactiveLoss = 3 * loadCurrent * loadCurrent * reactance;
  }

  return {
    resistiveLoss,
    reactiveLoss,
    totalLoss: resistiveLoss + reactiveLoss
  };
}

/**
 * Generate recommendations based on calculation results
 * 
 * @param inputs - Voltage drop calculation inputs
 * @param voltageDropPercent - Calculated voltage drop percentage
 * @param voltageDropLimit - Voltage drop limit for the circuit type
 * @param wireRating - Wire ampacity rating details
 * @returns Array of recommendation strings
 */
function generateRecommendations(
  inputs: VoltageDropInputs,
  voltageDropPercent: number,
  voltageDropLimit: number,
  wireRating: { ampacity: number; isAdequate: boolean }
): string[] {
  const recommendations: string[] = [];
  
  // Check voltage drop compliance
  if (voltageDropPercent > voltageDropLimit) {
    const exceedAmount = (voltageDropPercent - voltageDropLimit).toFixed(2);
    recommendations.push(
      `The voltage drop of ${voltageDropPercent.toFixed(2)}% exceeds the PEC 2017 limit of ${voltageDropLimit}% for this circuit type by ${exceedAmount}%.`
    );
    
    // Suggest increasing conductor size
    const sizes = Object.keys(CONDUCTOR_SIZES);
    const currentSizeIndex = sizes.indexOf(inputs.conductorSize);
    if (currentSizeIndex < sizes.length - 1) {
      const nextSize = sizes[currentSizeIndex + 1];
      recommendations.push(
        `Consider increasing conductor size from ${inputs.conductorSize} to ${nextSize} to reduce voltage drop.`
      );
    }
    
    // Other voltage drop reduction strategies
    recommendations.push(
      "Other options to reduce voltage drop: reduce circuit length, use higher voltage system, or add a transformer closer to the load."
    );
  } else {
    recommendations.push(
      `The voltage drop of ${voltageDropPercent.toFixed(2)}% is within the PEC 2017 limit of ${voltageDropLimit}% for this circuit type.`
    );
  }
  
  // Check wire ampacity
  if (!wireRating.isAdequate) {
    recommendations.push(
      `The selected conductor size (${inputs.conductorSize}) has an ampacity of ${wireRating.ampacity}A, which is not adequate for the circuit load current of ${inputs.loadCurrent}A.`
    );
    
    // Suggest minimum conductor size for current
    const ampacityTable = inputs.conductorMaterial === 'copper' ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
    for (const [size, ampacity] of Object.entries(ampacityTable)) {
      if (ampacity >= inputs.loadCurrent) {
        recommendations.push(
          `Minimum recommended conductor size for this current is ${size}.`
        );
        break;
      }
    }
  } else {
    recommendations.push(
      `The selected conductor size (${inputs.conductorSize}) has an ampacity of ${wireRating.ampacity}A, which is adequate for the circuit load current of ${inputs.loadCurrent}A.`
    );
  }
  
  // Special recommendations for specific circuit types
  if (inputs.circuitConfiguration.circuitType === 'motor') {
    recommendations.push(
      "For motor circuits, ensure the conductor size accounts for starting current and service factor requirements per PEC 2017 Article 3.4."
    );
    
    if (inputs.circuitConfiguration.hasVFD) {
      recommendations.push(
        "For circuits with VFDs, consider using cables specifically designed for VFD applications to minimize harmonic effects and voltage reflections."
      );
    }
  }
  
  return recommendations;
}

/**
 * Calculate all voltage drop results for a specific circuit
 * 
 * @param inputs - Voltage drop calculation inputs
 * @returns Complete voltage drop calculation results
 */
function calculateVoltageDropResultsInternal(inputs: VoltageDropInputs): VoltageDropResult {
  // Calculate voltage drop percentage
  const voltageDropPercent = calculateVoltageDropPercentage(inputs);
  
  // Calculate actual voltage drop
  const voltageDrop = (voltageDropPercent / 100) * inputs.systemVoltage;
  
  // Calculate receiving end voltage
  const receivingEndVoltage = inputs.systemVoltage - voltageDrop;
  
  // Calculate power loss
  const powerLoss = calculatePowerLoss(inputs);
  
  // Get the voltage drop limit for this circuit type
  const voltageDropLimit = getVoltageDropLimit(inputs.circuitConfiguration.circuitType);
  
  // Determine compliance
  const compliance = voltageDropPercent <= voltageDropLimit ? 'compliant' : 'non-compliant';
  
  // Calculate wire ampacity and adequacy
  const wireRating = calculateAmpacityRating(inputs);
  
  // Generate recommendations
  const recommendations = generateRecommendations(inputs, voltageDropPercent, voltageDropLimit, wireRating);
  
  return {
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    resistiveLoss: powerLoss.resistiveLoss,
    reactiveLoss: powerLoss.reactiveLoss,
    totalLoss: powerLoss.totalLoss,
    compliance,
    maxAllowedDrop: voltageDropLimit,
    recommendations,
    wireRating
  };
}

// Export the memoized version of the function
export const calculateVoltageDropResults = memoizeCalculation(calculateVoltageDropResultsInternal);

/**
 * Find the minimum conductor size that meets voltage drop requirements
 * 
 * @param inputs - Voltage drop calculation inputs (without conductorSize)
 * @param voltageDropLimit - Optional custom voltage drop limit
 * @returns Recommended conductor size
 */
export function findMinimumConductorSize(
  inputs: Omit<VoltageDropInputs, 'conductorSize'>,
  customVoltageDropLimit?: number
): string {
  // Get the appropriate voltage drop limit
  const voltageDropLimit = customVoltageDropLimit ?? 
    getVoltageDropLimit(inputs.circuitConfiguration.circuitType);
  
  // Get conductor sizes sorted by size (smallest to largest)
  const conductorSizes = Object.keys(CONDUCTOR_SIZES).sort((a, b) => {
    return CONDUCTOR_SIZES[a] - CONDUCTOR_SIZES[b];
  });
  
  // Try each conductor size until we find one that meets the voltage drop limit
  for (const size of conductorSizes) {
    const calcInputs: VoltageDropInputs = {
      ...inputs,
      conductorSize: size
    };
    
    const voltageDrop = calculateVoltageDrop(calcInputs);
    const voltageDropPercent = (voltageDrop / inputs.systemVoltage) * 100;
    
    if (voltageDropPercent <= voltageDropLimit) {
      return size;
    }
  }
  
  // If no size is adequate, return the largest available
  return conductorSizes[conductorSizes.length - 1];
}

/**
 * Find the minimum conductor size that meets both voltage drop and ampacity requirements
 * 
 * @param inputs - Voltage drop calculation inputs (without conductorSize)
 * @returns Recommended conductor size
 */
export function findOptimalConductorSize(
  inputs: Omit<VoltageDropInputs, 'conductorSize'>
): string {
  // Find minimum size for voltage drop
  const sizeForVoltageDrop = findMinimumConductorSize(inputs);
  
  // Find minimum size for ampacity
  const ampacityTable = inputs.conductorMaterial === 'copper' ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
  let sizeForAmpacity = Object.keys(ampacityTable)[0]; // Default to smallest
  
  for (const [size, ampacity] of Object.entries(ampacityTable)) {
    if (ampacity >= inputs.loadCurrent) {
      sizeForAmpacity = size;
      break;
    }
  }
  
  // Get sizes as circular mils for comparison
  const vdSize = CONDUCTOR_SIZES[sizeForVoltageDrop] || 0;
  const ampSize = CONDUCTOR_SIZES[sizeForAmpacity] || 0;
  
  // Return the larger of the two sizes (higher circular mils value)
  return vdSize > ampSize ? sizeForVoltageDrop : sizeForAmpacity;
} 