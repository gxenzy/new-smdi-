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
  SelectChangeEvent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import CustomTooltipWrapper, { 
  CustomTooltipOptions, 
  ExtendedTooltipData 
} from './CustomTooltips';

/**
 * CustomTooltipsExample - Demonstrates how to use custom tooltips with extended information
 */
const CustomTooltipsExample: React.FC = () => {
  const theme = useTheme();
  
  // State for chart settings
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [themeName, setThemeName] = useState<'default' | 'energy' | 'financial'>('energy');
  
  // State for tooltip settings
  const [useHTML, setUseHTML] = useState<boolean>(true);
  const [showExtendedData, setShowExtendedData] = useState<boolean>(true);
  
  // Sample energy consumption data by month
  const energyData = {
    jan: { current: 1200, previous: 1350, avg: 1275 },
    feb: { current: 1150, previous: 1300, avg: 1225 },
    mar: { current: 950, previous: 1100, avg: 1025 },
    apr: { current: 800, previous: 900, avg: 850 },
    may: { current: 750, previous: 820, avg: 785 },
    jun: { current: 900, previous: 950, avg: 925 },
    jul: { current: 1050, previous: 1100, avg: 1075 },
    aug: { current: 1100, previous: 1150, avg: 1125 },
    sep: { current: 950, previous: 1000, avg: 975 },
    oct: { current: 850, previous: 900, avg: 875 },
    nov: { current: 950, previous: 1050, avg: 1000 },
    dec: { current: 1100, previous: 1250, avg: 1175 }
  };
  
  // Generate chart data
  const getChartData = (): ChartData => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Current Year',
          data: monthKeys.map(month => energyData[month as keyof typeof energyData].current),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1
        },
        {
          label: 'Previous Year',
          data: monthKeys.map(month => energyData[month as keyof typeof energyData].previous),
          backgroundColor: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.dark,
          borderWidth: 1
        }
      ]
    };
  };
  
  // Build chart configuration
  const getChartConfig = (): ChartConfiguration => {
    return {
      type: chartType,
      data: getChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Energy Consumption Comparison'
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
  
  // Generate extended tooltip data
  const getExtendedTooltipData = (dataIndex: number, datasetIndex: number): ExtendedTooltipData => {
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthKey = monthKeys[dataIndex] as keyof typeof energyData;
    const monthData = energyData[monthKey];
    const monthName = months[dataIndex];
    
    const isCurrentYear = datasetIndex === 0;
    const value = isCurrentYear ? monthData.current : monthData.previous;
    
    // Calculate YoY change
    const diff = monthData.current - monthData.previous;
    const percentChange = ((diff / monthData.previous) * 100).toFixed(1);
    const positive = diff > 0;
    
    // Calculate vs. average
    const avgDiff = monthData.current - monthData.avg;
    const avgPercentChange = ((avgDiff / monthData.avg) * 100).toFixed(1);
    
    // Generate efficiency rating based on comparison to previous year
    let efficiencyRating = '';
    if (diff < -100) efficiencyRating = 'Excellent';
    else if (diff < -50) efficiencyRating = 'Good';
    else if (diff < 0) efficiencyRating = 'Satisfactory';
    else if (diff < 50) efficiencyRating = 'Fair';
    else efficiencyRating = 'Poor';
    
    // Generate recommendations based on efficiency rating
    const recommendations: string[] = [];
    if (efficiencyRating === 'Poor') {
      recommendations.push('Review energy consumption patterns');
      recommendations.push('Implement energy conservation measures');
      recommendations.push('Check for equipment inefficiencies');
    } else if (efficiencyRating === 'Fair') {
      recommendations.push('Continue monitoring energy usage');
      recommendations.push('Consider additional efficiency improvements');
    }
    
    return {
      title: isCurrentYear ? `${monthName} (Current Year)` : `${monthName} (Previous Year)`,
      subtitle: `Energy consumption details for ${monthName}`,
      details: {
        'Consumption': `${value} kWh`,
        'Daily Average': `${Math.round(value / 30)} kWh`,
        'Efficiency Rating': efficiencyRating
      },
      comparison: {
        label: 'Year-over-Year Comparison',
        current: monthData.current,
        previous: monthData.previous,
        unit: ' kWh',
        change: {
          value: Math.abs(diff),
          percentage: Math.abs(parseFloat(percentChange)),
          positive: positive
        }
      },
      trends: [
        {
          label: 'vs. 3-Year Average',
          current: monthData.current,
          avg: monthData.avg,
          unit: ' kWh'
        }
      ],
      recommendations: recommendations,
      footer: 'Click for detailed analysis report'
    };
  };
  
  // Configure tooltip options
  const getTooltipOptions = (): CustomTooltipOptions => {
    return {
      chartType,
      useHTML,
      showExtendedData,
      getExtendedData: getExtendedTooltipData,
      position: 'nearest',
      styles: {
        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
        borderColor: theme.palette.divider,
        textColor: theme.palette.text.primary,
        titleColor: theme.palette.primary.main,
        padding: 12,
        borderRadius: 8,
        maxWidth: 350
      }
    };
  };
  
  const chartConfig = getChartConfig();
  const tooltipOptions = getTooltipOptions();
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Custom Tooltips Example
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates how to implement custom tooltips with extended information,
        including comparisons, trends, and recommendations.
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
          <FormControlLabel
            control={
              <Switch
                checked={useHTML}
                onChange={(e) => setUseHTML(e.target.checked)}
                color="primary"
              />
            }
            label="Use HTML Tooltips"
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Switch
                checked={showExtendedData}
                onChange={(e) => setShowExtendedData(e.target.checked)}
                color="primary"
              />
            }
            label="Show Extended Data"
          />
        </Grid>
      </Grid>
      
      {/* Chart with custom tooltips */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ height: 400 }}>
          <CustomTooltipWrapper
            chartConfig={chartConfig}
            tooltipOptions={tooltipOptions}
            themeName={themeName}
            sizePreset="dashboard"
            ariaLabel="Energy consumption chart with custom tooltips"
            showExportOptions
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
            • Hover over data points to see the custom tooltips with extended information
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Toggle "Use HTML Tooltips" to switch between custom HTML tooltips and native Chart.js tooltips
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Toggle "Show Extended Data" to see additional details, comparisons, and recommendations
          </Typography>
          <Typography variant="body2">
            • Try different chart types to see how tooltips adapt to each visualization
          </Typography>
        </CardContent>
      </Card>
      
      {/* Information about feature implementation */}
      <Card sx={{ mt: 3, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Implementation Details
          </Typography>
          <Typography variant="body2" gutterBottom>
            This component demonstrates the "Implement custom tooltips with extended information" feature from the implementation progress list.
          </Typography>
          <Typography variant="body2">
            The custom tooltips can display rich contextual information including details, comparisons with previous periods, trend analysis, and actionable recommendations.
          </Typography>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default CustomTooltipsExample; 