# Calculator Module TODO List

## Completed Tasks

- ✅ Implemented IlluminationCalculator component
- ✅ Implemented ROICalculator component 
- ✅ Created SavedCalculationsViewer component for managing saved calculations
- ✅ Added storage utility functions for calculation persistence
- ✅ Implemented PowerFactorCalculator component including:
  - ✅ Power measurement inputs
  - ✅ System information inputs
  - ✅ Results display with compliance status
  - ✅ Financial analysis and recommendations
  - ✅ Integration with SavedCalculationsViewer
  - ✅ Unit tests
  - ✅ Comprehensive input guidance and standards information
  - ✅ Power Factor Improvement Guide with educational content
  - ✅ Enhanced validation with context-specific feedback
- ✅ Created HarmonicDistortionCalculator skeleton:
  - ✅ Basic UI structure with tabs
  - ✅ Data models for inputs and results
  - ✅ IEEE 519-2014 standards references
  - ✅ Integration with Calculators.tsx

## Current Tasks

### Harmonic Distortion Calculator Implementation (In Progress)
1. Implement system parameters input interface
2. Implement harmonic measurements input interface
3. Implement THD calculation formulas
4. Add IEEE 519-2014 compliance checks
5. Implement harmonic spectrum visualization
6. Create guidance components and validation
7. Add recommendations engine for mitigation strategies
8. Add save/load functionality

## Next Tasks

### High Priority
1. Complete the Harmonic Distortion Calculator implementation
2. Enhance the Lighting Power Density Calculator with PEC 2017 compliance checks
3. Add printable report generation for calculations
4. Implement data export functionality (CSV, PDF)

### Medium Priority
1. Create the Voltage Regulation Calculator (PEC 2017 2.30)
2. Integrate calculators with building visualization module
3. Add data visualization for results (charts, graphs)
4. Add batch calculation support for multiple scenarios

### Low Priority
1. Implement calculation result sharing functionality
2. Add comparative analysis between different equipment options
3. Create a central dashboard for all calculation results
4. Add multi-language support for calculator interfaces

## Technical Improvements
1. Standardize the calculator interfaces for consistent user experience
2. Implement comprehensive unit tests for calculation accuracy
3. Improve error handling and validation across all calculators
4. Optimize performance for large calculations
5. Add accessibility features (ARIA attributes, keyboard navigation)

## Documentation
1. Add JSDoc comments to all components and functions
2. Create usage examples for each calculator
3. Document the calculation methodologies and standards compliance
4. Create visual diagrams for calculator workflows 