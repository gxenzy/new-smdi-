# Energy Audit Calculator Modules

## Overview

This directory contains calculator components used in the Energy Audit Platform. Each calculator is designed to perform specific energy-related calculations following relevant standards and best practices.

## Available Calculators

| Calculator | File | Description | Standard |
|------------|------|-------------|----------|
| Illumination Level Calculator | IlluminationCalculator.tsx | Calculates required illumination levels and verifies compliance with standards | PEC Rule 1075 |
| Advanced Illumination Level Calculator | IlluminationLevelCalculator.tsx | Calculates illumination levels with room reflectance and maintenance factors | PEC Rule 1075 |
| ROI Calculator | ROICalculator.tsx | Calculates return on investment for energy efficiency projects | Financial analysis standards |
| Power Factor Calculator | PowerFactorCalculator.tsx | Calculates power factor and correction requirements | PEC 2017 Section 4.30 |

## Component Structure

Each calculator follows a similar structure:

1. Input validation
2. Calculation logic
3. Results display
4. Save/load functionality
5. Standards compliance checking

## Power Factor Calculator

### Overview

The Power Factor Calculator allows users to:

- Calculate power factor based on electrical measurements
- Determine if the system complies with PEC 2017 Section 4.30 requirements
- Calculate required capacitance for power factor correction
- Estimate annual cost savings and payback period
- Generate recommendations for improving power factor
- Receive real-time guidance on input values and standards compliance

### Usage

The calculator has three tabs:

1. **Power Measurements**
   - Enter voltage, current, and active power measurements
   - Select connection type (single-phase or three-phase)
   - Choose measurement method (direct or calculated)
   - Receive guidance on typical values and standards

2. **System Information**
   - Select installation type (determines minimum power factor requirement)
   - Set target power factor (typically 0.95 or higher)
   - Enter operating hours and electricity rate for financial calculations
   - View compliance standards for different installation types

3. **Results**
   - View power factor and compliance status
   - See required capacitance for correction
   - Review financial analysis
   - Read recommendations
   - Access the Power Factor Improvement Guide with explanations of causes and solutions

### Formulas Used

```
PF = P / S = cos(φ)

Where:
PF = Power Factor
P = Active Power (W)
S = Apparent Power (VA)
φ = Phase angle between voltage and current

Qc = P × [tan(φ1) - tan(φ2)]

Where:
Qc = Reactive power required for correction (VAR)
φ1 = Original phase angle
φ2 = Target phase angle
```

### PEC 2017 Section 4.30 Compliance

The Philippine Electrical Code 2017 Section 4.30 requires a minimum power factor of:
- 0.85 for most installations (educational, commercial, office buildings)
- 0.90 for industrial buildings and hospitals

### Guidance Features

The calculator provides comprehensive guidance:
- Input validation with context-specific feedback
- Real-time standards compliance information
- Typical value ranges for electrical parameters
- Visual indicators for compliance status
- Detailed improvement recommendations
- Educational content on power factor concepts

## Illumination Level Calculator

### Overview

The Illumination Level Calculator helps users:

- Calculate required illumination levels based on room dimensions and reflectance values
- Determine the number of luminaires needed
- Verify compliance with PEC Rule 1075 standards

### Formulas Used

```
E = (Φ × n × UF × MF) / A

Where:
E = Illuminance level (lux)
Φ = Luminous flux per lamp (lumens)
n = Number of lamps
UF = Utilization factor
MF = Maintenance factor
A = Area of the working plane (m²)

Room Index (K) = (L × W) / [Hm × (L + W)]
```

## Advanced Illumination Level Calculator

### Overview

The Advanced Illumination Level Calculator provides a more detailed approach to illumination calculations by including:

- Room surface reflectance values (ceiling, walls, floor)
- Maintenance factor based on environment conditions
- Work plane height configuration
- Detailed utilization factor calculation based on room index
- PEC Rule 1075 compliance checking for various room types

### Features

- **Tab-Based Interface**:
  1. Room & Fixtures: Configure room dimensions, type, and lighting fixtures
  2. Reflectance & Materials: Set reflectance values for room surfaces
  3. Results: View calculated illuminance, compliance status, and recommendations

- **Standards Compliance**:
  - Automatically checks compliance with PEC Rule 1075 required illuminance levels
  - Provides specific recommendations based on compliance status

