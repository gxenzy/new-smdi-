/**
 * Interface definitions for the BuildingVisualization component
 */

export interface RoomCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AreaPoint {
  x: number;
  y: number;
}

export interface RoomDetail {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  roomType: string;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  reflectanceCeiling: number;
  reflectanceWalls: number;
  reflectanceFloor: number;
  maintenanceFactor: number;
  requiredLux: number;
  recommendedFixtures: number;
  actualFixtures: number;
  compliance: number;
  shape?: string;
  color?: string;
  notes?: string;
  manualArea?: number;
  energyUsage?: number;
  powerDetails?: {
    connectedLoad: number;
    demandLoad: number;
    voltage: number;
    current: number;
    powerFactor: number;
  };
  points?: AreaPoint[];
}

export interface LoadItem {
  description: string;
  quantity: number;
  rating: number;
  demandFactor: number;
  current: number;
  voltAmpere: number;
  circuitBreaker: string;
  conductorSize: string;
}

export interface LoadSchedule {
  id: string;
  roomId: string;
  panelName: string;
  floorName: string;
  voltage: number;
  powerFactor: number;
  totalConnectedLoad: number;
  totalDemandLoad: number;
  current: number;
  circuitBreaker: string;
  conductorSize: string;
  incomingFeederSize: string;
  feederProtectionSize: string;
  loads: LoadItem[];
}

export interface BuildingData {
  name: string;
  floors: {
    [key: string]: {
      name: string;
      rooms: RoomDetail[];
      loadSchedules: LoadSchedule[];
    };
  };
}

export interface NonCompliantArea {
  id: string;
  roomId: string;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  requiredValue: number;
  actualValue: number;
  severity: 'low' | 'medium' | 'high';
  type: 'lighting' | 'power' | 'hvac';
}

export interface DetectedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: string;
}

export interface ImageDetectionResult {
  rooms: DetectedRoom[];
  orientation: string;
  confidenceScore: number;
}

export interface EnergyConsumptionData {
  totalConsumption: number;
  totalArea: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  annualCost: number;
  energyDensity: number;
  compliancePercentage: number;
}

export interface RoomTypeDistribution {
  roomType: string;
  count: number;
  totalArea: number;
  totalConsumption: number;
  averageCompliance: number;
  color: string;
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  annualSavings: number;
  implementationCost: number;
  paybackPeriod: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rooms?: string[]; // IDs of rooms affected
  type: 'lighting' | 'power' | 'envelope' | 'hvac' | 'general';
}

export interface ComplianceStandard {
  id: string;
  code: string;
  name: string;
  section: string;
  requirement: string;
  applicability: string[];
  threshold: number;
  unit: string;
  description: string;
}

export interface RoomEditorState {
  isOpen: boolean;
  roomId: string | null;
  floorKey: string;
}

export interface VisualizationState {
  viewMode: 'lighting' | 'power';
  isEditMode: boolean;
  showGridLines: boolean;
  isPanMode: boolean;
  zoomLevel: number;
  showAnnotations: boolean;
  selectedTab: number;
  isProcessingImage: boolean;
  detectionConfidence: number;
  detectedRooms: DetectedRoom[];
  nonCompliantAreas: NonCompliantArea[];
  dragState: {
    isDragging: boolean;
    elementId: string | null;
    elementType: 'room' | 'hotspot' | null;
    startX: number;
    startY: number;
  };
}

export interface EnergyAnalysisMetrics {
  totalArea: number;
  totalLightingPower: number;
  averageLightingPowerDensity: number;
  averageCompliance: number;
  totalDailyConsumption: number;
  totalMonthlyConsumption: number;
  totalAnnualConsumption: number;
  totalAnnualCost: number;
  compliantRoomsPercentage: number;
}

export interface LampType {
  id: string;
  name: string;
  wattage: number;
  lumens: number;
  efficiency?: number;
  efficacy?: number; // lumens per watt
  lifeHours?: number;
  costPerUnit?: number; // Cost per unit in currency
  color?: string;
  description?: string;
}

export interface RoomIlluminationRequirement {
  roomType: string;
  requiredLux: number;
  description: string;
  reference: string;
}

export interface IlluminationResult {
  room: RoomDetail;
  lampType: LampType;
  requirement: RoomIlluminationRequirement;
  totalLumensRequired: number;
  LLF: number; // Light Loss Factor
  UF: number; // Utilization Factor
  RCR: number; // Room Cavity Ratio
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

export interface FloorPlan {
  id: string;
  floor: string;
  type: 'lighting' | 'power';
  imagePath: string;
  rooms?: DetectedRoom[];
}

export interface BuildingContextProps {
  buildingData: BuildingData;
  isLoading: boolean;
  error: string | null;
  selectedFloor: string;
  setSelectedFloor: (floor: string) => void;
  activeRoomId: string | null;
  setActiveRoomId: (id: string | null) => void;
  getFloorRooms: (floorKey: string) => RoomDetail[];
  addRoom: (floorKey: string, room: RoomDetail) => Promise<boolean>;
  updateRoom: (floorKey: string, roomId: string, roomData: Partial<RoomDetail>) => Promise<boolean>;
  deleteRoom: (floorKey: string, roomId: string) => Promise<boolean>;
  getRoomById: (floorKey: string, roomId: string) => RoomDetail | null;
  refresh: () => Promise<void>;
  saveBuildingData: () => Promise<boolean>;
  runRoomDetection: (floorKey: string) => Promise<DetectedRoom[]>;
  applyDetectedRooms: (floorKey: string, detectedRooms: DetectedRoom[]) => Promise<boolean>;
  updateRoomCoordinates: (floorKey: string, roomId: string, coords: RoomCoords) => Promise<boolean>;
  rooms: RoomDetail[];
  setRooms: (rooms: RoomDetail[]) => void;
  selectedRoom: RoomDetail | null;
  setSelectedRoom: (room: RoomDetail | null) => void;
} 