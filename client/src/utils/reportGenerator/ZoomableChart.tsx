import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Slider,
  Paper,
  Stack
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  ArrowUpward as PanUpIcon,
  ArrowDownward as PanDownIcon,
  ArrowBack as PanLeftIcon,
  ArrowForward as PanRightIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ResponsiveAccessibleChart } from './index';
// @ts-ignore
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components and plugins
Chart.register(...registerables);
Chart.register(zoomPlugin);

// Define a custom window interface to add Chart property
declare global {
  interface Window {
    Chart?: typeof Chart;
  }
}

// Define a type for the chart instance with zoom plugin methods
interface ZoomableChartInstance extends Chart<ChartType> {
  zoom: (ratio: number) => void;
  resetZoom: () => void;
  pan: (delta: { x: number; y: number }) => void;
}

/**
 * ZoomableChartProps interface 
 */
export interface ZoomableChartProps {
  /** Chart title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Chart configuration */
  configuration: ChartConfiguration;
  /** Theme name */
  themeName?: 'default' | 'energy' | 'financial';
  /** Whether to show export options */
  showExportOptions?: boolean;
  /** Size preset for the chart */
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  /** Whether to show zoom and pan controls */
  showControls?: boolean;
  /** Initial zoom level (1.0 = 100%) */
  initialZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Whether to enable wheel zooming */
  enableWheelZoom?: boolean;
  /** Whether to enable drag panning */
  enableDragPan?: boolean;
  /** Whether to enable pinch zooming (on touch devices) */
  enablePinchZoom?: boolean;
  /** Custom ARIA label for screen readers */
  ariaLabel?: string;
  /** Callback when the zoom level changes */
  onZoomChange?: (zoomLevel: number) => void;
  /** Callback when the chart is reset */
  onReset?: () => void;
  /** Callback when the chart is exported */
  onExport?: (format: 'png' | 'jpg' | 'svg') => void;
}

/**
 * Zoomable chart component that enables detailed data exploration
 * using zoom and pan controls
 */
