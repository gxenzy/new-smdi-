import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  AddCircleOutline as AddToReportIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { ChartConfiguration, ChartType } from 'chart.js';
import Chart from 'chart.js/auto';

// Theme configurations for different chart types
const chartThemes = {
  default: {
    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 
                      'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
                  'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
    gridColor: 'rgba(0, 0, 0, 0.1)',
    textColor: '#333333'
  },
  energy: {
    backgroundColor: ['rgba(46, 204, 113, 0.6)', 'rgba(52, 152, 219, 0.6)', 'rgba(155, 89, 182, 0.6)', 
                      'rgba(241, 196, 15, 0.6)', 'rgba(230, 126, 34, 0.6)', 'rgba(231, 76, 60, 0.6)'],
    borderColor: ['rgba(46, 204, 113, 1)', 'rgba(52, 152, 219, 1)', 'rgba(155, 89, 182, 1)', 
                  'rgba(241, 196, 15, 1)', 'rgba(230, 126, 34, 1)', 'rgba(231, 76, 60, 1)'],
    gridColor: 'rgba(0, 0, 0, 0.1)',
    textColor: '#2c3e50'
  },
  financial: {
    backgroundColor: ['rgba(39, 174, 96, 0.6)', 'rgba(41, 128, 185, 0.6)', 'rgba(142, 68, 173, 0.6)', 
                      'rgba(243, 156, 18, 0.6)', 'rgba(211, 84, 0, 0.6)', 'rgba(192, 57, 43, 0.6)'],
    borderColor: ['rgba(39, 174, 96, 1)', 'rgba(41, 128, 185, 1)', 'rgba(142, 68, 173, 1)', 
                  'rgba(243, 156, 18, 1)', 'rgba(211, 84, 0, 1)', 'rgba(192, 57, 43, 1)'],
    gridColor: 'rgba(0, 0, 0, 0.1)',
    textColor: '#34495e'
  }
};

interface InteractiveChartProps {
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
  onChartRefChange?: (chartInstance: any) => void;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
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
  onChartRefChange
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Apply the selected theme to the chart configuration
  useEffect(() => {
    if (!chartRef.current || isLoading) return;
    
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Deep clone the configuration to avoid modifying the original
    const chartConfig = JSON.parse(JSON.stringify(configuration)) as ChartConfiguration;
    const chartTheme = chartThemes[themeName] || chartThemes.default;
    
    // Apply theme colors based on chart type
    if (chartConfig.type === 'bar' || chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
      if (chartConfig.data && chartConfig.data.datasets) {
        chartConfig.data.datasets.forEach((dataset, index) => {
          if (chartConfig.type === 'bar') {
            dataset.backgroundColor = chartTheme.backgroundColor[index % chartTheme.backgroundColor.length];
            dataset.borderColor = chartTheme.borderColor[index % chartTheme.borderColor.length];
          } else {
            dataset.backgroundColor = chartTheme.backgroundColor;
            dataset.borderColor = chartTheme.borderColor;
          }
        });
      }
    } else if (chartConfig.type === 'line') {
      if (chartConfig.data && chartConfig.data.datasets) {
        chartConfig.data.datasets.forEach((dataset, index) => {
          dataset.borderColor = chartTheme.borderColor[index % chartTheme.borderColor.length];
          dataset.backgroundColor = 'transparent';
        });
      }
    }
    
    // Apply theme to options
    if (!chartConfig.options) {
      chartConfig.options = {};
    }
    
    if (!chartConfig.options.scales) {
      chartConfig.options.scales = {};
    }
    
    // For x and y axes
    ['x', 'y'].forEach(axis => {
      if (!chartConfig.options!.scales![axis]) {
        chartConfig.options!.scales![axis] = {};
      }
      
      if (!chartConfig.options!.scales![axis]!.grid) {
        chartConfig.options!.scales![axis]!.grid = {};
      }
      
      chartConfig.options!.scales![axis]!.grid!.color = chartTheme.gridColor;
      
      if (!chartConfig.options!.scales![axis]!.ticks) {
        chartConfig.options!.scales![axis]!.ticks = {};
      }
      
      chartConfig.options!.scales![axis]!.ticks!.color = chartTheme.textColor;
    });
    
    // Apply theme to legend
    if (!chartConfig.options.plugins) {
      chartConfig.options.plugins = {};
    }
    
    if (!chartConfig.options.plugins.legend) {
      chartConfig.options.plugins.legend = {};
    }
    
    if (!chartConfig.options.plugins.legend.labels) {
      chartConfig.options.plugins.legend.labels = {};
    }
    
    chartConfig.options.plugins.legend.labels.color = chartTheme.textColor;
    
    // Apply responsive options
    chartConfig.options.responsive = true;
    chartConfig.options.maintainAspectRatio = false;
    
    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, chartConfig);
    }
    
    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [configuration, isLoading, themeName]);
  
  // Pass chart instance to parent component if requested
  useEffect(() => {
    if (chartInstance.current && onChartRefChange) {
      onChartRefChange(chartInstance.current);
    }
  }, [chartInstance, onChartRefChange]);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleAddToReport = () => {
    if (chartRef.current && onAddToReport) {
      onAddToReport(chartRef.current);
    }
    handleMenuClose();
  };
  
  const handleExport = (format: 'pdf' | 'png' | 'csv') => {
    if (!chartRef.current) return;
    
    if (format === 'png') {
      const url = chartRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
    } else if (format === 'pdf' || format === 'csv') {
      console.log(`Exporting chart as ${format}...`);
      // In a real implementation, we would handle PDF/CSV export here
      alert(`Chart would be exported as ${format.toUpperCase()} in a real implementation.`);
    }
    
    handleMenuClose();
  };
  
  const handleChartTypeChange = (type: ChartType) => {
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
    handleMenuClose();
  };
  
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        width,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box>
          {onRefresh && (
            <Tooltip title="Refresh Data">
              <IconButton size="small" onClick={onRefresh} disabled={isLoading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onEdit && (
            <Tooltip title="Edit Chart">
              <IconButton size="small" onClick={onEdit} disabled={isLoading}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="More Options">
            <IconButton
              size="small"
              onClick={handleMenuClick}
              disabled={isLoading}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {onAddToReport && (
              <MenuItem onClick={handleAddToReport}>
                <ListItemIcon>
                  <AddToReportIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add to Report</ListItemText>
              </MenuItem>
            )}
            
            {showExportOptions && (
              <>
                <MenuItem onClick={() => handleExport('png')}>
                  <ListItemIcon>
                    <ImageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as PNG</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>
                  <ListItemIcon>
                    <PdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>
                  <ListItemIcon>
                    <TableIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export Data as CSV</ListItemText>
                </MenuItem>
              </>
            )}
            
            {showChartTypeOptions && onChartTypeChange && (
              <>
                <Divider />
                <MenuItem onClick={() => handleChartTypeChange('bar')}>
                  <ListItemIcon>
                    <BarChartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Bar Chart</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleChartTypeChange('line')}>
                  <ListItemIcon>
                    <LineChartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Line Chart</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleChartTypeChange('pie')}>
                  <ListItemIcon>
                    <PieChartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Pie Chart</ListItemText>
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Box>
      
      {/* Chart container */}
      <Box
        sx={{
          position: 'relative',
          height: typeof height === 'number' ? height : height,
          width: '100%',
          flexGrow: 1
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <canvas ref={chartRef} />
        )}
      </Box>
    </Paper>
  );
};

export default InteractiveChart; 