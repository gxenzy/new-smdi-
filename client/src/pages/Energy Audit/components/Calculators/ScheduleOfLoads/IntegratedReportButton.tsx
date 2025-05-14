import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import IntegratedReportDialog from './IntegratedReportDialog';
import { LoadSchedule } from './types';

interface IntegratedReportButtonProps {
  loadSchedule: LoadSchedule;
  voltageDropData?: {
    [loadItemId: string]: {
      voltageDropPercent: number | null;
      isCompliant: boolean | null;
      optimizedSize: string | null;
    };
  };
  disabled?: boolean;
}

const IntegratedReportButton: React.FC<IntegratedReportButtonProps> = ({
  loadSchedule,
  voltageDropData,
  disabled = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Generate Integrated Report">
        <span>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={handleOpenDialog}
            disabled={disabled || !loadSchedule}
          >
            Integrated Report
          </Button>
        </span>
      </Tooltip>

      <IntegratedReportDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        loadSchedule={loadSchedule}
        voltageDropData={voltageDropData}
      />
    </>
  );
};

export default IntegratedReportButton; 