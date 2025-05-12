import React, { useState } from 'react';
import { Grid, Typography, Paper, Box } from '@mui/material';
import StandardsBrowser from './StandardsBrowser';
import SectionViewer from './SectionViewer';

const StandardsReference: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Standards Reference System
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Browse and search electrical standards, building codes, and energy efficiency guidelines
      </Typography>
      
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid item xs={12} md={4}>
          <StandardsBrowser onSectionSelect={handleSectionSelect} />
        </Grid>
        <Grid item xs={12} md={8}>
          <SectionViewer sectionId={selectedSectionId} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StandardsReference; 