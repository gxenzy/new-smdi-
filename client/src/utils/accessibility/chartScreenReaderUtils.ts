import { ChartConfiguration, ChartType } from 'chart.js';

/**
 * Types of trends that can be identified in chart data
 */
export enum TrendType {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  CYCLIC = 'cyclic',
  SPIKE_UP = 'spikeUp',
  SPIKE_DOWN = 'spikeDown',
  MIXED = 'mixed',
}

/**
 * Interface for a key point in chart data that should be announced
 */
export interface KeyPoint {
  label: string;
  value: number;
  index: number;
  description: string;
  type: 'max' | 'min' | 'average' | 'start' | 'end' | 'threshold' | 'custom';
}

/**
 * Interface for a trend description of chart data
 */
export interface TrendDescription {
  type: TrendType;
  description: string;
  changePercentage?: number;
  startValue?: number;
  endValue?: number;
}

/**
 * Interface for detailed chart description for screen readers
 */
export interface ChartScreenReaderDescription {
  title: string;
  summary: string;
  datasetDescriptions: DatasetDescription[];
  overallTrend?: TrendDescription;
  keyPoints: KeyPoint[];
  comparisonStatements: string[];
}

/**
 * Description of a single dataset within a chart
 */
export interface DatasetDescription {
  label: string;
  dataPoints: number;
  min: number;
  max: number;
  average: number;
  sum: number;
  trend?: TrendDescription;
  keyPoints: KeyPoint[];
}

/**
 * Creates a screen reader description for a chart
 * @param configuration Chart.js configuration object
 * @returns Detailed description object for screen reader announcements
 */
export function createChartDescription(configuration: ChartConfiguration): ChartScreenReaderDescription {
  const chartType = configuration.type as ChartType;
  const title = getChartTitle(configuration);
  const datasets = configuration.data.datasets || [];
  const labels = configuration.data.labels || [];
  
  // Initialize result
  const result: ChartScreenReaderDescription = {
    title,
    summary: '',
    datasetDescriptions: [],
    keyPoints: [],
    comparisonStatements: []
  };
  
  // Process each dataset
  datasets.forEach((dataset, datasetIndex) => {
    const datasetDesc = createDatasetDescription(
      dataset, 
      labels as string[], 
      (dataset.label || `Dataset ${datasetIndex + 1}`)
    );
    
    result.datasetDescriptions.push(datasetDesc);
    
    // Add key points from this dataset to the overall key points
    datasetDesc.keyPoints.forEach(point => {
      result.keyPoints.push(point);
    });
  });
  
  // Generate overall trend if this is a line or bar chart
  if (['line', 'bar'].includes(chartType) && datasets.length > 0) {
    result.overallTrend = identifyOverallTrend(datasets);
  }
  
  // Generate comparison statements for multiple datasets
  if (datasets.length > 1) {
    result.comparisonStatements = createComparisonStatements(result.datasetDescriptions);
  }
  
  // Create summary
  result.summary = createSummaryStatement(result, chartType);
  
  return result;
}

/**
 * Get chart title from configuration
 */
function getChartTitle(configuration: ChartConfiguration): string {
  if (configuration.options?.plugins?.title?.text) {
    const titleText = configuration.options.plugins.title.text;
    return Array.isArray(titleText) ? titleText.join(' ') : titleText;
  }
  return 'Chart';
}

/**
 * Create a description for a single dataset
 */
function createDatasetDescription(
  dataset: any, 
  labels: string[], 
  datasetLabel: string
): DatasetDescription {
  const data = dataset.data || [];
  
  // Calculate basic statistics
  const min = Math.min(...data.filter((d: any) => d !== null && d !== undefined));
  const max = Math.max(...data.filter((d: any) => d !== null && d !== undefined));
  const sum = data.reduce((acc: number, val: any) => {
    return acc + (typeof val === 'number' ? val : 0);
  }, 0);
  const average = data.length > 0 ? sum / data.filter((d: any) => d !== null && d !== undefined).length : 0;
  
  // Initialize dataset description
  const result: DatasetDescription = {
    label: datasetLabel,
    dataPoints: data.length,
    min,
    max,
    average,
    sum,
    keyPoints: []
  };
  
  // Identify key points
  result.keyPoints = identifyKeyPoints(data, labels, datasetLabel);
  
  // Identify trend
  result.trend = identifyTrend(data);
  
  return result;
}

/**
 * Identify key points in a dataset that should be highlighted
 */
