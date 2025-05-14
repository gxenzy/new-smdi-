# Calculator Improvements To-Do List

This document outlines the improvements needed for each calculator in the Energy Audit Platform.

## Global Improvements (All Calculators)

- [x] **Saved Calculations System**
  - [x] Implement unified saved calculations system
  - [x] Ensure cross-calculator visibility in "All" tab
  - [x] Add proper error handling when selecting incompatible saved calculations
  - [x] Implement persistent storage mechanism (localStorage)
  - [ ] **Improve Saved Calculations UI**
    - [ ] Enhance styling and formatting of saved calculations list
    - [ ] Add sorting and filtering capabilities
    - [ ] Improve preview functionality for saved calculations
    - [ ] Fix missing saved calculations in Compliance sections

- [ ] **Standardized Export**
  - [x] Create consistent PDF export interface across all calculators (started with Schedule of Loads)
  - [x] Implement visualization components in PDF reports
  - [x] Add comprehensive analysis sections to all reports
  - [x] Include compliance status in all reports
  - [ ] Extend enhanced PDF exports to other calculators
  - [ ] Create unified PDF generation service
  - [ ] Add user customization options for PDF exports

- [ ] **Standards Reference Integration**
  - [ ] Complete integration with Standards Reference System
  - [x] Add contextual help with regulatory references
  - [ ] Implement automatic compliance checking against standards

- [x] **Visualization Improvements**
  - [x] Add consistent chart and graph components
  - [x] Implement theme-aware visualizations
  - [x] **Fix Chart Reuse Issues**
    - [x] Properly destroy Chart.js instances before reusing canvases
    - [x] Implement chart cleanup on component unmount
    - [x] Fix "Canvas already in use" error in Circuit Insights dashboard
    - [x] Create Chart.js lifecycle management utility
    - [x] Implement React hooks for Chart.js integration
    - [x] Fix property access errors in chartManager implementation
    - [x] Fix TypeScript errors with chart dataset properties (borderWidth, borderDash)
  - [ ] **Advanced Chart Features**
    - [ ] Create comparison visualizations for before/after analysis
    - [ ] Add chart export functionality (PNG, PDF)
    - [ ] Implement chart component library with React wrappers
    - [ ] Add interactive features (zoom, pan, drill-down)
    - [ ] Implement accessibility enhancements

- [ ] **UI/UX Consistency**
  - [ ] Standardize Quick Start guides across all calculators
  - [ ] Add Info panels with regulatory references to all calculators
  - [ ] Fix calculator positioning and layout
  - [ ] Ensure consistent styling across all calculator components
  - [x] Remove duplicate action buttons
  - [ ] Implement responsive designs for all calculators

- [x] **Data Persistence**
  - [x] Implement local storage for calculator inputs
  - [x] Add auto-save functionality for in-progress calculations
  - [x] Create session recovery mechanism after page refresh/logout
  - [x] Apply data persistence to Schedule of Loads Calculator
  - [x] Apply data persistence to Voltage Drop Calculator
  - [ ] **Extend Data Persistence to All Calculators**
    - [ ] Lighting Calculator Persistence
    - [ ] HVAC Calculator Persistence
    - [ ] Power Factor Calculator Persistence
    - [ ] Harmonic Distortion Calculator Persistence
    - [ ] Energy Calculator Persistence
    - [ ] ROI Calculator Persistence
  - [ ] **Data Persistence Enhancements**
    - [ ] Add version control for calculator states
    - [ ] Implement change history tracking
    - [ ] Add batch import/export of calculator states
    - [ ] Implement server-side persistence (future)
    - [ ] Add synchronization between client and server storage

## Schedule of Loads Calculator

- [x] Fix edit functionality for load items
- [x] Add circuit breaker and conductor size selection options
- [x] Fix economic sizing calculation
- [x] Add save button to toolbar
- [x] Enhance PDF export with comprehensive analysis
- [x] Add visualization components for analysis results
- [x] Complete compliance reporting system
- [x] Implement saved calculations interface
- [x] Fix issues with storage and calculation types
- [x] Fix linter errors in saveCalculation and PDF export
- [x] Implement batch sizing optimization for all circuits
- [x] **Fix Duplicate Save Buttons**
  - [x] Remove or consolidate duplicate "Save Calculation" buttons
  - [x] Clarify button functions with tooltips if different functionality exists
