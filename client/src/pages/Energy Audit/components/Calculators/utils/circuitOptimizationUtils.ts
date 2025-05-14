/**
 * Circuit Optimization Utilities
 * 
 * This module provides algorithms and functions for optimizing electrical circuits
 * based on voltage drop constraints, energy efficiency, and cost considerations.
 */

import { LoadSchedule, LoadItem } from '../ScheduleOfLoads/types';
import { 
  VoltageDropInputs, 
  CircuitType, 
  calculateVoltageDropResults, 
  findOptimalConductorSize
} from './voltageDropUtils';
import { 
  loadItemToUnifiedCircuit, 
  unifiedCircuitToVoltageDropInputs,
  UnifiedCircuitData 
} from './circuitDataExchange';

export interface CircuitOptimizationResult {
  loadItem: LoadItem;
  loadId: string;
  originalConductorSize: string;
  optimizedConductorSize: string;
  originalVoltageDropPercent: number;
  optimizedVoltageDropPercent: number;
  isPECCompliantAfterOptimization: boolean;
  isNonCompliant: boolean;
  materialCostChange: number; // Estimate of cost difference
  energySavingsAnnual: number; // Estimate of energy savings in kWh/year
  priority: 'critical' | 'high' | 'medium' | 'low';
  optimizationReason: string;
  breakEvenTimeMonths: number;
}

export interface BatchOptimizationResult {
  results: CircuitOptimizationResult[];
  totalNonCompliantCircuits: number;
  totalOptimizedCircuits: number;
  totalMaterialCostChange: number;
  totalEnergySavingsAnnual: number;
  executionTimeMs: number;
}

/**
 * Price estimates for conductors (USD per meter)
 * These are rough estimates and should be updated based on actual market prices
 */
const CONDUCTOR_PRICE_ESTIMATES: {[key: string]: number} = {
  '14 AWG': 0.5,
  '12 AWG': 0.8,
  '10 AWG': 1.2,
  '8 AWG': 1.9,
  '6 AWG': 3.0,
  '4 AWG': 4.8,
  '3 AWG': 6.0,
  '2 AWG': 7.5,
  '1 AWG': 9.5,
  '1/0 AWG': 12.0,
  '2/0 AWG': 15.0,
  '3/0 AWG': 19.0,
  '4/0 AWG': 24.0
};

/**
 * Resistivity values for conductors (ohm-cmil/ft)
 * Used for energy loss calculations
 */
const CONDUCTOR_RESISTIVITY: {[key: string]: {copper: number, aluminum: number}} = {
  '14 AWG': { copper: 3.14, aluminum: 5.17 },
  '12 AWG': { copper: 1.98, aluminum: 3.25 },
  '10 AWG': { copper: 1.24, aluminum: 2.04 },
  '8 AWG': { copper: 0.778, aluminum: 1.28 },
  '6 AWG': { copper: 0.491, aluminum: 0.808 },
  '4 AWG': { copper: 0.308, aluminum: 0.508 },
  '3 AWG': { copper: 0.245, aluminum: 0.403 },
  '2 AWG': { copper: 0.194, aluminum: 0.319 },
  '1 AWG': { copper: 0.154, aluminum: 0.253 },
  '1/0 AWG': { copper: 0.122, aluminum: 0.201 },
  '2/0 AWG': { copper: 0.0967, aluminum: 0.159 },
  '3/0 AWG': { copper: 0.0766, aluminum: 0.126 },
  '4/0 AWG': { copper: 0.0608, aluminum: 0.100 }
};

/**
 * Calculate estimated material cost for a conductor
 * 
 * @param conductorSize The size of the conductor (AWG)
 * @param length Length in meters
 * @returns Estimated cost in USD
 */
export function calculateConductorCost(conductorSize: string, length: number): number {
  const pricePerMeter = CONDUCTOR_PRICE_ESTIMATES[conductorSize] || 0;
  return pricePerMeter * length;
}

/**
 * Calculate energy loss in a conductor
 * 
 * @param conductorSize Conductor size (AWG)
 * @param current Current in amperes
 * @param length Length in meters
 * @param material 'copper' or 'aluminum'
 * @param hoursPerYear Operating hours per year
 * @returns Energy loss in kWh per year
 */
