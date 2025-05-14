import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register all Chart.js components
Chart.register(...registerables, annotationPlugin);

// Define color themes for consistent chart styling
export interface ChartColorTheme {
  primary: string;
  secondary: string;
  tertiary: string;
  success: string;
  warning: string;
  danger: string;
  neutral: string;
  background: string;
  additionalColors: string[];
}

// Define scale types
export type ScaleType = 'linear' | 'logarithmic';

// Define axis configuration options
export interface AxisOptions {
  title?: string;
  displayGrid?: boolean;
  minValue?: number;
  maxValue?: number;
  tickCount?: number;
  tickPrefix?: string;
  tickSuffix?: string;
}

// Predefined themes
export const chartThemes: Record<string, ChartColorTheme> = {
  // Default theme - blue-based
  default: {
    primary: '#4C68D7',
    secondary: '#5CC668',
    tertiary: '#8A5CC6',
    success: '#4CAF50',
    warning: '#F9BF31',
    danger: '#E74C5E',
    neutral: '#607D8B',
    background: 'rgba(255, 255, 255, 0.9)',
    additionalColors: ['#2196F3', '#FF9800', '#9C27B0', '#3F51B5', '#00BCD4']
  },
  // Energy theme - green-based
  energy: {
    primary: '#2E7D32',
    secondary: '#00897B',
    tertiary: '#1565C0',
    success: '#388E3C',
    warning: '#FFA000',
    danger: '#D32F2F',
    neutral: '#546E7A',
    background: 'rgba(250, 255, 250, 0.9)',
    additionalColors: ['#43A047', '#00ACC1', '#1976D2', '#5E35B1', '#00695C']
  },
  // Financial theme - purple/green-based
  financial: {
    primary: '#6A1B9A',
    secondary: '#2E7D32',
    tertiary: '#1565C0',
    success: '#2E7D32',
    warning: '#FF8F00',
    danger: '#C62828',
    neutral: '#455A64',
    background: 'rgba(250, 250, 255, 0.9)',
    additionalColors: ['#7B1FA2', '#00695C', '#0277BD', '#558B2F', '#EF6C00']
  },
  // High-contrast theme - for accessibility
  highContrast: {
    primary: '#000000',
    secondary: '#0066CC',
    tertiary: '#006600',
    success: '#006600',
    warning: '#CC6600',
    danger: '#CC0000',
    neutral: '#333333',
    background: 'rgba(255, 255, 255, 1)',
    additionalColors: ['#000099', '#990000', '#009900', '#990099', '#009999']
  }
};

export class ChartGenerator {
  // Default theme that will be used
  private static activeTheme: ChartColorTheme = chartThemes.default;

  /**
   * Set the theme to use for all charts
   * @param theme Theme name or custom theme object
   */
  public static setTheme(theme: string | ChartColorTheme): void {
    if (typeof theme === 'string') {
      // Use predefined theme
      if (theme in chartThemes) {
        this.activeTheme = chartThemes[theme];
      } else {
        console.warn(`Theme "${theme}" not found, using default theme`);
        this.activeTheme = chartThemes.default;
      }
    } else {
      // Use custom theme object
      this.activeTheme = theme;
    }
  }

  /**
   * Get a color from the active theme
   * @param colorKey The key of the color in the theme
   * @returns The color value
   */
  public static getThemeColor(colorKey: keyof ChartColorTheme): string {
    if (colorKey in this.activeTheme) {
      return this.activeTheme[colorKey] as string;
    }
    return this.activeTheme.primary;
  }

  /**
   * Get multiple colors from the theme for multi-series charts
   * @param count Number of colors needed
   * @returns Array of color values
   */
  public static getThemeColors(count: number): string[] {
    const colors: string[] = [];
    
    // Add main colors first
    colors.push(this.activeTheme.primary);
    if (count > 1) colors.push(this.activeTheme.secondary);
    if (count > 2) colors.push(this.activeTheme.tertiary);
    if (count > 3) colors.push(this.activeTheme.success);
    if (count > 4) colors.push(this.activeTheme.warning);
    
    // Add additional colors if needed
    for (let i = colors.length; i < count; i++) {
      // Cycle through additional colors
      const additionalColor = this.activeTheme.additionalColors[
        (i - 5) % this.activeTheme.additionalColors.length
      ];
      colors.push(additionalColor);
    }
    
    return colors;
  }

