import { RoomDetail, LampType, IlluminationResult, RoomIlluminationRequirement } from '../interfaces';

// Default energy rates (PHP per kWh)
const DEFAULT_ENERGY_RATE = 9.75; // Philippine peso per kWh

// Default usage hours
const DEFAULT_DAILY_HOURS = 10; // 10 hours per day
const DEFAULT_MONTHLY_DAYS = 22; // 22 working days per month
const DEFAULT_ANNUAL_MONTHS = 12; // 12 months per year

// Standard lumen values for different lamp types
export const STANDARD_LAMPS: LampType[] = [
  {
    id: 'led-10w',
    name: 'LED 10W',
    wattage: 10,
    lumens: 900,
    efficacy: 90, // lumens per watt
    lifeHours: 25000,
    costPerUnit: 350, // PHP
  },
  {
    id: 'led-18w',
    name: 'LED 18W',
    wattage: 18,
    lumens: 1800,
    efficacy: 100,
    lifeHours: 25000,
    costPerUnit: 450,
  },
  {
    id: 'fluorescent-t8-36w',
    name: 'Fluorescent T8 36W',
    wattage: 36,
    lumens: 2900,
    efficacy: 80.5,
    lifeHours: 20000,
    costPerUnit: 220,
  },
  {
    id: 'fluorescent-t5-28w',
    name: 'Fluorescent T5 28W',
    wattage: 28,
    lumens: 2600,
    efficacy: 92.9,
    lifeHours: 24000,
    costPerUnit: 280,
  },
  {
    id: 'metal-halide-70w',
    name: 'Metal Halide 70W',
    wattage: 70,
    lumens: 5600,
    efficacy: 80,
    lifeHours: 15000,
    costPerUnit: 850,
  },
  {
    id: 'metal-halide-150w',
    name: 'Metal Halide 150W',
    wattage: 150,
    lumens: 12000,
    efficacy: 80,
    lifeHours: 15000,
    costPerUnit: 1200,
  }
];

/**
 * Calculate energy consumption for a room
 * @param {RoomDetail|number} roomOrArea - Either a room object or just the area in square meters
 * @param {LampType|string} lampTypeOrRoomType - Either a lamp type object or room type string
 * @param {number} hoursPerDay - Hours of usage per day
 */
export const calculateEnergyConsumption = (
  roomOrArea: RoomDetail | number,
  lampTypeOrRoomType?: LampType | string,
  hoursPerDay: number = DEFAULT_DAILY_HOURS,
  daysPerMonth: number = DEFAULT_MONTHLY_DAYS,
  monthsPerYear: number = DEFAULT_ANNUAL_MONTHS,
  energyRate: number = DEFAULT_ENERGY_RATE
): any => {
  // Legacy function signature: (area: number, type: string, hoursPerDay: number = 8)
  if (typeof roomOrArea === 'number' && (typeof lampTypeOrRoomType === 'string' || lampTypeOrRoomType === undefined)) {
    const area = roomOrArea;
    const type = lampTypeOrRoomType as string || 'default';
    
    // Base consumption rates in watts per square meter
    const consumptionRates: {[key: string]: number} = {
      'office': 12,
      'conference': 14,
      'classroom': 12,
      'laboratory': 15,
      'corridor': 8,
      'staircase': 6,
      'restroom': 10,
      'lobby': 9,
      'storage': 8,
      'kitchen': 12,
      'data_center': 20,
      'electrical': 10,
      'mechanical': 8,
      'parking': 5,
      'default': 10
    };

    const rate = consumptionRates[type] || consumptionRates.default;
    return area * rate * hoursPerDay;
  }
  
  // New function signature: (room: RoomDetail, lampType: LampType, ...)
  const room = roomOrArea as RoomDetail;
  const lampType = lampTypeOrRoomType as LampType;
  
  // If no fixtures, return zero consumption
  if (!room.actualFixtures || room.actualFixtures <= 0) {
    return {
      dailyConsumption: 0,
      monthlyConsumption: 0,
      annualConsumption: 0,
      annualCost: 0
    };
  }

  // Calculate total wattage
  const totalWattage = lampType.wattage * room.actualFixtures;
  
  // Daily consumption in kWh
  const dailyConsumption = (totalWattage / 1000) * hoursPerDay;
  
  // Monthly consumption in kWh
  const monthlyConsumption = dailyConsumption * daysPerMonth;
  
  // Annual consumption in kWh
  const annualConsumption = monthlyConsumption * monthsPerYear;
  
  // Annual cost in PHP
  const annualCost = annualConsumption * energyRate;
  
  return {
    dailyConsumption,
    monthlyConsumption,
    annualConsumption,
    annualCost
  };
};

