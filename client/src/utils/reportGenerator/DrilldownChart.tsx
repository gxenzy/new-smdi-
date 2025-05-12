import React, { useState, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Breadcrumbs, 
  Link, 
  useTheme,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as DrillDownIcon,
  ZoomOut as DrillUpIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ResponsiveAccessibleChart } from './index';

/**
 * Interface for DrilldownNode - represents a node in the hierarchical data structure
 */
export interface DrilldownNode {
  id: string;
  label: string;
  data: number | number[];
  color?: string;
  children?: DrilldownNode[];
  customData?: Record<string, any>;
}

/**
 * Interface for DrilldownChartProps
 */
export interface DrilldownChartProps {
  /** Chart title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Root node of the drill-down hierarchy */
  rootNode: DrilldownNode;
  /** Chart type for the current level */
  chartType?: ChartType;
  /** Theme name to apply */
  themeName?: 'default' | 'energy' | 'financial';
  /** Optional ARIA label for screen readers */
  ariaLabel?: string;
  /** Optional chart size preset */
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  /** Whether to show export options */
  showExportOptions?: boolean;
  /** Callback for when a drill-down occurs */
  onDrillDown?: (node: DrilldownNode, path: DrilldownNode[]) => void;
  /** Callback for when a drill-up occurs */
  onDrillUp?: (node: DrilldownNode, path: DrilldownNode[]) => void;
  /** Custom chart options */
  chartOptions?: any;
  /** Whether to show the breadcrumb navigation */
  showBreadcrumbs?: boolean;
  /** Callback for when the chart configuration is created or updated */
  onChartConfigUpdate?: (config: ChartConfiguration) => void;
}

/**
 * DrilldownChart component that enables hierarchical data exploration
 * 
 * This component allows users to click on chart segments/bars to drill down
 * into more detailed data, with breadcrumb navigation to track and move
 * back up the hierarchy.
 */
