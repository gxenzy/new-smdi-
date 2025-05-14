import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Grid, Typography, Tabs, Tab } from '@mui/material';
import StandardsBrowser from './StandardsBrowser';
import SectionViewer from './SectionViewer';

interface StandardsReferenceProps {
  userId?: number;
}

const StandardsReference: React.FC<StandardsReferenceProps> = ({ userId }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Standards Reference
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="standards tabs">
            <Tab label="Browse Standards" />
            <Tab label="My Bookmarks" disabled={!userId} />
            <Tab label="Search" />
          </Tabs>
        </Box>
        
        <Grid container spacing={3}>
          {selectedTab === 0 && (
            <>
              <Grid item xs={12} md={4}>
                <StandardsBrowser onSectionSelect={(sectionId) => setSelectedSection(sectionId)} />
              </Grid>
              <Grid item xs={12} md={8}>
                {selectedSection ? (
                  <SectionViewer sectionId={selectedSection} userId={userId} />
                ) : (
                  <Typography color="textSecondary">
                    Select a section from the browser to view its content
                  </Typography>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default StandardsReference; 