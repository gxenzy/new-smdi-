# Energy Audit Platform - Calculator Fixes Implementation Plan

## 1. Schedule of Loads Calculator - Duplicate Save Buttons

### Issue Description
The Schedule of Loads Calculator currently has three "Save Calculation" buttons:
1. At the top beside "Batch Sizing"
2. Another in the toolbar
3. A third at the bottom of the page

This creates confusion for users regarding their different functionalities.

### Implementation Plan

1. **Analyze Button Functionality**
   - Determine if these buttons call the same function or different functions
   - If identical, consolidate to a single button
   - If different, clarify functionality with descriptive labels

2. **UI Modifications**
   - Keep primary "Save Calculation" button in the toolbar
   - Either:
     - Remove duplicate buttons, or
     - Rename with more specific labels (e.g., "Save as Template", "Quick Save", etc.)
   - Add tooltips to clarify button functions

3. **Code Changes**
   - Modify `ScheduleOfLoadsCalculator.tsx` to remove duplicate button declarations
   - Update event handlers as needed
   - Add tooltip components with clear descriptive text

## 2. Circuit Insights Dashboard - Canvas Reuse Errors

### Issue Description
The Insights button triggers an error: "Canvas is already in use. Chart with ID '6' must be destroyed before the canvas with ID 'voltage-drop-chart' can be reused."

This indicates that Chart.js instances aren't being properly destroyed when the component unmounts or before new charts are created.

### Implementation Plan

1. **Chart Instance Management**
   - Add proper chart instance cleanup in component lifecycle methods
   - Implement a centralized chart instance registry for tracking active charts
   - Ensure charts are destroyed before canvas reuse

2. **Technical Implementation**
   - Add `useEffect` cleanup function for React functional components:
     ```tsx
     useEffect(() => {
       // Chart creation code
       const myChart = new Chart(ctx, config);
       
       // Cleanup function
       return () => {
         // Properly destroy chart instance
         myChart.destroy();
       };
     }, [dependencies]);
     ```

3. **Canvas ID Management**
   - Ensure unique canvas IDs when creating multiple charts
   - Implement a chart instance manager helper:
     ```tsx
     const chartManager = {
       instances: new Map(),
       
       create(canvasId, config) {
         // Destroy any existing chart on this canvas
         this.destroy(canvasId);
         
         // Create and store new chart
         const canvas = document.getElementById(canvasId);
         const ctx = canvas.getContext('2d');
         const chart = new Chart(ctx, config);
         this.instances.set(canvasId, chart);
         
         return chart;
       },
       
       destroy(canvasId) {
         if (this.instances.has(canvasId)) {
           const chart = this.instances.get(canvasId);
           chart.destroy();
           this.instances.delete(canvasId);
         }
       },
       
       destroyAll() {
         this.instances.forEach(chart => chart.destroy());
         this.instances.clear();
       }
     };
     ```

4. **Component Integration**
   - Update CircuitInsightsDashboardDialog to use the chart manager
   - Add explicit cleanup on dialog close/component unmount
   - Implement proper React useEffect cleanup functions

## 3. Data Persistence Implementation

### Issue Description
Calculator inputs are not saved when refreshing or logging out, resulting in data loss.

### Implementation Plan

1. **LocalStorage Implementation**
   - Add localStorage integration for calculator inputs
   - Create a namespace system to avoid conflicts between calculators
   - Implement intelligent serialization/deserialization for complex objects

2. **Auto-Save Functionality**
   - Add throttled auto-save with configurable intervals
   - Save draft calculations automatically
   - Add visual indication when data is being saved

3. **Recovery Mechanism**
   - Add detection for unsaved work after page refresh/reload
   - Implement data recovery prompt on returning to calculator
   - Create draft versioning system to avoid overwrites

4. **Technical Implementation**
   - Create dedicated storage service:
     ```tsx
     // calculatorStorageService.ts
     export const calculatorStorageService = {
       namespace: 'energy-audit-calculators',
       
       getKey(calculatorType, id = 'draft') {
         return `${this.namespace}:${calculatorType}:${id}`;
       },
       
       saveCalculatorState(calculatorType, state, id = 'draft') {
         const key = this.getKey(calculatorType, id);
         localStorage.setItem(key, JSON.stringify(state));
       },
       
       getCalculatorState(calculatorType, id = 'draft') {
         const key = this.getKey(calculatorType, id);
         const data = localStorage.getItem(key);
         return data ? JSON.parse(data) : null;
       },
       
       clearCalculatorState(calculatorType, id = 'draft') {
         const key = this.getKey(calculatorType, id);
         localStorage.removeItem(key);
       },
       
       hasDraft(calculatorType) {
         return !!this.getCalculatorState(calculatorType, 'draft');
       }
     };
     ```

## 4. Standardizing Quick Start and Info Panels

### Issue Description
Other calculators lack the helpful Quick Start guides and Info panels that exist in the Schedule of Loads Calculator.

### Implementation Plan

1. **Component Standardization**
   - Create reusable QuickStartDialog and InfoDialog components
   - Standardize the interface for these components
   - Implement consistent styling across all calculators

2. **Documentation Templates**
   - Create template structure for documentation
   - Include sections for:
     - Basic calculator usage
     - Reference to applicable regulatory standards
     - Examples with step-by-step instructions
     - Troubleshooting common issues

3. **Implementation for Each Calculator**
   - Add QuickStartDialog and InfoDialog to all calculator components
   - Create specialized content for each calculator type
   - Include relevant regulatory references 