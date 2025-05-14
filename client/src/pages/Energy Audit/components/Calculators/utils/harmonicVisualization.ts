/**
 * Harmonic Visualization Utilities
 * 
 * This module provides functions for visualizing harmonic distortion data using Chart.js
 */
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';

/**
 * Interface for harmonic measurement data
 */
export interface HarmonicMeasurement {
  order: number;
  voltage: string | number;
  current: string | number;
}

/**
 * Interface for harmonic visualization options
 */
export interface HarmonicVisualizationOptions {
  showVoltage?: boolean;
  showCurrent?: boolean;
  showLimits?: boolean;
  colorScheme?: 'default' | 'accessibility' | 'print';
  darkMode?: boolean;
}

// Define the color structure
interface ColorScheme {
  voltage: {
    backgroundColor: string;
    borderColor: string;
  };
  current: {
    backgroundColor: string;
    borderColor: string;
  };
  voltageLimit: {
    borderColor: string;
    borderDash: number[];
  };
  currentLimit: {
    borderColor: string;
    borderDash: number[];
  };
}

/**
 * Default color scheme for harmonic visualization
 */
const colorSchemes: Record<string, ColorScheme> = {
  default: {
    voltage: {
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
    },
    current: {
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
    },
    voltageLimit: {
      borderColor: 'rgba(54, 162, 235, 0.8)',
      borderDash: [5, 5],
    },
    currentLimit: {
      borderColor: 'rgba(255, 99, 132, 0.8)',
      borderDash: [5, 5],
    }
  },
  accessibility: {
    voltage: {
      backgroundColor: 'rgba(0, 91, 187, 0.5)',
      borderColor: 'rgb(0, 91, 187)',
    },
    current: {
      backgroundColor: 'rgba(216, 30, 91, 0.5)',
      borderColor: 'rgb(216, 30, 91)',
    },
    voltageLimit: {
      borderColor: 'rgba(0, 91, 187, 0.8)',
      borderDash: [5, 5],
    },
    currentLimit: {
      borderColor: 'rgba(216, 30, 91, 0.8)',
      borderDash: [5, 5],
    }
  },
  print: {
    voltage: {
      backgroundColor: 'rgba(80, 80, 80, 0.5)',
      borderColor: 'rgb(80, 80, 80)',
    },
    current: {
      backgroundColor: 'rgba(160, 160, 160, 0.5)',
      borderColor: 'rgb(160, 160, 160)',
    },
    voltageLimit: {
      borderColor: 'rgba(80, 80, 80, 0.8)',
      borderDash: [5, 5],
    },
    currentLimit: {
      borderColor: 'rgba(160, 160, 160, 0.8)',
      borderDash: [5, 5],
    }
  }
};

