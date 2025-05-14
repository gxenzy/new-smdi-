import { Chart, ChartType, ChartTypeRegistry } from 'chart.js';
import { LineControllerDatasetOptions, PointOptions, BarControllerDatasetOptions, DoughnutControllerDatasetOptions, PieControllerDatasetOptions, RadarControllerDatasetOptions, ScatterControllerDatasetOptions } from 'chart.js';

// Type for a chart dataset with type-specific properties
type ChartDatasetWithOptions = {
  // Common properties
  backgroundColor?: string | string[] | any;
  borderColor?: string | string[] | any;
  borderWidth?: number | number[] | any;
  data: any[];
  // Line/Radar/Scatter chart specific
  pointBackgroundColor?: string | string[] | any;
  pointBorderColor?: string | string[] | any;
  pointBorderWidth?: number | number[] | any;
  pointRadius?: number | number[] | any;
  hoverRadius?: number | number[] | any;
  // Pie/Doughnut chart specific
  offset?: number | number[] | any;
};

/**
 * Stores the original state of charts to allow for restoration when focus changes
 */
interface ChartOriginalState {
  backgroundColor?: (string | { [key: string]: any })[];
  borderColor?: (string | { [key: string]: any })[];
  borderWidth?: (number | { [key: string]: any })[];
  pointBackgroundColor?: (string | { [key: string]: any })[];
  pointBorderColor?: (string | { [key: string]: any })[];
  pointBorderWidth?: (number | { [key: string]: any })[];
  pointRadius?: (number | { [key: string]: any })[];
  hoverRadius?: (number | { [key: string]: any })[];
  offset?: (number | { [key: string]: any })[];
}

// Keep a reference to original chart states
const chartOriginalStates = new WeakMap<Chart, ChartOriginalState[]>();

/**
 * Saves the original state of a chart's datasets to allow for restoration
 * 
 * @param chart Chart instance to save state for
 */
export const saveOriginalChartState = (chart: Chart): void => {
  const originalStates: ChartOriginalState[] = [];
  
  chart.data.datasets.forEach((dataset) => {
    // Cast to our utility type that includes all possible properties
    const typedDataset = dataset as unknown as ChartDatasetWithOptions;
    const originalState: ChartOriginalState = {};
    
    // Save original colors and styles
    if (typedDataset.backgroundColor) {
      originalState.backgroundColor = Array.isArray(typedDataset.backgroundColor) 
        ? [...typedDataset.backgroundColor] 
        : [typedDataset.backgroundColor];
    }
    
    if (typedDataset.borderColor) {
      originalState.borderColor = Array.isArray(typedDataset.borderColor) 
        ? [...typedDataset.borderColor] 
        : [typedDataset.borderColor];
    }
    
    if (typedDataset.borderWidth) {
      originalState.borderWidth = Array.isArray(typedDataset.borderWidth) 
        ? [...typedDataset.borderWidth] 
        : [typedDataset.borderWidth];
    }
    
    // Point styles for line charts
    if (typedDataset.pointBackgroundColor) {
      originalState.pointBackgroundColor = Array.isArray(typedDataset.pointBackgroundColor) 
        ? [...typedDataset.pointBackgroundColor] 
        : [typedDataset.pointBackgroundColor];
    }
    
    if (typedDataset.pointBorderColor) {
      originalState.pointBorderColor = Array.isArray(typedDataset.pointBorderColor) 
        ? [...typedDataset.pointBorderColor] 
        : [typedDataset.pointBorderColor];
    }
    
    if (typedDataset.pointBorderWidth) {
      originalState.pointBorderWidth = Array.isArray(typedDataset.pointBorderWidth) 
        ? [...typedDataset.pointBorderWidth] 
        : [typedDataset.pointBorderWidth];
    }
    
    if (typedDataset.pointRadius) {
      originalState.pointRadius = Array.isArray(typedDataset.pointRadius) 
        ? [...typedDataset.pointRadius] 
        : [typedDataset.pointRadius];
    }
    
    if (typedDataset.hoverRadius) {
      originalState.hoverRadius = Array.isArray(typedDataset.hoverRadius) 
        ? [...typedDataset.hoverRadius] 
        : [typedDataset.hoverRadius];
    }
    
    // For pie/doughnut charts
    if (typedDataset.offset) {
      originalState.offset = Array.isArray(typedDataset.offset) 
        ? [...typedDataset.offset] 
        : [typedDataset.offset];
    }
    
    originalStates.push(originalState);
  });
  
  chartOriginalStates.set(chart, originalStates);
};

/**
 * Restores the original state of a chart's datasets
 * 
 * @param chart Chart instance to restore state for
 */
