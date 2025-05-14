import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import BatchVoltageDropAnalysisDialog from './BatchVoltageDropAnalysisDialog';
import { LoadSchedule } from './types';

interface BatchAnalysisButtonProps {
  loadSchedule: LoadSchedule;
  disabled?: boolean;
  onSaveResults: (updatedLoadSchedule: LoadSchedule) => void;
}

const BatchAnalysisButton: React.FC<BatchAnalysisButtonProps> = ({
  loadSchedule,
  disabled = false,
  onSaveResults
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveResults = (updatedLoadSchedule: LoadSchedule) => {
    onSaveResults(updatedLoadSchedule);
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Run voltage drop analysis on all circuits">
        <span>
          <Button
            variant="outlined"
            startIcon={<BatchPredictionIcon />}
            onClick={handleOpenDialog}
            disabled={disabled || !loadSchedule || loadSchedule.loads.length === 0}
          >
            Batch Voltage Drop Analysis
          </Button>
        </span>
      </Tooltip>

      <BatchVoltageDropAnalysisDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        loadSchedule={loadSchedule}
        onSaveResults={handleSaveResults}
      />
    </>
  );
};

export default BatchAnalysisButton; 