/**
 * Creates a configuration for Chart.js to visualize harmonic spectrum
 * 
 * @param harmonics - Array of harmonic measurements
 * @param fundamentalValues - Fundamental voltage and current values
 * @param limits - Voltage and current limits for each harmonic
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createHarmonicSpectrumConfig(
  harmonics: HarmonicMeasurement[],
  fundamentalValues: { voltage: number; current: number },
  limits: { voltageLimit: number; currentLimits: number[] },
  options: HarmonicVisualizationOptions = {}
): ChartConfiguration {
  const {
    showVoltage = true,
    showCurrent = true,
    showLimits = true,
    colorScheme = 'default',
    darkMode = false
  } = options;

  // Sort harmonics by order
  const sortedHarmonics = [...harmonics].sort((a, b) => a.order - b.order);
  
  // Prepare labels and datasets
  const labels = sortedHarmonics.map(h => `${h.order}`);
  
  // Calculate percentage values
  const voltageValues = sortedHarmonics.map(h => {
    const voltageValue = typeof h.voltage === 'string' ? parseFloat(h.voltage) : h.voltage;
    return (voltageValue / fundamentalValues.voltage) * 100;
  });
  
  const currentValues = sortedHarmonics.map(h => {
    const currentValue = typeof h.current === 'string' ? parseFloat(h.current) : h.current;
    return (currentValue / fundamentalValues.current) * 100;
  });

  // Prepare datasets
  const datasets: any[] = [];
  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Adjust colors for dark mode
  if (darkMode) {
    // Create a deep copy to avoid modifying the original
    const colorsCopy = JSON.parse(JSON.stringify(colors)) as ColorScheme;
    
    // Apply dark mode adjustments to copy
    if (colorsCopy.voltage.backgroundColor) {
      colorsCopy.voltage.backgroundColor = colorsCopy.voltage.backgroundColor.replace(/[\d.]+\)$/, '0.7)');
    }
    if (colorsCopy.current.backgroundColor) {
      colorsCopy.current.backgroundColor = colorsCopy.current.backgroundColor.replace(/[\d.]+\)$/, '0.7)');
    }
  }

  // Add voltage dataset if enabled
  if (showVoltage) {
    datasets.push({
      label: 'Voltage Distortion (%)',
      data: voltageValues,
      backgroundColor: colors.voltage.backgroundColor,
      borderColor: colors.voltage.borderColor,
      borderWidth: 1,
      order: 1
    });
  }

  // Add current dataset if enabled
  if (showCurrent) {
    datasets.push({
      label: 'Current Distortion (%)',
      data: currentValues,
      backgroundColor: colors.current.backgroundColor,
      borderColor: colors.current.borderColor,
      borderWidth: 1,
      order: 2
    });
  }

  // Add limit lines if enabled
  if (showLimits) {
    if (showVoltage) {
      // Add constant voltage limit line
      datasets.push({
        label: 'Voltage Limit',
        data: Array(labels.length).fill(limits.voltageLimit),
        borderColor: colors.voltageLimit.borderColor,
        borderDash: colors.voltageLimit.borderDash,
        borderWidth: 2,
        pointRadius: 0,
        type: 'line' as const,
        fill: false,
        order: 3
      });
    }

    if (showCurrent) {
      // Create current limit datasets based on harmonic orders
      datasets.push({
        label: 'Current Limit',
        data: limits.currentLimits,
        borderColor: colors.currentLimit.borderColor,
        borderDash: colors.currentLimit.borderDash,
        borderWidth: 2,
        pointRadius: 0,
        type: 'line' as const,
        fill: false,
        order: 4
      });
    }
  }

  // Chart options
  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Harmonic Order',
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
        beginAtZero: true,
        title: {
          display: true,
          text: 'Distortion (%)',
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
            return `Harmonic Order: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    }
  };

  return {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: chartOptions
  } as ChartConfiguration;
}

/**
 * Creates a configuration for Chart.js to visualize THD comparison
 * 
 * @param thdValues - THD values for voltage and current
 * @param limits - THD limits for voltage and current
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createTHDComparisonConfig(
  thdValues: { voltage: number; current: number },
  limits: { voltage: number; current: number },
  options: HarmonicVisualizationOptions = {}
): ChartConfiguration {
  const {
    colorScheme = 'default',
    darkMode = false
  } = options;

  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Prepare data
  const data: ChartData = {
    labels: ['Voltage THD', 'Current THD'],
    datasets: [
      {
        label: 'Measured THD',
        data: [thdValues.voltage, thdValues.current],
        backgroundColor: [
          colors.voltage.backgroundColor,
          colors.current.backgroundColor
        ],
        borderColor: [
          colors.voltage.borderColor,
          colors.current.borderColor
        ],
        borderWidth: 1
      },
      {
        label: 'Limit',
        data: [limits.voltage, limits.current],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'THD (%)',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666'
        }
      },
      x: {
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    }
  };

  return {
    type: 'bar',
    data,
    options: chartOptions
  } as ChartConfiguration;
}

/**
 * Creates a configuration for Chart.js to visualize harmonic waveform
 * 
 * @param harmonics - Array of harmonic measurements
 * @param fundamentalValues - Fundamental voltage and current values
 * @param options - Visualization options
 * @returns Chart.js configuration object
 */
export function createHarmonicWaveformConfig(
  harmonics: HarmonicMeasurement[],
  fundamentalValues: { voltage: number; current: number },
  options: HarmonicVisualizationOptions = {}
): ChartConfiguration {
  const {
    showVoltage = true,
    showCurrent = false,
    colorScheme = 'default',
    darkMode = false
  } = options;

  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Generate waveform data points
  const numPoints = 360; // One full cycle (360 degrees)
  const timePoints = Array.from({ length: numPoints }, (_, i) => i);
  
  // Function to calculate waveform with harmonics
  const calculateWaveform = (
    harmonics: HarmonicMeasurement[],
    fundamental: number,
    type: 'voltage' | 'current'
  ) => {
    return timePoints.map(t => {
      // Start with fundamental component
      let value = fundamental * Math.sin((t * Math.PI) / 180);
      
      // Add harmonic components
      harmonics.forEach(h => {
        const amplitude = typeof h[type] === 'string' ? parseFloat(h[type] as string) : h[type] as number;
        const phase = 0; // Simplified - assume zero phase shift
        value += amplitude * Math.sin((h.order * t * Math.PI) / 180 + phase);
      });
      
      return value;
    });
  };

  // Calculate waveforms
  const datasets: any[] = [];
  
  if (showVoltage) {
    const voltageWaveform = calculateWaveform(harmonics, fundamentalValues.voltage, 'voltage');
    datasets.push({
      label: 'Voltage Waveform',
      data: voltageWaveform,
      borderColor: colors.voltage.borderColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4
    });
  }
  
  if (showCurrent) {
    const currentWaveform = calculateWaveform(harmonics, fundamentalValues.current, 'current');
    datasets.push({
      label: 'Current Waveform',
      data: currentWaveform,
      borderColor: colors.current.borderColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4
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
          text: 'Angle (degrees)',
          color: darkMode ? '#ddd' : '#666'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#ccc' : '#666',
          callback: (value) => (Number(value) % 90 === 0 ? value + '°' : '')
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude',
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
        enabled: false
      }
    }
  };

  return {
    type: 'line',
    data: {
      labels: timePoints,
      datasets
    },
    options: chartOptions
  } as ChartConfiguration;
} 