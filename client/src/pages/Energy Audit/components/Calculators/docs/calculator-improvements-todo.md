# Calculator Improvements TODO

This document tracks the improvements needed across all calculators in the Energy Audit Platform.

## Schedule of Loads Calculator

### High Priority
- [x] Fix duplicate "Save Calculation" buttons
- [x] Implement proper chart lifecycle management to prevent canvas reuse errors
- [ ] Add auto-save functionality with throttling
- [ ] Improve error handling and validation
- [ ] Standardize button placement and styling
- [ ] Add comprehensive tooltips for all fields and actions

### Medium Priority
- [ ] Create reusable Quick Start dialog component
- [ ] Implement keyboard shortcuts for common actions
- [ ] Add batch processing for multiple circuits
- [ ] Improve phase balance visualization
- [ ] Add circuit comparison feature

### Low Priority
- [ ] Create printable report templates
- [ ] Add export to Excel functionality
- [ ] Implement dark/light mode toggle
- [ ] Add user preferences storage

## Voltage Drop Calculator

### High Priority
- [x] Implement proper chart lifecycle management
- [ ] Fix formula accuracy issues
- [ ] Add temperature correction factors
- [ ] Improve conductor selection recommendations
- [ ] Add auto-save functionality
- [ ] Fix UI layout inconsistencies

### Medium Priority
- [ ] Add comparative analysis between different conductor types
- [ ] Implement better visualization of voltage drop along circuit
- [ ] Add batch voltage drop calculation
- [ ] Integrate with Schedule of Loads calculator

### Low Priority
- [ ] Add custom conductor definitions
- [ ] Implement temperature rise calculation
- [ ] Add 3D visualization of circuit

## Energy Calculator

### High Priority
- [ ] Fix non-functional calculation logic
- [ ] Implement proper data validation
- [ ] Add comprehensive error messages
- [ ] Create standardized form layout
- [ ] Implement auto-save functionality

### Medium Priority
- [ ] Add energy cost comparison
- [ ] Implement CO2 emissions calculation
- [ ] Create visual dashboard
- [ ] Add historical comparison

### Low Priority
- [ ] Export to PDF functionality
- [ ] Implement sharing options
- [ ] Add custom tariff definitions

## Circuit Insights Dashboard

### High Priority
- [x] Fix Canvas reuse errors in charts
- [ ] Implement proper data filtering
- [ ] Add circuit search functionality
- [ ] Improve chart responsiveness
- [ ] Fix layout issues on smaller screens

### Medium Priority
- [ ] Add custom dashboard layouts
- [ ] Implement more detailed circuit analytics
- [ ] Create export functionality
- [ ] Add batch processing capabilities

### Low Priority
- [ ] Add user customizable widgets
- [ ] Implement advanced filtering options
- [ ] Create PDF export functionality

## Cross-Calculator Improvements

### High Priority
- [x] Create ChartManager utility for proper chart lifecycle management
- [ ] Implement CalculatorStateStorage utility for data persistence
- [ ] Create standardized UI components library
- [ ] Implement error boundary components
- [ ] Create consistent form validation framework

### Medium Priority
- [ ] Create standardized documentation components
- [ ] Implement unified data sharing between calculators
- [ ] Create centralized notification system
- [ ] Implement better accessibility features

### Low Priority
- [ ] Create analytics for calculator usage
- [ ] Add user preference tracking
- [ ] Implement onboarding tutorials 