- **Advanced Analysis**:
  - Calculates room index (K) based on room dimensions and work plane height
  - Determines utilization factor from room index and reflectance values
  - Evaluates uniformity ratio for lighting distribution quality

- **Recommendations Engine**:
  - Provides context-specific suggestions based on calculation results
  - Offers guidance on improving illumination levels, energy efficiency, and compliance

### Room Types and Required Illuminance

The calculator includes standard illuminance requirements for various room types:

| Room Type | Required Illuminance (lux) |
|-----------|----------------------------|
| Classroom | 300 |
| Computer Laboratory | 500 |
| Science Laboratory | 500 |
| Library | 500 |
| Office (General) | 500 |
| Corridor | 100 |
| Conference Room | 300 |
| Auditorium | 200 |
| Cafeteria | 200 |
| Gymnasium | 300 |

### Integration

The calculator integrates with the platform's:
- PDF report generation system
- Calculation storage system
- Standards reference system

## ROI Calculator

The ROI Calculator helps evaluate the financial viability of energy efficiency projects by calculating:

- Simple payback period
- Return on investment
- Net present value
- Internal rate of return

## SavedCalculationsViewer Component

The `SavedCalculationsViewer` component provides a UI for:

- Viewing previously saved calculations
- Loading saved calculations back into the calculator
- Deleting saved calculations

## Storage Utilities

The `storage.ts` file contains utility functions for:

- Saving calculations to local storage
- Loading calculations from local storage
- Deleting calculations from local storage

## Testing

Tests for each component can be found in the `__tests__` directory.

## Future Development

See the implementation-progress.md file for details on upcoming calculators and features.

## Harmonic Distortion Calculator

The Harmonic Distortion Calculator is based on IEEE 519-2014 standards and provides tools to analyze voltage and current harmonic distortion in electrical systems.

### Features

- **System Parameters Input**: Configure basic electrical system parameters like voltage, current, and system type
- **Harmonic Measurements**: Input individual harmonic orders with corresponding voltage and current values
- **Standards-Based Analysis**: Automatically applies IEEE 519-2014 distortion limits based on system parameters
- **Individual Harmonic Analysis**: Calculates distortion for each harmonic order and checks compliance
- **Total Harmonic Distortion**: Calculates THD for both voltage and current
- **Recommendations**: Provides guidance on harmonic mitigation based on analysis results
- **Save/Load Functionality**: Save calculations for future reference or comparison

### IEEE 519-2014 Limits

The calculator implements the following IEEE 519-2014 harmonic distortion limits:

#### Voltage Distortion Limits

| Bus Voltage V at PCC | Individual Harmonic (%) | Total Harmonic Distortion THD (%) |
|----------------------|-------------------------|-----------------------------------|
| V ≤ 1.0 kV          | 5.0                     | 8.0                               |
| 1 kV < V ≤ 69 kV    | 3.0                     | 5.0                               |
| 69 kV < V ≤ 161 kV  | 1.5                     | 2.5                               |
| 161 kV < V          | 1.0                     | 1.5                               |

#### Current Distortion Limits

The calculator implements both general distribution systems and special applications (hospitals, airports) limits according to the short-circuit ratio.

### Implementation Details

The Harmonic Distortion Calculator is implemented as a React component with the following structure:

- Three-tab interface:
  1. System Parameters
  2. Harmonic Measurements
  3. Results

- Calculation Logic:
  - Calculates individual harmonic distortion percentages
  - Computes total harmonic distortion
  - Determines compliance with IEEE 519-2014 standards
  - Generates recommendations based on results

### Usage

1. Enter system voltage, fundamental voltage, and current parameters
2. Input short-circuit ratio and select system type
3. Add/modify harmonics measurements for relevant odd harmonics
4. Calculate results to view distortion analysis and recommendations
5. Optionally save calculations for future reference

### Future Enhancements

- Harmonic spectrum visualization
- Waveform reconstruction based on harmonic content
- Expanded recommendations for mitigation strategies
- Automatic harmonic source identification
- Integration with measurement instruments

## Other Calculators

- **Power Factor Calculator**: Based on PEC 2017 Section 4.30 for power factor analysis
- **Illumination Calculator**: For lighting design analysis and compliance
- **ROI Calculator**: For financial analysis of energy efficiency investments
- **HVAC Calculator** (Planned): For HVAC system energy analysis 