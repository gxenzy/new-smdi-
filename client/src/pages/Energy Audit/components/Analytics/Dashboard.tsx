import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardHeader,
  CardContent,
  Divider
} from '@mui/material';
import { ChartConfiguration } from 'chart.js';
import InteractiveChart from './InteractiveChart';
import { chartThemes } from '../../../../utils/reportGenerator/chartGenerator';

/**
 * Energy Audit Dashboard featuring multiple interactive charts displaying
 * key metrics and visualizations from energy audit data
 */
const EnergyAuditDashboard: React.FC = () => {
  const theme = useTheme();
  const [chartTheme, setChartTheme] = useState<string>('default');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [loadingData, setLoadingData] = useState<boolean>(true);
  
  // Sample data for demonstration
  const [energyConsumptionData, setEnergyConsumptionData] = useState<ChartConfiguration>({
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Electricity (kWh)',
          data: [4200, 3800, 3900, 3700, 3200, 3500, 3800, 4100, 3900, 3700, 3500, 3800],
          borderWidth: 2,
          tension: 0.2
        },
        {
          label: 'Gas (therms)',
          data: [120, 130, 110, 90, 50, 30, 20, 25, 40, 80, 100, 115],
          borderWidth: 2,
          tension: 0.2
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Monthly Energy Consumption'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumption'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    }
  });
  
  const [costDistributionData, setCostDistributionData] = useState<ChartConfiguration>({
    type: 'pie',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [
        {
          data: [25, 40, 20, 10, 5],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Energy Cost Distribution'
        }
      }
    }
  });
  
  const [efficiencyComparisonData, setEfficiencyComparisonData] = useState<ChartConfiguration>({
    type: 'bar',
    data: {
      labels: ['Lighting', 'HVAC', 'Motors', 'IT Equipment'],
      datasets: [
        {
          label: 'Current',
          data: [75, 82, 65, 70],
          borderWidth: 1
        },
        {
          label: 'After Upgrades',
          data: [92, 89, 85, 88],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Efficiency Comparison (%) - Current vs Optimized'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Efficiency (%)'
          }
        }
      }
    }
  });
  
  const [savingsPotentialData, setSavingsPotentialData] = useState<ChartConfiguration>({
    type: 'doughnut',
    data: {
      labels: ['Already Achieved', 'Immediate Potential', 'Long-term Potential', 'Theoretical Maximum'],
      datasets: [
        {
          data: [15, 25, 35, 25],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Energy Savings Potential'
        }
      },
      cutout: '50%'
    } as any
  });
  
  const [harmonicDistortionData, setHarmonicDistortionData] = useState<ChartConfiguration>({
    type: 'bar',
    data: {
      labels: ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19', '21'],
      datasets: [
        {
          label: 'THD (%)',
          data: [100, 42, 18, 9, 5, 4, 3, 2, 1.5, 1, 0.5],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Harmonic Distortion Spectrum'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Magnitude (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Harmonic Order'
          }
        }
      }
    }
  });
  
  const [peakDemandData, setPeakDemandData] = useState<ChartConfiguration>({
    type: 'line',
    data: {
      labels: ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
      datasets: [
        {
          label: 'Weekday',
          data: [200, 180, 170, 190, 450, 680, 720, 750, 720, 650, 450, 300],
          borderWidth: 2,
          tension: 0.2
        },
        {
          label: 'Weekend',
          data: [180, 160, 150, 170, 250, 300, 350, 380, 390, 350, 300, 250],
          borderWidth: 2,
          tension: 0.2
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Peak Demand Profile'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'kW'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hour'
          }
        }
      }
    }
  });

  // Handle theme change
  const handleThemeChange = (event: SelectChangeEvent) => {
    setChartTheme(event.target.value);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    // Here we would typically fetch new data based on time range
    // For demo purposes, we'll just simulate loading
    setLoadingData(true);
    setTimeout(() => setLoadingData(false), 1000);
  };
  
  // Simulate data loading on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingData(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Energy Audit Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Theme</InputLabel>
            <Select
              value={chartTheme}
              label="Chart Theme"
              onChange={handleThemeChange}
            >
              {Object.keys(chartThemes).map((theme) => (
                <MenuItem key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Energy Consumption Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Energy Consumption Trends" />
            <Divider />
            <CardContent sx={{ height: 400, p: 2 }}>
              <InteractiveChart 
                configuration={energyConsumptionData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Cost Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Cost Distribution" />
            <Divider />
            <CardContent sx={{ height: 400, p: 2 }}>
              <InteractiveChart 
                configuration={costDistributionData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Efficiency Comparison Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Efficiency Comparison" />
            <Divider />
            <CardContent sx={{ height: 350, p: 2 }}>
              <InteractiveChart 
                configuration={efficiencyComparisonData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Savings Potential Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Savings Potential" />
            <Divider />
            <CardContent sx={{ height: 350, p: 2 }}>
              <InteractiveChart 
                configuration={savingsPotentialData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Harmonic Distortion Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Harmonic Distortion" />
            <Divider />
            <CardContent sx={{ height: 350, p: 2 }}>
              <InteractiveChart 
                configuration={harmonicDistortionData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Peak Demand Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Peak Demand Profile" />
            <Divider />
            <CardContent sx={{ height: 350, p: 2 }}>
              <InteractiveChart 
                configuration={peakDemandData} 
                themeName={chartTheme}
                showExportOptions
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnergyAuditDashboard; 