import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const BenchmarkingComponent: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Energy Benchmarking
        </Typography>
        <Typography variant="body1" paragraph>
          This component allows you to compare your building's energy performance against industry standards and similar buildings.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            The benchmarking component is currently under development.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default BenchmarkingComponent; 