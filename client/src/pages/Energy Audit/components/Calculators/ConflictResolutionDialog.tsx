import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ErrorIcon from '@mui/icons-material/Error';
import { useCircuitSync, Conflict } from '../../../../contexts/CircuitSynchronizationContext';
import ConflictDiffViewer from './ConflictDiffViewer';

interface ConflictResolutionDialogProps {
  open: boolean;
  onClose: () => void;
  conflict: Conflict | null;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({ 
  open, 
  onClose,
  conflict 
}) => {
  const theme = useTheme();
  const circuitSync = useCircuitSync();
  const [resolution, setResolution] = useState<'voltage-drop' | 'schedule-of-loads' | 'merge'>('voltage-drop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    if (!conflict) return;

    setIsLoading(true);
    setError(null);

    try {
      circuitSync.resolveConflict(conflict.id, resolution);
      onClose();
    } catch (e) {
      setError(`Failed to apply resolution: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolutionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResolution(event.target.value as 'voltage-drop' | 'schedule-of-loads' | 'merge');
  };

  const handleUndo = () => {
    if (circuitSync.canUndo()) {
      circuitSync.undo();
    }
  };

  const handleRedo = () => {
    if (circuitSync.canRedo()) {
      circuitSync.redo();
    }
  };

  if (!conflict) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Resolve Conflict: {conflict.name}
          </Typography>
          <Box>
            <Tooltip title="Undo">
              <span>
                <IconButton
                  size="small"
                  onClick={handleUndo}
                  disabled={!circuitSync.canUndo()}
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <IconButton
                  size="small"
                  onClick={handleRedo}
                  disabled={!circuitSync.canRedo()}
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {conflict.severity === 'critical' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
              {conflict.severity === 'high' && <WarningIcon color="error" sx={{ mr: 1 }} />}
              {conflict.severity === 'medium' && <WarningIcon color="warning" sx={{ mr: 1 }} />}
              {conflict.severity === 'low' && <InfoIcon color="info" sx={{ mr: 1 }} />}
              {conflict.name}
            </Box>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This conflict was detected between Voltage Drop Calculator and Schedule of Loads.
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>Differences</Typography>
        <ConflictDiffViewer propertyComparisons={conflict.propertyComparisons} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Resolution Strategy</Typography>
          <RadioGroup value={resolution} onChange={handleResolutionChange}>
            <FormControlLabel 
              value="voltage-drop" 
              control={<Radio />} 
              label="Use values from Voltage Drop Calculator"
            />
            <FormControlLabel 
              value="schedule-of-loads" 
              control={<Radio />} 
              label="Use values from Schedule of Loads"
            />
            <FormControlLabel 
              value="merge" 
              control={<Radio />} 
              label="Merge values (use recommended value for each property)"
            />
          </RadioGroup>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleResolve}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Apply Resolution'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictResolutionDialog; 