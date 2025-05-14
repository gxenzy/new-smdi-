import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box
} from '@mui/material';
import { getTimeAgo, CalculatorStateStorage } from '../../utils/calculatorStateStorage';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Types of calculators
export type CalculatorType = 
  | 'schedule-of-loads' 
  | 'voltage-drop' 
  | 'lighting' 
  | 'hvac' 
  | 'power-factor'
  | 'harmonic-distortion'
  | 'equipment'
  | 'roi';

// Friendly names for calculator types
const calculatorTypeNames: Record<string, string> = {
  'schedule-of-loads': 'Schedule of Loads',
  'voltage-drop': 'Voltage Drop',
  'lighting': 'Lighting',
  'hvac': 'HVAC',
  'power-factor': 'Power Factor',
  'harmonic-distortion': 'Harmonic Distortion',
  'equipment': 'Equipment',
  'roi': 'ROI Calculator'
};

interface CalculatorStateRecoveryDialogProps {
  calculatorType: string;
  onRecover: (state: any) => void;
  onDiscard: () => void;
}

/**
 * Dialog component for recovering calculator state from a previous session
 */
const CalculatorStateRecoveryDialog: React.FC<CalculatorStateRecoveryDialogProps> = ({
  calculatorType,
  onRecover,
  onDiscard
}) => {
  // Create a storage instance for this calculator type
  const storage = new CalculatorStateStorage<any>(calculatorType);
  
  // Check if a draft exists
  const hasDraft = storage.hasSavedState();
  const [open, setOpen] = React.useState(hasDraft);
  
  // Get saved data
  const savedData = hasDraft ? storage.loadState() : null;
  const savedTimestamp = savedData?.timestamp || '';
  
  // Get friendly display name for calculator type
  const calculatorName = calculatorTypeNames[calculatorType] || calculatorType;
  
  // Calculate time since last save
  const timeDisplay = savedTimestamp ? getTimeAgo(savedTimestamp) : 'unknown time';
  
  // Handle recovery
  const handleRecover = () => {
    if (savedData) {
      onRecover(savedData.state);
    }
    setOpen(false);
  };
  
  // Handle discarding draft
  const handleDiscard = () => {
    storage.clearState();
    onDiscard();
    setOpen(false);
  };
  
  // If no draft, don't show dialog
  if (!hasDraft) {
    return null;
  }
  
  return (
    <Dialog 
      open={open} 
      onClose={handleDiscard}
      aria-labelledby="calculator-recovery-dialog-title"
    >
      <DialogTitle id="calculator-recovery-dialog-title">
        Recover Previous Work
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText>
          We found unsaved work from your previous session in the {calculatorName} calculator.
          Would you like to recover it?
        </DialogContentText>
        
        <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Last edited: {timeDisplay}
          </Typography>
        </Box>
        
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Recovery Options
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            • Recover: Load your previous work and continue where you left off
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            • Discard: Start fresh and delete your previous work
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleDiscard} 
          color="error"
          startIcon={<DeleteForeverIcon />}
        >
          Discard
        </Button>
        
        <Button 
          onClick={handleRecover} 
          color="primary" 
          variant="contained"
          startIcon={<RestoreIcon />}
          autoFocus
        >
          Recover
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculatorStateRecoveryDialog; 