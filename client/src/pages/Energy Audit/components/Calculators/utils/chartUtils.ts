/**
 * Chart Utilities - Centralized Exports
 * 
 * This file exports all chart-related utilities, hooks, and templates from a single location
 * to simplify imports throughout the application.
 */

import { Theme } from '@mui/material';

// Chart Manager - for chart lifecycle management
export { default as chartManager } from './chartManager';

// Chart Hooks - for React integration
export { 
  useChart, 
  useChartUpdate, 
  useDisposableChart, 
  useThemeAwareChart 
} from './useChart';

// Chart Templates - for consistent chart styling
export { 
  barChartTemplate,
  lineChartTemplate,
  pieChartTemplate,
  radarChartTemplate,
  scatterChartTemplate,
  mixedChartTemplate
} from './chartTemplates';

// Define interface for theme-aware chart colors
export interface ChartThemeColors {
  text: string;
  background: string;
  grid: string;
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  info: string;
  success: string;
}

// Helper function to generate default theme-aware colors from Material-UI theme

/**
 * Extract chart theme colors from Material-UI theme
 * 
 * @param theme Material-UI theme
 * @returns Chart theme colors object
 */
export function getChartThemeColors(theme: Theme): ChartThemeColors {
  return {
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
}

/**
 * Check if we're in dark mode based on the Material-UI theme
 * 
 * @param theme Material-UI theme
 * @returns Whether we're in dark mode
 */
export function isDarkMode(theme: Theme): boolean {
  return theme.palette.mode === 'dark';
} 