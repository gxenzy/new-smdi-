import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import ChartScreenReaderPanel from '../../components/UI/ChartScreenReaderPanel';
import { generateChartAnnouncement, createAccessibleDataTable } from '../../utils/accessibility/chartScreenReaderUtils';

interface AccessibleChartProps {
  configuration: ChartConfiguration;
  width?: string | number;
  height?: string | number;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  highContrastDefault?: boolean;
  dataTableView?: boolean;
  ariaLabel?: string;
  themeName?: 'default' | 'energy' | 'financial';
  showExportOptions?: boolean;
  showChartTypeOptions?: boolean;
  onAddToReport?: (canvas: HTMLCanvasElement) => void;
  onChartTypeChange?: (type: ChartType) => void;
  onRefresh?: () => void;
  onEdit?: () => void;
  onChartRefChange?: (chartInstance: any) => void;
}

/**
 * Accessible chart component with enhanced screen reader support
 */
const AccessibleChart: React.FC<AccessibleChartProps> = ({
  configuration,
  width = '100%',
  height = 400,
  title,
  subtitle,
  isLoading = false,
  highContrastDefault = false,
  dataTableView = false,
  ariaLabel,
  themeName = 'default',
  showExportOptions = false,
  showChartTypeOptions = false,
  onAddToReport,
  onChartTypeChange,
  onRefresh,
  onEdit,
  onChartRefChange
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  
  // Initialize or update chart when props change
  useEffect(() => {
    // If chart is not available or is loading, don't try to render
    if (!chartRef.current || isLoading) return;
    
    // Generate appropriate aria-label for the chart
    const chartTitle = title || 
      (configuration.options?.plugins?.title?.text as string) || 
      'Chart';
    
    // Set ARIA attributes on canvas for better accessibility
    const canvas = chartRef.current;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', ariaLabel || `${chartTitle} chart. Use alt+d to open accessible view.`);
    canvas.setAttribute('tabindex', '0'); // Make canvas focusable
    
    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    
    // Create new chart
    chartInstanceRef.current = new Chart(canvas, configuration);
    setChartLoaded(true);
    
    // Call onChartRefChange callback if provided
    if (onChartRefChange && chartInstanceRef.current) {
      onChartRefChange(chartInstanceRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [configuration, isLoading, title, ariaLabel, onChartRefChange]);
  
  // Handle adding to report
  const handleAddToReport = () => {
    if (chartRef.current && onAddToReport) {
      onAddToReport(chartRef.current);
    }
  };
  
  return (
    <Box sx={{ width, position: 'relative' }}>
      {title && (
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
      )}
      
      {subtitle && (
        <Typography variant="subtitle2" align="center" gutterBottom sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      
      <Box sx={{ height, position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <canvas ref={chartRef} height={height} />
        
        {/* Hidden data table for screen readers */}
        <div className="sr-only" aria-hidden="true">
          <div aria-live="polite">
            {chartLoaded && configuration && (
              generateChartAnnouncement(configuration)
            )}
          </div>
        </div>
      </Box>
      
      {/* Add screen reader panel */}
      {chartLoaded && configuration && (
        <ChartScreenReaderPanel
          chartConfiguration={configuration}
          chartRef={chartRef}
        />
      )}
    </Box>
  );
};

export default AccessibleChart; 