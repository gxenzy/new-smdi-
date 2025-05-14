# Voltage Drop Calculator Documentation

## Overview

The Voltage Drop Calculator is a specialized tool for performing voltage drop calculations for different types of electrical circuits according to the Philippine Electrical Code (PEC) 2017 Section 2.30. The calculator provides circuit-specific calculations for branch circuits, feeders, service entrances, and motor circuits.

## Key Features

1. **Circuit Type Specialization**
   - Branch circuit calculations with distance-to-outlet considerations
   - Feeder circuit calculations with appropriate voltage drop limits
   - Service entrance calculations with proper sizing requirements
   - Motor circuit calculations with starting current and service factor considerations

2. **Comprehensive Compliance Checking**
   - Verification against PEC 2017 Section 2.30 voltage drop limits
   - Ampacity validation according to PEC 2017 requirements
   - Combined compliance checking for both voltage drop and ampacity

3. **Intelligent Conductor Sizing**
   - Finds minimum conductor size for voltage drop compliance
   - Determines optimal conductor size based on both voltage drop and ampacity
   - Provides recommendations for more efficient conductor selection

4. **Detailed Results Analysis**
   - Voltage drop percentage and absolute value calculation
   - Receiving end voltage determination
   - Power loss analysis (resistive, reactive, total)
   - Compliance status reporting with PEC 2017 standards

## Technical Implementation

### Data Models

The calculator uses the following key data models:

- **VoltageDropInputs**: Contains all input parameters for calculation
  - circuitConfiguration: Circuit-specific parameters
  - systemVoltage: System voltage (V)
  - loadCurrent: Load current (A)
  - conductorLength: Length of conductor (m)
  - conductorSize: AWG or MCM size
  - conductorMaterial: 'copper' or 'aluminum'
  - conduitMaterial: 'PVC', 'steel', or 'aluminum'
  - phaseConfiguration: 'single-phase' or 'three-phase'
  - temperature: Ambient temperature (°C)
  - powerFactor: Power factor (0-1)

- **CircuitConfiguration**: Circuit-specific parameters
  - circuitType: 'branch', 'feeder', 'service', or 'motor'
  - distanceToFurthestOutlet: For branch circuits (m)
  - startingCurrentMultiplier: For motor circuits (typically 1.25)
  - serviceFactor: For motor circuits
  - wireway: 'conduit', 'cable', or 'raceway'
  - hasVFD: For motor circuits with Variable Frequency Drive

- **VoltageDropResult**: Calculation results
  - voltageDropPercent: Percentage voltage drop
  - voltageDrop: Absolute voltage drop (V)
  - receivingEndVoltage: Voltage at the end of the circuit (V)
  - resistiveLoss: Resistive power loss (W)
  - reactiveLoss: Reactive power loss (VAR)
  - totalLoss: Total power loss (VA)
  - compliance: 'compliant' or 'non-compliant'
  - maxAllowedDrop: Maximum allowed voltage drop for this circuit type
  - recommendations: Array of recommendation strings
  - wireRating: Ampacity rating and adequacy status

### Calculation Methods

The calculator implements the following key calculation methods:

1. **calculateVoltageDropResults**: Main calculation function that produces comprehensive results
2. **calculateVoltageDrop**: Calculates absolute voltage drop in volts
3. **calculateVoltageDropPercentage**: Calculates voltage drop as a percentage
4. **calculatePowerLoss**: Calculates power losses in the circuit
5. **calculateAmpacityRating**: Determines wire ampacity rating and adequacy
6. **findMinimumConductorSize**: Finds minimum conductor size for voltage drop compliance
7. **findOptimalConductorSize**: Finds optimal conductor size based on both voltage drop and ampacity

### PEC 2017 Compliance

The calculator enforces the following PEC 2017 Section 2.30 requirements:

- Branch circuits: Maximum 3% voltage drop
- Feeders: Maximum 2% voltage drop
- Combined (service to outlet): Maximum 5% total voltage drop
- Motor circuits: Special considerations for starting current

## User Guide

### Basic Usage

1. Select the circuit type (branch, feeder, service, or motor)
2. Enter circuit-specific configuration parameters
3. Enter electrical parameters (voltage, current, length, etc.)
4. Select conductor properties (size, material, etc.)
5. Click "Calculate" to perform the calculation
6. View results including compliance status and recommendations
7. Save results for future reference

### Advanced Features

1. **Conductor Size Optimization**:
   - The calculator will suggest the optimal conductor size to meet both voltage drop and ampacity requirements
   - Compare different conductor sizes to find the most cost-effective solution

2. **Circuit Type Specialization**:
   - For branch circuits: Enter the distance to the furthest outlet for accurate calculations
   - For motor circuits: Configure starting current multiplier and service factor
   - For circuits with VFDs: Enable the VFD option for special considerations

3. **Results Analysis**:
   - Review detailed power loss analysis
   - See compliance status against PEC 2017 standards
   - Read specific recommendations for improvement

## Integration with Other Components

The Voltage Drop Calculator integrates with the following system components:

1. **SavedCalculationsViewer**: For storing and retrieving calculation results
2. **ComplianceVerification**: For standards compliance checking
3. **PDF Export**: For creating detailed reports
4. **Chart Visualization**: For graphical representation of results

## Technical Standards Reference

The calculator implements calculations according to:

1. **PEC 2017 Section 2.30**: Voltage drop requirements
2. **PEC 2017 Table 2.5**: Ampacity ratings for conductors
3. **PEC 2017 Article 3.4**: Special requirements for motor circuits

## Future Enhancements

1. **Visualization**:
   - Voltage drop profile along conductor length
   - Conductor size comparison visualization
   - Circuit diagrams with voltage drop indicators

2. **Circuit Type Specialization**:
   - Detailed motor starting analysis
   - Unbalanced three-phase calculations
   - VFD-specific calculations

3. **Integration**:
   - Connection with Schedule of Loads calculator
   - Integration with Building Visualization module
   - Export to electrical design software formats

4. **Economic Analysis**:
   - Conductor sizing optimization for cost
   - Energy loss calculations over time
   - Lifecycle cost analysis 