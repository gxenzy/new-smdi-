import { ChartColorTheme } from './chartGenerator';

/**
 * High contrast themes for chart rendering in high contrast mode.
 * These themes follow accessibility guidelines for color contrast,
 * using colors that provide at least 3:1 contrast ratio for non-text elements.
 */
export const highContrastChartThemes: Record<string, ChartColorTheme> = {
  /**
   * Default high contrast theme with strong black/white/yellow contrast
   */
  default: {
    primary: '#FFFFFF',
    secondary: '#FFFF00',
    tertiary: '#00FFFF',
    success: '#00FF00',
    warning: '#FF8000',
    danger: '#FF00FF',
    neutral: '#FFFFFF',
    background: '#000000',
    additionalColors: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00']
  },
  
  /**
   * Energy high contrast theme optimized for energy visualizations
   */
  energy: {
    primary: '#FFFFFF',
    secondary: '#FFFF00',
    tertiary: '#00FFFF',
    success: '#00FF00',
    warning: '#FF8000',
    danger: '#FF00FF',
    neutral: '#FFFFFF',
    background: '#000000',
    additionalColors: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00']
  },
  
  /**
   * Financial high contrast theme optimized for financial visualizations
   */
  financial: {
    primary: '#FFFFFF',
    secondary: '#FFFF00',
    tertiary: '#00FFFF',
    success: '#00FF00',
    warning: '#FF8000',
    danger: '#FF00FF',
    neutral: '#FFFFFF',
    background: '#000000',
    additionalColors: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00']
  }
};

/**
 * Chart border styles for high contrast mode
 */
export const highContrastChartBorders = {
  borderWidth: 2,
  borderColor: '#FFFFFF'
};

/**
 * Chart title styles for high contrast mode
 */
export const highContrastTextStyles = {
  color: '#FFFFFF',
  fontWeight: 'bold'
};

/**
 * Grid line styles for high contrast mode
 */
export const highContrastGridStyles = {
  color: '#FFFFFF',
  lineWidth: 1.5
};

/**
 * Legend styles for high contrast mode
 */
export const highContrastLegendStyles = {
  labelTextColor: '#FFFFFF',
  boxWidth: 15,
  boxHeight: 15,
  padding: 15,
  usePointStyle: true
}; 