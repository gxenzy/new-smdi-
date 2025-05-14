import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  RestoreOutlined as RestoreIcon,
  DeleteOutlineOutlined as DeleteIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { CalculatorType, hasDraftState, clearDraftState, getStateMetadata } from './calculatorStateStorage';

export interface CalculatorStateRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
  onRecoverDraft: () => void;
  onDiscardDraft: () => void;
}

/**
 * Dialog component for recovering calculator state from localStorage
 * 
 * This dialog is displayed when a draft state is found in localStorage,
 * allowing the user to either recover the draft or discard it.
 */
const CalculatorStateRecoveryDialog: React.FC<CalculatorStateRecoveryDialogProps> = ({
  open,
  onClose,
  calculatorType,
  onRecoverDraft,
  onDiscardDraft
}) => {
  const [hasDraft, setHasDraft] = React.useState<boolean>(false);
  const [lastModified, setLastModified] = React.useState<string | null>(null);
  
  // Check for draft state when dialog opens
  React.useEffect(() => {
    if (open) {
      const draftExists = hasDraftState(calculatorType);
      setHasDraft(draftExists);
      
      if (draftExists) {
        const metadata = getStateMetadata(calculatorType, true);
        if (metadata) {
          setLastModified(metadata.lastModified);
        }
      }
    }
  }, [open, calculatorType]);
  
  // Format the last modified date for display
  const formattedDate = React.useMemo(() => {
    if (!lastModified) return '';
    
    try {
      const date = new Date(lastModified);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (error) {
      console.error('Failed to format date:', error);
      return 'Unknown date';
    }
  }, [lastModified]);
  
  // Handle recover draft action
  const handleRecoverDraft = () => {
    onRecoverDraft();
    onClose();
  };
  
  // Handle discard draft action
  const handleDiscardDraft = () => {
    clearDraftState(calculatorType);
    onDiscardDraft();
    onClose();
  };
  
  // Don't show dialog if no draft exists
  if (!hasDraft) {
    return null;
  }
  
  return (
    <Dialog
      open={open && hasDraft}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Recover Unsaved Work
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>We found unsaved work</AlertTitle>
          We found a previously unsaved calculation from {formattedDate}.
          Would you like to recover it or start with a new calculation?
        </Alert>
        
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="text.secondary">
            If you choose to recover, your unsaved work will be loaded.
            If you discard it, you'll start with a new calculation.
          </Typography>
          
          <Divider />
          
          <Box display="flex" gap={1} alignItems="center">
            <WarningIcon color="warning" />
            <Typography variant="body2">
              Your unsaved work will be permanently lost if you discard it.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleDiscardDraft}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Discard
        </Button>
        
        <Button 
          onClick={handleRecoverDraft}
          variant="contained"
          color="primary"
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