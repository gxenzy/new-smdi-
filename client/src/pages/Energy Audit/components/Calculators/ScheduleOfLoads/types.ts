/**
 * Load item for schedule of loads
 */
export interface LoadItem {
  id: string;
  description: string;
  quantity: number;
  rating: number; // in watts
  demandFactor: number;
  connectedLoad: number; // watts
  demandLoad: number; // watts
  current?: number; // amps
  voltAmpere?: number; // volt-amperes
  circuitBreaker?: string;
  conductorSize?: string;
  // Voltage drop calculation fields
  voltageDropPercent?: number;
  voltageDrop?: number;
  receivingEndVoltage?: number;
  isPECCompliant?: boolean;
  conductorLength?: number;
  optimalConductorSize?: string;
  // Voltage drop analysis results
  voltageDropResults?: {
    voltageDropPercent: number;
    voltageDropVolts?: number;
    isCompliant?: boolean;
    conductor?: string;
    length?: number;
    current?: number;
  };
  // Enhanced voltage drop parameters
  insulationType?: 'THHN' | 'THWN' | 'XHHW' | 'RHW' | 'USE';
  ambientTemperature?: number;
  harmonicFactor?: number;
  parallelSets?: number;
  bundleAdjustmentFactor?: number;
  distanceToFurthestOutlet?: number;
  startingCurrentMultiplier?: number;
  // Optimization metadata
  optimizationMetadata?: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    materialCostChange: number;
    energySavingsAnnual: number;
    optimizationReason: string;
  };
  // PEC Compliance fields
  pecCompliance?: {
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
  // Circuit analysis
  circuitDetails?: {
    type: 'lighting' | 'receptacle' | 'motor' | 'hvac' | 'special' | 'other';
    poles: 1 | 2 | 3;
    phase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C';
    wireType: 'THHN_COPPER' | 'THWN_COPPER' | 'XHHW_COPPER' | 'THHN_ALUMINUM' | 'THWN_ALUMINUM' | 'XHHW_ALUMINUM';
    maxVoltageDropAllowed: number; // in percent
  };
  // Tracking when the load item was last updated
  lastUpdated?: number;
}

/**
 * Load schedule for electrical system
 */
export interface LoadSchedule {
  id: string;
  name: string;
  roomId?: string;
  panelName: string;
  floorName?: string;
  voltage: number;
  powerFactor: number;
  totalConnectedLoad: number;
  totalDemandLoad: number;
  current: number;
  circuitBreaker?: string;
  conductorSize?: string;
  incomingFeederSize?: string;
  feederProtectionSize?: string;
  loads: LoadItem[];
  hours?: {
    [day: string]: { start: string; end: string }[];
  };
  occupancyFactors?: {
    [hour: string]: number;
  };
  // Voltage drop calculation fields for the panel/feeder
  voltageDropPercent?: number;
  voltageDrop?: number;
  receivingEndVoltage?: number;
  isPECCompliant?: boolean;
  conductorLength?: number;
  optimalConductorSize?: string;
  phaseConfiguration?: 'single-phase' | 'three-phase';
  // Enhanced voltage drop parameters
  insulationType?: 'THHN' | 'THWN' | 'XHHW' | 'RHW' | 'USE';
  ambientTemperature?: number;
  harmonicFactor?: number;
  parallelSets?: number;
  bundleAdjustmentFactor?: number;
  diversityFactor?: number;
  demandFactor?: number;
  // Optimization parameters
  optimizationParams?: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
  };
  // PEC Compliance for panel
  panelCompliance?: {
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
    loadBalancePercentage?: number; // Phase balance for 3-phase panels
  };
  // Tracking when the load schedule was last updated
  lastUpdated?: number;
}

export interface PowerCalculationResults {
  monthlyEnergyConsumption: number; // kWh
  annualEnergyConsumption: number; // kWh
  monthlyCost: number; // PHP
  annualCost: number; // PHP
  dailyOperatingHours: number;
  peakDemand: number; // kW
  loadFactor: number; // percentage
}

/**
 * PEC Circuit Breaker and wire size options
 * Based on PEC 2017 standards
 */
export const CIRCUIT_BREAKER_OPTIONS = [
  '15A', '20A', '25A', '30A', '35A', '40A', '45A', '50A', '60A', '70A', 
  '80A', '90A', '100A', '125A', '150A', '175A', '200A', '225A', '250A',
  '300A', '350A', '400A', '450A', '500A', '600A'
];

export const CONDUCTOR_SIZE_OPTIONS = [
  '14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1 AWG',
  '1/0 AWG', '2/0 AWG', '3/0 AWG', '4/0 AWG', '250 kcmil', '300 kcmil', '350 kcmil',
  '400 kcmil', '500 kcmil', '600 kcmil', '700 kcmil', '750 kcmil'
];

export const CIRCUIT_TYPE_OPTIONS = [
  { value: 'lighting', label: 'Lighting' },
  { value: 'receptacle', label: 'Receptacle' },
  { value: 'motor', label: 'Motor' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'special', label: 'Special Purpose' },
  { value: 'other', label: 'Other' }
];

/**
 * Define the insulation type options
 */
export const INSULATION_TYPE_OPTIONS = [
  { value: 'THHN', label: 'THHN (90°C)' },
  { value: 'THWN', label: 'THWN (75°C)' },
  { value: 'XHHW', label: 'XHHW (90°C)' },
  { value: 'RHW', label: 'RHW (75°C)' },
  { value: 'USE', label: 'USE (75°C)' }
]; 