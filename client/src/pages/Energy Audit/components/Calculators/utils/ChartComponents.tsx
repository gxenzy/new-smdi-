/**
 * Chart Components - React wrappers for chart templates
 * 
 * This file provides React components that wrap the chart templates and hooks,
 * making it easier to use the chart system in React components.
 */

import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { 
  useThemeAwareChart,
  barChartTemplate,
  lineChartTemplate,
  pieChartTemplate,
  radarChartTemplate,
  scatterChartTemplate,
  getChartThemeColors,
  ChartThemeColors
} from './chartUtils';

// Common props for all chart components
interface BaseChartProps {
  id: string;
  height?: number | string;
  width?: number | string;
  title?: string;
}

// Bar Chart Component
interface ThemedBarChartProps extends BaseChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
  options?: {
    xAxisTitle?: string;
    yAxisTitle?: string;
    stacked?: boolean;
    horizontal?: boolean;
    beginAtZero?: boolean;
  };
}

export const ThemedBarChart: React.FC<ThemedBarChartProps> = ({
  id,
  height = 300,
  width = '100%',
  title,
  labels,
  datasets,
  options = {}
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the theme-aware chart hook
  useThemeAwareChart(
    id,
    id,
    (isDarkMode, themeColors) => barChartTemplate(
      isDarkMode,
      themeColors,
      labels,
      datasets,
      {
        ...options,
        title
      }
    ),
    [JSON.stringify(labels), JSON.stringify(datasets), JSON.stringify(options), title]
  );
  
  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </Box>
  );
};

// Line Chart Component
interface ThemedLineChartProps extends BaseChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    pointRadius?: number;
    borderDash?: number[];
  }[];
  options?: {
    xAxisTitle?: string;
    yAxisTitle?: string;
    beginAtZero?: boolean;
    showPoints?: boolean;
  };
}

export const ThemedLineChart: React.FC<ThemedLineChartProps> = ({
  id,
  height = 300,
  width = '100%',
  title,
  labels,
  datasets,
  options = {}
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the theme-aware chart hook
  useThemeAwareChart(
    id,
    id,
    (isDarkMode, themeColors) => lineChartTemplate(
      isDarkMode,
      themeColors,
      labels,
      datasets,
      {
        ...options,
        title
      }
    ),
    [JSON.stringify(labels), JSON.stringify(datasets), JSON.stringify(options), title]
  );
  
  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </Box>
  );
};

// Pie Chart Component
interface ThemedPieChartProps extends BaseChartProps {
  labels: string[];
  data: number[];
  options?: {
    isDoughnut?: boolean;
    cutout?: number;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    backgroundColor?: string[];
    borderColor?: string[];
  };
}

export const ThemedPieChart: React.FC<ThemedPieChartProps> = ({
  id,
  height = 300,
  width = '100%',
  title,
  labels,
  data,
  options = {}
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the theme-aware chart hook
  useThemeAwareChart(
    id,
    id,
    (isDarkMode, themeColors) => pieChartTemplate(
      isDarkMode,
      themeColors,
      labels,
      data,
      {
        ...options,
        title
      }
    ),
    [JSON.stringify(labels), JSON.stringify(data), JSON.stringify(options), title]
  );
  
  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </Box>
  );
};

// Radar Chart Component
interface ThemedRadarChartProps extends BaseChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    pointRadius?: number;
    pointBackgroundColor?: string;
    borderDash?: number[];
  }[];
  options?: {
    startAtZero?: boolean;
  };
}

export const ThemedRadarChart: React.FC<ThemedRadarChartProps> = ({
  id,
  height = 300,
  width = '100%',
  title,
  labels,
  datasets,
  options = {}
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the theme-aware chart hook
  useThemeAwareChart(
    id,
    id,
    (isDarkMode, themeColors) => radarChartTemplate(
      isDarkMode,
      themeColors,
      labels,
      datasets,
      {
        ...options,
        title
      }
    ),
    [JSON.stringify(labels), JSON.stringify(datasets), JSON.stringify(options), title]
  );
  
  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </Box>
  );
};

// Scatter Chart Component
interface ThemedScatterChartProps extends BaseChartProps {
  datasets: {
    label: string;
    data: Array<{ x: number; y: number }>;
    backgroundColor?: string;
    borderColor?: string;
  }[];
  options?: {
    xAxisTitle?: string;
    yAxisTitle?: string;
    xBeginAtZero?: boolean;
    yBeginAtZero?: boolean;
  };
}

export const ThemedScatterChart: React.FC<ThemedScatterChartProps> = ({
  id,
  height = 300,
  width = '100%',
  title,
  datasets,
  options = {}
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the theme-aware chart hook
  useThemeAwareChart(
    id,
    id,
    (isDarkMode, themeColors) => scatterChartTemplate(
      isDarkMode,
      themeColors,
      datasets,
      {
        ...options,
        title
      }
    ),
    [JSON.stringify(datasets), JSON.stringify(options), title]
  );
  
  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </Box>
  );
};

// Export a generic chart container component
interface ChartContainerProps {
  id: string;
  height?: number | string;
  width?: number | string;
  children?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  id,
  height = 300,
  width = '100%',
  children
}) => {
  return (
    <Box 
      sx={{ 
        height, 
        width, 
        position: 'relative',
        '& canvas': {
          maxWidth: '100%',
          height: 'auto !important'
        }
      }}
    >
      {children ? children : <canvas id={id} />}
    </Box>
  );
};

export default {
  ThemedBarChart,
  ThemedLineChart,
  ThemedPieChart,
  ThemedRadarChart,
  ThemedScatterChart,
  ChartContainer
}; 