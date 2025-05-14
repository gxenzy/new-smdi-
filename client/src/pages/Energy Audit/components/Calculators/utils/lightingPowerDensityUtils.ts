/**
 * Lighting Power Density Calculation Utilities
 * 
 * This module provides utility functions for lighting power density calculations
 * based on the Philippine Green Building Code standards
 */
import { fetchLPDStandards, BuildingStandardsType } from './standards';

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
 * Energy parameters for savings calculations
 */
export interface EnergyParameters {
  hoursPerDay: number;
  daysPerYear: number;
  energyRate: number;
  upgradeFixtureCost: number;
}

/**
 * Room preset interface for predefined room configurations
 */
export interface RoomPreset {
  name: string;
  description: string;
  area: number;
  fixtures: Fixture[];
}

/**
 * Building preset interface for predefined building configurations
 */
export interface BuildingPreset {
  name: string;
  buildingType: string;
  description: string;
  typicalRooms: RoomPreset[];
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
 * Predefined building presets for quick room configuration
 */
export const BUILDING_PRESETS: BuildingPreset[] = [
  {
    name: 'Office Building',
    buildingType: 'office',
    description: 'Typical office building with various workspace types and utility areas',
    typicalRooms: [
      {
        name: 'Open Office Area',
        description: 'Large open plan office with workstations',
        area: 100,
        fixtures: [
          { id: 'preset-1', name: 'LED Panel Light', wattage: 45, ballastFactor: 1.0, quantity: 16 },
          { id: 'preset-2', name: 'LED Task Light', wattage: 7, ballastFactor: 1.0, quantity: 10 }
        ]
      },
      {
        name: 'Conference Room',
        description: 'Medium-sized meeting room',
        area: 30,
        fixtures: [
          { id: 'preset-3', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 6 },
          { id: 'preset-4', name: 'LED Spotlight', wattage: 15, ballastFactor: 1.0, quantity: 4 }
        ]
      },
      {
        name: 'Private Office',
        description: 'Individual office for executives',
        area: 20,
        fixtures: [
          { id: 'preset-5', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 4 },
          { id: 'preset-6', name: 'LED Task Light', wattage: 7, ballastFactor: 1.0, quantity: 1 }
        ]
      }
    ]
  },
  {
    name: 'Educational Facility',
    buildingType: 'classroom',
    description: 'Educational building with classrooms, labs, and administrative spaces',
    typicalRooms: [
      {
        name: 'Standard Classroom',
        description: 'Typical classroom for 30-40 students',
        area: 70,
        fixtures: [
          { id: 'preset-7', name: 'LED Panel Light', wattage: 45, ballastFactor: 1.0, quantity: 12 }
        ]
      },
      {
        name: 'Laboratory',
        description: 'Science or computer lab with specialized equipment',
        area: 80,
        fixtures: [
          { id: 'preset-8', name: 'LED Panel Light', wattage: 45, ballastFactor: 1.0, quantity: 15 },
          { id: 'preset-9', name: 'LED Task Light', wattage: 10, ballastFactor: 1.0, quantity: 8 }
        ]
      },
      {
        name: 'Faculty Office',
        description: 'Shared office for teaching staff',
        area: 40,
        fixtures: [
          { id: 'preset-10', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 8 }
        ]
      }
    ]
  },
  {
    name: 'Retail Store',
    buildingType: 'retail',
    description: 'Retail establishment with sales floor, storage, and office areas',
    typicalRooms: [
      {
        name: 'Sales Floor',
        description: 'Main retail display area',
        area: 150,
        fixtures: [
          { id: 'preset-11', name: 'LED Track Light', wattage: 12, ballastFactor: 1.0, quantity: 30 },
          { id: 'preset-12', name: 'LED Spotlight', wattage: 15, ballastFactor: 1.0, quantity: 20 }
        ]
      },
      {
        name: 'Storage Room',
        description: 'Inventory storage area',
        area: 40,
        fixtures: [
          { id: 'preset-13', name: 'LED High-Bay', wattage: 95, ballastFactor: 1.0, quantity: 4 }
        ]
      },
      {
        name: 'Back Office',
        description: 'Administrative office area',
        area: 25,
        fixtures: [
          { id: 'preset-14', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 4 }
        ]
      }
    ]
  },
  {
    name: 'Healthcare Facility',
    buildingType: 'hospital',
    description: 'Healthcare facility with examination rooms, offices, and waiting areas',
    typicalRooms: [
      {
        name: 'Examination Room',
        description: 'Standard patient examination room',
        area: 20,
        fixtures: [
          { id: 'preset-15', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 4 },
          { id: 'preset-16', name: 'LED Examination Light', wattage: 25, ballastFactor: 1.0, quantity: 1 }
        ]
      },
      {
        name: 'Waiting Area',
        description: 'Patient waiting room',
        area: 50,
        fixtures: [
          { id: 'preset-17', name: 'LED Panel Light', wattage: 36, ballastFactor: 1.0, quantity: 9 },
          { id: 'preset-18', name: 'LED Downlight', wattage: 12, ballastFactor: 1.0, quantity: 6 }
        ]
      },
      {
        name: 'Nurse Station',
        description: 'Staff work area',
        area: 30,
        fixtures: [
          { id: 'preset-19', name: 'LED Panel Light', wattage: 45, ballastFactor: 1.0, quantity: 6 },
          { id: 'preset-20', name: 'LED Task Light', wattage: 7, ballastFactor: 1.0, quantity: 3 }
        ]
      }
    ]
  }
];

/**
 * In-memory cache for building standards data
 */
let buildingStandardsCache: BuildingStandardsType | null = null;

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
  { name: 'LED Task Light', wattage: 7, ballastFactor: 1.0 }
];

