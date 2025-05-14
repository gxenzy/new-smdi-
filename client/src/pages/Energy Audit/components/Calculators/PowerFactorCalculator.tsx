import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SavedCalculationsViewer from './SavedCalculationsViewer';
import { saveCalculation } from './utils/storage';
import StandardValueSelector from '../../../../components/StandardsReference/StandardValueSelector';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface PowerFactorCalculatorProps {
  onSave?: (data: PowerFactorCalculationResult) => void;
  onExportPdf?: (data: PowerFactorCalculationResult) => Promise<void>;
}

// Define interfaces for calculation inputs and results
interface PowerFactorCalculationInputs {
  voltage: string;
  current: string;
  activePower: string;
  measurementMethod: 'direct' | 'calculated';
  connectionType: 'single-phase' | 'three-phase';
  targetPowerFactor: string;
  operatingHours: string;
  electricityRate: string;
}

interface PowerFactorCalculationResult {
  apparentPower: number;
  reactivePower: number;
  calculatedPowerFactor: number;
  requiredCapacitance: number;
  annualSavings: number;
  paybackPeriod: number;
  complianceStatus: 'compliant' | 'non-compliant';
  recommendations: string[];
  timestamp: number;
}

// Define Tab Panel component
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
      id={`pf-tab-${index}`}
      aria-labelledby={`pf-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Sample installation types
const installationTypes = [
  { value: 'educational', label: 'Educational Facility', minPowerFactor: 0.85 },
  { value: 'industrial', label: 'Industrial Building', minPowerFactor: 0.90 },
  { value: 'commercial', label: 'Commercial Building', minPowerFactor: 0.85 },
  { value: 'hospital', label: 'Hospital', minPowerFactor: 0.90 },
  { value: 'office', label: 'Office Building', minPowerFactor: 0.85 },
];

// Add ErrorHelpDialog component
function ErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: Record<string, string> }) {
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
            Please review the guidance below to fix input errors. Each field has specific requirements based on PEC 2017 Section 4.30 standards.
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
                      {getFieldLabel(field)}
                    </Typography>
                    <Typography variant="body2">{message}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {getFieldGuidance(field)}
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
                <TableCell>Voltage</TableCell>
                <TableCell>1 - 35,000 V</TableCell>
                <TableCell>Measured system voltage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Current</TableCell>
                <TableCell>0.1 - 10,000 A</TableCell>
                <TableCell>Measured system current</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Active Power</TableCell>
                <TableCell>1 - 1,000,000 W</TableCell>
                <TableCell>Measured real power (watts)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Power Factor</TableCell>
                <TableCell>0.1 - 1.0</TableCell>
                <TableCell>When directly entered</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Target Power Factor</TableCell>
                <TableCell>0.85 - 1.0</TableCell>
                <TableCell>Desired power factor after correction</TableCell>
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

// Add QuickStartGuideDialog component
function QuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Power Factor Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you analyze power factor and determine correction requirements according to PEC 2017 Section 4.30 standards.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started (3 Simple Steps)</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter Power Measurements (Tab 1)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter voltage, current, and power data from your measurements. You can either enter the power factor directly or have it calculated from your input values.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Set System Information (Tab 2)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Select installation type, set target power factor, and enter operating hours and electricity rate for financial analysis.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. View Results (Tab 3)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                After clicking "Calculate," the results will show power factor analysis, compliance status, and correction recommendations.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Understanding PEC 2017 Section 4.30</Typography>
        
        <Typography variant="body2" paragraph>
          PEC 2017 Section 4.30 requires a minimum power factor of:
        </Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • <strong>0.85</strong> for most installations (educational, commercial, office buildings)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • <strong>0.90</strong> for industrial buildings and hospitals
            </Typography>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Tips for Accurate Calculations</Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • Use true RMS meters for all measurements
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • For three-phase systems, ensure balanced loading across phases
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Target power factor is typically set to 0.95 for optimal performance
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Include all operating hours when calculating financial benefits
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

// Helper functions for field labels and guidance
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    voltage: 'Voltage',
    current: 'Current',
    activePower: 'Active Power',
    powerFactor: 'Power Factor',
    targetPowerFactor: 'Target Power Factor',
    operatingHours: 'Operating Hours',
    electricityRate: 'Electricity Rate',
    installationType: 'Installation Type',
    connectionType: 'Connection Type',
    inputMethod: 'Input Method'
  };
  
  return labels[field] || field;
}

function getFieldGuidance(field: string): string {
  const guidance: Record<string, string> = {
    voltage: 'Enter the measured RMS voltage. Typical values: 120V, 208V, 240V, 480V for common systems.',
    current: 'Enter the measured RMS current in amperes.',
    activePower: 'Enter the measured active power in watts (W) from a wattmeter reading.',
    powerFactor: 'Enter as a decimal between 0.1 and 1.0. Most loads have power factor between 0.7 and 0.9.',
    targetPowerFactor: 'Recommended value is 0.95. Must be higher than existing power factor and at least 0.85.',
    operatingHours: 'Enter annual operating hours for financial calculations. Typical values: 2000-8760 hours.',
    electricityRate: 'Enter the cost per kWh. Typical values range from $0.08 to $0.25 per kWh.',
    installationType: 'Select the type of installation to determine the minimum required power factor.',
    connectionType: 'Select single-phase for residential/small commercial or three-phase for larger systems.',
    inputMethod: 'Select whether to enter power factor directly or calculate it from measurements.'
  };
  
  return guidance[field] || 'Enter a valid value.';
}

const PowerFactorCalculator: React.FC<PowerFactorCalculatorProps> = ({ onSave, onExportPdf }) => {
  // State for inputs, results, and UI
  const [inputs, setInputs] = useState<PowerFactorCalculationInputs>({
    voltage: '230',
    current: '50',
    activePower: '9000',
    measurementMethod: 'direct',
    connectionType: 'single-phase',
    targetPowerFactor: '0.95',
    operatingHours: '2500',
    electricityRate: '9.50'
  });
  
  const [installationType, setInstallationType] = useState<string>('educational');
  const [results, setResults] = useState<PowerFactorCalculationResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [standardsInfo, setStandardsInfo] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [calculationName, setCalculationName] = useState<string>('');
  
  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof PowerFactorCalculationInputs | 'general', string>>>({});
  
  // Add new states for dialogs
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  
  const { enqueueSnackbar } = useSnackbar();
  
  // Handle input changes
  const handleInputChange = (field: keyof PowerFactorCalculationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle dropdown changes
  const handleSelectChange = (field: keyof PowerFactorCalculationInputs) => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as string;
    
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle installation type change
  const handleInstallationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstallationType(event.target.value);
  };
  
  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: Partial<Record<keyof PowerFactorCalculationInputs | 'general', string>> = {};
    
    // Validate voltage
    if (!inputs.voltage || isNaN(parseFloat(inputs.voltage))) {
      newErrors.voltage = 'Valid voltage is required';
    } else if (parseFloat(inputs.voltage) <= 0) {
      newErrors.voltage = 'Voltage must be greater than 0';
    } else if (inputs.connectionType === 'single-phase' && (parseFloat(inputs.voltage) < 180 || parseFloat(inputs.voltage) > 260)) {
      newErrors.voltage = 'Single-phase voltage is typically between 180-260V';
    } else if (inputs.connectionType === 'three-phase' && (parseFloat(inputs.voltage) < 340 || parseFloat(inputs.voltage) > 440)) {
      newErrors.voltage = 'Three-phase voltage is typically between 340-440V';
    }
    
    // Validate current
    if (!inputs.current || isNaN(parseFloat(inputs.current))) {
      newErrors.current = 'Valid current is required';
    } else if (parseFloat(inputs.current) <= 0) {
      newErrors.current = 'Current must be greater than 0';
    } else if (parseFloat(inputs.current) > 1000) {
      newErrors.current = 'Value seems high for typical installations. Please verify.';
    }
    
    // Validate active power
    if (!inputs.activePower || isNaN(parseFloat(inputs.activePower))) {
      newErrors.activePower = 'Valid active power is required';
    } else if (parseFloat(inputs.activePower) <= 0) {
      newErrors.activePower = 'Active power must be greater than 0';
    } else if (inputs.measurementMethod === 'calculated' && parseFloat(inputs.activePower) > 1) {
      newErrors.activePower = 'Power factor must be between 0 and 1';
    } else if (inputs.measurementMethod === 'direct') {
      const voltage = parseFloat(inputs.voltage);
      const current = parseFloat(inputs.current);
      const power = parseFloat(inputs.activePower);
      const apparentPower = inputs.connectionType === 'single-phase' ? voltage * current : Math.sqrt(3) * voltage * current;
      
      if (power > apparentPower) {
        newErrors.activePower = 'Active power cannot exceed apparent power (V×I or √3×V×I)';
      }
    }
    
    // Validate target power factor
    if (!inputs.targetPowerFactor || isNaN(parseFloat(inputs.targetPowerFactor))) {
      newErrors.targetPowerFactor = 'Valid target power factor is required';
    } else if (parseFloat(inputs.targetPowerFactor) <= 0 || parseFloat(inputs.targetPowerFactor) > 1) {
      newErrors.targetPowerFactor = 'Power factor must be between 0 and 1';
    } else if (parseFloat(inputs.targetPowerFactor) < 0.85) {
      newErrors.targetPowerFactor = 'Target power factor should be at least 0.85 to meet PEC standards';
    }
    
    // Validate operating hours
    if (!inputs.operatingHours || isNaN(parseFloat(inputs.operatingHours))) {
      newErrors.operatingHours = 'Valid operating hours are required';
    } else if (parseFloat(inputs.operatingHours) <= 0) {
      newErrors.operatingHours = 'Operating hours must be greater than 0';
    } else if (parseFloat(inputs.operatingHours) > 8760) {
      newErrors.operatingHours = 'Maximum hours per year is 8760 (365 days × 24 hours)';
    }
    
    // Validate electricity rate
    if (!inputs.electricityRate || isNaN(parseFloat(inputs.electricityRate))) {
      newErrors.electricityRate = 'Valid electricity rate is required';
    } else if (parseFloat(inputs.electricityRate) <= 0) {
      newErrors.electricityRate = 'Electricity rate must be greater than 0';
    } else if (parseFloat(inputs.electricityRate) < 5 || parseFloat(inputs.electricityRate) > 15) {
      newErrors.electricityRate = 'Typical electricity rates in the Philippines range from 5-15 PHP/kWh';
    }
    
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  
  // Calculate power factor
  const calculatePowerFactor = () => {
    if (!validateInputs()) {
      return;
    }
    
    setCalculating(true);
    
    setTimeout(() => {
      try {
        // Get values from inputs
        const voltage = parseFloat(inputs.voltage);
        const current = parseFloat(inputs.current);
        const activePower = parseFloat(inputs.activePower);
        const targetPowerFactor = parseFloat(inputs.targetPowerFactor);
        const operatingHours = parseFloat(inputs.operatingHours);
        const electricityRate = parseFloat(inputs.electricityRate);
        
        // Calculate apparent power based on connection type
        const apparentPower = inputs.connectionType === 'single-phase' 
          ? voltage * current 
          : Math.sqrt(3) * voltage * current;
        
        // Calculate power factor based on measurement method
        const calculatedPowerFactor = inputs.measurementMethod === 'direct' 
          ? activePower / apparentPower 
          : parseFloat(inputs.activePower) / 100; // If provided as percentage
        
        // Calculate reactive power
        const reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(activePower, 2));
        
        // Calculate required capacitance for correction
        // Formula: Qc = P × [tan(φ1) - tan(φ2)]
        const phi1 = Math.acos(calculatedPowerFactor);
        const phi2 = Math.acos(targetPowerFactor);
        const requiredCapacitance = activePower * (Math.tan(phi1) - Math.tan(phi2));
        
        // Calculate annual savings (simplified)
        // Actual calculation would consider demand charges, etc.
        const powerFactorPenaltyRate = 0.02; // Example penalty per kVA
        const currentPenalty = apparentPower * powerFactorPenaltyRate * operatingHours / 1000;
        const improvedApparentPower = activePower / targetPowerFactor;
        const improvedPenalty = improvedApparentPower * powerFactorPenaltyRate * operatingHours / 1000;
        const annualSavings = (currentPenalty - improvedPenalty) * electricityRate;
        
        // Estimate payback period (simplified)
        const capacitorCostPerKvar = 2000; // PHP per kVAR
        const installationCost = requiredCapacitance * capacitorCostPerKvar / 1000;
        const paybackPeriod = installationCost / annualSavings;
        
        // Determine compliance status
        const minPowerFactor = installationTypes.find(type => type.value === installationType)?.minPowerFactor || 0.85;
        const complianceStatus = calculatedPowerFactor >= minPowerFactor ? 'compliant' : 'non-compliant';
        
        // Generate recommendations
        const recommendations: string[] = [];
        
        if (complianceStatus === 'non-compliant') {
          recommendations.push(`Install power factor correction capacitors rated at approximately ${Math.ceil(requiredCapacitance)} kVAR to meet PEC 2017 requirements.`);
        }
        
        if (calculatedPowerFactor < 0.95) {
          recommendations.push(`Consider improving power factor to 0.95 or higher for optimal energy efficiency and reduced utility bills.`);
        }
        
        if (calculatedPowerFactor < 0.8) {
          recommendations.push(`Conduct a detailed audit of inductive loads. Consider replacing old motors with high-efficiency models and installing variable frequency drives where applicable.`);
        }
        
        // Set results
        setResults({
          apparentPower,
          reactivePower,
          calculatedPowerFactor,
          requiredCapacitance,
          annualSavings,
          paybackPeriod,
          complianceStatus,
          recommendations,
          timestamp: Date.now()
        });
        
        // Move to results tab
        setActiveTab(2);
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setCalculating(false);
      }
    }, 800);
  };
  
  // Reset calculation
  const handleReset = () => {
    setInputs({
      voltage: '230',
      current: '50',
      activePower: '9000',
      measurementMethod: 'direct',
      connectionType: 'single-phase',
      targetPowerFactor: '0.95',
      operatingHours: '2500',
      electricityRate: '9.50'
    });
    setResults(null);
    setActiveTab(0);
    setErrors({});
  };
  
  // Save calculation
  const handleSave = () => {
    if (results) {
      try {
        const calculationData = {
          inputs,
          results,
          timestamp: Date.now()
        };
        
        const id = saveCalculation('power-factor', calculationName || `Power Factor Calculation - ${new Date().toLocaleString()}`, calculationData);
        
        if (id) {
          console.log('Successfully saved power factor calculation with ID:', id);
          console.log('Saved data:', calculationData);
          enqueueSnackbar('Power factor calculation saved successfully', { variant: 'success' });
          setSaveDialogOpen(false);
          // Reset calculation name
          setCalculationName('');
        } else {
          console.error('Error saving power factor calculation: No ID returned');
          enqueueSnackbar('Error saving calculation: No ID returned', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error saving calculation:', error);
        enqueueSnackbar(`Error saving calculation: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
          variant: 'error' 
        });
      }
    } else {
      enqueueSnackbar('Please calculate results before saving', { variant: 'warning' });
    }
  };
  
  // Handle loading a saved calculation
  const handleLoadCalculation = (data: any) => {
    try {
      console.log("Loading power factor calculation data:", data);
      
      // Extract the correct data structure
      let resultsData = data;
      
      // Check if data has a nested structure and extract the results
      if (data.data && data.data.results) {
        resultsData = data.data.results;
      } else if (data.results) {
        resultsData = data.results;
      }
      
      // Validate that we have the required properties
      if (!resultsData.calculatedPowerFactor) {
        throw new Error("Invalid calculation data format");
      }
      
      setResults(resultsData);
      setActiveTab(2);
    } catch (error) {
      console.error("Error loading calculation:", error);
      enqueueSnackbar(`Error loading calculation: ${error instanceof Error ? error.message : 'Invalid data format'}`, {
        variant: 'error'
      });
    }
  };
  
  // Update the handleExportPdf function
  const handleExportPdf = async () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate power factor before generating a report' });
      return;
    }
    
    if (onExportPdf) {
      // Set loading state
      setCalculating(true);
      try {
        await onExportPdf(results);
      } catch (error) {
        console.error('Error exporting PDF:', error);
      } finally {
        setCalculating(false);
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Power Factor Calculator (PEC 2017 Section 4.30)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          {results && (
            <Tooltip title="Save calculation">
              <IconButton onClick={() => setSaveDialogOpen(true)}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          <SavedCalculationsViewer 
            calculationType="power-factor"
            onLoadCalculation={handleLoadCalculation}
          />
          <Tooltip title="Learn more about PEC 2017 Section 4.30 Power Factor Standards">
            <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=PEC-2017&section=4.30'}>
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Learn more about PEC 2017 Section 4.30">
            <IconButton onClick={() => setStandardsInfo(!standardsInfo)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {standardsInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Philippine Electrical Code (PEC) 2017 Section 4.30 - Power Factor Requirements
          </Typography>
          <Typography variant="body2">
            This standard requires a minimum power factor of 0.85 for most installations. Facilities with power factor below 
            this threshold may face penalties from utilities and require power factor correction equipment.
          </Typography>
        </Alert>
      )}
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Power Measurements" />
        <Tab label="System Information" />
        <Tab label="Results" disabled={!results} />
      </Tabs>
      
      {/* Power Measurements Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Electrical Measurements
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Enter your power system measurements to calculate power factor. You can input directly measured values or calculated values.
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Input Guidance</Typography>
                  <Typography variant="body2">
                    • Voltage: Enter the measured line voltage in volts (V). Typical values for Philippines: 220-240V (single-phase) or 380-415V (three-phase).<br />
                    • Current: Enter the measured line current in amperes (A). This varies based on your load.<br />
                    • Active Power: Enter the active/real power in watts (W) if using direct measurement, or power factor decimal (0.0-1.0) if using calculated method.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel id="measurement-method-label">Measurement Method</InputLabel>
                      <Select
                        labelId="measurement-method-label"
                        value={inputs.measurementMethod}
                        onChange={(e) => setInputs({...inputs, measurementMethod: e.target.value as 'direct' | 'calculated'})}
                        label="Measurement Method"
                      >
                        <MenuItem value="direct">Direct Measurement (V, I, kW)</MenuItem>
                        <MenuItem value="calculated">Using Calculated Power Factor</MenuItem>
                      </Select>
                      <FormHelperText>Select how you are providing power factor data</FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel id="connection-type-label">Connection Type</InputLabel>
                      <Select
                        labelId="connection-type-label"
                        value={inputs.connectionType}
                        onChange={(e) => setInputs({...inputs, connectionType: e.target.value as 'single-phase' | 'three-phase'})}
                        label="Connection Type"
                      >
                        <MenuItem value="single-phase">Single-Phase</MenuItem>
                        <MenuItem value="three-phase">Three-Phase</MenuItem>
                      </Select>
                      <FormHelperText>Select the electrical system connection type</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Voltage"
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.voltage}
                      onChange={handleInputChange('voltage')}
                      error={!!errors.voltage}
                      helperText={errors.voltage}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">V</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Current"
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.current}
                      onChange={handleInputChange('current')}
                      error={!!errors.current}
                      helperText={errors.current}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">A</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={inputs.measurementMethod === 'direct' ? "Active Power" : "Power Factor (decimal)"}
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.activePower}
                      onChange={handleInputChange('activePower')}
                      error={!!errors.activePower}
                      helperText={errors.activePower || (inputs.measurementMethod === 'direct' ? "Enter in watts (W)" : "Enter decimal value (0.0-1.0)")}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          {inputs.measurementMethod === 'direct' ? "W" : ""}
                        </InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            endIcon={<CalculateIcon />}
            onClick={() => setActiveTab(1)}
          >
            Next: System Information
          </Button>
        </Box>
      </TabPanel>
      
      {/* System Information Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Enter information about your electrical system to calculate power factor correction requirements and compliance status.
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">Compliance Standards</Typography>
                  <Typography variant="body2">
                    • PEC 2017 Section 4.30 requires a minimum power factor of 0.85 for most installations and 0.90 for industrial buildings and hospitals.<br />
                    • Target Power Factor: 0.95 or higher is recommended for optimal energy efficiency.<br />
                    • Operating Hours: Annual hours that the system is operational (max: 8760 hours/year).<br />
                    • Electricity Rate: Current cost per kilowatt-hour in PHP.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel id="installation-type-label">Installation Type</InputLabel>
                      <Select
                        labelId="installation-type-label"
                        value={installationType}
                        onChange={(e) => setInstallationType(e.target.value)}
                        label="Installation Type"
                      >
                        {installationTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label} (Min PF: {type.minPowerFactor})
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select the type of electrical installation</FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <StandardValueSelector
                      type="power-factor"
                      label="Standard Power Factor Values"
                      helperText="Select recommended power factor values based on PEC 2017 standards"
                      onValueSelect={(value) => {
                        // Update the target power factor based on the standard
                        if (value && value.value) {
                          const pfValue = typeof value.value === 'number' 
                            ? value.value.toString() 
                            : value.value;
                            
                          setInputs(prev => ({
                            ...prev,
                            targetPowerFactor: pfValue
                          }));
                          
                          // Show notification with the selected standard
                          enqueueSnackbar(
                            `Selected standard: ${value.description} - ${value.value} (${value.source} ${value.reference})`, 
                            { variant: 'info' }
                          );
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Target Power Factor"
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.targetPowerFactor}
                      onChange={handleInputChange('targetPowerFactor')}
                      error={!!errors.targetPowerFactor}
                      helperText={errors.targetPowerFactor || "You can manually adjust the value or select from standards above"}
                      InputProps={{
                        inputProps: { min: 0, max: 1, step: 0.01 }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Operating Hours per Year"
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.operatingHours}
                      onChange={handleInputChange('operatingHours')}
                      error={!!errors.operatingHours}
                      helperText={errors.operatingHours}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hrs/year</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Electricity Rate"
                      type="number"
                      margin="normal"
                      variant="outlined"
                      value={inputs.electricityRate}
                      onChange={handleInputChange('electricityRate')}
                      error={!!errors.electricityRate}
                      helperText={errors.electricityRate}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">PHP/kWh</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => setActiveTab(0)}
          >
            Back to Power Measurements
          </Button>
          <Button 
            variant="contained" 
            endIcon={<CalculateIcon />}
            onClick={calculatePowerFactor}
            disabled={calculating}
          >
            {calculating ? <CircularProgress size={24} /> : 'Calculate Power Factor'}
          </Button>
        </Box>
      </TabPanel>
      
      {/* Results Tab */}
      <TabPanel value={activeTab} index={2}>
        {results && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert 
                severity={results.complianceStatus === 'compliant' ? 'success' : 'warning'}
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle1">
                  {results.complianceStatus === 'compliant' 
                    ? 'Compliant with PEC 2017 Section 4.30 Requirements' 
                    : 'Non-compliant with PEC 2017 Section 4.30 Requirements - Power Factor Correction Required'}
                </Typography>
                <Typography variant="body2">
                  The calculated power factor is {(results.calculatedPowerFactor * 100).toFixed(1)}%,
                  {results.complianceStatus === 'compliant' 
                    ? ' which meets the minimum requirement.' 
                    : ' which is below the minimum requirement.'}
                </Typography>
                {results.complianceStatus === 'non-compliant' && (
                  <Box mt={1}>
                    <Typography variant="subtitle2">How to Achieve Compliance:</Typography>
                    <Typography variant="body2">
                      • Install power factor correction capacitors rated at {Math.ceil(results.requiredCapacitance)} VAR<br />
                      • Target power factor should be at least {installationTypes.find(type => type.value === installationType)?.minPowerFactor || 0.85}<br />
                      • Consider replacing old inductive equipment (motors, transformers) with more efficient models
                    </Typography>
                  </Box>
                )}
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Power Factor Results
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Apparent Power (S)</TableCell>
                          <TableCell align="right">{results.apparentPower.toFixed(2)} VA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Active Power (P)</TableCell>
                          <TableCell align="right">{parseFloat(inputs.activePower).toFixed(2)} W</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Reactive Power (Q)</TableCell>
                          <TableCell align="right">{results.reactivePower.toFixed(2)} VAR</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Power Factor</TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              color: results.calculatedPowerFactor >= (installationTypes.find(type => type.value === installationType)?.minPowerFactor || 0.85) 
                                ? 'success.main' 
                                : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            {results.calculatedPowerFactor.toFixed(3)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Power Factor Correction
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Required Capacitance</TableCell>
                          <TableCell align="right">{Math.ceil(results.requiredCapacitance)} VAR</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Target Power Factor</TableCell>
                          <TableCell align="right">{parseFloat(inputs.targetPowerFactor).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Annual Savings</TableCell>
                          <TableCell align="right">PHP {results.annualSavings.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Payback Period</TableCell>
                          <TableCell align="right">{results.paybackPeriod.toFixed(1)} years</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  
                  <List>
                    {results.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Power Factor Improvement Guide
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    A power factor below {installationTypes.find(type => type.value === installationType)?.minPowerFactor || 0.85} is non-compliant with PEC 2017 Section 4.30. 
                    Low power factor increases electricity costs and reduces system capacity.
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Common Causes of Low Power Factor:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Inductive Loads" 
                        secondary="Motors, transformers, fluorescent lighting ballasts, induction furnaces" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Partially Loaded Motors" 
                        secondary="Motors operating below rated capacity have lower power factors" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Old or Inefficient Equipment" 
                        secondary="Older motors and transformers typically have lower power factors" 
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Improvement Methods:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Power Factor Correction Capacitors" 
                        secondary={`Install ${Math.ceil(results.requiredCapacitance)} VAR of capacitance to achieve target power factor of ${inputs.targetPowerFactor}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Equipment Replacement" 
                        secondary="Replace old motors with high-efficiency models" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Synchronous Motors" 
                        secondary="Consider using synchronous motors for large loads, which can operate at leading power factor" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Right-Sizing Motors" 
                        secondary="Use motors that match the required load to avoid operating at partial load" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  startIcon={<RestartAltIcon />}
                >
                  New Calculation
                </Button>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={handleExportPdf}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ mr: 2 }}
                  >
                    Export as PDF
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setSaveDialogOpen(true)}
                    startIcon={<SaveIcon />}
                  >
                    Save Results
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </TabPanel>
      
      {/* Add error guidance panel when there are errors */}
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
            There are input errors that need to be fixed before calculation. Click "Help with Errors" for detailed guidance.
          </Typography>
        </Alert>
      )}
      
      {/* Add the error help dialog */}
      <ErrorHelpDialog 
        open={errorHelpOpen} 
        onClose={() => setErrorHelpOpen(false)} 
        errors={errors} 
      />
      
      {/* Add the quick start guide dialog */}
      <QuickStartGuideDialog 
        open={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)} 
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
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PowerFactorCalculator; 