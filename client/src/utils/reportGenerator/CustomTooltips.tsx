import React from 'react';
import { ChartType, ChartConfiguration, TooltipModel, TooltipItem } from 'chart.js';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  useTheme,
  styled
} from '@mui/material';
import { ResponsiveAccessibleChart } from './index';

/**
 * Extended tooltip data for custom tooltips
 */
export interface ExtendedTooltipData {
  title?: string;
  subtitle?: string;
  details?: Record<string, string | number>;
  footer?: string;
  comparison?: {
    label: string;
    current: number;
    previous: number;
    unit: string;
    change?: {
      value: number;
      percentage: number;
      positive?: boolean;
    };
  };
  trends?: {
    label: string;
    current: number;
    avg: number;
    unit: string;
  }[];
  recommendations?: string[];
}

/**
 * Props for the tooltip provider
 */
export interface CustomTooltipOptions {
  /** Type of the chart */
  chartType?: ChartType;
  
  /** Whether to show extended data (details, comparison, trends) */
  showExtendedData?: boolean;
  
  /** Function to retrieve extended data for tooltip */
  getExtendedData?: (index: number, datasetIndex: number) => ExtendedTooltipData | null;
  
  /** CSS position for tooltips (default is 'average') */
  position?: 'average' | 'nearest';
  
  /** Whether to use custom HTML tooltip or native Chart.js tooltip */
  useHTML?: boolean;
  
  /** Custom tooltip styles */
  styles?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    titleColor?: string;
    padding?: number;
    borderRadius?: number;
    maxWidth?: number;
  };
}

/**
 * Return a styled HTML tooltip for a chart
 */