function identifyKeyPoints(data: any[], labels: string[], datasetLabel: string): KeyPoint[] {
  const result: KeyPoint[] = [];
  const filteredData = data.filter((val) => val !== null && val !== undefined);
  
  if (filteredData.length === 0) return result;
  
  // Find minimum and maximum
  const min = Math.min(...filteredData);
  const max = Math.max(...filteredData);
  
  // Add min point
  const minIndex = data.findIndex(val => val === min);
  if (minIndex >= 0) {
    result.push({
      label: labels[minIndex] || `Point ${minIndex + 1}`,
      value: min,
      index: minIndex,
      description: `Minimum value for ${datasetLabel} is ${min} at ${labels[minIndex] || `point ${minIndex + 1}`}`,
      type: 'min'
    });
  }
  
  // Add max point
  const maxIndex = data.findIndex(val => val === max);
  if (maxIndex >= 0) {
    result.push({
      label: labels[maxIndex] || `Point ${maxIndex + 1}`,
      value: max,
      index: maxIndex,
      description: `Maximum value for ${datasetLabel} is ${max} at ${labels[maxIndex] || `point ${maxIndex + 1}`}`,
      type: 'max'
    });
  }
  
  // Add start and end if they're not already min or max
  if (data.length > 0 && data[0] !== min && data[0] !== max) {
    result.push({
      label: labels[0] || 'Start',
      value: data[0],
      index: 0,
      description: `Starting value for ${datasetLabel} is ${data[0]} at ${labels[0] || 'start'}`,
      type: 'start'
    });
  }
  
  if (data.length > 0 && data[data.length - 1] !== min && data[data.length - 1] !== max) {
    result.push({
      label: labels[data.length - 1] || 'End',
      value: data[data.length - 1],
      index: data.length - 1,
      description: `Ending value for ${datasetLabel} is ${data[data.length - 1]} at ${labels[data.length - 1] || 'end'}`,
      type: 'end'
    });
  }
  
  // Identify significant spikes (more than 30% change)
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const current = data[i];
    
    if (typeof prev !== 'number' || typeof current !== 'number') continue;
    
    const percentChange = Math.abs((current - prev) / prev) * 100;
    
    if (percentChange > 30) {
      result.push({
        label: labels[i] || `Point ${i + 1}`,
        value: current,
        index: i,
        description: `Significant ${current > prev ? 'increase' : 'decrease'} of ${percentChange.toFixed(0)}% to ${current} at ${labels[i] || `point ${i + 1}`}`,
        type: 'custom'
      });
    }
  }
  
  return result;
}

/**
 * Identify the trend in a dataset
 */
function identifyTrend(data: any[]): TrendDescription {
  const filteredData = data.filter((val) => val !== null && val !== undefined);
  
  if (filteredData.length < 2) {
    return {
      type: TrendType.STABLE,
      description: 'Insufficient data to determine trend',
      startValue: filteredData[0],
      endValue: filteredData[0]
    };
  }
  
  const startValue = filteredData[0];
  const endValue = filteredData[filteredData.length - 1];
  const changePercent = ((endValue - startValue) / Math.abs(startValue)) * 100;
  
  // Check if data is mostly increasing, decreasing, or stable
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < filteredData.length; i++) {
    if (filteredData[i] > filteredData[i - 1]) increases++;
    else if (filteredData[i] < filteredData[i - 1]) decreases++;
  }
  
  const increasesPercentage = increases / (filteredData.length - 1) * 100;
  const decreasesPercentage = decreases / (filteredData.length - 1) * 100;
  
  // Check for volatility
  const volatility = calculateVolatility(filteredData);
  
  // Check for cyclical patterns
  const isCyclic = checkForCyclicalPattern(filteredData);
  
  // Determine trend type
  let trendType: TrendType;
  let description: string;
  
  if (volatility > 50) {
    trendType = TrendType.VOLATILE;
    description = 'Values show high volatility with significant fluctuations';
  } else if (isCyclic) {
    trendType = TrendType.CYCLIC;
    description = 'Values show a cyclical pattern with repeating ups and downs';
  } else if (increasesPercentage > 70) {
    trendType = TrendType.INCREASING;
    description = `Values are predominantly increasing, with an overall change of ${changePercent.toFixed(1)}%`;
  } else if (decreasesPercentage > 70) {
    trendType = TrendType.DECREASING;
    description = `Values are predominantly decreasing, with an overall change of ${changePercent.toFixed(1)}%`;
  } else if (Math.abs(changePercent) < 10) {
    trendType = TrendType.STABLE;
    description = 'Values remain relatively stable with minor fluctuations';
  } else {
    trendType = TrendType.MIXED;
    description = `Values show a mixed pattern with both increases and decreases, ending with a ${changePercent > 0 ? 'net increase' : 'net decrease'} of ${Math.abs(changePercent).toFixed(1)}%`;
  }
  
  return {
    type: trendType,
    description,
    changePercentage: changePercent,
    startValue,
    endValue
  };
}

