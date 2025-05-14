import React, { useState, useEffect } from 'react';
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
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
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
  ViewList as ViewListIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ErrorOutline as ErrorOutlineIcon,
  Save as SaveIcon,
  LooksOne as LooksOneIcon,
  LooksTwo as LooksTwoIcon,
  Looks3 as Looks3Icon,
  Looks4 as Looks4Icon,
  MenuBook as MenuBookIcon,
  VerifiedUser as VerifiedUserIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import EnergyCalculator from '../../../../pages/Energy Audit/components/Calculators/EnergyCalculator';
import { generateReport } from '../../../../utils/reportGenerator/pdfGenerator';
import { useSnackbar } from 'notistack';
import IlluminationCalculator from '../Calculators/IlluminationCalculator';
import PowerFactorCalculator from '../Calculators/PowerFactorCalculator';
import HarmonicDistortionCalculator from '../Calculators/HarmonicDistortionCalculator';
import ScheduleOfLoadsCalculator from '../Calculators/ScheduleOfLoads';
import SavedCalculationsViewer from '../Calculators/SavedCalculationsViewer';
import { saveCalculation } from '../Calculators/utils/storage';
import ComplianceCalculatorIntegration from '../Calculators/ComplianceCalculatorIntegration';
import ComplianceApiTest from '../Calculators/ComplianceApiTest';

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
    fixtureCount: '10',
    fixtureWattage: '36',
    hoursPerDay: '8',
    daysPerYear: '250',
    electricityRate: '10.50'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{
    dailyConsumption: number;
    annualConsumption: number;
    annualCost: number;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [calculationName, setCalculationName] = useState('');
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState(false);
  const [standardsInfo, setStandardsInfo] = useState(false);
  
  const { enqueueSnackbar } = useSnackbar();
  
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
  
  const handleSaveCalculation = () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate results before saving' });
      return;
    }
    
    const calculationData = {
      fixtureCount: parseFloat(inputs.fixtureCount),
      fixtureWattage: parseFloat(inputs.fixtureWattage),
      hoursPerDay: parseFloat(inputs.hoursPerDay),
      daysPerYear: parseFloat(inputs.daysPerYear),
      electricityRate: parseFloat(inputs.electricityRate),
      dailyConsumption: results.dailyConsumption,
      annualConsumption: results.annualConsumption,
      annualCost: results.annualCost
    };
    
    // Create a descriptive default name if none is provided
    const defaultName = `Lighting Calculation - ${inputs.fixtureCount} fixtures at ${inputs.fixtureWattage}W - ${new Date().toLocaleDateString()}`;
    
    // Save calculation using the correct function signature
    const uniqueId = saveCalculation('lighting', calculationName || defaultName, calculationData);
    
    enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
    setSaveDialogOpen(false);
    setCalculationName(''); // Reset the calculation name for next save
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <SavedCalculationsViewer 
            calculationType="lighting"
            onLoadCalculation={(data) => {
              if (data) {
                setInputs({
                  fixtureCount: data.fixtureCount.toString(),
                  fixtureWattage: data.fixtureWattage.toString(),
                  hoursPerDay: data.hoursPerDay.toString(),
                  daysPerYear: data.daysPerYear.toString(),
                  electricityRate: data.electricityRate.toString()
                });
                setResults({
                  dailyConsumption: data.dailyConsumption,
                  annualConsumption: data.annualConsumption,
                  annualCost: data.annualCost
                });
              }
            }}
          />
          <Tooltip title="Learn more about PEC 2017 Lighting Requirements">
            <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=PEC-2017&section=4.6'}>
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="About Lighting Energy Calculation">
            <IconButton onClick={() => setStandardsInfo(!standardsInfo)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {standardsInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            PEC 2017 Lighting Energy Requirements
          </Typography>
          <Typography variant="body2">
            The Philippine Electrical Code (PEC) 2017 provides guidelines for energy-efficient lighting design and installation. 
            This calculator helps estimate energy consumption based on fixture specifications and usage patterns.
          </Typography>
        </Alert>
      )}
      
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
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setSaveDialogOpen(true)}
              startIcon={<SaveIcon />}
              sx={{ mr: 1 }}
              disabled={calculating}
            >
              Save Calculation
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportPdf}
              startIcon={<PdfIcon />}
              disabled={calculating}
            >
              Export PDF Report
            </Button>
          </Box>
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
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCalculation} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
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
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [calculationName, setCalculationName] = useState<string>('HVAC Calculation');
  const { enqueueSnackbar } = useSnackbar();
  
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
  
  const handleSaveCalculation = () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate results before saving' });
      return;
    }
    
    const calculationData = {
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
    
    // Create a descriptive default name if none is provided
    const defaultName = `HVAC Calculation - ${inputs.floorArea}m² at COP ${inputs.cop} - ${new Date().toLocaleDateString()}`;
    
    // Save calculation using the correct function signature
    const uniqueId = saveCalculation('hvac', calculationName || defaultName, calculationData);
    
    enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
    setSaveDialogOpen(false);
    setCalculationName(''); // Reset the calculation name for next save
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <SavedCalculationsViewer 
            calculationType="hvac"
            onLoadCalculation={(data) => {
              if (data) {
                setInputs({
                  floorArea: data.floorArea.toString(),
                  coolingLoad: data.coolingLoad.toString(),
                  hoursPerDay: data.hoursPerDay.toString(),
                  daysPerYear: data.daysPerYear.toString(),
                  electricityRate: data.electricityRate.toString(),
                  cop: data.cop.toString()
                });
                setResults({
                  dailyConsumption: data.dailyConsumption,
                  annualConsumption: data.annualConsumption,
                  annualCost: data.annualCost
                });
              }
            }}
          />
          <Tooltip title="Learn more about ASHRAE 90.1 HVAC Standards">
            <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=ASHRAE-90.1&section=6.5'}>
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Calculate energy consumption for HVAC systems based on floor area, cooling load, and system efficiency.
        This calculator helps estimate HVAC energy usage in educational facilities.
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
            helperText={errors.floorArea || "Total conditioned floor area"}
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
            helperText={errors.coolingLoad || "Typical range: 150-250 W/m²"}
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
            helperText={errors.cop || "Coefficient of Performance"}
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
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setSaveDialogOpen(true)}
              startIcon={<SaveIcon />}
              sx={{ mr: 1 }}
              disabled={calculating}
            >
              Save Calculation
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportPdf}
              startIcon={<PdfIcon />}
              disabled={calculating}
            >
              Export PDF Report
            </Button>
          </Box>
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
                  <strong>Reference:</strong> Calculation based on ASHRAE methods. 
                  Energy consumption will vary based on climate, building envelope, internal loads, and system operation.
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
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCalculation} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to get user-friendly field labels for error messages
const getFieldLabel = (field: string): string => {
  const fieldLabels: Record<string, string> = {
    equipmentType: 'Equipment Type',
    quantity: 'Quantity',
    powerRating: 'Power Rating',
    hoursPerDay: 'Hours per Day',
    daysPerYear: 'Days per Year',
    electricityRate: 'Electricity Rate',
    general: 'General Error'
  };
  
  return fieldLabels[field] || field;
};

