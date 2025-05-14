import { UnifiedCircuitData } from './CircuitSynchronization';
import { VoltageDropCalculationResult } from './voltageDropRecalculator';

/**
 * Interface for a component in the circuit diagram
 */
export interface CircuitComponent {
  id: string;
  type: 'source' | 'conductor' | 'load' | 'junction' | 'device';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  voltage?: number;
  current?: number;
  powerLoss?: number;
  isCompliant?: boolean;
}

/**
 * Interface for a connection between components in the circuit diagram
 */
export interface CircuitConnection {
  from: string;
  to: string;
  path?: { x: number; y: number }[];
}

/**
 * Interface for the complete circuit diagram data
 */
export interface CircuitDiagramData {
  components: CircuitComponent[];
  connections: CircuitConnection[];
}

/**
 * Interface for voltage profile data points
 */
export interface VoltageProfilePoint {
  distance: number;
  voltage: number;
  isCompliant: boolean;
}

/**
 * Calculate voltage at specific points along a conductor
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param numberOfPoints Number of points to calculate
 * @returns Array of objects with distance, voltage, and compliance status
 */
export function calculateVoltageAtPoints(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number = 10
): VoltageProfilePoint[] {
  const supplyVoltage = circuitData.voltage || 230;
  const conductorLength = circuitData.conductorLength || 10;
  const voltageDrop = voltageDropResult.voltageDrop;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  
  // Calculate maximum allowed voltage drop as absolute value
  const maxVoltageDrop = (maxAllowedDrop / 100) * supplyVoltage;
  const minimumAllowedVoltage = supplyVoltage - maxVoltageDrop;
  
  // Generate data points along the conductor length
  const data: VoltageProfilePoint[] = [];
  
  for (let i = 0; i <= numberOfPoints; i++) {
    const distanceRatio = i / numberOfPoints;
    const distance = distanceRatio * conductorLength;
    
    // Calculate voltage at this point (assuming linear voltage drop)
    const voltageAtPoint = supplyVoltage - (voltageDrop * distanceRatio);
    
    // Check if voltage is compliant at this point
    const isCompliant = voltageAtPoint >= minimumAllowedVoltage;
    
    data.push({
      distance,
      voltage: voltageAtPoint,
      isCompliant
    });
  }
  
  return data;
}

/**
 * Generate circuit diagram data based on circuit data and voltage drop results
 * 
 * @param circuitData Circuit data including properties like conductor size, length, etc.
 * @param voltageDropResult Results of voltage drop calculation
 * @returns Circuit diagram data structure for rendering
 */
export function generateCircuitDiagram(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult
): CircuitDiagramData {
  // Base parameters
  const sourceHeight = 60;
  const sourceWidth = 60;
  const conductorHeight = 20;
  const loadHeight = 80;
  const loadWidth = 80;
  const conductorLength = 500; // Default length for visualization
  
  // Calculate voltage at different points
  const numberOfPoints = Math.min(10, Math.max(5, Math.floor(circuitData.conductorLength || 10) / 10));
  const voltagePoints = calculateVoltagePointsAlongConductor(circuitData, voltageDropResult, numberOfPoints);
  
  // Generate component IDs
  const sourceId = `source-${circuitData.id}`;
  const conductorId = `conductor-${circuitData.id}`;
  const loadId = `load-${circuitData.id}`;
  
  // Create components
  const components: CircuitComponent[] = [];
  
  // Source component
  components.push({
    id: sourceId,
    type: 'source',
    position: { x: 50, y: 100 },
    size: { width: sourceWidth, height: sourceHeight },
    properties: {
      voltage: circuitData.voltage,
      description: 'Power Source'
    },
    voltage: circuitData.voltage
  });
  
  // Conductor component
  components.push({
    id: conductorId,
    type: 'conductor',
    position: { x: 50 + sourceWidth, y: 100 + (sourceHeight - conductorHeight) / 2 },
    size: { width: conductorLength, height: conductorHeight },
    properties: {
      size: circuitData.conductorSize,
      material: circuitData.conductorMaterial,
      length: circuitData.conductorLength,
      description: `${circuitData.conductorSize} ${circuitData.conductorMaterial} conductor`
    },
    voltage: voltageDropResult.receivingEndVoltage,
    current: circuitData.current,
    powerLoss: voltageDropResult.resistiveLoss,
    isCompliant: voltageDropResult.compliance === 'compliant'
  });
  
  // Load component
  components.push({
    id: loadId,
    type: 'load',
    position: { 
      x: 50 + sourceWidth + conductorLength, 
      y: 100 + (sourceHeight - loadHeight) / 2 
    },
    size: { width: loadWidth, height: loadHeight },
    properties: {
      description: circuitData.description || 'Load',
      current: circuitData.current
    },
    voltage: voltageDropResult.receivingEndVoltage,
    current: circuitData.current,
    isCompliant: voltageDropResult.compliance === 'compliant'
  });
  
  // Add voltage indicator components at key points along the conductor
  voltagePoints.forEach((point, index) => {
    if (index === 0 || index === voltagePoints.length - 1) {
      // Skip endpoints as they already have indicators (source and load)
      return;
    }
    
    const x = 50 + sourceWidth + (conductorLength * (index / (voltagePoints.length - 1)));
    components.push({
      id: `voltage-point-${index}`,
      type: 'junction',
      position: { x: x - 5, y: 100 + (sourceHeight - conductorHeight) / 2 - 10 },
      size: { width: 10, height: 10 },
      properties: {
        description: `Voltage Point ${index}`
      },
      voltage: point.voltage,
      isCompliant: point.isCompliant
    });
  });
  
  // Create connections
  const connections: CircuitConnection[] = [
    {
      from: sourceId,
      to: conductorId
    },
    {
      from: conductorId,
      to: loadId
    }
  ];
  
  return {
    components,
    connections
  };
}

