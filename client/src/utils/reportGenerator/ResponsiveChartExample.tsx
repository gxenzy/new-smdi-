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
  SelectChangeEvent,
  Slider,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  TextField,
  Button
} from '@mui/material';
import { ChartConfiguration } from 'chart.js';
import { ResponsiveAccessibleChart, useChartAccessibility } from './index';

/**
 * Example component demonstrating the responsive features of the accessible charts
 */
const ResponsiveChartExample: React.FC = () => {
  // Get access to the chart accessibility context
  const { settings, updateSettings } = useChartAccessibility();
  
  // Default chart configuration for the example
  const [chartConfig] = useState<ChartConfiguration>({
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Energy Consumption',
          data: [2400, 1800, 2100, 2700],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Cost',
          data: [1200, 900, 1050, 1350],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Quarterly Energy Usage'
        }
      }
    }
  });
  
  // State for the example options
  const [sizePreset, setSizePreset] = useState<'compact' | 'standard' | 'large' | 'report' | 'dashboard'>('standard');
  const [minHeight, setMinHeight] = useState<number>(250);
  const [maxHeight, setMaxHeight] = useState<number>(600);
  const [aspectRatio, setAspectRatio] = useState<number>(16/9);
  const [allowSmallerOnMobile, setAllowSmallerOnMobile] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(100);
  
  // Handle size preset change
  const handleSizePresetChange = (event: SelectChangeEvent) => {
    setSizePreset(event.target.value as any);
  };
  
  // Handle global settings toggle
  const handleResponsiveSizingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ responsiveSizingEnabled: event.target.checked });
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Responsive Chart Sizing Example
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates how charts automatically adjust based on container size and device dimensions.
        Resize your browser window or adjust the controls to see the responsive behavior in action.
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.responsiveSizingEnabled}
            onChange={handleResponsiveSizingToggle}
          />
        }
        label="Enable Responsive Sizing"
        sx={{ mb: 2 }}
      />
      
      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Responsive Settings
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Size Preset</InputLabel>
                <Select
                  value={sizePreset}
                  label="Size Preset"
                  onChange={handleSizePresetChange}
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                  <MenuItem value="report">Report</MenuItem>
                  <MenuItem value="dashboard">Dashboard</MenuItem>
                </Select>
              </FormControl>
              
              <Typography id="min-height-slider" gutterBottom>
                Minimum Height: {minHeight}px
              </Typography>
              <Slider
                value={minHeight}
                onChange={(_, newValue) => setMinHeight(newValue as number)}
                aria-labelledby="min-height-slider"
                min={100}
                max={400}
                step={10}
              />
              
              <Typography id="max-height-slider" gutterBottom>
                Maximum Height: {maxHeight}px
              </Typography>
              <Slider
                value={maxHeight}
                onChange={(_, newValue) => setMaxHeight(newValue as number)}
                aria-labelledby="max-height-slider"
                min={300}
                max={1000}
                step={50}
              />
              
              <Typography id="aspect-ratio-slider" gutterBottom>
                Aspect Ratio: {aspectRatio.toFixed(2)}
              </Typography>
              <Slider
                value={aspectRatio}
                onChange={(_, newValue) => setAspectRatio(newValue as number)}
                aria-labelledby="aspect-ratio-slider"
                min={0.5}
                max={3}
                step={0.1}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={allowSmallerOnMobile}
                    onChange={(e) => setAllowSmallerOnMobile(e.target.checked)}
                  />
                }
                label="Allow smaller on mobile"
                sx={{ my: 1 }}
              />
              
              <Typography id="container-width-slider" gutterBottom>
                Container Width: {containerWidth}%
              </Typography>
              <Slider
                value={containerWidth}
                onChange={(_, newValue) => setContainerWidth(newValue as number)}
                aria-labelledby="container-width-slider"
                min={25}
                max={100}
                step={5}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: Resize your browser window to see how the chart adapts to different screen sizes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Box 
            sx={{ 
              width: `${containerWidth}%`, 
              mx: 'auto', 
              border: '1px dashed #ccc',
              p: 1
            }}
          >
            <Typography variant="caption" display="block" gutterBottom align="center">
              Container Width: {containerWidth}% - Responsive behavior will be based on this container's dimensions
            </Typography>
            
            <ResponsiveAccessibleChart
              title="Responsive Energy Usage Chart"
              subtitle="Demonstrating responsive sizing capabilities"
              configuration={chartConfig}
              themeName="energy"
              sizePreset={sizePreset}
              minHeight={minHeight}
              maxHeight={maxHeight}
              aspectRatio={aspectRatio}
              allowSmallerOnMobile={allowSmallerOnMobile}
              showExportOptions={true}
              ariaLabel="This chart shows quarterly energy consumption and cost data, demonstrating responsive sizing capabilities"
            />
          </Box>
          
          <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1">Current Settings</Typography>
            <Typography variant="body2">
              Size Preset: {sizePreset}
            </Typography>
            <Typography variant="body2">
              Min Height: {minHeight}px, Max Height: {maxHeight}px
            </Typography>
            <Typography variant="body2">
              Aspect Ratio: {aspectRatio.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              Allow Smaller on Mobile: {allowSmallerOnMobile ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2">
              Global Responsive Sizing: {settings.responsiveSizingEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResponsiveChartExample; 