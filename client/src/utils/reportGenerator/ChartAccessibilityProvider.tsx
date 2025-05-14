import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect, lazy, Suspense } from 'react';
import { ChartConfiguration, ChartType } from 'chart.js';
import AccessibleChart from './AccessibleChart';
import ResponsiveAccessibleChart from './ResponsiveAccessibleChart';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';
import InteractiveChart from './InteractiveChart';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
import { highContrastChartThemes, highContrastChartBorders, highContrastTextStyles } from './highContrastChartThemes';
import { applyEnhancedPatternFillsToDatasets } from '../accessibility/enhancedPatternFills';
import { ColorBlindnessType, simulateChartColors } from '../accessibility/colorBlindnessSimulation';

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

// Lazy load EnhancedAccessibleChart to avoid circular dependencies
const EnhancedAccessibleChart = lazy(() => import('./EnhancedAccessibleChart'));

/**
 * Provider component that makes chart accessibility settings available throughout the app
 */
export const ChartAccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for accessibility settings
  const [settings, setSettings] = useState<ChartAccessibilitySettings>(defaultSettings);
  
  // Get global accessibility settings
  const globalAccessibility = useAccessibilitySettings();

  // Sync chart accessibility settings with global settings
  useEffect(() => {
    // Update high contrast mode based on global setting
    if (globalAccessibility.settings.highContrastMode !== settings.highContrastDefault) {
      setSettings(prev => ({
        ...prev,
        highContrastDefault: globalAccessibility.settings.highContrastMode
      }));
    }
    
    // Sync screen reader optimization with global setting
    if (globalAccessibility.settings.screenReaderOptimization !== settings.screenReaderAnnouncements) {
      setSettings(prev => ({
        ...prev,
        screenReaderAnnouncements: globalAccessibility.settings.screenReaderOptimization
      }));
    }
  }, [
    globalAccessibility.settings.highContrastMode, 
    globalAccessibility.settings.screenReaderOptimization
  ]);

  // Update settings function
  const updateSettings = (newSettings: Partial<ChartAccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    
    // Sync high contrast mode with global settings
    if (newSettings.highContrastDefault !== undefined && 
        newSettings.highContrastDefault !== globalAccessibility.settings.highContrastMode) {
      globalAccessibility.updateSettings({
        highContrastMode: newSettings.highContrastDefault
      });
    }
    
    // Sync screen reader optimization with global settings
    if (newSettings.screenReaderAnnouncements !== undefined && 
        newSettings.screenReaderAnnouncements !== globalAccessibility.settings.screenReaderOptimization) {
      globalAccessibility.updateSettings({
        screenReaderOptimization: newSettings.screenReaderAnnouncements
      });
    }
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
    
    // Check for high contrast mode from global settings or local settings
    const useHighContrast = globalAccessibility.settings.highContrastMode || settings.highContrastDefault;
    
    // Clone the configuration to avoid modifying the original
    let configuration = JSON.parse(JSON.stringify(props.configuration));
    
    // Apply color blindness simulation if enabled
    if (globalAccessibility.settings.colorBlindnessSimulation !== ColorBlindnessType.NONE) {
      configuration = simulateChartColors(
        configuration, 
        globalAccessibility.settings.colorBlindnessSimulation
      );
    }
    
    // Apply high contrast theme if needed
    if (useHighContrast && props.themeName) {
      // Get high contrast theme based on themeName
      const highContrastTheme = highContrastChartThemes[props.themeName] || highContrastChartThemes.default;
      
      // Apply high contrast theme to chart
      if (configuration.options && configuration.options.plugins && configuration.options.plugins.title) {
        configuration.options.plugins.title = {
          ...configuration.options.plugins.title,
          color: highContrastTextStyles.color,
          font: {
            ...(configuration.options.plugins.title.font || {}),
            weight: 'bold'
          }
        };
      }
      
      // Apply high contrast colors to datasets and extract colors for pattern fills
      const highContrastColors: string[] = [];
      
      if (configuration.data && configuration.data.datasets) {
        configuration.data.datasets = configuration.data.datasets.map((dataset: any, index: number) => {
          const colorKey = index === 0 
            ? 'primary' 
            : index === 1 
              ? 'secondary' 
              : index === 2 
                ? 'tertiary' 
                : index < highContrastTheme.additionalColors.length + 3
                  ? highContrastTheme.additionalColors[index - 3]
                  : highContrastTheme.primary;
          
          // Store color for pattern generation
          if (typeof colorKey === 'string' && colorKey in highContrastTheme) {
            highContrastColors.push(highContrastTheme[colorKey as keyof typeof highContrastTheme] as string);
          } else {
            highContrastColors.push(typeof colorKey === 'string' ? colorKey : highContrastTheme.primary);
          }
          
          return {
            ...dataset,
            borderColor: highContrastTheme.primary,
            backgroundColor: index < highContrastTheme.additionalColors.length
              ? highContrastTheme.additionalColors[index]
              : highContrastTheme.primary,
            borderWidth: highContrastChartBorders.borderWidth
          };
        });
        
        // Apply pattern fills to datasets for better accessibility
        // Only apply to certain chart types where patterns make sense
        if (['pie', 'doughnut', 'bar', 'polarArea'].includes(configuration.type as string)) {
          configuration.data.datasets = applyEnhancedPatternFillsToDatasets(
            configuration.data.datasets,
            highContrastColors,
            highContrastTheme.background,
            globalAccessibility.settings.colorBlindnessSimulation
          );
        }
      }
      
      // Add grid line styling for better contrast
      if (configuration.options && configuration.options.scales) {
        if (configuration.options.scales.x) {
          configuration.options.scales.x.grid = {
            ...configuration.options.scales.x.grid,
            color: highContrastTheme.primary,
            lineWidth: 1.5,
            tickColor: highContrastTheme.primary
          };
          
          configuration.options.scales.x.ticks = {
            ...configuration.options.scales.x.ticks,
            color: highContrastTheme.primary
          };
        }
        
        if (configuration.options.scales.y) {
          configuration.options.scales.y.grid = {
            ...configuration.options.scales.y.grid,
            color: highContrastTheme.primary,
            lineWidth: 1.5,
            tickColor: highContrastTheme.primary
          };
          
          configuration.options.scales.y.ticks = {
            ...configuration.options.scales.y.ticks,
            color: highContrastTheme.primary
          };
        }
      }
      
      // Enhance legend for high contrast
      if (configuration.options && configuration.options.plugins && configuration.options.plugins.legend) {
        configuration.options.plugins.legend = {
          ...configuration.options.plugins.legend,
          labels: {
            ...configuration.options.plugins.legend.labels,
            color: highContrastTheme.primary,
            font: {
              ...(configuration.options.plugins.legend.labels?.font || {}),
              weight: 'bold'
            },
            usePointStyle: true,
            boxWidth: 15
          }
        };
      }
    }
    
    // Determine whether to use enhanced keyboard navigation
    const useEnhancedNavigation = settings.keyboardNavigationEnabled;
    
    // If responsive sizing is enabled and enhanced navigation is enabled, use ResponsiveChartWrapper with EnhancedAccessibleChart
    if (settings.responsiveSizingEnabled && useEnhancedNavigation) {
      return (
        <Suspense fallback={<div>Loading enhanced chart...</div>}>
          <ResponsiveChartWrapper
            minHeight={props.minHeight}
            maxHeight={props.maxHeight}
            aspectRatio={props.aspectRatio}
            allowSmallerOnMobile={props.allowSmallerOnMobile}
            className={props.className}
            style={props.style}
            sizePreset={props.sizePreset || settings.defaultSizePreset}
          >
            {(dimensions: { width: number; height: number }) => (
              <EnhancedAccessibleChart
                {...props}
                width={dimensions.width}
                height={dimensions.height}
                configuration={configuration}
                highContrastDefault={useHighContrast}
                dataTableView={settings.dataTableViewDefault}
              />
            )}
          </ResponsiveChartWrapper>
        </Suspense>
      );
    }
    
    // If enhanced navigation is enabled but not responsive sizing
    if (useEnhancedNavigation) {
      return (
        <Suspense fallback={<div>Loading enhanced chart...</div>}>
          <EnhancedAccessibleChart
            {...props}
            configuration={configuration}
            highContrastDefault={useHighContrast}
            dataTableView={settings.dataTableViewDefault}
          />
        </Suspense>
      );
    }
    
    // If responsive sizing is enabled but not enhanced navigation, use ResponsiveAccessibleChart
    if (settings.responsiveSizingEnabled) {
      return (
        <ResponsiveAccessibleChart
          {...props}
          configuration={configuration}
          highContrastDefault={useHighContrast}
          dataTableView={settings.dataTableViewDefault}
          sizePreset={props.sizePreset || settings.defaultSizePreset}
        />
      );
    }
    
    // Otherwise, use the regular AccessibleChart
    return (
      <AccessibleChart
        {...props}
        configuration={configuration}
        highContrastDefault={useHighContrast}
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
    [
      settings, 
      globalAccessibility.settings.highContrastMode, 
      globalAccessibility.settings.screenReaderOptimization,
      globalAccessibility.settings.colorBlindnessSimulation
    ]
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