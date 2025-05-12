import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Tabs, 
  Tab, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Button
} from '@mui/material';
import { ChartConfiguration } from 'chart.js';
import { AccessibleChartRenderer } from './index';

// Define interfaces for calculator data
interface CalculatorData {
  id: string;
  name: string;
  type: string;
  timestamp: Date;
  data: any;
}

// Mock service to simulate loading calculator data
const getCalculatorData = (): Promise<CalculatorData[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve([
        {
          id: 'illum-001',
          name: 'Classroom Illumination Analysis',
          type: 'illumination',
          timestamp: new Date('2023-09-10'),
          data: {
            roomDimensions: { length: 12, width: 8, height: 3 },
            results: {
              currentIlluminance: 320,
              requiredIlluminance: 500,
              deficiency: 180,
              recommendedLuminaires: 12,
              currentLuminaires: 8
            }
          }
        },
        {
          id: 'power-001',
          name: 'Main Distribution Power Factor',
          type: 'powerFactor',
          timestamp: new Date('2023-09-15'),
          data: {
            results: {
              currentPowerFactor: 0.82,
              targetPowerFactor: 0.95,
              savings: {
                monthly: 450,
                annual: 5400
              },
              powerData: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                values: [0.81, 0.82, 0.79, 0.83, 0.82, 0.80]
              }
            }
          }
        },
        {
          id: 'equipment-001',
          name: 'Office Equipment Energy Usage',
          type: 'equipment',
          timestamp: new Date('2023-09-20'),
          data: {
            results: {
              totalConsumption: 1250,
              breakdown: {
                labels: ['Computers', 'Lighting', 'HVAC', 'Other'],
                values: [350, 275, 450, 175]
              },
              monthlyTrend: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [1100, 1050, 1200, 1250, 1300, 1250]
              }
            }
          }
        }
      ]);
    }, 1000);
  });
};

/**
 * Component that integrates interactive charts with calculator data
 */
