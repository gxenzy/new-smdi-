# Voltage Drop Calculation Enhancement Plan

## Overview
The goal of this enhancement is to improve the accuracy and flexibility of voltage drop calculations in the Schedule of Loads Calculator by incorporating more detailed conductor properties, temperature effects, and specialized calculations for different circuit types.

## Current Implementation
The current voltage drop calculation in `voltageDropUtils.ts` provides:
- Basic voltage drop calculation based on resistivity and reactance
- Circuit type-specific voltage drop limits
- Ampacity rating checks
- Conductor size recommendations
- Caching for efficient computation

## Enhancement Areas

### 1. Enhanced Conductor Property Integration
- Update voltage drop calculations to use specific properties from the circuit details
- Add temperature derating based on conductor insulation type
- Incorporate ambient temperature adjustments for different installation environments
- Add support for parallel conductors and bundled cables

### 2. Circuit Type Specific Calculations
- Implement specialized calculations for branch circuits with consideration for distance to furthest outlet
- Create enhanced motor circuit calculations with starting current and service factor considerations
- Add feeder circuit calculations with diversity factors
- Implement service entrance calculations with demand factors

### 3. Insulation Type Integration
- Add support for different insulation types (THHN, THWN, XHHW, etc.)
- Implement temperature ratings based on insulation type
- Add insulation-specific ampacity tables

### 4. Harmonic Considerations
- Add harmonic current effects on voltage drop calculations
- Implement harmonic derating factors for neutral conductors
- Add triplen harmonic impact analysis

## Implementation Steps

### Step 1: Enhance VoltageDropInputs Interface
Add the following to the VoltageDropInputs interface:
```typescript
export interface VoltageDropInputs {
  // Existing properties...
  
  // New properties
  insulationType?: 'THHN' | 'THWN' | 'XHHW' | 'RHW' | 'USE';
  ambientTemperatureAdjustment?: number;
  harmonicFactor?: number;
  parallelSets?: number;
  bundleAdjustmentFactor?: number;
  distanceToFurthestOutlet?: number; // For branch circuits
  startingCurrentMultiplier?: number; // For motor circuits
  diversityFactor?: number; // For feeder circuits
  demandFactor?: number; // For service entrance
}
```

### Step 2: Update Ampacity Tables with Insulation Types
Create more comprehensive ampacity tables with insulation type as a factor:
```typescript
export const AMPACITY_TABLES: {
  [insulationType: string]: {
    [material: string]: {
      [size: string]: number
    }
  }
} = {
  'THHN': {
    'copper': {
      '14 AWG': 20,
      // Additional sizes...
    },
    'aluminum': {
      // Aluminum sizes...
    }
  },
  'THWN': {
    // THWN values...
  },
  // Additional insulation types...
};
```

### Step 3: Implement Temperature Derating
Add function to calculate temperature derating:
```typescript
function calculateTemperatureDerating(
  baseAmpacity: number,
  insulationType: string,
  ambientTemperature: number
): number {
  const temperatureRating = INSULATION_TEMP_RATINGS[insulationType] || 75;
  const derationFactor = TEMPERATURE_CORRECTION_FACTORS[temperatureRating][ambientTemperature] || 1.0;
  return baseAmpacity * derationFactor;
}
```

### Step 4: Update Voltage Drop Calculation
Enhance the voltage drop calculation to include all new factors:
```typescript
export function calculateEnhancedVoltageDrop(inputs: VoltageDropInputs): number {
  // Extract all inputs including new properties
  
  // Calculate base voltage drop
  
  // Apply corrections for:
  // - Harmonics
  // - Parallel conductors
  // - Bundling
  // - Circuit type specific factors
  
  // Return the enhanced voltage drop
}
```

### Step 5: Implement Circuit Type Specific Calculations
Create specialized calculation functions for each circuit type:
```typescript
function calculateBranchCircuitVoltageDrop(inputs: VoltageDropInputs): number {
  // Specialized calculation for branch circuits
}

function calculateMotorCircuitVoltageDrop(inputs: VoltageDropInputs): number {
  // Specialized calculation for motor circuits with starting current
}

function calculateFeederCircuitVoltageDrop(inputs: VoltageDropInputs): number {
  // Specialized calculation for feeder circuits with diversity
}

function calculateServiceCircuitVoltageDrop(inputs: VoltageDropInputs): number {
  // Specialized calculation for service circuits with demand factors
}
```

### Step 6: Update Recommendation System
Enhance the recommendation system to provide more specific guidance:
```typescript
function generateEnhancedRecommendations(
  inputs: VoltageDropInputs,
  results: VoltageDropResult
): string[] {
  // Generate basic recommendations
  
  // Add circuit-type specific recommendations
  
  // Add insulation type recommendations
  
  // Add harmonic mitigation recommendations if needed
  
  // Return comprehensive recommendations
}
```

## Integration with UI

1. Update `VoltageDropAnalysisDialog.tsx` to include new input fields:
   - Add insulation type dropdown
   - Add ambient temperature adjustment
   - Add harmonic factor input
   - Add circuit-specific inputs based on selected circuit type

2. Enhance results display to show:
   - More detailed voltage drop breakdown
   - Temperature derating information
   - Harmonic impact if present
   - Circuit-specific insights

3. Update visualization to show:
   - Voltage drop profile with all factors considered
   - Comparison with and without harmonic effects
   - Temperature impact visualization

## Testing Plan

1. Test with various conductor sizes and circuit configurations
2. Validate calculations against PEC 2017 examples
3. Compare with manual calculations for specific use cases
4. Test edge cases (very long distances, high currents, etc.)
5. Performance testing for large panel schedules

## Documentation Updates

1. Update code comments to explain new calculation factors
2. Add reference to PEC 2017 sections for each calculation
3. Create educational content about voltage drop factors
4. Update user guide with information about enhanced calculations

## Deliverables

1. Enhanced voltageDropUtils.ts with comprehensive calculation capabilities
2. Updated VoltageDropAnalysisDialog with new input options
3. Improved visualization component
4. Integration with Schedule of Loads Calculator for automatic recalculation 