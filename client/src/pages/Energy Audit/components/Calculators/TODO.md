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
- ✅ Implemented batch calculation support for Harmonic Distortion Calculator
- ✅ Implemented harmonic spectrum visualization with Chart.js:
  - ✅ Harmonic bar chart visualization
  - ✅ THD comparison chart
  - ✅ Waveform analysis visualization
  - ✅ Interactive options (show/hide series, change color schemes)
  - ✅ Accessibility features with high contrast mode
- ✅ Implemented Voltage Regulation Calculator:
  - ✅ Comprehensive input interface for system parameters
  - ✅ Support for PEC 2017 Section 2.30 compliance checks
  - ✅ Detailed results with voltage drop and power loss calculations
  - ✅ Intelligent conductor size recommendations
  - ✅ Helpful reference information and user guidance
  - ✅ Interactive voltage drop visualization with Chart.js
  - ✅ Conductor size comparison visualization
- ✅ Implemented LightingPowerDensityCalculator with complete functionality:
  - ✅ Core calculation of lighting power density (W/m²)
  - ✅ Standards compliance verification with PEC 2017
  - ✅ Fixture management (addition, configuration, removal)
  - ✅ Building type selection with appropriate standards
  - ✅ Comprehensive recommendations based on results
  - ✅ Building presets for common building and room types
  - ✅ Energy savings calculation with configurable parameters
  - ✅ PDF export with detailed reports
  - ✅ PDF preview functionality
  - ✅ User notifications and enhanced error handling
  - ✅ Responsive design for different screen sizes
  - ✅ TypeScript type safety with proper interfaces
  - ✅ Integration with the Energy Audit workflow
  - ✅ TypeScript declarations for jspdf-autotable

## In Progress

- 🔄 Creating Voltage Drop Calculator for specific circuit types:
  - ✅ Core utility functions for voltage drop calculations
  - ✅ Circuit type-specific configuration options
  - ✅ Ampacity validation alongside voltage drop checks
  - ✅ Conductor size optimization algorithms
  - 🔄 User interface implementation
  - 🔄 Results visualization and recommendations
  - 🔄 Integration with standards reference and compliance checking
- 🔄 Enhancing HarmonicDistortionCalculator with batch calculations
- 🔄 Improving PowerFactorCalculator with new visualization features

## Planned Features

- ⏳ Implement ScheduleOfLoadsCalculator
- ⏳ Create dedicated MotorLoadCalculator
- ⏳ Develop TransformerCalculator for load analysis
- ⏳ Implement HVACEnergyCalculator with seasonal analysis
- ⏳ Add comparison view to all calculators
- ⏳ Create calculation templates for common scenarios

## Feature Enhancement Ideas

### Voltage Drop Calculator Enhancements
- ⏳ Add visualization of voltage drop along conductor length
- ⏳ Implement conductor size comparison visualization
- ⏳ Create circuit type templates for common applications
- ⏳ Add support for custom derating factors
- ⏳ Implement temperature-based derating calculations
- ⏳ Add integration with Schedule of Loads calculator

### LightingPowerDensityCalculator Enhancements
- ⏳ Add comparison view for multiple lighting designs
- ⏳ Implement 3D visualization of lighting layouts
- ⏳ Add batch calculation for multiple rooms
- ⏳ Create integration with BIM/CAD data
- ⏳ Implement real-time collaboration features
- ⏳ Add ability to import fixture data from spreadsheets
- ⏳ Implement illumination level prediction based on LPD values
- ⏳ Create cost optimization suggestions with ROI calculations
- ⏳ Add fixture database with efficiency ratings

### General Enhancements
- ⏳ Add export to spreadsheet functionality for all calculators
- ⏳ Create centralized calculation history viewer
- ⏳ Implement calculation data visualization dashboard
- ⏳ Add print-friendly layouts for all calculators

## Current Tasks

### Harmonic Distortion Calculator Implementation (Completed)
1. ✅ Implement system parameters input interface
2. ✅ Implement harmonic measurements input interface
3. ✅ Implement THD calculation formulas
4. ✅ Add IEEE 519-2014 compliance checks
5. ✅ Implement harmonic spectrum visualization
6. ✅ Create guidance components and validation
7. ✅ Add recommendations engine for mitigation strategies
8. ✅ Add save/load functionality

### Voltage Regulation Calculator Implementation (Completed)
1. ✅ Implement voltage drop calculation utilities based on PEC 2017
2. ✅ Design user interface for parameter input
3. ✅ Add calculation logic for different conductor types and materials
4. ✅ Implement compliance checking against PEC 2017 Section 2.30
5. ✅ Create results visualization and reporting
6. ✅ Add recommendations for non-compliant circuits
7. ✅ Integrate with SavedCalculationsViewer
8. ✅ Add educational resources and reference information
9. ✅ Add interactive voltage drop visualization along conductor length
10. ✅ Add conductor size comparison visualization