export const getExternalTooltipHandler = (options: CustomTooltipOptions) => {
  return (context: { chart: any; tooltip: TooltipModel<any> }) => {
    const { chart, tooltip } = context;
    
    // Get the tooltip element
    let tooltipEl = chart.canvas.parentNode.querySelector('div.chart-tooltip');
    
    // Create the tooltip element if it doesn't exist
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chart-tooltip';
      tooltipEl.style.opacity = '0';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transition = 'all 0.15s ease';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.zIndex = '999';
      
      // Add to DOM
      const chartContainer = chart.canvas.parentNode;
      chartContainer.style.position = 'relative';
      chartContainer.appendChild(tooltipEl);
    }
    
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }
    
    // Set Text
    if (tooltip.body) {
      // Get data points
      const dataIndex = tooltip.dataPoints[0].dataIndex;
      const datasetIndex = tooltip.dataPoints[0].datasetIndex;
      
      // Get extended tooltip data if available
      let extendedData: ExtendedTooltipData | null = null;
      if (options.showExtendedData && options.getExtendedData) {
        extendedData = options.getExtendedData(dataIndex, datasetIndex);
      }
      
      // Create tooltip HTML
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines);
      
      const tooltipRoot = document.createElement('div');
      tooltipRoot.style.background = options.styles?.backgroundColor || '#fff';
      tooltipRoot.style.borderRadius = `${options.styles?.borderRadius || 4}px`;
      tooltipRoot.style.color = options.styles?.textColor || '#000';
      tooltipRoot.style.border = `1px solid ${options.styles?.borderColor || '#ddd'}`;
      tooltipRoot.style.padding = `${options.styles?.padding || 8}px`;
      tooltipRoot.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
      tooltipRoot.style.maxWidth = `${options.styles?.maxWidth || 300}px`;
      tooltipRoot.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      tooltipRoot.style.fontSize = '13px';
      
      // Add title
      if (titleLines.length) {
        const titleEl = document.createElement('div');
        titleEl.style.fontWeight = 'bold';
        titleEl.style.marginBottom = '6px';
        titleEl.style.color = options.styles?.titleColor || '#333';
        titleEl.textContent = titleLines[0];
        tooltipRoot.appendChild(titleEl);
      }
      
      // Add standard tooltip content
      const bodyContainer = document.createElement('div');
      bodyLines.forEach((body, i) => {
        const bodyEl = document.createElement('div');
        bodyEl.style.padding = '3px 0';
        
        // Show colored marker if it's a chart with multiple datasets
        if (tooltip.dataPoints.length > 1 || chart.data.datasets.length > 1) {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.width = '8px';
          span.style.height = '8px';
          span.style.borderRadius = '50%';
          span.style.marginRight = '6px';
          
          const dataset = chart.data.datasets[tooltip.dataPoints[i].datasetIndex];
          const bgColor = typeof dataset.backgroundColor === 'string' 
            ? dataset.backgroundColor
            : Array.isArray(dataset.backgroundColor) 
              ? dataset.backgroundColor[tooltip.dataPoints[i].dataIndex] || '#888'
              : '#888';
          
          span.style.backgroundColor = bgColor;
          bodyEl.appendChild(span);
        }
        
        const textSpan = document.createElement('span');
        textSpan.textContent = body[0];
        bodyEl.appendChild(textSpan);
        
        bodyContainer.appendChild(bodyEl);
      });
      tooltipRoot.appendChild(bodyContainer);
      
      // Add extended data if available
      if (extendedData) {
        const divider = document.createElement('div');
        divider.style.margin = '8px 0';
        divider.style.borderTop = '1px solid #eee';
        tooltipRoot.appendChild(divider);
        
        // Add subtitle if available
        if (extendedData.subtitle) {
          const subtitleEl = document.createElement('div');
          subtitleEl.style.fontStyle = 'italic';
          subtitleEl.style.marginBottom = '6px';
          subtitleEl.style.color = '#666';
          subtitleEl.textContent = extendedData.subtitle;
          tooltipRoot.appendChild(subtitleEl);
        }
        
        // Add details if available
        if (extendedData.details && Object.keys(extendedData.details).length > 0) {
          const detailsContainer = document.createElement('div');
          detailsContainer.style.marginBottom = '8px';
          
          Object.entries(extendedData.details).forEach(([key, value]) => {
            const detailRow = document.createElement('div');
            detailRow.style.display = 'flex';
            detailRow.style.justifyContent = 'space-between';
            detailRow.style.margin = '3px 0';
            
            const keyEl = document.createElement('span');
            keyEl.style.color = '#666';
            keyEl.textContent = key;
            
            const valueEl = document.createElement('span');
            valueEl.style.fontWeight = 'bold';
            valueEl.textContent = String(value);
            
            detailRow.appendChild(keyEl);
            detailRow.appendChild(valueEl);
            detailsContainer.appendChild(detailRow);
          });
          
          tooltipRoot.appendChild(detailsContainer);
        }
        
        // Add comparison data if available
        if (extendedData.comparison) {
          const compContainer = document.createElement('div');
          compContainer.style.background = '#f5f5f5';
          compContainer.style.padding = '6px';
          compContainer.style.borderRadius = '4px';
          compContainer.style.marginBottom = '8px';
          
          const compTitle = document.createElement('div');
          compTitle.style.fontWeight = 'bold';
          compTitle.style.marginBottom = '4px';
          compTitle.textContent = extendedData.comparison.label;
          compContainer.appendChild(compTitle);
          
          const compRow = document.createElement('div');
          compRow.style.display = 'flex';
          compRow.style.justifyContent = 'space-between';
          
          const currentEl = document.createElement('div');
          currentEl.textContent = `Current: ${extendedData.comparison.current}${extendedData.comparison.unit}`;
          
          const prevEl = document.createElement('div');
          prevEl.textContent = `Previous: ${extendedData.comparison.previous}${extendedData.comparison.unit}`;
          
          compRow.appendChild(currentEl);
          compRow.appendChild(prevEl);
          compContainer.appendChild(compRow);
          
          // Add change if available
          if (extendedData.comparison.change) {
            const changeRow = document.createElement('div');
            changeRow.style.display = 'flex';
            changeRow.style.alignItems = 'center';
            changeRow.style.marginTop = '4px';
            
            const changeSign = extendedData.comparison.change.positive ? '▲' : '▼';
            const changeColor = extendedData.comparison.change.positive ? '#4caf50' : '#f44336';
            
            const changeEl = document.createElement('span');
            changeEl.style.color = changeColor;
            changeEl.style.fontWeight = 'bold';
            changeEl.textContent = `${changeSign} ${extendedData.comparison.change.value}${extendedData.comparison.unit} (${extendedData.comparison.change.percentage}%)`;
            
            changeRow.appendChild(changeEl);
            compContainer.appendChild(changeRow);
          }
          
          tooltipRoot.appendChild(compContainer);
        }
        
        // Add trends if available
        if (extendedData.trends && extendedData.trends.length > 0) {
          const trendsContainer = document.createElement('div');
          trendsContainer.style.marginBottom = '8px';
          
          const trendsTitle = document.createElement('div');
          trendsTitle.style.fontWeight = 'bold';
          trendsTitle.style.marginBottom = '4px';
          trendsTitle.textContent = 'Trends';
          trendsContainer.appendChild(trendsTitle);
          
          extendedData.trends.forEach(trend => {
            const trendRow = document.createElement('div');
            trendRow.style.display = 'flex';
            trendRow.style.justifyContent = 'space-between';
            trendRow.style.margin = '2px 0';
            
            const trendLabel = document.createElement('span');
            trendLabel.textContent = trend.label;
            
            const trendValue = document.createElement('span');
            const diff = trend.current - trend.avg;
            const diffSign = diff > 0 ? '▲' : diff < 0 ? '▼' : '■';
            const diffColor = diff > 0 ? '#4caf50' : diff < 0 ? '#f44336' : '#888';
            
            trendValue.innerHTML = `${trend.current}${trend.unit} <span style="color:${diffColor}">${diffSign}</span>`;
            
            trendRow.appendChild(trendLabel);
            trendRow.appendChild(trendValue);
            trendsContainer.appendChild(trendRow);
          });
          
          tooltipRoot.appendChild(trendsContainer);
        }
        
        // Add recommendations if available
        if (extendedData.recommendations && extendedData.recommendations.length > 0) {
          const recsContainer = document.createElement('div');
          
          const recsTitle = document.createElement('div');
          recsTitle.style.fontWeight = 'bold';
          recsTitle.style.marginBottom = '4px';
          recsTitle.textContent = 'Recommendations';
          recsContainer.appendChild(recsTitle);
          
          const recsList = document.createElement('ul');
          recsList.style.paddingLeft = '16px';
          recsList.style.margin = '0';
          
          extendedData.recommendations.forEach(rec => {
            const recItem = document.createElement('li');
            recItem.style.margin = '2px 0';
            recItem.textContent = rec;
            recsList.appendChild(recItem);
          });
          
          recsContainer.appendChild(recsList);
          tooltipRoot.appendChild(recsContainer);
        }
        
        // Add footer if available
        if (extendedData.footer) {
          const footerEl = document.createElement('div');
          footerEl.style.marginTop = '8px';
          footerEl.style.fontStyle = 'italic';
          footerEl.style.color = '#666';
          footerEl.style.fontSize = '11px';
          footerEl.textContent = extendedData.footer;
          tooltipRoot.appendChild(footerEl);
        }
      }
      
      // Clear and append content
      tooltipEl.innerHTML = '';
      tooltipEl.appendChild(tooltipRoot);
    }
    
    // Get tooltip size
    const { offsetWidth, offsetHeight } = tooltipEl;
    
    // Set position
    const position = chart.canvas.getBoundingClientRect();
    const bodyPosition = document.body.getBoundingClientRect();
    
    // Adjust position based on chart container
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = position.left + window.pageXOffset + tooltip.caretX + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + tooltip.caretY + 'px';
    
    // Make sure tooltip is fully visible
    const rightEdge = tooltipEl.getBoundingClientRect().right;
    const bottomEdge = tooltipEl.getBoundingClientRect().bottom;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Adjust if tooltip goes out of the right side
    if (rightEdge > windowWidth) {
      const offset = rightEdge - windowWidth + 10;
      tooltipEl.style.left = (parseInt(tooltipEl.style.left) - offset) + 'px';
    }
    
    // Adjust if tooltip goes out of the bottom
    if (bottomEdge > windowHeight) {
      const offset = bottomEdge - windowHeight + 10;
      tooltipEl.style.top = (parseInt(tooltipEl.style.top) - offset) + 'px';
    }
  };
};

