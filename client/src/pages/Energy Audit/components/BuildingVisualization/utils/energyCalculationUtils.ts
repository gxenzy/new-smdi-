import { LoadSchedule } from '../interfaces';

/**
 * Calculate lighting requirements for a room
 */
export const calculateLightingRequirements = (
  area: number,
  roomType: string,
  ceilingHeight: number,
  targetLux: number
): {
  requiredLux: number;
  totalLumens: number;
  recommendedFixtures: number;
  wattsPerFixture: number;
  totalWattage: number;
  energyConsumption: number;
} => {
  // Base lighting requirements by room type (lux)
  const baseRequirements: Record<string, number> = {
    'classroom': 300,
    'lab': 500,
    'office': 350,
    'common': 150,
    'utility': 200,
    'corridor': 100,
    'default': 250
  };
  
  // Utilize factor based on ceiling height
  const utilizationFactor = ceilingHeight <= 2.5 ? 0.5 : 
                            ceilingHeight <= 3.0 ? 0.45 : 
                            ceilingHeight <= 3.5 ? 0.4 : 0.35;
  
  // Maintenance factor
  const maintenanceFactor = 0.8;
  
  // Required lux (either from parameter or default for room type)
  const requiredLux = targetLux || baseRequirements[roomType] || baseRequirements.default;
  
  // Calculate total lumens required
  const totalLumens = (requiredLux * area) / (utilizationFactor * maintenanceFactor);
  
  // Average lumens per fixture based on room type
  const lumensPerFixture: Record<string, number> = {
    'classroom': 3000,
    'lab': 4000,
    'office': 2500,
    'common': 2000,
    'utility': 3000,
    'corridor': 1500,
    'default': 2500
  };
  
  const fixtureLumens = lumensPerFixture[roomType] || lumensPerFixture.default;
  
  // Calculate recommended number of fixtures
  const recommendedFixtures = Math.ceil(totalLumens / fixtureLumens);
  
  // Average watts per fixture based on lumens (LED efficiency)
  const wattsPerFixture = Math.round(fixtureLumens / 100); // Assumes 100 lm/W efficiency
  
  // Calculate total wattage
  const totalWattage = recommendedFixtures * wattsPerFixture;
  
  // Calculate monthly energy consumption (assuming 8 hours/day, 22 days/month)
  const energyConsumption = (totalWattage * 8 * 22) / 1000; // kWh
  
  return {
    requiredLux,
    totalLumens,
    recommendedFixtures,
    wattsPerFixture,
    totalWattage,
    energyConsumption
  };
};

/**
 * Calculate power consumption for a load schedule
 */
export const calculatePowerConsumption = (loadSchedule: LoadSchedule): {
  peakDemand: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  costPerMonth: number;
} => {
  // Default operating hours if not specified in load schedule
  const operatingHours = 8; // Default 8 hours per day
  const daysPerMonth = 22; // Typical working days
  
  // Get total wattage from the schedule
  const totalWattage = loadSchedule.totalDemandLoad || 1000; // Default to 1000W if not specified
  
  // Calculate peak demand in kW
  const peakDemand = totalWattage / 1000;
  
  // Calculate energy consumption
  const dailyConsumption = peakDemand * operatingHours;
  const monthlyConsumption = dailyConsumption * daysPerMonth;
  const annualConsumption = monthlyConsumption * 12;
  
  // Calculate cost (assume PHP 10 per kWh)
  const energyRate = 10; // PHP per kWh
  const costPerMonth = monthlyConsumption * energyRate;
  
  return {
    peakDemand,
    dailyConsumption,
    monthlyConsumption,
    annualConsumption,
    costPerMonth
  };
};

/**
 * Recommend circuit breaker size based on power requirements
 */
export const recommendCircuitBreaker = (
  wattage: number,
  voltage: number = 220
): number => {
  // Calculate current (I = P/V)
  const current = wattage / voltage;
  
  // Add 25% safety margin
  const safetyMargin = current * 1.25;
  
  // Standard circuit breaker sizes
  const standardSizes = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100];
  
  // Find the smallest circuit breaker that can handle the load
  for (const size of standardSizes) {
    if (size >= safetyMargin) {
      return size;
    }
  }
  
  // If beyond 100A, return the next highest multiple of 10
  return Math.ceil(safetyMargin / 10) * 10;
}; 