import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import chartManager from './chartManager';
import { useTheme } from '@mui/material/styles';

/**
 * React hook for creating and managing a Chart.js instance with proper lifecycle management
 * 
 * This hook will create a chart using the chartManager, and ensure proper cleanup when the component unmounts
 * 
 * @param canvasId The ID of the canvas element
 * @param chartId A unique ID for this chart (defaults to canvasId if not provided)
 * @param getConfig Function that returns the chart configuration
 * @param dependencies Dependencies to watch for changes (will recreate chart when these change)
 * @returns The created Chart instance or null if not created yet
 */
function useChart(
  canvasId: string,
  chartId: string | undefined,
  getConfig: () => ChartConfiguration | null,
  dependencies: any[] = []
): Chart | null {
  const chartRef = useRef<Chart | null>(null);
  
  useEffect(() => {
    // Get chart configuration
    const config = getConfig();
    if (!config) return;
    
    // Create chart
    const chart = chartManager.createChart(canvasId, chartId, config);
    
    // Store chart reference
    chartRef.current = chart;
    
    // Cleanup when component unmounts
    return () => {
      const id = chartId || canvasId;
      chartManager.destroyChart(id);
      chartRef.current = null;
    };
  }, dependencies);
  
  return chartRef.current;
}

/**
 * React hook for updating an existing chart
 * 
 * @param chartId The ID of the chart to update
 * @param updateFn Function to update the chart
 * @param dependencies Dependencies to watch for changes
 */
function useChartUpdate(
  chartId: string,
  updateFn: (chart: Chart) => void,
  dependencies: any[] = []
): void {
  useEffect(() => {
    // Get existing chart
    const chart = chartManager.getChart(chartId);
    if (!chart) return;
    
    // Update chart
    updateFn(chart);
    chart.update();
  }, dependencies);
}

/**
 * React hook for creating a disposable chart that will be destroyed on unmount
 * Useful for visualizations that don't need to be updated
 * 
 * @param canvasId The ID of the canvas element
 * @param config Chart configuration
 */
function useDisposableChart(
  canvasId: string,
  config: ChartConfiguration | null
): void {
  useEffect(() => {
    if (!config) return;
    
    // Create chart
    const chart = chartManager.createChart(canvasId, canvasId, config);
    
    // Cleanup when component unmounts
    return () => {
      chartManager.destroyChart(canvasId);
    };
  }, [canvasId, config]);
}

/**
 * React hook for creating theme-aware charts that automatically update when theme changes
 * 
 * @param canvasId The ID of the canvas element
 * @param chartId A unique ID for this chart (defaults to canvasId if not provided)
 * @param getConfig Function that returns the chart configuration based on current theme
 * @param dependencies Additional dependencies to watch for changes
 * @returns The created Chart instance or null if not created yet
 */
function useThemeAwareChart(
  canvasId: string,
  chartId: string | undefined,
  getConfig: (isDarkMode: boolean, themeColors: any) => ChartConfiguration | null,
  dependencies: any[] = []
): Chart | null {
  const theme = useTheme();
  const chartRef = useRef<Chart | null>(null);
  
  // Determine if we're in dark mode
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Extract common theme colors for charts
  const themeColors = {
    text: theme.palette.text.primary,
    background: theme.palette.background.paper,
    grid: theme.palette.divider,
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main
  };
  
  useEffect(() => {
    // Get chart configuration with theme awareness
    const config = getConfig(isDarkMode, themeColors);
    if (!config) return;
    
    // Always clean up existing chart before creating a new one
    const id = chartId || canvasId;
    if (chartManager.hasChart(id)) {
      chartManager.destroyChart(id);
    }
    
    // Create chart
    const chart = chartManager.createChart(canvasId, chartId, config);
    
    // Store chart reference
    chartRef.current = chart;
    
    // Cleanup when component unmounts or dependencies change
    return () => {
      chartManager.destroyChart(id);
      chartRef.current = null;
    };
  }, [isDarkMode, ...dependencies]);
  
  return chartRef.current;
}

export { useChart, useChartUpdate, useDisposableChart, useThemeAwareChart }; 