const InteractiveCalculatorCharts: React.FC = () => {
  const [calculatorData, setCalculatorData] = useState<CalculatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCalculator, setSelectedCalculator] = useState<string>('');
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(null);
  const [viewType, setViewType] = useState<'single' | 'comparison' | 'trend'>('single');
  
  // Load calculator data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCalculatorData();
        setCalculatorData(data);
        
        // Auto-select first calculator if available
        if (data.length > 0) {
          setSelectedCalculator(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load calculator data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Generate chart configuration when calculator selection or view type changes
  useEffect(() => {
    if (!selectedCalculator) return;
    
    const calculator = calculatorData.find(calc => calc.id === selectedCalculator);
    if (!calculator) return;
    
    generateChartConfig(calculator, viewType);
  }, [selectedCalculator, viewType, calculatorData]);
  
  // Generate appropriate chart configuration based on calculator type and data
  const generateChartConfig = (calculator: CalculatorData, view: string) => {
    let config: ChartConfiguration | null = null;
    
    switch (calculator.type) {
      case 'illumination': {
        if (view === 'single') {
          // Current vs Required illuminance
          config = {
            type: 'bar',
            data: {
              labels: ['Current Illuminance', 'Required Illuminance'],
              datasets: [{
                label: 'Illuminance (lux)',
                data: [
                  calculator.data.results.currentIlluminance,
                  calculator.data.results.requiredIlluminance
                ],
                backgroundColor: [
                  calculator.data.results.currentIlluminance < calculator.data.results.requiredIlluminance
                    ? '#e74c3c' : '#2ecc71',
                  '#3498db'
                ]
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Illumination Level Analysis'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.dataset.label}: ${context.formattedValue} lux`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Illuminance (lux)'
                  }
                }
              }
            }
          };
        } else if (view === 'comparison') {
          // Current vs Recommended luminaires
          config = {
            type: 'bar',
            data: {
              labels: ['Current Luminaires', 'Recommended Luminaires'],
              datasets: [{
                label: 'Number of Luminaires',
                data: [
                  calculator.data.results.currentLuminaires,
                  calculator.data.results.recommendedLuminaires
                ],
                backgroundColor: ['#e74c3c', '#2ecc71']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Luminaire Requirement Analysis'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Count'
                  }
                }
              }
            }
          };
        }
        break;
      }
      
      case 'powerFactor': {
        if (view === 'single') {
          // Current vs Target power factor
          config = {
            type: 'bar',
            data: {
              labels: ['Current Power Factor', 'Target Power Factor'],
              datasets: [{
                label: 'Power Factor',
                data: [
                  calculator.data.results.currentPowerFactor,
                  calculator.data.results.targetPowerFactor
                ],
                backgroundColor: [
                  calculator.data.results.currentPowerFactor < 0.85 ? '#e74c3c' : '#f39c12',
                  '#2ecc71'
                ]
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Power Factor Analysis'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `Power Factor: ${Number(context.raw).toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 1,
                  title: {
                    display: true,
                    text: 'Power Factor'
                  }
                }
              }
            }
          };
        } else if (view === 'trend') {
          // Power factor trend
          config = {
            type: 'line',
            data: {
              labels: calculator.data.results.powerData.labels,
              datasets: [{
                label: 'Power Factor',
                data: calculator.data.results.powerData.values,
                borderColor: '#3498db',
                tension: 0.1,
                fill: false
              },
              {
                label: 'Minimum Required PF',
                data: Array(calculator.data.results.powerData.labels.length).fill(0.85),
                borderColor: '#e74c3c',
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Power Factor Trend'
                }
              },
              scales: {
                y: {
                  min: 0.7,
                  max: 1,
                  title: {
                    display: true,
                    text: 'Power Factor'
                  }
                }
              }
            }
          };
        } else if (view === 'comparison') {
          // Savings analysis
          config = {
            type: 'bar',
            data: {
              labels: ['Monthly Savings', 'Annual Savings'],
              datasets: [{
                label: 'Cost Savings ($)',
                data: [
                  calculator.data.results.savings.monthly,
                  calculator.data.results.savings.annual
                ],
                backgroundColor: ['#3498db', '#2ecc71']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Potential Savings from PF Correction'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `Savings: $${Number(context.raw).toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Amount ($)'
                  }
                }
              }
            }
          };
        }
        break;
      }
      
      case 'equipment': {
        if (view === 'single') {
          // Energy consumption breakdown
          config = {
            type: 'pie',
            data: {
              labels: calculator.data.results.breakdown.labels,
              datasets: [{
                data: calculator.data.results.breakdown.values,
                backgroundColor: [
                  '#3498db',
                  '#2ecc71',
                  '#e74c3c',
                  '#f39c12'
                ]
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Energy Consumption Breakdown'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const dataArray = context.dataset.data as number[];
                      const total = dataArray.reduce((acc: number, val: number) => acc + (val || 0), 0);
                      const percentage = Math.round(((context.raw as number) / (total || 1)) * 100);
                      return `${context.label}: ${context.formattedValue} kWh (${percentage}%)`;
                    }
                  }
                }
              }
            }
          };
        } else if (view === 'trend') {
          // Monthly consumption trend
          config = {
            type: 'line',
            data: {
              labels: calculator.data.results.monthlyTrend.labels,
              datasets: [{
                label: 'Energy Consumption',
                data: calculator.data.results.monthlyTrend.values,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                tension: 0.1,
                fill: true
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Energy Consumption Trend'
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
        }
        break;
      }
      
      default:
        config = null;
    }
    
    setChartConfig(config);
  };
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  // Handle calculator selection change
  const handleCalculatorChange = (calculatorId: string) => {
    setSelectedCalculator(calculatorId);
  };
  
  // Filter calculators by type based on selected tab
  const getFilteredCalculators = () => {
    if (selectedTab === 0) return calculatorData; // All
    
    const typeMap: Record<number, string> = {
      1: 'illumination',
      2: 'powerFactor',
      3: 'equipment'
    };
    
    return calculatorData.filter(calc => calc.type === typeMap[selectedTab]);
  };

  // Add chart to report (implementation placeholder)
  const addToReport = () => {
    alert('Chart added to report! This would integrate with ReportBuilder component.');
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Interactive Calculator Charts</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Interactive visualization of energy audit calculator results with real-time updates.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="All Calculators" />
            <Tab label="Illumination" />
            <Tab label="Power Factor" />
            <Tab label="Equipment" />
          </Tabs>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Calculator Results</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Calculator Result</InputLabel>
                  <Select
                    value={selectedCalculator}
                    label="Select Calculator Result"
                    onChange={(e) => handleCalculatorChange(e.target.value)}
                  >
                    {getFilteredCalculators().map(calc => (
                      <MenuItem key={calc.id} value={calc.id}>
                        {calc.name} ({calc.timestamp.toLocaleDateString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedCalculator && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>Visualization Type</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>View Type</InputLabel>
                      <Select
                        value={viewType}
                        label="View Type"
                        onChange={(e) => setViewType(e.target.value as any)}
                      >
                        <MenuItem value="single">Primary Analysis</MenuItem>
                        <MenuItem value="comparison">Comparison View</MenuItem>
                        <MenuItem value="trend">Trend Analysis</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={addToReport}
                      sx={{ mt: 2 }}
                    >
                      Add to Report
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 400 }}>
                {chartConfig ? (
                  <AccessibleChartRenderer 
                    configuration={chartConfig}
                    themeName="energy"
                    height={400}
                    title={calculatorData.find(calc => calc.id === selectedCalculator)?.name || 'Calculator Results'}
                    subtitle={`Displaying ${viewType} view`}
                  />
                ) : (
                  <Paper 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography color="text.secondary">
                      Select a calculator result to view chart
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default InteractiveCalculatorCharts; 