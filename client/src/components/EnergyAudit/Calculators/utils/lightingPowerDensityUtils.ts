/**
 * Lighting Power Density Calculation Utilities
 * 
 * This module provides utility functions for lighting power density calculations
 * based on the Philippine Green Building Code standards
 */
import { fetchLPDStandards, BuildingStandardsType } from './index';

/**
 * Interface for a lighting fixture
 */
export interface Fixture {
  id: string;
  name: string;
  wattage: number;
  ballastFactor: number;
  quantity: number;
}

/**
 * Room data interface for LPD calculations
 */
export interface RoomData {
  name: string;
  area: number;
  buildingType: string;
  fixtures: Fixture[];
}

/**
 * LPD calculation result interface
 */
export interface LPDResult {
  totalWattage: number;
  lpd: number;
  isCompliant: boolean;
  standardLPD: number;
  buildingTypeLabel: string;
  recommendations: string[];
  potentialSavings?: EnergySavings;
}

/**
 * Energy savings calculation interface
 */
export interface EnergySavings {
  wattageSavings: number;
  percentageSavings: number;
  complianceTarget: number;
  estimatedAnnualKwh: number;
  estimatedAnnualCost: number;
  paybackPeriod?: number;
}

/**
 * Interface for building type presets
 */
export interface BuildingPreset {
  name: string;
  buildingType: string;
  description: string;
  typicalRooms: RoomPreset[];
}

/**
 * Interface for room presets
 */
export interface RoomPreset {
  name: string;
  description: string;
  area: number;
  fixtures: Fixture[];
}

/**
 * Building types with their maximum LPD values (W/m²) according to PEC 2017
 * These are fallback values if the API request fails
 */
export const BUILDING_TYPES: BuildingStandardsType = {
  office: { label: 'Office', maxLPD: 10.5 },
  classroom: { label: 'Classroom', maxLPD: 10.5 },
  hospital: { label: 'Hospital', maxLPD: 11.2 },
  retail: { label: 'Retail', maxLPD: 14.5 },
  industrial: { label: 'Industrial', maxLPD: 12.8 },
  residential: { label: 'Residential', maxLPD: 8.0 },
  warehouse: { label: 'Warehouse', maxLPD: 8.0 },
  restaurant: { label: 'Restaurant', maxLPD: 12.0 },
  hotel: { label: 'Hotel', maxLPD: 10.0 },
  laboratory: { label: 'Laboratory', maxLPD: 14.0 }
};

/**
 * In-memory cache for building standards data
 */
let buildingStandardsCache: BuildingStandardsType | null = null;

/**
 * Common room and building type presets for quick calculations
 */
export const BUILDING_PRESETS: BuildingPreset[] = [
  {
    name: 'Small Office Building',
    buildingType: 'office',
    description: 'Typical small office building with open office, private offices, meeting rooms and utility areas',
    typicalRooms: [
      {
        name: 'Open Office Area',
        description: 'Open floor plan workspace with modular workstations',
        area: 100,
        fixtures: [
          { id: '1', name: 'LED Panel Light (2x2)', wattage: 40, ballastFactor: 1.0, quantity: 16 },
          { id: '2', name: 'LED Task Light', wattage: 7, ballastFactor: 1.0, quantity: 8 }
        ]
      },
      {
        name: 'Conference Room',
        description: 'Medium-sized meeting room for team discussions',
        area: 30,
        fixtures: [
          { id: '1', name: 'LED Downlight', wattage: 18, ballastFactor: 1.0, quantity: 6 },
          { id: '2', name: 'LED Wall Washer', wattage: 15, ballastFactor: 1.0, quantity: 4 }
        ]
      },
      {
        name: 'Private Office',
        description: 'Manager or executive office with desk and meeting area',
        area: 20,
        fixtures: [
          { id: '1', name: 'LED Panel Light (2x2)', wattage: 40, ballastFactor: 1.0, quantity: 4 },
          { id: '2', name: 'LED Desk Lamp', wattage: 10, ballastFactor: 1.0, quantity: 1 }
        ]
      }
    ]
  },
  {
    name: 'Educational Facility',
    buildingType: 'classroom',
    description: 'School or college building with classrooms, labs, and administrative areas',
    typicalRooms: [
      {
        name: 'Standard Classroom',
        description: 'General classroom for lectures and instruction',
        area: 70,
        fixtures: [
          { id: '1', name: 'LED Linear Fixture', wattage: 36, ballastFactor: 1.0, quantity: 9 },
          { id: '2', name: 'LED Whiteboard Light', wattage: 25, ballastFactor: 1.0, quantity: 2 }
        ]
      },
      {
        name: 'Computer Lab',
        description: 'Specialized classroom with computer workstations',
        area: 80,
        fixtures: [
          { id: '1', name: 'LED Panel Light (2x4)', wattage: 50, ballastFactor: 1.0, quantity: 12 },
          { id: '2', name: 'LED Task Light', wattage: 7, ballastFactor: 1.0, quantity: 20 }
        ]
      }
    ]
  },
  {
    name: 'Retail Store',
    buildingType: 'retail',
    description: 'Commercial retail space with sales floor, stockroom, and checkout areas',
    typicalRooms: [
      {
        name: 'Main Sales Floor',
        description: 'Primary retail display and customer area',
        area: 200,
        fixtures: [
          { id: '1', name: 'LED Track Light', wattage: 15, ballastFactor: 1.0, quantity: 40 },
          { id: '2', name: 'LED Linear Pendant', wattage: 45, ballastFactor: 1.0, quantity: 10 }
        ]
      },
      {
        name: 'Stockroom',
        description: 'Inventory and storage area',
        area: 50,
        fixtures: [
          { id: '1', name: 'T8 LED Tube', wattage: 18, ballastFactor: 1.0, quantity: 12 }
        ]
      }
    ]
  }
];

