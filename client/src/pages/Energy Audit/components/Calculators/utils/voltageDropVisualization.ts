/**
 * Voltage Drop Visualization Utilities
 * 
 * This module provides functions for visualizing voltage drop data using Chart.js
 */
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { VoltageRegulationInputs, VoltageRegulationResult, VOLTAGE_DROP_LIMITS } from './voltageRegulationUtils';

/**
 * Interface for voltage drop visualization options
 */
export interface VoltageDropVisualizationOptions {
  showLimits?: boolean;
  colorScheme?: 'default' | 'accessibility' | 'print';
  darkMode?: boolean;
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
    }
  }
};

/**
 * Creates a configuration for Chart.js to visualize voltage drop along a conductor
 * 
 * @param result - Voltage regulation calculation result
 * @param inputs - Voltage regulation calculation inputs
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createVoltageDropProfileConfig(
  result: VoltageRegulationResult,
  inputs: VoltageRegulationInputs,
  options: VoltageDropVisualizationOptions = {}
): ChartConfiguration {
  const {
    showLimits = true,
    colorScheme = 'default',
    darkMode = false
  } = options;

  // Calculate voltage at different points along the conductor
  const numPoints = 20; // Number of points to plot
  const stepSize = inputs.conductorLength / numPoints;
  
  const points = Array.from({ length: numPoints + 1 }, (_, i) => {
    const distance = i * stepSize;
    const voltageDrop = (distance / inputs.conductorLength) * result.voltageDrop;
    return {
      distance,
      voltage: inputs.systemVoltage - voltageDrop
    };
  });

  // Prepare data for chart
  const labels = points.map(p => `${p.distance.toFixed(0)}m`);
  const voltageValues = points.map(p => p.voltage);
  
  // Calculate voltage limits based on PEC requirements
  const feederLimitVoltage = inputs.systemVoltage * (1 - VOLTAGE_DROP_LIMITS.feeder / 100);
  const branchLimitVoltage = inputs.systemVoltage * (1 - VOLTAGE_DROP_LIMITS.branch / 100);
  
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

  const datasets: any[] = [
    {
      label: 'Voltage Profile',
      data: voltageValues,
      backgroundColor: colors.voltageDrop.backgroundColor,
      borderColor: colors.voltageDrop.borderColor,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 2,
    }
  ];

  // Add limit lines if enabled
  if (showLimits) {
    datasets.push({
      label: 'Feeder Limit (2%)',
      data: Array(labels.length).fill(feederLimitVoltage),
      borderColor: colors.limit.borderColor,
      borderDash: colors.limit.borderDash,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    });
    
    datasets.push({
      label: 'Branch Circuit Limit (3%)',
      data: Array(labels.length).fill(branchLimitVoltage),
      borderColor: 'rgba(255, 159, 64, 0.8)',
      borderDash: [5, 5],
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
          }
        }
      }
    }
  };

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
 * @param baseInputs - Base voltage regulation calculation inputs
 * @param conductorSizes - Array of conductor sizes to compare
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createConductorComparisonConfig(
  baseInputs: VoltageRegulationInputs,
  conductorSizes: string[],
  options: VoltageDropVisualizationOptions = {}
): ChartConfiguration {
  const {
    showLimits = true,
    colorScheme = 'default',
    darkMode = false
  } = options;

  // Generate a different color for each conductor size
  const generateColors = (index: number, alpha: number = 0.5) => {
    const hue = (index * 137.5) % 360; // Use golden angle approximation for good distribution
    return `hsla(${hue}, 70%, 60%, ${alpha})`;
  };

  // Calculate voltage drops for each conductor size
  let datasets: any[] = conductorSizes.map((size, index) => {
    // Create a modified input with this conductor size
    const modifiedInputs: VoltageRegulationInputs = {
      ...baseInputs,
      conductorSize: size
    };
    
    // Calculate voltage drop percentage for this size
    const dropPercent = calculateVoltageDropPercentage(modifiedInputs);
    
    return {
      label: `${size} (${dropPercent.toFixed(2)}%)`,
      data: [dropPercent],
      backgroundColor: generateColors(index, 0.7),
      borderColor: generateColors(index, 1),
      borderWidth: 1
    };
  });

  // Sort datasets by voltage drop (highest to lowest)
  datasets = datasets.sort((a, b) => b.data[0] - a.data[0]);

  // Add PEC limits if enabled
  if (showLimits) {
    datasets.push({
      label: 'Feeder Limit (2%)',
      data: [VOLTAGE_DROP_LIMITS.feeder],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      type: 'line'
    });
    
    datasets.push({
      label: 'Branch Circuit Limit (3%)',
      data: [VOLTAGE_DROP_LIMITS.branch],
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgb(255, 159, 64)',
      borderWidth: 2,
      type: 'line'
    });
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
            return `Voltage Drop: ${context.parsed.x.toFixed(2)}%`;
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

// Helper function to calculate voltage drop percentage
function calculateVoltageDropPercentage(inputs: VoltageRegulationInputs): number {
  // Simple estimation for chart purposes
  // This should match the behavior in voltageRegulationUtils.ts
  const { systemVoltage, loadPower, powerFactor, conductorLength, conductorSize, conductorMaterial, conduitMaterial, phaseConfiguration, temperature } = inputs;
  
  // Get circular mils for the conductor size (simplified example)
  let circularMils = 0;
  
  switch(conductorSize) {
    case '14 AWG': circularMils = 4110; break;
    case '12 AWG': circularMils = 6530; break;
    case '10 AWG': circularMils = 10380; break;
    case '8 AWG': circularMils = 16510; break;
    case '6 AWG': circularMils = 26240; break;
    case '4 AWG': circularMils = 41740; break;
    case '2 AWG': circularMils = 66360; break;
    case '1/0 AWG': circularMils = 105600; break;
    case '2/0 AWG': circularMils = 133100; break;
    case '3/0 AWG': circularMils = 167800; break;
    case '4/0 AWG': circularMils = 211600; break;
    default: circularMils = 10000; // Default value
  }
  
  // Calculate approx. current
  const current = phaseConfiguration === 'single-phase' ? 
    loadPower / (systemVoltage * powerFactor) : 
    loadPower / (Math.sqrt(3) * systemVoltage * powerFactor);
  
  // Calculate approx. resistance
  const resistivity = conductorMaterial === 'copper' ? 10.371 : 17.020;
  const tempCoefficient = conductorMaterial === 'copper' ? 0.00393 : 0.00403;
  const tempAdjustment = 1 + tempCoefficient * (temperature - 75);
  const resistance = (resistivity * tempAdjustment * conductorLength) / circularMils;
  
  // Calculate voltage drop (simplified formula for visualization purposes)
  const voltageDrop = phaseConfiguration === 'single-phase' ? 
    2 * current * resistance : 
    Math.sqrt(3) * current * resistance;
    
  return (voltageDrop / systemVoltage) * 100;
} 