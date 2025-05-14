import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, Paper } from '@mui/material';
import { 
  PowerFactorCalculator, 
  HarmonicDistortionCalculator, 
  IlluminationCalculator
} from '../Calculators';
import ScheduleOfLoadsCalculator from '../Calculators/ScheduleOfLoads';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, index, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnergyCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Energy Audit Calculators
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="calculator tabs">
          <Tab label="Power Factor" />
          <Tab label="Harmonic Distortion" />
          <Tab label="Illumination" />
          <Tab label="Schedule of Loads" />
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <PowerFactorCalculator />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <HarmonicDistortionCalculator />
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <IlluminationCalculator />
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <ScheduleOfLoadsCalculator />
      </TabPanel>
    </Paper>
  );
};

export default EnergyCalculators; 