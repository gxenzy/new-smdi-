import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ChartConfiguration, ChartType } from 'chart.js';
import AccessibleChart from './AccessibleChart';
import ResponsiveAccessibleChart from './ResponsiveAccessibleChart';
import InteractiveChart from './InteractiveChart';

/**
 * The accessibility settings that can be applied application-wide
 */
export interface ChartAccessibilitySettings {
  enabled: boolean;
  highContrastDefault: boolean;
  dataTableViewDefault: boolean;
  keyboardNavigationEnabled: boolean;
  screenReaderAnnouncements: boolean;
  // New responsive sizing settings
  responsiveSizingEnabled: boolean;
  defaultSizePreset: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
}

/**
 * Default accessibility settings
 */
const defaultSettings: ChartAccessibilitySettings = {
  enabled: true,
  highContrastDefault: false,
  dataTableViewDefault: false,
  keyboardNavigationEnabled: true,
  screenReaderAnnouncements: true,
  // New responsive sizing settings
  responsiveSizingEnabled: true,
  defaultSizePreset: 'standard',
};

/**
 * Context interface for chart accessibility
 */
interface ChartAccessibilityContextProps {
  settings: ChartAccessibilitySettings;
  updateSettings: (newSettings: Partial<ChartAccessibilitySettings>) => void;
  renderAccessibleChart: (props: {
    title?: string;
    subtitle?: string;
    configuration: ChartConfiguration;
    width?: string | number;
    height?: string | number;
    themeName?: 'default' | 'energy' | 'financial';
    showExportOptions?: boolean;
    showChartTypeOptions?: boolean;
    isLoading?: boolean;
    onAddToReport?: (canvas: HTMLCanvasElement) => void;
    onChartTypeChange?: (type: ChartType) => void;
    onRefresh?: () => void;
    onEdit?: () => void;
    ariaLabel?: string;
    // Additional props for responsive sizing
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: number;
    allowSmallerOnMobile?: boolean;
    className?: string;
    style?: React.CSSProperties;
    sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  }) => JSX.Element;
}

// Create the context
const ChartAccessibilityContext = createContext<ChartAccessibilityContextProps | undefined>(undefined);

/**
 * Provider component that makes chart accessibility settings available throughout the app
 */
export const ChartAccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for accessibility settings
  const [settings, setSettings] = useState<ChartAccessibilitySettings>(defaultSettings);

  // Update settings function
  const updateSettings = (newSettings: Partial<ChartAccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Function to render either an accessible chart or regular chart based on settings
  const renderAccessibleChart = (props: {
    title?: string;
    subtitle?: string;
    configuration: ChartConfiguration;
    width?: string | number;
    height?: string | number;
    themeName?: 'default' | 'energy' | 'financial';
    showExportOptions?: boolean;
    showChartTypeOptions?: boolean;
    isLoading?: boolean;
    onAddToReport?: (canvas: HTMLCanvasElement) => void;
    onChartTypeChange?: (type: ChartType) => void;
    onRefresh?: () => void;
    onEdit?: () => void;
    ariaLabel?: string;
    // Additional props for responsive sizing
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: number;
    allowSmallerOnMobile?: boolean;
    className?: string;
    style?: React.CSSProperties;
    sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  }) => {
    // If accessibility is not enabled, render the basic InteractiveChart
    if (!settings.enabled) {
      return <InteractiveChart {...props} />;
    }
    
    // If responsive sizing is enabled, use ResponsiveAccessibleChart
    if (settings.responsiveSizingEnabled) {
      return (
        <ResponsiveAccessibleChart
          {...props}
          highContrastDefault={settings.highContrastDefault}
          dataTableView={settings.dataTableViewDefault}
          sizePreset={props.sizePreset || settings.defaultSizePreset}
        />
      );
    }
    
    // Otherwise, use the regular AccessibleChart
    return (
      <AccessibleChart
        {...props}
        highContrastDefault={settings.highContrastDefault}
        dataTableView={settings.dataTableViewDefault}
      />
    );
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      renderAccessibleChart,
    }),
    [settings]
  );

  return (
    <ChartAccessibilityContext.Provider value={value}>
      {children}
    </ChartAccessibilityContext.Provider>
  );
};

/**
 * Hook to access chart accessibility features
 */
export const useChartAccessibility = (): ChartAccessibilityContextProps => {
  const context = useContext(ChartAccessibilityContext);
  if (context === undefined) {
    throw new Error('useChartAccessibility must be used within a ChartAccessibilityProvider');
  }
  return context;
};

/**
 * Component that renders an accessible chart using the provider's settings
 */
export const AccessibleChartRenderer: React.FC<{
  title?: string;
  subtitle?: string;
  configuration: ChartConfiguration;
  width?: string | number;
  height?: string | number;
  themeName?: 'default' | 'energy' | 'financial';
  showExportOptions?: boolean;
  showChartTypeOptions?: boolean;
  isLoading?: boolean;
  onAddToReport?: (canvas: HTMLCanvasElement) => void;
  onChartTypeChange?: (type: ChartType) => void;
  onRefresh?: () => void;
  onEdit?: () => void;
  ariaLabel?: string;
  // Additional props for responsive sizing
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  allowSmallerOnMobile?: boolean;
  className?: string;
  style?: React.CSSProperties;
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
}> = (props) => {
  const { renderAccessibleChart } = useChartAccessibility();
  return renderAccessibleChart(props);
};

export default ChartAccessibilityProvider; 