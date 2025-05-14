# Enhanced Voltage Drop Analysis

## Overview

The Enhanced Voltage Drop Analysis module provides comprehensive voltage drop calculations and visualization for electrical circuits in the Energy Audit Platform. This module extends the base voltage drop calculator with advanced features such as temperature derating, harmonic analysis, parallel conductor calculations, and dynamic recalculation.

## Key Features

### Enhanced Calculation Engine

- **Temperature Derating**: Automatic adjustment of conductor resistance based on insulation type and ambient temperature
- **Harmonic Analysis**: Support for non-linear loads with harmonic content
- **Parallel Conductors**: Calculation support for multiple parallel conductor sets
- **Bundle Adjustment**: Ampacity and voltage drop correction for bundled conductors
- **Real-time Recalculation**: Automatic recalculation when circuit parameters change

### Visualization Components

- **Voltage Profile**: Visualization of voltage levels along the conductor length
- **Conductor Comparison**: Interactive comparison of different conductor sizes
- **Circuit Diagram**: Visual representation of voltage drop in the circuit
- **Compliance Indicators**: Visual indicators for PEC 2017 compliance status

### Integration Features

- **Schedule of Loads Integration**: Seamless integration with the Schedule of Loads calculator
- **Enhanced PDF Exports**: Comprehensive PDF reports with visualizations
- **Batch Analysis**: Support for analyzing multiple circuits simultaneously
- **Circuit Insights Dashboard**: Dashboard for voltage drop analysis across panels

## Module Structure

```
utils/
  ├── enhancedVoltageDropUtils.ts     # Core calculation utilities
  ├── voltageDropCaching.ts           # Calculation caching system
  ├── voltageDropRecalculator.ts      # Automatic recalculation engine
  ├── circuitChangeTracker.ts         # Circuit property change detection
  ├── enhancedVoltageDropPdfExport.ts # PDF export utilities
  └── circuitDataExchange.ts          # Data exchange between calculators

ScheduleOfLoads/
  ├── EnhancedVoltageDropAnalysisDialog.tsx    # Main analysis dialog
  ├── RecalculationStatusIndicator.tsx         # UI for recalculation status
  └── CircuitInsightsDashboardDialog.tsx       # Insights dashboard integration

CircuitInsightsDashboard.tsx         # Dashboard for circuit analysis
```

## Technical Details

### PEC 2017 Compliance

The Enhanced Voltage Drop Analysis enforces compliance with the Philippine Electrical Code (PEC) 2017, specifically:

- Section 2.30.1: Maximum voltage drop limits
  - 3% for branch circuits
  - 2% for feeder circuits
  - 5% total from service entrance to the farthest outlet

### Calculation Methods

The voltage drop calculation incorporates:

1. **DC Resistance Calculation**:
   - Based on conductor material, size, and temperature

2. **AC Impedance Calculation**:
   - Includes both resistive and reactive components
   - Accounts for conduit material and phase configuration

3. **Temperature Correction**:
   - Uses insulation temperature ratings (THHN, THWN, XHHW, RHW, USE)
   - Applies temperature correction factors based on ambient temperature

4. **Circuit-Specific Parameters**:
   - Special handling for branch, feeder, service, and motor circuits
   - Support for VFD-driven motor circuits

### Performance Optimizations

- **Calculation Caching**: Prevents redundant calculations for unchanged parameters
- **Throttled Recalculation**: Prevents excessive recalculations during rapid parameter changes
- **Batch Processing**: Efficient processing of multiple circuits

## Usage Example

```typescript
// Create enhanced voltage drop inputs
const inputs: EnhancedVoltageDropInputs = {
  // Standard voltage drop parameters
  systemVoltage: 230,
  loadCurrent: 15,
  conductorLength: 30,
  conductorSize: '12 AWG',
  conductorMaterial: 'copper',
  conduitMaterial: 'PVC',
  phaseConfiguration: 'single-phase',
  circuitConfiguration: { circuitType: 'branch' },
  
  // Enhanced parameters
  insulationType: 'THHN',
  ambientTemperature: 35,
  harmonicFactor: 1.0,
  parallelSets: 1,
  bundleAdjustmentFactor: 1.0
};

// Calculate voltage drop
const results = calculateEnhancedVoltageDropResults(inputs);

// Export to PDF
const pdf = await exportEnhancedVoltageDropToPdf(inputs, results);
pdf.save('voltage-drop-report.pdf');
```

## Future Enhancements

- Worker threads for background calculations
- Mobile-optimized interface
- Integration with energy monitoring systems
- Support for unbalanced three-phase systems
- Machine learning-based optimization recommendations

## References

- Philippine Electrical Code (PEC) 2017
- IEEE Std 141-1993 (Red Book)
- NFPA 70 (National Electrical Code) 