export function calculateEnergyLoss(
  conductorSize: string, 
  current: number, 
  length: number, 
  material: 'copper' | 'aluminum',
  hoursPerYear: number = 8760 // Default to 24/7 operation
): number {
  // Get resistivity value
  const resistivity = 
    CONDUCTOR_RESISTIVITY[conductorSize] ? 
    CONDUCTOR_RESISTIVITY[conductorSize][material] : 
    1.0; // Default value if unknown
  
  // Convert from ohm-cmil/ft to ohm/meter for our calculation
  const resistancePerMeter = resistivity * 0.000164; // Conversion factor
  
  // Calculate total resistance
  const totalResistance = resistancePerMeter * length;
  
  // Calculate power loss (P = I²R)
  const powerLossWatts = current * current * totalResistance;
  
  // Convert to kWh per year
  const energyLossKwhPerYear = (powerLossWatts / 1000) * hoursPerYear;
  
  return energyLossKwhPerYear;
}

/**
 * Optimize a single circuit based on voltage drop constraints
 * 
 * @param loadItem The load item to optimize
 * @param systemVoltage System voltage
 * @param powerFactor Power factor
 * @param parameters Additional parameters for optimization
 * @returns Circuit optimization result
 */
export function optimizeCircuit(
  loadItem: LoadItem,
  systemVoltage: number,
  powerFactor: number,
  parameters: {
    conductorLength?: number;
    circuitType?: CircuitType;
    conductorMaterial?: 'copper' | 'aluminum';
    conduitMaterial?: 'PVC' | 'steel' | 'aluminum';
    phaseConfiguration?: 'single-phase' | 'three-phase';
    temperature?: number;
    maxVoltageDropPercent?: number;
    operatingHoursPerYear?: number;
    energyCostPerKwh?: number;
  } = {}
): CircuitOptimizationResult {
  // Use default values if not provided
  const {
    conductorLength = loadItem.conductorLength || 30,
    circuitType = 'branch',
    conductorMaterial = 'copper',
    conduitMaterial = 'PVC',
    phaseConfiguration = 'single-phase',
    temperature = 30,
    maxVoltageDropPercent = 3.0,
    operatingHoursPerYear = 2500, // ~7 hours per day
    energyCostPerKwh = 0.12 // USD per kWh
  } = parameters;
  
  // Start timing
  const startTime = performance.now();
  
  // Original conductor size
  const originalConductorSize = loadItem.conductorSize || '12 AWG'; // Default if not specified
  
  // Convert to unified circuit format
  const circuitData = loadItemToUnifiedCircuit(
    loadItem,
    systemVoltage,
    powerFactor
  );
  
  // Apply additional parameters
  circuitData.conductorLength = conductorLength;
  circuitData.circuitType = circuitType;
  circuitData.conductorMaterial = conductorMaterial;
  circuitData.conduitMaterial = conduitMaterial;
  circuitData.phaseConfiguration = phaseConfiguration;
  circuitData.temperature = temperature;
  
  // Calculate voltage drop with original conductor size
  const originalVoltageDropInputs = unifiedCircuitToVoltageDropInputs(circuitData);
  const originalResults = calculateVoltageDropResults(originalVoltageDropInputs);
  
  // Find optimal conductor size
  const optimalConductorSize = findOptimalConductorSize(originalVoltageDropInputs);
  
  // Calculate voltage drop with optimized conductor size
  circuitData.conductorSize = optimalConductorSize;
  const optimizedVoltageDropInputs = unifiedCircuitToVoltageDropInputs(circuitData);
  const optimizedResults = calculateVoltageDropResults(optimizedVoltageDropInputs);
  
  // Calculate material cost change
  const originalCost = calculateConductorCost(originalConductorSize, conductorLength);
  const optimizedCost = calculateConductorCost(optimalConductorSize, conductorLength);
  const materialCostChange = optimizedCost - originalCost;
  
  // Calculate energy savings
  const originalEnergyLoss = calculateEnergyLoss(
    originalConductorSize,
    loadItem.current || 0,
    conductorLength,
    conductorMaterial,
    operatingHoursPerYear
  );
  
  const optimizedEnergyLoss = calculateEnergyLoss(
    optimalConductorSize,
    loadItem.current || 0,
    conductorLength,
    conductorMaterial,
    operatingHoursPerYear
  );
  
  const energySavingsAnnual = originalEnergyLoss - optimizedEnergyLoss;
  
  // Determine priority based on compliance status and potential savings
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
  let optimizationReason = 'Conductor size optimization';
  
  if (!originalResults.compliance) {
    priority = 'critical';
    optimizationReason = 'Non-compliant with PEC voltage drop requirements';
  } else if (energySavingsAnnual * energyCostPerKwh > materialCostChange) {
    priority = 'high';
    optimizationReason = 'Significant energy savings exceed material cost';
  } else if (originalResults.voltageDropPercent > maxVoltageDropPercent * 0.9) {
    priority = 'medium';
    optimizationReason = 'Very close to voltage drop limit';
  }
  
  // Calculate payback period in months
  const annualSavings = energySavingsAnnual * energyCostPerKwh;
  const breakEvenTimeMonths = materialCostChange > 0 && annualSavings > 0 ? 
    (materialCostChange / annualSavings) * 12 : 
    999; // Default to a high value if no savings or negative cost change
  
  return {
    loadItem,
    loadId: loadItem.id,
    originalConductorSize,
    optimizedConductorSize: optimalConductorSize,
    originalVoltageDropPercent: originalResults.voltageDropPercent,
    optimizedVoltageDropPercent: optimizedResults.voltageDropPercent,
    isPECCompliantAfterOptimization: optimizedResults.compliance === 'compliant',
    isNonCompliant: originalResults.compliance !== 'compliant',
    materialCostChange,
    energySavingsAnnual,
    priority,
    optimizationReason,
    breakEvenTimeMonths
  };
}