/**
 * Configure a chart to use custom tooltips
 */
export const configureCustomTooltips = (
  chartConfig: ChartConfiguration,
  options: CustomTooltipOptions
): ChartConfiguration => {
  // Create a deep copy to avoid mutating the original config
  const newConfig = JSON.parse(JSON.stringify(chartConfig));
  
  if (options.useHTML) {
    // Configure external tooltip handler
    if (!newConfig.options) newConfig.options = {};
    if (!newConfig.options.plugins) newConfig.options.plugins = {};
    if (!newConfig.options.plugins.tooltip) newConfig.options.plugins.tooltip = {};
    
    newConfig.options.plugins.tooltip.enabled = false;
    newConfig.options.plugins.tooltip.external = getExternalTooltipHandler(options);
    newConfig.options.plugins.tooltip.position = options.position || 'average';
    
    // Ensure we have an environment with DOM available
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      newConfig._tooltipCallbacks = {
        getExtendedData: options.getExtendedData
      };
    }
  } else {
    // Configure built-in tooltips with more customization
    if (!newConfig.options) newConfig.options = {};
    if (!newConfig.options.plugins) newConfig.options.plugins = {};
    if (!newConfig.options.plugins.tooltip) newConfig.options.plugins.tooltip = {};
    
    // Custom tooltip styling
    if (options.styles) {
      newConfig.options.plugins.tooltip.backgroundColor = options.styles.backgroundColor || 'rgba(0, 0, 0, 0.8)';
      newConfig.options.plugins.tooltip.borderColor = options.styles.borderColor || 'rgba(0, 0, 0, 0.1)';
      newConfig.options.plugins.tooltip.borderWidth = 1;
      newConfig.options.plugins.tooltip.padding = options.styles.padding || 10;
      newConfig.options.plugins.tooltip.cornerRadius = options.styles.borderRadius || 3;
      newConfig.options.plugins.tooltip.titleColor = options.styles.titleColor || 'rgba(255, 255, 255, 1)';
      newConfig.options.plugins.tooltip.bodyColor = options.styles.textColor || 'rgba(255, 255, 255, 0.8)';
    }
    
    // Enhanced tooltip callbacks
    if (options.showExtendedData && options.getExtendedData) {
      newConfig.options.plugins.tooltip.callbacks = {
        ...newConfig.options.plugins.tooltip.callbacks,
        footer: (tooltipItems: TooltipItem<ChartType>[]) => {
          const item = tooltipItems[0];
          const extendedData = options.getExtendedData?.(item.dataIndex, item.datasetIndex);
          
          if (extendedData) {
            let footerLines: string[] = [];
            
            // Add details
            if (extendedData.details && Object.keys(extendedData.details).length > 0) {
              footerLines.push('');
              Object.entries(extendedData.details).forEach(([key, value]) => {
                footerLines.push(`${key}: ${value}`);
              });
            }
            
            // Add simple version of comparison
            if (extendedData.comparison) {
              footerLines.push('');
              footerLines.push(`${extendedData.comparison.label}:`);
              footerLines.push(`Current: ${extendedData.comparison.current}${extendedData.comparison.unit}`);
              footerLines.push(`Previous: ${extendedData.comparison.previous}${extendedData.comparison.unit}`);
              
              if (extendedData.comparison.change) {
                const changeSign = extendedData.comparison.change.positive ? '↑' : '↓';
                footerLines.push(`Change: ${changeSign} ${extendedData.comparison.change.value}${extendedData.comparison.unit} (${extendedData.comparison.change.percentage}%)`);
              }
            }
            
            // Add footer
            if (extendedData.footer) {
              footerLines.push('');
              footerLines.push(extendedData.footer);
            }
            
            return footerLines;
          }
          
          return null;
        }
      };
    }
  }
  
  return newConfig;
};

