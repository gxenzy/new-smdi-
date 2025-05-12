import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Lightbulb as LightbulbIcon,
  AcUnit as AcUnitIcon,
  Devices as DevicesIcon,
  Info as InfoIcon,
  WbIncandescent as IlluminationIcon,
  ElectricalServices as ElectricalServicesIcon,
  Waves as WavesIcon,
  HelpOutline as HelpOutlineIcon,
  PictureAsPdf as PdfIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import EnergyCalculator from '../../../../pages/Energy Audit/components/Calculators/EnergyCalculator';
import { generateReport } from '../../../../utils/reportGenerator/pdfGenerator';
import { useSnackbar } from 'notistack';
import IlluminationCalculator from '../Calculators/IlluminationCalculator';
import PowerFactorCalculator from '../Calculators/PowerFactorCalculator';
import HarmonicDistortionCalculator from '../Calculators/HarmonicDistortionCalculator';
import { ScheduleOfLoadsCalculator } from '../Calculators/ScheduleOfLoads';

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

// Quick Start Guide for Lighting Calculator
function LightingQuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Lighting Energy Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you analyze energy consumption and costs for lighting systems in educational buildings.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started (3 Simple Steps)</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter Lighting System Data</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter the number of fixtures, wattage per fixture, and operational hours to establish the base energy usage.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Enter Operational Data</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Specify the operating hours per day, days per year, and current electricity rate for accurate financial analysis.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. Review Results</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                The calculator will display daily and annual energy consumption as well as annual cost based on your inputs.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Tips for Accurate Calculations</Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • Use actual wattage measurements rather than rated values when possible
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Account for ballast factor in fluorescent lighting (typically adds 10-20% to lamp wattage)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Consider actual usage patterns; some areas may not use lighting the entire operational day
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Update electricity rates regularly for accurate financial projections
            </Typography>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Error Help Dialog for Lighting Calculator
function LightingErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: Record<string, string> }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        How to Fix Input Errors
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please review the guidance below to fix input errors in your lighting energy calculation.
          </Typography>
        </Alert>
        
        {Object.keys(errors).length > 0 ? (
          <>
            <Typography variant="h6" gutterBottom>Current Errors</Typography>
            <List>
              {Object.entries(errors).map(([field, message]) => (
                <ListItem key={field} sx={{ py: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="error.main">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <Typography variant="body2">{message}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {field === 'fixtureCount' && 'Enter the number of lighting fixtures in the area.'}
                      {field === 'fixtureWattage' && 'Enter the power rating of each fixture in watts.'}
                      {field === 'hoursPerDay' && 'Enter the number of hours the lights operate per day (1-24).'}
                      {field === 'daysPerYear' && 'Enter the number of days the facility operates per year (1-365).'}
                      {field === 'electricityRate' && 'Enter the cost of electricity per kilowatt-hour.'}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography>No current errors to fix.</Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Field Requirements</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Valid Range</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Fixture Count</TableCell>
                <TableCell>1 - 10,000</TableCell>
                <TableCell>Total number of light fixtures</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fixture Wattage</TableCell>
                <TableCell>1 - 1,000 W</TableCell>
                <TableCell>Power consumption per fixture</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hours per Day</TableCell>
                <TableCell>1 - 24 hours</TableCell>
                <TableCell>Daily operating hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Days per Year</TableCell>
                <TableCell>1 - 365 days</TableCell>
                <TableCell>Annual operating days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Electricity Rate</TableCell>
                <TableCell>1 - 50 PHP/kWh</TableCell>
                <TableCell>Cost per kilowatt-hour</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Lighting Calculator Component
const LightingCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    fixtureCount: '50',
    fixtureWattage: '36',
    hoursPerDay: '8',
    daysPerYear: '260',
    electricityRate: '9.50'
  });
  
  const [results, setResults] = useState<{
    dailyConsumption: number;
    annualConsumption: number;
    annualCost: number;
  } | null>(null);
  
  const [calculating, setCalculating] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    setInputs({
      ...inputs,
      [field]: value
    });
  };
  
  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate fixture count
    if (!inputs.fixtureCount || isNaN(parseFloat(inputs.fixtureCount))) {
      newErrors.fixtureCount = 'Please enter a valid number of fixtures';
    } else if (parseFloat(inputs.fixtureCount) <= 0) {
      newErrors.fixtureCount = 'Fixture count must be greater than 0';
    } else if (parseFloat(inputs.fixtureCount) > 10000) {
      newErrors.fixtureCount = 'Fixture count seems too high. Please verify.';
    }
    
    // Validate fixture wattage
    if (!inputs.fixtureWattage || isNaN(parseFloat(inputs.fixtureWattage))) {
      newErrors.fixtureWattage = 'Please enter a valid wattage value';
    } else if (parseFloat(inputs.fixtureWattage) <= 0) {
      newErrors.fixtureWattage = 'Wattage must be greater than 0';
    } else if (parseFloat(inputs.fixtureWattage) > 1000) {
      newErrors.fixtureWattage = 'Wattage seems too high for a single fixture. Please verify.';
    }
    
    // Validate hours per day
    if (!inputs.hoursPerDay || isNaN(parseFloat(inputs.hoursPerDay))) {
      newErrors.hoursPerDay = 'Please enter valid operating hours';
    } else if (parseFloat(inputs.hoursPerDay) <= 0) {
      newErrors.hoursPerDay = 'Hours must be greater than 0';
    } else if (parseFloat(inputs.hoursPerDay) > 24) {
      newErrors.hoursPerDay = 'Hours per day cannot exceed 24';
    }
    
    // Validate days per year
    if (!inputs.daysPerYear || isNaN(parseFloat(inputs.daysPerYear))) {
      newErrors.daysPerYear = 'Please enter valid operating days';
    } else if (parseFloat(inputs.daysPerYear) <= 0) {
      newErrors.daysPerYear = 'Days must be greater than 0';
    } else if (parseFloat(inputs.daysPerYear) > 365) {
      newErrors.daysPerYear = 'Days per year cannot exceed 365';
    }
    
    // Validate electricity rate
    if (!inputs.electricityRate || isNaN(parseFloat(inputs.electricityRate))) {
      newErrors.electricityRate = 'Please enter a valid electricity rate';
    } else if (parseFloat(inputs.electricityRate) <= 0) {
      newErrors.electricityRate = 'Rate must be greater than 0';
    } else if (parseFloat(inputs.electricityRate) > 50) {
      newErrors.electricityRate = 'Electricity rate seems unusually high. Please verify.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateEnergy = () => {
    if (!validateInputs()) {
      window.scrollTo(0, 0);
      return;
    }
    
    setCalculating(true);
    
    // Simulate a calculation delay for UX
    setTimeout(() => {
    const fixtureCount = parseFloat(inputs.fixtureCount);
    const fixtureWattage = parseFloat(inputs.fixtureWattage);
    const hoursPerDay = parseFloat(inputs.hoursPerDay);
    const daysPerYear = parseFloat(inputs.daysPerYear);
    const electricityRate = parseFloat(inputs.electricityRate);
    
    // Calculate energy consumption
    const dailyConsumption = (fixtureCount * fixtureWattage * hoursPerDay) / 1000; // in kWh
    const annualConsumption = dailyConsumption * daysPerYear; // in kWh/year
    const annualCost = annualConsumption * electricityRate; // in PHP
    
    setResults({
      dailyConsumption,
      annualConsumption,
      annualCost
    });
      
      setCalculating(false);
    }, 800);
  };
  
  const handleExportPdf = async () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate results before generating a report' });
      return;
    }
    
    setCalculating(true);
    
    try {
      // Prepare data for report
      const reportData = {
        fixtureCount: parseFloat(inputs.fixtureCount),
        fixtureWattage: parseFloat(inputs.fixtureWattage),
        hoursPerDay: parseFloat(inputs.hoursPerDay),
        daysPerYear: parseFloat(inputs.daysPerYear),
        electricityRate: parseFloat(inputs.electricityRate),
        dailyConsumption: results.dailyConsumption,
        annualConsumption: results.annualConsumption,
        annualCost: results.annualCost
      };
      
      // Generate and open the report
      const report = await generateReport('lighting', reportData, {
        title: 'Lighting Energy Calculation Report',
        fileName: 'lighting-energy-report.pdf'
      });
      
      report.openInNewTab();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setErrors({ ...errors, general: 'Error generating PDF report' });
    } finally {
      setCalculating(false);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" gutterBottom>Lighting Energy Calculator</Typography>
        <Tooltip title="Quick Start Guide">
          <IconButton onClick={() => setQuickStartOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Calculate energy consumption and costs for lighting systems based on actual fixture data and usage patterns.
        Use this calculator for lighting energy audits in educational buildings.
      </Typography>
      
      {/* Display validation errors */}
      {Object.keys(errors).length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setErrorHelpOpen(true)}
            >
              Help with Errors
            </Button>
          }
        >
          <Typography variant="body2">
            There are input errors that need to be fixed before calculating.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Number of Fixtures"
            type="number"
            fullWidth
            value={inputs.fixtureCount}
            onChange={handleInputChange('fixtureCount')}
            error={!!errors.fixtureCount}
            helperText={errors.fixtureCount || "Total count of light fixtures"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Fixture Wattage (W)"
            type="number"
            fullWidth
            value={inputs.fixtureWattage}
            onChange={handleInputChange('fixtureWattage')}
            error={!!errors.fixtureWattage}
            helperText={errors.fixtureWattage || "Power consumption per fixture in watts"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Hours per Day"
            type="number"
            fullWidth
            value={inputs.hoursPerDay}
            onChange={handleInputChange('hoursPerDay')}
            error={!!errors.hoursPerDay}
            helperText={errors.hoursPerDay || "Operating hours per day"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Days per Year"
            type="number"
            fullWidth
            value={inputs.daysPerYear}
            onChange={handleInputChange('daysPerYear')}
            error={!!errors.daysPerYear}
            helperText={errors.daysPerYear || "Operating days per year"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Electricity Rate (₱/kWh)"
            type="number"
            fullWidth
            value={inputs.electricityRate}
            onChange={handleInputChange('electricityRate')}
            error={!!errors.electricityRate}
            helperText={errors.electricityRate || "Current electricity rate"}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={calculateEnergy}
          startIcon={calculating ? <CircularProgress size={24} color="inherit" /> : <CalculateIcon />}
          disabled={calculating}
      >
          {calculating ? 'Calculating...' : 'Calculate Energy'}
      </Button>
        
        {results && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportPdf}
            startIcon={<PdfIcon />}
            disabled={calculating}
          >
            Export PDF Report
          </Button>
        )}
      </Box>
      
      {results && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Lighting Energy Consumption Results
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Daily Energy Consumption
                </Typography>
                <Typography variant="h6">
                  {results.dailyConsumption.toFixed(2)} kWh/day
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Annual Energy Consumption
                </Typography>
                <Typography variant="h6">
                  {results.annualConsumption.toFixed(2)} kWh/year
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Annual Energy Cost
                </Typography>
                <Typography variant="h6">
                  ₱{results.annualCost.toFixed(2)}/year
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Reference:</strong> Calculation based on PEC 2017 methods for load calculation. 
                  For educational energy audits, consider using power meters to verify actual wattage.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Start Guide Dialog */}
      <LightingQuickStartGuideDialog 
        open={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)} 
      />
      
      {/* Error Help Dialog */}
      <LightingErrorHelpDialog 
        open={errorHelpOpen} 
        onClose={() => setErrorHelpOpen(false)} 
        errors={errors} 
      />
    </Box>
  );
};

// Quick Start Guide for HVAC Calculator
function HVACQuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        HVAC Energy Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you analyze energy consumption and costs for HVAC systems in educational buildings.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started (3 Simple Steps)</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter Space Information</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter the floor area and cooling load per square meter to establish the base cooling requirements.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Enter System Efficiency</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Specify the Coefficient of Performance (COP) of the HVAC system. Higher values indicate better efficiency.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. Enter Operational Data</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter the operating hours, days, and electricity rate to calculate energy costs.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Understanding Key Terms</Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              <strong>Cooling Load (W/m²):</strong> The amount of heat energy that needs to be removed from a space per square meter
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              <strong>Coefficient of Performance (COP):</strong> The ratio of cooling output to energy input. Higher COP means more efficiency
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              <strong>Typical COP values:</strong> Window AC (2.5-3.0), Split-system AC (3.0-4.0), VRF systems (4.0-6.0), Chillers (4.5-7.5)
            </Typography>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Error Help Dialog for HVAC Calculator
function HVACErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: Record<string, string> }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        How to Fix Input Errors
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please review the guidance below to fix input errors in your HVAC energy calculation.
          </Typography>
        </Alert>
        
        {Object.keys(errors).length > 0 ? (
          <>
            <Typography variant="h6" gutterBottom>Current Errors</Typography>
            <List>
              {Object.entries(errors).map(([field, message]) => (
                <ListItem key={field} sx={{ py: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="error.main">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <Typography variant="body2">{message}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {field === 'floorArea' && 'Enter the conditioned floor area in square meters.'}
                      {field === 'coolingLoad' && 'Enter the cooling load per square meter in watts (typically 150-250 W/m² for educational buildings).'}
                      {field === 'cop' && 'Enter the Coefficient of Performance (COP) of the HVAC system (typically 2.5-7.0).'}
                      {field === 'hoursPerDay' && 'Enter the number of hours the HVAC system operates per day (1-24).'}
                      {field === 'daysPerYear' && 'Enter the number of days the HVAC system operates per year (1-365).'}
                      {field === 'electricityRate' && 'Enter the cost of electricity per kilowatt-hour.'}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography>No current errors to fix.</Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Field Requirements</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Valid Range</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Floor Area</TableCell>
                <TableCell>1 - 50,000 m²</TableCell>
                <TableCell>Conditioned floor area</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cooling Load</TableCell>
                <TableCell>50 - 500 W/m²</TableCell>
                <TableCell>Heat load per square meter</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>System COP</TableCell>
                <TableCell>1.0 - 10.0</TableCell>
                <TableCell>Coefficient of Performance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hours per Day</TableCell>
                <TableCell>1 - 24 hours</TableCell>
                <TableCell>Daily operating hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Days per Year</TableCell>
                <TableCell>1 - 365 days</TableCell>
                <TableCell>Annual operating days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// HVAC Calculator Component
const HVACCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    floorArea: '500',
    coolingLoad: '200',
    hoursPerDay: '8',
    daysPerYear: '260',
    electricityRate: '9.50',
    cop: '3.5'
  });
  
  const [results, setResults] = useState<{
    dailyConsumption: number;
    annualConsumption: number;
    annualCost: number;
  } | null>(null);
  
  const [calculating, setCalculating] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    setInputs({
      ...inputs,
      [field]: value
    });
  };
  
  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate floor area
    if (!inputs.floorArea || isNaN(parseFloat(inputs.floorArea))) {
      newErrors.floorArea = 'Please enter a valid floor area';
    } else if (parseFloat(inputs.floorArea) <= 0) {
      newErrors.floorArea = 'Floor area must be greater than 0';
    } else if (parseFloat(inputs.floorArea) > 50000) {
      newErrors.floorArea = 'Floor area seems too large. Please verify.';
    }
    
    // Validate cooling load
    if (!inputs.coolingLoad || isNaN(parseFloat(inputs.coolingLoad))) {
      newErrors.coolingLoad = 'Please enter a valid cooling load value';
    } else if (parseFloat(inputs.coolingLoad) <= 0) {
      newErrors.coolingLoad = 'Cooling load must be greater than 0';
    } else if (parseFloat(inputs.coolingLoad) < 50) {
      newErrors.coolingLoad = 'Cooling load seems too low for a typical building. Typical range is 150-250 W/m².';
    } else if (parseFloat(inputs.coolingLoad) > 500) {
      newErrors.coolingLoad = 'Cooling load seems too high. Please verify.';
    }
    
    // Validate COP
    if (!inputs.cop || isNaN(parseFloat(inputs.cop))) {
      newErrors.cop = 'Please enter a valid COP value';
    } else if (parseFloat(inputs.cop) <= 0) {
      newErrors.cop = 'COP must be greater than 0';
    } else if (parseFloat(inputs.cop) < 1) {
      newErrors.cop = 'COP value is too low. Typical range is 2.5-7.0.';
    } else if (parseFloat(inputs.cop) > 10) {
      newErrors.cop = 'COP value seems too high. Please verify.';
    }
    
    // Validate hours per day
    if (!inputs.hoursPerDay || isNaN(parseFloat(inputs.hoursPerDay))) {
      newErrors.hoursPerDay = 'Please enter valid operating hours';
    } else if (parseFloat(inputs.hoursPerDay) <= 0) {
      newErrors.hoursPerDay = 'Hours must be greater than 0';
    } else if (parseFloat(inputs.hoursPerDay) > 24) {
      newErrors.hoursPerDay = 'Hours per day cannot exceed 24';
    }
    
    // Validate days per year
    if (!inputs.daysPerYear || isNaN(parseFloat(inputs.daysPerYear))) {
      newErrors.daysPerYear = 'Please enter valid operating days';
    } else if (parseFloat(inputs.daysPerYear) <= 0) {
      newErrors.daysPerYear = 'Days must be greater than 0';
    } else if (parseFloat(inputs.daysPerYear) > 365) {
      newErrors.daysPerYear = 'Days per year cannot exceed 365';
    }
    
    // Validate electricity rate
    if (!inputs.electricityRate || isNaN(parseFloat(inputs.electricityRate))) {
      newErrors.electricityRate = 'Please enter a valid electricity rate';
    } else if (parseFloat(inputs.electricityRate) <= 0) {
      newErrors.electricityRate = 'Rate must be greater than 0';
    } else if (parseFloat(inputs.electricityRate) > 50) {
      newErrors.electricityRate = 'Electricity rate seems unusually high. Please verify.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateEnergy = () => {
    if (!validateInputs()) {
      window.scrollTo(0, 0);
      return;
    }
    
    setCalculating(true);
    
    // Simulate a calculation delay for UX
    setTimeout(() => {
    const floorArea = parseFloat(inputs.floorArea);
    const coolingLoad = parseFloat(inputs.coolingLoad); // W/m²
    const hoursPerDay = parseFloat(inputs.hoursPerDay);
    const daysPerYear = parseFloat(inputs.daysPerYear);
    const electricityRate = parseFloat(inputs.electricityRate);
    const cop = parseFloat(inputs.cop); // Coefficient of Performance
    
    // Calculate energy consumption
    const totalLoad = floorArea * coolingLoad; // Watts
    const powerConsumption = totalLoad / cop; // Watts (accounting for COP)
    const dailyConsumption = (powerConsumption * hoursPerDay) / 1000; // kWh/day
    const annualConsumption = dailyConsumption * daysPerYear; // kWh/year
    const annualCost = annualConsumption * electricityRate; // PHP/year
    
    setResults({
      dailyConsumption,
      annualConsumption,
      annualCost
    });
      
      setCalculating(false);
    }, 800);
  };
  
  const handleExportPdf = async () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate results before generating a report' });
      return;
    }
    
    setCalculating(true);
    
    try {
      // Prepare data for report
      const reportData = {
        floorArea: parseFloat(inputs.floorArea),
        coolingLoad: parseFloat(inputs.coolingLoad),
        cop: parseFloat(inputs.cop),
        hoursPerDay: parseFloat(inputs.hoursPerDay),
        daysPerYear: parseFloat(inputs.daysPerYear),
        electricityRate: parseFloat(inputs.electricityRate),
        dailyConsumption: results.dailyConsumption,
        annualConsumption: results.annualConsumption,
        annualCost: results.annualCost
      };
      
      // Generate and open the report
      const report = await generateReport('hvac', reportData, {
        title: 'HVAC Energy Calculation Report',
        fileName: 'hvac-energy-report.pdf'
      });
      
      report.openInNewTab();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setErrors({ ...errors, general: 'Error generating PDF report' });
    } finally {
      setCalculating(false);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" gutterBottom>HVAC Energy Calculator</Typography>
        <Tooltip title="Quick Start Guide">
          <IconButton onClick={() => setQuickStartOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Calculate energy consumption and costs for HVAC systems based on cooling load and efficiency metrics.
        This calculator follows ASHRAE guidelines for educational buildings.
      </Typography>
      
      {/* Display validation errors */}
      {Object.keys(errors).length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setErrorHelpOpen(true)}
            >
              Help with Errors
            </Button>
          }
        >
          <Typography variant="body2">
            There are input errors that need to be fixed before calculating.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Floor Area (m²)"
            type="number"
            fullWidth
            value={inputs.floorArea}
            onChange={handleInputChange('floorArea')}
            error={!!errors.floorArea}
            helperText={errors.floorArea || "Conditioned floor area"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Cooling Load (W/m²)"
            type="number"
            fullWidth
            value={inputs.coolingLoad}
            onChange={handleInputChange('coolingLoad')}
            error={!!errors.coolingLoad}
            helperText={errors.coolingLoad || "Typical range: 150-250 W/m² for educational buildings"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="System COP"
            type="number"
            fullWidth
            value={inputs.cop}
            onChange={handleInputChange('cop')}
            error={!!errors.cop}
            helperText={errors.cop || "Coefficient of Performance (higher is better)"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Hours per Day"
            type="number"
            fullWidth
            value={inputs.hoursPerDay}
            onChange={handleInputChange('hoursPerDay')}
            error={!!errors.hoursPerDay}
            helperText={errors.hoursPerDay || "Operating hours per day"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Days per Year"
            type="number"
            fullWidth
            value={inputs.daysPerYear}
            onChange={handleInputChange('daysPerYear')}
            error={!!errors.daysPerYear}
            helperText={errors.daysPerYear || "Operating days per year"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Electricity Rate (₱/kWh)"
            type="number"
            fullWidth
            value={inputs.electricityRate}
            onChange={handleInputChange('electricityRate')}
            error={!!errors.electricityRate}
            helperText={errors.electricityRate || "Current electricity rate"}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={calculateEnergy}
          startIcon={calculating ? <CircularProgress size={24} color="inherit" /> : <CalculateIcon />}
          disabled={calculating}
      >
          {calculating ? 'Calculating...' : 'Calculate Energy'}
      </Button>
        
        {results && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportPdf}
            startIcon={<PdfIcon />}
            disabled={calculating}
          >
            Export PDF Report
          </Button>
        )}
      </Box>
      
      {results && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              HVAC Energy Consumption Results
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Daily Energy Consumption
                </Typography>
                <Typography variant="h6">
                  {results.dailyConsumption.toFixed(2)} kWh/day
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Annual Energy Consumption
                </Typography>
                <Typography variant="h6">
                  {results.annualConsumption.toFixed(2)} kWh/year
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Annual Energy Cost
                </Typography>
                <Typography variant="h6">
                  ₱{results.annualCost.toFixed(2)}/year
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Reference:</strong> Calculation based on ASHRAE 90.1 methodology. 
                  For educational buildings in the Philippines, cooling loads typically range from 150-250 W/m².
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Start Guide Dialog */}
      <HVACQuickStartGuideDialog 
        open={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)} 
      />
      
      {/* Error Help Dialog */}
      <HVACErrorHelpDialog 
        open={errorHelpOpen} 
        onClose={() => setErrorHelpOpen(false)} 
        errors={errors} 
      />
    </Box>
  );
};

// Quick Start Guide for Equipment Calculator
function EquipmentQuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Equipment Energy Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you track and analyze energy consumption of various equipment in educational facilities.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter Equipment Details</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter the equipment type, quantity, and power rating in watts per unit.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Enter Usage Pattern</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Specify the operating hours per day and days per year for each equipment type.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. Add Multiple Equipment</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Click "Add Equipment" to include each item in your energy analysis. Continue to build a complete equipment list.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">4. Review Summary</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                The calculator will display a comprehensive summary of energy usage and costs for all equipment.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Common Equipment Power Ratings</Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment Type</TableCell>
                <TableCell align="right">Typical Power (W)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Desktop Computer</TableCell>
                <TableCell align="right">65-250 W</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Laptop</TableCell>
                <TableCell align="right">15-60 W</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Projector</TableCell>
                <TableCell align="right">150-350 W</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Printer/Copier</TableCell>
                <TableCell align="right">30-300 W</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Water Dispenser</TableCell>
                <TableCell align="right">100-500 W</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Refrigerator</TableCell>
                <TableCell align="right">150-400 W</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="body2">
          Note: Actual power consumption may vary. For precise calculations, refer to equipment nameplates or use a power meter.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Error Help Dialog for Equipment Calculator
function EquipmentErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: Record<string, string> }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        How to Fix Input Errors
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please review the guidance below to fix input errors in your equipment entry.
          </Typography>
        </Alert>
        
        {Object.keys(errors).length > 0 ? (
          <>
            <Typography variant="h6" gutterBottom>Current Errors</Typography>
            <List>
              {Object.entries(errors).map(([field, message]) => (
                <ListItem key={field} sx={{ py: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="error.main">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <Typography variant="body2">{message}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {field === 'equipmentType' && 'Enter a descriptive name for the equipment (e.g., "Desktop Computer", "Projector").'}
                      {field === 'quantity' && 'Enter the number of identical equipment items.'}
                      {field === 'powerRating' && 'Enter the power consumption per unit in watts.'}
                      {field === 'hoursPerDay' && 'Enter the number of hours the equipment operates per day (1-24).'}
                      {field === 'daysPerYear' && 'Enter the number of days the equipment operates per year (1-365).'}
                      {field === 'electricityRate' && 'Enter the cost of electricity per kilowatt-hour.'}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography>No current errors to fix.</Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Field Requirements</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Valid Range</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Equipment Type</TableCell>
                <TableCell>Non-empty text</TableCell>
                <TableCell>Descriptive name of equipment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quantity</TableCell>
                <TableCell>1 - 10,000</TableCell>
                <TableCell>Number of identical items</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Power Rating</TableCell>
                <TableCell>1 - 10,000 W</TableCell>
                <TableCell>Power consumption per unit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hours per Day</TableCell>
                <TableCell>1 - 24 hours</TableCell>
                <TableCell>Daily operating hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Days per Year</TableCell>
                <TableCell>1 - 365 days</TableCell>
                <TableCell>Annual operating days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Equipment Calculator Component
const EquipmentCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    equipmentType: '',
    quantity: '',
    powerRating: '',
    hoursPerDay: '',
    daysPerYear: '',
    electricityRate: '9.50'
  });
  
  const [equipmentList, setEquipmentList] = useState<Array<{
    type: string;
    quantity: number;
    power: number;
    hours: number;
    days: number;
    dailyConsumption: number;
    annualConsumption: number;
    annualCost: number;
  }>>([]);
  
  const [adding, setAdding] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    setInputs({
      ...inputs,
      [field]: value
    });
  };
  
  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate equipment type
    if (!inputs.equipmentType.trim()) {
      newErrors.equipmentType = 'Please enter an equipment type';
    }
    
    // Validate quantity
    if (!inputs.quantity || isNaN(parseFloat(inputs.quantity))) {
      newErrors.quantity = 'Please enter a valid quantity';
    } else if (parseFloat(inputs.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else if (parseFloat(inputs.quantity) > 10000) {
      newErrors.quantity = 'Quantity seems too high. Please verify.';
    } else if (!Number.isInteger(parseFloat(inputs.quantity))) {
      newErrors.quantity = 'Quantity must be a whole number';
    }
    
    // Validate power rating
    if (!inputs.powerRating || isNaN(parseFloat(inputs.powerRating))) {
      newErrors.powerRating = 'Please enter a valid power rating';
    } else if (parseFloat(inputs.powerRating) <= 0) {
      newErrors.powerRating = 'Power rating must be greater than 0';
    } else if (parseFloat(inputs.powerRating) > 10000) {
      newErrors.powerRating = 'Power rating seems too high for typical equipment. Please verify.';
    }
    
    // Validate hours per day
    if (!inputs.hoursPerDay || isNaN(parseFloat(inputs.hoursPerDay))) {
      newErrors.hoursPerDay = 'Please enter valid operating hours';
    } else if (parseFloat(inputs.hoursPerDay) <= 0) {
      newErrors.hoursPerDay = 'Hours must be greater than 0';
    } else if (parseFloat(inputs.hoursPerDay) > 24) {
      newErrors.hoursPerDay = 'Hours per day cannot exceed 24';
    }
    
    // Validate days per year
    if (!inputs.daysPerYear || isNaN(parseFloat(inputs.daysPerYear))) {
      newErrors.daysPerYear = 'Please enter valid operating days';
    } else if (parseFloat(inputs.daysPerYear) <= 0) {
      newErrors.daysPerYear = 'Days must be greater than 0';
    } else if (parseFloat(inputs.daysPerYear) > 365) {
      newErrors.daysPerYear = 'Days per year cannot exceed 365';
    }
    
    // Validate electricity rate
    if (!inputs.electricityRate || isNaN(parseFloat(inputs.electricityRate))) {
      newErrors.electricityRate = 'Please enter a valid electricity rate';
    } else if (parseFloat(inputs.electricityRate) <= 0) {
      newErrors.electricityRate = 'Rate must be greater than 0';
    } else if (parseFloat(inputs.electricityRate) > 50) {
      newErrors.electricityRate = 'Electricity rate seems unusually high. Please verify.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const addEquipment = () => {
    if (!validateInputs()) {
      window.scrollTo(0, 0);
      return;
    }
    
    setAdding(true);
    
    // Simulate a calculation delay for UX
    setTimeout(() => {
    const quantity = parseFloat(inputs.quantity);
    const powerRating = parseFloat(inputs.powerRating);
    const hoursPerDay = parseFloat(inputs.hoursPerDay);
    const daysPerYear = parseFloat(inputs.daysPerYear);
    const electricityRate = parseFloat(inputs.electricityRate);
    
    // Calculate energy consumption
    const dailyConsumption = (quantity * powerRating * hoursPerDay) / 1000; // kWh/day
    const annualConsumption = dailyConsumption * daysPerYear; // kWh/year
    const annualCost = annualConsumption * electricityRate; // PHP/year
    
    setEquipmentList([
      ...equipmentList,
      {
        type: inputs.equipmentType,
        quantity,
        power: powerRating,
        hours: hoursPerDay,
        days: daysPerYear,
        dailyConsumption,
        annualConsumption,
        annualCost
      }
    ]);
    
    // Reset inputs
    setInputs({
      ...inputs,
      equipmentType: '',
      quantity: '',
      powerRating: '',
      hoursPerDay: '',
      daysPerYear: ''
    });
      
      setAdding(false);
    }, 800);
  };
  
  const calculateTotals = () => {
    const totalDailyConsumption = equipmentList.reduce((sum, item) => sum + item.dailyConsumption, 0);
    const totalAnnualConsumption = equipmentList.reduce((sum, item) => sum + item.annualConsumption, 0);
    const totalAnnualCost = equipmentList.reduce((sum, item) => sum + item.annualCost, 0);
    
    return {
      totalDailyConsumption,
      totalAnnualConsumption,
      totalAnnualCost
    };
  };
  
  const handleExportPdf = async () => {
    if (equipmentList.length === 0) {
      setErrors({ ...errors, general: 'Please add at least one equipment before generating a report' });
      return;
    }
    
    setAdding(true);
    
    try {
      // Prepare data for report
      const summary = calculateTotals();
      const reportData = {
        equipmentList: equipmentList,
        summary: summary,
        electricityRate: parseFloat(inputs.electricityRate)
      };
      
      // Generate and open the report
      const report = await generateReport('equipment', reportData, {
        title: 'Equipment Energy Calculation Report',
        fileName: 'equipment-energy-report.pdf',
        orientation: 'landscape'
      });
      
      report.openInNewTab();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setErrors({ ...errors, general: 'Error generating PDF report' });
    } finally {
      setAdding(false);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" gutterBottom>Equipment Energy Calculator</Typography>
        <Tooltip title="Quick Start Guide">
          <IconButton onClick={() => setQuickStartOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Calculate energy consumption for various equipment types in educational facilities.
        Add each type of equipment to generate a complete energy profile.
      </Typography>
      
      {/* Display validation errors */}
      {Object.keys(errors).length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setErrorHelpOpen(true)}
            >
              Help with Errors
            </Button>
          }
        >
          <Typography variant="body2">
            There are input errors that need to be fixed before adding equipment.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Equipment Type"
            fullWidth
            value={inputs.equipmentType}
            onChange={handleInputChange('equipmentType')}
            error={!!errors.equipmentType}
            helperText={errors.equipmentType || "e.g., Computers, Projectors, etc."}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={inputs.quantity}
            onChange={handleInputChange('quantity')}
            error={!!errors.quantity}
            helperText={errors.quantity || "Number of equipment units"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Power Rating (W)"
            type="number"
            fullWidth
            value={inputs.powerRating}
            onChange={handleInputChange('powerRating')}
            error={!!errors.powerRating}
            helperText={errors.powerRating || "Watts per unit"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Hours per Day"
            type="number"
            fullWidth
            value={inputs.hoursPerDay}
            onChange={handleInputChange('hoursPerDay')}
            error={!!errors.hoursPerDay}
            helperText={errors.hoursPerDay || "Operating hours per day"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Days per Year"
            type="number"
            fullWidth
            value={inputs.daysPerYear}
            onChange={handleInputChange('daysPerYear')}
            error={!!errors.daysPerYear}
            helperText={errors.daysPerYear || "Operating days per year"}
          />
        </Grid>
      </Grid>
      
      <Button
        variant="contained"
        color="primary"
        onClick={addEquipment}
        startIcon={adding ? <CircularProgress size={24} color="inherit" /> : <DevicesIcon />}
        disabled={adding || !inputs.equipmentType || !inputs.quantity || !inputs.powerRating || !inputs.hoursPerDay || !inputs.daysPerYear}
        sx={{ mt: 2 }}
      >
        {adding ? 'Adding...' : 'Add Equipment'}
      </Button>
      
      {equipmentList.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Equipment Energy Summary
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Equipment Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Power (W)</TableCell>
                  <TableCell align="right">Daily Usage (h)</TableCell>
                  <TableCell align="right">Daily Energy (kWh)</TableCell>
                  <TableCell align="right">Annual Energy (kWh)</TableCell>
                  <TableCell align="right">Annual Cost (₱)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.power}</TableCell>
                    <TableCell align="right">{item.hours}</TableCell>
                    <TableCell align="right">{item.dailyConsumption.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.annualConsumption.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.annualCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right"><strong>Totals:</strong></TableCell>
                  <TableCell align="right"><strong>{calculateTotals().totalDailyConsumption.toFixed(2)}</strong></TableCell>
                  <TableCell align="right"><strong>{calculateTotals().totalAnnualConsumption.toFixed(2)}</strong></TableCell>
                  <TableCell align="right"><strong>₱{calculateTotals().totalAnnualCost.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportPdf}
              startIcon={<PdfIcon />}
              disabled={adding}
            >
              Export PDF Report
            </Button>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Reference:</strong> Equipment power ratings should be verified from nameplate data or manufacturer specifications.
                For educational energy audits, consider diversity and utilization factors.
              </Typography>
            </Alert>
          </Box>
        </Box>
      )}
      
      {/* Quick Start Guide Dialog */}
      <EquipmentQuickStartGuideDialog 
        open={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)} 
      />
      
      {/* Error Help Dialog */}
      <EquipmentErrorHelpDialog 
        open={errorHelpOpen} 
        onClose={() => setErrorHelpOpen(false)} 
        errors={errors} 
      />
    </Box>
  );
};

// Main BasicEnergyCalculator Component
const BasicEnergyCalculator: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Energy Consumption Calculators</Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Educational tools for calculating energy consumption in building systems based on industry standards
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="energy calculator tabs"
        >
          <Tab icon={<LightbulbIcon />} label="Lighting" {...a11yProps(0)} />
          <Tab icon={<AcUnitIcon />} label="HVAC" {...a11yProps(1)} />
          <Tab icon={<DevicesIcon />} label="Equipment" {...a11yProps(2)} />
          <Tab icon={<IlluminationIcon />} label="Illumination" {...a11yProps(3)} />
          <Tab icon={<ElectricalServicesIcon />} label="Power Factor" {...a11yProps(4)} />
          <Tab icon={<WavesIcon />} label="Harmonic Distortion" {...a11yProps(5)} />
          <Tab icon={<ViewListIcon />} label="Schedule of Loads" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <LightingCalculator />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <HVACCalculator />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <EquipmentCalculator />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <IlluminationCalculator />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <PowerFactorCalculator onSave={(result: any) => {
            // Handle power factor calculation result
            // Add functionality to show success notification or handle savedData
            enqueueSnackbar?.('Power factor calculation saved', { variant: 'success' });
          }} onExportPdf={async (data: any) => {
            try {
              // Generate and open the report
              const report = await generateReport('power-factor', data, {
                title: 'Power Factor Analysis Report',
                fileName: 'power-factor-report.pdf'
              });
              
              report.openInNewTab();
              enqueueSnackbar?.('PDF report generated successfully', { variant: 'success' });
            } catch (error) {
              console.error('Error generating PDF report:', error);
              enqueueSnackbar?.('Error generating PDF report', { variant: 'error' });
            }
          }} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <HarmonicDistortionCalculator onSave={(result: any) => {
            // Handle harmonic distortion calculation result
            // Add functionality to show success notification or handle savedData
            enqueueSnackbar?.('Harmonic distortion calculation saved', { variant: 'success' });
          }} onExportPdf={async (data: any) => {
            try {
              // Generate and open the report
              const report = await generateReport('harmonic-distortion', data, {
                title: 'Harmonic Distortion Analysis Report',
                fileName: 'harmonic-distortion-report.pdf',
                orientation: 'landscape'
              });
              
              report.openInNewTab();
              enqueueSnackbar?.('PDF report generated successfully', { variant: 'success' });
            } catch (error) {
              console.error('Error generating PDF report:', error);
              enqueueSnackbar?.('Error generating PDF report', { variant: 'error' });
            }
          }} />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <ScheduleOfLoadsCalculator onSave={(result: any) => {
            // Handle schedule of loads calculation result
            enqueueSnackbar?.('Schedule of Loads saved', { variant: 'success' });
          }} onExportPdf={async (data: any) => {
            try {
              // Generate and open the report
              const report = await generateReport('schedule-of-loads', data, {
                title: 'Schedule of Loads Report',
                fileName: 'schedule-of-loads-report.pdf',
                orientation: 'landscape'
              });
              
              report.openInNewTab();
              enqueueSnackbar?.('PDF report generated successfully', { variant: 'success' });
            } catch (error) {
              console.error('Error generating PDF report:', error);
              enqueueSnackbar?.('Error generating PDF report', { variant: 'error' });
            }
          }} />
        </TabPanel>
      </Paper>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Educational Notes
          </Typography>
          <Typography variant="body2" paragraph>
            These calculators are designed for educational purposes to help students understand energy consumption patterns
            and power quality in building systems. The calculations follow industry-standard methodologies from:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Lighting</Typography>
              <Typography variant="body2">
                • PEC 2017 Section 4.6<br />
                • IES Lighting Handbook<br />
                • DOE Lighting Guidelines
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">HVAC</Typography>
              <Typography variant="body2">
                • ASHRAE 90.1-2019<br />
                • ASHRAE Fundamentals<br />
                • ACCA Manual J
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Equipment</Typography>
              <Typography variant="body2">
                • IEEE 739-1995<br />
                • ASHRAE Advanced Energy Design Guides<br />
                • DOE Building Energy Data Book
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Illumination</Typography>
              <Typography variant="body2">
                • PEC 2017 Rule 1075<br />
                • IES Lighting Handbook<br />
                • Philippine Lighting Code
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Power Factor</Typography>
              <Typography variant="body2">
                • PEC 2017 Section 4.30<br />
                • IEEE 1459-2010<br />
                • Power Quality Standards
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Harmonic Distortion</Typography>
              <Typography variant="body2">
                • IEEE 519-2014<br />
                • IEC 61000-3-2<br />
                • Philippine Distribution Code
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2">Schedule of Loads</Typography>
              <Typography variant="body2">
                • PEC 2017 Section 2.4<br />
                • IEEE 241-1990<br />
                • Philippine Distribution Code
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BasicEnergyCalculator; 