/**
 * Calculate illumination requirements for a room
 */
export const calculateIllumination = (
  room: RoomDetail, 
  lampType: LampType, 
  requirement?: RoomIlluminationRequirement
): IlluminationResult => {
  // Room dimensions
  const { length, width, height, area, requiredLux, reflectanceCeiling, reflectanceWalls, reflectanceFloor, maintenanceFactor } = room;
  
  // Ensure we have valid values, use defaults if not provided
  const roomLength = length || 4;
  const roomWidth = width || 3;
  const roomHeight = height || 3;
  const roomArea = area || (roomLength * roomWidth);
  
  // Get required lux either from the room or the requirement
  const targetLux = requiredLux || (requirement ? requirement.requiredLux : 300);
  
  const ceilingReflect = reflectanceCeiling || 0.7;
  const wallsReflect = reflectanceWalls || 0.5;
  const floorReflect = reflectanceFloor || 0.2;
  const maintFactor = maintenanceFactor || 0.8;
  
  // Calculate Room Cavity Ratio (RCR)
  const perimeter = 2 * (roomLength + roomWidth);
  const rcr = (5 * roomHeight * perimeter) / roomArea;
  
  // Estimate light loss factor (LLF)
  const llf = maintFactor; // Simplified, normally includes dirt depreciation, lamp lumen depreciation, etc.
  
  // Estimate utilization factor (UF) based on RCR and reflectances
  let uf = 0;
  
  // Simplified calculation for utilization factor
  if (rcr < 1) uf = 0.85;
  else if (rcr < 2) uf = 0.75;
  else if (rcr < 3) uf = 0.65;
  else if (rcr < 4) uf = 0.55;
  else if (rcr < 5) uf = 0.50;
  else if (rcr < 6) uf = 0.45;
  else if (rcr < 7) uf = 0.40;
  else if (rcr < 8) uf = 0.35;
  else uf = 0.30;
  
  // Adjust UF based on reflectances
  const reflectanceAdjustment = 
    (ceilingReflect - 0.7) * 0.2 + 
    (wallsReflect - 0.5) * 0.3 + 
    (floorReflect - 0.2) * 0.1;
  
  uf += reflectanceAdjustment;
  
  // Clamp UF to reasonable range
  uf = Math.max(0.3, Math.min(0.9, uf));
  
  // Calculate total lumens required
  const totalLumensRequired = (targetLux * roomArea) / (uf * llf);
  
  // Calculate number of lamps needed
  const lampsNeeded = totalLumensRequired / lampType.lumens;
  const numberOfLamps = Math.ceil(lampsNeeded);
  
  // Actual lamps (either from room or calculated)
  const actualLamps = room.actualFixtures || numberOfLamps;
  
  // Calculate lamp spacing
  // Consider room proportions for lamp layout
  const ratio = roomLength / roomWidth;
  let lampsAlongLength = Math.ceil(Math.sqrt(numberOfLamps * ratio));
  let lampsAlongWidth = Math.ceil(numberOfLamps / lampsAlongLength);
  
  // Ensure we have at least one lamp in each direction
  lampsAlongLength = Math.max(1, lampsAlongLength);
  lampsAlongWidth = Math.max(1, lampsAlongWidth);
  
  // Calculate spacing
  const spacingLength = roomLength / (lampsAlongLength + 1);
  const spacingWidth = roomWidth / (lampsAlongWidth + 1);
  
  // Calculate actual illuminance with the actual number of fixtures
  const actualTotalLumens = actualLamps * lampType.lumens;
  const averageIlluminance = (actualTotalLumens * uf * llf) / roomArea;
  
  // Calculate total wattage and energy consumption
  const totalWattage = lampType.wattage * actualLamps;
  const dailyConsumption = (totalWattage / 1000) * DEFAULT_DAILY_HOURS;
  const monthlyConsumption = dailyConsumption * DEFAULT_MONTHLY_DAYS;
  const annualConsumption = monthlyConsumption * DEFAULT_ANNUAL_MONTHS;
  
  // Calculate cost
  const annualEnergyCost = annualConsumption * DEFAULT_ENERGY_RATE;
  const initialInvestment = (lampType.costPerUnit ?? 0) * actualLamps;
  
  // Calculate power density (W/m²)
  const powerDensity = totalWattage / roomArea;
  
  // Create requirement object if not provided
  const requirementObj = requirement || {
    roomType: room.roomType,
    requiredLux: targetLux,
    description: `Standard illumination for ${room.roomType}`,
    reference: 'PEC 2017'
  };
  
  return {
    room,
    lampType,
    requirement: requirementObj,
    totalLumensRequired,
    LLF: llf,
    UF: uf,
    RCR: rcr,
    numberOfLamps,
    actualLamps,
    lampsAlongLength,
    lampsAlongWidth,
    spacingLength,
    spacingWidth,
    totalWattage,
    dailyConsumption,
    monthlyConsumption,
    annualConsumption,
    annualEnergyCost,
    initialInvestment,
    powerDensity,
    averageIlluminance
  };
};

