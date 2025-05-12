import React, { useState } from 'react';
import { ChartConfiguration, ChartType } from 'chart.js';
import AccessibleChart from './AccessibleChart';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

/**
 * Props for the ResponsiveAccessibleChart component
 */
export interface ResponsiveAccessibleChartProps {
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Chart.js configuration */
  configuration: ChartConfiguration;
  /** Theme name */
  themeName?: 'default' | 'energy' | 'financial';
  /** Whether to show export options */
  showExportOptions?: boolean;
  /** Whether to show chart type options */
  showChartTypeOptions?: boolean;
  /** Whether the chart is loading */
  isLoading?: boolean;
  /** Callback when chart is added to report */
  onAddToReport?: (canvas: HTMLCanvasElement) => void;
  /** Callback when chart type changes */
  onChartTypeChange?: (type: ChartType) => void;
  /** Callback when chart is refreshed */
  onRefresh?: () => void;
  /** Callback when chart is edited */
  onEdit?: () => void;
  /** Callback when chart instance reference is available */
  onChartRefChange?: (chartInstance: any) => void;
  /** Custom ARIA label for screen readers */
  ariaLabel?: string;
  /** Whether to use high contrast mode by default */
  highContrastDefault?: boolean;
  /** Whether to show data table view by default */
  dataTableView?: boolean;
  /** Minimum height for the chart */
  minHeight?: number;
  /** Maximum height for the chart */
  maxHeight?: number;
  /** Aspect ratio for the chart (width:height) */
  aspectRatio?: number;
  /** Whether to allow the chart to scale below minHeight on mobile devices */
  allowSmallerOnMobile?: boolean;
  /** Chart container class name */
  className?: string;
  /** Additional style properties */
  style?: React.CSSProperties;
  /** Predefined size preset */
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
}

/**
 * A component that combines the accessibility features of AccessibleChart
 * with responsive sizing based on container dimensions
 */
const ResponsiveAccessibleChart: React.FC<ResponsiveAccessibleChartProps> = ({
  title,
  subtitle,
  configuration,
  themeName = 'default',
  showExportOptions = false,
  showChartTypeOptions = false,
  isLoading = false,
  onAddToReport,
  onChartTypeChange,
  onRefresh,
  onEdit,
  onChartRefChange,
  ariaLabel,
  highContrastDefault = false,
  dataTableView = false,
  minHeight,
  maxHeight,
  aspectRatio,
  allowSmallerOnMobile = true,
  className,
  style,
  sizePreset = 'standard'
}) => {
  // Define size presets
  const getPresetDimensions = (preset: string) => {
    switch (preset) {
      case 'compact':
        return { minHeight: 180, maxHeight: 300, aspectRatio: 4/3 };
      case 'large':
        return { minHeight: 300, maxHeight: 800, aspectRatio: 16/9 };
      case 'report':
        return { minHeight: 250, maxHeight: 500, aspectRatio: 3/2 };
      case 'dashboard':
        return { minHeight: 200, maxHeight: 400, aspectRatio: 5/3 };
      case 'standard':
      default:
        return { minHeight: 250, maxHeight: 600, aspectRatio: 16/9 };
    }
  };
  
  // Get preset values and override with props if provided
  const presetValues = getPresetDimensions(sizePreset);
  const finalMinHeight = minHeight ?? presetValues.minHeight;
  const finalMaxHeight = maxHeight ?? presetValues.maxHeight;
  const finalAspectRatio = aspectRatio ?? presetValues.aspectRatio;
  
  // State to track the calculated dimensions
  const [calculatedWidth, setCalculatedWidth] = useState<number>(0);
  const [calculatedHeight, setCalculatedHeight] = useState<number>(0);
  
  // Handle dimension changes
  const handleDimensionsChange = (width: number, height: number) => {
    setCalculatedWidth(width);
    setCalculatedHeight(height);
  };
  
  return (
    <ResponsiveChartWrapper
      minHeight={finalMinHeight}
      maxHeight={finalMaxHeight}
      aspectRatio={finalAspectRatio}
      allowSmallerOnMobile={allowSmallerOnMobile}
      className={className}
      style={style}
      onDimensionsChange={handleDimensionsChange}
    >
      <AccessibleChart
        title={title}
        subtitle={subtitle}
        configuration={configuration}
        width={calculatedWidth}
        height={calculatedHeight} 
        themeName={themeName}
        showExportOptions={showExportOptions}
        showChartTypeOptions={showChartTypeOptions}
        isLoading={isLoading}
        onAddToReport={onAddToReport}
        onChartTypeChange={onChartTypeChange}
        onRefresh={onRefresh}
        onEdit={onEdit}
        ariaLabel={ariaLabel}
        highContrastDefault={highContrastDefault}
        dataTableView={dataTableView}
        onChartRefChange={onChartRefChange}
      />
    </ResponsiveChartWrapper>
  );
};

export default ResponsiveAccessibleChart; 