const DrilldownChart: React.FC<DrilldownChartProps> = ({
  title,
  subtitle,
  rootNode,
  chartType = 'bar',
  themeName = 'default',
  ariaLabel,
  sizePreset = 'standard',
  showExportOptions = true,
  onDrillDown,
  onDrillUp,
  chartOptions,
  showBreadcrumbs = true,
  onChartConfigUpdate
}) => {
  const theme = useTheme();
  const chartRef = useRef<any>(null);
  
  // State to track the current node and path through the hierarchy
  const [currentNode, setCurrentNode] = useState<DrilldownNode>(rootNode);
  const [path, setPath] = useState<DrilldownNode[]>([rootNode]);
  
  // State to store chart configuration
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(null);
  
  // Generate a chart configuration from the current node
  const generateChartConfig = useCallback(() => {
    if (!currentNode) return null;
    
    let labels: string[] = [];
    let data: number[] = [];
    let backgroundColor: string[] = [];
    let hoverBackgroundColor: string[] = [];
    let borderColor: string[] = [];
    
    // Use children if they exist, otherwise use the current node's data
    const hasChildren = currentNode.children && currentNode.children.length > 0;
    
    if (hasChildren) {
      // Extract data from children
      currentNode.children?.forEach(child => {
        labels.push(child.label);
        
        // Handle both single value and array of values
        if (Array.isArray(child.data)) {
          // For now, just use the first value if it's an array
          data.push(child.data[0]);
        } else {
          data.push(child.data);
        }
        
        // Use provided color or generate one
        const color = child.color || getRandomColor(child.id);
        backgroundColor.push(color);
        hoverBackgroundColor.push(adjustColorBrightness(color, 20));
        borderColor.push(adjustColorBrightness(color, -20));
      });
    } else {
      // If no children, use the node's own data
      labels = [currentNode.label];
      
      if (Array.isArray(currentNode.data)) {
        data = currentNode.data;
      } else {
        data = [currentNode.data];
      }
      
      const color = currentNode.color || getRandomColor(currentNode.id);
      backgroundColor = [color];
      hoverBackgroundColor = [adjustColorBrightness(color, 20)];
      borderColor = [adjustColorBrightness(color, -20)];
    }
    
    // Create chart configuration
    const config: ChartConfiguration = {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: currentNode.label,
          data,
          backgroundColor,
          hoverBackgroundColor,
          borderColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              // Add custom data to tooltips if available
              afterLabel: (context) => {
                if (!hasChildren) return '';
                
                const childIndex = context.dataIndex;
                const child = currentNode.children?.[childIndex];
                if (!child || !child.customData) return '';
                
                // Format any custom data for display in tooltip
                return Object.entries(child.customData)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n');
              }
            }
          },
          legend: {
            position: 'top',
          },
          title: {
            display: !!subtitle,
            text: subtitle || ''
          },
          ...chartOptions?.plugins
        },
        onClick: (event, elements, chart) => {
          if (!elements || elements.length === 0 || !hasChildren) return;
          
          const index = elements[0].index;
          const child = currentNode.children?.[index];
          
          if (child) {
            handleDrillDown(child);
          }
        },
        ...chartOptions
      }
    };
    
    // Notify parent of updated config if callback provided
    if (onChartConfigUpdate) {
      onChartConfigUpdate(config);
    }
    
    return config;
  }, [currentNode, chartType, chartOptions, subtitle, onChartConfigUpdate]);
  
  // Effect to generate chart config when currentNode changes
  React.useEffect(() => {
    const config = generateChartConfig();
    if (config) {
      setChartConfig(config);
    }
  }, [currentNode, generateChartConfig]);
  
  // Handle drill-down when a chart element is clicked
  const handleDrillDown = (node: DrilldownNode) => {
    // Only drill down if the node has children
    if (!node.children || node.children.length === 0) return;
    
    const newPath = [...path, node];
    setPath(newPath);
    setCurrentNode(node);
    
    if (onDrillDown) {
      onDrillDown(node, newPath);
    }
  };
  
  // Handle drill-up when breadcrumb or up button is clicked
  const handleDrillUp = (index: number) => {
    if (index >= path.length) return;
    
    const newPath = path.slice(0, index + 1);
    const node = path[index];
    
    setPath(newPath);
    setCurrentNode(node);
    
    if (onDrillUp) {
      onDrillUp(node, newPath);
    }
  };
  
  // Handle returning to the root node
  const handleResetToRoot = () => {
    setPath([rootNode]);
    setCurrentNode(rootNode);
    
    if (onDrillUp) {
      onDrillUp(rootNode, [rootNode]);
    }
  };
  
  // Utility function to generate a random color
  const getRandomColor = (seed: string) => {
    // Simple hash function for the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to RGB color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  };
  
  // Utility function to adjust color brightness
  const adjustColorBrightness = (color: string, percent: number) => {
    if (!color) return '#CCCCCC';
    
    // Remove the # if present
    let hex = color.startsWith('#') ? color.slice(1) : color;
    
    // Ensure we have a 6-character hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    // Convert to decimal and adjust
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    
    r = Math.max(0, Math.min(255, r + Math.floor(r * percent / 100)));
    g = Math.max(0, Math.min(255, g + Math.floor(g * percent / 100)));
    b = Math.max(0, Math.min(255, b + Math.floor(b * percent / 100)));
    
    // Convert back to hex
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  // Generate the current title based on path
  const currentTitle = `${title} - ${currentNode.label}`;
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="h6" component="h2">
          {currentTitle}
        </Typography>
        
        <Box>
          {path.length > 1 && (
            <Tooltip title="Drill up to previous level">
              <IconButton 
                onClick={() => handleDrillUp(path.length - 2)}
                aria-label="Drill up to previous level"
                size="small"
              >
                <DrillUpIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {path.length > 1 && (
            <Tooltip title="Reset to top level">
              <IconButton 
                onClick={handleResetToRoot}
                aria-label="Reset to root level"
                size="small"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {showBreadcrumbs && path.length > 1 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {path.map((node, index) => (
            <Link
              key={`${node.id}-${index}`}
              color={index === path.length - 1 ? 'text.primary' : 'inherit'}
              onClick={() => index < path.length - 1 && handleDrillUp(index)}
              sx={{ 
                cursor: index < path.length - 1 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center'
              }}
              underline={index < path.length - 1 ? 'hover' : 'none'}
            >
              {index === 0 && <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />}
              {node.label}
              {index < path.length - 1 && currentNode.children && currentNode.children.length > 0 && (
                <DrillDownIcon fontSize="small" sx={{ ml: 0.5 }} />
              )}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      {chartConfig ? (
        <ResponsiveAccessibleChart
          configuration={chartConfig}
          title={title}
          subtitle={subtitle || `Viewing ${currentNode.label}`}
          themeName={themeName}
          sizePreset={sizePreset}
          showExportOptions={showExportOptions}
          ariaLabel={ariaLabel || `Drilldown chart for ${title}: ${currentNode.label}`}
        />
      ) : (
        <Typography color="text.secondary">No data available to display</Typography>
      )}
      
      {currentNode.children && currentNode.children.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Click on a {chartType === 'pie' || chartType === 'doughnut' ? 'segment' : 'bar'} to drill down for more details
        </Typography>
      )}
    </Box>
  );
};

export default DrilldownChart; 