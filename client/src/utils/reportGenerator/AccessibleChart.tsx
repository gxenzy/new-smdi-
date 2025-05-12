import React, { useRef, useState, useEffect, useCallback, KeyboardEvent } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  HighQuality as HighContrastIcon,
  KeyboardTab as KeyboardTabIcon
} from '@mui/icons-material';
import InteractiveChart from './InteractiveChart';
import { ChartConfiguration, ChartType, ScatterDataPoint, BubbleDataPoint } from 'chart.js';

// Define the enhanced props for the AccessibleChart
interface AccessibleChartProps {
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
  // Additional accessibility options
  highContrastDefault?: boolean;
  dataTableView?: boolean;
  ariaLabel?: string;
  // Add callback for chart reference
  onChartRefChange?: (chartInstance: any) => void;
}

// VisuallyHidden component for screen reader content
const VisuallyHidden: React.FC<{ children: React.ReactNode, role?: string, 'aria-live'?: 'polite' | 'assertive' | 'off' }> = ({ 
  children, 
  role, 
  'aria-live': ariaLive 
}) => (
  <Box
    sx={{
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: '1px',
      whiteSpace: 'nowrap'
    }}
    role={role}
    aria-live={ariaLive}
  >
    {children}
  </Box>
);

/**
 * AccessibleChart component that wraps the InteractiveChart component
 * with WCAG 2.1 AA compliant accessibility features
 */