/**
 * Perform batch optimization on all circuits in a load schedule
 * 
 * @param loadSchedule The load schedule containing circuits to optimize
 * @param parameters Additional parameters for optimization
 * @returns Batch optimization results
 */
export function optimizeAllCircuits(
  loadSchedule: LoadSchedule,
  parameters: {
    conductorLength?: number;
    circuitType?: CircuitType;
    conductorMaterial?: 'copper' | 'aluminum';
    conduitMaterial?: 'PVC' | 'steel' | 'aluminum';
    phaseConfiguration?: 'single-phase' | 'three-phase';
    temperature?: number;
    maxVoltageDropPercent?: number;
    operatingHoursPerYear?: number;
    energyCostPerKwh?: number;
    onProgress?: (completedItems: number, totalItems: number) => void;
  } = {}
): BatchOptimizationResult {
  // Start timing
  const startTime = performance.now();
  
  // Track non-compliant and optimized circuits
  let totalNonCompliantCircuits = 0;
  let totalOptimizedCircuits = 0;
  let totalMaterialCostChange = 0;
  let totalEnergySavingsAnnual = 0;
  
  // Get valid load items for optimization
  const validLoads = loadSchedule.loads.filter(loadItem => loadItem.current && loadItem.current > 0);
  const totalItems = validLoads.length;
  
  // Process each load item
  const results: CircuitOptimizationResult[] = [];
  
  // Process items with progress tracking
  validLoads.forEach((loadItem, index) => {
    const result = optimizeCircuit(
      loadItem,
      loadSchedule.voltage,
      loadSchedule.powerFactor,
      parameters
    );
    
    // Update totals
    if (result.originalVoltageDropPercent > (parameters.maxVoltageDropPercent || 3.0)) {
      totalNonCompliantCircuits++;
    }
    
    if (result.optimizedConductorSize !== result.originalConductorSize) {
      totalOptimizedCircuits++;
      totalMaterialCostChange += result.materialCostChange;
      totalEnergySavingsAnnual += result.energySavingsAnnual;
    }
    
    results.push(result);
    
    // Call progress callback if provided
    if (parameters.onProgress) {
      parameters.onProgress(index + 1, totalItems);
    }
  });
  
  // Calculate execution time
  const executionTimeMs = performance.now() - startTime;
  
  return {
    results,
    totalNonCompliantCircuits,
    totalOptimizedCircuits,
    totalMaterialCostChange,
    totalEnergySavingsAnnual,
    executionTimeMs
  };
}

