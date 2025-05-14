import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Divider
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EnergyCalculator from './EnergyCalculator';
import ROICalculator from './ROICalculator';
import LightingPowerDensityCalculator from './LightingPowerDensityCalculator';

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
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `calculator-tab-${index}`,
    'aria-controls': `calculator-tabpanel-${index}`,
  };
}

const Calculators: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Energy Audit Calculators
        </Typography>
        <Typography variant="body1" paragraph>
          These calculators help perform energy audit calculations and assessments based on Philippine Electrical Code (PEC) 2017 
          and other relevant standards. Use these tools to analyze field measurements and make informed decisions.
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="calculator tabs"
          >
            <Tab icon={<CalculateIcon />} label="Overview" {...a11yProps(0)} />
            <Tab icon={<ElectricalServicesIcon />} label="Energy Calculator" {...a11yProps(1)} />
            <Tab icon={<LightbulbIcon />} label="Lighting" {...a11yProps(2)} />
            <Tab icon={<AcUnitIcon />} label="HVAC" {...a11yProps(3)} />
            <Tab icon={<MonetizationOnIcon />} label="ROI Calculator" {...a11yProps(4)} />
          </Tabs>
          
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Available Calculators
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(1)}>
                    <CardContent>
                      <ElectricalServicesIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Energy Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate power consumption, energy usage, and costs based on electrical measurements.
                        Includes power factor assessment and PEC 2017 compliance checks.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(2)}>
                    <CardContent>
                      <LightbulbIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Lighting Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analyze lighting systems, calculate lighting power density (LPD), and verify 
                        compliance with illumination standards.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(3)}>
                    <CardContent>
                      <AcUnitIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        HVAC Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate HVAC system efficiency, energy consumption, and operating costs.
                        Includes EER/SEER assessment.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(4)}>
                    <CardContent>
                      <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        ROI Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate return on investment for energy efficiency upgrades and 
                        determine payback periods for proposed improvements.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
            
            <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                How to Use These Calculators
              </Typography>
              <Typography variant="body2" paragraph>
                1. Select the appropriate calculator tab for your analysis needs.
              </Typography>
              <Typography variant="body2" paragraph>
                2. Enter field measurements and system specifications as accurately as possible.
              </Typography>
              <Typography variant="body2" paragraph>
                3. Review the calculated results and compliance assessments.
              </Typography>
              <Typography variant="body2" paragraph>
                4. Use the findings to identify energy saving opportunities and improvements.
              </Typography>
              <Typography variant="body2">
                5. Export or save your calculations for inclusion in your energy audit report.
              </Typography>
            </Paper>
          </TabPanel>
          
          {/* Energy Calculator Tab */}
          <TabPanel value={tabValue} index={1}>
            <EnergyCalculator />
          </TabPanel>
          
          {/* Lighting Calculator Tab */}
          <TabPanel value={tabValue} index={2}>
            <LightingPowerDensityCalculator />
          </TabPanel>
          
          {/* HVAC Calculator Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                HVAC Calculator
              </Typography>
              <Typography variant="body1">
                This feature will be implemented soon. The HVAC calculator will help analyze
                cooling system efficiency and energy consumption.
              </Typography>
            </Box>
          </TabPanel>
          
          {/* ROI Calculator Tab */}
          <TabPanel value={tabValue} index={4}>
            <ROICalculator />
          </TabPanel>
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
    </Container>
  );
};

export default Calculators; 