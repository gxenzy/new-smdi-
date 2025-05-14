/**
 * Chart Templates
 * 
 * Standardized templates for creating various chart types with consistent styling
 * and theme awareness. These templates handle common Chart.js configuration
 * details so components can focus on their data.
 */

import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { ChartThemeColors } from './chartUtils';

// Define interfaces for dataset type properties
interface LineChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
  tension?: number;
  borderWidth?: number;
  pointRadius?: number;
  borderDash?: number[];
}

interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderRadius?: number;
  barPercentage?: number;
  categoryPercentage?: number;
}

interface RadarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  pointRadius?: number;
  pointBackgroundColor?: string;
  borderDash?: number[];
}

interface ScatterChartDataset {
  label: string;
  data: Array<{ x: number; y: number }>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  pointRadius?: number;
}

/**
 * Basic template for bar charts with consistent styling
 */
export function barChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  labels: string[],
  datasets: BarChartDataset[],
  options: {
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    stacked?: boolean;
    horizontal?: boolean;
    beginAtZero?: boolean;
  } = {}
): ChartConfiguration {
  // Use theme-based colors if not specified in datasets
  const processedDatasets = datasets.map((dataset, index) => {
    // Default colors based on index and theme
    const defaultColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.info,
      themeColors.success,
      themeColors.warning,
      themeColors.error
    ];
    
    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 1
    };
  });
  
  return {
    type: (options.horizontal ? 'horizontalBar' : 'bar') as keyof ChartTypeRegistry,
    data: {
      labels,
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: !!options.stacked,
          title: {
            display: !!options.xAxisTitle,
            text: options.xAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        },
        y: {
          stacked: !!options.stacked,
          beginAtZero: options.beginAtZero !== false,
          title: {
            display: !!options.yAxisTitle,
            text: options.yAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
}

/**
 * Basic template for line charts with consistent styling
 */
export function lineChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  labels: string[],
  datasets: LineChartDataset[],
  options: {
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    beginAtZero?: boolean;
    showPoints?: boolean;
  } = {}
): ChartConfiguration {
  // Use theme-based colors if not specified in datasets
  const processedDatasets = datasets.map((dataset, index) => {
    // Default colors based on index and theme
    const defaultColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.info,
      themeColors.success,
      themeColors.warning,
      themeColors.error
    ];
    
    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 2,
      pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : (options.showPoints === false ? 0 : 3),
      tension: dataset.tension !== undefined ? dataset.tension : 0.1,
      fill: dataset.fill !== undefined ? dataset.fill : false,
      borderDash: dataset.borderDash || [] 
    };
  });
  
  return {
    type: 'line' as keyof ChartTypeRegistry,
    data: {
      labels,
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: !!options.xAxisTitle,
            text: options.xAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        },
        y: {
          beginAtZero: options.beginAtZero !== false,
          title: {
            display: !!options.yAxisTitle,
            text: options.yAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
}

/**
 * Basic template for pie/doughnut charts with consistent styling
 */
export function pieChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  labels: string[],
  data: number[],
  options: {
    title?: string;
    isDoughnut?: boolean;
    cutout?: number;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    backgroundColor?: string[];
    borderColor?: string[];
  } = {}
): ChartConfiguration {
  // Default colors based on theme
  const defaultColors = [
    themeColors.primary,
    themeColors.secondary,
    themeColors.info,
    themeColors.success,
    themeColors.warning,
    themeColors.error,
    // Additional colors for larger datasets
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#8dd1e1',
    '#a4de6c',
    '#d0ed57'
  ];
  
  // Use custom colors or default theme colors
  const backgroundColor = options.backgroundColor || 
    defaultColors.slice(0, data.length).map((color, index) => {
      // For dark mode, make colors a bit more transparent
      return isDarkMode 
        ? `${color}cc` // 80% opacity
        : color;
    });
  
  const borderColor = options.borderColor || 
    defaultColors.slice(0, data.length).map(color => {
      // Make border slightly darker
      return isDarkMode 
        ? color 
        : color;
    });
  
  // Use correct typing for position
  const legendPosition = options.legendPosition || 'top';
  
  const chartConfig: ChartConfiguration = {
    type: (options.isDoughnut ? 'doughnut' : 'pie') as keyof ChartTypeRegistry,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: legendPosition,
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
  
  // Add cutout percentage for doughnut charts - must be handled differently due to type issues
  if (options.isDoughnut) {
    (chartConfig.options as any).cutout = `${options.cutout || 50}%`;
  }
  
  return chartConfig;
}

/**
 * Basic template for radar charts with consistent styling
 */
export function radarChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  labels: string[],
  datasets: RadarChartDataset[],
  options: {
    title?: string;
    startAtZero?: boolean;
  } = {}
): ChartConfiguration {
  // Use theme-based colors if not specified in datasets
  const processedDatasets = datasets.map((dataset, index) => {
    // Default colors based on index and theme
    const defaultColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.info,
      themeColors.success,
      themeColors.warning,
      themeColors.error
    ];
    
    const color = defaultColors[index % defaultColors.length];
    
    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || `${color}80`, // 50% opacity
      borderColor: dataset.borderColor || color,
      borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 2,
      pointBackgroundColor: dataset.pointBackgroundColor || color,
      pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : 3,
      borderDash: dataset.borderDash || []
    };
  });
  
  return {
    type: 'radar' as keyof ChartTypeRegistry,
    data: {
      labels,
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: options.startAtZero !== false,
          angleLines: {
            color: themeColors.grid
          },
          grid: {
            color: themeColors.grid
          },
          pointLabels: {
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text,
            backdropColor: isDarkMode 
              ? 'rgba(0, 0, 0, 0.7)' 
              : 'rgba(255, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
}

/**
 * Basic template for scatter charts with consistent styling
 */
export function scatterChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  datasets: ScatterChartDataset[],
  options: {
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    xBeginAtZero?: boolean;
    yBeginAtZero?: boolean;
  } = {}
): ChartConfiguration {
  // Use theme-based colors if not specified in datasets
  const processedDatasets = datasets.map((dataset, index) => {
    // Default colors based on index and theme
    const defaultColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.info,
      themeColors.success,
      themeColors.warning,
      themeColors.error
    ];
    
    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 1,
      pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : 4
    };
  });
  
  return {
    type: 'scatter' as keyof ChartTypeRegistry,
    data: {
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          beginAtZero: options.xBeginAtZero !== false,
          title: {
            display: !!options.xAxisTitle,
            text: options.xAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        },
        y: {
          beginAtZero: options.yBeginAtZero !== false,
          title: {
            display: !!options.yAxisTitle,
            text: options.yAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
}

/**
 * Template for custom mixed charts (combining multiple chart types)
 */
export function mixedChartTemplate(
  isDarkMode: boolean,
  themeColors: ChartThemeColors,
  labels: string[],
  datasets: Array<{
    type: keyof ChartTypeRegistry;
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    yAxisID?: string;
    order?: number;
    borderWidth?: number;
    borderDash?: number[];
    pointRadius?: number;
    fill?: boolean;
    tension?: number;
    // Add additional type-specific properties
    [key: string]: any;
  }>,
  options: {
    title?: string;
    xAxisTitle?: string;
    primaryYAxisTitle?: string;
    secondaryYAxisTitle?: string;
    useSecondaryYAxis?: boolean;
  } = {}
): ChartConfiguration {
  // Use theme-based colors if not specified in datasets
  const processedDatasets = datasets.map((dataset, index) => {
    // Default colors based on index and theme
    const defaultColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.info,
      themeColors.success,
      themeColors.warning,
      themeColors.error
    ];
    
    // Default configuration based on chart type
    const defaultConfig: { [key: string]: any } = {
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 1,
      order: dataset.order !== undefined ? dataset.order : index
    };
    
    // Add type-specific defaults
    if (dataset.type === 'line') {
      defaultConfig.fill = dataset.fill !== undefined ? dataset.fill : false;
      defaultConfig.tension = dataset.tension !== undefined ? dataset.tension : 0.1;
      defaultConfig.borderWidth = dataset.borderWidth !== undefined ? dataset.borderWidth : 2;
      defaultConfig.pointRadius = dataset.pointRadius !== undefined ? dataset.pointRadius : 3;
      defaultConfig.borderDash = dataset.borderDash || [];
    } else if (dataset.type === 'bar') {
      defaultConfig.borderWidth = dataset.borderWidth !== undefined ? dataset.borderWidth : 1;
    }
    
    return {
      ...defaultConfig,
      ...dataset
    };
  });
  
  // Create chart configuration
  const chartConfig: ChartConfiguration = {
    type: 'bar' as keyof ChartTypeRegistry, // Default type, will be overridden by dataset type
    data: {
      labels,
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: !!options.xAxisTitle,
            text: options.xAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: !!options.primaryYAxisTitle,
            text: options.primaryYAxisTitle || '',
            color: themeColors.text
          },
          ticks: {
            color: themeColors.text
          },
          grid: {
            color: themeColors.grid
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: themeColors.text
          }
        },
        title: {
          display: !!options.title,
          text: options.title || '',
          color: themeColors.text
        }
      }
    }
  };
  
  // Add secondary Y axis if needed (using any to bypass type checking)
  if (options.useSecondaryYAxis) {
    const scales = chartConfig.options?.scales as any;
    if (scales) {
      scales.y1 = {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: !!options.secondaryYAxisTitle,
          text: options.secondaryYAxisTitle || '',
          color: themeColors.text
        },
        ticks: {
          color: themeColors.text
        },
        grid: {
          drawOnChartArea: false,
          color: themeColors.grid
        }
      };
    }
  }
  
  return chartConfig;
} 