/**
 * Default fixture types with typical wattages and ballast factors
 */
export const DEFAULT_FIXTURES = [
  { name: 'LED Panel Light', wattage: 45, ballastFactor: 1.0 },
  { name: 'T8 Fluorescent Tube', wattage: 32, ballastFactor: 0.88 },
  { name: 'CFL Downlight', wattage: 26, ballastFactor: 1.0 },
  { name: 'LED Spotlight', wattage: 15, ballastFactor: 1.0 },
  { name: 'High-Bay LED', wattage: 150, ballastFactor: 1.0 },
  { name: 'T5 Fluorescent', wattage: 28, ballastFactor: 1.0 },
  { name: 'LED Track Light', wattage: 12, ballastFactor: 1.0 },
  { name: 'LED Wall Washer', wattage: 18, ballastFactor: 1.0 },
  { name: 'LED Troffer (2x2)', wattage: 30, ballastFactor: 1.0 },
  { name: 'LED Troffer (2x4)', wattage: 50, ballastFactor: 1.0 },
  { name: 'Recessed LED Can Light', wattage: 15, ballastFactor: 1.0 },
  { name: 'LED Task Light', wattage: 7, ballastFactor: 1.0 }
];

/**
 * Load building standards from API or use fallback values
 */
export const loadBuildingStandards = async (): Promise<BuildingStandardsType> => {
  try {
    if (!buildingStandardsCache) {
      buildingStandardsCache = await fetchLPDStandards();
    }
    // Make sure we're never returning null
    return buildingStandardsCache || BUILDING_TYPES;
  } catch (error) {
    console.error('Error loading building standards, using fallback values:', error);
    return BUILDING_TYPES;
  }
};

/**
 * Clear the building standards cache to force reload
 */
export const clearBuildingStandardsCache = () => {
  buildingStandardsCache = null;
};

/**
 * Calculate total lighting power for a collection of fixtures
 * 
 * @param fixtures - Array of lighting fixtures
 * @returns Total wattage of all fixtures
 */
export function calculateTotalLightingPower(fixtures: Fixture[]): number {
  if (!fixtures || fixtures.length === 0) {
    return 0;
  }
  
  return fixtures.reduce((sum, fixture) => {
    const fixtureWattage = (fixture.wattage * fixture.ballastFactor * fixture.quantity) || 0;
    return sum + fixtureWattage;
  }, 0);
}

/**
 * Calculate lighting power density for a room
 * 
 * @param totalWattage - Total lighting power in watts
 * @param area - Room area in square meters
 * @returns Lighting power density in W/m²
 */