/**
 * Calculate power load for a room
 */
export const calculatePowerLoad = (
  room: RoomDetail
): { 
  totalLoad: number;
  loadPerSquareMeter: number;
  recommendedCircuits: number;
  maxAmperage: number;
} => {
  // Estimate power load based on room type (W/m²)
  const loadPerSquareMeter = {
    'office': 16,
    'conference': 14,
    'restroom': 8,
    'kitchen': 30,
    'storage': 5,
    'electrical': 5,
    'hallway': 6,
    'server': 50,
    'classroom': 15,
    'reception': 14,
    'lobby': 12,
    'default': 10
  }[room.roomType] || 10;
  
  // Calculate total load
  const totalLoad = loadPerSquareMeter * room.area;
  
  // Calculate recommended circuits (assuming 20A circuit)
  const volts = 220; // Standard voltage in the Philippines
  const maxLoadPerCircuit = 0.8 * 20 * volts; // 80% of circuit capacity
  const recommendedCircuits = Math.ceil(totalLoad / maxLoadPerCircuit);
  
  // Calculate maximum amperage
  const maxAmperage = totalLoad / volts;
  
  return {
    totalLoad,
    loadPerSquareMeter,
    recommendedCircuits,
    maxAmperage
  };
};

/**
 * Helper function to estimate lighting load based on room type and area
 */
export const estimateLightingLoad = (roomType: string, area: number): number => {
  // Lighting power density values by room type (W/m²)
  const lightingDensity: {[key: string]: number} = {
    'office': 12,
    'conference': 14,
    'restroom': 10,
    'kitchen': 12,
    'storage': 8,
    'electrical': 6,
    'hallway': 9,
    'default': 10
  };
  
  const density = lightingDensity[roomType] || lightingDensity.default;
  return density * area;
};

/**
 * Helper function to estimate power load based on room type and area
 */
export const estimatePowerLoad = (roomType: string, area: number): number => {
  // Power density values by room type (W/m²)
  const powerDensity: {[key: string]: number} = {
    'office': 15,
    'conference': 12,
    'restroom': 8,
    'kitchen': 25,
    'storage': 5,
    'electrical': 20,
    'hallway': 6,
    'default': 10
  };
  
  const density = powerDensity[roomType] || powerDensity.default;
  return density * area;
};

/**
 * Generate sample consumption data for charts
 */
export const generateConsumptionData = (baseValue: number, fluctuation: number, periods: number): number[] => {
  return Array.from({ length: periods }).map((_, i) => {
    const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
    return Math.round(baseValue * randomFactor);
  });
};

/**
 * Calculate the compliance score based on actual SOL (Schedule of Loads) data
 */
