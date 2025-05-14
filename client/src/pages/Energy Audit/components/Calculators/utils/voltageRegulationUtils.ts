/**
 * Voltage Regulation Calculation Utilities
 * 
 * This module provides utility functions for voltage regulation calculations
 * based on the Philippine Electrical Code (PEC) 2017 Section 2.30
 */

/**
 * Interface for voltage regulation calculation inputs
 */
export interface VoltageRegulationInputs {
  systemVoltage: number;
  loadPower: number;
  powerFactor: number;
  conductorLength: number;
  conductorSize: string;
  conductorMaterial: 'copper' | 'aluminum';
  conduitMaterial: 'PVC' | 'steel' | 'aluminum';
  phaseConfiguration: 'single-phase' | 'three-phase';
  temperature: number;
}

/**
 * Interface for voltage regulation calculation results
 */
export interface VoltageRegulationResult {
  voltageDropPercent: number;
  voltageDrop: number;
  receivingEndVoltage: number;
  resistiveLoss: number;
  reactiveLoss: number;
  totalLoss: number;
  compliance: 'compliant' | 'non-compliant';
  recommendations: string[];
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
 * PEC 2017 recommended voltage drop limits
 */
export const VOLTAGE_DROP_LIMITS = {
  branch: 3.0,   // 3% for branch circuits (PEC 2017 Section 2.30)
  feeder: 2.0,   // 2% for feeders (PEC 2017 Section 2.30)
  total: 5.0     // 5% total from service to outlet (PEC 2017 Section 2.30)
};

/**
 * AWG/MCM conductor size mapping to circular mils
 */
export const CONDUCTOR_SIZES: Record<string, number> = {
  '14 AWG': 4110,
  '12 AWG': 6530,
  '10 AWG': 10380,
  '8 AWG': 16510,
  '6 AWG': 26240,
  '4 AWG': 41740,
  '3 AWG': 52620,
  '2 AWG': 66360,
  '1 AWG': 83690,
  '1/0 AWG': 105600,
  '2/0 AWG': 133100,
  '3/0 AWG': 167800,
  '4/0 AWG': 211600,
  '250 MCM': 250000,
  '300 MCM': 300000,
  '350 MCM': 350000,
  '400 MCM': 400000,
  '500 MCM': 500000,
  '600 MCM': 600000,
  '750 MCM': 750000,
  '1000 MCM': 1000000
};

/**
 * Calculate voltage drop percentage for a given circuit
 * 
 * @param inputs - Voltage regulation calculation inputs
 * @returns Voltage drop percentage
 */
export function calculateVoltageDropPercentage(inputs: VoltageRegulationInputs): number {
  const voltageDrop = calculateVoltageDrop(inputs);
  return (voltageDrop / inputs.systemVoltage) * 100;
}

/**
 * Calculate voltage drop in volts for a given circuit
 * 
 * @param inputs - Voltage regulation calculation inputs
 * @returns Voltage drop in volts
 */
export function calculateVoltageDrop(inputs: VoltageRegulationInputs): number {
  const {
    systemVoltage,
    loadPower,
    powerFactor,
    conductorLength,
    conductorSize,
    conductorMaterial,
    conduitMaterial,
    phaseConfiguration,
    temperature
  } = inputs;

  // Get circular mils for the selected conductor size
  const circularMils = CONDUCTOR_SIZES[conductorSize];
  if (!circularMils) {
    throw new Error(`Invalid conductor size: ${conductorSize}`);
  }

  // Calculate current
  let current: number;
  if (phaseConfiguration === 'single-phase') {
    current = loadPower / (systemVoltage * powerFactor);
  } else {
    // Three-phase calculation
    current = loadPower / (Math.sqrt(3) * systemVoltage * powerFactor);
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
    voltageDrop = 2 * current * (resistance * cosPhi + reactance * sinPhi);
  } else {
    // Three-phase voltage drop: VD = √3 * I * (R * cos(θ) + X * sin(θ))
    voltageDrop = Math.sqrt(3) * current * (resistance * cosPhi + reactance * sinPhi);
  }

  return voltageDrop;
}

/**
 * Calculate power loss in a circuit
 * 
 * @param inputs - Voltage regulation calculation inputs
 * @returns Power loss in watts
 */
export function calculatePowerLoss(inputs: VoltageRegulationInputs): {
  resistiveLoss: number;
  reactiveLoss: number;
  totalLoss: number;
} {
  const {
    loadPower,
    powerFactor,
    conductorLength,
    conductorSize,
    conductorMaterial,
    conduitMaterial,
    phaseConfiguration,
    temperature
  } = inputs;

  // Get circular mils for the selected conductor size
  const circularMils = CONDUCTOR_SIZES[conductorSize];
  if (!circularMils) {
    throw new Error(`Invalid conductor size: ${conductorSize}`);
  }

  // Calculate current
  let current: number;
  if (phaseConfiguration === 'single-phase') {
    current = loadPower / (inputs.systemVoltage * powerFactor);
  } else {
    // Three-phase calculation
    current = loadPower / (Math.sqrt(3) * inputs.systemVoltage * powerFactor);
  }

  // Calculate resistance adjusted for temperature
  const resistivity = RESISTIVITY[conductorMaterial];
  const tempCoefficient = TEMP_COEFFICIENT[conductorMaterial];
  const tempAdjustment = 1 + tempCoefficient * (temperature - 75); // Adjust from 75°C base
  const resistance = (resistivity * tempAdjustment * conductorLength) / circularMils;

  // Get reactance
  const reactance = REACTANCE[conduitMaterial][phaseConfiguration] * (conductorLength / 1000);

  // Calculate losses
  let resistiveLoss: number;
  let reactiveLoss: number;

  if (phaseConfiguration === 'single-phase') {
    // Single-phase power loss: P_loss = I²R (for both conductors)
    resistiveLoss = current * current * resistance * 2;
    reactiveLoss = current * current * reactance * 2;
  } else {
    // Three-phase power loss: P_loss = 3 * I²R
    resistiveLoss = 3 * current * current * resistance;
    reactiveLoss = 3 * current * current * reactance;
  }

  const totalLoss = Math.sqrt(resistiveLoss * resistiveLoss + reactiveLoss * reactiveLoss);

  return {
    resistiveLoss,
    reactiveLoss,
    totalLoss
  };
}

/**
 * Calculate voltage regulation results for a given circuit
 * 
 * @param inputs - Voltage regulation calculation inputs
 * @returns Comprehensive voltage regulation calculation results
 */
export function calculateVoltageRegulation(inputs: VoltageRegulationInputs): VoltageRegulationResult {
  // Calculate voltage drop
  const voltageDrop = calculateVoltageDrop(inputs);
  const voltageDropPercent = (voltageDrop / inputs.systemVoltage) * 100;
  
  // Calculate receiving end voltage
  const receivingEndVoltage = inputs.systemVoltage - voltageDrop;
  
  // Calculate power losses
  const { resistiveLoss, reactiveLoss, totalLoss } = calculatePowerLoss(inputs);
  
  // Determine compliance (using more stringent feeder limit for default)
  const isCompliant = voltageDropPercent <= VOLTAGE_DROP_LIMITS.feeder;
  const compliance = isCompliant ? 'compliant' as const : 'non-compliant' as const;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (!isCompliant) {
    recommendations.push(`Voltage drop of ${voltageDropPercent.toFixed(2)}% exceeds the recommended limit of ${VOLTAGE_DROP_LIMITS.feeder}% for feeders.`);
    
    // Recommend larger conductor
    const currentSizeIndex = Object.keys(CONDUCTOR_SIZES).indexOf(inputs.conductorSize);
    if (currentSizeIndex < Object.keys(CONDUCTOR_SIZES).length - 1) {
      const nextSize = Object.keys(CONDUCTOR_SIZES)[currentSizeIndex + 1];
      recommendations.push(`Consider increasing conductor size from ${inputs.conductorSize} to ${nextSize} to reduce voltage drop.`);
    }
    
    // Recommend parallel conductors if size is already large
    if (currentSizeIndex >= Object.keys(CONDUCTOR_SIZES).length - 3) {
      recommendations.push("Consider using parallel conductors to reduce voltage drop.");
    }
    
    // Recommend checking power factor
    if (inputs.powerFactor < 0.9) {
      recommendations.push(`Improve power factor from ${inputs.powerFactor} to at least 0.9 to reduce voltage drop.`);
    }
    
    // Recommend reducing circuit length if feasible
    recommendations.push("Consider reducing conductor length by relocating distribution equipment closer to the load.");
  } else {
    recommendations.push(`Voltage drop of ${voltageDropPercent.toFixed(2)}% is within the recommended limit of ${VOLTAGE_DROP_LIMITS.feeder}% for feeders.`);
    
    // If very low voltage drop, may be oversized
    if (voltageDropPercent < 0.5) {
      const currentSizeIndex = Object.keys(CONDUCTOR_SIZES).indexOf(inputs.conductorSize);
      if (currentSizeIndex > 0) {
        const smallerSize = Object.keys(CONDUCTOR_SIZES)[currentSizeIndex - 1];
        recommendations.push(`Conductor may be oversized. Consider using ${smallerSize} if allowed by ampacity requirements.`);
      }
    }
  }
  
  return {
    voltageDropPercent,
    voltageDrop,
    receivingEndVoltage,
    resistiveLoss,
    reactiveLoss,
    totalLoss,
    compliance,
    recommendations
  };
}

/**
 * Find the minimum conductor size that meets the voltage drop requirements
 * 
 * @param inputs - Voltage regulation calculation inputs without conductor size
 * @param voltageDropLimit - Voltage drop limit as a percentage (default: 2%)
 * @returns Recommended conductor size
 */
export function findMinimumConductorSize(
  inputs: Omit<VoltageRegulationInputs, 'conductorSize'>,
  voltageDropLimit: number = VOLTAGE_DROP_LIMITS.feeder
): string {
  // Try each conductor size, starting from the smallest
  const conductorSizes = Object.keys(CONDUCTOR_SIZES);
  
  for (const size of conductorSizes) {
    const testInputs: VoltageRegulationInputs = {
      ...inputs,
      conductorSize: size
    };
    
    const voltageDropPercent = calculateVoltageDropPercentage(testInputs);
    
    if (voltageDropPercent <= voltageDropLimit) {
      return size;
    }
  }
  
  // If no size meets the criteria, return the largest available
  return conductorSizes[conductorSizes.length - 1];
} 