  /**
   * Configure a scale based on the specified type and options
   * @param scaleType Type of scale (linear or logarithmic)
   * @param beginAtZero Whether the scale should begin at zero
   * @param axisOptions Additional axis configuration options
   * @returns Scale configuration object
   */
  private static configureScale(scaleType: ScaleType = 'linear', beginAtZero: boolean = true, axisOptions?: AxisOptions) {
    const baseConfig = {
      ticks: {
        color: this.activeTheme.neutral,
        count: axisOptions?.tickCount,
        callback: (value: any) => {
          // Format ticks with prefix/suffix if provided
          if (axisOptions?.tickPrefix || axisOptions?.tickSuffix) {
            return `${axisOptions.tickPrefix || ''}${value}${axisOptions.tickSuffix || ''}`;
          }
          return value;
        }
      },
      grid: {
        color: axisOptions?.displayGrid === false ? 'transparent' : `${this.activeTheme.neutral}22`,
        display: axisOptions?.displayGrid !== false
      },
      title: {
        display: !!axisOptions?.title,
        text: axisOptions?.title || '',
        color: this.activeTheme.neutral,
        font: {
          weight: 'bold'
        }
      },
      min: axisOptions?.minValue,
      max: axisOptions?.maxValue
    };

    if (scaleType === 'logarithmic') {
      return {
        ...baseConfig,
        type: 'logarithmic' as const,
        min: axisOptions?.minValue || 0.1 // Small positive value to avoid log(0) issues
      };
    }

    return {
      ...baseConfig,
      type: 'linear' as const,
      beginAtZero: beginAtZero && (axisOptions?.minValue === undefined)
    };
  }

