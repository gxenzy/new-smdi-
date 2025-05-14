import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import ComplianceRules from './Compliance/ComplianceRules';
import ComplianceChecklists from './Compliance/ComplianceChecklists';
import ComplianceReports from './Compliance/ComplianceReports';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `compliance-tab-${index}`,
    'aria-controls': `compliance-tabpanel-${index}`,
  };
}

const ComplianceChecker: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ p: 2, pb: 1 }}>
          Compliance Checker
        </Typography>
        <Divider />
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="compliance tabs"
          sx={{ px: 2 }}
        >
          <Tab label="Rules" {...a11yProps(0)} />
          <Tab label="Checklists" {...a11yProps(1)} />
          <Tab label="Reports" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <ComplianceRules />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ComplianceChecklists />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <ComplianceReports />
      </TabPanel>
    </Paper>
  );
};

export default ComplianceChecker; 