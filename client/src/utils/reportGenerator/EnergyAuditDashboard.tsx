import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  CircularProgress, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { AccessibleChartRenderer } from './ChartAccessibilityProvider';
import { ChartConfiguration } from 'chart.js';

// Mock Energy Audit Data
interface EnergyAuditData {
  id: string;
  name: string;
  date: Date;
  buildingInfo: {
    name: string;
    type: string;
    area: number;
    location: string;
  };
  energyConsumption: {
    historical: {
      labels: string[];
      electricity: number[];
      gas: number[];
      water: number[];
    };
    distribution: {
      labels: string[];
      values: number[];
    };
    benchmark: {
      current: number;
      average: number;
      best: number;
    };
    costs: {
      labels: string[];
      values: number[];
    };
    emissions: {
      total: number;
      bySource: {
        labels: string[];
        values: number[];
      };
    };
  };
}

// Mock data service
const getEnergyAuditData = (): Promise<EnergyAuditData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'audit-001',
        name: 'Annual Energy Audit',
        date: new Date('2023-08-15'),
        buildingInfo: {
          name: 'Main Office Building',
          type: 'Commercial',
          area: 12500,
          location: 'Downtown District'
        },
        energyConsumption: {
          historical: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            electricity: [28500, 26400, 27800, 25900, 29200, 32500, 38000, 37200, 31500, 28800, 27400, 29600],
            gas: [15200, 14600, 9800, 6200, 3900, 2100, 1800, 2000, 4300, 8700, 12400, 14800],
            water: [620, 580, 610, 650, 720, 830, 920, 880, 760, 680, 640, 630]
          },
          distribution: {
            labels: ['HVAC', 'Lighting', 'Equipment', 'Water Heating', 'Other'],
            values: [42, 18, 25, 8, 7]
          },
          benchmark: {
            current: 285,
            average: 310,
            best: 220
          },
          costs: {
            labels: ['Electricity', 'Natural Gas', 'Water', 'Maintenance'],
            values: [125000, 45000, 18000, 32000]
          },
          emissions: {
            total: 850,
            bySource: {
              labels: ['Electricity', 'Natural Gas', 'Transportation', 'Waste'],
              values: [580, 210, 40, 20]
            }
          }
        }
      });
    }, 1500);
  });
};

/**
 * A dashboard component that displays multiple interactive charts
 * for energy audit visualization
 */
const EnergyAuditDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState<EnergyAuditData | null>(null);
  const [chartConfigs, setChartConfigs] = useState<Record<string, ChartConfiguration>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const theme = useTheme();
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEnergyAuditData();
        setAuditData(data);
        // Generate chart configurations
        generateChartConfigs(data);
      } catch (error) {
        console.error('Failed to load energy audit data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Generate chart configurations from data
  const generateChartConfigs = (data: EnergyAuditData) => {
    const configs: Record<string, ChartConfiguration> = {};
    
    // Energy consumption trend chart
    configs.consumption = {
      type: 'line',
      data: {
        labels: data.energyConsumption.historical.labels,
        datasets: [
          {
            label: 'Electricity (kWh)',
            data: data.energyConsumption.historical.electricity,
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.1,
            fill: true
          },
          {
            label: 'Natural Gas (kWh)',
            data: data.energyConsumption.historical.gas,
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
    
    // Energy distribution pie chart
    configs.distribution = {
      type: 'pie',
      data: {
        labels: data.energyConsumption.distribution.labels,
        datasets: [
          {
            data: data.energyConsumption.distribution.values,
            backgroundColor: [
              theme.palette.primary.main,
              theme.palette.secondary.main,
              theme.palette.success.main,
              theme.palette.warning.main,
              theme.palette.info.main
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Energy Usage Distribution'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    };
    
    // Benchmark comparison chart
    configs.benchmark = {
      type: 'bar',
      data: {
        labels: ['Your Building', 'Average', 'Best Practice'],
        datasets: [
          {
            label: 'Energy Intensity (kWh/m²)',
            data: [
              data.energyConsumption.benchmark.current,
              data.energyConsumption.benchmark.average,
              data.energyConsumption.benchmark.best
            ],
            backgroundColor: [
              theme.palette.warning.main,
              theme.palette.info.main,
              theme.palette.success.main
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Energy Performance Benchmark'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'kWh/m²/year'
            }
          }
        }
      }
    };
    
    // Cost breakdown chart
    configs.costs = {
      type: 'doughnut',
      data: {
        labels: data.energyConsumption.costs.labels,
        datasets: [
          {
            data: data.energyConsumption.costs.values,
            backgroundColor: [
              theme.palette.primary.main,
              theme.palette.error.main,
              theme.palette.info.main,
              theme.palette.warning.main
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Annual Cost Distribution'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${context.label}: $${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    };
    
    // Emissions chart
    configs.emissions = {
      type: 'bar',
      data: {
        labels: data.energyConsumption.emissions.bySource.labels,
        datasets: [
          {
            label: 'CO₂ Emissions (tons)',
            data: data.energyConsumption.emissions.bySource.values,
            backgroundColor: theme.palette.error.main
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Carbon Emissions by Source'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO₂ (tons/year)'
            }
          }
        }
      }
    };
    
    setChartConfigs(configs);
  };
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chartId: string) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(chartId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };
  
  // Simulate downloading chart as image
  const handleDownload = (chartId: string) => {
    alert(`Downloading ${chartId} chart as image. In a real implementation, this would save the chart as PNG/PDF.`);
    handleMenuClose();
  };
  
  // Handle adding chart to report
  const handleAddToReport = (chartId: string) => {
    alert(`Adding ${chartId} chart to report. This would integrate with the ReportBuilder component.`);
    handleMenuClose();
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!auditData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load energy audit data</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Energy Audit Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {auditData.buildingInfo.name} - {auditData.buildingInfo.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Audit Date: {auditData.date.toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              sx={{ mr: 1 }}
            >
              Filter Data
            </Button>
            <Button 
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Export Dashboard
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Energy Consumption Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Energy Consumption Trends"
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, 'consumption')}>
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartConfigs.consumption && (
                  <AccessibleChartRenderer 
                    configuration={chartConfigs.consumption} 
                    themeName="energy"
                    showExportOptions={true}
                    ariaLabel="Line chart showing electricity and natural gas consumption trends over months"
                    sizePreset="dashboard"
                    onAddToReport={(canvas) => {
                      alert(`Added Energy Consumption chart to report. In a real implementation, this would integrate with ReportBuilder.`);
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Energy Distribution */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader 
              title="Energy Usage Distribution"
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, 'distribution')}>
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartConfigs.distribution && (
                  <AccessibleChartRenderer 
                    configuration={chartConfigs.distribution} 
                    themeName="energy"
                    showExportOptions={true}
                    ariaLabel="Pie chart showing distribution of energy usage by category"
                    sizePreset="dashboard"
                    onAddToReport={(canvas) => {
                      alert(`Added Energy Distribution chart to report. In a real implementation, this would integrate with ReportBuilder.`);
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Benchmark Comparison */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader 
              title="Energy Performance Benchmark"
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, 'benchmark')}>
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartConfigs.benchmark && (
                  <AccessibleChartRenderer 
                    configuration={chartConfigs.benchmark} 
                    themeName="energy"
                    showExportOptions={true}
                    ariaLabel="Bar chart comparing energy performance against industry benchmarks"
                    sizePreset="dashboard"
                    onAddToReport={(canvas: HTMLCanvasElement) => {
                      alert(`Added Benchmark chart to report. In a real implementation, this would integrate with ReportBuilder.`);
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Cost Breakdown */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader 
              title="Annual Cost Distribution"
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, 'costs')}>
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartConfigs.costs && (
                  <AccessibleChartRenderer 
                    configuration={chartConfigs.costs} 
                    themeName="financial"
                    showExportOptions={true}
                    ariaLabel="Doughnut chart showing annual cost distribution across different energy sources"
                    sizePreset="dashboard"
                    onAddToReport={(canvas: HTMLCanvasElement) => {
                      alert(`Added Cost Distribution chart to report. In a real implementation, this would integrate with ReportBuilder.`);
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Emissions Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader 
              title="Carbon Emissions by Source"
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, 'emissions')}>
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartConfigs.emissions && (
                  <AccessibleChartRenderer 
                    configuration={chartConfigs.emissions} 
                    themeName="default"
                    showExportOptions={true}
                    ariaLabel="Bar chart showing carbon emissions breakdown by source"
                    sizePreset="dashboard"
                    onAddToReport={(canvas: HTMLCanvasElement) => {
                      alert(`Added Emissions chart to report. In a real implementation, this would integrate with ReportBuilder.`);
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Chart context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => activeMenu && handleDownload(activeMenu)}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download as Image
        </MenuItem>
        <MenuItem onClick={() => activeMenu && handleAddToReport(activeMenu)}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add to Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EnergyAuditDashboard; 