/**
 * React component to render custom tooltips in a Chart.js chart
 */
export interface CustomTooltipWrapperProps {
  /** Chart configuration */
  chartConfig: ChartConfiguration;
  
  /** Custom tooltip options */
  tooltipOptions: CustomTooltipOptions;
  
  /** Theme name */
  themeName?: 'default' | 'energy' | 'financial';
  
  /** Size preset */
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
  
  /** Whether to show export options */
  showExportOptions?: boolean;
}

/**
 * A wrapper component that adds custom tooltips to a chart
 */
export const CustomTooltipWrapper: React.FC<CustomTooltipWrapperProps> = ({
  chartConfig,
  tooltipOptions,
  themeName = 'default',
  sizePreset = 'standard',
  ariaLabel,
  showExportOptions = true
}) => {
  // Configure the chart to use custom tooltips
  const configWithTooltips = configureCustomTooltips(chartConfig, tooltipOptions);
  
  return (
    <Box position="relative" width="100%" height="100%">
      {/* Render the chart with custom tooltip configuration */}
      <ResponsiveAccessibleChart
        configuration={configWithTooltips}
        themeName={themeName}
        sizePreset={sizePreset}
        ariaLabel={ariaLabel}
        showExportOptions={showExportOptions}
      />
    </Box>
  );
};

export default CustomTooltipWrapper; 