/**
 * Calculate volatility of data (standard deviation as percentage of mean)
 */
function calculateVolatility(data: number[]): number {
  if (data.length < 2) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  
  // If mean is close to zero, can't calculate meaningful volatility percentage
  if (Math.abs(mean) < 0.0001) return 100;
  
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // Return volatility as percentage of mean
  return (stdDev / Math.abs(mean)) * 100;
}

/**
 * Check for cyclical patterns in data
 */
function checkForCyclicalPattern(data: number[]): boolean {
  if (data.length < 6) return false;
  
  // A very simplified algorithm to detect patterns by looking for repeating sequences
  // More sophisticated algorithms would use Fourier transforms or autocorrelation
  
  // Check if values go up and down at least 3 times
  let peaks = 0;
  let valleys = 0;
  
  // Look for peaks and valleys
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i-1] && data[i] > data[i+1]) {
      peaks++;
    }
    if (data[i] < data[i-1] && data[i] < data[i+1]) {
      valleys++;
    }
  }
  
  // Consider it cyclical if we have at least 2 peaks and 2 valleys
  return peaks >= 2 && valleys >= 2;
}

/**
 * Identify overall trend across multiple datasets
 */
function identifyOverallTrend(datasets: any[]): TrendDescription {
  // Get the primary dataset (usually the first one)
  if (datasets.length === 0 || !datasets[0].data) {
    return {
      type: TrendType.STABLE,
      description: 'No data available to determine trend'
    };
  }
  
  // If there's just one dataset, use its trend
  if (datasets.length === 1) {
    return identifyTrend(datasets[0].data);
  }
  
  // With multiple datasets, analyze trends of each and summarize
  const trends = datasets.map(dataset => identifyTrend(dataset.data || []));
  
  // Count trend types
  const trendCounts = trends.reduce((counts: Record<string, number>, trend) => {
    counts[trend.type] = (counts[trend.type] || 0) + 1;
    return counts;
  }, {});
  
  // Find the most common trend
  let mostCommonTrend = TrendType.MIXED;
  let maxCount = 0;
  
  Object.entries(trendCounts).forEach(([trendType, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonTrend = trendType as TrendType;
    }
  });
  
  // Calculate average change percentage across all datasets
  const changePercentages = trends
    .filter(t => t.changePercentage !== undefined)
    .map(t => t.changePercentage as number);
  
  const avgChangePercent = changePercentages.length > 0
    ? changePercentages.reduce((sum, val) => sum + val, 0) / changePercentages.length
    : 0;
  
  // Generate overall description
  let description = '';
  switch (mostCommonTrend as string) {
    case TrendType.INCREASING:
      description = `Overall, most datasets show an increasing trend, with an average change of ${avgChangePercent.toFixed(1)}%`;
      break;
    case TrendType.DECREASING:
      description = `Overall, most datasets show a decreasing trend, with an average change of ${avgChangePercent.toFixed(1)}%`;
      break;
    case TrendType.STABLE:
      description = 'Overall, most datasets show a stable trend with little variation';
      break;
    case TrendType.VOLATILE:
      description = 'Overall, most datasets show significant volatility with large fluctuations';
      break;
    case TrendType.CYCLIC:
      description = 'Overall, most datasets show cyclical patterns with repeating ups and downs';
      break;
    default:
      description = 'Overall, datasets show mixed trends with no clear pattern';
      break;
  }
  
  return {
    type: mostCommonTrend,
    description,
    changePercentage: avgChangePercent
  };
}

/**
 * Create comparison statements for multiple datasets
 */
function createComparisonStatements(datasetDescriptions: DatasetDescription[]): string[] {
  if (datasetDescriptions.length < 2) return [];
  
  const statements: string[] = [];
  
  // Compare maximums
  const maxDataset = datasetDescriptions.reduce((max, current) => 
    current.max > max.max ? current : max, datasetDescriptions[0]);
  
  statements.push(`${maxDataset.label} has the highest maximum value of ${maxDataset.max}.`);
  
  // Compare minimums
  const minDataset = datasetDescriptions.reduce((min, current) => 
    current.min < min.min ? current : min, datasetDescriptions[0]);
  
  statements.push(`${minDataset.label} has the lowest minimum value of ${minDataset.min}.`);
  
  // Compare averages
  const highestAvgDataset = datasetDescriptions.reduce((max, current) => 
    current.average > max.average ? current : max, datasetDescriptions[0]);
  
  statements.push(`${highestAvgDataset.label} has the highest average value of ${highestAvgDataset.average.toFixed(1)}.`);
  
  // Compare trends if available
  const increasingDatasets = datasetDescriptions.filter(d => 
    d.trend && d.trend.type === TrendType.INCREASING).map(d => d.label);
  
  const decreasingDatasets = datasetDescriptions.filter(d => 
    d.trend && d.trend.type === TrendType.DECREASING).map(d => d.label);
  
  if (increasingDatasets.length > 0) {
    statements.push(`${increasingDatasets.join(', ')} ${increasingDatasets.length === 1 ? 'shows' : 'show'} an increasing trend.`);
  }
  
  if (decreasingDatasets.length > 0) {
    statements.push(`${decreasingDatasets.join(', ')} ${decreasingDatasets.length === 1 ? 'shows' : 'show'} a decreasing trend.`);
  }
  
  return statements;
}

