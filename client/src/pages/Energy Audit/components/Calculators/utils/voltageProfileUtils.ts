import { UnifiedCircuitData } from './CircuitSynchronization';
import { VoltageDropCalculationResult } from './voltageDropRecalculator';

/**
 * Interface for voltage profile data points
 */
export interface VoltageProfileData {
  distance: number;
  voltage: number;
  isCompliant: boolean;
}

/**
 * Generate data points for voltage profile visualization
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param numberOfPoints Number of points to generate along the conductor length
 * @returns Array of voltage profile data points
 */
export function generateVoltageProfileData(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number = 20
): VoltageProfileData[] {
  const supplyVoltage = circuitData.voltage || 230;
  const conductorLength = circuitData.conductorLength || 10;
  const voltageDrop = voltageDropResult.voltageDrop;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  
  // Calculate maximum voltage drop as a percentage
  const maxVoltageDrop = (maxAllowedDrop / 100) * supplyVoltage;
  
  // Generate data points along the conductor length
  const data: VoltageProfileData[] = [];
  
  for (let i = 0; i <= numberOfPoints; i++) {
    const distanceRatio = i / numberOfPoints;
    const distance = distanceRatio * conductorLength;
    
    // Calculate voltage at this point (assuming linear voltage drop)
    const voltageAtPoint = supplyVoltage - (voltageDrop * distanceRatio);
    
    // Check if voltage is compliant at this point
    const minimumAllowedVoltage = supplyVoltage - maxVoltageDrop;
    const isCompliant = voltageAtPoint >= minimumAllowedVoltage;
    
    data.push({
      distance,
      voltage: voltageAtPoint,
      isCompliant
    });
  }
  
  return data;
}

/**
 * Calculate voltage at specific points along a conductor
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param numberOfPoints Number of points to calculate
 * @returns Array of objects with distance, voltage, and compliance status
 */
export function calculateVoltageAtPoints(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number = 10
): VoltageProfileData[] {
  return generateVoltageProfileData(circuitData, voltageDropResult, numberOfPoints);
}

/**
 * Calculate the minimum voltage along the conductor
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @returns Minimum voltage value
 */
export function calculateMinimumVoltage(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult
): number {
  const supplyVoltage = circuitData.voltage || 230;
  return supplyVoltage - voltageDropResult.voltageDrop;
}

/**
 * Calculate the voltage drop at a specific distance along the conductor
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param distance Distance in meters from the source
 * @returns Voltage at the specified distance
 */
export function calculateVoltageAtDistance(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  distance: number
): number {
  const supplyVoltage = circuitData.voltage || 230;
  const conductorLength = circuitData.conductorLength || 10;
  const voltageDrop = voltageDropResult.voltageDrop;
  
  // Calculate ratio of distance to total length
  const distanceRatio = Math.min(1, Math.max(0, distance / conductorLength));
  
  // Calculate voltage at this distance (assuming linear voltage drop)
  return supplyVoltage - (voltageDrop * distanceRatio);
}

/**
 * Check if the voltage at a specific distance is compliant with standards
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param distance Distance in meters from the source
 * @returns Whether the voltage at this distance is compliant
 */
export function isVoltageCompliantAtDistance(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  distance: number
): boolean {
  const supplyVoltage = circuitData.voltage || 230;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  
  // Calculate maximum allowed voltage drop as absolute value
  const maxVoltageDrop = (maxAllowedDrop / 100) * supplyVoltage;
  const minimumAllowedVoltage = supplyVoltage - maxVoltageDrop;
  
  // Calculate actual voltage at this distance
  const voltageAtDistance = calculateVoltageAtDistance(
    circuitData,
    voltageDropResult,
    distance
  );
  
  return voltageAtDistance >= minimumAllowedVoltage;
}

/**
 * Find the distance at which voltage becomes non-compliant
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @returns Distance at which the voltage becomes non-compliant, or null if always compliant
 */
export function findNonComplianceDistance(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult
): number | null {
  const supplyVoltage = circuitData.voltage || 230;
  const conductorLength = circuitData.conductorLength || 10;
  const voltageDrop = voltageDropResult.voltageDrop;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  
  // If already compliant at the end of the conductor, return null
  if (voltageDropResult.compliance === 'compliant') {
    return null;
  }
  
  // Calculate maximum allowed voltage drop as absolute value
  const maxVoltageDrop = (maxAllowedDrop / 100) * supplyVoltage;
  const minimumAllowedVoltage = supplyVoltage - maxVoltageDrop;
  
  // Calculate at what distance the voltage equals the minimum allowed voltage
  // voltageDrop * (distance / conductorLength) = maxVoltageDrop
  // distance = (maxVoltageDrop / voltageDrop) * conductorLength
  const distanceRatio = maxVoltageDrop / voltageDrop;
  const nonComplianceDistance = distanceRatio * conductorLength;
  
  // Check if this distance is within the conductor length
  if (nonComplianceDistance <= conductorLength) {
    return nonComplianceDistance;
  }
  
  return conductorLength; // Return full length if issues occur at the very end
} 