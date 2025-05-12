import React, { useState, useRef, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { debounce } from 'lodash';

/**
 * Props for the ResponsiveChartWrapper component
 */
interface ResponsiveChartWrapperProps {
  /** The chart component to render */
  children: React.ReactNode;
  /** Minimum height for the chart */
  minHeight?: number;
  /** Maximum height for the chart */
  maxHeight?: number;
  /** Aspect ratio for the chart (width:height) */
  aspectRatio?: number;
  /** Whether to allow the chart to scale below the minHeight on small screens */
  allowSmallerOnMobile?: boolean;
  /** Class name to apply to the wrapper */
  className?: string;
  /** Additional style properties */
  style?: React.CSSProperties;
  /** Callback function called when dimensions change */
  onDimensionsChange?: (width: number, height: number) => void;
}

/**
 * A wrapper component that provides responsive sizing for charts
 * 
 * This component resizes charts based on:
 * 1. Container width
 * 2. Aspect ratio
 * 3. Device size (responsive breakpoints)
 * 4. Min/max height constraints
 */
const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  children,
  minHeight = 200,
  maxHeight = 600,
  aspectRatio = 16/9,
  allowSmallerOnMobile = true,
  className,
  style,
  onDimensionsChange
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMdScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track dimensions
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Calculate the optimal height based on screen size and container width
  const calculateHeight = (containerWidth: number): number => {
    // Base height calculation based on aspect ratio
    let calculatedHeight = containerWidth / aspectRatio;
    
    // Apply min/max constraints
    calculatedHeight = Math.max(calculatedHeight, allowSmallerOnMobile && isXsScreen ? minHeight * 0.75 : minHeight);
    calculatedHeight = Math.min(calculatedHeight, maxHeight);
    
    // Apply responsive adjustments based on screen size
    if (isXsScreen) {
      // On extra small screens, use a more compact height
      calculatedHeight = Math.min(calculatedHeight, maxHeight * 0.8);
    } else if (isSmScreen) {
      // On small screens, use slightly reduced height
      calculatedHeight = Math.min(calculatedHeight, maxHeight * 0.9);
    } else if (isMdScreen) {
      // On medium screens, use full height
      calculatedHeight = Math.min(calculatedHeight, maxHeight);
    }
    
    return Math.floor(calculatedHeight);
  };

  // Update dimensions when container size changes
  const updateDimensions = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = calculateHeight(containerWidth);
      
      setDimensions({
        width: containerWidth,
        height: containerHeight,
      });
      
      if (onDimensionsChange) {
        onDimensionsChange(containerWidth, containerHeight);
      }
    }
  };
  
  // Debounced resize handler for better performance
  const debouncedUpdateDimensions = debounce(updateDimensions, 250);
  
  // Set up resize observer and window resize listener
  useEffect(() => {
    // Initialize dimensions
    updateDimensions();
    
    // Set up ResizeObserver to detect container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(debouncedUpdateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback to window resize for browsers without ResizeObserver
    window.addEventListener('resize', debouncedUpdateDimensions);
    
    // Clean up listeners
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', debouncedUpdateDimensions);
      debouncedUpdateDimensions.cancel();
    };
  }, [aspectRatio, minHeight, maxHeight, allowSmallerOnMobile, isXsScreen, isSmScreen, isMdScreen]);
  
  return (
    <Box 
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: dimensions.height > 0 ? dimensions.height : minHeight,
        ...style
      }}
      data-testid="responsive-chart-wrapper"
    >
      {dimensions.width > 0 && dimensions.height > 0 && children}
    </Box>
  );
};

export default ResponsiveChartWrapper; 