/**
 * Create a summary statement for the entire chart
 */
function createSummaryStatement(
  description: ChartScreenReaderDescription, 
  chartType: ChartType
): string {
  const { title, datasetDescriptions, overallTrend, keyPoints } = description;
  const datasetCount = datasetDescriptions.length;
  
  let chartTypeDescription = '';
  switch (chartType) {
    case 'bar':
      chartTypeDescription = 'bar chart';
      break;
    case 'line':
      chartTypeDescription = 'line chart';
      break;
    case 'pie':
      chartTypeDescription = 'pie chart';
      break;
    case 'doughnut':
      chartTypeDescription = 'doughnut chart';
      break;
    case 'radar':
      chartTypeDescription = 'radar chart';
      break;
    case 'polarArea':
      chartTypeDescription = 'polar area chart';
      break;
    default:
      chartTypeDescription = 'chart';
  }
  
  let summary = `${title} is a ${chartTypeDescription} with ${datasetCount} dataset${datasetCount !== 1 ? 's' : ''}.`;
  
  // Add information specific to chart type
  if (['pie', 'doughnut'].includes(chartType)) {
    if (datasetDescriptions.length > 0 && datasetDescriptions[0].dataPoints > 0) {
      const totalItems = datasetDescriptions[0].dataPoints;
      summary += ` It shows ${totalItems} categories.`;
      
      // Add largest segment info if available
      const keyMax = keyPoints.find(point => point.type === 'max');
      if (keyMax) {
        summary += ` The largest segment is ${keyMax.label} at ${keyMax.value}.`;
      }
    }
  } else if (['line', 'bar'].includes(chartType)) {
    // Add trend information if available
    if (overallTrend) {
      summary += ` ${overallTrend.description}`;
    }
    
    // Add range information
    if (datasetDescriptions.length > 0) {
      const allMins = datasetDescriptions.map(d => d.min);
      const allMaxes = datasetDescriptions.map(d => d.max);
      const overallMin = Math.min(...allMins);
      const overallMax = Math.max(...allMaxes);
      
      summary += ` Values range from ${overallMin} to ${overallMax}.`;
    }
  }
  
  return summary;
}

/**
 * Generate a full text description of a chart for screen readers
 * @param configuration Chart.js configuration object
 * @returns Full text description for screen readers
 */
export function generateChartScreenReaderText(configuration: ChartConfiguration): string {
  const description = createChartDescription(configuration);
  let result = '';
  
  // Start with title and summary
  result += `${description.title}. ${description.summary}\n\n`;
  
  // Add dataset-specific information
  description.datasetDescriptions.forEach(dataset => {
    result += `${dataset.label}: `;
    
    if (dataset.trend) {
      result += `${dataset.trend.description} `;
    }
    
    result += `Values range from ${dataset.min} to ${dataset.max}, with an average of ${dataset.average.toFixed(1)}.\n`;
    
    // Add key points for this dataset
    if (dataset.keyPoints.length > 0) {
      result += 'Key points: ';
      dataset.keyPoints.forEach((point, index) => {
        result += point.description;
        if (index < dataset.keyPoints.length - 1) {
          result += '; ';
        }
      });
      result += '\n';
    }
    
    result += '\n';
  });
  
  // Add comparison statements
  if (description.comparisonStatements.length > 0) {
    result += 'Comparisons: ';
    description.comparisonStatements.forEach((statement, index) => {
      result += statement;
      if (index < description.comparisonStatements.length - 1) {
        result += ' ';
      }
    });
    result += '\n';
  }
  
  return result.trim();
}

/**
 * Creates a simplified data table representation of chart data for screen readers
 */
