import { UnifiedCircuitData } from './CircuitSynchronization';
import { VoltageDropCalculationResult } from './voltageDropRecalculator';
import { CONDUCTOR_SIZES } from './voltageRegulationUtils';
import { calculateVoltageDropResults, findOptimalConductorSize, CircuitConfiguration, CircuitType } from './voltageDropUtils';
import { ConductorComparisonData } from '../ConductorComparisonChart';

/**
 * Material cost per mm² for different conductor materials (approximate values in $/mm²)
 */
const MATERIAL_COST_PER_MM2 = {
  copper: 0.25,
  aluminum: 0.15
};

/**
 * Resistivity values for different conductor materials (in ohm·mm²/m)
 */
const MATERIAL_RESISTIVITY = {
  copper: 0.0175,
  aluminum: 0.0282
};

/**
 * Calculate the cross-sectional area in mm² from a conductor size
 * 
 * @param conductorSize Conductor size (e.g., '2.5', '4', '6')
 * @returns Cross-sectional area in mm²
 */
export function getCrossSectionalArea(conductorSize: string): number {
  // If it's already a number in mm², return it
  if (conductorSize.includes('mm²')) {
    return parseFloat(conductorSize.replace('mm²', ''));
  }
  
  // If it's given in AWG, convert to mm²
  if (conductorSize.includes('AWG') || /^[0-9]+$/.test(conductorSize)) {
    const awgSize = parseInt(conductorSize.replace('AWG', '').trim());
    // Convert AWG to mm² (approximation formula)
    return 0.012668 * Math.pow(92, (36 - awgSize) / 39);
  }
  
  // For MCM values, convert to mm²
  if (conductorSize.includes('MCM') || conductorSize.includes('kcmil')) {
    const mcmSize = parseInt(conductorSize.replace(/MCM|kcmil/gi, '').trim());
    // Convert MCM to mm²
    return mcmSize * 0.5067;
  }
  
  // Default to 1.5mm² if we can't parse
  return 1.5;
}

/**
 * Calculate material cost for a conductor based on size, material, and length
 * 
 * @param conductorSize Conductor size
 * @param conductorMaterial Conductor material ('copper' or 'aluminum')
 * @param conductorLength Conductor length in meters
 * @returns Material cost in dollars
 */
export function calculateMaterialCost(
  conductorSize: string, 
  conductorMaterial: 'copper' | 'aluminum',
  conductorLength: number
): number {
  const area = getCrossSectionalArea(conductorSize);
  const costPerMm2 = MATERIAL_COST_PER_MM2[conductorMaterial] || MATERIAL_COST_PER_MM2.copper;
  
  // Calculate cost based on area, length, and material cost per mm²
  // For a typical conductor with 3 phases and neutral, multiply by appropriate factor
  const conductors = 3; // Assuming 3 conductors (3 phases or 2 phases + neutral)
  return costPerMm2 * area * conductorLength * conductors;
}

/**
 * Calculate installation cost factor based on conductor size
 * Larger conductors take more time to install due to weight and flexibility issues
 * 
 * @param conductorSize Conductor size
 * @returns Installation cost factor (relative to a reference size)
 */
export function calculateInstallationCostFactor(conductorSize: string): number {
  const area = getCrossSectionalArea(conductorSize);
  
  // Baseline is 2.5mm², which has a factor of 1.0
  const baselineArea = 2.5;
  
  // Installation cost increases with size, but not linearly
  // Using a logarithmic scale to model this
  return 0.8 + 0.4 * Math.log(area / baselineArea + 0.5);
}

/**
 * Calculate power loss for a circuit based on current, resistance, and length
 * 
 * @param current Current in amperes
 * @param conductorSize Conductor size
 * @param conductorMaterial Conductor material ('copper' or 'aluminum')
 * @param conductorLength Conductor length in meters
 * @param phaseConfiguration Phase configuration ('single-phase' or 'three-phase')
 * @returns Power loss in watts
 */