export function calculateLPD(totalWattage: number, area: number): number {
  if (area <= 0) {
    throw new Error('Room area must be greater than zero');
  }
  
  if (totalWattage < 0) {
    throw new Error('Total wattage cannot be negative');
  }
  
  return totalWattage / area;
}

/**
 * Check if a lighting design is compliant with standards
 * 
 * @param lpd - Calculated lighting power density
 * @param buildingType - Type of building from BUILDING_TYPES
 * @param buildingStandards - Optional building standards override, defaults to BUILDING_TYPES
 * @returns Whether the design meets standards
 */
export function checkCompliance(
  lpd: number, 
  buildingType: string, 
  buildingStandards?: BuildingStandardsType
): boolean {
  if (lpd < 0) {
    throw new Error('LPD value cannot be negative');
  }
  
  const standards = buildingStandards || BUILDING_TYPES;
  const buildingTypeKey = buildingType as keyof typeof standards;
  const buildingTypeInfo = standards[buildingTypeKey];
  
  if (!buildingTypeInfo) {
    throw new Error(`Unknown building type: ${buildingType}`);
  }
  return lpd <= buildingTypeInfo.maxLPD;
}

/**
 * Calculate potential energy savings by switching to more efficient fixtures
 * 
 * @param currentWattage - Current total lighting power
 * @param area - Room area
 * @param targetLPD - Target LPD value (usually the standard maximum)
 * @param hoursPerDay - Average hours of operation per day
 * @param daysPerYear - Days of operation per year
 * @param energyRate - Cost of electricity per kWh
 * @param upgradeFixtureCost - Estimated cost to upgrade all fixtures
 * @returns Energy savings calculation results
 */
export function calculateEnergySavings(
  currentWattage: number,
  area: number,
  targetLPD: number,
  hoursPerDay: number = 10,
  daysPerYear: number = 260,
  energyRate: number = 0.12,
  upgradeFixtureCost?: number
): EnergySavings {
  // Calculate target wattage to meet the standard
  const targetWattage = targetLPD * area;
  
  // If already compliant, target is current wattage
  const complianceTarget = Math.min(currentWattage, targetWattage);
  
  // Calculate potential savings
  const wattageSavings = Math.max(0, currentWattage - complianceTarget);
  const percentageSavings = currentWattage > 0 ? (wattageSavings / currentWattage) * 100 : 0;
  
  // Calculate energy and cost savings
  const hoursPerYear = hoursPerDay * daysPerYear;
  const estimatedAnnualKwh = (wattageSavings / 1000) * hoursPerYear;
  const estimatedAnnualCost = estimatedAnnualKwh * energyRate;
  
  // Calculate payback period if upgrade cost is provided
  let paybackPeriod = undefined;
  if (upgradeFixtureCost && upgradeFixtureCost > 0 && estimatedAnnualCost > 0) {
    paybackPeriod = upgradeFixtureCost / estimatedAnnualCost;
  }
  
  return {
    wattageSavings,
    percentageSavings,
    complianceTarget,
    estimatedAnnualKwh,
    estimatedAnnualCost,
    paybackPeriod
  };
}

/**
 * Generate recommendations based on LPD calculation results
 * 
 * @param result - LPD calculation result
 * @returns Array of recommendation strings
 */
