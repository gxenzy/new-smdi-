import { LoadItem, LoadSchedule } from '../ScheduleOfLoads/types';

interface ConductorCostIndex {
  [wireType: string]: {
    [size: string]: number;
  }
}

interface ConductorResistance {
  [materialType: string]: {
    [size: string]: number;
  }
}

/**
 * Conductor cost database with relative costs (indexed relative to smallest size)
 * Based on average market prices for THHN copper and aluminum conductors
 */
export const CONDUCTOR_COST_INDEX: ConductorCostIndex = {
  // Copper THHN costs
  'THHN_COPPER': {
    '14 AWG': 1.0,
    '12 AWG': 1.6,
    '10 AWG': 2.5,
    '8 AWG': 4.0,
    '6 AWG': 6.3,
    '4 AWG': 10.0,
    '3 AWG': 12.6,
    '2 AWG': 15.8,
    '1 AWG': 20.0,
    '1/0 AWG': 25.1,
    '2/0 AWG': 31.6,
    '3/0 AWG': 39.8,
    '4/0 AWG': 50.1,
    '250 kcmil': 59.0,
    '300 kcmil': 70.8,
    '350 kcmil': 82.6,
    '400 kcmil': 94.2,
    '500 kcmil': 117.8
  },
  // Aluminum THHN costs
  'THHN_ALUMINUM': {
    '12 AWG': 1.0,
    '10 AWG': 1.5,
    '8 AWG': 2.4,
    '6 AWG': 3.8,
    '4 AWG': 6.0,
    '3 AWG': 7.5,
    '2 AWG': 9.5,
    '1 AWG': 12.0,
    '1/0 AWG': 15.1,
    '2/0 AWG': 18.9,
    '3/0 AWG': 23.9,
    '4/0 AWG': 30.1,
    '250 kcmil': 35.4,
    '300 kcmil': 42.5,
    '350 kcmil': 49.6,
    '400 kcmil': 56.5,
    '500 kcmil': 70.7
  },
  // Add other conductor types
  'THWN_COPPER': {
    '14 AWG': 1.05,
    '12 AWG': 1.65,
    '10 AWG': 2.55,
    '8 AWG': 4.1,
    '6 AWG': 6.4,
    '4 AWG': 10.2,
    '3 AWG': 12.8,
    '2 AWG': 16.0,
    '1 AWG': 20.2,
    '1/0 AWG': 25.3,
    '2/0 AWG': 31.8,
    '3/0 AWG': 40.0,
    '4/0 AWG': 50.3,
    '250 kcmil': 59.2,
    '300 kcmil': 71.0,
    '350 kcmil': 82.8,
    '400 kcmil': 94.5,
    '500 kcmil': 118.0
  },
  'THWN_ALUMINUM': {
    '12 AWG': 1.1,
    '10 AWG': 1.6,
    '8 AWG': 2.5,
    '6 AWG': 3.9,
    '4 AWG': 6.1,
    '3 AWG': 7.6,
    '2 AWG': 9.6,
    '1 AWG': 12.1,
    '1/0 AWG': 15.2,
    '2/0 AWG': 19.0,
    '3/0 AWG': 24.0,
    '4/0 AWG': 30.2,
    '250 kcmil': 35.5,
    '300 kcmil': 42.6,
    '350 kcmil': 49.7,
    '400 kcmil': 56.6,
    '500 kcmil': 70.8
  },
  'XHHW_COPPER': {
    '14 AWG': 1.2,
    '12 AWG': 1.8,
    '10 AWG': 2.7,
    '8 AWG': 4.3,
    '6 AWG': 6.6,
    '4 AWG': 10.5,
    '3 AWG': 13.0,
    '2 AWG': 16.2,
    '1 AWG': 20.5,
    '1/0 AWG': 25.5,
    '2/0 AWG': 32.0,
    '3/0 AWG': 40.2,
    '4/0 AWG': 50.5,
    '250 kcmil': 59.5,
    '300 kcmil': 71.2,
    '350 kcmil': 83.0,
    '400 kcmil': 94.8,
    '500 kcmil': 118.2
  },
  'XHHW_ALUMINUM': {
    '12 AWG': 1.2,
    '10 AWG': 1.7,
    '8 AWG': 2.6,
    '6 AWG': 4.0,
    '4 AWG': 6.2,
    '3 AWG': 7.7,
    '2 AWG': 9.7,
    '1 AWG': 12.2,
    '1/0 AWG': 15.3,
    '2/0 AWG': 19.1,
    '3/0 AWG': 24.1,
    '4/0 AWG': 30.3,
    '250 kcmil': 35.6,
    '300 kcmil': 42.7,
    '350 kcmil': 49.8,
    '400 kcmil': 56.7,
    '500 kcmil': 70.9
  }
};