const AccessibleChart: React.FC<AccessibleChartProps> = ({
  title = 'Chart',
  subtitle,
  configuration,
  width = '100%',
  height = 300,
  themeName = 'default',
  showExportOptions = false,
  showChartTypeOptions = false,
  isLoading = false,
  onAddToReport,
  onChartTypeChange,
  onRefresh,
  onEdit,
  highContrastDefault = false,
  dataTableView = false,
  ariaLabel,
  onChartRefChange
}) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Accessibility state management
  const [highContrast, setHighContrast] = useState<boolean>(highContrastDefault);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [showDataTable, setShowDataTable] = useState<boolean>(dataTableView);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [announcementText, setAnnouncementText] = useState<string>('');

  // Create accessible data points for keyboard navigation
  const [accessibleDataPoints, setAccessibleDataPoints] = useState<Array<{
    label: string;
    value: string | number;
    index: number;
    datasetIndex: number;
  }>>([]);

  // Generate an accessible description of the chart
  const generateChartDescription = useCallback(() => {
    if (!configuration || !configuration.data) return '';
    
    const chartType = configuration.type || 'unknown';
    const datasetCount = configuration.data.datasets?.length || 0;
    const pointCount = configuration.data.datasets?.[0]?.data?.length || 0;
    
    let description = `${title}. This is a ${chartType} chart`;
    if (subtitle) description += ` - ${subtitle}`;
    description += `. Contains ${datasetCount} dataset${datasetCount !== 1 ? 's' : ''} with ${pointCount} data point${pointCount !== 1 ? 's' : ''} each.`;
    description += ` Use arrow keys to navigate between data points. Press Enter to view details about a data point.`;
    
    return description;
  }, [configuration, title, subtitle]);

  // Extract data points for keyboard navigation and screen readers
  useEffect(() => {
    if (!configuration || !configuration.data) return;
    
    const extractedPoints: Array<{
      label: string;
      value: string | number;
      index: number;
      datasetIndex: number;
    }> = [];
    
    const labels = configuration.data.labels || [];
    
    // Process each dataset
    configuration.data.datasets?.forEach((dataset, datasetIndex) => {
      const datasetLabel = dataset.label || `Dataset ${datasetIndex + 1}`;
      
      // Process each data point
      if (Array.isArray(dataset.data)) {
        dataset.data.forEach((value, index) => {
          let pointLabel = '';
          
          // Different handling based on chart type
          if (configuration.type === 'pie' || configuration.type === 'doughnut') {
            pointLabel = labels[index]?.toString() || `Slice ${index + 1}`;
          } else {
            pointLabel = `${datasetLabel}, ${labels[index]?.toString() || `Point ${index + 1}`}`;
          }
          
          extractedPoints.push({
            label: pointLabel,
            value: (typeof value === 'object' ? JSON.stringify(value) : value) as string | number,
            index,
            datasetIndex
          });
        });
      }
    });
    
    setAccessibleDataPoints(extractedPoints);
  }, [configuration]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!accessibleDataPoints.length) return;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setFocusIndex(prevIndex => {
          const newIndex = prevIndex >= accessibleDataPoints.length - 1 ? 0 : prevIndex + 1;
          handleShowTooltip(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setFocusIndex(prevIndex => {
          const newIndex = prevIndex <= 0 ? accessibleDataPoints.length - 1 : prevIndex - 1;
          handleShowTooltip(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusIndex >= 0) {
          handleShowTooltip(focusIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        handleHideTooltip();
        break;
      default:
        break;
    }
  }, [accessibleDataPoints, focusIndex]);

  // Show tooltip programmatically
  const handleShowTooltip = (index: number) => {
    if (index < 0 || index >= accessibleDataPoints.length) return;
    
    const point = accessibleDataPoints[index];
    setActiveTooltipIndex(index);
    
    // Announce to screen readers
    const announcement = `${point.label}: ${point.value}`;
    setAnnouncementText(announcement);
    
    // If the InteractiveChart provides a tooltip API, use it
    if (canvasRef.current) {
      // This is a simplistic approach - in a real implementation,
      // we would interact with Chart.js tooltip system
      console.log('Showing tooltip for:', announcement);
    }
  };

  // Hide tooltip programmatically
  const handleHideTooltip = () => {
    setActiveTooltipIndex(null);
    setAnnouncementText('');
  };

  // Create high contrast configuration
  const getHighContrastConfig = (): ChartConfiguration => {
    if (!highContrast || !configuration) return configuration;
    
    // Create a deep copy to avoid modifying the original
    const highContrastConfig = JSON.parse(JSON.stringify(configuration)) as ChartConfiguration;
    
    // Apply high contrast colors
    if (highContrastConfig.data && highContrastConfig.data.datasets) {
      highContrastConfig.data.datasets.forEach((dataset: any, index) => {
        // Use high contrast color scheme
        const highContrastColors = [
          '#000000', // Black
          '#FFFFFF', // White
          '#FFFF00', // Yellow
          '#0000FF', // Blue
          '#FF0000', // Red
          '#00FF00', // Green
          '#FF00FF', // Magenta
          '#00FFFF'  // Cyan
        ];
        
        // Apply different patterns based on chart type
        if (highContrastConfig.type === 'line') {
          dataset.borderColor = highContrastColors[index % highContrastColors.length];
          dataset.backgroundColor = 'transparent';
          dataset.borderWidth = 3; // Thicker lines for visibility
          
          // Use 'any' type to bypass TypeScript checks for dynamic properties
          if (typeof dataset === 'object') {
            dataset.pointRadius = 6; // Larger points
            dataset.pointHoverRadius = 8;
          }
        } else {
          dataset.backgroundColor = highContrastColors[index % highContrastColors.length];
          
          // For pie/doughnut, add patterns or borders
          if (highContrastConfig.type === 'pie' || highContrastConfig.type === 'doughnut') {
            dataset.borderColor = '#000000';
            dataset.borderWidth = 2;
          }
        }
      });
    }
    
    // Ensure options exists
    if (!highContrastConfig.options) {
      highContrastConfig.options = {};
    }
    
    // Ensure plugins exists
    if (!highContrastConfig.options.plugins) {
      highContrastConfig.options.plugins = {};
    }
    
    // Enhance legend
    if (!highContrastConfig.options.plugins.legend) {
      highContrastConfig.options.plugins.legend = {};
    }
    
    if (!highContrastConfig.options.plugins.legend.labels) {
      highContrastConfig.options.plugins.legend.labels = {};
    }
    
    highContrastConfig.options.plugins.legend.labels.color = '#000000';
    highContrastConfig.options.plugins.legend.labels.font = { 
      size: 14,
      weight: 'bold'
    };
    
    // Enhance scales if they exist
    if (highContrastConfig.options && highContrastConfig.options.scales) {
      Object.keys(highContrastConfig.options.scales).forEach(scaleKey => {
        const scale = highContrastConfig.options?.scales?.[scaleKey];
        if (!scale) return;
        
        if (!scale.grid) {
          scale.grid = {};
        }
        
        if (!scale.ticks) {
          scale.ticks = {};
        }
        
        scale.grid.color = '#000000';
        scale.ticks.color = '#000000';
        scale.ticks.font = {
          size: 14,
          weight: 'bold'
        };
      });
    }
    
    return highContrastConfig;
  };

  // Get the final configuration with accessibility enhancements
  const accessibleConfig = getHighContrastConfig();

  // Generate an accessible data table from chart data
  const renderDataTable = () => {
    if (!configuration || !configuration.data) return null;
    
    const labels = configuration.data.labels || [];
    const datasets = configuration.data.datasets || [];
    
    return (
      <Box sx={{ mt: 2, mb: 2, overflowX: 'auto' }}>
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: `1px solid ${theme.palette.divider}`
          }}
          aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-table-caption`}
        >
          <caption 
            id={`${title.toLowerCase().replace(/\s+/g, '-')}-table-caption`}
            style={{ 
              captionSide: 'top', 
              fontWeight: 'bold',
              padding: '8px',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary
            }}
          >
            {title} {subtitle ? `- ${subtitle}` : ''}
          </caption>
          <thead>
            <tr>
              <th 
                scope="col"
                style={{
                  padding: '8px',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  textAlign: 'left',
                  backgroundColor: theme.palette.background.paper
                }}
              >
                Category
              </th>
              {datasets.map((dataset, index) => (
                <th 
                  key={index} 
                  scope="col"
                  style={{
                    padding: '8px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    textAlign: 'right',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  {dataset.label || `Dataset ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, labelIndex) => (
              <tr 
                key={labelIndex}
                style={{
                  backgroundColor: labelIndex % 2 === 0 
                    ? theme.palette.background.paper 
                    : theme.palette.action.hover
                }}
              >
                <th 
                  scope="row"
                  style={{
                    padding: '8px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    textAlign: 'left'
                  }}
                >
                  {label?.toString() || `Item ${labelIndex + 1}`}
                </th>
                {datasets.map((dataset, datasetIndex) => {
                  const dataValue = Array.isArray(dataset.data) ? dataset.data[labelIndex] : null;
                  // Handle different data types safely
                  const displayValue = dataValue === null 
                    ? '-' 
                    : (typeof dataValue === 'object' 
                        ? JSON.stringify(dataValue) 
                        : String(dataValue));
                        
                  return (
                    <td 
                      key={`${labelIndex}-${datasetIndex}`}
                      style={{
                        padding: '8px',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        textAlign: 'right'
                      }}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  // Set the canvasRef when InteractiveChart renders
  const handleChartRender = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  };

  // Handle chart instance reference
  const handleChartRefChange = (chartInstance: any) => {
    if (onChartRefChange) {
      onChartRefChange(chartInstance);
    }
  };

  return (
    <Box>
      {/* Accessibility controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          mb: 1
        }}
      >
        <Tooltip title="Accessibility Options">
          <IconButton size="small" sx={{ mr: 1 }}>
            <AccessibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <FormControlLabel
          control={
            <Switch
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HighContrastIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">High Contrast</Typography>
            </Box>
          }
          sx={{ mr: 2 }}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showDataTable}
              onChange={(e) => setShowDataTable(e.target.checked)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <KeyboardTabIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">Data Table</Typography>
            </Box>
          }
        />
      </Box>
      
      {/* Interactive chart with keyboard support */}
      <Box
        ref={chartRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || generateChartDescription()}
        role="img"
        sx={{
          outline: focusIndex >= 0 ? `2px solid ${theme.palette.primary.main}` : 'none',
          borderRadius: '4px',
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.main}`
          }
        }}
      >
        <InteractiveChart
          title={title}
          subtitle={subtitle}
          configuration={accessibleConfig}
          width={width}
          height={height}
          themeName={themeName}
          showExportOptions={showExportOptions}
          showChartTypeOptions={showChartTypeOptions}
          isLoading={isLoading}
          onAddToReport={onAddToReport}
          onChartTypeChange={onChartTypeChange}
          onRefresh={onRefresh}
          onEdit={onEdit}
          onChartRefChange={handleChartRefChange}
        />
        
        {/* Screen reader announcement area */}
        <VisuallyHidden role="status" aria-live="polite">
          {announcementText}
        </VisuallyHidden>
        
        {/* Keyboard navigation instructions (only visible to screen readers) */}
        <VisuallyHidden>
          Use arrow keys to navigate between data points.
          Press Enter to view details about a data point.
          Press Escape to hide details.
        </VisuallyHidden>
      </Box>
      
      {/* Data table view for accessibility */}
      {showDataTable && renderDataTable()}
    </Box>
  );
};

export default AccessibleChart; 