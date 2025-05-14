import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, Typography, Button, CircularProgress, Grid } from '@mui/material';
import ChartCustomizationPanel, { ChartCustomizationOptions } from './ChartCustomizationPanel';
import { ChartGenerator } from './chartGenerator';

/**
 * Example component demonstrating how to use the ChartCustomizationPanel
 * with real chart data and preview functionality
 */
const ChartCustomizationExample: React.FC = () => {
  // Sample data for different chart types
  const sampleData = {
    bar: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [65, 59, 80, 81, 56, 55]
    },
    pie: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Other'],
      data: [30, 40, 20, 10]
    },
    line: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'This Year', data: [65, 59, 80, 81, 56, 55] },
        { label: 'Last Year', data: [28, 48, 40, 19, 86, 27] }
      ]
    },
    stacked: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        { label: 'Lighting', data: [30, 35, 25, 32] },
        { label: 'HVAC', data: [45, 50, 40, 35] },
        { label: 'Equipment', data: [20, 15, 30, 25] }
      ]
    },
    comparison: {
      labels: ['Lighting', 'HVAC', 'Equipment'],
      beforeData: [75, 90, 60],
      afterData: [50, 65, 45]
    },
    table: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      columns: [
        { header: 'Consumption (kWh)', data: [2500, 2300, 2700, 2800, 2600, 2400], format: 'decimal' },
        { header: 'Cost ($)', data: [375, 345, 405, 420, 390, 360], format: 'currency' },
        { header: 'Savings (%)', data: [0, 8, -8, -12, -4, 4], format: 'percent' }
      ] as Array<{ header: string; data: number[]; format: 'decimal' | 'currency' | 'percent' }>
    }
  };

  // State for chart customization options
  const [options, setOptions] = useState<ChartCustomizationOptions>({
    chartType: 'bar',
    title: 'Energy Consumption',
    width: 800,
    height: 400,
    showLegend: true,
    showGrid: true,
    themeName: 'energy',
    scaleType: 'linear',
    fontSize: 12,
    animated: false,
    xAxis: {
      title: 'Month',
      displayGrid: true
    },
    yAxis: {
      title: 'Energy Consumption (kWh)',
      displayGrid: true,
      tickSuffix: ' kWh'
    }
  });

  // State for the chart image
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [dataTableImage, setDataTableImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Generate chart based on options
  const generateChart = async () => {
    setIsGenerating(true);

    try {
      // Set the theme for chart generation
      ChartGenerator.setTheme(options.themeName);

      let chartDataUrl: string;

      // Generate the appropriate chart type
      switch (options.chartType) {
        case 'bar':
          chartDataUrl = await ChartGenerator.generateBarChart(
            sampleData.bar.labels,
            sampleData.bar.data,
            options.title,
            'theme',
            options.scaleType,
            options.xAxis,
            options.yAxis
          );
          break;

        case 'pie':
          chartDataUrl = await ChartGenerator.generatePieChart(
            sampleData.pie.labels,
            sampleData.pie.data,
            options.title
          );
          break;

        case 'line':
          chartDataUrl = await ChartGenerator.generateLineChart(
            sampleData.line.labels,
            sampleData.line.datasets,
            options.title,
            options.scaleType,
            options.xAxis,
            options.yAxis
          );
          break;

        case 'stacked':
          chartDataUrl = await generateStackedBarChart(
            sampleData.stacked.labels,
            sampleData.stacked.datasets,
            options.title,
            options.scaleType,
            options.xAxis,
            options.yAxis
          );
          break;

        case 'comparison':
          chartDataUrl = await ChartGenerator.generateComparisonChart(
            sampleData.comparison.labels,
            sampleData.comparison.beforeData,
            sampleData.comparison.afterData,
            options.title,
            options.scaleType,
            options.xAxis,
            options.yAxis
          );
          break;

        case 'table':
          chartDataUrl = await generateDataTable(
            sampleData.table.labels,
            sampleData.table.columns,
            options.title
          );
          break;

        default:
          chartDataUrl = await ChartGenerator.generateBarChart(
            sampleData.bar.labels,
            sampleData.bar.data,
            options.title
          );
      }

      // Generate data table if requested (except for table type which is already a table)
      let dataTableUrl = null;
      if (options.showDataTable && options.chartType !== 'table') {
        if (options.chartType === 'bar') {
          dataTableUrl = await generateDataTable(
            sampleData.bar.labels,
            [{ header: 'Value', data: sampleData.bar.data }],
            `${options.title} - Data Table`
          );
        } else if (options.chartType === 'pie') {
          dataTableUrl = await generateDataTable(
            sampleData.pie.labels,
            [{ header: 'Value', data: sampleData.pie.data }],
            `${options.title} - Data Table`
          );
        } else if (options.chartType === 'line') {
          // For line chart, create a column for each dataset
          const columns = sampleData.line.datasets.map(ds => ({
            header: ds.label,
            data: ds.data
          }));
          dataTableUrl = await generateDataTable(
            sampleData.line.labels,
            columns,
            `${options.title} - Data Table`
          );
        } else if (options.chartType === 'stacked') {
          // For stacked chart, create a column for each dataset
          const columns = sampleData.stacked.datasets.map(ds => ({
            header: ds.label,
            data: ds.data
          }));
          dataTableUrl = await generateDataTable(
            sampleData.stacked.labels,
            columns,
            `${options.title} - Data Table`
          );
        } else if (options.chartType === 'comparison') {
          dataTableUrl = await generateDataTable(
            sampleData.comparison.labels,
            [
              { header: 'Before', data: sampleData.comparison.beforeData },
              { header: 'After', data: sampleData.comparison.afterData },
              { 
                header: 'Difference', 
                data: sampleData.comparison.beforeData.map((before, i) => 
                  sampleData.comparison.afterData[i] - before
                ),
                format: 'decimal' as const
              },
              { 
                header: 'Percent Change', 
                data: sampleData.comparison.beforeData.map((before, i) => 
                  (sampleData.comparison.afterData[i] - before) / before * 100
                ),
                format: 'percent' as const
              }
            ],
            `${options.title} - Data Table`
          );
        }
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        setChartImage(chartDataUrl);
        setDataTableImage(dataTableUrl);
      }
    } catch (error) {
      console.error('Error generating chart:', error);
    } finally {
      if (isMounted.current) {
        setIsGenerating(false);
      }
    }
  };

  /**
   * Generate a stacked bar chart for data visualization
   * @param labels X-axis labels
   * @param datasets Array of datasets with label and data
   * @param title Chart title
   * @param yScaleType Type of Y-axis scale (linear or logarithmic)
   * @param xAxisOptions X-axis options
   * @param yAxisOptions Y-axis options
   * @returns Promise resolving to chart data URL
   */
  const generateStackedBarChart: (
    labels: string[],
    datasets: Array<{ label: string, data: number[] }>,
    title: string,
    yScaleType?: 'linear' | 'logarithmic',
    xAxisOptions?: any,
    yAxisOptions?: any
  ) => Promise<string> = async (
    labels,
    datasets,
    title,
    yScaleType = 'linear',
    xAxisOptions,
    yAxisOptions
  ) => {
    // Set up configuration using our ChartGenerator.generateChartImage
    return ChartGenerator.generateChartImage({
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets.map((dataset, index) => {
          const colors = ChartGenerator.getThemeColors(datasets.length);
          return {
            label: dataset.label,
            data: dataset.data,
            backgroundColor: colors[index],
            borderColor: colors[index],
            borderWidth: 1,
            stack: 'stack'
          };
        })
      },
      options: {
        scales: {
          x: {
            stacked: true,
            title: {
              display: !!xAxisOptions?.title,
              text: xAxisOptions?.title || '',
            },
            grid: {
              display: xAxisOptions?.displayGrid !== false
            }
          },
          y: {
            stacked: true,
            type: yScaleType,
            beginAtZero: true,
            title: {
              display: !!yAxisOptions?.title,
              text: yAxisOptions?.title || '',
            },
            grid: {
              display: yAxisOptions?.displayGrid !== false
            },
            ticks: {
              callback: (value: any) => {
                if (yAxisOptions?.tickPrefix || yAxisOptions?.tickSuffix) {
                  return `${yAxisOptions.tickPrefix || ''}${value}${yAxisOptions.tickSuffix || ''}`;
                }
                return value;
              }
            }
          }
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            color: ChartGenerator.getThemeColor('neutral'),
            font: {
              size: 16
            }
          },
          legend: {
            display: true,
            labels: {
              color: ChartGenerator.getThemeColor('neutral')
            }
          }
        },
        responsive: false,
        animation: false
      }
    });
  };

  /**
   * Generate a data table image
   * @param labels Row labels
   * @param columns Table columns configuration
   * @param title Table title
   * @returns Promise resolving to data URL
   */
  const generateDataTable: (
    labels: string[],
    columns: Array<{
      header: string;
      data: number[];
      format?: 'decimal' | 'currency' | 'percent';
    }>,
    title: string
  ) => Promise<string> = async (
    labels,
    columns,
    title
  ) => {
    // Create a canvas to render the table
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = Math.min(600, 100 + (labels.length * 30)); // Adjust height based on number of rows
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Draw title
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 30);
      
      // Calculate column width
      const tableWidth = width - 80;
      const columnWidth = tableWidth / (columns.length + 1); // +1 for labels column
      
      // Draw header background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(40, 50, tableWidth, 30);
      
      // Draw headers
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      
      // Draw label column header
      ctx.fillText('Label', 40 + columnWidth / 2, 70);
      
      // Draw data column headers
      columns.forEach((column, index) => {
        ctx.fillText(column.header, 40 + columnWidth * (index + 1) + columnWidth / 2, 70);
      });
      
      // Draw rows
      labels.forEach((label, rowIndex) => {
        const y = 90 + rowIndex * 30;
        
        // Draw row background (alternating)
        ctx.fillStyle = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
        ctx.fillRect(40, y - 15, tableWidth, 30);
        
        // Draw label
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, 50, y);
        
        // Draw data cells
        columns.forEach((column, colIndex) => {
          const x = 40 + columnWidth * (colIndex + 1) + columnWidth / 2;
          
          // Format the value based on column settings
          let formattedValue = column.data[rowIndex].toString();
          if (column.format === 'currency') {
            formattedValue = `$${column.data[rowIndex].toFixed(2)}`;
          } else if (column.format === 'percent') {
            formattedValue = `${column.data[rowIndex].toFixed(1)}%`;
          } else if (column.format === 'decimal') {
            formattedValue = column.data[rowIndex].toFixed(2);
          }
          
          ctx.textAlign = 'center';
          ctx.fillText(formattedValue, x, y);
        });
        
        // Draw horizontal grid line
        ctx.strokeStyle = '#dddddd';
        ctx.beginPath();
        ctx.moveTo(40, y + 10);
        ctx.lineTo(40 + tableWidth, y + 10);
        ctx.stroke();
      });
      
      // Draw vertical grid lines
      ctx.strokeStyle = '#dddddd';
      for (let i = 0; i <= columns.length + 1; i++) {
        const x = 40 + columnWidth * i;
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, 90 + labels.length * 30);
        ctx.stroke();
      }
      
      // Draw border around table
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 50, tableWidth, labels.length * 30 + 40);
      
      // Get the image data and clean up
      const dataUrl = canvas.toDataURL('image/png');
      
      return dataUrl;
    } catch (error) {
      console.error('Error generating data table:', error);
      throw error;
    } finally {
      // Clean up
      document.body.removeChild(canvas);
    }
  };

  // Generate chart on initial load and when chart type changes
  useEffect(() => {
    generateChart();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [options.chartType, options.themeName]);

  // Handle changes to customization options
  const handleOptionsChange = (newOptions: ChartCustomizationOptions) => {
    setOptions(newOptions);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, my: 4 }}>
        <Typography variant="h5" gutterBottom>Chart Customization Demo</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This example demonstrates how to use the chart customization panel to generate 
          customized charts for reports.
        </Typography>

        {/* Chart Customization Panel */}
        <ChartCustomizationPanel
          initialOptions={options}
          onOptionsChange={handleOptionsChange}
          onPreview={generateChart}
          onApply={generateChart}
          previewChart={
            isGenerating ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Box>
            ) : chartImage ? (
              <Box component="img" src={chartImage} alt="Chart Preview" sx={{ maxWidth: '100%', maxHeight: 300 }} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <Typography color="text.secondary">No preview available</Typography>
              </Box>
            )
          }
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => {
              // In a real application, this would save the chart to the report
              alert('Chart added to report!');
            }}
            disabled={!chartImage || isGenerating}
          >
            Add Chart to Report
          </Button>
        </Box>
      </Paper>
      
      {/* Full Chart Display */}
      {chartImage && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Generated Chart</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box 
              component="img" 
              src={chartImage} 
              alt={options.title} 
              sx={{ 
                maxWidth: '100%', 
                height: 'auto', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }} 
            />
          </Box>
        </Paper>
      )}

      {/* Data Table Display */}
      {dataTableImage && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Data Table</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box 
              component="img" 
              src={dataTableImage} 
              alt={`${options.title} - Data Table`} 
              sx={{ 
                maxWidth: '100%', 
                height: 'auto', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }} 
            />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ChartCustomizationExample; 