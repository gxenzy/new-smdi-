import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import CircuitInsightsDashboard from './CircuitInsightsDashboard';
import { LoadSchedule } from './ScheduleOfLoads/types';

interface CircuitInsightsDashboardDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedules: LoadSchedule[];
  onSelectCircuit?: (circuitId: string, panelId: string) => void;
}

/**
 * Dialog wrapper for the Circuit Insights Dashboard
 * Provides a modal interface to the dashboard for better integration with other components
 */
const CircuitInsightsDashboardDialog: React.FC<CircuitInsightsDashboardDialogProps> = ({
  open,
  onClose,
  loadSchedules,
  onSelectCircuit
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Circuit Insights Dashboard</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <CircuitInsightsDashboard
          loadSchedules={loadSchedules}
          onSelectCircuit={onSelectCircuit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CircuitInsightsDashboardDialog; 