/**
 * Calculate voltage at specific points along the conductor
 * 
 * @param circuitData Circuit data
 * @param voltageDropResult Voltage drop calculation result
 * @param numberOfPoints Number of points to calculate
 * @returns Array of voltage points with distance, voltage and compliance status
 */
export function calculateVoltagePointsAlongConductor(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number = 10
): { distance: number; voltage: number; isCompliant: boolean }[] {
  return calculateVoltageAtPoints(circuitData, voltageDropResult, numberOfPoints);
}

/**
 * Generate animation frames for current flow visualization
 * 
 * @param circuitDiagramData Base circuit diagram data
 * @param framesPerSecond Frames per second for animation
 * @param duration Duration of one complete cycle in seconds
 * @returns Array of circuit diagram data for each animation frame
 */
export function generateCurrentFlowAnimation(
  circuitDiagramData: CircuitDiagramData,
  framesPerSecond: number = 30,
  duration: number = 3
): CircuitDiagramData[] {
  const totalFrames = framesPerSecond * duration;
  const animationFrames: CircuitDiagramData[] = [];
  
  // Generate frames by updating component positions
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    // Create a deep copy of the diagram data
    const frameDiagram: CircuitDiagramData = JSON.parse(JSON.stringify(circuitDiagramData));
    
    // Update component properties to reflect animation state
    // For example, we could add animation markers or shift component properties
    
    animationFrames.push(frameDiagram);
  }
  
  return animationFrames;
}

/**
 * Find components in the diagram by criteria
 * 
 * @param circuitDiagramData Circuit diagram data
 * @param criteria Search criteria (type, property name, property value)
 * @returns Filtered components matching the criteria
 */
export function findComponents(
  circuitDiagramData: CircuitDiagramData,
  criteria: { type?: string; propertyName?: string; propertyValue?: any }
): CircuitComponent[] {
  if (!circuitDiagramData || !circuitDiagramData.components) {
    return [];
  }
  
  return circuitDiagramData.components.filter(component => {
    // Match by type if specified
    if (criteria.type && component.type !== criteria.type) {
      return false;
    }
    
    // Match by property name and value if specified
    if (criteria.propertyName && criteria.propertyValue !== undefined) {
      if (!component.properties[criteria.propertyName]) {
        return false;
      }
      
      return component.properties[criteria.propertyName] === criteria.propertyValue;
    }
    
    return true;
  });
}

/**
 * Calculate the compliance status of a component based on voltage
 * 
 * @param voltage Voltage at the component
 * @param supplyVoltage Supply voltage
 * @param maxAllowedDropPercent Maximum allowed voltage drop percentage
 * @returns Whether the component is compliant
 */
export function isComponentCompliant(
  voltage: number,
  supplyVoltage: number,
  maxAllowedDropPercent: number
): boolean {
  const maxAllowedDropVolts = (maxAllowedDropPercent / 100) * supplyVoltage;
  const minimumAllowedVoltage = supplyVoltage - maxAllowedDropVolts;
  
  return voltage >= minimumAllowedVoltage;
} 