/**
 * Conductor resistance in ohms per kilometer at 75°C
 * Based on PEC 2017 values for standard conductors
 */
export const CONDUCTOR_RESISTANCE: ConductorResistance = {
  // Copper conductors (ohms/km at 75°C)
  'COPPER': {
    '14 AWG': 10.2,
    '12 AWG': 6.6,
    '10 AWG': 3.9,
    '8 AWG': 2.56,
    '6 AWG': 1.61,
    '4 AWG': 1.02,
    '3 AWG': 0.82,
    '2 AWG': 0.66,
    '1 AWG': 0.52,
    '1/0 AWG': 0.41,
    '2/0 AWG': 0.33,
    '3/0 AWG': 0.26,
    '4/0 AWG': 0.21,
    '250 kcmil': 0.17,
    '300 kcmil': 0.14,
    '350 kcmil': 0.12,
    '400 kcmil': 0.11,
    '500 kcmil': 0.09
  },
  // Aluminum conductors (ohms/km at 75°C)
  'ALUMINUM': {
    '12 AWG': 10.9,
    '10 AWG': 6.8,
    '8 AWG': 4.3,
    '6 AWG': 2.7,
    '4 AWG': 1.7,
    '3 AWG': 1.3,
    '2 AWG': 1.1,
    '1 AWG': 0.85,
    '1/0 AWG': 0.67,
    '2/0 AWG': 0.54,
    '3/0 AWG': 0.43,
    '4/0 AWG': 0.34,
    '250 kcmil': 0.29,
    '300 kcmil': 0.24,
    '350 kcmil': 0.21,
    '400 kcmil': 0.18,
    '500 kcmil': 0.15
  }
};

/**
 * Calculate the energy loss in a conductor based on its size, material, length, and load
 * 
 * @param conductorSize Size of the conductor (AWG or kcmil)
 * @param materialType Conductor material (COPPER, ALUMINUM)
 * @param lengthMeters Length of the conductor in meters
 * @param currentAmps Current flowing through the conductor in amps
 * @param operatingHoursPerYear Annual operating hours
 * @returns Annual energy loss in kWh
 */
export function calculateAnnualEnergyLoss(
  conductorSize: string,
  materialType: string,
  lengthMeters: number,
  currentAmps: number,
  operatingHoursPerYear: number = 8760 // Default to 24/7 operation
): number {
  // Validate inputs to prevent NaN results
  if (!conductorSize || !materialType || lengthMeters <= 0 || currentAmps <= 0) {
    console.warn(
      `Invalid input to calculateAnnualEnergyLoss: size=${conductorSize}, material=${materialType}, length=${lengthMeters}, current=${currentAmps}`
    );
    return 0;
  }

  // Extract the base material type (COPPER or ALUMINUM)
  const baseMaterial = materialType.includes('COPPER') ? 'COPPER' : 'ALUMINUM';
  
  // Get the resistance per km for this conductor
  const resistancePerKm = CONDUCTOR_RESISTANCE[baseMaterial]?.[conductorSize] || 0;
  
  if (resistancePerKm === 0) {
    console.warn(`No resistance data found for ${baseMaterial} conductor size ${conductorSize}`);
    
    // Try to find a close match if exact size not found
    const availableSizes = Object.keys(CONDUCTOR_RESISTANCE[baseMaterial] || {});
    console.log(`Available ${baseMaterial} sizes: ${availableSizes.join(', ')}`);
    
    return 0; // Return 0 if resistance data is not available
  }
  
  // Convert length from meters to kilometers
  const lengthKm = lengthMeters / 1000;
  
  // Calculate resistance of the specific conductor
  const resistance = resistancePerKm * lengthKm;
  
  // Calculate power loss (P = I²R) in watts
  const powerLossWatts = currentAmps * currentAmps * resistance;
  
  // Calculate annual energy loss in kWh (P * t / 1000)
  const annualEnergyLossKWh = (powerLossWatts * operatingHoursPerYear) / 1000;
  
  return annualEnergyLossKWh;
}

