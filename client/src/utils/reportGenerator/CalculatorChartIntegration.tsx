import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { EnergyAuditChart, ChartCustomizationPanel, ChartCustomizationOptions } from '.';

// Sample data structure for energy calculator results
interface CalculatorResult {
  id: string;
  name: string;
  type: 'lighting' | 'hvac' | 'equipment' | 'powerFactor' | 'harmonics';
  timestamp: string;
  data: {
    inputs: Record<string, any>;
    results: Record<string, any>;
    recommendations?: string[];
  };
}

// Interface for chart option
interface ChartOption {
  id: string;
  name: string;
}

// Mock calculator results for demonstration purposes
const mockCalculatorResults: CalculatorResult[] = [
  {
    id: 'light-001',
    name: 'Office Lighting Analysis',
    type: 'lighting',
    timestamp: '2023-07-15T14:30:00Z',
    data: {
      inputs: {
        roomDimensions: { length: 10, width: 8, height: 3 },
        lampType: 'LED',
        lampCount: 12,
        operatingHours: 10
      },
      results: {
        currentConsumption: 1200, // kWh/month
        proposedConsumption: 720, // kWh/month
        monthlySavings: 480, // kWh
        annualSavings: 5760, // kWh
        costSavings: 864, // $ per year
        emissions: {
          current: 840, // kg CO2e
          proposed: 504 // kg CO2e
        },
        monthlyData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          current: [1200, 1100, 1250, 1180, 1220, 1300, 1350, 1330, 1270, 1180, 1150, 1200],
          proposed: [720, 660, 750, 708, 732, 780, 810, 798, 762, 708, 690, 720] 
        }
      },
      recommendations: [
        'Replace T8 fluorescent lamps with LED tubes',
        'Install occupancy sensors in low-traffic areas',
        'Implement daylight harvesting near windows'
      ]
    }
  },
  {
    id: 'hvac-001',
    name: 'HVAC System Efficiency',
    type: 'hvac',
    timestamp: '2023-07-16T09:45:00Z',
    data: {
      inputs: {
        systemType: 'Split AC',
        coolingCapacity: 36000, // BTU
        currentSEER: 10,
        proposedSEER: 16,
        operatingHours: 8
      },
      results: {
        currentConsumption: 3600, // kWh/month
        proposedConsumption: 2250, // kWh/month
        monthlySavings: 1350, // kWh
        annualSavings: 16200, // kWh
        costSavings: 2430, // $ per year
        paybackPeriod: 2.1, // years
        emissions: {
          current: 2520, // kg CO2e
          proposed: 1575 // kg CO2e
        },
        usageDistribution: {
          cooling: 65,
          heating: 25,
          fans: 10
        }
      },
      recommendations: [
        'Replace current system with high SEER unit',
        'Implement programmable thermostat',
        'Clean ducts and optimize airflow'
      ]
    }
  },
  {
    id: 'equip-001',
    name: 'Office Equipment Analysis',
    type: 'equipment',
    timestamp: '2023-07-17T11:20:00Z',
    data: {
      inputs: {
        equipmentList: [
          { name: 'Computers', count: 15, power: 120, hours: 8 },
          { name: 'Printers', count: 3, power: 500, hours: 4 },
          { name: 'Servers', count: 2, power: 400, hours: 24 }
        ]
      },
      results: {
        energyBreakdown: {
          categories: ['Computers', 'Printers', 'Servers'],
          consumption: [432, 180, 576], // kWh/month
          percentage: [36, 15, 49]
        },
        totalConsumption: 1188, // kWh/month
        potentialSavings: 356, // kWh/month
        annualSavings: 4272, // kWh
        costSavings: 641 // $ per year
      },
      recommendations: [
        'Enable power management on computers',
        'Consolidate printing and use energy-saving modes',
        'Virtualize servers where possible'
      ]
    }
  },
  {
    id: 'pf-001',
    name: 'Power Factor Correction',
    type: 'powerFactor',
    timestamp: '2023-07-18T14:10:00Z',
    data: {
      inputs: {
        currentPowerFactor: 0.78,
        targetPowerFactor: 0.95,
        totalLoad: 75, // kVA
        operatingHours: 16
      },
      results: {
        currentPower: {
          apparent: 75, // kVA
          active: 58.5, // kW
          reactive: 47.15 // kVAR
        },
        correctedPower: {
          apparent: 61.58, // kVA
          active: 58.5, // kW
          reactive: 19.3 // kVAR
        },
        requiredCapacitors: 27.85, // kVAR
        annualSavings: 1825, // $
        paybackPeriod: 1.1, // years
        improvementData: {
          labels: ['0.70', '0.75', '0.80', '0.85', '0.90', '0.95', '1.00'],
          penalties: [1200, 950, 720, 400, 150, 0, 0],
          demand: [107.14, 100.00, 93.75, 88.24, 83.33, 78.95, 75.00]
        }
      },
      recommendations: [
        'Install power factor correction capacitors',
        'Improve motor loading factors',
        'Consider installing VSDs for large motors'
      ]
    }
  }
];

