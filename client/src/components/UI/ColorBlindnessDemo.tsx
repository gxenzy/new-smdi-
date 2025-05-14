import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
import { 
  ColorBlindnessType, 
  colorBlindnessLabels, 
  simulateColorString, 
  getAccessibleColorSet 
} from '../../utils/accessibility/colorBlindnessSimulation';
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { ChartConfiguration } from 'chart.js';

interface ColorBlindnessDemoProps {
  variant?: 'compact' | 'full';
}

/**
 * Component that demonstrates color blindness simulation with color swatches and example charts
 */
const ColorBlindnessDemo: React.FC<ColorBlindnessDemoProps> = ({ 
  variant = 'full' 
}) => {
  const theme = useTheme();
  const { settings } = useAccessibilitySettings();
  
  // Standard color palette
  const standardColors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF8000', // Orange
    '#8000FF', // Purple
    '#00FF80', // Mint
    '#FF0080'  // Pink
  ];
  
  // Get currently simulated colors
  const simulatedColors = standardColors.map(color => 
    simulateColorString(color, settings.colorBlindnessSimulation)
  );
  
  // Get a set of accessible colors for the current color blindness type
  const accessibleColors = getAccessibleColorSet(settings.colorBlindnessSimulation);
  
  // Example charts for different chart types
  const barChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Red', 'Green', 'Blue', 'Yellow', 'Purple'],
      datasets: [{
        label: 'Standard Colors',
        data: [12, 19, 3, 5, 2],
        backgroundColor: standardColors.slice(0, 5)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Standard Colors (Simulated)'
        }
      }
    }
  };
  
  const accessibleBarChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Color 1', 'Color 2', 'Color 3', 'Color 4', 'Color 5'],
      datasets: [{
        label: 'Accessible Colors',
        data: [12, 19, 3, 5, 2],
        backgroundColor: accessibleColors.slice(0, 5)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Accessible Colors'
        }
      }
    }
  };
  
  const pieChartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Red', 'Green', 'Blue', 'Yellow', 'Purple'],
      datasets: [{
        data: [12, 19, 3, 5, 2],
        backgroundColor: standardColors.slice(0, 5)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Standard Colors (Simulated)'
        }
      }
    }
  };
  
  const accessiblePieChartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Color 1', 'Color 2', 'Color 3', 'Color 4', 'Color 5'],
      datasets: [{
        data: [12, 19, 3, 5, 2],
        backgroundColor: accessibleColors.slice(0, 5)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Accessible Colors'
        }
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Color Blindness Simulation Demo
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Currently simulating: <strong>{colorBlindnessLabels[settings.colorBlindnessSimulation]}</strong>
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Color swatches comparison */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Standard vs. Simulated Colors
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Original Colors
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {standardColors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Simulated Colors
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {simulatedColors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Accessible Color Palette
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {accessibleColors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {variant === 'full' && (
        <>
          <Divider sx={{ my: 2 }} />
          
          {/* Chart examples */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Chart Examples
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <AccessibleChartRenderer
                    configuration={barChartConfig}
                    title="Standard Colors - Bar Chart"
                    ariaLabel="Bar chart showing standard colors with color blindness simulation"
                    sizePreset="standard"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <AccessibleChartRenderer
                    configuration={accessibleBarChartConfig}
                    title="Accessible Colors - Bar Chart"
                    ariaLabel="Bar chart showing accessible colors for color blindness"
                    sizePreset="standard"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <AccessibleChartRenderer
                    configuration={pieChartConfig}
                    title="Standard Colors - Pie Chart"
                    ariaLabel="Pie chart showing standard colors with color blindness simulation"
                    sizePreset="standard"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <AccessibleChartRenderer
                    configuration={accessiblePieChartConfig}
                    title="Accessible Colors - Pie Chart"
                    ariaLabel="Pie chart showing accessible colors for color blindness"
                    sizePreset="standard"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">
              The charts above demonstrate how standard colors appear to people with {colorBlindnessLabels[settings.colorBlindnessSimulation].toLowerCase()} compared to an accessible color palette designed for better visibility.
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ColorBlindnessDemo; 