import { UnifiedCircuitData } from '../pages/Energy Audit/components/Calculators/utils/circuitDataExchange';
import { LoadSchedule, LoadItem } from '../pages/Energy Audit/components/Calculators/ScheduleOfLoads/types';

// Define conflict severity levels
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

// Define conflict types
export type ConflictType = 
  | 'voltage-drop-percent'
  | 'conductor-size'
  | 'conductor-length'
  | 'circuit-breaker'
  | 'load-value'
  | 'circuit-type'
  | 'phase-configuration'
  | 'multiple';

// Define property comparison result
export interface PropertyComparison {
  property: string;
  voltageDropValue: any;
  scheduleOfLoadsValue: any;
  displayName: string;
  unit?: string;
  conflict: boolean;
  severity: ConflictSeverity;
  recommendation?: 'voltage-drop' | 'schedule-of-loads' | 'newer';
}

// Define conflict object
export interface Conflict {
  id: string;
  circuitId: string;
  loadScheduleId?: string;
  loadItemId?: string;
  name: string;
  type: ConflictType;
  severity: ConflictSeverity;
  detectedAt: number;
  voltageDropTimestamp?: number;
  scheduleOfLoadsTimestamp?: number;
  propertyComparisons: PropertyComparison[];
  resolved: boolean;
  resolvedAt?: number;
  resolution?: 'voltage-drop' | 'schedule-of-loads' | 'manual' | 'merge';
}

/**
 * Service for detecting and resolving conflicts between Voltage Drop Calculator
 * and Schedule of Loads Calculator data
 */
class ConflictService {
  /**
   * Detect property-level conflicts between circuit data from voltage drop calculator
   * and load schedule/item data from schedule of loads
   */
  static detectPropertyConflicts(
    circuit: UnifiedCircuitData,
    loadSchedule?: LoadSchedule,
    loadItem?: LoadItem
  ): PropertyComparison[] {
    const comparisons: PropertyComparison[] = [];
    
    // Skip if there's no load schedule or item to compare with
    if (!loadSchedule && !loadItem) {
      return [];
    }
    
    // Compare voltage drop percent
    if (circuit.voltageDropPercent !== undefined && 
        ((loadSchedule?.voltageDropPercent !== undefined) || 
         (loadItem?.voltageDropPercent !== undefined))) {
      const scheduleValue = loadSchedule?.voltageDropPercent ?? loadItem?.voltageDropPercent;
      
      if (scheduleValue !== undefined) {
        const difference = Math.abs(circuit.voltageDropPercent - scheduleValue);
        const conflict = difference > 0.1; // More than 0.1% difference
        
        // Determine severity based on the difference
        let severity: ConflictSeverity = 'low';
        if (difference > 1.0) {
          severity = 'critical';
        } else if (difference > 0.5) {
          severity = 'high';
        } else if (difference > 0.2) {
          severity = 'medium';
        }
        
        comparisons.push({
          property: 'voltageDropPercent',
          voltageDropValue: circuit.voltageDropPercent,
          scheduleOfLoadsValue: scheduleValue,
          displayName: 'Voltage Drop Percentage',
          unit: '%',
          conflict,
          severity,
          recommendation: 'voltage-drop'
        });
      }
    }
    
    // Compare conductor size
    if (circuit.conductorSize && 
        ((loadSchedule?.conductorSize) || (loadItem?.conductorSize))) {
      const scheduleValue = loadSchedule?.conductorSize ?? loadItem?.conductorSize;
      
      if (scheduleValue) {
        const conflict = circuit.conductorSize !== scheduleValue;
        
        comparisons.push({
          property: 'conductorSize',
          voltageDropValue: circuit.conductorSize,
          scheduleOfLoadsValue: scheduleValue,
          displayName: 'Conductor Size',
          conflict,
          severity: conflict ? 'high' : 'low',
          recommendation: 'voltage-drop' // Prefer voltage drop calculator for conductor size
        });
      }
    }
    
    return comparisons;
  }
  
  /**
   * Create a full conflict object from property comparisons
   */
  static createConflict(
    circuit: UnifiedCircuitData,
    propertyComparisons: PropertyComparison[],
    loadScheduleId?: string,
    loadItemId?: string
  ): Conflict | null {
    // Only create a conflict if there are actual conflicts
    const conflicts = propertyComparisons.filter(comp => comp.conflict);
    if (conflicts.length === 0) {
      return null;
    }
    
    // Determine conflict type
    let type: ConflictType;
    if (conflicts.length > 1) {
      type = 'multiple';
    } else {
      const property = conflicts[0].property;
      switch (property) {
        case 'voltageDropPercent':
          type = 'voltage-drop-percent';
          break;
        case 'conductorSize':
          type = 'conductor-size';
          break;
        case 'conductorLength':
          type = 'conductor-length';
          break;
        case 'circuitBreaker':
          type = 'circuit-breaker';
          break;
        default:
          type = 'multiple';
      }
    }
    
    // Determine overall severity (highest severity of all conflicts)
    const severities = conflicts.map(conflict => conflict.severity);
    const severity = this.getHighestSeverity(severities);
    
    // Create conflict object
    return {
      id: `conflict-${Date.now()}-${circuit.id}`,
      circuitId: circuit.id,
      loadScheduleId,
      loadItemId,
      name: `${circuit.name} Conflict`,
      type,
      severity,
      detectedAt: Date.now(),
      voltageDropTimestamp: circuit.timestamp,
      scheduleOfLoadsTimestamp: Date.now() - 3600000,
      propertyComparisons,
      resolved: false
    };
  }
  
  /**
   * Get highest severity from a list of severities
   */
  private static getHighestSeverity(severities: ConflictSeverity[]): ConflictSeverity {
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }
  
  /**
   * Determine if an object has a specific property
   */
  private static hasProperty(obj: any, property: string): boolean {
    return obj && typeof obj === 'object' && property in obj;
  }
}

export default ConflictService; 