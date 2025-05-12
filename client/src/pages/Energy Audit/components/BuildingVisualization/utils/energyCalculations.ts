import { RoomDetail } from '../interfaces';

/**
 * Utility functions for energy-related calculations in the building visualization
 */

/**
 * Calculate room cavity ratio for lighting calculations
 * Formula: RCR = 5 * h * (l + w) / (l * w)
 * where h = cavity height, l = length, w = width
 */
export const calculateRoomCavityRatio = (
  length: number, 
  width: number, 
  height: number, 
  workPlaneHeight: number = 0.85
): number => {
  const cavityHeight = height - workPlaneHeight;
  return 5 * cavityHeight * (length + width) / (length * width);
};

/**
 * Calculate coefficient of utilization based on room cavity ratio and reflectances
 * This is a simplified implementation - a real one would use lookup tables
 */
export const calculateCoefficientOfUtilization = (
  rcr: number,
  reflectanceCeiling: number = 0.7,
  reflectanceWalls: number = 0.5,
  reflectanceFloor: number = 0.2
): number => {
  // Simplified CU calculation based on typical values
  // In reality, this would use manufacturer data and lookup tables
  // Values typically range from 0.4 to 0.8
  const reflectanceAvg = (reflectanceCeiling + reflectanceWalls + reflectanceFloor) / 3;
  
  // Higher RCR means lower utilization
  let baseUtilization: number;
  if (rcr <= 1) baseUtilization = 0.8;
  else if (rcr <= 2) baseUtilization = 0.7;
  else if (rcr <= 3) baseUtilization = 0.6;
  else if (rcr <= 5) baseUtilization = 0.5;
  else if (rcr <= 7) baseUtilization = 0.45;
  else baseUtilization = 0.4;
  
  // Adjust for reflectance - higher reflectance means better utilization
  return baseUtilization * (0.7 + 0.3 * reflectanceAvg);
};

/**
 * Calculate the total number of required fixtures for a room
 * Formula: N = (E * A) / (n * Φ * CU * LLF)
 * where:
 * - E = required illuminance (lux)
 * - A = area (m²)
 * - n = number of lamps per fixture
 * - Φ = luminous flux per lamp (lumens)
 * - CU = coefficient of utilization
 * - LLF = light loss factor (maintenance factor)
 */
export const calculateRequiredFixtures = (
  area: number,
  requiredLux: number,
  lumensPerFixture: number = 3600, // Default: 2 x 18W T8 LED tubes @ 1800 lumens each
  maintenanceFactor: number = 0.8,
  coefficientOfUtilization?: number,
  roomCavityRatio?: number,
  reflectanceCeiling: number = 0.7,
  reflectanceWalls: number = 0.5,
  reflectanceFloor: number = 0.2
): number => {
  // If CU not provided, calculate it
  const cu = coefficientOfUtilization || 
    (roomCavityRatio 
      ? calculateCoefficientOfUtilization(roomCavityRatio, reflectanceCeiling, reflectanceWalls, reflectanceFloor)
      : 0.6); // Default value if RCR not provided
  
  // Calculate number of fixtures and round up to nearest whole fixture
  const fixtures = (requiredLux * area) / (lumensPerFixture * cu * maintenanceFactor);
  return Math.ceil(fixtures);
};

/**
 * Calculate the actual illuminance based on installed fixtures
 */
export const calculateActualIlluminance = (
  area: number,
  actualFixtures: number,
  lumensPerFixture: number = 3600,
  maintenanceFactor: number = 0.8,
  coefficientOfUtilization: number = 0.6
): number => {
  return (actualFixtures * lumensPerFixture * coefficientOfUtilization * maintenanceFactor) / area;
};

/**
 * Calculate the energy consumption for lighting in a room (W)
 */
export const calculateLightingPower = (
  fixtures: number,
  wattsPerFixture: number = 36 // Default: 2 x 18W T8 LED tubes
): number => {
  return fixtures * wattsPerFixture;
};

/**
 * Calculate lighting power density (W/m²)
 */
export const calculateLightingPowerDensity = (
  lightingPower: number,
  area: number
): number => {
  return lightingPower / area;
};

/**
 * Calculate daily energy consumption (kWh) based on usage hours
 */
export const calculateDailyEnergyConsumption = (
  power: number,
  hoursPerDay: number = 8
): number => {
  return (power * hoursPerDay) / 1000; // Convert W to kWh
};

/**
 * Calculate monthly energy consumption (kWh)
 */
export const calculateMonthlyEnergyConsumption = (
  dailyConsumption: number,
  daysPerMonth: number = 22
): number => {
  return dailyConsumption * daysPerMonth;
};

/**
 * Calculate annual energy consumption (kWh)
 */
export const calculateAnnualEnergyConsumption = (
  monthlyConsumption: number,
  monthsPerYear: number = 12
): number => {
  return monthlyConsumption * monthsPerYear;
};

/**
 * Calculate annual energy cost
 */
export const calculateAnnualEnergyCost = (
  annualConsumption: number,
  costPerKwh: number = 10 // Default: ₱10 per kWh
): number => {
  return annualConsumption * costPerKwh;
};

/**
 * Calculate the lighting compliance percentage for a room
 */