- [x] **Fix Circuit Insights Dashboard Errors**
  - [x] Resolve Canvas reuse errors
  - [x] Implement proper chart cleanup
  - [x] Fix property access errors in chart configuration
  - [x] Add explicit chart destruction before creating new instances
- [x] **Add Data Persistence**
  - [x] Implement auto-save functionality
  - [x] Add draft recovery after page refresh
  - [x] Create explicit save functionality
  - [x] Add notification system for recovery/persistence actions
- [ ] **Multi-Panel Implementation**
  - [ ] Add multi-panel support in the UI
  - [ ] Implement panel hierarchy visualization
  - [ ] Add panel relationship modeling and navigation
- [ ] **Advanced Features**
  - [ ] Implement demand factor library integration
  - [ ] Add typical load presets library
  - [ ] Implement automatic conductor sizing recommendations based on load requirements
  - [ ] Add safety margin factor settings for circuit breaker sizing
  - [ ] Create exporting/importing mechanism for sharing calculations between users
  - [ ] Add visualization of phase distribution on panel preview
  - [ ] Implement detailed compliance reporting with references to PEC sections

## Voltage Drop Calculator

- [x] Fix core calculator functionality
- [x] Implement persistent storage for calculator state
- [x] Add draft recovery mechanism
- [x] Fix chart reuse errors with chartManager
- [x] Implement calculator synchronization with Schedule of Loads
- [ ] **Chart Visualization Enhancements**
  - [ ] Refactor to use new chart templates
  - [ ] Add export functionality
  - [ ] Implement interactive features
  - [ ] Add accessibility support
- [ ] **Advanced Features**
  - [ ] Enhance batch analysis capabilities
  - [ ] Add visualization of voltage profile
  - [ ] Implement feeder-branch relationship modeling
  - [ ] Add detailed compliance reporting
  - [ ] Enhance economic sizing calculations

## Lighting Calculator (Priority: Medium)

- [ ] Fix core calculator functionality
- [ ] **Add Data Persistence**
  - [ ] Implement calculatorStateStorage integration
  - [ ] Add auto-save functionality
  - [ ] Create recovery dialog
  - [ ] Implement explicit save mechanism
- [ ] **Visualization Improvements**
  - [ ] Add visualization components for energy consumption
  - [ ] Implement theme-aware charts
  - [ ] Create comparison visualization for before/after analysis
- [ ] **Advanced Features**
  - [ ] Enhance PDF export with detailed analysis
  - [ ] Improve integration with standards reference for illumination requirements
  - [ ] Add fixture efficiency comparison tools
  - [ ] Implement lifecycle cost analysis
  - [ ] Add ROI calculations for lighting upgrades

## HVAC Calculator (Priority: Medium)

- [ ] Fix core calculator functionality
- [ ] **Add Data Persistence**
  - [ ] Implement calculatorStateStorage integration
  - [ ] Add auto-save functionality
  - [ ] Create recovery dialog
  - [ ] Implement explicit save mechanism
- [ ] **Visualization Improvements**
  - [ ] Add seasonal efficiency visualization
  - [ ] Implement theme-aware charts
  - [ ] Create comparison visualization for before/after analysis
- [ ] **Advanced Features**
  - [ ] Implement heat load calculation improvements
  - [ ] Add equipment selection recommendations
  - [ ] Enhance PDF export with detailed analysis
  - [ ] Integrate ASHRAE standards compliance checking
  - [ ] Add energy consumption forecasting

## Power Factor Calculator (Priority: Low)

- [ ] Fix core calculator functionality
- [ ] **Add Data Persistence**
  - [ ] Implement calculatorStateStorage integration
  - [ ] Add auto-save functionality
  - [ ] Create recovery dialog
  - [ ] Implement explicit save mechanism
