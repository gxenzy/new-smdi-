import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Tooltip, 
  CircularProgress, 
  useTheme, 
  Paper,
  Fade
} from '@mui/material';
import {
  Check as CheckIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export interface ComplianceMeterProps {
  /**
   * Value to display (0-100 percentage of compliance)
   */
  value: number;
  
  /**
   * Minimum threshold for compliance (0-100)
   */
  threshold: number;
  
  /**
   * Label to display
   */
  label?: string;
  
  /**
   * Whether to show detailed information
   */
  showDetails?: boolean;
  
  /**
   * Size of the meter
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to animate the meter on mount and value change
   */
  animated?: boolean;
  
  /**
   * Custom threshold for warning level
   */
  warningThreshold?: number;
  
  /**
   * Description or additional info about the compliance metric
   */
  description?: string;
  
  /**
   * Event handler for when the meter is clicked
   */
  onClick?: () => void;
}

/**
 * ComplianceMeter component displays a visual gauge showing compliance status
 * with color coding and optional details.
 */
const ComplianceMeter: React.FC<ComplianceMeterProps> = ({
  value,
  threshold,
  label = 'Compliance',
  showDetails = false,
  size = 'medium',
  animated = true,
  warningThreshold,
  description,
  onClick
}) => {
  const theme = useTheme();
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(animated);
  const requestRef = useRef<number>();
  
  // Calculate the warning threshold if not provided
  const calculatedWarningThreshold = warningThreshold || threshold + ((100 - threshold) * 0.25);
  
  // Determine size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { size: 60, thickness: 6, iconSize: 'small', fontSize: '0.75rem' };
      case 'large':
        return { size: 140, thickness: 10, iconSize: 'large', fontSize: '1.25rem' };
      case 'medium':
      default:
        return { size: 100, thickness: 8, iconSize: 'medium', fontSize: '1rem' };
    }
  };
  
  const { size: meterSize, thickness, iconSize, fontSize } = getSizeDimensions();
  
  // Determine color based on value
  const getColor = (val: number) => {
    if (val >= calculatedWarningThreshold) {
      return theme.palette.success.main;
    } else if (val >= threshold) {
      return theme.palette.warning.main;
    }
    return theme.palette.error.main;
  };
  
  const color = getColor(value);
  
  // Status icon based on compliance level
  const StatusIcon = () => {
    if (value >= calculatedWarningThreshold) {
      return <CheckIcon sx={{ color: theme.palette.success.main }} fontSize={iconSize as "small" | "medium" | "large" | "inherit"} />;
    } else if (value >= threshold) {
      return <WarningIcon sx={{ color: theme.palette.warning.main }} fontSize={iconSize as "small" | "medium" | "large" | "inherit"} />;
    }
    return <ErrorIcon sx={{ color: theme.palette.error.main }} fontSize={iconSize as "small" | "medium" | "large" | "inherit"} />;
  };
  
  // Compliance status text
  const getStatusText = () => {
    if (value >= calculatedWarningThreshold) {
      return 'Compliant';
    } else if (value >= threshold) {
      return 'Marginal';
    }
    return 'Non-compliant';
  };
  
  // Animation effect
  useEffect(() => {
    if (!animated) {
      setCurrentValue(value);
      return;
    }
    
    setIsAnimating(true);
    let startTimestamp: number | null = null;
    const duration = 1000; // Animation duration in ms
    const startValue = currentValue;
    
    const animateValue = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const animatedValue = startValue + (value - startValue) * easeOutCubic;
      
      setCurrentValue(animatedValue);
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animateValue);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestRef.current = requestAnimationFrame(animateValue);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animated, value]);
  
  // Calculate the progress value (0-100 for CircularProgress)
  const normalizedValue = Math.min(100, Math.max(0, currentValue));
  
  // Cursor style based on onClick handler
  const cursorStyle = onClick ? { cursor: 'pointer' } : {};
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        ...cursorStyle 
      }}
      onClick={onClick}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {/* Meter label */}
        <Typography 
          variant={size === 'small' ? 'subtitle2' : 'subtitle1'} 
          gutterBottom
        >
          {label}
          {description && (
            <Tooltip title={description}>
              <InfoIcon 
                fontSize="small" 
                sx={{ ml: 0.5, color: theme.palette.text.secondary, verticalAlign: 'middle' }} 
              />
            </Tooltip>
          )}
        </Typography>
        
        {/* Circular meter */}
        <Box 
          sx={{ 
            position: 'relative', 
            display: 'inline-flex',
            m: 1
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={meterSize}
            thickness={thickness}
            sx={{ color: theme.palette.divider }}
          />
          <CircularProgress
            variant="determinate"
            value={normalizedValue}
            size={meterSize}
            thickness={thickness}
            sx={{ 
              color: color,
              position: 'absolute',
              left: 0,
            }}
          />
          
          {/* Threshold indicators */}
          <Tooltip title={`Minimum threshold: ${threshold}%`}>
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 3,
                  height: thickness,
                  backgroundColor: theme.palette.warning.main,
                  transformOrigin: 'center center',
                  transform: `rotate(${(threshold / 100) * 360 - 90}deg) translateX(${meterSize / 2 - thickness / 2}px)`,
                }}
              />
            </Box>
          </Tooltip>
          
          {/* Center content */}
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="h6"
              component="div"
              color="text.primary"
              sx={{ 
                fontSize,
                fontWeight: 'bold',
                mb: 0.5
              }}
            >
              {Math.round(currentValue)}%
            </Typography>
            
            <Fade in={!isAnimating}>
              <Box sx={{ lineHeight: 0 }}>
                <StatusIcon />
              </Box>
            </Fade>
          </Box>
        </Box>
        
        {/* Status text and details */}
        {showDetails && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              sx={{ 
                color: color,
                fontWeight: 'medium'
              }}
            >
              {getStatusText()}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{ 
                display: 'block',
                color: theme.palette.text.secondary,
                mt: 0.5
              }}
            >
              Threshold: {threshold}%
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ComplianceMeter; 