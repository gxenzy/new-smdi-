# Energy Audit Platform - Chart Components

This directory contains interactive chart components for the Energy Audit Platform, focusing on advanced interactivity features for energy data visualization.

## Overview

The chart components in this directory provide enhanced visualization capabilities for energy audit data, including:
- Hierarchical data drill-down
- Zoom and pan controls
- Linked charts that update together
- Interactive filtering
- Custom tooltips with extended information

These components build upon Chart.js with added features for better user interaction and data exploration.

## Components

### Core Components

#### ResponsiveAccessibleChart
A base chart component that ensures proper sizing, accessibility, and theming for all charts.

#### DrilldownChart
Enables hierarchical data exploration through interactive drill-down capabilities.

#### ZoomableChart
Provides zoom and pan capabilities for detailed data exploration.

#### ChartFilterControls
Adds filtering capabilities to any chart, including dataset visibility and value range filtering.

#### CustomTooltipWrapper
Enhances chart tooltips with extended information, comparisons, and recommendations.

### Example Components

#### DrilldownChartExample
Demonstrates how to use the DrilldownChart component with hierarchical energy consumption data.

#### ZoomableChartExample
Shows how to use the ZoomableChart component for detailed exploration of time series data.

#### LinkedChartsExample
Demonstrates how multiple charts can be linked together, where interactions with one chart automatically update other related charts.

#### ChartFilterControlsExample
Shows how to add filtering capabilities directly on charts.

#### CustomTooltipsExample
Demonstrates how to implement custom tooltips with extended contextual information.

## Usage

### DrilldownChart

```jsx
import DrilldownChart from './DrilldownChart';

// Define hierarchical data
const energyData = {
  id: 'total',
  label: 'Total Energy',
  data: 125000,
  children: [
    {
      id: 'hvac',
      label: 'HVAC',
      data: 45000,
      children: [
        { id: 'cooling', label: 'Cooling', data: 25000 },
        { id: 'heating', label: 'Heating', data: 20000 }
      ]
    },
    {
      id: 'lighting',
      label: 'Lighting',
      data: 35000,
      children: [
        { id: 'interior', label: 'Interior', data: 25000 },
        { id: 'exterior', label: 'Exterior', data: 10000 }
      ]
    }
  ]
};

// Implement the chart
<DrilldownChart
  title="Energy Consumption Breakdown"
  rootNode={energyData}
  chartType="pie"
  themeName="energy"
  showBreadcrumbs={true}
  sizePreset="dashboard"
/>
```

### ZoomableChart

```jsx
import ZoomableChart from './ZoomableChart';

// Define chart configuration
const chartConfig = {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Energy Consumption (kWh)',
      data: [1200, 1350, 980, 850, 750, 900, 1050, 1100, 950, 850, 950, 1100],
      borderColor: '#4285F4',
      backgroundColor: '#4285F433'
    }]
  }
};

// Implement the chart
<ZoomableChart
  title="Energy Consumption Trends"
  configuration={chartConfig}
  themeName="energy"
  enableWheelZoom={true}
  enableDragPan={true}
  maxZoom={5}
  sizePreset="dashboard"
/>
```

### ChartFilterControls

```jsx
import ChartFilterControls from './ChartFilterControls';
import { ResponsiveAccessibleChart } from './index';

// Chart data
const [chartData, setChartData] = useState(/* ... */);
const [filteredData, setFilteredData] = useState(/* ... */);

// Chart configuration
const chartConfig = {
  type: 'bar',
  data: filteredData,
  options: {/* ... */}
};

// Handle filters applied
const handleFiltersApplied = (data) => {
  setFilteredData(data);
};

// Implement the chart with filter controls
<Box position="relative">
  <ResponsiveAccessibleChart
    configuration={chartConfig}
    themeName="energy"
    sizePreset="dashboard"
  />
  
  <ChartFilterControls
    chartData={chartData}
    position="top-right"
    enableDatasetFilters={true}
    enableValueRange={true}
    valueRangeBounds={[0, 2000]}
    valueRangeLabels={{ min: 'Min', max: 'Max', unit: 'kWh' }}
    onFiltersApplied={handleFiltersApplied}
  />
</Box>
```

### CustomTooltipWrapper

```jsx
import CustomTooltipWrapper from './CustomTooltips';

// Chart configuration
const chartConfig = {/* ... */};

// Extended tooltip data function
const getExtendedData = (dataIndex, datasetIndex) => {
  return {
    title: 'Energy Consumption Details',
    details: {
      'Consumption': '1200 kWh',
      'Daily Average': '40 kWh',
      'Efficiency Rating': 'Good'
    },
    comparison: {
      label: 'Year-over-Year',
      current: 1200,
      previous: 1350,
      unit: ' kWh',
      change: {
        value: 150,
        percentage: 11.1,
        positive: false
      }
    },
    recommendations: [
      'Continue monitoring energy usage',
      'Consider additional efficiency improvements'
    ]
  };
};

// Tooltip options
const tooltipOptions = {
  useHTML: true,
  showExtendedData: true,
  getExtendedData: getExtendedData
};

// Implement the chart with custom tooltips
<CustomTooltipWrapper
  chartConfig={chartConfig}
  tooltipOptions={tooltipOptions}
  themeName="energy"
  sizePreset="dashboard"
/>
```

## Configuration Options

### Theming
All charts support three built-in themes:
- `default`: Standard Chart.js styling
- `energy`: Optimized for energy data visualization
- `financial`: Optimized for financial data visualization

### Size Presets
Charts can be configured with size presets:
- `compact`: Small charts for dashboards or inline views
- `standard`: Default size for general use
- `large`: Expanded view for detailed analysis
- `report`: Optimized for report exports
- `dashboard`: Optimized for dashboard display

### Accessibility
All charts include accessibility features:
- ARIA labels for screen readers
- Keyboard navigation
- High contrast mode support
- Alternative text descriptions
- Data table views

## Development and Extension

To add new chart types or features:
1. Create a new component in this directory
2. Import and use the base components as needed
3. Add appropriate TypeScript interfaces and type definitions
4. Create an example component to demonstrate usage
5. Update the implementation progress and documentation

## Dependencies

- Chart.js: Core charting library
- chartjs-plugin-zoom: Adds zoom and pan functionality
- Material-UI: UI components and theming

## Next Steps

See [implementation-progress.md](./implementation-progress.md) for details on upcoming features and improvements. 