// Equipment Quick Start Guide Dialog
function EquipmentQuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} scroll="paper" maxWidth="md">
      <DialogTitle>
        <Typography variant="h6">
          Equipment Energy Calculator Quick Start Guide
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          This calculator helps you analyze energy consumption and costs for various equipment in educational buildings.
        </Typography>
        <Typography variant="body2" paragraph>
          Follow these steps to use the calculator effectively:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <LooksOneIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Enter Equipment Details"
              secondary="Specify the equipment type, quantity, and power rating in watts."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LooksTwoIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Enter Usage Pattern"
              secondary="Specify how many hours per day and days per year the equipment operates."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Looks3Icon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Add Equipment"
              secondary="Click 'Add Equipment' to add the item to your energy analysis."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Looks4Icon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Generate Reports"
              secondary="Use the 'Export PDF Report' button to create a detailed report of your energy analysis."
            />
          </ListItem>
        </List>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Technical References:
          </Typography>
          <Typography variant="body2">
            • IEEE 739-1995 (Bronze Book)<br />
            • ASHRAE Advanced Energy Design Guide for Educational Buildings<br />
            • DOE Building Energy Data Book
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Error Help Dialog for Equipment Calculator
function EquipmentErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: Record<string, string> }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>
        <Typography variant="subtitle1">
          Input Error Help
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          Please review the guidance below to fix input errors in your equipment energy calculation.
        </Typography>
        <List dense>
          {Object.entries(errors).map(([field, message]) => (
            <ListItem key={field} sx={{ py: 1 }}>
              <ListItemIcon>
                <ErrorOutlineIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={field === 'general' ? 'General Error' : field === 'equipmentType' ? 'Equipment Type' : 
                         field === 'quantity' ? 'Quantity' : field === 'powerRating' ? 'Power Rating' :
                         field === 'hoursPerDay' ? 'Hours per Day' : field === 'daysPerYear' ? 'Days per Year' :
                         field === 'electricityRate' ? 'Electricity Rate' : field}
                secondary={message}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Input Guidelines:
          </Typography>
          <Typography variant="body2" paragraph>
            {Object.keys(errors).map((field) => (
              <React.Fragment key={field}>
                {field === 'equipmentType' && 'Enter a descriptive name for the equipment type.'}
                {field === 'quantity' && 'Enter a positive number for the quantity of equipment units (1-1000).'}
                {field === 'powerRating' && 'Enter the power consumption in watts (1-10000).'}
                {field === 'hoursPerDay' && 'Enter the number of hours the equipment operates per day (1-24).'}
                {field === 'daysPerYear' && 'Enter the number of days the equipment operates per year (1-365).'}
                {field === 'electricityRate' && 'Enter a valid electricity rate in ₱/kWh (typically 8-12).'}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Equipment Calculator Component
const EquipmentCalculator: React.FC = () => {
  // Define equipment item type
  type EquipmentItem = {
    type: string;
    quantity: number;
    power: number;
    hours: number;
    days: number;
    dailyConsumption: number;
    annualConsumption: number;
    annualCost: number;
  };

  const [inputs, setInputs] = useState({
    equipmentType: '',
    quantity: '1',
    powerRating: '100',
    hoursPerDay: '8',
    daysPerYear: '200',
    electricityRate: '9.50'
  });
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [calculationName, setCalculationName] = useState<string>('Equipment Energy Calculation');
  
  const { enqueueSnackbar } = useSnackbar();
  
  // Input change handler
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
    } else if (parseFloat(inputs.quantity) > 1000) {
      newErrors.quantity = 'Quantity seems too large. Please verify.';
    }
    
    // Validate power rating
    if (!inputs.powerRating || isNaN(parseFloat(inputs.powerRating))) {
      newErrors.powerRating = 'Please enter a valid power rating';
    } else if (parseFloat(inputs.powerRating) <= 0) {
      newErrors.powerRating = 'Power rating must be greater than 0';
    } else if (parseFloat(inputs.powerRating) > 10000) {
      newErrors.powerRating = 'Power rating seems too high. Please verify.';
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
  
  // Add equipment to list
  const addEquipment = () => {
    if (!validateInputs()) {
      window.scrollTo(0, 0);
      return;
    }
    
    setAdding(true);
    
    // Simulate a calculation delay for UX
    setTimeout(() => {
      const quantity = parseFloat(inputs.quantity);
      const powerRating = parseFloat(inputs.powerRating); // W
      const hoursPerDay = parseFloat(inputs.hoursPerDay);
      const daysPerYear = parseFloat(inputs.daysPerYear);
      const electricityRate = parseFloat(inputs.electricityRate);
      
      // Calculate energy consumption
      const totalPower = quantity * powerRating; // Watts
      const dailyConsumption = (totalPower * hoursPerDay) / 1000; // kWh/day
      const annualConsumption = dailyConsumption * daysPerYear; // kWh/year
      const annualCost = annualConsumption * electricityRate; // PHP/year
      
      const newEquipment: EquipmentItem = {
        type: inputs.equipmentType,
        quantity,
        power: powerRating,
        hours: hoursPerDay,
        days: daysPerYear,
        dailyConsumption,
        annualConsumption,
        annualCost
      };
      
      setEquipmentList([...equipmentList, newEquipment]);
      
      // Reset equipment type field but keep other settings
      setInputs({
        ...inputs,
        equipmentType: ''
      });
      
      enqueueSnackbar('Equipment added successfully', { variant: 'success' });
      setAdding(false);
    }, 600);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalDailyConsumption = equipmentList.reduce((acc, item) => acc + item.dailyConsumption, 0);
    const totalAnnualConsumption = equipmentList.reduce((acc, item) => acc + item.annualConsumption, 0);
    const totalAnnualCost = equipmentList.reduce((acc, item) => acc + item.annualCost, 0);
    
    return {
      totalDailyConsumption,
      totalAnnualConsumption,
      totalAnnualCost
    };
  };
  
  // Handle save calculation
  const handleSaveCalculation = () => {
    try {
      if (equipmentList.length === 0) {
        enqueueSnackbar('Please add at least one equipment item before saving', { variant: 'error' });
        return;
      }

      // Prepare calculation data
      const calculationData = {
        equipmentList: equipmentList,
        summary: calculateTotals(),
        electricityRate: parseFloat(inputs.electricityRate)
      };

      // Create a descriptive default name if none is provided
      const defaultName = `Equipment Energy Calculation - ${equipmentList.length} items - ${new Date().toLocaleDateString()}`;

      // Save calculation
      const uniqueId = saveCalculation('equipment', calculationName || defaultName, calculationData);

      enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
      setSaveDialogOpen(false);
      setCalculationName('');
    } catch (error) {
      console.error('Error saving calculation:', error);
      enqueueSnackbar('Error saving calculation', { variant: 'error' });
    }
  };
  
  // Handle export PDF
  const handleExportPdf = async () => {
    if (equipmentList.length === 0) {
      setErrors({ general: 'Please add at least one equipment item before generating a report' });
      return;
    }
    
    setAdding(true);
    
    try {
      // Get the totals
      const totals = calculateTotals();
      
      // Create properly formatted equipment list for PDF generation
      const formattedEquipmentList = equipmentList.map(item => ({
        name: item.type,
        quantity: item.quantity,
        wattage: item.power,
        hoursPerDay: item.hours,
        daysPerYear: item.days,
        dailyConsumption: item.dailyConsumption,
        annualConsumption: item.annualConsumption,
        annualCost: item.annualCost
      }));
      
      // Generate and open the report
      const report = await generateReport('equipment', {
        equipmentList: formattedEquipmentList,
        summary: totals,
        electricityRate: parseFloat(inputs.electricityRate)
      }, {
        title: 'Equipment Energy Analysis Report',
        fileName: 'equipment-energy-report.pdf'
      });
      
      report.openInNewTab();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setErrors({ general: 'Error generating PDF report' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>Equipment Energy Calculator</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <SavedCalculationsViewer 
            calculationType="equipment"
            onLoadCalculation={(data) => {
              if (data && data.equipmentList) {
                setEquipmentList(data.equipmentList);
                enqueueSnackbar('Equipment calculation loaded successfully', { variant: 'success' });
              }
            }}
          />
          <Tooltip title="Learn more about IEEE 739 Equipment Energy Standards">
            <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=IEEE-739&section=5.4'}>
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
              onClick={() => setSaveDialogOpen(true)}
              startIcon={<SaveIcon />}
              sx={{ mr: 1 }}
              disabled={adding}
            >
              Save Calculation
            </Button>
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
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCalculation} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="calculator tabs"
        >
          <Tab 
            icon={<LightbulbIcon />} 
            label="Lighting" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<AcUnitIcon />}
            label="HVAC" 
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<DevicesIcon />} 
            label="Equipment" 
            {...a11yProps(2)} 
          />
          <Tab 
            icon={<IlluminationIcon />} 
            label="Illumination Calculator" 
            {...a11yProps(3)} 
          />
          <Tab 
            icon={<ElectricalServicesIcon />} 
            label="Power Factor" 
            {...a11yProps(4)} 
          />
          <Tab 
            icon={<WavesIcon />} 
            label="Harmonic Distortion" 
            {...a11yProps(5)} 
          />
          <Tab 
            icon={<ViewListIcon />} 
            label="Schedule of Loads" 
            {...a11yProps(6)} 
          />
          <Tab 
            icon={<ViewListIcon />} 
            label="Saved Calculations" 
            {...a11yProps(7)} 
          />
          <Tab 
            icon={<VerifiedUserIcon />} 
            label="Compliance Verification" 
            {...a11yProps(8)} 
          />
          <Tab 
            icon={<CodeIcon />} 
            label="Compliance API Test" 
            {...a11yProps(9)} 
          />
        </Tabs>
      </Box>

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

      <TabPanel value={tabValue} index={7}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Saved Calculations</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            View and load your previously saved calculations. Select any calculation to load it into the appropriate calculator.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Lighting Calculations</Typography>
              <SavedCalculationsViewer 
                calculationType="lighting"
                onLoadCalculation={(data) => {
                  if (data) {
                    // Switch to lighting calculator tab and pass data
                    setTabValue(0);
                    enqueueSnackbar('Lighting calculation loaded. Switched to Lighting calculator.', { variant: 'success' });
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>HVAC Calculations</Typography>
              <SavedCalculationsViewer 
                calculationType="hvac"
                onLoadCalculation={(data) => {
                  if (data) {
                    // Switch to HVAC calculator tab and pass data
                    setTabValue(1);
                    enqueueSnackbar('HVAC calculation loaded. Switched to HVAC calculator.', { variant: 'success' });
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Equipment Calculations</Typography>
              <SavedCalculationsViewer 
                calculationType="equipment"
                onLoadCalculation={(data) => {
                  if (data) {
                    // Switch to Equipment calculator tab and pass data
                    setTabValue(2);
                    enqueueSnackbar('Equipment calculation loaded. Switched to Equipment calculator.', { variant: 'success' });
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Other Calculations</Typography>
              <SavedCalculationsViewer 
                calculationType="all"
                onLoadCalculation={(data) => {
                  if (data) {
                    // Switch to appropriate calculator tab based on type
                    const tabIndex = data.type === 'power_factor' ? 4 : 
                                     data.type === 'harmonic_distortion' ? 5 :
                                     data.type === 'schedule_of_loads' ? 6 : 3;
                    setTabValue(tabIndex);
                    enqueueSnackbar(`${data.name} loaded. Switched to appropriate calculator.`, { variant: 'success' });
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={8}>
        <ComplianceCalculatorIntegration />
      </TabPanel>

      <TabPanel value={tabValue} index={9}>
        <ComplianceApiTest />
      </TabPanel>
    </Box>
  );
};

export default BasicEnergyCalculator; 