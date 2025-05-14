import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import BuildingVisualization from './components/BuildingVisualization';

const EnergyAuditPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Energy Audit
        </Typography>
        <Typography variant="body1" paragraph>
          Use the tools below to analyze and visualize building energy efficiency.
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 0, height: 'calc(100vh - 180px)' }}>
        <BuildingVisualization />
      </Paper>
    </Container>
  );
};

export default EnergyAuditPage; 