export const restoreOriginalChartState = (chart: Chart): void => {
  const originalStates = chartOriginalStates.get(chart);
  
  if (!originalStates) {
    console.warn('No original state found for chart');
    return;
  }
  
  chart.data.datasets.forEach((dataset, datasetIndex) => {
    // Cast to our utility type that includes all possible properties
    const typedDataset = dataset as unknown as ChartDatasetWithOptions;
    const originalState = originalStates[datasetIndex];
    
    if (!originalState) return;
    
    // Restore original colors and styles
    if (originalState.backgroundColor) {
      typedDataset.backgroundColor = originalState.backgroundColor.length === 1 
        ? originalState.backgroundColor[0] 
        : originalState.backgroundColor;
    }
    
    if (originalState.borderColor) {
      typedDataset.borderColor = originalState.borderColor.length === 1 
        ? originalState.borderColor[0] 
        : originalState.borderColor;
    }
    
    if (originalState.borderWidth) {
      typedDataset.borderWidth = originalState.borderWidth.length === 1 
        ? originalState.borderWidth[0] 
        : originalState.borderWidth;
    }
    
    // Point styles for line charts
    if (originalState.pointBackgroundColor) {
      typedDataset.pointBackgroundColor = originalState.pointBackgroundColor.length === 1 
        ? originalState.pointBackgroundColor[0] 
        : originalState.pointBackgroundColor;
    }
    
    if (originalState.pointBorderColor) {
      typedDataset.pointBorderColor = originalState.pointBorderColor.length === 1 
        ? originalState.pointBorderColor[0] 
        : originalState.pointBorderColor;
    }
    
    if (originalState.pointBorderWidth) {
      typedDataset.pointBorderWidth = originalState.pointBorderWidth.length === 1 
        ? originalState.pointBorderWidth[0] 
        : originalState.pointBorderWidth;
    }
    
    if (originalState.pointRadius) {
      typedDataset.pointRadius = originalState.pointRadius.length === 1 
        ? originalState.pointRadius[0] 
        : originalState.pointRadius;
    }
    
    if (originalState.hoverRadius) {
      typedDataset.hoverRadius = originalState.hoverRadius.length === 1 
        ? originalState.hoverRadius[0] 
        : originalState.hoverRadius;
    }
    
    // For pie/doughnut charts
    if (originalState.offset) {
      typedDataset.offset = originalState.offset.length === 1 
        ? originalState.offset[0] 
        : originalState.offset;
    }
  });
  
  // Update the chart
  chart.update();
};

/**
 * Highlights a specific data point in a chart
 * 
 * @param chart The Chart.js chart instance
 * @param datasetIndex Index of the dataset containing the data point
 * @param dataIndex Index of the data point within the dataset
 * @param chartType Type of chart
 */
