/**
 * Voltage Drop Visualization Utilities
 * 
 * This module provides functions for visualizing voltage drop data using Chart.js
 */
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { CONDUCTOR_SIZES, VOLTAGE_DROP_LIMITS } from './voltageRegulationUtils';
import { 
  VoltageDropInputs, 
  VoltageDropResult,
  calculateVoltageDropPercentage
} from './voltageDropUtils';
import { downsampleVoltageProfile, DownsampleOptions } from './visualizationOptimizer';

/**
 * Interface for voltage drop visualization options
 */
export interface VoltageDropVisualizationOptions {
  showLimits?: boolean;
  colorScheme?: 'default' | 'accessibility' | 'print';
  darkMode?: boolean;
  downsampleOptions?: DownsampleOptions;
  showComplianceZones?: boolean;
}

// Define the color structure
interface ColorScheme {
  voltageDrop: {
    backgroundColor: string;
    borderColor: string;
  };
  limit: {
    borderColor: string;
    borderDash: number[];
  };
  complianceZones?: {
    compliant: string;
    warning: string;
    nonCompliant: string;
  };
}

/**
 * Default color scheme for voltage drop visualization
 */
const colorSchemes: Record<string, ColorScheme> = {
  default: {
    voltageDrop: {
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
    },
    limit: {
      borderColor: 'rgba(255, 99, 132, 0.8)',
      borderDash: [5, 5],
    },
    complianceZones: {
      compliant: 'rgba(75, 192, 192, 0.2)',   // Green zone
      warning: 'rgba(255, 205, 86, 0.2)',     // Yellow zone
      nonCompliant: 'rgba(255, 99, 132, 0.2)' // Red zone
    }
  },
  accessibility: {
    voltageDrop: {
      backgroundColor: 'rgba(0, 91, 187, 0.5)',
      borderColor: 'rgb(0, 91, 187)',
    },
    limit: {
      borderColor: 'rgba(216, 30, 91, 0.8)',
      borderDash: [5, 5],
    },
    complianceZones: {
      compliant: 'rgba(38, 114, 114, 0.2)',  // Darker green zone
      warning: 'rgba(204, 119, 34, 0.2)',    // Darker yellow/orange
      nonCompliant: 'rgba(153, 0, 51, 0.2)'  // Darker red zone
    }
  },
  print: {
    voltageDrop: {
      backgroundColor: 'rgba(80, 80, 80, 0.5)',
      borderColor: 'rgb(80, 80, 80)',
    },
    limit: {
      borderColor: 'rgba(160, 160, 160, 0.8)',
      borderDash: [5, 5],
    },
    complianceZones: {
      compliant: 'rgba(220, 220, 220, 0.2)',    // Light gray
      warning: 'rgba(180, 180, 180, 0.2)',      // Medium gray
      nonCompliant: 'rgba(140, 140, 140, 0.2)'  // Dark gray
    }
  }
};