/**
 * Calculate the total lifecycle cost of a conductor over a specified period
 * 
 * @param conductorSize Size of the conductor (AWG or kcmil)
 * @param wireType Type of wire (e.g., THHN_COPPER)
 * @param lengthMeters Length of the conductor in meters
 * @param currentAmps Current flowing through the conductor in amps
 * @param electricityRatePerKWh Cost of electricity in currency per kWh
 * @param baseConductorCost Base cost of the conductor in currency
 * @param yearsOfOperation Expected years of operation
 * @param operatingHoursPerYear Annual operating hours
 * @returns Lifecycle cost analysis results
 */
export function calculateLifecycleCost(
  conductorSize: string,
  wireType: string,
  lengthMeters: number,
  currentAmps: number,
  electricityRatePerKWh: number = 10.5, // Default electricity rate in PHP/kWh
  baseConductorCost: number = 1000, // Default base cost for reference conductor
  yearsOfOperation: number = 20, // Default 20 years lifecycle
  operatingHoursPerYear: number = 3000 // Default to 8 hours/day for 375 days
): {
  materialCost: number;
  energyLossPerYear: number;
  annualEnergyCost: number;
  totalLifecycleCost: number;
  paybackPeriodYears: number | null;
} {
  // Validate inputs
  if (!conductorSize) {
    console.warn('Missing conductor size in calculateLifecycleCost, using default 12 AWG');
    conductorSize = '12 AWG';
  }
  
  if (!wireType) {
    console.warn('Missing wireType in calculateLifecycleCost, using default THHN_COPPER');
    wireType = 'THHN_COPPER';
  }
  
  if (lengthMeters <= 0) {
    console.warn('Invalid length in calculateLifecycleCost, using default 10m');
    lengthMeters = 10;
  }
  
  if (currentAmps <= 0) {
    console.warn('Invalid current in calculateLifecycleCost, using default 10A');
    currentAmps = 10;
  }

  // Extract the wire category and material
  let [category, material] = wireType.includes('_') ? 
    wireType.split('_') : 
    [wireType, wireType.includes('COPPER') ? 'COPPER' : 'ALUMINUM'];
  
  // Ensure we have a valid material
  if (!material || (material !== 'COPPER' && material !== 'ALUMINUM')) {
    console.warn(`Invalid material ${material} in calculateLifecycleCost, using COPPER`);
    material = 'COPPER';
  }
  
  // Ensure we have a valid category (use THHN as default)
  if (!category || !['THHN', 'THWN', 'XHHW'].includes(category)) {
    console.warn(`Invalid category ${category} in calculateLifecycleCost, using THHN`);
    category = 'THHN';
  }
  
  // Reconstruct wireType if it was invalid
  const validWireType = `${category}_${material}`;
  
  // Get the cost multiplier for this conductor
  let costIndex = CONDUCTOR_COST_INDEX[validWireType]?.[conductorSize];
  
  if (!costIndex) {
    console.warn(`No cost index found for ${validWireType} size ${conductorSize}, using fallback`);
    
    // Try to find this size in any wireType
    const wireTypes = Object.keys(CONDUCTOR_COST_INDEX);
    for (const wt of wireTypes) {
      const sizes = CONDUCTOR_COST_INDEX[wt];
      if (sizes[conductorSize]) {
        costIndex = sizes[conductorSize];
        console.log(`Found alternative cost index ${costIndex} from ${wt}`);
        break;
      }
    }
    
    if (!costIndex) {
      // If still not found, use a reasonable default
      console.warn(`Using default cost index 4.0 as fallback for ${conductorSize}`);
      costIndex = 4.0;
    }
  }
  
  // Calculate material cost
  const materialCost = baseConductorCost * costIndex * lengthMeters / 100; // Cost per 100m
  
  // Calculate annual energy loss
  const energyLossPerYear = calculateAnnualEnergyLoss(
    conductorSize,
    material,
    lengthMeters,
    currentAmps,
    operatingHoursPerYear
  );
  
  // Calculate annual energy cost
  const annualEnergyCost = energyLossPerYear * electricityRatePerKWh;
  
  // Calculate total lifecycle cost (material cost + energy cost over lifecycle)
  const totalLifecycleCost = materialCost + (annualEnergyCost * yearsOfOperation);
  
  // Calculate simple payback period (null if no reference for comparison)
  // This will be calculated relative to a reference conductor in the comparison function
  const paybackPeriodYears = null;
  
  // Log the results for debugging
  console.log(`Lifecycle cost calculation for ${conductorSize} ${validWireType}:
    Length: ${lengthMeters}m, Current: ${currentAmps}A
    Material Cost: ${materialCost.toFixed(2)}
    Annual Energy Loss: ${energyLossPerYear.toFixed(2)} kWh
    Annual Energy Cost: ${annualEnergyCost.toFixed(2)}
    Total Lifecycle Cost: ${totalLifecycleCost.toFixed(2)}`
  );
  
  return {
    materialCost,
    energyLossPerYear,
    annualEnergyCost,
    totalLifecycleCost,
    paybackPeriodYears
  };
}