export const calculateLightingCompliance = (
  requiredLux: number,
  actualLux: number
): number => {
  // Perfect compliance is 100% of required illuminance
  const ratio = actualLux / requiredLux;
  
  // Scale compliance:
  // - 0.9 to 1.1 = 90-100% compliance (ideal range)
  // - 0.7 to 0.9 = 70-90% compliance (acceptable)
  // - 1.1 to 1.3 = 90-80% compliance (over-lit, energy waste)
  // - < 0.7 or > 1.3 = reduced compliance
  
  if (ratio < 0.5) return 50; // Critically under-lit
  if (ratio < 0.7) return 50 + (ratio - 0.5) * 100; // 50-70%
  if (ratio < 0.9) return 70 + (ratio - 0.7) * 100; // 70-90%
  if (ratio <= 1.1) return 90 + (ratio - 0.9) * 100; // 90-100%
  if (ratio <= 1.3) return 100 - (ratio - 1.1) * 50; // 100-90%
  return 90 - Math.min(40, (ratio - 1.3) * 50); // Diminishing compliance for over-lighting
};

/**
 * Calculate the complete lighting analysis for a room
 */
export const analyzeLighting = (room: RoomDetail): {
  rcr: number;
  coefficientOfUtilization: number;
  recommendedFixtures: number;
  lightingPower: number;
  lightingPowerDensity: number;
  actualIlluminance: number;
  compliance: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  annualCost: number;
} => {
  // Calculate room cavity ratio
  const rcr = calculateRoomCavityRatio(
    room.length, 
    room.width, 
    room.height,
    0.85 // Standard work plane height
  );
  
  // Calculate coefficient of utilization
  const cu = calculateCoefficientOfUtilization(
    rcr,
    room.reflectanceCeiling || 0.7,
    room.reflectanceWalls || 0.5,
    room.reflectanceFloor || 0.2
  );
  
  // Calculate recommended fixtures
  const recommendedFixtures = calculateRequiredFixtures(
    room.area,
    room.requiredLux || 500,
    3600, // Lumens per fixture
    room.maintenanceFactor || 0.8,
    cu
  );
  
  // Calculate lighting power
  const lightingPower = calculateLightingPower(
    room.actualFixtures || recommendedFixtures
  );
  
  // Calculate lighting power density
  const lightingPowerDensity = calculateLightingPowerDensity(
    lightingPower,
    room.area
  );
  
  // Calculate actual illuminance
  const actualIlluminance = calculateActualIlluminance(
    room.area,
    room.actualFixtures || recommendedFixtures,
    3600, // Lumens per fixture
    room.maintenanceFactor || 0.8,
    cu
  );
  
  // Calculate compliance
  const compliance = calculateLightingCompliance(
    room.requiredLux || 500,
    actualIlluminance
  );
  
  // Calculate energy consumption
  const dailyConsumption = calculateDailyEnergyConsumption(lightingPower);
  const monthlyConsumption = calculateMonthlyEnergyConsumption(dailyConsumption);
  const annualConsumption = calculateAnnualEnergyConsumption(monthlyConsumption);
  const annualCost = calculateAnnualEnergyCost(annualConsumption);
  
  return {
    rcr,
    coefficientOfUtilization: cu,
    recommendedFixtures,
    lightingPower,
    lightingPowerDensity,
    actualIlluminance,
    compliance,
    dailyConsumption,
    monthlyConsumption,
    annualConsumption,
    annualCost
  };
};

/**
 * Calculate total building energy metrics based on all rooms
 */
export const calculateBuildingEnergyMetrics = (rooms: RoomDetail[]): {
  totalArea: number;
  totalLightingPower: number;
  averageLightingPowerDensity: number;
  averageCompliance: number;
  totalDailyConsumption: number;
  totalMonthlyConsumption: number;
  totalAnnualConsumption: number;
  totalAnnualCost: number;
  compliantRoomsPercentage: number;
} => {
  if (!rooms.length) {
    return {
      totalArea: 0,
      totalLightingPower: 0,
      averageLightingPowerDensity: 0,
      averageCompliance: 0,
      totalDailyConsumption: 0,
      totalMonthlyConsumption: 0,
      totalAnnualConsumption: 0,
      totalAnnualCost: 0,
      compliantRoomsPercentage: 0
    };
  }
  
  let totalArea = 0;
  let totalLightingPower = 0;
  let totalCompliance = 0;
  let compliantRooms = 0;
  
  // Analyze each room
  const roomAnalyses = rooms.map(room => {
    const analysis = analyzeLighting(room);
    
    totalArea += room.area;
    totalLightingPower += analysis.lightingPower;
    totalCompliance += analysis.compliance;
    
    if (analysis.compliance >= 85) {
      compliantRooms++;
    }
    
    return analysis;
  });
  
  // Calculate aggregate metrics
  const averageLightingPowerDensity = totalLightingPower / totalArea;
  const averageCompliance = totalCompliance / rooms.length;
  const compliantRoomsPercentage = (compliantRooms / rooms.length) * 100;
  
  // Calculate energy consumption
  const totalDailyConsumption = calculateDailyEnergyConsumption(totalLightingPower);
  const totalMonthlyConsumption = calculateMonthlyEnergyConsumption(totalDailyConsumption);
  const totalAnnualConsumption = calculateAnnualEnergyConsumption(totalMonthlyConsumption);
  const totalAnnualCost = calculateAnnualEnergyCost(totalAnnualConsumption);
  
  return {
    totalArea,
    totalLightingPower,
    averageLightingPowerDensity,
    averageCompliance,
    totalDailyConsumption,
    totalMonthlyConsumption,
    totalAnnualConsumption,
    totalAnnualCost,
    compliantRoomsPercentage
  };
}; 