/**
 * Creates a configuration for Chart.js to visualize voltage drop along a conductor
 * 
 * @param result - Voltage drop calculation result
 * @param inputs - Voltage drop calculation inputs
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createVoltageDropProfileConfig(
  result: VoltageDropResult,
  inputs: VoltageDropInputs,
  options: VoltageDropVisualizationOptions = {}
): ChartConfiguration {
  const {
    showLimits = true,
    colorScheme = 'default',
    darkMode = false,
    downsampleOptions = {
      maxPoints: 50,
      preserveExtremes: true,
      algorithm: 'lttb'
    },
    showComplianceZones = false
  } = options;

  // Use optimized downsampling for data points
  const { labels, voltageValues, distanceValues } = downsampleVoltageProfile(
    result,
    inputs,
    downsampleOptions
  );

  // Prepare datasets
  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Adjust colors for dark mode
  if (darkMode) {
    // Create a deep copy to avoid modifying the original
    const colorsCopy = JSON.parse(JSON.stringify(colors)) as ColorScheme;
    
    // Apply dark mode adjustments to copy
    if (colorsCopy.voltageDrop.backgroundColor) {
      colorsCopy.voltageDrop.backgroundColor = colorsCopy.voltageDrop.backgroundColor.replace(/[\d.]+\)$/, '0.7)');
    }
  }

  // Calculate voltage limits based on PEC requirements
  const limitVoltage = inputs.systemVoltage * (1 - result.maxAllowedDrop / 100);

  const datasets: any[] = [
    {
      label: 'Voltage Profile',
      data: voltageValues,
      backgroundColor: colors.voltageDrop.backgroundColor,
      borderColor: colors.voltageDrop.borderColor,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: voltageValues.length > 100 ? 0 : 2, // Hide points if too many
      pointHoverRadius: 4,
    }
  ];

  // Add limit line if enabled
  if (showLimits) {
    // For the specific circuit type
    const circuitTypeNames: Record<string, string> = {
      'branch': 'Branch Circuit',
      'feeder': 'Feeder',
      'service': 'Service',
      'motor': 'Motor Circuit'
    };
    
    const circuitTypeName = circuitTypeNames[inputs.circuitConfiguration.circuitType] || 'Circuit';
    
    datasets.push({
      label: `${circuitTypeName} Limit (${result.maxAllowedDrop}%)`,
      data: Array(labels.length).fill(limitVoltage),
      borderColor: colors.limit.borderColor,
      borderDash: colors.limit.borderDash,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    });
  }

  // Chart options
  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distance from Source (m)',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Voltage (V)',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#ddd' : '#666'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return `Distance: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + ' V';
            }
            return label;
          },
          afterLabel: (context) => {
            if (context.datasetIndex === 0) { // Only for voltage profile dataset
              const voltage = context.parsed.y;
              const voltageDropAtPoint = inputs.systemVoltage - voltage;
              const percentDropAtPoint = (voltageDropAtPoint / inputs.systemVoltage) * 100;
              return `Voltage Drop: ${percentDropAtPoint.toFixed(2)}%`;
            }
            // Return empty string instead of null to satisfy TypeScript
            return '';
          }
        }
      }
    }
  };

  // Add compliance zones if enabled
  if (showComplianceZones && colors.complianceZones) {
    // Create a dataset that we'll use to define the background areas
    const zoneColors = colors.complianceZones;
    
    // Calculate zone boundaries based on maximum allowed drop
    const warningThreshold = inputs.systemVoltage * (1 - (result.maxAllowedDrop * 0.8) / 100);
    const criticalThreshold = limitVoltage;
    
    // Register background plugin data
    if (!chartOptions.plugins) chartOptions.plugins = {};
    (chartOptions.plugins as any).beforeDraw = (chart: any) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const meta = chart.getDatasetMeta(0);
      
      if (!meta.data || meta.data.length === 0) return;
      
      // Get Y positions for thresholds
      const yScale = chart.scales.y;
      const safeY = yScale.getPixelForValue(inputs.systemVoltage);
      const warningY = yScale.getPixelForValue(warningThreshold);
      const criticalY = yScale.getPixelForValue(criticalThreshold);
      const bottomY = chartArea.bottom;
      
      // Draw zones
      ctx.save();
      
      // Compliant zone (top)
      ctx.fillStyle = zoneColors.compliant;
      ctx.fillRect(chartArea.left, safeY, chartArea.right - chartArea.left, warningY - safeY);
      
      // Warning zone (middle)
      ctx.fillStyle = zoneColors.warning;
      ctx.fillRect(chartArea.left, warningY, chartArea.right - chartArea.left, criticalY - warningY);
      
      // Non-compliant zone (bottom)
      ctx.fillStyle = zoneColors.nonCompliant;
      ctx.fillRect(chartArea.left, criticalY, chartArea.right - chartArea.left, bottomY - criticalY);
      
      ctx.restore();
    };
  }

  return {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: chartOptions
  } as ChartConfiguration;
}

/**
 * Creates a configuration for Chart.js to visualize voltage drop comparison
 * between different conductor sizes
 * 
 * @param baseInputs - Base voltage drop calculation inputs
 * @param conductorSizes - Array of conductor sizes to compare
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createConductorComparisonConfig(
  baseInputs: VoltageDropInputs,
  conductorSizes: string[],
  options: VoltageDropVisualizationOptions = {}
): ChartConfiguration {
  const {
    showLimits = true,
    colorScheme = 'default',
    darkMode = false,
    showComplianceZones = false
  } = options;

  // Generate a different color for each conductor size
  const generateColors = (index: number, alpha: number = 0.5) => {
    const hue = (index * 137.5) % 360; // Use golden angle approximation for good distribution
    return `hsla(${hue}, 70%, 60%, ${alpha})`;
  };

  // Get the limit based on circuit type
  let dropLimit = VOLTAGE_DROP_LIMITS.total;
  switch (baseInputs.circuitConfiguration.circuitType) {
    case 'branch':
      dropLimit = VOLTAGE_DROP_LIMITS.branch;
      break;
    case 'feeder':
    case 'service':
      dropLimit = VOLTAGE_DROP_LIMITS.feeder;
      break;
    case 'motor':
      dropLimit = 3.0; // Default for motor circuits
      break;
  }

  // Calculate voltage drops for each conductor size
  let datasets: any[] = conductorSizes.map((size, index) => {
    // Create a modified input with this conductor size
    const modifiedInputs: VoltageDropInputs = {
      ...baseInputs,
      conductorSize: size
    };
    
    // Calculate voltage drop percentage for this size
    const dropPercent = calculateVoltageDropPercentage(modifiedInputs);
    
    // Determine compliance status
    const isCompliant = dropPercent <= dropLimit;
    const isWarning = dropPercent > (dropLimit * 0.8) && dropPercent <= dropLimit;
    const isCritical = dropPercent > dropLimit;
    
    // Generate base colors
    let bgColor = generateColors(index, 0.7);
    let borderColor = generateColors(index, 1);
    
    // Apply compliance colors if enabled
    if (showComplianceZones) {
      const colors = colorSchemes[colorScheme]?.complianceZones;
      if (colors) {
        if (isCritical) {
          bgColor = colors.nonCompliant.replace('0.2', '0.7');
        } else if (isWarning) {
          bgColor = colors.warning.replace('0.2', '0.7');
        } else if (isCompliant) {
          bgColor = colors.compliant.replace('0.2', '0.7');
        }
      }
    }
    
    return {
      label: `${size} (${dropPercent.toFixed(2)}%)`,
      data: [dropPercent],
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: 1
    };
  });

  // Sort datasets by voltage drop (highest to lowest)
  datasets = datasets.sort((a, b) => b.data[0] - a.data[0]);

  // Add PEC limit for the specific circuit type
  if (showLimits) {
    // Circuit type label
    const circuitTypeNames: Record<string, string> = {
      'branch': 'Branch Circuit',
      'feeder': 'Feeder',
      'service': 'Service',
      'motor': 'Motor Circuit'
    };
    
    const circuitTypeName = circuitTypeNames[baseInputs.circuitConfiguration.circuitType] || 'Circuit';
    
    datasets.push({
      label: `${circuitTypeName} Limit (${dropLimit}%)`,
      data: [dropLimit],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      type: 'line'
    });
    
    // Add warning threshold if showing compliance zones
    if (showComplianceZones) {
      datasets.push({
        label: `Warning Threshold (${(dropLimit * 0.8).toFixed(1)}%)`,
        data: [dropLimit * 0.8],
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        borderColor: 'rgb(255, 205, 86)',
        borderWidth: 2,
        borderDash: [5, 5],
        type: 'line'
      });
    }
  }

  // Chart options
  const chartOptions: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Voltage Drop (%)',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Conductor Size',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#ddd' : '#666'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label.includes('Limit') || label.includes('Threshold')) {
              return label;
            }
            
            const dropValue = context.parsed.x;
            const isCompliant = dropValue <= dropLimit;
            const status = isCompliant ? 'Compliant' : 'Non-compliant';
            
            return [
              `Voltage Drop: ${dropValue.toFixed(2)}%`,
              `Status: ${status}`
            ];
          }
        }
      }
    }
  };

  return {
    type: 'bar',
    data: {
      labels: ['Voltage Drop'],
      datasets
    },
    options: chartOptions
  } as ChartConfiguration;
} 