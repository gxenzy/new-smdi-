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
  Divider,
  Stack,
  Chip,
  Slider,
  TextField,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ResponsiveAccessibleChart } from './index';

/**
 * Interface for linked chart data
 */
interface LinkedChartData {
  // Energy consumption by category
  energyByCategory: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  
  // Energy consumption by month
  energyByMonth: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  
  // Energy efficiency by system
  efficiencyBySystem: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  
  // Cost distribution
  costDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}

/**
 * LinkedChartsExample - Demonstrates how multiple charts can be linked together
 * where interactions with one chart automatically update related charts
 */
const LinkedChartsExample: React.FC = () => {
  const theme = useTheme();
  
  // Define state for the year range
  const [yearRange, setYearRange] = useState<[number, number]>([2022, 2023]);
  
  // Define state for selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'HVAC', 'Lighting', 'Equipment', 'Other'
  ]);
  
  // Define state for efficiency threshold
  const [efficiencyThreshold, setEfficiencyThreshold] = useState<number>(85);
  
  // Define state for the linked chart data
  const [linkedChartData, setLinkedChartData] = useState<LinkedChartData | null>(null);
  
  // Define state for highlighted category
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  
  // Define colors for consistent use across charts
  const categoryColors: Record<string, string> = {
    'HVAC': theme.palette.primary.main,
    'Lighting': theme.palette.secondary.main,
    'Equipment': theme.palette.success.main,
    'Other': theme.palette.warning.main
  };
  
  // Generate sample data based on filters
  useEffect(() => {
    // Only include selected categories
    const filteredCategories = Object.keys(categoryColors)
      .filter(category => selectedCategories.includes(category));
    
    // Generate data for each year in the range
    const years = [];
    for (let year = yearRange[0]; year <= yearRange[1]; year++) {
      years.push(year);
    }
    
    // Generate monthly data for the selected years and categories
    const monthlyData: Record<string, number[]> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    filteredCategories.forEach(category => {
      monthlyData[category] = months.map(() => 
        // Generate random value between 50 and 150, varying by category
        Math.floor(Math.random() * 100) + 50 + 
        // Add bias for certain categories/months
        (category === 'HVAC' ? 50 : 0)
      );
    });
    
    // Calculate efficiency data - higher number is better
    const efficiencyData: Record<string, number> = {};
    filteredCategories.forEach(category => {
      efficiencyData[category] = Math.floor(Math.random() * 30) + 70; // 70-100%
    });
    
    // Calculate total energy consumption by category
    const categoryTotals: Record<string, number> = {};
    filteredCategories.forEach(category => {
      categoryTotals[category] = monthlyData[category].reduce((sum, value) => sum + value, 0);
    });
    
    // Calculate cost data - approximately $0.12 per kWh
    const costData: Record<string, number> = {};
    filteredCategories.forEach(category => {
      costData[category] = categoryTotals[category] * 0.12;
    });
    
    // Create chart datasets
    const newData: LinkedChartData = {
      energyByCategory: {
        labels: filteredCategories,
        datasets: [{
          data: filteredCategories.map(category => categoryTotals[category]),
          backgroundColor: filteredCategories.map(category => 
            highlightedCategory === category 
              ? theme.palette.mode === 'dark' 
                ? `${categoryColors[category]}E6` // 90% opacity
                : categoryColors[category]
              : theme.palette.mode === 'dark' 
                ? `${categoryColors[category]}99` // 60% opacity
                : `${categoryColors[category]}99`
          ),
          borderColor: filteredCategories.map(category => categoryColors[category]),
          borderWidth: 1
        }]
      },
      
      energyByMonth: {
        labels: months,
        datasets: filteredCategories.map(category => ({
          label: category,
          data: monthlyData[category],
          backgroundColor: highlightedCategory === category 
            ? categoryColors[category]
            : `${categoryColors[category]}99`, // 60% opacity
          borderColor: categoryColors[category],
          borderWidth: 1
        }))
      },
      
      efficiencyBySystem: {
        labels: filteredCategories,
        datasets: [{
          label: 'System Efficiency (%)',
          data: filteredCategories.map(category => efficiencyData[category]),
          backgroundColor: filteredCategories.map(category => 
            efficiencyData[category] >= efficiencyThreshold
              ? theme.palette.success.main
              : theme.palette.error.main
          ),
          borderColor: filteredCategories.map(category => 
            efficiencyData[category] >= efficiencyThreshold
              ? theme.palette.success.dark
              : theme.palette.error.dark
          ),
          borderWidth: 1
        }]
      },
      
      costDistribution: {
        labels: filteredCategories,
        datasets: [{
          data: filteredCategories.map(category => costData[category]),
          backgroundColor: filteredCategories.map(category => 
            highlightedCategory === category 
              ? `${categoryColors[category]}E6` // 90% opacity
              : `${categoryColors[category]}99` // 60% opacity
          ),
          borderColor: filteredCategories.map(category => categoryColors[category]),
          borderWidth: 1
        }]
      }
    };
    
    setLinkedChartData(newData);
  }, [yearRange, selectedCategories, efficiencyThreshold, highlightedCategory, theme]);
  
  // Build chart configurations
  const getChartConfigs = (): Record<string, ChartConfiguration> => {
    if (!linkedChartData) return {};
    
    return {
      energyByCategory: {
        type: 'pie',
        data: linkedChartData.energyByCategory as ChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Energy Consumption by Category'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.label}: ${value.toLocaleString()} kWh`;
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements && elements.length > 0) {
              const clickedIndex = elements[0].index;
              const clickedCategory = linkedChartData.energyByCategory.labels[clickedIndex];
              // Toggle highlight
              setHighlightedCategory(
                highlightedCategory === clickedCategory ? null : clickedCategory
              );
            }
          }
        }
      },
      
      energyByMonth: {
        type: 'bar',
        data: linkedChartData.energyByMonth as ChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Monthly Energy Consumption'
            }
          },
          scales: {
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
      },
      
      efficiencyBySystem: {
        type: 'bar',
        data: linkedChartData.efficiencyBySystem as ChartData,
        options: {
          indexAxis: 'y', // Horizontal bar chart
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'System Efficiency'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `Efficiency: ${value}%`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Efficiency (%)'
              },
              min: 0,
              max: 100
            }
          }
        }
      },
      
      costDistribution: {
        type: 'doughnut',
        data: linkedChartData.costDistribution as ChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Cost Distribution'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.label}: $${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      }
    };
  };
  
  // Handle year range change
  const handleYearRangeChange = (event: Event, newValue: number | number[]) => {
    setYearRange(newValue as [number, number]);
  };
  
  // Handle efficiency threshold change
  const handleEfficiencyThresholdChange = (event: Event, newValue: number | number[]) => {
    setEfficiencyThreshold(newValue as number);
  };
  
  // Handle category selection change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const category = event.target.name;
    
    if (event.target.checked) {
      // Add category if it's not already selected
      if (!selectedCategories.includes(category)) {
        setSelectedCategories([...selectedCategories, category]);
      }
    } else {
      // Remove category if it's selected
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };
  
  // Handle category chip click
  const handleCategoryChipClick = (category: string) => {
    // Toggle category selection
    if (selectedCategories.includes(category)) {
      // Don't allow removing the last category
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== category));
      }
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Reset all filters to default
  const handleResetFilters = () => {
    setYearRange([2022, 2023]);
    setSelectedCategories(['HVAC', 'Lighting', 'Equipment', 'Other']);
    setEfficiencyThreshold(85);
    setHighlightedCategory(null);
  };
  
  // Generate insights based on the current data
  const generateInsights = () => {
    if (!linkedChartData) return [];
    
    const insights: string[] = [];
    
    // Get the efficiency data
    const efficiencyData = linkedChartData.efficiencyBySystem.datasets[0].data;
    const labels = linkedChartData.efficiencyBySystem.labels;
    
    // Get energy consumption data
    const energyData = linkedChartData.energyByCategory.datasets[0].data;
    
    // Find category with highest consumption
    let highestConsumptionIndex = 0;
    for (let i = 1; i < energyData.length; i++) {
      if (energyData[i] > energyData[highestConsumptionIndex]) {
        highestConsumptionIndex = i;
      }
    }
    
    // Find category with lowest efficiency
    let lowestEfficiencyIndex = 0;
    for (let i = 1; i < efficiencyData.length; i++) {
      if (efficiencyData[i] < efficiencyData[lowestEfficiencyIndex]) {
        lowestEfficiencyIndex = i;
      }
    }
    
    // Add insights
    if (labels.length > 0) {
      insights.push(`${labels[highestConsumptionIndex]} has the highest energy consumption at ${energyData[highestConsumptionIndex].toLocaleString()} kWh.`);
      insights.push(`${labels[lowestEfficiencyIndex]} has the lowest efficiency at ${efficiencyData[lowestEfficiencyIndex]}%.`);
    }
    
    // Add insight based on highlighted category
    if (highlightedCategory) {
      const index = labels.indexOf(highlightedCategory);
      if (index >= 0) {
        insights.push(`${highlightedCategory} consumes ${energyData[index].toLocaleString()} kWh and operates at ${efficiencyData[index]}% efficiency.`);
      }
    }
    
    // Add insight about systems below threshold
    const systemsBelowThreshold = labels.filter((label, i) => efficiencyData[i] < efficiencyThreshold);
    if (systemsBelowThreshold.length > 0) {
      insights.push(`${systemsBelowThreshold.join(', ')} ${systemsBelowThreshold.length === 1 ? 'operates' : 'operate'} below the ${efficiencyThreshold}% efficiency threshold.`);
    }
    
    // Add estimated savings insight
    const potentialSavings = systemsBelowThreshold.reduce((total, label) => {
      const index = labels.indexOf(label);
      // Assume 20% savings if efficiency improved
      return total + (energyData[index] * 0.2 * 0.12); // kWh * savings rate * cost per kWh
    }, 0);
    
    if (potentialSavings > 0) {
      insights.push(`Improving efficiency for underperforming systems could save approximately $${potentialSavings.toFixed(2)}.`);
    }
    
    return insights;
  };
  
  const chartConfigs = getChartConfigs();
  const insights = generateInsights();
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Linked Energy Consumption Analysis
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates how multiple charts can be linked together to provide a
        comprehensive view of energy data. Interact with the charts and filters to see how
        changes in one chart affect the others.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filters section */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle1">Filters & Controls</Typography>
          <Box flexGrow={1} />
          <Button 
            startIcon={<RefreshIcon />} 
            size="small" 
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </Stack>
        
        <Grid container spacing={3}>
          {/* Year range slider */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Year Range
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={yearRange}
                onChange={handleYearRangeChange}
                valueLabelDisplay="auto"
                min={2020}
                max={2025}
                marks={[
                  { value: 2020, label: '2020' },
                  { value: 2025, label: '2025' },
                ]}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {yearRange[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {yearRange[1]}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Efficiency threshold slider */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Efficiency Threshold (%)
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={efficiencyThreshold}
                onChange={handleEfficiencyThresholdChange}
                valueLabelDisplay="auto"
                min={70}
                max={100}
                marks={[
                  { value: 70, label: '70%' },
                  { value: 100, label: '100%' },
                ]}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Systems below {efficiencyThreshold}% are highlighted as inefficient
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Category selection */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.keys(categoryColors).map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleCategoryChipClick(category)}
                  sx={{
                    bgcolor: selectedCategories.includes(category) 
                      ? categoryColors[category] 
                      : theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.1)',
                    color: selectedCategories.includes(category) 
                      ? theme.palette.getContrastText(categoryColors[category]) 
                      : theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: selectedCategories.includes(category) 
                        ? categoryColors[category] 
                        : theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(0,0,0,0.2)',
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="info" />
            Interaction Instructions
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
            • Click on pie/doughnut chart segments to highlight a category across all charts
          </Typography>
          <Typography variant="body2" gutterBottom>
            • Adjust the filters above to see automatic updates across all charts
          </Typography>
          <Typography variant="body2">
            • Change the efficiency threshold to see systems categorized as efficient or inefficient
          </Typography>
        </CardContent>
      </Card>
      
      {/* Charts grid */}
      <Grid container spacing={3}>
        {/* Energy by Category (Pie Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {linkedChartData && (
              <Box sx={{ height: 300 }}>
                <ResponsiveAccessibleChart
                  configuration={chartConfigs.energyByCategory}
                  themeName="energy"
                  sizePreset="dashboard"
                  ariaLabel="Energy consumption by category pie chart"
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Cost Distribution (Doughnut Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {linkedChartData && (
              <Box sx={{ height: 300 }}>
                <ResponsiveAccessibleChart
                  configuration={chartConfigs.costDistribution}
                  themeName="financial"
                  sizePreset="dashboard"
                  ariaLabel="Cost distribution doughnut chart"
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Energy by Month (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {linkedChartData && (
              <Box sx={{ height: 300 }}>
                <ResponsiveAccessibleChart
                  configuration={chartConfigs.energyByMonth}
                  themeName="energy"
                  sizePreset="dashboard"
                  ariaLabel="Monthly energy consumption bar chart"
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Efficiency by System (Horizontal Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {linkedChartData && (
              <Box sx={{ height: 300 }}>
                <ResponsiveAccessibleChart
                  configuration={chartConfigs.efficiencyBySystem}
                  themeName="energy"
                  sizePreset="dashboard"
                  ariaLabel="System efficiency horizontal bar chart"
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Insights Panel */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              Data Insights
            </Typography>
            
            {linkedChartData ? (
              <Box>
                {insights.length > 0 ? (
                  <Grid container spacing={2}>
                    {insights.map((insight, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined" sx={{ bgcolor: theme.palette.background.default }}>
                          <CardContent>
                            <Typography variant="body2">{insight}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No insights available. Try adjusting filters or selecting a category.
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Loading insights...
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LinkedChartsExample; 