export const highlightFocusedElement = (
  chart: Chart,
  datasetIndex: number,
  dataIndex: number,
  chartType: ChartType
): void => {
  // Save original state if not already saved
  if (!chartOriginalStates.has(chart)) {
    saveOriginalChartState(chart);
  } else {
    // Restore original state first to clear any previous highlights
    restoreOriginalChartState(chart);
  }
  
  // Apply highlight to focused element
  if (chart.data.datasets[datasetIndex]) {
    // Cast to our utility type that includes all possible properties
    const dataset = chart.data.datasets[datasetIndex] as unknown as ChartDatasetWithOptions;
    
    // Focus color - use a bright, accessible color that works with both light and dark themes
    const focusColor = '#ffbb00'; // bright gold/yellow
    const focusAlpha = 0.85;
    
    // Highlight strategies depend on chart type
    switch (chartType) {
      case 'bar':
        // Highlight specific bar
        if (Array.isArray(dataset.backgroundColor)) {
          // Create a focused version of the background color
          const originalColor = dataset.backgroundColor[dataIndex];
          dataset.backgroundColor[dataIndex] = focusColor;
        }
        
        // Increase border width for focused element
        if (Array.isArray(dataset.borderWidth)) {
          dataset.borderWidth[dataIndex] = 3; // Increase border width
        } else {
          const borderWidths = new Array(dataset.data.length).fill(dataset.borderWidth || 1);
          borderWidths[dataIndex] = 3;
          dataset.borderWidth = borderWidths;
        }
        
        // Add border color if not present
        if (!dataset.borderColor) {
          const borderColors = new Array(dataset.data.length).fill('rgba(0,0,0,0)');
          borderColors[dataIndex] = '#000000';
          dataset.borderColor = borderColors;
        } else if (Array.isArray(dataset.borderColor)) {
          // Store original color and set focus color
          dataset.borderColor[dataIndex] = '#000000';
        }
        break;
        
      case 'line':
        // Highlight specific point
        // Increase point border width
        if (dataset.pointBorderWidth !== undefined) {
          if (Array.isArray(dataset.pointBorderWidth)) {
            dataset.pointBorderWidth[dataIndex] = 3;
          } else {
            const pointBorderWidths = new Array(dataset.data.length).fill(dataset.pointBorderWidth);
            pointBorderWidths[dataIndex] = 3;
            dataset.pointBorderWidth = pointBorderWidths;
          }
        }
        
        // Increase point size
        if (dataset.pointRadius !== undefined) {
          if (Array.isArray(dataset.pointRadius)) {
            dataset.pointRadius[dataIndex] = Math.max(dataset.pointRadius[dataIndex] * 1.5, 6);
          } else {
            const pointRadii = new Array(dataset.data.length).fill(dataset.pointRadius);
            pointRadii[dataIndex] = Math.max(dataset.pointRadius * 1.5, 6);
            dataset.pointRadius = pointRadii;
          }
        }
        
        // Change point background color
        if (dataset.pointBackgroundColor !== undefined) {
          if (Array.isArray(dataset.pointBackgroundColor)) {
            dataset.pointBackgroundColor[dataIndex] = focusColor;
          } else {
            const pointColors = new Array(dataset.data.length).fill(dataset.pointBackgroundColor);
            pointColors[dataIndex] = focusColor;
            dataset.pointBackgroundColor = pointColors;
          }
        }
        break;
        
      case 'pie':
      case 'doughnut':
        // Highlight specific segment by offsetting it
        if (dataset.offset !== undefined) {
          if (Array.isArray(dataset.offset)) {
            dataset.offset[dataIndex] = 10; // Offset the segment
          } else {
            const offsets = new Array(dataset.data.length).fill(dataset.offset || 0);
            offsets[dataIndex] = 10;
            dataset.offset = offsets;
          }
        } else {
          const offsets = new Array(dataset.data.length).fill(0);
          offsets[dataIndex] = 10;
          dataset.offset = offsets;
        }
        
        // Add a border to the focused segment
        if (dataset.borderWidth !== undefined) {
          if (Array.isArray(dataset.borderWidth)) {
            dataset.borderWidth[dataIndex] = 3;
          } else {
            const borderWidths = new Array(dataset.data.length).fill(dataset.borderWidth);
            borderWidths[dataIndex] = 3;
            dataset.borderWidth = borderWidths;
          }
        } else {
          const borderWidths = new Array(dataset.data.length).fill(0);
          borderWidths[dataIndex] = 3;
          dataset.borderWidth = borderWidths;
        }
        break;
        
      case 'radar':
        // Highlight specific point on radar chart
        if (dataset.pointBackgroundColor !== undefined) {
          if (Array.isArray(dataset.pointBackgroundColor)) {
            dataset.pointBackgroundColor[dataIndex] = focusColor;
          } else {
            const pointColors = new Array(dataset.data.length).fill(dataset.pointBackgroundColor);
            pointColors[dataIndex] = focusColor;
            dataset.pointBackgroundColor = pointColors;
          }
        }
        
        // Increase point size
        if (dataset.pointRadius !== undefined) {
          if (Array.isArray(dataset.pointRadius)) {
            dataset.pointRadius[dataIndex] = Math.max(dataset.pointRadius[dataIndex] * 1.5, 6);
          } else {
            const pointRadii = new Array(dataset.data.length).fill(dataset.pointRadius);
            pointRadii[dataIndex] = Math.max(dataset.pointRadius * 1.5, 6);
            dataset.pointRadius = pointRadii;
          }
        }
        break;
        
      case 'scatter':
        // Highlight specific point on scatter chart
        if (dataset.backgroundColor !== undefined) {
          if (Array.isArray(dataset.backgroundColor)) {
            dataset.backgroundColor[dataIndex] = focusColor;
          } else {
            const bgColors = new Array(dataset.data.length).fill(dataset.backgroundColor);
            bgColors[dataIndex] = focusColor;
            dataset.backgroundColor = bgColors;
          }
        }
        
        // Increase point size
        if (dataset.pointRadius !== undefined) {
          if (Array.isArray(dataset.pointRadius)) {
            dataset.pointRadius[dataIndex] = Math.max(dataset.pointRadius[dataIndex] * 1.5, 6);
          } else {
            const pointRadii = new Array(dataset.data.length).fill(dataset.pointRadius);
            pointRadii[dataIndex] = Math.max(dataset.pointRadius * 1.5, 6);
            dataset.pointRadius = pointRadii;
          }
        }
        break;
    }
  }
  
  // Update the chart
  chart.update();
};

/**
 * Clears all focus indicators from a chart
 * 
 * @param chart The Chart.js chart instance
 */
export const clearFocusIndicators = (chart: Chart): void => {
  if (chartOriginalStates.has(chart)) {
    restoreOriginalChartState(chart);
  }
}; 