// Types of charts that can be generated for each calculator type
const calculatorChartOptions: Record<CalculatorResult['type'], ChartOption[]> = {
  lighting: [
    { id: 'consumption', name: 'Energy Consumption' },
    { id: 'savings', name: 'Energy Savings' },
    { id: 'monthly', name: 'Monthly Comparison' }
  ],
  hvac: [
    { id: 'consumption', name: 'Energy Consumption' },
    { id: 'distribution', name: 'Usage Distribution' },
    { id: 'emissions', name: 'Emissions Reduction' }
  ],
  equipment: [
    { id: 'breakdown', name: 'Energy Breakdown' },
    { id: 'savings', name: 'Potential Savings' }
  ],
  powerFactor: [
    { id: 'comparison', name: 'Power Comparison' },
    { id: 'improvement', name: 'PF Improvement Benefits' }
  ],
  harmonics: [
    { id: 'distortion', name: 'Harmonic Distortion' }
  ]
};

/**
 * Component that demonstrates how to integrate chart visualization with calculator data
 */
const CalculatorChartIntegration: React.FC = () => {
  // State for selected calculator result
  const [selectedCalculator, setSelectedCalculator] = useState<string>('');
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chart customization options
  const [chartOptions, setChartOptions] = useState<ChartCustomizationOptions>({
    chartType: 'bar',
    title: 'Energy Audit Chart',
    width: 800,
    height: 400,
    showLegend: true,
    showGrid: true,
    themeName: 'energy',
    scaleType: 'linear',
    fontSize: 12,
    animated: false,
    xAxis: {
      title: '',
      displayGrid: true
    },
    yAxis: {
      title: '',
      displayGrid: true,
      tickSuffix: ' kWh'
    }
  });
  
  // Find the selected calculator result
  const selectedResult = mockCalculatorResults.find(calc => calc.id === selectedCalculator);
  
  // Handle calculator selection change
  const handleCalculatorChange = (calculatorId: string) => {
    setSelectedCalculator(calculatorId);
    setSelectedChartType('');
    setChartData(null);
  };
  
  // Handle chart type selection change
  const handleChartTypeChange = (chartType: string) => {
    setSelectedChartType(chartType);
    
    if (!selectedResult) return;
    
    setIsLoading(true);
    
    // This would normally be an async data transformation or API call
    setTimeout(() => {
      const data = generateChartData(selectedResult, chartType);
      setChartData(data);
      
      // Update chart options based on data
      if (data) {
        updateChartOptions(selectedResult.type, chartType, data);
      }
      
      setIsLoading(false);
    }, 500);
  };
  
  // Generate appropriate chart data based on calculator result and chart type
  const generateChartData = (calculator: CalculatorResult, chartType: string) => {
    switch(calculator.type) {
      case 'lighting':
        if (chartType === 'consumption') {
          return {
            chartType: 'comparison',
            title: 'Current vs Proposed Lighting Energy Consumption',
            data: {
              labels: ['Energy Consumption (kWh/month)'],
              beforeData: [calculator.data.results.currentConsumption],
              afterData: [calculator.data.results.proposedConsumption]
            }
          };
        } else if (chartType === 'savings') {
          return {
            chartType: 'bar',
            title: 'Lighting Energy Savings',
            data: {
              labels: ['Monthly Savings', 'Annual Savings'],
              consumption: [
                calculator.data.results.monthlySavings,
                calculator.data.results.annualSavings
              ]
            }
          };
        } else if (chartType === 'monthly') {
          return {
            chartType: 'line',
            title: 'Monthly Energy Consumption Comparison',
            data: {
              labels: calculator.data.results.monthlyData.labels,
              datasets: [
                { 
                  label: 'Current', 
                  data: calculator.data.results.monthlyData.current
                },
                { 
                  label: 'Proposed', 
                  data: calculator.data.results.monthlyData.proposed
                }
              ]
            }
          };
        }
        break;
      
      case 'hvac':
        if (chartType === 'consumption') {
          return {
            chartType: 'comparison',
            title: 'Current vs Proposed HVAC Energy Consumption',
            data: {
              labels: ['Energy Consumption (kWh/month)'],
              beforeData: [calculator.data.results.currentConsumption],
              afterData: [calculator.data.results.proposedConsumption]
            }
          };
        } else if (chartType === 'distribution') {
          return {
            chartType: 'pie',
            title: 'HVAC Energy Usage Distribution',
            data: {
              categories: ['Cooling', 'Heating', 'Fans'],
              percentages: [
                calculator.data.results.usageDistribution.cooling,
                calculator.data.results.usageDistribution.heating,
                calculator.data.results.usageDistribution.fans
              ]
            }
          };
        } else if (chartType === 'emissions') {
          return {
            chartType: 'comparison',
            title: 'HVAC Emissions Comparison',
            data: {
              labels: ['CO₂ Emissions (kg/year)'],
              beforeData: [calculator.data.results.emissions.current],
              afterData: [calculator.data.results.emissions.proposed]
            }
          };
        }
        break;
      
      case 'equipment':
        if (chartType === 'breakdown') {
          return {
            chartType: 'pie',
            title: 'Equipment Energy Consumption Breakdown',
            data: {
              categories: calculator.data.results.energyBreakdown.categories,
              percentages: calculator.data.results.energyBreakdown.percentage
            }
          };
        } else if (chartType === 'savings') {
          return {
            chartType: 'bar',
            title: 'Equipment Energy Savings Potential',
            data: {
              labels: ['Monthly Consumption', 'After Improvements', 'Potential Savings'],
              consumption: [
                calculator.data.results.totalConsumption,
                calculator.data.results.totalConsumption - calculator.data.results.potentialSavings,
                calculator.data.results.potentialSavings
              ]
            }
          };
        }
        break;
      
      case 'powerFactor':
        if (chartType === 'comparison') {
          return {
            chartType: 'stacked',
            title: 'Power Comparison Before and After Correction',
            data: {
              labels: ['Before Correction', 'After Correction'],
              datasets: [
                { 
                  label: 'Active Power (kW)', 
                  data: [
                    calculator.data.results.currentPower.active,
                    calculator.data.results.correctedPower.active
                  ]
                },
                { 
                  label: 'Reactive Power (kVAR)', 
                  data: [
                    calculator.data.results.currentPower.reactive,
                    calculator.data.results.correctedPower.reactive
                  ]
                }
              ]
            }
          };
        } else if (chartType === 'improvement') {
          return {
            chartType: 'line',
            title: 'Benefits of Power Factor Improvement',
            data: {
              labels: calculator.data.results.improvementData.labels,
              datasets: [
                { 
                  label: 'Penalty Costs ($)', 
                  data: calculator.data.results.improvementData.penalties
                },
                { 
                  label: 'Apparent Power Demand (%)', 
                  data: calculator.data.results.improvementData.demand
                }
              ]
            }
          };
        }
        break;
      
      default:
        return null;
    }
    
    return null;
  };
  
  // Update chart options based on data type
  const updateChartOptions = (
    calculatorType: string, 
    chartType: string, 
    data: any
  ) => {
    const newOptions = { ...chartOptions };
    
    // Set chart type
    newOptions.chartType = data.chartType as any;
    
    // Set chart title
    newOptions.title = data.title;
    
    // Set axis titles and units based on chart type
    if (calculatorType === 'lighting') {
      if (chartType === 'consumption') {
        newOptions.yAxis = {
          ...newOptions.yAxis,
          title: 'Energy Consumption',
          tickSuffix: ' kWh'
        };
      } else if (chartType === 'savings') {
        newOptions.yAxis = {
          ...newOptions.yAxis,
          title: 'Energy Savings',
          tickSuffix: ' kWh'
        };
      } else if (chartType === 'monthly') {
        newOptions.xAxis = {
          ...newOptions.xAxis,
          title: 'Month'
        };
        newOptions.yAxis = {
          ...newOptions.yAxis,
          title: 'Energy Consumption',
          tickSuffix: ' kWh'
        };
      }
    } else if (calculatorType === 'hvac') {
      if (chartType === 'emissions') {
        newOptions.yAxis = {
          ...newOptions.yAxis,
          title: 'CO₂ Emissions',
          tickSuffix: ' kg'
        };
      }
    } else if (calculatorType === 'powerFactor') {
      if (chartType === 'improvement') {
        newOptions.xAxis = {
          ...newOptions.xAxis,
          title: 'Power Factor'
        };
        newOptions.yAxis = {
          ...newOptions.yAxis,
          title: '',
          tickSuffix: ''
        };
      }
    }
    
    // Update theme based on calculator type
    switch (calculatorType) {
      case 'lighting':
        newOptions.themeName = 'energy';
        break;
      case 'hvac':
        newOptions.themeName = 'energy';
        break;
      case 'equipment':
        newOptions.themeName = 'default';
        break;
      case 'powerFactor':
        newOptions.themeName = 'financial';
        break;
      default:
        newOptions.themeName = 'default';
    }
    
    setChartOptions(newOptions);
  };
  
  const handleCustomizationChange = (options: ChartCustomizationOptions) => {
    setChartOptions(options);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Calculator Chart Integration</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This example demonstrates how to generate charts from calculator results.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Calculator selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Calculator Result</InputLabel>
            <Select
              value={selectedCalculator}
              label="Select Calculator Result"
              onChange={(e) => handleCalculatorChange(e.target.value)}
            >
              {mockCalculatorResults.map(calc => (
                <MenuItem key={calc.id} value={calc.id}>
                  {calc.name} ({new Date(calc.timestamp).toLocaleDateString()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Chart type selection - only shown when calculator is selected */}
          {selectedCalculator && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Chart Type</InputLabel>
              <Select
                value={selectedChartType}
                label="Select Chart Type"
                onChange={(e) => handleChartTypeChange(e.target.value)}
              >
                {selectedResult && calculatorChartOptions[selectedResult.type].map((option: ChartOption) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {/* Recommendations */}
          {selectedResult && selectedResult.data.recommendations && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {selectedResult.data.recommendations.map((rec, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    {rec}
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
          
          {/* Chart customization buttons */}
          {chartData && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant={isCustomizing ? "contained" : "outlined"}
                color="primary"
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                {isCustomizing ? "Hide Customization" : "Customize Chart"}
              </Button>
              
              <Button 
                variant="outlined"
                color="primary"
                onClick={() => {
                  // This would normally save the chart to a report
                  alert('Chart added to report!');
                }}
              >
                Add to Report
              </Button>
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Chart display area */}
          <Paper 
            sx={{ 
              p: 2, 
              minHeight: 400, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : chartData ? (
              <Box>
                {chartData.chartType === 'bar' && (
                  <EnergyAuditChart
                    chartType="consumption"
                    title={chartOptions.title}
                    theme={chartOptions.themeName}
                    data={{
                      labels: chartData.data.labels,
                      consumption: chartData.data.consumption
                    }}
                  />
                )}
                
                {chartData.chartType === 'pie' && (
                  <EnergyAuditChart
                    chartType="distribution"
                    title={chartOptions.title}
                    theme={chartOptions.themeName}
                    data={{
                      categories: chartData.data.categories,
                      percentages: chartData.data.percentages
                    }}
                  />
                )}
                
                {chartData.chartType === 'line' && (
                  <EnergyAuditChart
                    chartType="consumption"
                    title={chartOptions.title}
                    theme={chartOptions.themeName}
                    data={{
                      labels: chartData.data.labels,
                      consumption: chartData.data.datasets[0].data,
                      baseline: chartData.data.datasets.length > 1 ? chartData.data.datasets[1].data : undefined
                    }}
                  />
                )}
                
                {chartData.chartType === 'comparison' && (
                  <EnergyAuditChart
                    chartType="comparison"
                    title={chartOptions.title}
                    theme={chartOptions.themeName}
                    data={{
                      labels: chartData.data.labels,
                      consumption: chartData.data.afterData,
                      baseline: chartData.data.beforeData
                    }}
                  />
                )}
                
                {chartData.chartType === 'stacked' && (
                  <EnergyAuditChart
                    chartType="consumption"
                    title={chartOptions.title}
                    theme={chartOptions.themeName}
                    data={{
                      labels: chartData.data.labels,
                      consumption: chartData.data.datasets[0].data,
                      baseline: chartData.data.datasets[1].data
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Select a calculator result and chart type to generate a visualization
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Chart customization panel */}
      {isCustomizing && chartData && (
        <Box sx={{ mt: 3 }}>
          <ChartCustomizationPanel
            initialOptions={chartOptions}
            onOptionsChange={handleCustomizationChange}
            onApply={() => {
              // This would regenerate the chart with new options
              setIsCustomizing(false);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CalculatorChartIntegration; 