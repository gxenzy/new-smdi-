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
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import WavesIcon from '@mui/icons-material/Waves';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EnergyCalculator from '../EnergyCalculators';
import ROICalculator from './ROICalculator';
import IlluminationCalculator from './IlluminationCalculator';
import IlluminationLevelCalculator from './IlluminationLevelCalculator';
import PowerFactorCalculator from './PowerFactorCalculator';
import HarmonicDistortionCalculator from './HarmonicDistortionCalculator';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
            <Tab icon={<WbIncandescentIcon />} label="Illumination" {...a11yProps(3)} />
            <Tab icon={<SquareFootIcon />} label="Illumination Level" {...a11yProps(4)} />
            <Tab icon={<AcUnitIcon />} label="HVAC" {...a11yProps(5)} />
            <Tab icon={<MonetizationOnIcon />} label="ROI Calculator" {...a11yProps(6)} />
            <Tab icon={<CalculateIcon />} label="Power Factor" {...a11yProps(7)} />
            <Tab icon={<WavesIcon />} label="Harmonic Distortion" {...a11yProps(8)} />
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
                      <WbIncandescentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Illumination Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate required illumination levels, number of luminaires needed, 
                        and verify compliance with PEC Rule 1075 requirements.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(4)}>
                    <CardContent>
                      <SquareFootIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Illumination Level Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate illumination levels for a given area and verify compliance with PEC Rule 1075 requirements.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(5)}>
                    <CardContent>
                      <AcUnitIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        HVAC Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate HVAC energy consumption, thermal loads, and potential energy savings
                        based on ASHRAE standards.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(6)}>
                    <CardContent>
                      <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        ROI Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate return on investment, payback period, and financial benefits
                        of energy efficiency improvements.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(7)}>
                    <CardContent>
                      <CalculateIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Power Factor Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calculate power factor, determine correction requirements, and verify
                        compliance with PEC 2017 Section 4.30 standards.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea onClick={() => setTabValue(8)}>
                    <CardContent>
                      <WavesIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Harmonic Distortion Calculator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analyze harmonic distortion in electrical systems and verify
                        compliance with IEEE 519-2014 standards.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Educational Resources
              </Typography>
              <Typography variant="body2" paragraph>
                These calculators are designed for educational purposes to help students understand 
                energy consumption patterns and apply industry-standard methodologies from:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Lighting</Typography>
                  <Typography variant="body2">
                    • PEC 2017 Section 4.6<br />
                    • IES Lighting Handbook<br />
                    • DOE Lighting Guidelines
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Illumination</Typography>
                  <Typography variant="body2">
                    • PEC 2017 Rule 1075<br />
                    • IES Lighting Handbook<br />
                    • Philippine Lighting Code
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">HVAC</Typography>
                  <Typography variant="body2">
                    • ASHRAE 90.1-2019<br />
                    • ASHRAE Fundamentals<br />
                    • ACCA Manual J
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">ROI Analysis</Typography>
                  <Typography variant="body2">
                    • Finance principles<br />
                    • Energy efficiency economics<br />
                    • Life-cycle cost analysis
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          {/* Energy Calculator Tab */}
          <TabPanel value={tabValue} index={1}>
            <EnergyCalculator />
          </TabPanel>
          
          {/* Lighting Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>Lighting Calculator</Typography>
            <Typography variant="body1" paragraph>
              The lighting calculator is currently under development. Please check back later.
            </Typography>
          </TabPanel>
          
          {/* Illumination Tab */}
          <TabPanel value={tabValue} index={3}>
            <IlluminationCalculator />
          </TabPanel>
          
          {/* Illumination Level Tab */}
          <TabPanel value={tabValue} index={4}>
            <IlluminationLevelCalculator />
          </TabPanel>
          
          {/* HVAC Tab */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                HVAC Calculator Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This calculator is under development and will be available in a future update.
              </Typography>
            </Box>
          </TabPanel>
          
          {/* ROI Calculator Tab */}
          <TabPanel value={tabValue} index={6}>
            <ROICalculator />
          </TabPanel>
          
          {/* Power Factor Tab */}
          <TabPanel value={tabValue} index={7}>
            <PowerFactorCalculator />
          </TabPanel>
          
          {/* Harmonic Distortion Tab */}
          <TabPanel value={tabValue} index={8}>
            <HarmonicDistortionCalculator />
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