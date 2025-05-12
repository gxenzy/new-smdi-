import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider
} from '@mui/material';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ElectricalInspectionChecklist from './ElectricalInspectionChecklist';
import HVACInspectionChecklist from './HVACInspectionChecklist';

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
      id={`inspection-tabpanel-${index}`}
      aria-labelledby={`inspection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `inspection-tab-${index}`,
    'aria-controls': `inspection-tabpanel-${index}`,
  };
}

const InspectionChecklistDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inspection Checklists
        </Typography>
        <Typography variant="body1" paragraph>
          Use these standardized checklists to perform comprehensive inspections of building systems.
          Each checklist references relevant standards and provides explanations to guide the inspection process.
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="inspection checklist tabs"
          >
            <Tab icon={<CheckCircleOutlineIcon />} label="Overview" {...a11yProps(0)} />
            <Tab icon={<ElectricalServicesIcon />} label="Electrical Systems" {...a11yProps(1)} />
            <Tab icon={<AcUnitIcon />} label="HVAC Systems" {...a11yProps(2)} />
          </Tabs>
          
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available Inspection Checklists
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardActionArea onClick={() => setTabValue(1)}>
                      <CardContent>
                        <ElectricalServicesIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>
                          Electrical Inspection Checklist
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comprehensive checklist for inspecting electrical systems based on Philippine Electrical Code (PEC) 2017.
                          Includes panels, wiring, lighting, and receptacles.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardActionArea onClick={() => setTabValue(2)}>
                      <CardContent>
                        <AcUnitIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>
                          HVAC Inspection Checklist
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Detailed checklist for inspecting HVAC systems based on ASHRAE standards.
                          Includes air conditioning, ventilation, controls, and maintenance items.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
              
              <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>
                  How to Use Inspection Checklists
                </Typography>
                <Typography variant="body2" paragraph>
                  1. Select the appropriate checklist for the system you are inspecting.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. Work through each item, marking it as complete when verified.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Add detailed notes for each item, especially for any issues identified.
                </Typography>
                <Typography variant="body2" paragraph>
                  4. Upload evidence such as photos or measurements where applicable.
                </Typography>
                <Typography variant="body2">
                  5. Export the completed checklist as PDF or CSV for your audit report.
                </Typography>
              </Paper>
              
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Standards & References
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Philippine Electrical Code (PEC) 2017
                    </Typography>
                    <Typography variant="body2">
                      The primary electrical standard in the Philippines that provides guidelines for
                      electrical installations, safety requirements, and energy efficiency.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ASHRAE Standards
                    </Typography>
                    <Typography variant="body2">
                      International standards for HVAC, refrigeration, and building systems that provide
                      guidelines for energy efficiency and indoor air quality.
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </TabPanel>
          
          {/* Electrical Inspection Checklist Tab */}
          <TabPanel value={tabValue} index={1}>
            <ElectricalInspectionChecklist />
          </TabPanel>
          
          {/* HVAC Inspection Checklist Tab */}
          <TabPanel value={tabValue} index={2}>
            <HVACInspectionChecklist />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default InspectionChecklistDashboard; 