- [ ] **Visualization Improvements**
  - [ ] Add power factor triangle visualization
  - [ ] Implement theme-aware charts
  - [ ] Create comparison visualization for before/after correction
- [ ] **Advanced Features**
  - [ ] Implement capacitor bank sizing calculator
  - [ ] Enhance PDF reports with economic analysis
  - [ ] Improve integration with utility rate structures
  - [ ] Add historical tracking capabilities

## Harmonic Distortion Calculator (Priority: Low)

- [ ] Fix core calculator functionality
- [ ] **Add Data Persistence**
  - [ ] Implement calculatorStateStorage integration
  - [ ] Add auto-save functionality
  - [ ] Create recovery dialog
  - [ ] Implement explicit save mechanism
- [ ] **Visualization Improvements**
  - [ ] Add harmonic spectrum visualization
  - [ ] Implement theme-aware charts
  - [ ] Create comparison visualization with/without mitigation
- [ ] **Advanced Features**
  - [ ] Implement IEEE 519 compliance checking
  - [ ] Add filter sizing recommendations
  - [ ] Enhance PDF reports with mitigation strategies
  - [ ] Improve visualization of voltage and current distortion

## Chart Management System (Completed Core Implementation)

- [x] Create a comprehensive chart management utility
- [x] Implement proper chart lifecycle handling
- [x] Add React hooks for Chart.js integration
- [x] Fix "Canvas is already in use" errors
- [x] Add charting templates for common visualizations
- [x] Create theme-aware chart components
- [x] Fix TypeScript type issues with chart properties
- [x] Create unified chart theming system
- [ ] **Next Phase Implementation**
  - [ ] Create React component wrappers for all chart types
  - [ ] Implement export functionality for charts
  - [ ] Add interactive features (zoom, pan, drill-down)
  - [ ] Implement accessibility enhancements
  - [ ] Add animation controls for visualization
  - [ ] Create specialized templates for calculator-specific charts
  - [ ] Add documentation and examples

## Data Persistence System (Completed Core Implementation)

- [x] Implement `calculatorStateStorage.ts` utility:
  - [x] Create localStorage integration for all calculator types
  - [x] Add auto-save functionality with throttling
  - [x] Implement draft recovery mechanism for post-refresh/navigation scenarios
  - [x] Create separate storage for drafts vs. saved calculations
  - [x] Add timestamp tracking and version management
  - [x] Implement type-safe interfaces for all calculator state operations
- [x] Implement `CalculatorStateRecoveryDialog.tsx` component:
  - [x] Create user interface for draft recovery
  - [x] Add timestamp display for last modified time
  - [x] Implement proper dialog flow for user decisions
  - [x] Add integration with notification system
- [x] Integrate with Schedule of Loads Calculator
- [x] Integrate with Voltage Drop Calculator
- [ ] **Next Phase Implementation**
  - [ ] Extend to all remaining calculators
  - [ ] Implement server-side persistence
  - [ ] Add synchronization between client and server storage
  - [ ] Create data import/export functionality
  - [ ] Add version control and change history

## PDF Export Enhancements (In Progress)

- [x] **Core Structure and Layout**
  - [x] Professional cover page design
  - [x] Executive summary section
  - [x] Consistent section organization
  - [x] Headers and footers with page numbering

- [x] **Visualization Components**
  - [x] Load distribution charts
  - [x] Theme-aware chart rendering
  - [ ] Comparison charts for before/after analysis
  - [x] Phase balance visualization
  - [x] Voltage profile visualization

- [x] **Analysis Sections**
  - [x] Detailed compliance checking
  - [x] Economic analysis with ROI calculations
  - [x] Code reference sections
  - [ ] Predictive analysis for future load growth

- [ ] **Advanced Features**
  - [🔄] Multi-panel reports
  - [ ] Customizable report sections
  - [ ] User-configurable branding elements
  - [ ] Batch export capabilities

## Compliance System Improvements