export function generateRecommendations(result: LPDResult): string[] {
  const recommendations = [];

  if (!result.isCompliant) {
    // Calculate percentage over the limit
    const percentageOver = ((result.lpd - result.standardLPD) / result.standardLPD) * 100;
    
    recommendations.push(`Your current LPD (${result.lpd.toFixed(2)} W/m²) exceeds the ${result.buildingTypeLabel} standard of ${result.standardLPD} W/m².`);
    
    if (percentageOver > 30) {
      recommendations.push('Consider a complete lighting system redesign with high-efficiency fixtures.');
      recommendations.push('Replace conventional fixtures with LED alternatives to reduce total power consumption.');
    } else if (percentageOver > 15) {
      recommendations.push('Replace existing fixtures with more efficient alternatives such as LED panels or tubes.');
      recommendations.push('Consider reducing the number of fixtures in areas with excess illumination.');
    } else {
      recommendations.push('Consider reducing fixture quantity or using lower wattage lamps where appropriate.');
      recommendations.push('Retrofit existing fixtures with LED lamps to reduce power consumption while maintaining light levels.');
    }
    
    recommendations.push('Implement lighting controls such as occupancy sensors or daylight harvesting to reduce energy consumption.');
    
    // Add energy savings recommendations if available
    if (result.potentialSavings && result.potentialSavings.estimatedAnnualCost > 0) {
      recommendations.push(`Potential annual energy savings of approximately ${result.potentialSavings.estimatedAnnualKwh.toFixed(1)} kWh (${result.potentialSavings.estimatedAnnualCost.toFixed(2)} USD) by meeting the standard requirement.`);
      
      if (result.potentialSavings.paybackPeriod) {
        recommendations.push(`Estimated payback period: ${result.potentialSavings.paybackPeriod.toFixed(1)} years.`);
      }
    }
  } else {
    // If already compliant, still offer energy efficiency suggestions
    if (result.lpd > result.standardLPD * 0.8) {
      recommendations.push('While compliant, you can further improve efficiency by upgrading to fixtures with higher lumens per watt.');
      recommendations.push('Consider implementing advanced lighting controls to reduce operational hours.');
    } else {
      recommendations.push('Your lighting design is efficient. Consider adding controls to further optimize energy usage.');
      recommendations.push('Document this successful design approach for future projects.');
    }
  }

  return recommendations;
}

/**
 * Get a preset room configuration by name
 * 
 * @param presetName - The name of the preset to retrieve
 * @returns The preset room data or null if not found
 */
export function getRoomPreset(presetName: string): RoomPreset | null {
  for (const building of BUILDING_PRESETS) {
    const roomPreset = building.typicalRooms.find(room => room.name === presetName);
    if (roomPreset) {
      return roomPreset;
    }
  }
  return null;
}

/**
 * Load a complete building preset
 * 
 * @param presetName - Name of the building preset to load
 * @returns The building preset or null if not found
 */
export function getBuildingPreset(presetName: string): BuildingPreset | null {
  return BUILDING_PRESETS.find(preset => preset.name === presetName) || null;
}

/**
 * Perform complete LPD calculation for a room
 * 
 * @param roomData - Room information including fixtures
 * @param calculateSavings - Whether to calculate potential energy savings
 * @param energyParameters - Optional parameters for energy savings calculation
 * @returns Comprehensive LPD calculation results
 */
export async function calculateLPDResults(
  roomData: RoomData, 
  calculateSavings: boolean = false,
  energyParameters?: {
    hoursPerDay: number;
    daysPerYear: number;
    energyRate: number;
    upgradeFixtureCost?: number;
  }
): Promise<LPDResult> {
  try {
    if (roomData.area <= 0) {
      throw new Error('Room area must be greater than zero');
    }
    
    if (roomData.fixtures.length === 0) {
      throw new Error('At least one fixture is required for calculation');
    }
    
    // Get the latest building standards
    const buildingStandards = await loadBuildingStandards();
    
    const totalWattage = calculateTotalLightingPower(roomData.fixtures);
    const lpd = calculateLPD(totalWattage, roomData.area);
    
    const buildingTypeKey = roomData.buildingType as keyof typeof buildingStandards;
    const buildingTypeInfo = buildingStandards[buildingTypeKey];
    
    if (!buildingTypeInfo) {
      throw new Error(`Unknown building type: ${roomData.buildingType}`);
    }
    
    const result: LPDResult = {
      totalWattage,
      lpd,
      isCompliant: lpd <= buildingTypeInfo.maxLPD,
      standardLPD: buildingTypeInfo.maxLPD,
      buildingTypeLabel: buildingTypeInfo.label,
      recommendations: []
    };
    
    // Calculate potential energy savings if requested
    if (calculateSavings) {
      const params = energyParameters || {
        hoursPerDay: 10, 
        daysPerYear: 260, 
        energyRate: 0.12
      };
      
      result.potentialSavings = calculateEnergySavings(
        totalWattage,
        roomData.area,
        buildingTypeInfo.maxLPD,
        params.hoursPerDay,
        params.daysPerYear,
        params.energyRate,
        params.upgradeFixtureCost
      );
    }
    
    result.recommendations = generateRecommendations(result);
    
    return result;
  } catch (error) {
    console.error('Error in LPD calculation:', error);
    throw error instanceof Error ? error : new Error('Unknown error in LPD calculation');
  }
} 