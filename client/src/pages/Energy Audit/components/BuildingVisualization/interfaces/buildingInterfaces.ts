/**
 * Interface definitions for Building Visualization module
 */

/**
 * Room coordinates information
 */
export interface RoomCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Point coordinates for polygon shapes
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Room detected from floor plan
 */
export interface DetectedRoom {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  polygon?: Point[];
}

/**
 * Room detail containing all information for visualization
 */
export interface RoomDetail {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  roomType: string;
  coords: RoomCoords;
  reflectanceCeiling: number;
  reflectanceWalls: number;
  reflectanceFloor: number;
  maintenanceFactor: number;
  requiredLux: number;
  recommendedFixtures?: number;
  actualFixtures?: number;
  compliance?: number;
  shape?: 'rect' | 'polygon';
  points?: Point[];
  energyUsage?: number;
  powerDetails?: {
    connectedLoad: number;
    demandLoad: number;
    voltage: number;
    current: number;
    powerFactor: number;
  };
}

/**
 * Non-compliant area in floor plan
 */
export interface NonCompliantArea {
  id: string;
  type: 'lighting' | 'power';
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  compliance: number;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Load item for schedule of loads
 */
export interface LoadItem {
  description: string;
  quantity: number;
  rating: number;
  demandFactor: number;
  connectedLoad: number;
  demandLoad: number;
  current?: number;
  voltAmpere?: number;
  circuitBreaker?: string;
  conductorSize?: string;
}

/**
 * Load schedule for electrical system
 */
export interface LoadSchedule {
  id: string;
  name: string;
  hours: {
    [day: string]: { start: string; end: string }[];
  };
  occupancyFactors: {
    [hour: string]: number;
  };
}

/**
 * Building data structure
 */
export interface BuildingData {
  name: string;
  floors: Record<string, FloorData>;
}

/**
 * Floor data structure
 */
export interface FloorData {
  name: string;
  rooms: RoomDetail[];
  loadSchedules: LoadSchedule[];
}

export interface FloorDetail {
  id: string;
  number: number;
  name: string;
  rooms: RoomDetail[];
  loadSchedules: LoadSchedule[];
}

export interface BuildingDetail {
  id: string;
  name: string;
  address: string;
  floors: FloorDetail[];
}

export interface FloorplanData {
  buildingId: string;
  floorId: string;
  floorNumber: number;
  rooms: RoomDetail[];
  width: number;
  height: number;
  scale?: {
    pixels: number;
    meters: number;
  };
  annotations?: Array<{
    id: string;
    type: string;
    coords: {
      x: number;
      y: number;
    };
    text: string;
  }>;
}

export interface LightingFixture {
  id: string;
  type: string;
  wattage: number;
  lumens: number;
  cri: number;
  cct: number;
  life: number;
  cost: number;
  efficacy: number;
  distribution: string;
}

export interface SOLCalculationInput {
  room: RoomDetail;
  fixtures: LightingFixture[];
  targetLux: number;
}

export interface SOLCalculationResult {
  recommendedFixtureCount: number;
  totalWattage: number;
  averageIlluminance: number;
  uniformity: number;
  installationCost: number;
  annualEnergyCost: number;
  co2Emissions: number;
  paybackPeriod?: number;
  suggestions?: string[];
} 