/**
 * Get a building preset by name
 * 
 * @param presetName - Name of the preset to retrieve
 * @returns The building preset or null if not found
 */
export function getBuildingPreset(presetName: string): BuildingPreset | null {
  return BUILDING_PRESETS.find(preset => preset.name === presetName) || null;
}

/**
 * Get a room preset by name from a specific building preset
 * 
 * @param buildingPreset - Building preset to search in
 * @param roomName - Name of the room preset to retrieve
 * @returns The room preset or null if not found
 */
export function getRoomPreset(buildingPreset: BuildingPreset, roomName: string): RoomPreset | null {
  return buildingPreset.typicalRooms.find(room => room.name === roomName) || null;
}

/**
 * Calculate total lighting power for a collection of fixtures
 * 
 * @param fixtures - Array of lighting fixtures
 * @returns Total wattage of all fixtures
 */
export function calculateTotalLightingPower(fixtures: Fixture[]): number {
  return fixtures.reduce((sum, fixture) => {
    return sum + (fixture.wattage * fixture.ballastFactor * fixture.quantity);
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
  const standards = buildingStandards || BUILDING_TYPES;
  const buildingTypeKey = buildingType as keyof typeof standards;
  const buildingTypeInfo = standards[buildingTypeKey];
  
  if (!buildingTypeInfo) {
    throw new Error(`Unknown building type: ${buildingType}`);
  }
  return lpd <= buildingTypeInfo.maxLPD;
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
    } else if (percentageOver > 15) {
      recommendations.push('Replace existing fixtures with more efficient alternatives such as LED panels or tubes.');
    } else {
      recommendations.push('Consider reducing fixture quantity or using lower wattage lamps where appropriate.');
    }
    
    recommendations.push('Implement lighting controls such as occupancy sensors or daylight harvesting to reduce energy consumption.');
  } else {
    // If already compliant, still offer energy efficiency suggestions
    if (result.lpd > result.standardLPD * 0.8) {
      recommendations.push('While compliant, you can further improve efficiency by upgrading to fixtures with higher lumens per watt.');
    } else {
      recommendations.push('Your lighting design is efficient. Consider adding controls to further optimize energy usage.');
    }
  }

  // Add energy savings information if available
  if (result.potentialSavings) {
    const { wattageSavings, estimatedAnnualKwh, estimatedAnnualCost, paybackPeriod } = result.potentialSavings;
    
    recommendations.push(`Potential energy savings of ${wattageSavings.toFixed(1)} W (${estimatedAnnualKwh.toFixed(0)} kWh/year) could save approximately $${estimatedAnnualCost.toFixed(2)} annually.`);
    
    if (paybackPeriod) {
      recommendations.push(`With an estimated payback period of ${paybackPeriod.toFixed(1)} years, upgrades would provide long-term financial benefits.`);
    }
  }

  return recommendations;
}

/**
 * Calculate potential energy savings by meeting standards
 * 
 * @param currentLPD - Current lighting power density
 * @param targetLPD - Target lighting power density to achieve
 * @param totalWattage - Current total wattage
 * @param energyParams - Parameters for energy savings calculation
 * @returns Energy savings calculation results
 */
export function calculateEnergySavings(
  currentLPD: number,
  targetLPD: number,
  totalWattage: number,
  energyParams: EnergyParameters
): EnergySavings {
  // If already compliant, target is current LPD
  const complianceTarget = currentLPD <= targetLPD ? currentLPD : targetLPD;
  
  // Calculate wattage reduction needed
  const wattageSavings = currentLPD > targetLPD
    ? totalWattage * (1 - (targetLPD / currentLPD))
    : 0;
  
  // Calculate percentage savings
  const percentageSavings = currentLPD > targetLPD
    ? ((currentLPD - targetLPD) / currentLPD) * 100
    : 0;
  
  // Calculate annual energy savings
  const hoursPerYear = energyParams.hoursPerDay * energyParams.daysPerYear;
  const estimatedAnnualKwh = (wattageSavings / 1000) * hoursPerYear;
  const estimatedAnnualCost = estimatedAnnualKwh * energyParams.energyRate;
  
  // Calculate payback period if there's an upgrade cost and savings
  let paybackPeriod: number | undefined = undefined;
  
  if (energyParams.upgradeFixtureCost > 0 && estimatedAnnualCost > 0) {
    paybackPeriod = energyParams.upgradeFixtureCost / estimatedAnnualCost;
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
 * Perform complete LPD calculation for a room
 * 
 * @param roomData - Room information including fixtures
 * @param includeSavings - Whether to include energy savings calculation
 * @param energyParams - Parameters for energy savings calculation
 * @returns Comprehensive LPD calculation results
 */
export async function calculateLPDResults(
  roomData: RoomData, 
  includeSavings: boolean = false,
  energyParams?: EnergyParameters
): Promise<LPDResult> {
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
  
  // Calculate energy savings if requested
  if (includeSavings && energyParams) {
    result.potentialSavings = calculateEnergySavings(
      lpd,
      buildingTypeInfo.maxLPD,
      totalWattage,
      energyParams
    );
  }
  
  result.recommendations = generateRecommendations(result);
  
  return result;
} 