### LightingPowerDensityCalculator Implementation (Completed)
1. ✅ Create core utility functions for LPD calculations
2. ✅ Implement standards compliance verification based on PEC 2017
3. ✅ Design intuitive user interface for room and fixture input
4. ✅ Add fixture management functionality (add, edit, remove)
5. ✅ Create building type selection with appropriate standards
6. ✅ Implement detailed recommendations based on results
7. ✅ Add PDF export functionality with professional reports
8. ✅ Implement building preset functionality for quick configuration
9. ✅ Add energy savings calculations with configurable parameters
10. ✅ Create interactive PDF preview functionality
11. ✅ Implement user notifications for better feedback
12. ✅ Create TypeScript declarations for jspdf-autotable

### Voltage Drop Calculator Implementation (In Progress)
1. ✅ Create voltage drop calculation utilities for specific circuit types
2. ✅ Implement circuit type configuration for branch, feeder, service, and motor circuits
3. ✅ Add ampacity validation according to PEC 2017 requirements
4. ✅ Design user interface with circuit-specific parameters
5. ✅ Implement intelligent conductor size recommendation algorithm
6. 🔄 Create results display with compliance status and recommendations
7. 🔄 Add visualization for voltage drop along conductor length
8. 🔄 Implement comparison view for different conductor sizes
9. 🔄 Add educational resources on PEC 2017 requirements
10. 🔄 Integrate with SavedCalculationsViewer component

## Next Tasks

### High Priority
1. ✅ Complete the Voltage Regulation Calculator (PEC 2017 2.30)
2. ✅ Add interactive voltage drop visualization
3. ✅ Enhance the Lighting Power Density Calculator with PEC 2017 compliance checks
4. ✅ Add PDF export functionality for LPD calculations
5. ✅ Add building type presets for LPD Calculator
6. ✅ Implement energy savings calculation for LPD
7. ✅ Add UI for presets and building templates in LPD Calculator
8. ✅ Implement energy savings UI with configurable parameters in LPD Calculator
9. 🔄 Create the Voltage Drop Calculator for specific circuit types
10. 🔄 Implement data export functionality (CSV, PDF) for other calculators

### Medium Priority
1. Integrate calculators with building visualization module
2. ✅ Add data visualization for results (charts, graphs)
3. ✅ Add batch calculation support for multiple scenarios
4. Add circuit and panel load calculations

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
1. ✅ Add JSDoc comments to all components and functions
2. ✅ Create usage examples for each calculator
3. ✅ Document the calculation methodologies and standards compliance
4. ✅ Create visual diagrams for calculator workflows
5. ✅ Implement comprehensive user guides for LPD Calculator

# Calculator Compliance Integration TODO List

## Current Implementation Status

The calculator compliance integration has been implemented with these key features:
- ✅ Interface for verifying saved calculations against standards
- ✅ Backend API for compliance verification
- ✅ Compliance rules matching based on calculation type
- ✅ Status tracking and results display
- ✅ Database schema for storing verification results

## Remaining Tasks

### High Priority

1. **Backend Implementation**
   - ✅ Complete the Compliance model with methods for rule retrieval by type
   - ✅ Implement the verification results storage in the database
   - ✅ Create migration scripts for compliance verification tables
   - ✅ Add database queries in the compliance verification controller
   - [ ] Test the compliance verification API with actual data

2. **API Endpoint Testing**
   - [ ] Test the `/api/compliance/verify-calculation` endpoint with various calculation types
   - [ ] Test the `/api/compliance/rules` endpoint for rule retrieval
   - [ ] Test the authentication integration for saving verification results

3. **Frontend Enhancement**
   - [ ] Add proper error handling for API failures
   - [ ] Implement loading indicators during verification
   - [ ] Add filters for compliance rules by severity and status

### Medium Priority

1. **User Experience Improvements**
   - [ ] Add tooltips and help text explaining the compliance process
   - [ ] Implement guided workflow for fixing non-compliant calculations
   - [ ] Add visual indicators to calculator forms for standard requirements

2. **Integration Enhancements**
   - [ ] Connect with PDF report generation for compliance reports
   - [ ] Add compliance verification tab directly in each calculator
   - [ ] Implement compliance check on calculation save

3. **Data Management**
   - [ ] Add bulk verification for multiple calculations
   - [ ] Implement verification history tracking and display
   - [ ] Add export functionality for compliance results

### Low Priority

1. **Advanced Features**
   - [ ] Implement real-time compliance checking during calculation
   - [ ] Add recommendations for fixing non-compliant calculations
   - [ ] Create compliance trend analysis for reports

2. **UI/UX Refinements**
   - [ ] Enhance the rule details dialog with more information
   - [ ] Add sorting options for compliance results
   - [ ] Implement responsive design for mobile devices

## Next Steps

The immediate next steps are:
1. ✅ Complete the backend implementation with actual database queries
2. 🔄 Complete the Voltage Drop Calculator implementation
3. Test compliance API endpoints with real data
4. Enhance error handling on the frontend
5. Integrate with the PDF report generation system

Once these are complete, focus on the medium priority items to improve user experience and integration with other system components 