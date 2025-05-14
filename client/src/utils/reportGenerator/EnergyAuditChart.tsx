import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ChartGenerator, ScaleType, chartThemes } from './chartGenerator';

export type EnergyConsumptionData = {
  labels: string[];
  consumption: number[];
  cost?: number[];
  emissions?: number[];
  baseline?: number[];
};

export type EnergyDistributionData = {
  categories: string[];
  percentages: number[];
};

export type EnergyReductionData = {
  measures: string[];
  savingsKwh: number[];
  savingsCost: number[];
  implementation?: number[];
  payback?: number[];
};

export type EnergyBenchmarkData = {
  buildingTypes: string[];
  yourBuilding: number;
  averages: number[];
  bestPractice: number[];
};

export type EnergyAuditChartType = 
  | 'consumption' 
  | 'distribution' 
  | 'reduction' 
  | 'benchmark'
  | 'comparison';

interface EnergyAuditChartProps {
  chartType: EnergyAuditChartType;
  title?: string;
  theme?: string;
  data: 
    | EnergyConsumptionData 
    | EnergyDistributionData 
    | EnergyReductionData 
    | EnergyBenchmarkData;
  width?: number;
  height?: number;
  viewMode?: 'kwh' | 'cost' | 'emissions';
}

/**
 * Specialized chart component for energy audit visualizations
 */
const EnergyAuditChart: React.FC<EnergyAuditChartProps> = ({
  chartType,
  title,
  theme = 'energy',
  data,
  width = 800,
  height = 400,
  viewMode: initialViewMode = 'kwh'
}) => {
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(initialViewMode);

  useEffect(() => {
    generateChart();
  }, [chartType, data, theme, viewMode]);

  const generateChart = async () => {
    setIsLoading(true);
    try {
      // Set the theme for chart generation
      ChartGenerator.setTheme(theme);

      let chartDataUrl: string;

      switch (chartType) {
        case 'consumption':
          chartDataUrl = await generateConsumptionChart(data as EnergyConsumptionData);
          break;
        case 'distribution':
          chartDataUrl = await generateDistributionChart(data as EnergyDistributionData);
          break;
        case 'reduction':
          chartDataUrl = await generateReductionChart(data as EnergyReductionData);
          break;
        case 'benchmark':
          chartDataUrl = await generateBenchmarkChart(data as EnergyBenchmarkData);
          break;
        case 'comparison':
          chartDataUrl = await generateComparisonChart(data as EnergyConsumptionData);
          break;
        default:
          chartDataUrl = await ChartGenerator.generateBarChart(
            ['No data'],
            [0],
            title || 'No data available'
          );
      }

      setChartImage(chartDataUrl);
    } catch (error) {
      console.error('Error generating energy audit chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateConsumptionChart = async (data: EnergyConsumptionData) => {
    const chartTitle = title || 'Energy Consumption Over Time';
    
    // Based on view mode, show different datasets
    if (viewMode === 'cost' && data.cost) {
      return ChartGenerator.generateBarChart(
        data.labels,
        data.cost,
        `${chartTitle} (Cost)`,
        chartThemes.financial.primary
      );
    } else if (viewMode === 'emissions' && data.emissions) {
      return ChartGenerator.generateBarChart(
        data.labels,
        data.emissions,
        `${chartTitle} (Emissions)`,
        chartThemes.energy.tertiary
      );
    }

    // If there's baseline data, show a line chart with comparison
    if (data.baseline) {
      return ChartGenerator.generateLineChart(
        data.labels,
        [
          { label: 'Actual', data: data.consumption, color: chartThemes.energy.primary },
          { label: 'Baseline', data: data.baseline, color: chartThemes.energy.secondary }
        ],
        chartTitle
      );
    }

    // Default consumption view
    return ChartGenerator.generateBarChart(
      data.labels,
      data.consumption,
      chartTitle,
      chartThemes.energy.primary
    );
  };

  const generateDistributionChart = async (data: EnergyDistributionData) => {
    return ChartGenerator.generatePieChart(
      data.categories,
      data.percentages,
      title || 'Energy Distribution by Category'
    );
  };

  const generateReductionChart = async (data: EnergyReductionData) => {
    const chartTitle = title || 'Energy Saving Opportunities';
    
    // Based on view mode, show different visualizations
    if (viewMode === 'cost') {
      return ChartGenerator.generateBarChart(
        data.measures,
        data.savingsCost,
        `${chartTitle} (Cost Savings)`,
        chartThemes.financial.primary
      );
    }

    // If implementation costs and savings both exist, show ROI focused view with stacked bar
    if (viewMode === 'emissions' && data.implementation && data.payback) {
      return ChartGenerator.generateLineChart(
        data.measures,
        [
          { label: 'Energy Savings (kWh)', data: data.savingsKwh, color: chartThemes.energy.success },
          { label: 'Payback Period (Years)', data: data.payback, color: chartThemes.energy.warning }
        ],
        `${chartTitle} (ROI Analysis)`
      );
    }

    // Default kWh savings view
    return ChartGenerator.generateBarChart(
      data.measures,
      data.savingsKwh,
      `${chartTitle} (kWh Savings)`,
      chartThemes.energy.success
    );
  };

  const generateBenchmarkChart = async (data: EnergyBenchmarkData) => {
    // Create a stacked bar chart to compare benchmarks
    return ChartGenerator.generateBarChart(
      data.buildingTypes,
      data.averages.map((avg, i) => {
        // Add markers for your building and best practice
        if (i === 0) {
          return data.yourBuilding;
        }
        return avg;
      }),
      title || 'Energy Performance Benchmarking',
      'theme'
    );
  };

  const generateComparisonChart = async (data: EnergyConsumptionData) => {
    // For comparing pre/post retrofit or similar scenarios
    if (!data.baseline) {
      return ChartGenerator.generateBarChart(
        data.labels, 
        data.consumption,
        title || 'Energy Comparison'
      );
    }

    return ChartGenerator.generateComparisonChart(
      data.labels,
      data.baseline,
      data.consumption,
      title || 'Before/After Comparison'
    );
  };

  return (
    <Box>
      {chartType === 'consumption' || chartType === 'reduction' ? (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={(e) => setViewMode(e.target.value as 'kwh' | 'cost' | 'emissions')}
            >
              <MenuItem value="kwh">Energy (kWh)</MenuItem>
              <MenuItem value="cost">Cost ($)</MenuItem>
              <MenuItem value="emissions">Emissions</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ) : null}

      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : chartImage ? (
          <Box 
            component="img" 
            src={chartImage} 
            alt={title || 'Energy Audit Chart'} 
            sx={{ 
              maxWidth: '100%', 
              maxHeight: height || 400
            }}
          />
        ) : (
          <Typography color="text.secondary">No chart data available</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default EnergyAuditChart; 