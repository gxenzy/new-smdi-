/**
 * Voltage Drop Calculator Templates
 * 
 * This module provides predefined templates for common circuit scenarios to help
 * users quickly set up calculations without entering all parameters manually.
 */

import { VoltageDropInputs, CircuitType } from './voltageDropUtils';

/**
 * Template interface for voltage drop calculations
 */
export interface VoltageDropTemplate {
  id: string;
  name: string;
  description: string;
  inputs: Partial<VoltageDropInputs>;
}

/**
 * Templates categorized by circuit type
 */
export const VOLTAGE_DROP_TEMPLATES: Record<CircuitType, VoltageDropTemplate[]> = {
  'branch': [
    {
      id: 'residential-lighting',
      name: 'Residential Lighting Circuit',
      description: '15A lighting branch circuit in residential setting',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 12,
        conductorLength: 30,
        conductorSize: '14 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.9,
        circuitConfiguration: {
          circuitType: 'branch',
          distanceToFurthestOutlet: 25,
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'residential-receptacles',
      name: 'Receptacle Circuit',
      description: '20A receptacle branch circuit',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 16,
        conductorLength: 35,
        conductorSize: '12 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'branch',
          distanceToFurthestOutlet: 30,
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'commercial-lighting',
      name: 'Commercial Lighting Circuit',
      description: 'LED lighting circuit for commercial space',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 15,
        conductorLength: 50,
        conductorSize: '12 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 35,
        powerFactor: 0.95,
        circuitConfiguration: {
          circuitType: 'branch',
          distanceToFurthestOutlet: 45,
          wireway: 'conduit'
        }
      }
    }
  ],
  'feeder': [
    {
      id: 'residential-panel',
      name: 'Residential Panel Feeder',
      description: '100A main panel feeder for residential',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 80,
        conductorLength: 15,
        conductorSize: '2 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'feeder',
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'commercial-subpanel',
      name: 'Commercial Subpanel',
      description: '200A subpanel feeder for commercial building',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 150,
        conductorLength: 40,
        conductorSize: '2/0 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 35,
        powerFactor: 0.9,
        circuitConfiguration: {
          circuitType: 'feeder',
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'industrial-subpanel',
      name: 'Industrial Distribution Panel',
      description: '400A distribution panel for industrial facility',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 320,
        conductorLength: 75,
        conductorSize: '350 MCM',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 40,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'feeder',
          wireway: 'conduit'
        }
      }
    }
  ],
  'service': [
    {
      id: 'residential-service',
      name: 'Residential Service Entrance',
      description: '100A residential service entrance',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 85,
        conductorLength: 10,
        conductorSize: '3 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'service',
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'commercial-service',
      name: 'Commercial Service Entrance',
      description: '400A commercial service entrance',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 350,
        conductorLength: 25,
        conductorSize: '400 MCM',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 35,
        powerFactor: 0.9,
        circuitConfiguration: {
          circuitType: 'service',
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'industrial-service',
      name: 'Industrial Service Entrance',
      description: '800A industrial service entrance',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 675,
        conductorLength: 30,
        conductorSize: '750 MCM',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 40,
        powerFactor: 0.87,
        circuitConfiguration: {
          circuitType: 'service',
          wireway: 'conduit'
        }
      }
    }
  ],
  'motor': [
    {
      id: 'small-motor',
      name: 'Small Motor Circuit',
      description: '5HP single-phase motor circuit',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 28,
        conductorLength: 25,
        conductorSize: '10 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'motor',
          startingCurrentMultiplier: 6,
          serviceFactor: 1.15,
          hasVFD: false,
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'medium-motor',
      name: 'Medium Motor Circuit',
      description: '15HP three-phase motor circuit',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 21,
        conductorLength: 35,
        conductorSize: '8 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 35,
        powerFactor: 0.87,
        circuitConfiguration: {
          circuitType: 'motor',
          startingCurrentMultiplier: 5.5,
          serviceFactor: 1.15,
          hasVFD: false,
          wireway: 'conduit'
        }
      }
    },
    {
      id: 'large-motor-vfd',
      name: 'Large Motor with VFD',
      description: '50HP three-phase motor with VFD circuit',
      inputs: {
        systemVoltage: 400,
        loadCurrent: 65,
        conductorLength: 50,
        conductorSize: '6 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'three-phase',
        temperature: 40,
        powerFactor: 0.92,
        circuitConfiguration: {
          circuitType: 'motor',
          startingCurrentMultiplier: 2.5, // Lower with VFD
          serviceFactor: 1.15,
          hasVFD: true,
          wireway: 'conduit'
        }
      }
    }
  ]
};

/**
 * Finds a template by its ID
 * 
 * @param templateId Template ID to find
 * @returns Template object or undefined if not found
 */
export function findTemplateById(templateId: string): VoltageDropTemplate | undefined {
  for (const circuitType in VOLTAGE_DROP_TEMPLATES) {
    const templates = VOLTAGE_DROP_TEMPLATES[circuitType as CircuitType];
    const template = templates.find(t => t.id === templateId);
    if (template) {
      return template;
    }
  }
  return undefined;
}

/**
 * Gets all templates as a flat array
 * 
 * @returns Array of all templates
 */
export function getAllTemplates(): VoltageDropTemplate[] {
  return Object.values(VOLTAGE_DROP_TEMPLATES).flat();
}

/**
 * Gets templates for a specific circuit type
 * 
 * @param circuitType Circuit type to get templates for
 * @returns Array of templates for the given circuit type
 */
export function getTemplatesForCircuitType(circuitType: CircuitType): VoltageDropTemplate[] {
  return VOLTAGE_DROP_TEMPLATES[circuitType] || [];
} 