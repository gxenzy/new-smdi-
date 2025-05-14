# Energy Audit Platform - UI/UX Improvement Issues

## Current Issues

### 1. Schedule of Loads Calculator

- **Duplicate "Save Calculation" Buttons**
  - One at the top beside "Batch Sizing" 
  - Another at the bottom with identical functionality
  - Creates user confusion about different functionality
  
- **Insights Button Error**
  - Canvas reuse error: "Canvas is already in use. Chart with ID '6' must be destroyed before the canvas with ID 'voltage-drop-chart' can be reused."
  - Charts not properly cleaned up when switching between views

### 2. Voltage Drop Calculator

- **Data Loss on Refresh**
  - Calculator state is lost when page is refreshed or browser is closed
  - No auto-save functionality for in-progress calculations
  - ✅ **FIXED**: Implemented data persistence with auto-save and recovery dialog
  
- **Chart Rendering Issues**
  - Canvas reuse errors when switching between visualization tabs
  - Chart instances not properly cleaned up
  - ✅ **FIXED**: Implemented chartManager utility for proper chart lifecycle management

- **Batch Analysis UI Issues**
  - Batch analysis results not properly formatted
  - No progress indicator during batch calculations
  - Limited filtering and sorting options for batch results

- **Template Loading UI**
  - Template selection interface needs improvement
  - No preview functionality for templates
  - Limited categorization of templates

### 3. "Saved Calculations" Section Issues

- **Poor Design Implementation**
  - User interface needs significant improvement
  - Saved calculations list not well-formatted
  - Needs consistent styling with main application

- **Compliance Verification**
  - No saved calculations list in Compliance sections
  - 404 error when accessing Compliance Test API

### 4. Energy Calculators

- **Non-functional Calculators**
  - Multiple calculators not working properly
  - Need to identify and fix each calculator individually

- **Missing Documentation**
  - Other calculators lack the helpful Quick Start guides and information panels present in Schedule of Loads Calculator
  - Need to standardize documentation across all calculators

### 5. Data Persistence Issues

- **Calculation State Not Preserved**
  - Calculator inputs lost on page refresh or logout
  - No synchronization between sessions
  - Need persistent storage mechanism for calculator states

- **Remaining Calculator Persistence**
  - Lighting Calculator still lacks data persistence
  - HVAC Calculator still lacks data persistence
  - Equipment Calculator still lacks data persistence
  - Power Factor Calculator still lacks data persistence
  - Harmonic Distortion Calculator still lacks data persistence

### 6. Layout and Design Concerns

- **Inconsistent Positioning**
  - Calculator layout and positioning needs improvement
  - Design consistency issues across different calculator types

## Improvement Priorities

1. ✅ Fix duplicate "Save Calculation" buttons in Schedule of Loads
2. ✅ Resolve Canvas reuse error in Insights view
3. ✅ Implement persistent storage for calculator inputs
4. ✅ Create chart management system for proper chart lifecycle handling
5. ✅ Apply data persistence to Schedule of Loads and Voltage Drop calculators
6. 🔄 Apply data persistence to remaining calculators 
7. 🔄 Fix non-functional Energy Calculators
8. 🔄 Standardize Quick Start/Info documentation across all calculators
9. 🔄 Improve "Saved Calculations" viewer interface
10. 🔄 Enhance layouts and designs for better user experience 

## Completed Improvements

### Schedule of Loads Calculator

- **Duplicate Buttons Fixed**: Removed duplicate "Save Calculation" button from the toolbar, keeping only one primary button with enhanced tooltip.
- **Chart Errors Fixed**: Implemented chartManager utility to properly handle chart lifecycle and prevent canvas reuse errors.

### Voltage Drop Calculator

- **Data Persistence Added**: Implemented auto-save functionality with throttling and recovery dialog for unsaved work.
- **Save Flow Improved**: Added dedicated save dialog for better user experience.
- **Chart Management**: Integrated with chartManager utility to fix canvas reuse errors.

### Data Persistence

- **Auto-Save Implemented**: Added auto-save functionality with throttling to prevent excessive storage writes.
- **Recovery Dialog Added**: Created CalculatorStateRecoveryDialog component to allow users to recover unsaved work after page refresh or browser close.
- **Storage Utility Created**: Developed calculatorStateStorage utility with type-safe interfaces for consistent state management across all calculators.

### Chart Management

- **Chart Manager Created**: Implemented comprehensive chart lifecycle management to fix canvas reuse errors.
- **React Hooks Added**: Created useChart, useChartUpdate, and useDisposableChart hooks for easy integration with React components.
- **Error Handling**: Added robust error handling and recovery mechanisms for chart rendering issues.

## Next Steps

1. Apply the data persistence pattern to other calculators (starting with Lighting Calculator)
2. Fix non-functional Energy Calculators starting with most commonly used ones
3. Improve the Batch Analysis UI in Voltage Drop Calculator
4. Enhance the Template Loading UI in Voltage Drop Calculator 
5. Improve "Saved Calculations" viewer UI
6. Standardize documentation across calculators 