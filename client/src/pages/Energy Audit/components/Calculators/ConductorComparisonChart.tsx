import React, { useState } from 'react';
import { 
  useTheme, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Button,
  SelectChangeEvent,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import BoltIcon from '@mui/icons-material/Bolt';
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import { UnifiedCircuitData } from './utils/CircuitSynchronization';
import { VoltageDropCalculationResult } from './utils/voltageDropRecalculator';
import { CONDUCTOR_SIZES } from './utils/voltageRegulationUtils';

export interface ConductorComparisonData {
  size: string;
  voltageDropPercent: number;
  cost: number;
  powerLoss: number;
  isCompliant: boolean;
  ampacity: number;
  annualOperatingCost: number;
  installationCost: number;
  totalCostOfOwnership: number;
  paybackPeriod?: number;
}

export interface ConductorComparisonChartProps {
  circuitData: UnifiedCircuitData;
  currentConductorSize: string;
  alternativeSizes?: string[];
  comparisonData: Record<string, ConductorComparisonData>;
  onSizeSelect?: (size: string) => void;
  height?: number;
}

/**
 * Component for comparing different conductor sizes and their impact on voltage drop and costs
 */
const ConductorComparisonChart: React.FC<ConductorComparisonChartProps> = ({
  circuitData,
  currentConductorSize,
  alternativeSizes,
  comparisonData,
  onSizeSelect,
  height = 400
}) => {
  const theme = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<string>('voltageDropPercent');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    alternativeSizes?.slice(0, 4) || Object.keys(comparisonData).slice(0, 4)
  );
  
  // If no comparison data is provided, return null
  if (!comparisonData || Object.keys(comparisonData).length === 0) {
    return null;
  }
  
  // Get colors from theme
  const compliantColor = theme.palette.success.main;
  const nonCompliantColor = theme.palette.error.main;
  const currentSizeColor = theme.palette.primary.main;
  const gridColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const fontColor = theme.palette.text.primary;

  // Handle metric change
  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value);
  };
  
  // Handle size selection change
  const handleSizeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedSizes(typeof value === 'string' ? value.split(',') : value);
  };
  
  // Generate labels based on the metric
  const getMetricLabel = (metric: string): string => {
    switch (metric) {
      case 'voltageDropPercent':
        return 'Voltage Drop (%)';
      case 'powerLoss':
        return 'Power Loss (W)';
      case 'cost':
        return 'Material Cost ($)';
      case 'annualOperatingCost':
        return 'Annual Operating Cost ($/year)';
      case 'installationCost':
        return 'Installation Cost ($)';
      case 'totalCostOfOwnership':
        return 'Total Cost of Ownership (5yr)';
      case 'paybackPeriod':
        return 'Payback Period (years)';
      default:
        return 'Value';
    }
  };
  
  // Get the value for a given metric and conductor size
  const getMetricValue = (metric: string, size: string): number => {
    const data = comparisonData[size];
    if (!data) return 0;
    
    switch (metric) {
      case 'voltageDropPercent':
        return data.voltageDropPercent;
      case 'powerLoss':
        return data.powerLoss;
      case 'cost':
        return data.cost;
      case 'annualOperatingCost':
        return data.annualOperatingCost;
      case 'installationCost':
        return data.installationCost;
      case 'totalCostOfOwnership':
        return data.totalCostOfOwnership;
      case 'paybackPeriod':
        return data.paybackPeriod || 0;
      default:
        return 0;
    }
  };
  
  // Determine if lower values are better for a given metric
  const isLowerBetter = (metric: string): boolean => {
    return ['voltageDropPercent', 'powerLoss', 'cost', 'annualOperatingCost', 'installationCost', 'totalCostOfOwnership', 'paybackPeriod'].includes(metric);
  };

  // Find the best size based on the selected metric
  const getBestSize = (): string => {
    const metric = selectedMetric;
    const lower = isLowerBetter(metric);
    
    return Object.entries(comparisonData)
      .filter(([size, data]) => data.isCompliant) // Only consider compliant sizes
      .sort(([_sizeA, dataA], [_sizeB, dataB]) => {
        const valueA = getMetricValue(metric, _sizeA);
        const valueB = getMetricValue(metric, _sizeB);
        return lower ? valueA - valueB : valueB - valueA;
      })[0]?.[0] || currentConductorSize;
  };
  
  // Create chart data for the selected sizes and metric
  const chartData = {
    labels: selectedSizes,
    datasets: [
      {
        label: getMetricLabel(selectedMetric),
        data: selectedSizes.map(size => getMetricValue(selectedMetric, size)),
        backgroundColor: selectedSizes.map(size => {
          if (size === currentConductorSize) {
            return currentSizeColor;
          }
          return comparisonData[size]?.isCompliant ? compliantColor : nonCompliantColor;
        }),
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: getMetricLabel(selectedMetric),
          color: fontColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: fontColor
        }
      },
      x: {
        title: {
          display: true,
          text: 'Conductor Size',
          color: fontColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: fontColor
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const size = context.label;
            const value = context.raw;
            const metric = selectedMetric;
            
            let suffix = '';
            switch (metric) {
              case 'voltageDropPercent':
                suffix = '%';
                break;
              case 'powerLoss':
                suffix = 'W';
                break;
              case 'cost':
              case 'annualOperatingCost':
              case 'installationCost':
              case 'totalCostOfOwnership':
                suffix = '$';
                break;
              case 'paybackPeriod':
                suffix = 'years';
                break;
            }
            
            return `${getMetricLabel(metric)}: ${suffix}${value.toFixed(2)}`;
          },
          afterLabel: (context: any) => {
            const size = context.label;
            const data = comparisonData[size];
            
            if (!data) return '';
            
            return [
              `Voltage Drop: ${data.voltageDropPercent.toFixed(2)}%`,
              `Power Loss: ${data.powerLoss.toFixed(2)}W`,
              `Compliant: ${data.isCompliant ? 'Yes' : 'No'}`
            ];
          }
        }
      },
      legend: {
        display: false
      }
    }
  };
  
  // Render size detail cards to compare specific metrics
  const renderSizeDetailCards = () => {
    return selectedSizes.map(size => {
      const data = comparisonData[size];
      if (!data) return null;
      
      const isCurrent = size === currentConductorSize;
      const isCompliant = data.isCompliant;
      
      return (
        <Grid item xs={12} sm={6} md={4} key={size}>
          <Card 
            variant="outlined" 
            sx={{
              borderColor: isCurrent ? 'primary.main' : (isCompliant ? 'success.main' : 'error.main'),
              bgcolor: isCurrent ? 'primary.light' : 'background.paper',
              position: 'relative',
              height: '100%'
            }}
          >
            {isCurrent && (
              <Chip 
                label="Current Size" 
                color="primary" 
                size="small" 
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
            
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                {size}
                {isCompliant ? (
                  <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                ) : (
                  <WarningIcon color="error" sx={{ ml: 1 }} />
                )}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Voltage Drop:
                </Typography>
                <Typography variant="body1" color={isCompliant ? 'success.main' : 'error.main'}>
                  {data.voltageDropPercent.toFixed(2)}%
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Power Loss:
                </Typography>
                <Typography variant="body1">
                  {data.powerLoss.toFixed(2)} W
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Material Cost:
                </Typography>
                <Typography variant="body1">
                  ${data.cost.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Annual Operating Cost:
                </Typography>
                <Typography variant="body1">
                  ${data.annualOperatingCost.toFixed(2)}/year
                </Typography>
              </Box>
              
              {!isCurrent && data.paybackPeriod !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payback Period:
                  </Typography>
                  <Typography variant="body1">
                    {data.paybackPeriod > 100 ? 'Never' : `${data.paybackPeriod.toFixed(1)} years`}
                  </Typography>
                </Box>
              )}
              
              {!isCurrent && (
                <Button
                  variant="outlined"
                  color={isCompliant ? 'success' : 'error'}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => onSizeSelect && onSizeSelect(size)}
                  startIcon={<CompareArrowsIcon />}
                >
                  Select This Size
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };
  
  // Render recommendation based on the best size for the selected metric
  const renderRecommendation = () => {
    const bestSize = getBestSize();
    const bestSizeData = comparisonData[bestSize];
    
    if (!bestSizeData || bestSize === currentConductorSize) {
      return null;
    }
    
    const savingsPercent = (
      (comparisonData[currentConductorSize]?.annualOperatingCost - bestSizeData.annualOperatingCost) / 
      comparisonData[currentConductorSize]?.annualOperatingCost * 100
    ).toFixed(1);
    
    return (
      <Card variant="outlined" sx={{ mb: 2, bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recommendation
          </Typography>
          <Typography variant="body1">
            Based on {getMetricLabel(selectedMetric)}, the optimal conductor size is <strong>{bestSize}</strong>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {bestSizeData.paybackPeriod && bestSizeData.paybackPeriod < 100 ? (
              <>Using {bestSize} instead of {currentConductorSize} could save ${(comparisonData[currentConductorSize]?.annualOperatingCost - bestSizeData.annualOperatingCost).toFixed(2)} per year ({savingsPercent}%). 
              Payback period: {bestSizeData.paybackPeriod.toFixed(1)} years.</>
            ) : (
              <>While {bestSize} provides better performance than {currentConductorSize}, the economic benefit might not justify the upgrade cost.</>
            )}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => onSizeSelect && onSizeSelect(bestSize)}
            startIcon={<CheckCircleIcon />}
          >
            Select Recommended Size
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Conductor Size Comparison
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Compare different conductor sizes to find the optimal balance between voltage drop performance and cost.">
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {renderRecommendation()}
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Comparison Metric</InputLabel>
            <Select
              value={selectedMetric}
              onChange={handleMetricChange}
              label="Comparison Metric"
            >
              <MenuItem value="voltageDropPercent">Voltage Drop (%)</MenuItem>
              <MenuItem value="powerLoss">Power Loss (W)</MenuItem>
              <MenuItem value="cost">Material Cost ($)</MenuItem>
              <MenuItem value="annualOperatingCost">Annual Operating Cost ($/year)</MenuItem>
              <MenuItem value="totalCostOfOwnership">Total Cost of Ownership (5yr)</MenuItem>
              {Object.values(comparisonData).some(data => data.paybackPeriod !== undefined) && (
                <MenuItem value="paybackPeriod">Payback Period (years)</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Conductor Sizes</InputLabel>
            <Select
              multiple
              value={selectedSizes}
              onChange={handleSizeChange}
              label="Conductor Sizes"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      color={value === currentConductorSize ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.keys(comparisonData).map((size) => (
                <MenuItem key={size} value={size}>
                  {size} {size === currentConductorSize ? '(Current)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ height: height / 2 }}>
        <Bar data={chartData} options={chartOptions as any} />
      </Box>
      
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
        Detailed Comparison
      </Typography>
      
      <Grid container spacing={2}>
        {renderSizeDetailCards()}
      </Grid>
    </Paper>
  );
};

export default ConductorComparisonChart; 