const ZoomableChart: React.FC<ZoomableChartProps> = ({
  title,
  subtitle,
  configuration,
  themeName = 'default',
  showExportOptions = true,
  sizePreset = 'standard',
  showControls = true,
  initialZoom = 1.0,
  maxZoom = 5.0,
  enableWheelZoom = true,
  enableDragPan = true,
  enablePinchZoom = true,
  ariaLabel,
  onZoomChange,
  onReset,
  onExport
}) => {
  const theme = useTheme();
  const chartRef = useRef<ZoomableChartInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track current zoom level
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  // State to track if the chart is in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Enhanced chart configuration with zoom plugin
  const [enhancedConfig, setEnhancedConfig] = useState<ChartConfiguration | null>(null);
  
  // Configure the chart with zoom and pan capabilities
  useEffect(() => {
    if (!configuration) return;
    
    // Create a deep copy of the configuration to avoid modifying the original
    const newConfig: ChartConfiguration = JSON.parse(JSON.stringify(configuration));
    
    // Ensure options object exists
    if (!newConfig.options) {
      newConfig.options = {};
    }
    
    // Add zoom plugin configuration using a type assertion to bypass TypeScript checking
    newConfig.options.plugins = {
      ...newConfig.options.plugins,
    };
    
    // Add zoom plugin configuration using type assertion
    const plugins = newConfig.options.plugins as any;
    plugins.zoom = {
      pan: {
        enabled: enableDragPan,
        mode: 'xy',
        modifierKey: 'shift', // Hold shift to pan instead of zoom
        onPanComplete: () => {
          // Handle pan complete - could update some state or fire callback
        }
      },
      zoom: {
        wheel: {
          enabled: enableWheelZoom,
        },
        pinch: {
          enabled: enablePinchZoom
        },
        mode: 'xy',
        drag: {
          enabled: false, // We're using buttons for zooming in this component
        },
        onZoomComplete: ({ chart }: { chart: any }) => {
          // Get current zoom level from the chart
          const currentZoom = getZoomLevelFromChart(chart as ZoomableChartInstance);
          setZoomLevel(currentZoom);
          
          if (onZoomChange) {
            onZoomChange(currentZoom);
          }
        }
      }
    };
    
    setEnhancedConfig(newConfig);
  }, [configuration, enableWheelZoom, enableDragPan, enablePinchZoom, onZoomChange]);
  
  // Handle zoom in button click
  const handleZoomIn = useCallback(() => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const newZoom = Math.min(zoomLevel * 1.2, maxZoom);
    
    // Apply zoom level to chart
    chart.zoom(newZoom / zoomLevel);
    
    // Update state
    setZoomLevel(newZoom);
    
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  }, [zoomLevel, maxZoom, onZoomChange]);
  
  // Handle zoom out button click
  const handleZoomOut = useCallback(() => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const newZoom = Math.max(zoomLevel / 1.2, 1);
    
    // Apply zoom level to chart
    chart.zoom(newZoom / zoomLevel);
    
    // Update state
    setZoomLevel(newZoom);
    
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  }, [zoomLevel, onZoomChange]);
  
  // Handle reset button click
  const handleReset = useCallback(() => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    chart.resetZoom();
    setZoomLevel(1);
    
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Handle pan in different directions
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const panAmount = 10; // pixels
    
    switch (direction) {
      case 'up':
        chart.pan({ x: 0, y: panAmount });
        break;
      case 'down':
        chart.pan({ x: 0, y: -panAmount });
        break;
      case 'left':
        chart.pan({ x: panAmount, y: 0 });
        break;
      case 'right':
        chart.pan({ x: -panAmount, y: 0 });
        break;
    }
  }, []);
  
  // Handle slider change for zoom
  const handleSliderChange = useCallback((event: Event, newValue: number | number[]) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const newZoom = newValue as number;
    
    // Apply zoom level to chart
    chart.zoom(newZoom / zoomLevel);
    
    // Update state
    setZoomLevel(newZoom);
    
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  }, [zoomLevel, onZoomChange]);
  
  // Function to calculate current zoom level from chart instance
  const getZoomLevelFromChart = (chart: ZoomableChartInstance): number => {
    // This is a simplified approximation
    // In a real implementation, you'd want to calculate this based on
    // the chart's current scale values relative to the original
    return zoomLevel;
  };
  
  // Handle toggling fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Function to capture chart instance
  const captureChartInstance = (chartInstance: Chart<ChartType>) => {
    chartRef.current = chartInstance as ZoomableChartInstance;
  };
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        
        {showControls && (
          <Tooltip title="Toggle fullscreen">
            <IconButton 
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              size="small"
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {enhancedConfig && (
        <ResponsiveAccessibleChart
          configuration={enhancedConfig}
          title={title}
          subtitle={subtitle}
          themeName={themeName}
          sizePreset={sizePreset}
          showExportOptions={showExportOptions}
          ariaLabel={ariaLabel || `Zoomable chart for ${title}`}
          onChartRefChange={captureChartInstance}
        />
      )}
      
      {showControls && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16, 
            p: 1,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 10
          }}
        >
          <Stack direction="row" spacing={1}>
            <Tooltip title="Zoom in">
              <IconButton 
                size="small" 
                onClick={handleZoomIn}
                aria-label="Zoom in"
                disabled={zoomLevel >= maxZoom}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ width: 100 }}>
              <Slider
                value={zoomLevel}
                min={1}
                max={maxZoom}
                step={0.1}
                onChange={handleSliderChange}
                aria-label="Zoom level"
                size="small"
              />
            </Box>
            
            <Tooltip title="Zoom out">
              <IconButton 
                size="small" 
                onClick={handleZoomOut}
                aria-label="Zoom out"
                disabled={zoomLevel <= 1}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Reset view">
              <IconButton 
                size="small" 
                onClick={handleReset}
                aria-label="Reset view"
                disabled={zoomLevel === 1}
              >
                <ResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Stack direction="row" spacing={1} justifyContent="center">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5 }}>
              <Box /> {/* Empty cell for grid layout */}
              <Tooltip title="Pan up">
                <IconButton 
                  size="small" 
                  onClick={() => handlePan('up')}
                  aria-label="Pan up"
                >
                  <PanUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box /> {/* Empty cell for grid layout */}
              
              <Tooltip title="Pan left">
                <IconButton 
                  size="small" 
                  onClick={() => handlePan('left')}
                  aria-label="Pan left"
                >
                  <PanLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box /> {/* Center cell */}
              <Tooltip title="Pan right">
                <IconButton 
                  size="small" 
                  onClick={() => handlePan('right')}
                  aria-label="Pan right"
                >
                  <PanRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Box /> {/* Empty cell for grid layout */}
              <Tooltip title="Pan down">
                <IconButton 
                  size="small" 
                  onClick={() => handlePan('down')}
                  aria-label="Pan down"
                >
                  <PanDownIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box /> {/* Empty cell for grid layout */}
            </Box>
          </Stack>
          
          <Typography variant="caption" align="center">
            Zoom: {Math.round(zoomLevel * 100)}%
          </Typography>
        </Paper>
      )}
      
      {showControls && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Tip: Use mouse wheel to zoom, hold Shift + drag to pan, or use the controls.
        </Typography>
      )}
    </Box>
  );
};

export default ZoomableChart; 