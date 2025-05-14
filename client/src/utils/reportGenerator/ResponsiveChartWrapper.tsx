import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

/**
 * Props for the responsive chart wrapper
 */
interface ResponsiveChartWrapperProps {
  /**
   * Minimum height for the chart
   */
  minHeight?: number;
  
  /**
   * Maximum height for the chart
   */
  maxHeight?: number;
  
  /**
   * Aspect ratio for the chart (width:height)
   */
  aspectRatio?: number;
  
  /**
   * Whether to allow the chart to be smaller on mobile
   */
  allowSmallerOnMobile?: boolean;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: React.CSSProperties;
  
  /**
   * Predefined size preset
   */
  sizePreset?: 'compact' | 'standard' | 'large' | 'report' | 'dashboard';
  
  /**
   * Callback when dimensions change
   */
  onDimensionsChange?: (width: number, height: number) => void;
  
  /**
   * Children as a render prop function that receives width and height
   */
  children: React.ReactNode | ((dimensions: { width: number; height: number }) => React.ReactNode);
}

/**
 * Size preset configurations
 */
const sizePresets: Record<string, { minHeight: number; maxHeight: number; aspectRatio: number }> = {
  compact: { minHeight: 180, maxHeight: 300, aspectRatio: 4/3 },
  standard: { minHeight: 250, maxHeight: 600, aspectRatio: 16/9 },
  large: { minHeight: 300, maxHeight: 800, aspectRatio: 16/9 },
  report: { minHeight: 250, maxHeight: 500, aspectRatio: 3/2 },
  dashboard: { minHeight: 200, maxHeight: 400, aspectRatio: 5/3 }
};

/**
 * Component that provides responsive sizing for charts based on container width
 */
const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  minHeight: propMinHeight,
  maxHeight: propMaxHeight,
  aspectRatio: propAspectRatio,
  allowSmallerOnMobile = true,
  children,
  className,
  style,
  sizePreset = 'standard',
  onDimensionsChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get preset values or use props
  const preset = sizePresets[sizePreset] || sizePresets.standard;
  const minHeight = propMinHeight ?? preset.minHeight;
  const maxHeight = propMaxHeight ?? preset.maxHeight;
  const aspectRatio = propAspectRatio ?? preset.aspectRatio;
  
  // Adjust minHeight for mobile if allowed
  const effectiveMinHeight = isMobile && allowSmallerOnMobile
    ? Math.min(minHeight, 180) // Use smaller height on mobile
    : minHeight;
  
  // Create ResizeObserver to monitor container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const calculateDimensions = () => {
      if (!containerRef.current) return;
      
      // Get container width
      const containerWidth = containerRef.current.clientWidth;
      
      // Calculate height based on aspect ratio, constrained by min/max
      let calculatedHeight = containerWidth / aspectRatio;
      calculatedHeight = Math.max(effectiveMinHeight, Math.min(calculatedHeight, maxHeight));
      
      // Update state if dimensions changed
      if (dimensions.width !== containerWidth || dimensions.height !== calculatedHeight) {
        setDimensions({
          width: containerWidth,
          height: calculatedHeight
        });
        
        if (onDimensionsChange) {
          onDimensionsChange(containerWidth, calculatedHeight);
        }
      }
    };
    
    // Calculate initial dimensions
    calculateDimensions();
    
    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(calculateDimensions);
    resizeObserver.observe(containerRef.current);
    
    // Clean up ResizeObserver on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, dimensions, effectiveMinHeight, maxHeight, onDimensionsChange]);
  
  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        width: '100%',
        height: dimensions.height,
        minHeight: effectiveMinHeight,
        maxHeight,
        ...style
      }}
    >
      {typeof children === 'function'
        ? children(dimensions)
        : children}
    </Box>
  );
};

export default ResponsiveChartWrapper; 