- [ ] Fix 404 errors in Compliance Test API
- [ ] Implement saved calculations view in compliance section
- [ ] Add detailed compliance reporting with regulatory references
- [ ] Improve compliance verification UI and feedback

## Implementation Priority

1. ✅ Fix all critical usability issues (edit functionality, selection options)
2. ✅ Implement unified saved calculations system 
3. ✅ Enhance PDF exports with comprehensive analysis
4. ✅ Complete compliance reporting system
5. ✅ Implement batch sizing optimization
6. ✅ Implement data persistence and recovery mechanism
7. ✅ Fix chart reuse issues and implement proper chart management
8. 🔄 Apply data persistence to remaining calculators (CURRENT)
9. 🔄 Refactor existing chart components to use new chart templates (CURRENT)
10. 🔄 Implement advanced chart features (export, interactive features)
11. 🔄 Fix non-functional calculators
12. 🔄 Implement advanced features (multi-panel support)
13. ⏳ Complete demand factor and load presets libraries

## Technical Framework Needs

- [x] Create reusable chart components
- [x] Implement unified data storage architecture
- [ ] Create standards reference API
- [x] Build shared calculation utilities
- [ ] Develop integration testing framework
- [ ] Implement automated validation system 
- [x] **Add Data Persistence Layer**
  - [x] Implement localStorage/sessionStorage integration
  - [x] Add auto-save functionality with throttling
  - [x] Create recovery mechanism for post-refresh/logout scenarios
  - [ ] Add server-side storage for calculator states
  - [ ] Develop synchronization mechanism between client and server

## Next Implementation Tasks (Prioritized)

1. Extend Data Persistence to Lighting Calculator
2. Refactor CircuitInsightsDashboard to use the new chart templates
3. Create React component wrappers for chart templates
4. Add export functionality to chart components
5. Fix non-functional Energy Calculators
6. Implement multi-panel support for Schedule of Loads
7. Create documentation and examples for the chart system
8. Extend data persistence to remaining calculators

## Priority Issues to Fix

### 1. Data Persistence in All Calculators
- ✅ Implement useCalculatorState hook for centralized state persistence
- ✅ Fix data loss on refresh in Lighting Power Density Calculator
- [ ] Add state persistence to Power Factor Calculator
- [ ] Add state persistence to Harmonics Calculator
- [ ] Add state persistence to Voltage Regulation Calculator
- [ ] Add state persistence to ROI Calculator
- [ ] Add state persistence to Illumination Calculator

### 2. Chart Visualization Fixes
- ✅ Fix "Canvas is already in use" error in Circuit Insights Dashboard
- ✅ Create React component wrappers for all chart types
- ✅ Implement proper chart lifecycle management for charts
- ✅ Fix type issues in chart template interfaces
- [ ] Refactor remaining dashboard components to use the new chart components

### 3. Calculator Layout Standardization
- [ ] Create standardized layout grid for all calculators
- [ ] Standardize button placement across all calculators
- [ ] Implement consistent styling for input controls
- [ ] Create reusable form groups for similar inputs
- [ ] Standardize result displays and compliance indicators

### 4. User Experience Improvements
- ✅ Create standardized QuickStart dialog for all calculators
- [ ] Add InfoPanel with technical references to all calculators
- [ ] Improve calculator result visualization
- [ ] Add tooltips to explain complex parameters
- [ ] Implement undo/redo functionality

### 5. Saved Calculations Management
- [ ] Redesign saved calculations interface
- [ ] Add batch operations (delete multiple, export multiple)
- [ ] Implement search/filter functionality for saved calculations
- [ ] Add categorization for saved calculations
- [ ] Create import/export functionality for calculation backups

## Implementation Plan

### Phase 1 (Current)
- Fix critical data persistence issues
- Fix chart visualization errors
- Standardize QuickStart guides across calculators

### Phase 2
- Complete data persistence for all calculators
- Refactor all charts to use new components
- Implement standardized layouts

### Phase 3
- Redesign saved calculations interface
- Complete remaining calculator implementations
- Add advanced features to existing calculators

Legend:
✅ = Complete
🔄 = In Progress
⏳ = Not Started 