// Define a type for comparison results
interface ComparisonResult {
  conductorSize: string;
  materialCost: number;
  energyLossPerYear: number;
  annualEnergyCost: number;
  totalLifecycleCost: number;
  paybackPeriodYears: number | null;
  isOptimal: boolean;
}

// Define the return type for compareConductorLifecycleCosts
interface ConductorComparisonResults {
  comparisonResults: ComparisonResult[];
  optimalSize: string;
  recommendations: string[];
}

/**
 * Compare lifecycle costs for different conductor sizes to find the optimal economic choice
 * 
 * @param loadItem The load item to analyze
 * @param conductorSizesToCompare Array of conductor sizes to compare
 * @param electricityRatePerKWh Cost of electricity in currency per kWh
 * @param baseConductorCost Base cost for reference conductor
 * @param yearsOfOperation Expected years of operation
 * @param operatingHoursPerYear Annual operating hours
 * @returns Comparison results with optimal size recommendation
 */
export function compareConductorLifecycleCosts(
  loadItem: LoadItem,
  conductorSizesToCompare: string[] = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG'],
  electricityRatePerKWh: number = 10.5,
  baseConductorCost: number = 1000,
  yearsOfOperation: number = 20,
  operatingHoursPerYear: number = 3000
): ConductorComparisonResults {
  // Extract needed properties from loadItem with proper defaults
  const current = loadItem.current || 0;
  
  // Detect wire type with better handling for missing or invalid values
  let wireType = 'THHN_COPPER'; // Default
  
  if (loadItem.circuitDetails?.wireType) {
    wireType = loadItem.circuitDetails.wireType;
  } else {
    // Try to extract from conductorSize if possible
    if (loadItem.conductorSize?.includes('AL')) {
      wireType = 'THHN_ALUMINUM';
    }
    console.log(`No wireType specified, using ${wireType}`);
  }
  
  const conductorLength = loadItem.conductorLength || 10; // Default to 10m if not specified
  const currentSize = loadItem.conductorSize || conductorSizesToCompare[0];
  
  // Log the input parameters
  console.log(`Economic sizing analysis for ${loadItem.description}:
    Current: ${current}A
    Wire Type: ${wireType}
    Conductor Length: ${conductorLength}m
    Current Size: ${currentSize}
    Comparing sizes: ${conductorSizesToCompare.join(', ')}`
  );
  
  // If current is too small, just return with minimal analysis
  if (current < 0.1) {
    console.warn(`Current too low (${current}A) for meaningful economic sizing analysis`);
    return {
      comparisonResults: [
        {
          conductorSize: currentSize,
          materialCost: 0,
          energyLossPerYear: 0,
          annualEnergyCost: 0,
          totalLifecycleCost: 0,
          paybackPeriodYears: 0,
          isOptimal: true
        }
      ],
      optimalSize: currentSize,
      recommendations: ['Current is too low for meaningful economic sizing analysis.']
    };
  }
  
  // Initialize comparison results array
  const results: ComparisonResult[] = [];
  
  // Calculate lifecycle cost for each conductor size
  for (const size of conductorSizesToCompare) {
    try {
      const lifecycleCost = calculateLifecycleCost(
        size,
        wireType,
        conductorLength,
        current,
        electricityRatePerKWh,
        baseConductorCost,
        yearsOfOperation,
        operatingHoursPerYear
      );
      
      results.push({
        conductorSize: size,
        ...lifecycleCost,
        isOptimal: false, // Will be determined later
      });
    } catch (error) {
      console.error(`Error calculating lifecycle cost for ${size}:`, error);
    }
  }
  
  // If no results, return empty analysis
  if (results.length === 0) {
    console.warn('No valid results from economic sizing analysis');
    return {
      comparisonResults: [
        {
          conductorSize: currentSize,
          materialCost: 0,
          energyLossPerYear: 0,
          annualEnergyCost: 0,
          totalLifecycleCost: 0,
          paybackPeriodYears: 0,
          isOptimal: true
        }
      ],
      optimalSize: currentSize,
      recommendations: ['Unable to perform economic sizing analysis with the provided data.']
    };
  }
  
  // Sort results by total lifecycle cost (lowest first)
  results.sort((a, b) => a.totalLifecycleCost - b.totalLifecycleCost);
  
  // Mark the lowest lifecycle cost as optimal
  results[0].isOptimal = true;
  
  // Calculate payback periods relative to the current size if it's in the comparison
  const currentSizeResult = results.find(r => r.conductorSize === currentSize);
  if (currentSizeResult) {
    for (const result of results) {
      if (result.conductorSize === currentSize) {
        result.paybackPeriodYears = 0; // No payback for current option
      } else if (result.materialCost > currentSizeResult.materialCost) {
        // Calculate payback only if material cost is higher (upsizing)
        const annualSavings = currentSizeResult.annualEnergyCost - result.annualEnergyCost;
        if (annualSavings > 0) {
          const additionalCost = result.materialCost - currentSizeResult.materialCost;
          result.paybackPeriodYears = additionalCost / annualSavings;
        } else {
          result.paybackPeriodYears = null; // No payback if no savings
        }
      } else {
        result.paybackPeriodYears = 0; // Immediate payback for downsizing
      }
    }
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  const optimalSize = results[0].conductorSize;

  // Log the analysis results
  console.log(`Economic sizing analysis results:
    Optimal size: ${optimalSize}
    Current size: ${currentSize}
    Potential annual savings: ${currentSizeResult ? 
      (currentSizeResult.annualEnergyCost - results[0].annualEnergyCost).toFixed(2) : 'N/A'}`);
  
  if (optimalSize !== currentSize) {
    if (results[0].paybackPeriodYears !== null && results[0].paybackPeriodYears < yearsOfOperation) {
      recommendations.push(
        `Consider changing conductor size from ${currentSize} to ${optimalSize} for optimal lifecycle cost.`
      );
      recommendations.push(
        `Payback period: ${results[0].paybackPeriodYears.toFixed(1)} years. ROI is favorable within the ${yearsOfOperation}-year lifecycle.`
      );
    } else {
      recommendations.push(
        `The optimal conductor size is ${optimalSize}, but the payback period exceeds the expected lifecycle.`
      );
      recommendations.push(
        `Consider ${optimalSize} for new installations but maintaining current ${currentSize} for existing circuits.`
      );
    }
  } else {
    recommendations.push(
      `The current conductor size ${currentSize} has the optimal lifecycle cost.`
    );
  }
  
  // Add energy loss information
  const currentSizeIndex = results.findIndex(r => r.conductorSize === currentSize);
  if (currentSizeIndex > 0) {
    const savingsPercent = ((results[currentSizeIndex].energyLossPerYear - results[0].energyLossPerYear) / 
                          results[currentSizeIndex].energyLossPerYear * 100);
    if (savingsPercent > 10) {
      recommendations.push(
        `Changing to ${optimalSize} would reduce energy losses by ${savingsPercent.toFixed(1)}% (${(results[currentSizeIndex].energyLossPerYear - results[0].energyLossPerYear).toFixed(1)} kWh/year).`
      );
    }
  }
  
  return {
    comparisonResults: results,
    optimalSize,
    recommendations
  };
}

// Define a type for optimization opportunities
interface OptimizationOpportunity {
  loadId: string;
  description: string;
  currentSize: string;
  recommendedSize: string;
  potentialAnnualSavings: number;
  upfrontCost: number;
  paybackPeriodYears: number;
}

// Define the return type for analyzeLoadScheduleForEconomicSizing
interface EconomicSizingAnalysis {
  totalPotentialSavings: number;
  totalUpfrontCost: number;
  averagePaybackPeriod: number;
  totalCurrentEnergyCost: number;
  optimizationOpportunities: OptimizationOpportunity[];
  recommendations: string[];
}

/**
 * Analyze a load schedule for economic conductor sizing opportunities
 * 
 * @param loadSchedule The load schedule to analyze
 * @param electricityRatePerKWh Cost of electricity in currency per kWh
 * @param baseConductorCost Base cost for reference conductor
 * @param yearsOfOperation Expected years of operation
 * @param operatingHoursPerYear Annual operating hours
 * @returns Economic sizing analysis with optimization opportunities
 */
export function analyzeLoadScheduleForEconomicSizing(
  loadSchedule: LoadSchedule,
  electricityRatePerKWh: number = 10.5,
  baseConductorCost: number = 1000,
  yearsOfOperation: number = 20,
  operatingHoursPerYear: number = 3000
): EconomicSizingAnalysis {
  console.log('Starting economic sizing analysis for load schedule:', loadSchedule.panelName);
  
  const opportunities: OptimizationOpportunity[] = [];
  const allRecommendations: string[] = [];
  
  // Check if load schedule is valid
  if (!loadSchedule || !loadSchedule.loads || loadSchedule.loads.length === 0) {
    console.warn('No loads found in the schedule for economic sizing analysis');
    return {
      totalPotentialSavings: 0,
      totalUpfrontCost: 0,
      averagePaybackPeriod: 0,
      totalCurrentEnergyCost: 0,
      optimizationOpportunities: [],
      recommendations: ['No loads found in the schedule. Add loads to perform economic sizing analysis.']
    };
  }
  
  // Get parameters from load schedule if available
  const useOperatingHours = loadSchedule.optimizationParams?.operatingHoursPerYear || operatingHoursPerYear;
  const useElectricityCost = loadSchedule.optimizationParams?.energyCostPerKwh || electricityRatePerKWh;
  
  console.log(`Using parameters: Operating hours: ${useOperatingHours}, Electricity cost: ${useElectricityCost}`);
  
  // Loop through each load in the schedule
  for (const load of loadSchedule.loads) {
    // Skip loads with no current
    if (!load.current || load.current < 0.5) {
      console.log(`Skipping ${load.description} - current too low (${load.current}A)`);
      continue;
    }
    
    // For larger loads, make sure we have circuit details
    if (load.current >= 10 && !load.circuitDetails?.wireType) {
      console.log(`Load ${load.description} has significant current (${load.current}A) but no circuit details`);
    }
    
    // Use default values if necessary with clear fallbacks
    const current = load.current || 1.0; // Default to 1A if current is missing
    let wireType = load.circuitDetails?.wireType || 'THHN_COPPER'; // Default to copper
    
    // Guess wire type from conductor size if not specified
    if (!load.circuitDetails?.wireType && load.conductorSize?.includes('AL')) {
      wireType = 'THHN_ALUMINUM';
      console.log(`Guessed aluminum wire type from conductor size: ${load.conductorSize}`);
    }
    
    const conductorSize = load.conductorSize || '12 AWG'; // Default to 12 AWG if not specified
    const conductorLength = load.conductorLength || 10; // Default to 10m if not specified
    
    // Create a modified load item with defaults for any missing values
    const enhancedLoad: LoadItem = {
      ...load,
      current,
      conductorSize,
      conductorLength,
      circuitDetails: {
        ...load.circuitDetails,
        wireType,
        type: load.circuitDetails?.type || 'lighting',
        poles: load.circuitDetails?.poles || 1,
        phase: load.circuitDetails?.phase || 'A',
        maxVoltageDropAllowed: load.circuitDetails?.maxVoltageDropAllowed || 3
      }
    };
    
    // Get available sizes to compare based on the wire type
    let sizesToCompare: string[] = [];
    
    // Check if we have cost data for this wire type
    if (CONDUCTOR_COST_INDEX[wireType]) {
      const allSizes = Object.keys(CONDUCTOR_COST_INDEX[wireType]);
      
      // Find the index of the current size in the available sizes
      const currentSizeIndex = allSizes.indexOf(conductorSize);
      
      // Default to a middle index if the size is not found
      const effectiveIndex = currentSizeIndex !== -1 ? currentSizeIndex : Math.floor(allSizes.length / 2);
      
      // Create a window of sizes to compare (2 sizes smaller to 3 sizes larger)
      const startIndex = Math.max(0, effectiveIndex - 2);
      const endIndex = Math.min(allSizes.length - 1, effectiveIndex + 3);
      sizesToCompare = allSizes.slice(startIndex, endIndex + 1);
      console.log(`Comparing sizes for ${load.description}: ${sizesToCompare.join(', ')}`);
    } else {
      // If we don't have cost data for this wire type, use default copper values
      sizesToCompare = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG'];
      console.log(`No cost data for wire type ${wireType}. Using default conductor sizes.`);
    }
    
    try {
      // Perform economic comparison with clear error handling
      const comparison = compareConductorLifecycleCosts(
        enhancedLoad,
        sizesToCompare,
        useElectricityCost,
        baseConductorCost,
        yearsOfOperation,
        useOperatingHours
      );
      
      // Add opportunity if applicable
      if (comparison.optimalSize !== conductorSize) {
        const optimalResult = comparison.comparisonResults.find(r => r.conductorSize === comparison.optimalSize);
        const currentResult = comparison.comparisonResults.find(r => r.conductorSize === conductorSize);
        
        if (optimalResult && currentResult) {
          const annualSavings = currentResult.annualEnergyCost - optimalResult.annualEnergyCost;
          const upfrontCost = optimalResult.materialCost - currentResult.materialCost;
          const paybackPeriod = upfrontCost > 0 ? upfrontCost / annualSavings : 0;
          
          // Only include if there are actual savings and payback is within lifecycle
          if (annualSavings > 0 && (paybackPeriod < yearsOfOperation || upfrontCost <= 0)) {
            opportunities.push({
              loadId: load.id,
              description: load.description,
              currentSize: conductorSize,
              recommendedSize: comparison.optimalSize,
              potentialAnnualSavings: annualSavings,
              upfrontCost: Math.max(0, upfrontCost), // Ensure non-negative for downsizing
              paybackPeriodYears: paybackPeriod
            });
            
            // Add recommendation for this load
            allRecommendations.push(
              `Circuit "${load.description}": Change from ${conductorSize} to ${comparison.optimalSize} to save ${annualSavings.toFixed(2)} per year with a ${paybackPeriod.toFixed(1)} year payback period.`
            );
            
            console.log(`Found optimization for ${load.description}: ${conductorSize} -> ${comparison.optimalSize}, saving ${annualSavings.toFixed(2)}/year`);
          } else {
            console.log(`No economically viable optimization for ${load.description}: savings=${annualSavings.toFixed(2)}, payback=${paybackPeriod.toFixed(1)}`);
          }
        }
      } else {
        console.log(`Current size ${conductorSize} is already optimal for ${load.description}`);
      }
    } catch (error) {
      console.error(`Error analyzing economic sizing for load ${load.id}:`, error);
      // Don't add this error to recommendations but log it for debugging
    }
  }
  
  // Calculate total potential savings
  const totalPotentialSavings = opportunities.reduce(
    (sum, opp) => sum + opp.potentialAnnualSavings, 
    0
  );
  
  // Calculate total upfront cost
  const totalUpfrontCost = opportunities.reduce(
    (sum, opp) => sum + opp.upfrontCost, 
    0
  );
  
  // Calculate average payback period
  const averagePaybackPeriod = opportunities.length > 0 ? 
    opportunities.reduce((sum, opp) => sum + opp.paybackPeriodYears, 0) / opportunities.length : 
    0;
  
  // Calculate total current energy cost
  const totalCurrentEnergyCost = loadSchedule.loads.reduce((sum, load) => {
    if (!load.current || load.current < 0.1) return sum;
    
    const conductorSize = load.conductorSize || '12 AWG';
    const wireType = load.circuitDetails?.wireType || 'THHN_COPPER';
    const materialType = wireType.includes('COPPER') ? 'COPPER' : 'ALUMINUM';
    const conductorLength = load.conductorLength || 10;
    
    const energyLossPerYear = calculateAnnualEnergyLoss(
      conductorSize,
      materialType,
      conductorLength,
      load.current,
      useOperatingHours
    );
    
    // Add this circuit's energy cost to the total
    return sum + (energyLossPerYear * useElectricityCost);
  }, 0);
  
  // Ensure we have a meaningful value for totalCurrentEnergyCost to avoid division by zero
  const effectiveTotalCurrentEnergyCost = Math.max(totalCurrentEnergyCost, 1);
  
  console.log(`Economic sizing analysis completed:
    Opportunities found: ${opportunities.length}
    Total potential savings: ${totalPotentialSavings.toFixed(2)}/year
    Total upfront cost: ${totalUpfrontCost.toFixed(2)}
    Average payback period: ${averagePaybackPeriod.toFixed(1)} years
    Total current energy cost: ${totalCurrentEnergyCost.toFixed(2)}/year`);
  
  // Add summary recommendations
  if (opportunities.length > 0) {
    allRecommendations.unshift(
      `Found ${opportunities.length} optimization opportunities with a total potential savings of ${totalPotentialSavings.toFixed(2)} per year.`
    );
    allRecommendations.unshift(
      `The required investment is ${totalUpfrontCost.toFixed(2)} with an average payback period of ${averagePaybackPeriod.toFixed(1)} years.`
    );
    
    if (totalCurrentEnergyCost > 0) {
      const savingsPercent = (totalPotentialSavings / effectiveTotalCurrentEnergyCost) * 100;
      allRecommendations.unshift(
        `These changes could save approximately ${savingsPercent.toFixed(1)}% of your current conductor energy losses.`
      );
    }
  } else {
    allRecommendations.push(
      'No economically viable conductor sizing opportunities found. Current sizes appear optimal or need more detailed circuit information.'
    );
  }
  
  return {
    totalPotentialSavings,
    totalUpfrontCost,
    averagePaybackPeriod,
    totalCurrentEnergyCost: effectiveTotalCurrentEnergyCost,
    optimizationOpportunities: opportunities,
    recommendations: allRecommendations
  };
} 