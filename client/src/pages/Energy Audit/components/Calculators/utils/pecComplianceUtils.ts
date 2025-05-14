import { LoadItem, LoadSchedule } from '../ScheduleOfLoads/types';

/**
 * Ampacity table for copper conductors (in amperes) based on PEC 2017 Table 2.5
 * The table is indexed by AWG/kcmil size
 */
const COPPER_AMPACITY: Record<string, number> = {
  '14 AWG': 20,
  '12 AWG': 25,
  '10 AWG': 35,
  '8 AWG': 50,
  '6 AWG': 65,
  '4 AWG': 85,
  '3 AWG': 100,
  '2 AWG': 115,
  '1 AWG': 130,
  '1/0 AWG': 150,
  '2/0 AWG': 175,
  '3/0 AWG': 200,
  '4/0 AWG': 230,
  '250 kcmil': 255,
  '300 kcmil': 285,
  '350 kcmil': 310,
  '400 kcmil': 335,
  '500 kcmil': 380,
  '600 kcmil': 420,
  '700 kcmil': 460,
  '750 kcmil': 475
};

/**
 * Ampacity table for aluminum conductors (in amperes) based on PEC 2017 Table 2.5
 * The table is indexed by AWG/kcmil size
 */
const ALUMINUM_AMPACITY: Record<string, number> = {
  '12 AWG': 20,
  '10 AWG': 30,
  '8 AWG': 40,
  '6 AWG': 50,
  '4 AWG': 65,
  '3 AWG': 75,
  '2 AWG': 90,
  '1 AWG': 100,
  '1/0 AWG': 120,
  '2/0 AWG': 135,
  '3/0 AWG': 155,
  '4/0 AWG': 180,
  '250 kcmil': 205,
  '300 kcmil': 230,
  '350 kcmil': 250,
  '400 kcmil': 270,
  '500 kcmil': 310,
  '600 kcmil': 340,
  '700 kcmil': 375,
  '750 kcmil': 385
};

/**
 * Standard circuit breaker sizes in amperes based on PEC 2017
 */
const STANDARD_BREAKER_SIZES = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
  125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600];

/**
 * Demand factors for different types of loads based on PEC 2017
 */
const DEMAND_FACTORS: Record<string, number> = {
  'lighting': 1.0,   // 100% for continuous loads
  'receptacle': 0.5, // 50% for general purpose outlets
  'motor': 1.25,     // 125% of the largest motor
  'hvac': 1.0,       // 100% for HVAC equipment
  'special': 1.0,    // 100% for special purpose outlets
  'other': 1.0       // Default 100%
};

/**
 * Get the ampacity of a conductor based on size and material
 * @param size Conductor size (e.g., "12 AWG", "1/0 AWG", "250 kcmil")
 * @param material Conductor material ("copper" or "aluminum")
 * @returns Ampacity in amperes or 0 if size not found
 */
export function getConductorAmpacity(size: string, material: string): number {
  const isCopper = material.toLowerCase().includes('copper');
  const ampacityTable = isCopper ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
  return ampacityTable[size] || 0;
}

/**
 * Convert breaker size string to number
 * @param breakerSize Breaker size string (e.g., "20A", "100A")
 * @returns Breaker size as number
 */
export function getBreakerSizeValue(breakerSize: string): number {
  return parseInt(breakerSize.replace('A', ''), 10) || 0;
}

/**
 * Check if a circuit breaker size is standard
 * @param breakerSize Breaker size in amperes
 * @returns True if it's a standard size
 */
export function isStandardBreakerSize(breakerSize: number): boolean {
  return STANDARD_BREAKER_SIZES.includes(breakerSize);
}

/**
 * Get the next standard breaker size
 * @param current Current in amperes
 * @returns Next standard breaker size in amperes
 */
export function getNextStandardBreakerSize(current: number): number {
  for (const size of STANDARD_BREAKER_SIZES) {
    if (size >= current) {
      return size;
    }
  }
  return STANDARD_BREAKER_SIZES[STANDARD_BREAKER_SIZES.length - 1];
}