export function createAccessibleDataTable(configuration: ChartConfiguration): string {
  const datasets = configuration.data.datasets || [];
  const labels = configuration.data.labels || [];
  const title = getChartTitle(configuration);
  
  let table = `${title} - Data Table\n\n`;
  
  // Handle different chart types differently
  if (['pie', 'doughnut'].includes(configuration.type as string)) {
    // For pie/doughnut, we have categories and values
    table += 'Category\tValue\n';
    
    if (datasets.length > 0 && datasets[0].data) {
      const data = datasets[0].data;
      
      for (let i = 0; i < data.length; i++) {
        const label = labels[i] || `Item ${i + 1}`;
        table += `${label}\t${data[i]}\n`;
      }
    }
  } else {
    // For other charts, we have labels across the top and datasets as rows
    // Start with header row
    table += 'Dataset\t';
    labels.forEach((label, i) => {
      table += `${label || `Column ${i + 1}`}\t`;
    });
    table += '\n';
    
    // Add each dataset as a row
    datasets.forEach((dataset, i) => {
      const datasetLabel = dataset.label || `Dataset ${i + 1}`;
      table += `${datasetLabel}\t`;
      
      const data = dataset.data || [];
      data.forEach((value: any, j: number) => {
        table += `${value}\t`;
      });
      
      table += '\n';
    });
  }
  
  return table;
}

/**
 * Generates a concise chart announcement for immediate screen reader feedback
 * @param configuration Chart.js configuration
 * @returns Brief announcement text
 */
export function generateChartAnnouncement(configuration: ChartConfiguration): string {
  const title = getChartTitle(configuration);
  const chartType = configuration.type as ChartType;
  const datasets = configuration.data.datasets || [];
  
  let chartTypeDesc = '';
  switch (chartType) {
    case 'bar':
      chartTypeDesc = 'bar chart';
      break;
    case 'line':
      chartTypeDesc = 'line chart';
      break;
    case 'pie':
      chartTypeDesc = 'pie chart';
      break;
    case 'doughnut':
      chartTypeDesc = 'doughnut chart';
      break;
    case 'radar':
      chartTypeDesc = 'radar chart';
      break;
    case 'polarArea':
      chartTypeDesc = 'polar area chart';
      break;
    default:
      chartTypeDesc = 'chart';
  }
  
  let announcement = `${title}. This is a ${chartTypeDesc} with ${datasets.length} dataset${datasets.length !== 1 ? 's' : ''}.`;
  
  // Add a brief summary based on chart type
  if (['pie', 'doughnut'].includes(chartType)) {
    if (datasets.length > 0 && datasets[0].data) {
      announcement += ` It shows ${datasets[0].data.length} categories.`;
    }
  } else if (datasets.length > 0 && datasets[0].data) {
    // For other charts, mention data points
    announcement += ` Contains ${datasets[0].data.length} data points.`;
  }
  
  announcement += ' Press Enter to explore chart data in more detail.';
  
  return announcement;
}

/**
 * Generates accessible HTML for a hidden data table representation of chart data
 * @param configuration Chart.js configuration
 * @returns HTML for accessible data table
 */
export function generateAccessibleDataTableHTML(configuration: ChartConfiguration): string {
  const datasets = configuration.data.datasets || [];
  const labels = configuration.data.labels || [];
  const title = getChartTitle(configuration);
  
  let html = `<div class="sr-only" aria-live="polite">
    <h3>${title} - Data Table</h3>
    <table>
      <caption>${title}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>`;
  
  // For pie/doughnut, we have a simple table with categories and values
  if (['pie', 'doughnut'].includes(configuration.type as string)) {
    html += `<th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>`;
    
    if (datasets.length > 0 && datasets[0].data) {
      const data = datasets[0].data;
      
      for (let i = 0; i < data.length; i++) {
        const label = labels[i] || `Item ${i + 1}`;
        html += `<tr>
          <th scope="row">${label}</th>
          <td>${data[i]}</td>
        </tr>`;
      }
    }
  } else {
    // For other charts, we have labels across the top and datasets as rows
    // Add each label as a column header
    labels.forEach(label => {
      html += `<th scope="col">${label || ''}</th>`;
    });
    
    html += `</tr>
      </thead>
      <tbody>`;
    
    // Add each dataset as a row
    datasets.forEach((dataset, i) => {
      const datasetLabel = dataset.label || `Dataset ${i + 1}`;
      html += `<tr>
        <th scope="row">${datasetLabel}</th>`;
      
      const data = dataset.data || [];
      data.forEach((value: any) => {
        html += `<td>${value}</td>`;
      });
      
      html += `</tr>`;
    });
  }
  
  html += `
      </tbody>
    </table>
  </div>`;
  
  return html;
} 