export function calculatePowerLoss(
  current: number,
  conductorSize: string,
  conductorMaterial: 'copper' | 'aluminum',
  conductorLength: number,
  phaseConfiguration: 'single-phase' | 'three-phase'
): number {
  const area = getCrossSectionalArea(conductorSize);
  const resistivity = MATERIAL_RESISTIVITY[conductorMaterial] || MATERIAL_RESISTIVITY.copper;
  
  // Resistance = resistivity * length / area
  const resistance = (resistivity * conductorLength) / area;
  
  // Power loss = I² * R * conductors
  // For single-phase: 2 conductors (phase + neutral)
  // For three-phase: 3 or 4 conductors (3 phases + sometimes neutral)
  const conductors = phaseConfiguration === 'single-phase' ? 2 : 3;
  
  return Math.pow(current, 2) * resistance * conductors;
}

/**
 * Calculate annual energy cost for power losses
 * 
 * @param powerLoss Power loss in watts
 * @param hoursPerYear Operating hours per year
 * @param costPerKwh Energy cost per kWh in dollars
 * @returns Annual energy cost in dollars
 */
export function calculateAnnualEnergyCost(
  powerLoss: number,
  hoursPerYear: number,
  costPerKwh: number
): number {
  // Convert watts to kilowatts
  const powerLossKw = powerLoss / 1000;
  
  // Annual energy cost = power loss * hours * cost per kWh
  return powerLossKw * hoursPerYear * costPerKwh;
}

/**
 * Calculate payback period for upgrading from one conductor size to another
 * 
 * @param currentCost Current conductor cost
 * @param newCost New conductor cost
 * @param currentAnnualOperatingCost Current annual operating cost
 * @param newAnnualOperatingCost New annual operating cost
 * @returns Payback period in years
 */
export function calculatePaybackPeriod(
  currentCost: number,
  newCost: number,
  currentAnnualOperatingCost: number,
  newAnnualOperatingCost: number
): number {
  const additionalInvestment = newCost - currentCost;
  const annualSavings = currentAnnualOperatingCost - newAnnualOperatingCost;
  
  // If there are no savings or if new cost is less than current (shouldn't happen normally),
  // return 0 payback period
  if (annualSavings <= 0 || additionalInvestment <= 0) {
    return 999; // Effectively "never"
  }
  
  return additionalInvestment / annualSavings;
}

/**
 * Calculate total cost of ownership over a given period
 * 
 * @param initialCost Initial cost (material + installation)
 * @param annualOperatingCost Annual operating cost
 * @param years Number of years to consider
 * @returns Total cost of ownership in dollars
 */
export function calculateTotalCostOfOwnership(
  initialCost: number,
  annualOperatingCost: number,
  years: number = 5
): number {
  return initialCost + (annualOperatingCost * years);
}

/**
 * Generate comparison data for different conductor sizes
 * 
 * @param baseCircuitData Base circuit data
 * @param alternativeSizes Array of alternative conductor sizes to compare
 * @param operatingHoursPerYear Annual operating hours
 * @param energyCostPerKwh Energy cost per kWh in dollars
 * @returns Object with comparison data for each conductor size
 */
