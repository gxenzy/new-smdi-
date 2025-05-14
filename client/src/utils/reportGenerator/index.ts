// Export all report generator utilities and components
export * from './chartGenerator';
export * from './chartDataAdapter';
export * from './pdfGenerator';
export * from './chartExport';

// Export React components as default exports
export { default as InteractiveChart } from './InteractiveChart';
export { default as AccessibleChart } from './AccessibleChart';
export { default as ResponsiveChartWrapper } from './ResponsiveChartWrapper';
export { default as ResponsiveAccessibleChart } from './ResponsiveAccessibleChart';
export { default as ChartAccessibilityProvider, useChartAccessibility, AccessibleChartRenderer } from './ChartAccessibilityProvider';
export { default as ChartCustomizationPanel } from './ChartCustomizationPanel';
export { default as ChartReportIntegration } from './ChartReportIntegration';
export { default as EnergyAuditChart } from './EnergyAuditChart';
export { default as EnergyAuditDashboard } from './EnergyAuditDashboard';
export { default as InteractiveCalculatorCharts } from './InteractiveCalculatorCharts';
export { default as ResponsiveChartExample } from './ResponsiveChartExample';
export { default as DrilldownChart } from './DrilldownChart';
export { default as DrilldownChartExample } from './DrilldownChartExample';
export { default as ZoomableChart } from './ZoomableChart';
export { default as ZoomableChartExample } from './ZoomableChartExample';

// Export all chart generator related components and utilities
export { ChartGenerator } from './chartGenerator';
export { chartThemes, type ChartColorTheme, type ScaleType, type AxisOptions } from './chartGenerator';
export { default as ChartCustomizationExample } from './ChartCustomizationExample';
export type { ChartCustomizationOptions, ChartType } from './ChartCustomizationPanel';
export type { 
  EnergyConsumptionData, 
  EnergyDistributionData, 
  EnergyReductionData, 
  EnergyBenchmarkData,
  EnergyAuditChartType
} from './EnergyAuditChart';

// Calculator Chart Integration exports
export { default as CalculatorChartIntegration } from './CalculatorChartIntegration';

// Interactive Chart exports
export { default as InteractiveChartExample } from './InteractiveChartExample';

// Chart Export Utilities
export { 
  exportChartAsPNG,
  exportChartAsJPEG,
  exportChartAsSVG,
  chartToImage,
  getChartCanvas
} from './chartExport';

// Export types for responsive sizing
export type { 
  ResponsiveAccessibleChartProps 
} from './ResponsiveAccessibleChart';

// Export types for drill-down chart
export type { 
  DrilldownNode,
  DrilldownChartProps 
} from './DrilldownChart';

// Export types for zoomable chart
export type {
  ZoomableChartProps
} from './ZoomableChart';