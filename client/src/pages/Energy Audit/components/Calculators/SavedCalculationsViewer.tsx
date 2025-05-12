import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Chip,
  Snackbar,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import LoadIcon from '@mui/icons-material/RestoreOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  getStoredCalculations,
  getCalculationsByType,
  deleteCalculation,
  clearAllCalculations,
  loadSavedCalculations
} from './utils/storage';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Supported calculator types
type CalculatorType = 'illumination' | 'roi' | 'powerfactor' | 'hvac' | 'equipment' | 'harmonic';

interface SavedCalculation {
  id: string;
  name: string;
  timestamp: number;
  data: any;
}

interface SavedCalculationsViewerProps {
  calculationType: CalculatorType;
  onLoadCalculation: (data: any) => void;
}

const SavedCalculationsViewer: React.FC<SavedCalculationsViewerProps> = ({
  calculationType,
  onLoadCalculation
}) => {
  const [open, setOpen] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<any | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  
  // Load saved calculations when dialog opens
  const handleOpen = () => {
    setSavedCalculations(loadSavedCalculations(calculationType));
    setOpen(true);
  };
  
  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedCalculation(null);
  };
  
  // Load a saved calculation
  const handleLoad = (calculation: SavedCalculation) => {
    onLoadCalculation(calculation.data);
    setSnackbarMessage('Calculation loaded successfully');
    setSnackbarOpen(true);
    handleClose();
  };
  
  // Delete a saved calculation
  const handleDelete = (id: string) => {
    if (deleteCalculation(calculationType, id)) {
      setSavedCalculations(prev => prev.filter(calc => calc.id !== id));
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'illumination':
        return 'Illumination';
      case 'roi':
        return 'ROI';
      case 'powerfactor':
        return 'Power Factor';
      case 'hvac':
        return 'HVAC';
      case 'equipment':
        return 'Equipment';
      default:
        return type;
    }
  };
  
  return (
    <>
      <Tooltip title="Load saved calculation">
        <IconButton onClick={handleOpen}>
          <FolderOpenIcon />
        </IconButton>
      </Tooltip>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {calculationType 
                ? `Saved ${getTypeLabel(calculationType)} Calculations` 
                : 'All Saved Calculations'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {savedCalculations.length === 0 ? (
            <Alert severity="info">
              No saved calculations found. Save a calculation first to see it here.
            </Alert>
          ) : (
            <List>
              {savedCalculations.map((calculation) => (
                <React.Fragment key={calculation.id}>
                  <ListItem 
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(calculation.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={calculation.name} 
                      secondary={formatDate(calculation.timestamp)}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleLoad(calculation)}
                      sx={{ ml: 2 }}
                    >
                      Load
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default SavedCalculationsViewer; 