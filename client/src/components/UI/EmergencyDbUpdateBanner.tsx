import React from 'react';
import { Box, Alert, Typography } from '@mui/material';

interface EmergencyDbUpdateBannerProps {
  isVisible?: boolean;
}

/**
 * Emergency banner that appears when using direct database updates
 */
const EmergencyDbUpdateBanner: React.FC<EmergencyDbUpdateBannerProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;
  
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <Alert 
        severity="warning" 
        variant="filled"
        sx={{ 
          borderRadius: 0,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Typography fontWeight="bold">
          EMERGENCY MODE: Using direct database updates
        </Typography>
      </Alert>
    </Box>
  );
};

export default EmergencyDbUpdateBanner; 