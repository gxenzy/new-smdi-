# Circuit Insights Dashboard

The Circuit Insights Dashboard is a comprehensive analysis tool for visualizing and managing voltage drop issues across electrical panels and circuits. This dashboard integrates with the Enhanced Voltage Drop Analysis module to provide actionable insights about circuit performance, compliance status, and optimization opportunities.

## Features

### 1. Dashboard Overview

- **Key Metrics Cards**: Quick view of total circuits, average voltage drop, maximum voltage drop, and non-compliance count
- **Interactive Charts**: Bar chart for top circuits by voltage drop and donut chart for compliance status
- **Tabbed Interface**: Easy navigation between Overview, Critical Circuits, and Recommendations
- **Dark/Light Mode Toggle**: Theme support for different viewing preferences

### 2. Advanced Filtering Capabilities

- **Filter Panel**: Side drawer with comprehensive filtering options
- **Search Functionality**: Text search for finding specific circuits
- **Filter Presets**: Quick filters for panel selection and compliance status
- **Dynamic Filtering**: Real-time updating of displayed data based on filter settings

### 3. Critical Circuits Table

- **Sortable Columns**: Sort circuits by various metrics
- **Pagination**: Handle large datasets efficiently
- **Compliance Highlighting**: Visual indicators for non-compliant circuits
- **Conductor Size Recommendations**: Suggested upgrades for problematic circuits

### 4. Batch Analysis

- **Multi-Circuit Analysis**: Process all circuits in a panel simultaneously
- **Progress Tracking**: Visual indicators of analysis progress
- **Throttled Processing**: Maintain UI responsiveness during analysis
- **Results Summary**: Aggregated view of analysis findings

### 5. PDF Export

- **Comprehensive Reports**: Generate detailed PDF reports of circuit analysis
- **Chart Export**: Include visualizations in reports
- **Table Data**: Export critical circuits and recommendations
- **Customization Options**: Configure report content and format

## Implementation Details

### Component Structure

```
CircuitInsightsDashboard
├── Overview Tab
│   ├── Metrics Cards
│   ├── Voltage Drop Chart
│   └── Compliance Chart
├── Critical Circuits Tab
│   ├── Filtering Controls
│   ├── Circuit Table
│   └── Pagination
└── Recommendations Tab
    ├── Optimization Suggestions
    └── PEC 2017 References

CircuitInsightsDashboardDialog
├── Dashboard Component
├── Export Controls
├── Batch Analysis
└── Notification System
```

### Key Files

- `CircuitInsightsDashboard.tsx`: Main dashboard component with visualizations
- `CircuitInsightsDashboardDialog.tsx`: Modal dialog for dashboard integration
- `circuitInsightsTypes.ts`: TypeScript interfaces for the dashboard
- `circuitInsightsPdfExport.ts`: PDF export utilities (planned)
- `batch-analysis-implementation-plan.md`: Implementation details for batch analysis
- `circuit-insights-pdf-export-plan.md`: Implementation details for PDF export

### Integration Points

1. **Schedule of Loads Calculator**
   - The dashboard is accessible via a button in the Schedule of Loads Calculator
   - Circuit selection in the dashboard navigates back to the specific circuit in the calculator

2. **Enhanced Voltage Drop Analysis**
   - Uses common data structures for circuit information
   - Leverages the same calculation engine for consistency
   - Shares visualization utilities for a uniform UI experience

## Usage Guide

### Basic Usage

1. Access the dashboard from the Schedule of Loads Calculator using the "Circuit Insights" button
2. Review the Overview tab for a summary of circuit health across panels
3. Navigate to the Critical Circuits tab to identify problematic circuits
4. Use the Recommendations tab for guidance on optimizations

### Advanced Features

1. **Filtering Circuits**
   - Click the filter icon to open the filter drawer
   - Select panel, compliance status, and other filter criteria
   - Use the search box for finding specific circuits by name

2. **Batch Analysis**
   - Click "Analyze All Circuits" to process all circuits in the selected panel
   - Monitor progress using the progress indicator
   - Review updated charts and tables after analysis completes

3. **Exporting Reports**
   - Click "Export Report" to generate a PDF report
   - The report includes summary data, charts, and critical circuit details
   - Share reports with stakeholders for compliance documentation

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard Core Structure | Complete | All main tabs and visualizations implemented |
| Filtering System | Complete | Advanced filtering with search functionality |
| Critical Circuits Table | Complete | With pagination and sorting |
| Batch Analysis UI | Complete | Progress tracking implemented |
| Batch Analysis Engine | In Progress | Framework ready, calculation engine pending |
| PDF Export UI | Complete | Export button and feedback implemented |
| PDF Export Engine | Planned | Implementation plan created |
| Dark/Light Mode Toggle | Complete | Theme-aware charts and UI |
| Performance Optimizations | In Progress | Pagination implemented, more optimizations planned |

## Next Steps

1. **Complete Batch Analysis Engine**
   - Implement the core calculation engine for batch processing
   - Add throttling mechanism for large panels
   - Create results aggregation and display

2. **Implement PDF Export Engine**
   - Create CircuitInsightsPdfExport utility
   - Add chart export functionality
   - Implement comprehensive report generation

3. **Performance Optimizations**
   - Optimize chart rendering for large datasets
   - Implement virtual scrolling for very large circuit lists
   - Add data sampling for improved performance

4. **Additional Features**
   - Implement trend analysis for tracking circuit health over time
   - Add more chart types for deeper analysis
   - Create customization options for dashboard layout

## Technical Notes

### Type Safety

The implementation uses TypeScript for type safety:

```typescript
export interface CircuitInfo {
  id: string;
  name: string;
  panelId: string;
  panelName: string;
  voltageDrop: number;
  current?: number;
  conductorSize?: string;
  optimalSize?: string;
}

export interface CircuitAnalysisSummary {
  totalCircuits: number;
  compliantCircuits: number;
  nonCompliantCircuits: number;
  highestVoltageDrop: {
    value: number;
    circuitId: string;
    circuitName: string;
    panelId: string;
  };
  averageVoltageDrop: number;
  criticalCircuits: CircuitInfo[];
}
```

### Chart.js Integration

The dashboard uses Chart.js for visualizations, with proper typing:

```typescript
const [voltageDropBarChart, setVoltageDropBarChart] = useState<Chart<keyof ChartTypeRegistry> | null>(null);
const [complianceDonutChart, setComplianceDonutChart] = useState<Chart<keyof ChartTypeRegistry> | null>(null);
```

### Performance Considerations

To handle large datasets efficiently:

- Pagination for tables with many circuits
- Throttled processing for batch operations
- Memoization for expensive calculations
- Data sampling for charts with large datasets

## Compliance References

The dashboard helps ensure compliance with Philippine Electrical Code (PEC) 2017 Section 2.30.1, which specifies the following voltage drop limits:

- 3% for branch circuits
- 2% for feeder circuits
- 5% total from service entrance to farthest outlet

Circuits exceeding these limits are highlighted as non-compliant and included in the critical circuits table. 