  /**
   * Generate a chart as a data URL
   * @param chartConfig Chart.js configuration
   * @param width Chart width in pixels
   * @param height Chart height in pixels
   * @returns Promise that resolves to a data URL
   */
  public static async generateChartImage(
    chartConfig: ChartConfiguration,
    width: number = 800,
    height: number = 400
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Append to DOM temporarily (invisible)
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        
        // Create chart
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        const chart = new Chart(ctx, chartConfig);
        
        // Wait for chart to render, then convert to image
        setTimeout(() => {
          const dataUrl = canvas.toDataURL('image/png');
          
          // Clean up
          chart.destroy();
          document.body.removeChild(canvas);
          
          resolve(dataUrl);
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a bar chart data URL
   * @param labels X-axis labels
   * @param data Data values
   * @param title Chart title
   * @param color Bar color (hex or name) or 'theme' to use theme color
   * @param yScaleType Type of Y-axis scale (linear or logarithmic)
   * @param xAxisOptions Options for configuring the X axis
   * @param yAxisOptions Options for configuring the Y axis
   * @returns Promise resolving to data URL
   */
  public static async generateBarChart(
    labels: string[],
    data: number[],
    title: string = '',
    color: string = 'theme',
    yScaleType: ScaleType = 'linear',
    xAxisOptions?: AxisOptions,
    yAxisOptions?: AxisOptions
  ): Promise<string> {
    // Use theme color if specified
    const barColor = color === 'theme' ? this.activeTheme.primary : color;
    
    return this.generateChartImage({
      type: 'bar' as ChartType,
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: barColor,
          borderColor: barColor,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: this.configureScale(yScaleType, true, yAxisOptions),
          x: this.configureScale('linear', false, xAxisOptions)
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16
            },
            color: this.activeTheme.neutral
          },
          legend: {
            display: false
          }
        },
        responsive: false,
        animation: false
      }
    });
  }
  
  /**
   * Generate a pie chart data URL
   * @param labels Pie slice labels
   * @param data Pie slice values
   * @param title Chart title
   * @param colors Optional array of colors for slices or 'theme' to use theme colors
   * @returns Promise resolving to data URL
   */
  public static async generatePieChart(
    labels: string[],
    data: number[],
    title: string = '',
    colors: string[] | 'theme' = 'theme'
  ): Promise<string> {
    // Use theme colors if specified
    const pieColors = colors === 'theme' 
      ? this.getThemeColors(data.length) 
      : colors;
    
    // Generate more colors if needed
    while (pieColors.length < data.length) {
      pieColors.push(...pieColors);
    }
    
    return this.generateChartImage({
      type: 'pie' as ChartType,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: pieColors.slice(0, data.length),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16
            },
            color: this.activeTheme.neutral
          },
          legend: {
            position: 'right',
            labels: {
              color: this.activeTheme.neutral,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.dataset.data.reduce(
                  (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 
                  0
                );
                const rawValue = Number(context.raw);
                const percentage = Math.round((rawValue / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        responsive: false,
        animation: false
      }
    });
  }
  
  /**
   * Generate a line chart data URL
   * @param labels X-axis labels
   * @param datasets Array of datasets (values and labels)
   * @param title Chart title
   * @param yScaleType Type of Y-axis scale (linear or logarithmic)
   * @param xAxisOptions Options for configuring the X axis
   * @param yAxisOptions Options for configuring the Y axis
   * @returns Promise resolving to data URL
   */
  public static async generateLineChart(
    labels: string[],
    datasets: Array<{ data: number[], label: string, color?: string }>,
    title: string = '',
    yScaleType: ScaleType = 'linear',
    xAxisOptions?: AxisOptions,
    yAxisOptions?: AxisOptions
  ): Promise<string> {
    // Get theme colors for datasets that don't specify a color
    const themeColors = this.getThemeColors(datasets.length);
    
    return this.generateChartImage({
      type: 'line' as ChartType,
      data: {
        labels,
        datasets: datasets.map((ds, index) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || themeColors[index],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          tension: 0.1
        }))
      },
      options: {
        scales: {
          y: this.configureScale(yScaleType, true, yAxisOptions),
          x: this.configureScale('linear', false, xAxisOptions)
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16
            },
            color: this.activeTheme.neutral
          },
          legend: {
            labels: {
              color: this.activeTheme.neutral
            }
          }
        },
        responsive: false,
        animation: false
      }
    });
  }

  /**
   * Generate a comparison chart specifically for before/after comparisons
   * @param labels X-axis labels
   * @param beforeData Before values
   * @param afterData After values
   * @param title Chart title
   * @param yScaleType Type of Y-axis scale
   * @param xAxisOptions X-axis options
   * @param yAxisOptions Y-axis options
   * @returns Promise resolving to data URL
   */
  public static async generateComparisonChart(
    labels: string[],
    beforeData: number[],
    afterData: number[],
    title: string = 'Before/After Comparison',
    yScaleType: ScaleType = 'linear',
    xAxisOptions?: AxisOptions,
    yAxisOptions?: AxisOptions
  ): Promise<string> {
    return this.generateChartImage({
      type: 'bar' as ChartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Before',
            data: beforeData,
            backgroundColor: this.activeTheme.danger,
            borderColor: this.activeTheme.danger,
            borderWidth: 1
          },
          {
            label: 'After',
            data: afterData,
            backgroundColor: this.activeTheme.success,
            borderColor: this.activeTheme.success,
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: this.configureScale(yScaleType, true, yAxisOptions),
          x: this.configureScale('linear', false, xAxisOptions)
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16
            },
            color: this.activeTheme.neutral
          },
          legend: {
            labels: {
              color: this.activeTheme.neutral
            }
          },
          tooltip: {
            callbacks: {
              footer: (tooltipItems) => {
                if (tooltipItems.length >= 2) {
                  const beforeValue = Number(tooltipItems[0].raw);
                  const afterValue = Number(tooltipItems[1].raw);
                  
                  if (!isNaN(beforeValue) && !isNaN(afterValue) && beforeValue !== 0) {
                    const difference = afterValue - beforeValue;
                    const percentChange = (difference / beforeValue) * 100;
                    
                    return `Change: ${difference.toFixed(2)} (${percentChange.toFixed(1)}%)`;
                  }
                }
                return '';
              }
            }
          }
        },
        responsive: false,
        animation: false
      }
    });
  }

  /**
   * Generate a chart optimized for PDF rendering
   * @param configuration Chart configuration
   * @param theme Theme to use
   * @param width Width in pixels
   * @param height Height in pixels
   * @param format Output format ('png', 'jpeg')
   * @returns Promise resolving to data URL
   */
  public static async generateChartForPDF(
    configuration: ChartConfiguration,
    theme: string,
    width: number = 800, 
    height: number = 400,
    format: 'png' | 'jpeg' = 'png'
  ): Promise<string> {
    // Save current theme and set to requested theme
    const prevTheme = this.activeTheme;
    this.setTheme(theme);
    
    try {
      // Create a deep clone of the configuration
      const pdfConfig = JSON.parse(JSON.stringify(configuration)) as ChartConfiguration;
      
      // Optimize for PDF rendering - set responsive to false and disable animations
      if (!pdfConfig.options) {
        pdfConfig.options = {};
      }
      
      pdfConfig.options.responsive = false;
      pdfConfig.options.animation = false;
      
      // Enhance grid and tick visibility for better PDF rendering
      if (!pdfConfig.options.scales) {
        pdfConfig.options.scales = {};
      }
      
      // Enhance X and Y scales if they exist
      if (pdfConfig.options.scales.x) {
        pdfConfig.options.scales.x = {
          ...pdfConfig.options.scales.x,
          grid: {
            ...pdfConfig.options.scales.x.grid,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1,
            display: true
          },
          ticks: {
            ...pdfConfig.options.scales.x.ticks,
            color: 'rgba(0, 0, 0, 0.8)',
            font: { size: 10, weight: 'bold' }
          }
        };
      }
      
      if (pdfConfig.options.scales.y) {
        pdfConfig.options.scales.y = {
          ...pdfConfig.options.scales.y,
          grid: {
            ...pdfConfig.options.scales.y.grid,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1,
            display: true
          },
          ticks: {
            ...pdfConfig.options.scales.y.ticks,
            color: 'rgba(0, 0, 0, 0.8)',
            font: { size: 10, weight: 'bold' }
          }
        };
      }
      
      // Set font family to a serif font for better PDF rendering
      if (!pdfConfig.options.font) {
        pdfConfig.options.font = { family: 'serif' };
      }
      
      // Enhance point and line styles for better visibility in PDFs
      if (pdfConfig.data?.datasets) {
        pdfConfig.data.datasets.forEach((dataset, index) => {
          const datasetType = dataset.type || pdfConfig.type;
          
          if (datasetType === 'line') {
            // Enhanced line styles for PDF
            dataset.borderWidth = dataset.borderWidth || 2;
            
            // Only set point-related properties for line charts
            if ('pointRadius' in dataset || datasetType === 'line') {
              (dataset as any).pointRadius = (dataset as any).pointRadius || 4;
              (dataset as any).pointHoverRadius = (dataset as any).pointHoverRadius || 6;
              (dataset as any).pointBorderWidth = (dataset as any).pointBorderWidth || 2;
              (dataset as any).tension = (dataset as any).tension ?? 0.1; // Subtle curve for better visibility
            }
            
            if (!dataset.borderColor) {
              dataset.borderColor = this.getThemeColors(pdfConfig.data.datasets.length)[index];
            }
            
            // Ensure points are visible
            if ('pointBackgroundColor' in dataset || datasetType === 'line') {
              (dataset as any).pointBackgroundColor = (dataset as any).pointBackgroundColor || dataset.borderColor || '#ffffff';
              (dataset as any).pointBorderColor = (dataset as any).pointBorderColor || dataset.borderColor;
            }
            
          } else if (datasetType === 'bar') {
            // Enhanced bar styles for PDF
            dataset.borderWidth = dataset.borderWidth || 1;
            dataset.borderColor = dataset.borderColor || 'rgba(0, 0, 0, 0.3)';
            
            if (!dataset.backgroundColor) {
              dataset.backgroundColor = this.getThemeColors(pdfConfig.data.datasets.length)[index];
            }
            
          } else if (datasetType === 'pie' || datasetType === 'doughnut') {
            // Enhanced pie/doughnut styles for PDF
            dataset.borderWidth = dataset.borderWidth || 1;
            dataset.borderColor = dataset.borderColor || '#ffffff';
            
            if (!dataset.backgroundColor) {
              const numPoints = Array.isArray(dataset.data) ? dataset.data.length : 0;
              dataset.backgroundColor = this.getThemeColors(numPoints);
            }
            
          } else if (datasetType === 'radar') {
            // Enhanced radar styles for PDF
            dataset.borderWidth = dataset.borderWidth || 2;
            
            // Only set point-related properties for radar charts
            if ('pointRadius' in dataset || datasetType === 'radar') {
              (dataset as any).pointRadius = (dataset as any).pointRadius || 3;
            }
            
            if (!dataset.borderColor) {
              dataset.borderColor = this.getThemeColors(pdfConfig.data.datasets.length)[index];
            }
            if (!dataset.backgroundColor && index === 0) {
              dataset.backgroundColor = `${this.getThemeColors(1)[0]}50`; // 50% opacity
            } else if (!dataset.backgroundColor) {
              dataset.backgroundColor = `${this.getThemeColors(pdfConfig.data.datasets.length)[index]}50`;
            }
          }
        });
      }
      
      // Enhance legend and plugins for better PDF visibility
      if (pdfConfig.options.plugins) {
        if (pdfConfig.options.plugins.legend) {
          pdfConfig.options.plugins.legend = {
            ...pdfConfig.options.plugins.legend,
            labels: {
              ...pdfConfig.options.plugins.legend.labels,
              boxWidth: 20,
              padding: 10,
              font: {
                size: 11,
                weight: 'bold'
              }
            }
          };
        }
        
        if (pdfConfig.options.plugins.title) {
          pdfConfig.options.plugins.title = {
            ...pdfConfig.options.plugins.title,
            font: {
              ...pdfConfig.options.plugins.title.font,
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 10
            }
          };
        }
      }
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Append to DOM temporarily (invisible)
      canvas.style.display = 'none';
      document.body.appendChild(canvas);
      
      // Get context with appropriate pixel ratio
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Create the chart with appropriate pixel ratio
      const chart = new Chart(ctx, {
        ...pdfConfig,
        options: {
          ...pdfConfig.options,
          responsive: false,
          animation: false,
          layout: {
            padding: 10
          }
        }
      });
      
      // Wait for chart to render, then convert to image
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
            
            // Clean up
            chart.destroy();
            document.body.removeChild(canvas);
            
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          } finally {
            // Restore previous theme
            this.activeTheme = prevTheme;
          }
        }, 100);
      });
    } catch (error) {
      // Restore previous theme on error
      this.activeTheme = prevTheme;
      throw error;
    }
  }
  
  /**
   * Batch generates multiple charts for PDF reports in an efficient manner
   * @param chartConfigs Array of chart configurations with metadata
   * @param quality PDF quality setting
   * @returns Promise resolving to array of chart image data URLs
   */
  public static async batchGenerateChartsForPDF(
    chartConfigs: Array<{
      configuration: ChartConfiguration;
      theme?: string;
      width?: number;
      height?: number;
    }>,
    quality: 'draft' | 'standard' | 'high' = 'standard'
  ): Promise<string[]> {
    const results: string[] = [];
    
    // Process charts in batches of 3 to avoid memory issues
    const batchSize = 3;
    for (let i = 0; i < chartConfigs.length; i += batchSize) {
      const batch = chartConfigs.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(config => {
          const devicePixelRatio = 
            quality === 'high' ? 3 : 
            quality === 'standard' ? 2 : 1;
          
          return this.generateChartForPDF(
            config.configuration,
            config.theme || 'default',
            config.width || 800,
            config.height || 400,
            'png'
          );
        })
      );
      
      results.push(...batchResults);
    }
    
    return results;
  }
}