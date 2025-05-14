import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Tooltip, Typography, Badge, IconButton } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { VoltageDropRecalculator, RecalculationEvent } from '../utils/voltageDropRecalculator';

interface RecalculationStatusIndicatorProps {
  recalculator: VoltageDropRecalculator;
  onToggleEnabled?: () => void;
}

/**
 * Component to display the status of automatic voltage drop recalculation
 */
const RecalculationStatusIndicator: React.FC<RecalculationStatusIndicatorProps> = ({
  recalculator,
  onToggleEnabled
}) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isEnabled, setIsEnabled] = useState(recalculator.isRecalculationEnabled());

  // Handler for recalculation events
  const handleRecalculationEvent = useCallback((event: RecalculationEvent) => {
    if (!event.completed) {
      // Recalculation started
      setIsRecalculating(true);
      setPendingCount(event.circuitIds.length);
      setHasError(false);
    } else {
      // Recalculation completed
      setIsRecalculating(false);
      setLastCompleted(new Date());
      setHasError(!!event.error);
    }
  }, []);

  // Toggle automatic recalculation
  const toggleEnabled = useCallback(() => {
    const newEnabledState = !isEnabled;
    setIsEnabled(newEnabledState);
    recalculator.setEnabled(newEnabledState);
    if (onToggleEnabled) {
      onToggleEnabled();
    }
  }, [isEnabled, recalculator, onToggleEnabled]);

  // Register and unregister the recalculation event listener
  useEffect(() => {
    const removeListener = recalculator.addRecalculationListener(handleRecalculationEvent);
    
    // Check initial state
    setIsRecalculating(recalculator.isRecalculationInProgress());
    setIsEnabled(recalculator.isRecalculationEnabled());
    
    return () => {
      removeListener();
    };
  }, [recalculator, handleRecalculationEvent]);

  // Determine which icon to show
  const getStatusIcon = () => {
    if (!isEnabled) {
      return (
        <Tooltip title="Automatic recalculation is paused. Click to enable.">
          <PauseCircleIcon color="disabled" />
        </Tooltip>
      );
    }
    
    if (isRecalculating) {
      return (
        <Tooltip title={`Recalculating ${pendingCount} circuit(s)...`}>
          <CircularProgress size={24} />
        </Tooltip>
      );
    }
    
    if (hasError) {
      return (
        <Tooltip title="Error during recalculation. Check console for details.">
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
    
    if (lastCompleted) {
      return (
        <Tooltip title={`Last recalculation completed at ${lastCompleted.toLocaleTimeString()}`}>
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    }
    
    return (
      <Tooltip title="No recalculation performed yet">
        <CalculateIcon color="disabled" />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      border: hasError ? '1px solid #f44336' : '1px solid #e0e0e0',
      borderRadius: 1,
      p: 1,
      backgroundColor: isEnabled ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.05)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {getStatusIcon()}
      </Box>
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color={isEnabled ? 'textPrimary' : 'textSecondary'}>
          {isEnabled ? 'Auto-recalculation enabled' : 'Auto-recalculation paused'}
        </Typography>
        
        {isRecalculating && (
          <Typography variant="caption" display="block" color="textSecondary">
            Calculating {pendingCount} circuit(s)...
          </Typography>
        )}
        
        {lastCompleted && !isRecalculating && (
          <Typography variant="caption" display="block" color="textSecondary">
            Last update: {lastCompleted.toLocaleTimeString()}
          </Typography>
        )}
      </Box>
      
      <IconButton 
        size="small" 
        onClick={toggleEnabled}
        aria-label={isEnabled ? "Pause auto-recalculation" : "Enable auto-recalculation"}
      >
        {isEnabled ? <PauseCircleIcon fontSize="small" /> : <AutorenewIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
};

export default RecalculationStatusIndicator; 