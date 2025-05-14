import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const ReportGeneratorComponent: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Report Generator
        </Typography>
        <Typography variant="body1" paragraph>
          This component allows you to generate comprehensive energy audit reports based on collected data.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            The report generator is currently under development.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportGeneratorComponent; 