export function generateConductorComparisonData(
  baseCircuitData: UnifiedCircuitData,
  alternativeSizes: string[] = [],
  operatingHoursPerYear: number = 2000,
  energyCostPerKwh: number = 0.12
): Record<string, ConductorComparisonData> {
  // If no alternative sizes provided, generate some based on the current size
  if (!alternativeSizes || alternativeSizes.length === 0) {
    const currentSizeIndex = Object.keys(CONDUCTOR_SIZES).findIndex(
      size => size === baseCircuitData.conductorSize
    );
    
    if (currentSizeIndex >= 0) {
      const allSizes = Object.keys(CONDUCTOR_SIZES);
      // Get 2 sizes smaller and 3 sizes larger (if available)
      const startIndex = Math.max(0, currentSizeIndex - 2);
      const endIndex = Math.min(allSizes.length - 1, currentSizeIndex + 3);
      alternativeSizes = allSizes.slice(startIndex, endIndex + 1);
    } else {
      // If current size not found, use some default sizes
      alternativeSizes = ['2.5', '4', '6', '10', '16', '25'];
    }
  }
  
  // Always include the current size if not already in the list
  if (baseCircuitData.conductorSize && !alternativeSizes.includes(baseCircuitData.conductorSize)) {
    alternativeSizes.push(baseCircuitData.conductorSize);
  }
  
  // Generate comparison data for each size
  const comparisonData: Record<string, ConductorComparisonData> = {};
  
  // Calculate base circuit data for reference
  const currentSize = baseCircuitData.conductorSize || '2.5';
  const material = baseCircuitData.conductorMaterial || 'copper';
  const length = baseCircuitData.conductorLength || 30;
  const current = baseCircuitData.current || 10;
  const phaseConfig = baseCircuitData.phaseConfiguration || 'single-phase';
  
  // Calculate reference values for the current size
  let currentMaterialCost = 0;
  let currentInstallationCost = 0;
  let currentPowerLoss = 0;
  let currentAnnualOperatingCost = 0;
  
  // Generate data for each size
  for (const size of alternativeSizes) {
    // Create a copy of baseCircuitData with the new conductor size
    const circuitData = { ...baseCircuitData, conductorSize: size };
    
    // Calculate voltage drop for this size
    let voltageDropResult: VoltageDropCalculationResult;
    try {
      // Convert circuit data to VoltageDropInputs format
      const voltageDropInputs = {
        conductorSize: size,
        circuitConfiguration: {
          circuitType: (circuitData.circuitType as CircuitType) || 'branch'
        },
        systemVoltage: circuitData.voltage || 230,
        loadCurrent: circuitData.current || 10,
        temperature: 30, // Default temperature
        conductorMaterial: circuitData.conductorMaterial || 'copper',
        conductorLength: circuitData.conductorLength || 30,
        conduitMaterial: (circuitData.conduitMaterial as 'PVC' | 'steel' | 'aluminum') || 'PVC',
        powerFactor: circuitData.powerFactor || 0.9,
        phaseConfiguration: circuitData.phaseConfiguration || 'single-phase',
      };
      
      voltageDropResult = calculateVoltageDropResults(voltageDropInputs);
    } catch (error) {
      console.error(`Error calculating voltage drop for size ${size}:`, error);
      continue; // Skip this size if calculation fails
    }
    
    // Calculate power losses
    const powerLoss = calculatePowerLoss(
      current,
      size,
      material,
      length,
      phaseConfig
    );
    
    // Calculate material cost
    const materialCost = calculateMaterialCost(
      size,
      material,
      length
    );
    
    // Calculate installation cost (base cost * factor based on size)
    const baseCost = 10 * length; // $10 per meter base installation cost
    const installationCostFactor = calculateInstallationCostFactor(size);
    const installationCost = baseCost * installationCostFactor;
    
    // Calculate annual operating cost
    const annualOperatingCost = calculateAnnualEnergyCost(
      powerLoss,
      operatingHoursPerYear,
      energyCostPerKwh
    );
    
    // Store reference values for current size
    if (size === currentSize) {
      currentMaterialCost = materialCost;
      currentInstallationCost = installationCost;
      currentPowerLoss = powerLoss;
      currentAnnualOperatingCost = annualOperatingCost;
    }
    
    // Calculate total cost of ownership (5-year period)
    const totalCostOfOwnership = calculateTotalCostOfOwnership(
      materialCost + installationCost,
      annualOperatingCost,
      5 // 5-year period
    );
    
    // Store data for this size
    comparisonData[size] = {
      size,
      voltageDropPercent: voltageDropResult.voltageDropPercent,
      powerLoss,
      cost: materialCost,
      isCompliant: voltageDropResult.compliance === 'compliant',
      ampacity: voltageDropResult.wireRating.ampacity,
      annualOperatingCost,
      installationCost,
      totalCostOfOwnership
    };
  }
  
  // Calculate payback periods for each size compared to the current size
  for (const size of alternativeSizes) {
    if (size === currentSize || !comparisonData[size]) continue;
    
    const sizeData = comparisonData[size];
    
    // Calculate payback period
    const paybackPeriod = calculatePaybackPeriod(
      currentMaterialCost + currentInstallationCost,
      sizeData.cost + sizeData.installationCost,
      currentAnnualOperatingCost,
      sizeData.annualOperatingCost
    );
    
    // Add payback period to the data
    comparisonData[size].paybackPeriod = paybackPeriod;
  }
  
  return comparisonData;
}

