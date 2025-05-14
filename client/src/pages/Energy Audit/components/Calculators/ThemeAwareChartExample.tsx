import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  useTheme,
  Paper
} from '@mui/material';
import { useThemeAwareChart } from './utils/useChart';
import { 
  barChartTemplate, 
  lineChartTemplate, 
  pieChartTemplate, 
  radarChartTemplate 
} from './utils/chartTemplates';

/**
 * Example component that demonstrates theme-aware charts
 * This component showcases how to use the chart templates and hooks
 * to create charts that automatically adjust to theme changes
 */
const ThemeAwareChartExample: React.FC = () => {
  const theme = useTheme();
  const [showPoints, setShowPoints] = useState(true);
  const [stack, setStack] = useState(false);
  
  // Example data for the charts
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const energyData = [65, 59, 80, 81, 56, 55];
  const demandData = [28, 48, 40, 19, 86, 27];
  const costData = [33, 25, 35, 51, 54, 76];
  
  // Pie chart data
  const powerSourceLabels = ['Solar', 'Grid', 'Generator', 'Wind'];
  const powerSourceData = [25, 45, 20, 10];
  
  // Radar chart data for power quality metrics
  const powerQualityLabels = ['Voltage', 'Frequency', 'PF', 'Harmonics', 'Flicker', 'Sags'];
  const powerQualityData = [95, 85, 78, 88, 92, 75];
  const powerQualityBenchmark = [85, 85, 85, 85, 85, 85];
  
  // Create bar chart using the theme-aware hook and template
  useThemeAwareChart(
    'energy-bar-chart',
    'energy-bar-chart',
    (isDarkMode, themeColors) => barChartTemplate(
      isDarkMode,
      themeColors,
      monthLabels,
      [
        {
          label: 'Energy (kWh)',
          data: energyData,
          backgroundColor: themeColors.primary
        },
        {
          label: 'Demand (kW)',
          data: demandData,
          backgroundColor: themeColors.secondary
        }
      ],
      {
        title: 'Energy Consumption by Month',
        xAxisTitle: 'Month',
        yAxisTitle: 'Energy (kWh) / Demand (kW)',
        stacked: stack,
        beginAtZero: true
      }
    ),
    [stack]
  );
  
  // Create line chart using the theme-aware hook and template
  useThemeAwareChart(
    'cost-line-chart',
    'cost-line-chart',
    (isDarkMode, themeColors) => lineChartTemplate(
      isDarkMode,
      themeColors,
      monthLabels,
      [
        {
          label: 'Energy Cost ($)',
          data: costData,
          borderColor: themeColors.error,
          backgroundColor: `${themeColors.error}20`,
          fill: true
        },
        {
          label: 'Cost Target',
          data: [50, 50, 50, 50, 50, 50],
          borderColor: themeColors.success,
          borderWidth: 2,
          pointRadius: 0,
          borderDash: [5, 5]
        }
      ],
      {
        title: 'Energy Cost Trend',
        xAxisTitle: 'Month',
        yAxisTitle: 'Cost ($)',
        beginAtZero: true,
        showPoints
      }
    ),
    [showPoints]
  );
  
  // Create pie chart using the theme-aware hook and template
  useThemeAwareChart(
    'power-source-pie-chart',
    'power-source-pie-chart',
    (isDarkMode, themeColors) => pieChartTemplate(
      isDarkMode,
      themeColors,
      powerSourceLabels,
      powerSourceData,
      {
        title: 'Energy Sources',
        isDoughnut: true,
        cutout: 60,
        legendPosition: 'right'
      }
    ),
    []
  );
  
  // Create radar chart using the theme-aware hook and template
  useThemeAwareChart(
    'power-quality-radar-chart',
    'power-quality-radar-chart',
    (isDarkMode, themeColors) => radarChartTemplate(
      isDarkMode,
      themeColors,
      powerQualityLabels,
      [
        {
          label: 'Current Quality',
          data: powerQualityData,
          backgroundColor: `${themeColors.primary}50`,
          borderColor: themeColors.primary
        },
        {
          label: 'Benchmark',
          data: powerQualityBenchmark,
          backgroundColor: `${themeColors.warning}30`,
          borderColor: themeColors.warning,
          borderDash: [5, 5]
        }
      ],
      {
        title: 'Power Quality Metrics',
        startAtZero: false
      }
    ),
    []
  );
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Theme-Aware Chart Examples
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={showPoints} 
              onChange={() => setShowPoints(!showPoints)}
            />
          }
          label="Show Points on Line Chart"
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={stack} 
              onChange={() => setStack(!stack)}
            />
          }
          label="Stack Bar Chart"
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ height: 300 }}>
                <canvas id="energy-bar-chart" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ height: 300 }}>
                <canvas id="cost-line-chart" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ height: 300 }}>
                <canvas id="power-source-pie-chart" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ height: 300 }}>
                <canvas id="power-quality-radar-chart" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Features Demonstrated:
        </Typography>
        <ul>
          <li>Theme-aware charts that automatically adjust to light/dark mode</li>
          <li>Consistent styling across different chart types</li>
          <li>Proper cleanup and recreation when dependencies change</li>
          <li>Simple API through standardized templates</li>
          <li>Responsive layouts that adapt to container size</li>
        </ul>
      </Box>
    </Paper>
  );
};

export default ThemeAwareChartExample; 