/**
 * Check if a load item complies with PEC 2017 standards
 * @param loadItem The load item to check
 * @param voltage System voltage
 * @returns Compliance information
 */
export function checkLoadItemCompliance(loadItem: LoadItem, voltage: number): { isCompliant: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Skip compliance check if circuit details aren't provided
  if (!loadItem.circuitDetails || !loadItem.circuitBreaker || !loadItem.conductorSize) {
    return { 
      isCompliant: true, 
      issues: [], 
      recommendations: ['Add circuit details, circuit breaker, and conductor size for compliance checking']
    };
  }
  
  // Extract values
  const breakerSize = getBreakerSizeValue(loadItem.circuitBreaker);
  const wireType = loadItem.circuitDetails.wireType;
  const isContinuous = loadItem.circuitDetails.type === 'lighting';
  const isCopper = wireType.includes('COPPER');
  const conductorSize = loadItem.conductorSize;
  
  // Calculate required current
  let requiredCurrent = loadItem.current || 0;
  
  // Apply multiplier for continuous loads (PEC 2017 requires 125%)
  if (isContinuous) {
    requiredCurrent *= 1.25;
  }
  
  // Check conductor ampacity
  const conductorAmpacity = getConductorAmpacity(conductorSize, isCopper ? 'copper' : 'aluminum');
  if (conductorAmpacity === 0) {
    issues.push(`Invalid conductor size: ${conductorSize}`);
    recommendations.push('Select a valid conductor size');
  } else if (conductorAmpacity < requiredCurrent) {
    issues.push(`Conductor ampacity (${conductorAmpacity}A) is less than required current (${requiredCurrent.toFixed(2)}A)`);
    
    // Find appropriate conductor size
    for (const [size, ampacity] of Object.entries(isCopper ? COPPER_AMPACITY : ALUMINUM_AMPACITY)) {
      if (ampacity >= requiredCurrent) {
        recommendations.push(`Increase conductor size to at least ${size}`);
        break;
      }
    }
  }
  
  // Check circuit breaker size
  if (breakerSize < requiredCurrent) {
    issues.push(`Circuit breaker size (${breakerSize}A) is less than required current (${requiredCurrent.toFixed(2)}A)`);
    const nextSize = getNextStandardBreakerSize(requiredCurrent);
    recommendations.push(`Increase circuit breaker size to ${nextSize}A`);
  }
  
  // Check circuit breaker vs conductor ampacity
  if (breakerSize > conductorAmpacity) {
    issues.push(`Circuit breaker size (${breakerSize}A) exceeds conductor ampacity (${conductorAmpacity}A)`);
    recommendations.push(`Reduce circuit breaker size to maximum ${conductorAmpacity}A or increase conductor size`);
  }
  
  // Check voltage drop if available
  if (loadItem.voltageDropPercent !== undefined) {
    const maxVoltageDropAllowed = loadItem.circuitDetails.maxVoltageDropAllowed || 3; // Default 3% per PEC 2017
    if (loadItem.voltageDropPercent > maxVoltageDropAllowed) {
      issues.push(`Voltage drop (${loadItem.voltageDropPercent.toFixed(2)}%) exceeds maximum allowed (${maxVoltageDropAllowed}%)`);
      recommendations.push(`Increase conductor size or reduce circuit length to keep voltage drop below ${maxVoltageDropAllowed}%`);
    }
  }
  
  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Check if a load schedule (panel) complies with PEC 2017 standards
 * @param loadSchedule The load schedule to check
 * @returns Compliance information
 */
export function checkLoadScheduleCompliance(loadSchedule: LoadSchedule): { isCompliant: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Get main circuit breaker and feeder conductor size if available
  if (loadSchedule.circuitBreaker && loadSchedule.conductorSize) {
    const mainBreakerSize = getBreakerSizeValue(loadSchedule.circuitBreaker);
    const conductorSize = loadSchedule.conductorSize;
    
    // Guess conductor material (typically copper for panels)
    const isCopper = !conductorSize.toLowerCase().includes('al');
    const conductorAmpacity = getConductorAmpacity(conductorSize, isCopper ? 'copper' : 'aluminum');
    
    // Check total current vs main breaker
    if (loadSchedule.current * 1.25 > mainBreakerSize) { // Apply 125% for continuous loads
      issues.push(`Total demand current (${(loadSchedule.current * 1.25).toFixed(2)}A with continuous load factor) exceeds main breaker rating (${mainBreakerSize}A)`);
      const nextSize = getNextStandardBreakerSize(loadSchedule.current * 1.25);
      recommendations.push(`Increase main breaker size to at least ${nextSize}A`);
    }
    
    // Check main breaker vs conductor
    if (mainBreakerSize > conductorAmpacity) {
      issues.push(`Main breaker size (${mainBreakerSize}A) exceeds feeder conductor ampacity (${conductorAmpacity}A)`);
      recommendations.push(`Increase feeder conductor size to support ${mainBreakerSize}A breaker`);
    }
  }
  
  // Check phase balance for 3-phase panels
  if (loadSchedule.phaseConfiguration === 'three-phase') {
    // Implement phase balance calculation here when phase details are available
    // For now, just add a placeholder recommendation
    recommendations.push('Ensure proper phase balance for three-phase panel');
  }
  
  // Check total load items compliance
  let nonCompliantItems = 0;
  for (const loadItem of loadSchedule.loads) {
    if (loadItem.pecCompliance && !loadItem.pecCompliance.isCompliant) {
      nonCompliantItems++;
    }
  }
  
  if (nonCompliantItems > 0) {
    issues.push(`${nonCompliantItems} load items do not comply with PEC 2017 standards`);
    recommendations.push('Address compliance issues in individual load items');
  }
  
  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Calculate and update PEC compliance for all load items in a schedule
 * @param loadSchedule The load schedule to update
 * @returns Updated load schedule with compliance information
 */
export function updateLoadScheduleCompliance(loadSchedule: LoadSchedule): LoadSchedule {
  // First update all load items compliance
  const updatedLoads = loadSchedule.loads.map(loadItem => {
    const compliance = checkLoadItemCompliance(loadItem, loadSchedule.voltage);
    return {
      ...loadItem,
      pecCompliance: compliance,
      isPECCompliant: compliance.isCompliant
    };
  });
  
  // Update the load schedule with the new loads
  const updatedSchedule = {
    ...loadSchedule,
    loads: updatedLoads
  };
  
  // Check panel-level compliance
  const panelCompliance = checkLoadScheduleCompliance(updatedSchedule);
  
  // Return fully updated schedule
  return {
    ...updatedSchedule,
    panelCompliance,
    isPECCompliant: panelCompliance.isCompliant
  };
}

/**
 * Recommend appropriate circuit breaker and conductor size based on load
 * @param loadCurrent Load current in amperes
 * @param isContinuous Whether the load is continuous (operates for 3+ hours)
 * @param preferred material Preferred conductor material ('copper' or 'aluminum')
 * @returns Recommended sizes
 */
export function recommendCircuitComponents(
  loadCurrent: number,
  isContinuous: boolean = false,
  preferredMaterial: 'copper' | 'aluminum' = 'copper'
): { breakerSize: string; conductorSize: string } {
  // Apply 125% factor for continuous loads per PEC 2017
  const requiredCurrent = isContinuous ? loadCurrent * 1.25 : loadCurrent;
  
  // Get next standard breaker size
  const breakerSize = getNextStandardBreakerSize(requiredCurrent);
  
  // Find appropriate conductor size
  const ampacityTable = preferredMaterial === 'copper' ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
  let conductorSize = Object.entries(ampacityTable)
    .find(([_, ampacity]) => ampacity >= breakerSize)?.[0] || '';
  
  return {
    breakerSize: `${breakerSize}A`,
    conductorSize
  };
} 