/**
 * Recommend optimal conductor size based on technical and economic factors
 * 
 * @param baseCircuitData Base circuit data
 * @param operatingHoursPerYear Annual operating hours
 * @param energyCostPerKwh Energy cost per kWh in dollars
 * @returns Recommended conductor size and reason
 */
export function recommendOptimalConductorSize(
  baseCircuitData: UnifiedCircuitData,
  operatingHoursPerYear: number = 2000,
  energyCostPerKwh: number = 0.12
): { size: string; reason: string } {
  // Generate comparison data for alternative sizes
  const comparisonData = generateConductorComparisonData(
    baseCircuitData,
    [],
    operatingHoursPerYear,
    energyCostPerKwh
  );
  
  // First priority: Find smallest compliant size
  // Convert baseCircuitData to VoltageDropInputs format without conductorSize
  const voltageDropInputsForOptimalSize = {
    circuitConfiguration: {
      circuitType: (baseCircuitData.circuitType as CircuitType) || 'branch'
    },
    systemVoltage: baseCircuitData.voltage || 230,
    loadCurrent: baseCircuitData.current || 10,
    temperature: 30, // Default temperature
    conductorMaterial: baseCircuitData.conductorMaterial || 'copper',
    conductorLength: baseCircuitData.conductorLength || 30,
    conduitMaterial: (baseCircuitData.conduitMaterial as 'PVC' | 'steel' | 'aluminum') || 'PVC',
    powerFactor: baseCircuitData.powerFactor || 0.9,
    phaseConfiguration: baseCircuitData.phaseConfiguration || 'single-phase',
  };

  const technicallyOptimalSize = findOptimalConductorSize(voltageDropInputsForOptimalSize);
  
  // Second priority: Consider economic factors for larger sizes
  const currentSize = baseCircuitData.conductorSize || '2.5';
  const compliantSizes = Object.entries(comparisonData)
    .filter(([_, data]) => data.isCompliant)
    .map(([size, _]) => size);
  
  if (compliantSizes.length === 0) {
    // If no compliant sizes, recommend the technically optimal size
    return { 
      size: technicallyOptimalSize, 
      reason: "No compliant sizes found. This is the minimum size required for compliance." 
    };
  }
  
  // Find sizes larger than the technically optimal size
  const largerSizes = compliantSizes
    .filter(size => {
      const sizeArea = getCrossSectionalArea(size);
      const optimalArea = getCrossSectionalArea(technicallyOptimalSize);
      return sizeArea > optimalArea;
    })
    .sort((a, b) => getCrossSectionalArea(a) - getCrossSectionalArea(b));
  
  // Check if there are economically justified larger sizes
  const economicallyViableSizes = largerSizes
    .filter(size => {
      const paybackPeriod = comparisonData[size].paybackPeriod;
      return paybackPeriod !== undefined && paybackPeriod < 3; // 3-year payback threshold
    });
  
  if (economicallyViableSizes.length > 0) {
    // Choose the smallest economically viable size
    const economicalSize = economicallyViableSizes[0];
    const paybackPeriod = comparisonData[economicalSize].paybackPeriod;
    return { 
      size: economicalSize, 
      reason: `This size offers a payback period of ${paybackPeriod?.toFixed(1)} years due to reduced energy losses, which is economically advantageous over the long term.` 
    };
  }
  
  // Default: recommend the technically optimal size
  return { 
    size: technicallyOptimalSize, 
    reason: "This is the minimum size required for voltage drop compliance with no economic advantage to using larger sizes." 
  };
} 