export const calculateComplianceFromSOL = (
  roomType: string,
  area: number,
  actualFixtures: number,
  fixtureType: string = 'LED',
  fixtureWattage: number = 18
): number => {
  // Reference lighting requirements based on Philippine Electrical Code (PEC)
  // Values in lux (illuminance)
  const requiredLux: Record<string, number> = {
    'office': 500,
    'conference': 300,
    'classroom': 500,
    'laboratory': 750,
    'hallway': 100,
    'lobby': 200,
    'restroom': 150,
    'storage': 100,
    'kitchen': 500,
    'faculty': 500,
    'library': 500,
    'auditorium': 300,
    'workshop': 750,
    'default': 300
  };
  
  // Fixture light output based on type (lumens)
  const fixtureLumens: Record<string, number> = {
    'LED': 1600,       // 18W LED panel
    'fluorescent': 1200, // T8 fluorescent
    'compact': 800,    // CFL
    'metal-halide': 7000, // Metal halide
    'incandescent': 800 // Incandescent
  };
  
  // Get required lux for this room type
  const requiredLuxValue = requiredLux[roomType.toLowerCase()] || requiredLux['default'];
  
  // Get fixture lumen output
  const lumensPerFixture = fixtureLumens[fixtureType] || fixtureLumens['LED'];
  
  // Calculate total lumens produced
  const totalLumens = actualFixtures * lumensPerFixture;
  
  // Calculate room area in square meters
  const areaInSqM = area; // area is already in square meters
  
  // Utilization factor (typical values range from 0.4 to 0.6)
  // Based on room shape, reflectances, and luminaire distribution
  const utilizationFactor = 0.5;
  
  // Maintenance factor (accounts for dirt, aging, etc.)
  const maintenanceFactor = 0.8;
  
  // Calculate actual illuminance using the lumen method formula
  // E = (Φ × n × UF × MF) / A
  // Where:
  // E = illuminance (lux)
  // Φ = lumens per fixture
  // n = number of fixtures
  // UF = utilization factor
  // MF = maintenance factor
  // A = area (m²)
  const actualLux = (lumensPerFixture * actualFixtures * utilizationFactor * maintenanceFactor) / areaInSqM;
  
  // Calculate compliance as percentage of required
  let compliance = (actualLux / requiredLuxValue) * 100;
  
  // Cap compliance at 120% (to avoid over-illumination being seen as "better")
  compliance = Math.min(compliance, 120);
  
  // Round to nearest integer
  return Math.round(compliance);
};

/**
 * Calculate energy efficiency of the lighting in a room
 * Returns a score from 0-100 based on wattage per square meter compared to standards
 */
export const calculateEnergyEfficiency = (
  area: number,
  actualFixtures: number,
  fixtureWattage: number = 18,
  roomType: string = 'office'
): number => {
  // Calculate total wattage
  const totalWattage = actualFixtures * fixtureWattage;
  
  // Calculate watts per square meter
  const wattsPerSqM = totalWattage / area;
  
  // Reference values for efficient lighting (W/m²) based on room types
  // These are baseline values from ASHRAE 90.1 and Philippine Green Building Code
  const efficientWattsPerSqM: Record<string, number> = {
    'office': 10,
    'classroom': 12,
    'laboratory': 14,
    'hallway': 6,
    'lobby': 8,
    'restroom': 8,
    'storage': 6,
    'kitchen': 12,
    'library': 12,
    'auditorium': 10,
    'default': 10
  };
  
  // Get the reference value
  const referenceWattsPerSqM = efficientWattsPerSqM[roomType.toLowerCase()] || efficientWattsPerSqM['default'];
  
  // Calculate efficiency score
  // Lower watts/m² is better - 100% if at or below reference, decreasing as wattage increases
  let efficiencyScore = 100;
  
  if (wattsPerSqM > referenceWattsPerSqM) {
    // Calculate how much above the reference we are
    const excess = wattsPerSqM / referenceWattsPerSqM;
    // Penalize exponentially for being above reference
    // If double the reference, score is 50%
    // If triple the reference, score is 25%, etc.
    efficiencyScore = 100 / excess;
  }
  
  // Round to nearest integer
  return Math.round(efficiencyScore);
}; 