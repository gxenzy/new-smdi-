import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  useTheme
} from '@mui/material';
import { PropertyComparison } from '../../../../contexts/CircuitSynchronizationContext';

interface ConflictDiffViewerProps {
  propertyComparisons: PropertyComparison[];
}

const ConflictDiffViewer: React.FC<ConflictDiffViewerProps> = ({ propertyComparisons }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      {propertyComparisons.filter(comparison => comparison.conflict).map((comparison, index) => (
        <Paper 
          key={index} 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2,
            borderLeft: '4px solid',
            borderColor: 
              comparison.severity === 'critical' ? theme.palette.error.dark :
              comparison.severity === 'high' ? theme.palette.error.main :
              comparison.severity === 'medium' ? theme.palette.warning.main :
              theme.palette.info.main
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {comparison.displayName}
            {comparison.unit && <span> ({comparison.unit})</span>}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Voltage Drop Calculator
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {comparison.voltageDropValue}
                {comparison.unit && <span>{comparison.unit}</span>}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Schedule of Loads
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {comparison.scheduleOfLoadsValue}
                {comparison.unit && <span>{comparison.unit}</span>}
              </Typography>
            </Grid>
          </Grid>
          
          {comparison.recommendation && (
            <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
              <Typography variant="body2" color="textSecondary">
                Recommended: Use value from {' '}
                <strong>
                  {comparison.recommendation === 'voltage-drop' 
                    ? 'Voltage Drop Calculator' 
                    : comparison.recommendation === 'schedule-of-loads'
                      ? 'Schedule of Loads'
                      : 'the most recently updated source'}
                </strong>
              </Typography>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default ConflictDiffViewer; 