/**
 * Get a human-readable recommendation for a circuit optimization
 * 
 * @param optimizationResult The optimization result
 * @param energyCostPerKwh Cost of energy per kWh
 * @returns A recommendation string
 */
export function getOptimizationRecommendation(
  optimizationResult: CircuitOptimizationResult,
  energyCostPerKwh: number = 0.12
): string {
  const {
    loadItem,
    originalConductorSize,
    optimizedConductorSize,
    originalVoltageDropPercent,
    optimizedVoltageDropPercent,
    isPECCompliantAfterOptimization,
    materialCostChange,
    energySavingsAnnual,
    priority
  } = optimizationResult;
  
  // If no change is needed
  if (originalConductorSize === optimizedConductorSize) {
    return `Circuit "${loadItem.description}" is already optimized with ${originalConductorSize}.`;
  }
  
  // Calculate payback period in years (if applicable)
  const annualSavings = energySavingsAnnual * energyCostPerKwh;
  const paybackPeriod = materialCostChange > 0 ? (materialCostChange / annualSavings) : 0;
  
  // Compliance-based recommendation
  if (!isPECCompliantAfterOptimization) {
    return `Upgrade circuit "${loadItem.description}" from ${originalConductorSize} to ${optimizedConductorSize} for PEC compliance. This will reduce voltage drop from ${originalVoltageDropPercent.toFixed(2)}% to ${optimizedVoltageDropPercent.toFixed(2)}%. Note: Additional factors may need consideration.`;
  }
  
  // Economic recommendation
  if (paybackPeriod > 0 && paybackPeriod < 5) {
    return `Recommend upgrading circuit "${loadItem.description}" from ${originalConductorSize} to ${optimizedConductorSize}. Investment payback in ${paybackPeriod.toFixed(1)} years with annual energy savings of ${energySavingsAnnual.toFixed(2)} kWh (${annualSavings.toFixed(2)} USD).`;
  } else if (materialCostChange < 0) {
    return `Consider downsizing circuit "${loadItem.description}" from ${originalConductorSize} to ${optimizedConductorSize}. This would save ${Math.abs(materialCostChange).toFixed(2)} USD in material costs while maintaining PEC compliance. Voltage drop would increase from ${originalVoltageDropPercent.toFixed(2)}% to ${optimizedVoltageDropPercent.toFixed(2)}%.`;
  } else {
    return `Upgrade circuit "${loadItem.description}" from ${originalConductorSize} to ${optimizedConductorSize} to improve voltage drop from ${originalVoltageDropPercent.toFixed(2)}% to ${optimizedVoltageDropPercent.toFixed(2)}%. Material cost increase: ${materialCostChange.toFixed(2)} USD.`;
  }
}

/**
 * Get the expected return on investment (ROI) for a circuit optimization
 * 
 * @param optimizationResult The optimization result
 * @param energyCostPerKwh Cost of energy per kWh
 * @param yearsPeriod Period to calculate ROI for (defaults to 10 years)
 * @returns ROI as a percentage
 */
export function calculateOptimizationROI(
  optimizationResult: CircuitOptimizationResult,
  energyCostPerKwh: number = 0.12,
  yearsPeriod: number = 10
): number {
  const { materialCostChange, energySavingsAnnual } = optimizationResult;
  
  // If material cost is zero or negative, ROI is infinite or n/a
  if (materialCostChange <= 0) return 999;
  
  // Calculate total savings over period
  const totalSavings = energySavingsAnnual * energyCostPerKwh * yearsPeriod;
  
  // Calculate ROI as percentage: (Net Profit / Cost of Investment) * 100
  const roi = ((totalSavings - materialCostChange) / materialCostChange) * 100;
  
  return roi;
} 