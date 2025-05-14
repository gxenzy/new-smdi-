// Define LoadItem interface for Schedule of Loads
export interface LoadItem {
  description: string;
  quantity: number;
  rating: number; // in watts
  demandFactor: number;
  connectedLoad: number; // watts
  demandLoad: number; // watts
  current?: number; // amps
  va?: number; // volt-amperes
  circuitBreaker?: string;
  conductorSize?: string;
}

// Define LoadSchedule interface
export interface LoadSchedule {
  id: string;
  roomId: string;
  panelName: string;
  title?: string;
  items: LoadItem[];
  totalConnectedLoad: number; // watts
  totalDemandLoad: number; // watts
  voltage: number; // volts
  current: number; // amps
  powerFactor: number;
  incomingFeeder?: string;
  feederProtection?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  area: number;
  energyUsage: number;
  // Additional properties needed for the component
  actualLumens?: number;
  outletCompliance?: boolean;
  protectionCompliance?: boolean;
  calculatedLightingPower?: number;
}

// Add BuildingData interface definition above BUILDING_DATA
export interface BuildingDataRooms {
  [floor: string]: Room[];
}

export interface BuildingData {
  id: string;
  name: string;
  address: string;
  totalArea: number;
  totalEnergyConsumption: number;
  rooms: BuildingDataRooms;
  floors?: { id: string; name: string }[]; // Make floors optional
  energyData?: { // Make energyData optional
    monthly?: { month: string; lighting: number; hvac: number; equipment: number; total: number }[];
    distribution?: { name: string; value: number }[];
  };
}

// Define NonCompliantArea interface
export interface NonCompliantArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  compliance: number;
  title: string;
  description: string;
}

// Additional interfaces
export interface RoomIlluminationRequirement {
  roomType: string;
  requiredLux: number;
  description: string;
  reference: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  roomType: string;
  type?: string; // Add this property to fix the type error
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // New fields for custom shapes and colors
  shape?: AreaShape;
  points?: AreaPoint[];
  color?: string;
  // Existing fields for illumination calculation
  manualArea?: number;
  reflectanceCeiling?: number;
  reflectanceWalls?: number;
  reflectanceFloor?: number;
  maintenanceFactor?: number;
}

export interface DetailedRoomsType {
  [floor: string]: RoomDetail[];
}

export interface LampType {
  id: string;
  name: string;
  wattage: number;
  lumens: number;
  efficacy: number; // lumens per watt
  lifeHours: number;
  costPerUnit: number; // PHP
  isCustom?: boolean;
}

export interface IlluminationResult {
  room: RoomDetail;
  lampType: LampType;
  requirement: RoomIlluminationRequirement;
  totalLumensRequired: number;
  LLF: number;
  UF: number;
  RCR: number;
  numberOfLamps: number;
  actualLamps: number;
  lampsAlongLength: number;
  lampsAlongWidth: number;
  spacingLength: number;
  spacingWidth: number;
  totalWattage: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  annualEnergyCost: number;
  initialInvestment: number;
  powerDensity: number;
  averageIlluminance: number;
}

export type AreaPoint = { x: number; y: number };
export type AreaShape = 'rect' | 'polygon'; 