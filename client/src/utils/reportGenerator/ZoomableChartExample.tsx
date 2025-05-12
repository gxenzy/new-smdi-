import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { ChartConfiguration, ChartType } from 'chart.js';
import ZoomableChart from './ZoomableChart';

/**
 * Example component that demonstrates the ZoomableChart with energy consumption data
 */
const ZoomableChartExample: React.FC = () => {
  // State for settings
  const [chartType, setChartType] = useState<ChartType>('line');
  const [themeName, setThemeName] = useState<'default' | 'energy' | 'financial'>('energy');
  const [enableWheelZoom, setEnableWheelZoom] = useState(true);
  const [enableDragPan, setEnableDragPan] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [maxZoom, setMaxZoom] = useState(10);
  const [dataPoints, setDataPoints] = useState(180); // Default 180 days (about 6 months)
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Create detailed energy consumption data
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(null);
  
  // Generate time series data for energy consumption with various patterns
  const generateEnergyTimeSeriesData = (days: number) => {
    const data: number[] = [];
    const labels: string[] = [];
    const today = new Date();
    
    // Helper to format date as MM/DD
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    // Generate data for each day, going backwards from today
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - i - 1));
      labels.push(formatDate(date));
      
      // Base consumption follows a seasonal pattern
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const seasonalFactor = Math.sin((dayOfYear / 365) * Math.PI * 2) * 0.3 + 0.7; // Seasonal variation
      
      // Weekly pattern with weekends having lower consumption
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      
      // Random daily variation
      const randomFactor = 0.85 + Math.random() * 0.3;
      
      // Base consumption level for this facility
      const baseConsumption = 1200; // kWh
      
      // Combine all factors
      const dailyConsumption = baseConsumption * seasonalFactor * weekendFactor * randomFactor;
      
      data.push(Math.round(dailyConsumption));
    }
    
    return { data, labels };
  };
  
  // Effect to generate chart data when data point count changes
  useEffect(() => {
    const { data, labels } = generateEnergyTimeSeriesData(dataPoints);
    
    // Simulating a secondary dataset for comparison
    const previousPeriodData = data.map(value => 
      // Shift data by a small percentage for comparison
      Math.round(value * (0.85 + Math.random() * 0.25))
    );
    
    const config: ChartConfiguration = {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Current Period Energy Consumption (kWh)',
            data,
            borderColor: 'rgba(66, 133, 244, 1)',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            borderWidth: 2,
            pointRadius: 0, // Hide points for better performance with many data points
            pointHoverRadius: 4, // Show points on hover
            tension: 0.3, // Smooth the line
            fill: true
          },
          {
            label: 'Previous Period Energy Consumption (kWh)',
            data: previousPeriodData,
            borderColor: 'rgba(234, 67, 53, 1)',
            backgroundColor: 'rgba(234, 67, 53, 0.05)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Daily Energy Consumption'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              // When zoomed out with many data points, show fewer ticks
              maxRotation: 45,
              minRotation: 45,
              callback: function(value, index, values) {
                // Only show some ticks when we have many data points
                return index % Math.ceil(labels.length / 12) === 0 ? labels[index] : '';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Energy Consumption (kWh)'
            },
            beginAtZero: false
          }
        }
      }
    };
    
    setChartConfig(config);
  }, [dataPoints, chartType]);
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as ChartType);
  };
  
  // Handle theme change
  const handleThemeChange = (event: SelectChangeEvent) => {
    setThemeName(event.target.value as 'default' | 'energy' | 'financial');
  };
  
  // Handle data points count change
  const handleDataPointsChange = (event: SelectChangeEvent) => {
    setDataPoints(Number(event.target.value));
  };
  
  // Handle zoom level change
  const handleZoomChange = (newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Zoomable Energy Consumption Chart
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates how to use zoom and pan controls to explore detailed time series data.
        Use the mouse wheel to zoom, hold Shift + drag to pan, or use the on-screen controls.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Chart Settings</Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={handleChartTypeChange}
                >
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="scatter">Scatter Chart</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={themeName}
                  label="Theme"
                  onChange={handleThemeChange}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="energy">Energy</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Data Points</InputLabel>
                <Select
                  value={dataPoints.toString()}
                  label="Data Points"
                  onChange={handleDataPointsChange}
                >
                  <MenuItem value="30">30 Days</MenuItem>
                  <MenuItem value="90">90 Days</MenuItem>
                  <MenuItem value="180">180 Days</MenuItem>
                  <MenuItem value="365">365 Days</MenuItem>
                  <MenuItem value="730">2 Years</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Zoom & Pan Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={enableWheelZoom}
                    onChange={(e) => setEnableWheelZoom(e.target.checked)}
                  />
                }
                label="Enable Mouse Wheel Zoom"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={enableDragPan}
                    onChange={(e) => setEnableDragPan(e.target.checked)}
                  />
                }
                label="Enable Shift+Drag Pan"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showControls}
                    onChange={(e) => setShowControls(e.target.checked)}
                  />
                }
                label="Show Controls"
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Current Zoom Level: {Math.round(zoomLevel * 100)}%
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Tips:</strong>
                <ul>
                  <li>Try different chart types to see how zoom affects them</li>
                  <li>Compare performance with different numbers of data points</li>
                  <li>Use the slider for precise zoom control</li>
                  <li>Fullscreen button for immersive data exploration</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '600px' }}>
            {chartConfig && (
              <ZoomableChart
                title="Energy Consumption Over Time"
                subtitle={`Showing ${dataPoints} days of data - Zoom in to explore patterns`}
                configuration={chartConfig}
                themeName={themeName}
                showExportOptions={true}
                sizePreset="large"
                showControls={showControls}
                enableWheelZoom={enableWheelZoom}
                enableDragPan={enableDragPan}
                maxZoom={maxZoom}
                onZoomChange={handleZoomChange}
                ariaLabel={`Zoomable chart showing energy consumption over ${dataPoints} days`}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ZoomableChartExample; 