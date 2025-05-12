import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Paper, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  AddPhotoAlternate as JpegIcon,
  InsertDriveFile as SvgIcon,
  Image as PngIcon
} from '@mui/icons-material';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { chartThemes, ChartColorTheme } from '../../../../utils/reportGenerator/chartGenerator';
import { exportChartAsPNG, exportChartAsJPEG, exportChartAsSVG } from '../../../../utils/reportGenerator/chartExport';

// Register Chart.js components
Chart.register(...registerables);

interface InteractiveChartProps {
  configuration: ChartConfiguration;
  title?: string;
  width?: number;
  height?: number;
  themeName?: string;
  showExportOptions?: boolean;
  onAddToReport?: (chartCanvas: HTMLCanvasElement) => void;
}

/**
 * Interactive Chart component that renders Chart.js charts directly in the DOM
 * rather than generating static images.
 */
const InteractiveChart: React.FC<InteractiveChartProps> = ({
  configuration,
  title,
  width = 800,
  height = 400,
  themeName = 'default',
  showExportOptions = false,
  onAddToReport
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Get theme colors
  const theme: ChartColorTheme = chartThemes[themeName as keyof typeof chartThemes] || chartThemes.default;

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Clean up previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }

        // Create new chart if canvas ref is available
        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          
          if (ctx) {
            // Clone configuration to avoid mutating the original
            const config = JSON.parse(JSON.stringify(configuration)) as ChartConfiguration;
            
            // Apply theme colors if not specified in dataset
            if (config.data?.datasets) {
              config.data.datasets = config.data.datasets.map((dataset, index) => {
                // Only set color if not already defined
                if (!dataset.backgroundColor && !dataset.borderColor) {
                  const themeColors = Object.values(theme)
                    .filter(color => typeof color === 'string' && color !== theme.background);
                  
                  const color = themeColors[index % themeColors.length];
                  
                  return {
                    ...dataset,
                    backgroundColor: 
                      config.type === 'line' ? 'rgba(0,0,0,0)' : color,
                    borderColor: color
                  };
                }
                return dataset;
              });
            }
            
            // Apply theme to general options
            if (!config.options) {
              config.options = {};
            }
            
            if (!config.options.plugins) {
              config.options.plugins = {};
            }
            
            // Apply theme to title
            if (title && !config.options.plugins.title) {
              config.options.plugins.title = {
                display: true,
                text: title,
                color: theme.neutral,
                font: {
                  size: 16
                }
              };
            }
            
            // Apply theme to legend
            if (!config.options.plugins.legend) {
              config.options.plugins.legend = {
                labels: {
                  color: theme.neutral
                }
              };
            }
            
            // Apply theme to tooltip
            if (!config.options.plugins.tooltip) {
              config.options.plugins.tooltip = {
                titleColor: theme.primary,
                bodyColor: theme.neutral,
                backgroundColor: theme.background,
                borderColor: theme.neutral,
                borderWidth: 1
              };
            }
            
            // Apply theme to scales
            if (!config.options.scales) {
              config.options.scales = {};
            }
            
            if (!config.options.scales.x) {
              config.options.scales.x = {
                grid: {
                  color: `${theme.neutral}22`
                },
                ticks: {
                  color: theme.neutral
                }
              };
            }
            
            if (!config.options.scales.y) {
              config.options.scales.y = {
                grid: {
                  color: `${theme.neutral}22`
                },
                ticks: {
                  color: theme.neutral
                }
              };
            }
            
            // Create chart instance
            chartInstance.current = new Chart(ctx, config);
          }
        }
      } catch (err) {
        console.error('Error creating chart:', err);
        setError('Failed to create chart');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [configuration, title, themeName]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Export handlers
  const handleExportAsPNG = () => {
    if (chartRef.current) {
      const chartTitle = title || 'chart';
      exportChartAsPNG(chartRef.current, chartTitle.replace(/\s+/g, '_'));
    }
    handleMenuClose();
  };

  const handleExportAsJPEG = () => {
    if (chartRef.current) {
      const chartTitle = title || 'chart';
      exportChartAsJPEG(chartRef.current, chartTitle.replace(/\s+/g, '_'));
    }
    handleMenuClose();
  };

  const handleExportAsSVG = () => {
    if (chartRef.current) {
      const chartTitle = title || 'chart';
      exportChartAsSVG(chartRef.current, chartTitle.replace(/\s+/g, '_'));
    }
    handleMenuClose();
  };

  const handleAddToReport = () => {
    if (chartRef.current && onAddToReport) {
      onAddToReport(chartRef.current);
    }
    handleMenuClose();
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2,
        width: width || 'auto',
        height: height || 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {showExportOptions && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            aria-label="Export options"
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExportAsPNG}>
              <PngIcon fontSize="small" sx={{ mr: 1 }} />
              Export as PNG
            </MenuItem>
            <MenuItem onClick={handleExportAsJPEG}>
              <JpegIcon fontSize="small" sx={{ mr: 1 }} />
              Export as JPEG
            </MenuItem>
            <MenuItem onClick={handleExportAsSVG}>
              <SvgIcon fontSize="small" sx={{ mr: 1 }} />
              Export as SVG
            </MenuItem>
            {onAddToReport && (
              <MenuItem onClick={handleAddToReport}>
                <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                Add to Report
              </MenuItem>
            )}
          </Menu>
        </Box>
      )}
      
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ width: '100%', height: '100%' }}>
          <canvas ref={chartRef} width={width} height={height}></canvas>
        </Box>
      )}
    </Paper>
  );
};

export default InteractiveChart; 