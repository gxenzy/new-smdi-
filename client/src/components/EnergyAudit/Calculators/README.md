# Energy Audit Calculators

This directory contains calculator components used in the Energy Audit Platform to perform various energy-related calculations, compliance checks, and analysis.

## Lighting Power Density (LPD) Calculator

### Overview

The Lighting Power Density Calculator is a comprehensive tool that helps users analyze lighting systems for energy efficiency and compliance with the Philippine Electrical Code (PEC) 2017 standards. It calculates the lighting power density (W/m²) based on room dimensions and fixture configurations, then compares the results against the standards for the selected building type.

### Features

- **Room Configuration**: Input room name, area, and building type
- **Fixture Management**: Add, configure, and remove lighting fixtures with detailed parameters
- **Building Presets**: Select from predefined building configurations to quickly set up calculations
- **Compliance Checking**: Verify if the lighting design meets PEC 2017 standards
- **Energy Savings Analysis**: Calculate potential energy and cost savings with configurable parameters
- **Recommendations**: Receive tailored suggestions based on calculation results
- **PDF Export**: Generate and download detailed PDF reports of calculation results
- **PDF Preview**: View PDF reports before downloading
- **Responsive UI**: Well-designed interface that works across different screen sizes

### Implementation Details

#### Components

- `LightingPowerDensityCalculator.tsx`: Main component that renders the calculator interface
- `utils/lightingPowerDensityUtils.ts`: Utility functions for LPD calculations
- `utils/pdfExport.ts`: PDF generation utilities
- `utils/standards.ts`: Standards data and API integration
- `utils/storage.ts`: Local storage for saving calculation results

#### Core Calculation Logic

The calculator uses the following formula to determine lighting power density:

```
LPD (W/m²) = Total Lighting Power (W) / Room Area (m²)
```

Where:
- Total Lighting Power = Sum of (Fixture Wattage × Ballast Factor × Quantity) for all fixtures

#### Energy Savings Calculation

When the energy savings feature is enabled, the calculator estimates:

1. Power savings when reducing lighting to meet standard requirements
2. Annual energy consumption based on operating hours
3. Annual cost savings based on electricity rates
4. Payback period for fixture upgrades

#### PDF Export

The PDF reports include:
- Room information and configuration
- Detailed fixtures list with specifications
- Calculation results and compliance status
- Recommendations for improvement
- Energy savings analysis (when enabled)

### Usage Example

```tsx
import React from 'react';
import { LightingPowerDensityCalculator } from './components/EnergyAudit/Calculators';

const CalculatorPage = () => {
  return (
    <div>
      <h1>Energy Audit Tools</h1>
      <LightingPowerDensityCalculator />
    </div>
  );
};

export default CalculatorPage;
```

### Integration with Workflow

The calculator integrates with the Energy Audit Workflow through:

1. Direct navigation from related tasks
2. Saved calculations that can be referenced in audit reports
3. PDF exports that can be attached to audit documentation

### Future Enhancements

- Comparison view for multiple lighting designs
- Real-time collaboration features
- Advanced visualization features (3D room visualization)
- Batch calculation for multiple rooms
- Performance optimizations for large calculations

## Other Calculators

The directory also contains several other calculators:

- **Energy Calculator**: Analyze overall energy consumption and costs
- **Power Factor Calculator**: Calculate power factor and correction requirements
- **Harmonic Distortion Calculator**: Analyze harmonic distortion in electrical systems
- **Voltage Regulation Calculator**: Calculate voltage drop and regulation in circuits
- **Illumination Calculator**: Design lighting systems based on illumination requirements
- **ROI Calculator**: Calculate return on investment for energy upgrades 