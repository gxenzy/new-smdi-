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
  // Optimization metadata
  optimizationMetadata?: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    materialCostChange: number;
    energySavingsAnnual: number;
    optimizationReason: string;
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
  // Optimization parameters
  optimizationParams?: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
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