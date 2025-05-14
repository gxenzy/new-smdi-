import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  useTheme
} from '@mui/material';
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
import { ChartConfiguration } from 'chart.js';
import ColorBlindnessDemo from './ColorBlindnessDemo';

/**
 * A component that demonstrates charts with high contrast and pattern fills
 */
const AccessibilityChartExample: React.FC = () => {
  const theme = useTheme();
  const { settings, toggleHighContrast } = useAccessibilitySettings();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  
  // Pie chart configuration
  const pieChartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [{
        data: [25, 40, 15, 15, 5],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderWidth: 1,
        borderColor: theme.palette.divider
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Usage Distribution'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  };
  
  // Bar chart configuration
  const barChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [{
        label: 'Energy Consumption (kWh)',
        data: [12500, 28000, 9500, 8500, 3000],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Consumption by Category'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        }
      }
    }
  };
  
  // Line chart configuration
  const lineChartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Electricity (kWh)',
          data: [28500, 26400, 27800, 25900, 29200, 32500, 38000, 37200, 31500, 28800, 27400, 29600],
          borderColor: theme.palette.primary.main,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Natural Gas (kWh)',
          data: [15200, 14600, 9800, 6200, 3900, 2100, 1800, 2000, 4300, 8700, 12400, 14800],
          borderColor: theme.palette.error.main,
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.1,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Consumption Trends'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        }
      }
    }
  };
  
  // Get current chart config based on selection
  const getCurrentChartConfig = (): ChartConfiguration => {
    switch (chartType) {
      case 'pie':
        return pieChartConfig;
      case 'bar':
        return barChartConfig;
      case 'line':
        return lineChartConfig;
      default:
        return pieChartConfig;
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Accessible Chart Examples
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        These charts demonstrate high contrast mode with pattern fills for improved accessibility.
        Toggle high contrast mode to see the difference.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.highContrastMode}
              onChange={toggleHighContrast}
              color="primary"
            />
          }
          label="High Contrast Mode"
        />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <ColorBlindnessDemo />
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: settings.highContrastMode ? '#000000' : 'transparent',
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom align="center" color={settings.highContrastMode ? '#FFFFFF' : 'inherit'}>
              Pie Chart
            </Typography>
            <Box sx={{ height: 300 }}>
              <AccessibleChartRenderer
                configuration={pieChartConfig}
                themeName="energy"
                ariaLabel="Pie chart showing energy usage distribution across different categories"
                sizePreset="standard"
              />
            </Box>
            <Typography variant="body2" color={settings.highContrastMode ? '#FFFFFF' : 'text.secondary'} align="center" sx={{ mt: 2 }}>
              Patterns make pie segments distinguishable without relying on color
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: settings.highContrastMode ? '#000000' : 'transparent',
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom align="center" color={settings.highContrastMode ? '#FFFFFF' : 'inherit'}>
              Bar Chart
            </Typography>
            <Box sx={{ height: 300 }}>
              <AccessibleChartRenderer
                configuration={barChartConfig}
                themeName="energy"
                ariaLabel="Bar chart showing energy consumption by category in kilowatt hours"
                sizePreset="standard"
              />
            </Box>
            <Typography variant="body2" color={settings.highContrastMode ? '#FFFFFF' : 'text.secondary'} align="center" sx={{ mt: 2 }}>
              Pattern fills in bar charts enhance readability
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: settings.highContrastMode ? '#000000' : 'transparent',
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom align="center" color={settings.highContrastMode ? '#FFFFFF' : 'inherit'}>
              Line Chart
            </Typography>
            <Box sx={{ height: 300 }}>
              <AccessibleChartRenderer
                configuration={lineChartConfig}
                themeName="energy"
                ariaLabel="Line chart showing energy consumption trends over months for electricity and natural gas"
                sizePreset="standard"
              />
            </Box>
            <Typography variant="body2" color={settings.highContrastMode ? '#FFFFFF' : 'text.secondary'} align="center" sx={{ mt: 2 }}>
              High contrast lines with distinct patterns for multiple data series
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          About Accessible Charts
        </Typography>
        <Typography variant="body2">
          Accessible charts combine high contrast colors with pattern fills to ensure they 
          remain usable for people with color vision deficiencies. They also include proper
          ARIA labels for screen reader support and keyboard navigation.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AccessibilityChartExample; 