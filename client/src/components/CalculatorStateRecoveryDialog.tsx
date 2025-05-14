import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import {
  RestoreOutlined as RestoreIcon,
  DeleteOutlineOutlined as DeleteIcon,
  Close as CloseIcon,
  HistoryOutlined as HistoryIcon
} from '@mui/icons-material';
import { getTimeAgo } from '../utils/calculatorStateStorage';

interface CalculatorStateRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
  onRecover: () => void;
  onDiscard: () => void;
  savedAt: string;
  calculatorType: string;
}

/**
 * Dialog for recovering previously saved calculator state
 * Shown when a user navigates to a calculator with saved draft data
 */
const CalculatorStateRecoveryDialog: React.FC<CalculatorStateRecoveryDialogProps> = ({
  open,
  onClose,
  onRecover,
  onDiscard,
  savedAt,
  calculatorType
}) => {
  const timeAgo = savedAt ? getTimeAgo(savedAt) : 'unknown time';
  const formattedDate = savedAt 
    ? new Date(savedAt).toLocaleString() 
    : 'unknown date';
  
  // Format calculator type for display
  const formatCalculatorName = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const calculatorName = formatCalculatorName(calculatorType);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="recover-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="recover-dialog-title">
        Recover Unsaved Work
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" mb={2}>
          <HistoryIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
          <DialogContentText>
            We found unsaved work in the {calculatorName} from {timeAgo}.
          </DialogContentText>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last modified: {formattedDate}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          Would you like to recover this work or start with a fresh calculator?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={onDiscard} 
          color="error"
          variant="outlined" 
          startIcon={<DeleteIcon />}
        >
          Discard Saved Work
        </Button>
        <Button 
          onClick={onRecover} 
          color="primary" 
          variant="contained"
          startIcon={<RestoreIcon />}
          autoFocus
        >
          Recover Saved Work
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculatorStateRecoveryDialog; 