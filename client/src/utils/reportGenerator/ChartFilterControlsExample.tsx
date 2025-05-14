import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Stack,
  Button,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ResponsiveAccessibleChart } from './index';
import ChartFilterControls, { ChartFilterControlsProps } from './ChartFilterControls';

/**
 * ChartFilterControlsExample - Demonstrates how to use the ChartFilterControls component
 * to add filtering capabilities directly on charts
 */
const ChartFilterControlsExample: React.FC = () => {
  const theme = useTheme();
  
  // State for chart settings
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [themeName, setThemeName] = useState<'default' | 'energy' | 'financial'>('energy');
  const [filterPosition, setFilterPosition] = useState<ChartFilterControlsProps['position']>('top-right');
  
  // State for chart data
  const [chartData, setChartData] = useState<ChartData>(() => generateSampleData());
  const [filteredData, setFilteredData] = useState<ChartData>(() => generateSampleData());
  
  // Generate sample data for the chart
  function generateSampleData(): ChartData {
    // Generate months for x-axis
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate random data for datasets
    return {
      labels: months,
      datasets: [
        {
          label: 'HVAC Consumption',
          data: months.map(() => Math.floor(Math.random() * 100) + 50),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1
        },
        {
          label: 'Lighting Consumption',
          data: months.map(() => Math.floor(Math.random() * 80) + 20),
          backgroundColor: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.dark,
          borderWidth: 1
        },
        {
          label: 'Equipment Consumption',
          data: months.map(() => Math.floor(Math.random() * 60) + 30),
          backgroundColor: theme.palette.success.main,
          borderColor: theme.palette.success.dark,
          borderWidth: 1
        },
        {
          label: 'Other Consumption',
          data: months.map(() => Math.floor(Math.random() * 40) + 10),
          backgroundColor: theme.palette.warning.main,
          borderColor: theme.palette.warning.dark,
          borderWidth: 1
        }
      ]
    };
  }
  
  // Create chart configuration
  const getChartConfig = (): ChartConfiguration => {
    return {
      type: chartType,
      data: filteredData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Energy Consumption with Filters'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${context.dataset.label}: ${value.toLocaleString()} kWh`;
              }
            }
          }
        },
        scales: chartType === 'pie' || chartType === 'doughnut' ? undefined : {
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Energy (kWh)'
            },
            beginAtZero: true
          }
        }
      }
    };
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
    setChartType(event.target.value as ChartType);
  };
  
  // Handle theme change
  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setThemeName(event.target.value as 'default' | 'energy' | 'financial');
  };
  
  // Handle filter position change
  const handlePositionChange = (event: SelectChangeEvent<string>) => {
    setFilterPosition(event.target.value as ChartFilterControlsProps['position']);
  };
  
  // Handle filters applied
  const handleFiltersApplied = (data: ChartData) => {
    setFilteredData(data);
  };
  
  // Regenerate sample data
  const handleRegenerateData = () => {
    const newData = generateSampleData();
    setChartData(newData);
    setFilteredData(newData);
  };
  
  // Sample filter presets
  const filterPresets = [
    {
      id: '1',
      name: 'HVAC Only',
      datasetFilters: {
        'HVAC Consumption': true,
        'Lighting Consumption': false,
        'Equipment Consumption': false,
        'Other Consumption': false
      }
    },
    {
      id: '2',
      name: 'Non-HVAC',
      datasetFilters: {
        'HVAC Consumption': false,
        'Lighting Consumption': true,
        'Equipment Consumption': true,
        'Other Consumption': true
      }
    },
    {
      id: '3',
      name: 'High Consumption',
      datasetFilters: {
        'HVAC Consumption': true,
        'Lighting Consumption': true,
        'Equipment Consumption': false,
        'Other Consumption': false
      },
      valueRange: [50, 150] as [number, number]
    }
  ];
  
  const chartConfig = getChartConfig();
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Chart Filter Controls Example
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates how to add filter controls directly on charts,
        allowing users to show/hide datasets, filter by value ranges, and apply saved presets.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Controls section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              value={chartType}
              label="Chart Type"
              onChange={handleChartTypeChange}
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="doughnut">Doughnut Chart</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="theme-label">Theme</InputLabel>
            <Select
              labelId="theme-label"
              value={themeName}
              label="Theme"
              onChange={handleThemeChange}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="energy">Energy</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="position-label">Filter Position</InputLabel>
            <Select
              labelId="position-label"
              value={filterPosition}
              label="Filter Position"
              onChange={handlePositionChange}
            >
              <MenuItem value="top-right">Top Right</MenuItem>
              <MenuItem value="top-left">Top Left</MenuItem>
              <MenuItem value="bottom-right">Bottom Right</MenuItem>
              <MenuItem value="bottom-left">Bottom Left</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={handleRegenerateData}
            fullWidth
          >
            Regenerate Data
          </Button>
        </Grid>
      </Grid>
      
      {/* Chart with filter controls */}
      <Card sx={{ position: 'relative', overflow: 'visible', mb: 3 }}>
        <CardContent sx={{ height: 400 }}>
          <ResponsiveAccessibleChart
            configuration={chartConfig}
            themeName={themeName}
            sizePreset="dashboard"
            ariaLabel="Energy consumption chart with filter controls"
            showExportOptions
          />
          
          <ChartFilterControls
            chartData={chartData}
            position={filterPosition}
            enableDatasetFilters={true}
            enableValueRange={true}
            valueRangeBounds={[0, 150]}
            valueRangeLabels={{ min: 'Min', max: 'Max', unit: 'kWh' }}
            filterPresets={filterPresets}
            onFiltersApplied={handleFiltersApplied}
          />
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Usage Instructions
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Click the filter icon ({filterPosition}) to open the filter panel
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Use checkboxes to show/hide specific datasets
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Adjust the value range slider to filter data points by value
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Apply preset filters using the chips in the filter panel
          </Typography>
          <Typography variant="body2">
            • Try different chart types and filter positions using the controls above
          </Typography>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default ChartFilterControlsExample; 