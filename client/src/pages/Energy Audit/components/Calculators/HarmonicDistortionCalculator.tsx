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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  SelectChangeEvent,
  Collapse,
  Chip,
  Stack
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SavedCalculationsViewer from './SavedCalculationsViewer';
import { saveCalculation } from './utils/storage';
import { enqueueSnackbar } from 'notistack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StandardValueSelector from '../../../../components/StandardsReference/StandardValueSelector';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import HarmonicVisualization from './HarmonicVisualization';

interface HarmonicDistortionCalculatorProps {
  onSave?: (data: HarmonicDistortionResult) => void;
  onExportPdf?: (data: HarmonicDistortionResult) => Promise<void>;
}

// Define interfaces for calculation inputs and results
interface HarmonicDistortionInputs {
  systemVoltage: string;
  fundamentalVoltage: string;
  fundamentalCurrent: string;
  shortCircuitRatio: string;
  systemType: 'general' | 'special';
  harmonics: HarmonicMeasurement[];
}

interface HarmonicMeasurement {
  order: number;
  voltage: string;
  current: string;
}

interface HarmonicDistortionResult {
  thdVoltage: number;
  thdCurrent: number;
  systemVoltage: number;
  fundamentalVoltage: number;
  fundamentalCurrent: number;
  shortCircuitRatio: number;
  systemType: 'general' | 'special';
  individualHarmonics: {
    order: number;
    voltageDistortion: number;
    currentDistortion: number;
    voltageLimit: number;
    currentLimit: number;
    voltageCompliance: 'compliant' | 'non-compliant';
    currentCompliance: 'compliant' | 'non-compliant';
  }[];
  overallCompliance: 'compliant' | 'non-compliant';
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
      id={`harmonic-tab-${index}`}
      aria-labelledby={`harmonic-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// IEEE 519-2014 voltage distortion limits
const voltageLimits = {
  'below1kV': 8.0, // ≤ 1kV: 8.0%
  '1to69kV': 5.0,  // 1kV < V ≤ 69kV: 5.0%
  '69to161kV': 2.5, // 69kV < V ≤ 161kV: 2.5%
  'above161kV': 1.5 // > 161kV: 1.5%
};

// IEEE 519-2014 current distortion limits
const currentLimits = {
  // Format: [Isc/IL ratio, limit for h < 11, limit for 11 ≤ h < 17, limit for 17 ≤ h < 23, limit for 23 ≤ h < 35, limit for 35 ≤ h]
  'general': [
    { ratio: 20, limits: [4.0, 2.0, 1.5, 0.6, 0.3] },
    { ratio: 50, limits: [7.0, 3.5, 2.5, 1.0, 0.5] },
    { ratio: 100, limits: [10.0, 4.5, 4.0, 1.5, 0.7] },
    { ratio: 1000, limits: [12.0, 5.5, 5.0, 2.0, 1.0] },
    { ratio: Infinity, limits: [15.0, 7.0, 6.0, 2.5, 1.4] }
  ],
  'special': [
    { ratio: 20, limits: [2.0, 1.0, 0.75, 0.3, 0.15] },
    { ratio: 50, limits: [3.5, 1.75, 1.25, 0.5, 0.25] },
    { ratio: 100, limits: [5.0, 2.25, 2.0, 0.75, 0.35] },
    { ratio: 1000, limits: [6.0, 2.75, 2.5, 1.0, 0.5] },
    { ratio: Infinity, limits: [7.5, 3.5, 3.0, 1.25, 0.7] }
  ]
};

// Add ErrorHelpDialog component for guiding users with validation errors
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
            Please review the guidance below to fix input errors. Each field has specific requirements based on IEEE 519-2014 standards.
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
                <TableCell>System Voltage</TableCell>
                <TableCell>1 - 500,000 V</TableCell>
                <TableCell>Nominal system voltage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fundamental Voltage</TableCell>
                <TableCell>1 - 500,000 V</TableCell>
                <TableCell>RMS voltage at fundamental frequency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fundamental Current</TableCell>
                <TableCell>0.1 - 10,000 A</TableCell>
                <TableCell>RMS current at fundamental frequency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Short Circuit Ratio</TableCell>
                <TableCell>1 - 1000</TableCell>
                <TableCell>Ratio of short circuit current to load current</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Harmonic Voltage/Current</TableCell>
                <TableCell>0 or greater</TableCell>
                <TableCell>Measured values at each harmonic frequency</TableCell>
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

// Add helper functions for field labels and guidance
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    systemVoltage: 'System Voltage',
    fundamentalVoltage: 'Fundamental Voltage',
    fundamentalCurrent: 'Fundamental Current',
    shortCircuitRatio: 'Short Circuit Ratio',
    systemType: 'System Type'
  };
  
  // Handle harmonic field errors
  if (field.startsWith('harmonic_')) {
    const parts = field.split('_');
    if (parts.length === 3) {
      const [_, index, type] = parts;
      return `Harmonic ${parseInt(index) + 1} ${type === 'voltage' ? 'Voltage' : 'Current'}`;
    }
  }
  
  return labels[field] || field;
}

function getFieldGuidance(field: string): string {
  const guidance: Record<string, string> = {
    systemVoltage: 'Enter the nominal system voltage. Typical values: 120V, 208V, 240V, 480V for low voltage systems.',
    fundamentalVoltage: 'RMS voltage at the fundamental frequency (60Hz). Should be close to the nominal system voltage.',
    fundamentalCurrent: 'RMS current at the fundamental frequency (60Hz). Enter the measured load current.',
    shortCircuitRatio: 'The ratio of available short-circuit current to maximum load current at PCC. Higher ratios allow more harmonics.',
    systemType: 'Select General for most applications. Special applies to hospitals, airports, and other sensitive environments.'
  };
  
  // Handle harmonic field guidance
  if (field.startsWith('harmonic_')) {
    const parts = field.split('_');
    if (parts.length === 3) {
      const [_, index, type] = parts;
      if (type === 'voltage') {
        return 'Enter the measured voltage at this harmonic frequency. Should be less than the fundamental voltage.';
      } else if (type === 'current') {
        return 'Enter the measured current at this harmonic frequency. Should be less than the fundamental current.';
      }
    }
  }
  
  return guidance[field] || 'Enter a valid value.';
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
        Harmonic Distortion Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you analyze voltage and current harmonic distortion in electrical systems according to IEEE 519-2014 standards.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started (3 Simple Steps)</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter System Parameters (Tab 1)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter system voltage, fundamental voltage/current, and short circuit ratio. Select the system type to determine appropriate IEEE 519-2014 limits.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Measure Harmonics (Tab 2)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter the measured voltage and current values for each harmonic order. You can add additional harmonics as needed. Typically, odd harmonics (3rd, 5th, 7th, etc.) are most significant.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. View Results (Tab 3)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                After clicking "Calculate," the results will show total harmonic distortion values, individual harmonic analysis, and compliance status with IEEE 519-2014 standards.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Understanding IEEE 519-2014 Limits</Typography>
        
        <Typography variant="body2" paragraph>
          IEEE 519-2014 sets different limits based on:
        </Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • <strong>Voltage Limits</strong>: Based on system voltage level (lower voltage systems have higher allowable distortion)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • <strong>Current Limits</strong>: Based on the short circuit ratio (Isc/IL) at the point of common coupling
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • <strong>System Type</strong>: Special applications (hospitals, airports) have stricter limits than general distribution systems
            </Typography>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Tips for Accurate Calculations</Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • Use RMS values for all voltage and current measurements
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Focus on odd harmonics, which are typically most significant in power systems
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Obtain the short circuit ratio from your utility or calculate it based on transformer impedance
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Take measurements at the point of common coupling (PCC) with the utility
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

// Add new interface for batch scenario
interface BatchScenario {
  id: string;
  name: string;
  inputs: HarmonicDistortionInputs;
  results?: HarmonicDistortionResult;
}

const HarmonicDistortionCalculator: React.FC<HarmonicDistortionCalculatorProps> = ({ onSave, onExportPdf }): React.ReactElement => {
  // Default harmonics to measure (3rd, 5th, 7th, 11th, 13th)
  const defaultHarmonics = [
    { order: 3, voltage: '0', current: '0' },
    { order: 5, voltage: '0', current: '0' },
    { order: 7, voltage: '0', current: '0' },
    { order: 11, voltage: '0', current: '0' },
    { order: 13, voltage: '0', current: '0' }
  ];

  // State for inputs, results, and UI
  const [inputs, setInputs] = useState<HarmonicDistortionInputs>({
    systemVoltage: '400',
    fundamentalVoltage: '220',
    fundamentalCurrent: '100',
    shortCircuitRatio: '20',
    systemType: 'general',
    harmonics: [...defaultHarmonics]
  });
  
  const [results, setResults] = useState<HarmonicDistortionResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [standardsInfo, setStandardsInfo] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [calculationName, setCalculationName] = useState<string>('');
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  
  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string} & {general?: string}>({});
  
  // Add new state variables for batch processing
  const [batchScenarios, setBatchScenarios] = useState<BatchScenario[]>([]);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [batchComparisonOpen, setBatchComparisonOpen] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Get snackbar from hook at component level
  const snackbar = useSnackbar();
  
  // Handle input changes
  const handleInputChange = (field: keyof HarmonicDistortionInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle select input changes
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle harmonic input changes
  const handleHarmonicChange = (index: number, field: 'voltage' | 'current') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    // Clear the error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      const errorKey = `harmonic_${index}_${field}`;
      if (errorKey in newErrors) {
        delete newErrors[errorKey];
      }
      return newErrors;
    });
    
    setInputs(prev => {
      const updatedHarmonics = [...prev.harmonics];
      updatedHarmonics[index] = {
        ...updatedHarmonics[index],
        [field]: value
      };
      
      return {
        ...prev,
        harmonics: updatedHarmonics
      };
    });
  };
  
  // Add a new harmonic
  const handleAddHarmonic = () => {
    // Get highest harmonic order
    const highestOrder = Math.max(...inputs.harmonics.map(h => h.order));
    // Find next odd harmonic
    let nextOrder = highestOrder + 2;
    if (nextOrder % 2 === 0) nextOrder++; // Ensure it's odd
    
    setInputs(prev => ({
      ...prev,
      harmonics: [...prev.harmonics, { order: nextOrder, voltage: '0', current: '0' }]
    }));
  };
  
  // Remove a harmonic
  const handleRemoveHarmonic = (index: number) => {
    if (inputs.harmonics.length <= 1) return; // Keep at least one harmonic
    
    setInputs(prev => ({
      ...prev,
      harmonics: prev.harmonics.filter((_, i) => i !== index)
    }));
  };
  
  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;
    
    // Validate system voltage
    if (!inputs.systemVoltage || isNaN(Number(inputs.systemVoltage)) || Number(inputs.systemVoltage) <= 0) {
      newErrors.systemVoltage = 'Please enter a valid positive system voltage value';
      isValid = false;
    } else if (Number(inputs.systemVoltage) > 500000) {
      newErrors.systemVoltage = 'System voltage exceeds maximum value of 500,000V';
      isValid = false;
    }
    
    // Validate fundamental voltage
    if (!inputs.fundamentalVoltage || isNaN(Number(inputs.fundamentalVoltage)) || Number(inputs.fundamentalVoltage) <= 0) {
      newErrors.fundamentalVoltage = 'Please enter a valid positive fundamental voltage value';
      isValid = false;
    } else if (Number(inputs.fundamentalVoltage) > 500000) {
      newErrors.fundamentalVoltage = 'Fundamental voltage exceeds maximum value of 500,000V';
      isValid = false;
    }
    
    // Validate fundamental current
    if (!inputs.fundamentalCurrent || isNaN(Number(inputs.fundamentalCurrent)) || Number(inputs.fundamentalCurrent) <= 0) {
      newErrors.fundamentalCurrent = 'Please enter a valid positive fundamental current value';
      isValid = false;
    } else if (Number(inputs.fundamentalCurrent) > 10000) {
      newErrors.fundamentalCurrent = 'Fundamental current exceeds maximum value of 10,000A';
      isValid = false;
    }
    
    // Validate short circuit ratio
    if (!inputs.shortCircuitRatio || isNaN(Number(inputs.shortCircuitRatio)) || Number(inputs.shortCircuitRatio) <= 0) {
      newErrors.shortCircuitRatio = 'Please enter a valid positive short circuit ratio';
      isValid = false;
    } else if (Number(inputs.shortCircuitRatio) > 1000) {
      newErrors.shortCircuitRatio = 'Short circuit ratio exceeds maximum value of 1,000';
      isValid = false;
    }
    
    // Validate harmonics
    inputs.harmonics.forEach((harmonic, index) => {
      // Validate harmonic voltage
      if (harmonic.voltage.trim() === '') {
        newErrors[`harmonic_${index}_voltage`] = 'Harmonic voltage is required';
        isValid = false;
      } else if (isNaN(Number(harmonic.voltage))) {
        newErrors[`harmonic_${index}_voltage`] = 'Please enter a valid number';
        isValid = false;
      } else if (Number(harmonic.voltage) < 0) {
        newErrors[`harmonic_${index}_voltage`] = 'Harmonic voltage cannot be negative';
        isValid = false;
      }
      
      // Validate harmonic current
      if (harmonic.current.trim() === '') {
        newErrors[`harmonic_${index}_current`] = 'Harmonic current is required';
        isValid = false;
      } else if (isNaN(Number(harmonic.current))) {
        newErrors[`harmonic_${index}_current`] = 'Please enter a valid number';
        isValid = false;
      } else if (Number(harmonic.current) < 0) {
        newErrors[`harmonic_${index}_current`] = 'Harmonic current cannot be negative';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Calculate harmonic distortion
  const calculateHarmonicDistortion = () => {
    if (!validateInputs()) {
      // Show error guidance notification
      enqueueSnackbar('Please correct the errors before calculating. Click the "Help with Errors" button for guidance.', { variant: 'error' });
      return;
    }
    
    setCalculating(true);
    
    setTimeout(() => {
      try {
        // Parse input values
        const systemVoltageValue = parseFloat(inputs.systemVoltage);
        const fundamentalVoltageValue = parseFloat(inputs.fundamentalVoltage);
        const fundamentalCurrentValue = parseFloat(inputs.fundamentalCurrent);
        const shortCircuitRatioValue = parseFloat(inputs.shortCircuitRatio);
        
        // Calculate voltage THD (simplified mock calculation)
        let sumSquaredVoltages = 0;
        inputs.harmonics.forEach(h => {
          sumSquaredVoltages += Math.pow(parseFloat(h.voltage), 2);
        });
        const thdVoltage = Math.sqrt(sumSquaredVoltages) / fundamentalVoltageValue * 100;
        
        // Calculate current THD (simplified mock calculation)
        let sumSquaredCurrents = 0;
        inputs.harmonics.forEach(h => {
          sumSquaredCurrents += Math.pow(parseFloat(h.current), 2);
        });
        const thdCurrent = Math.sqrt(sumSquaredCurrents) / fundamentalCurrentValue * 100;
        
        // Determine voltage limits based on system voltage
        const voltageLimit = getVoltageDistortionLimit(systemVoltageValue);
        
        // Determine current limits based on short circuit ratio and system type
        const currentLimitSource = currentLimits[inputs.systemType];
        let currentLimit = 0;
        
        for (const limitData of currentLimitSource) {
          if (shortCircuitRatioValue <= limitData.ratio) {
            currentLimit = limitData.limits[0]; // Using first limit (h < 11)
            break;
          }
        }
        
        // Create result object that includes all required fields from HarmonicDistortionResult interface
        const result: HarmonicDistortionResult = {
          thdVoltage,
          thdCurrent,
          systemVoltage: systemVoltageValue,
          fundamentalVoltage: fundamentalVoltageValue,
          fundamentalCurrent: fundamentalCurrentValue,
          shortCircuitRatio: shortCircuitRatioValue,
          systemType: inputs.systemType,
          individualHarmonics: inputs.harmonics.map(h => ({
            order: h.order,
            voltageDistortion: parseFloat(h.voltage) / fundamentalVoltageValue * 100,
            currentDistortion: parseFloat(h.current) / fundamentalCurrentValue * 100,
            voltageLimit,
            currentLimit,
            voltageCompliance: parseFloat(h.voltage) / fundamentalVoltageValue * 100 <= voltageLimit ? 'compliant' : 'non-compliant',
            currentCompliance: parseFloat(h.current) / fundamentalCurrentValue * 100 <= currentLimit ? 'compliant' : 'non-compliant'
          })),
          overallCompliance: thdVoltage <= voltageLimit && thdCurrent <= currentLimit ? 'compliant' : 'non-compliant',
          recommendations: generateRecommendations(thdVoltage, thdCurrent, voltageLimit, currentLimit),
          timestamp: Date.now()
        };
        
        setResults(result);
        setActiveTab(2); // Move to results tab
      } catch (error) {
        console.error('Calculation error:', error);
        enqueueSnackbar('An error occurred during calculation', { variant: 'error' });
      } finally {
        setCalculating(false);
      }
    }, 800);
  };
  
  // Generate recommendations based on calculation results
  const generateRecommendations = (thdV: number, thdI: number, vLimit: number, iLimit: number): string[] => {
    const recommendations: string[] = [];
    
    if (thdV > vLimit) {
      recommendations.push(`Voltage THD (${thdV.toFixed(2)}%) exceeds IEEE limit of ${vLimit}%. Consider voltage conditioning equipment.`);
    }
    
    if (thdI > iLimit) {
      recommendations.push(`Current THD (${thdI.toFixed(2)}%) exceeds IEEE limit of ${iLimit}%. Consider installing harmonic filters.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Harmonic distortion levels are within acceptable limits according to IEEE 519-2014 standards.');
    }
    
    return recommendations;
  };
  
  // Reset calculation
  const handleReset = () => {
    setInputs({
      systemVoltage: '400',
      fundamentalVoltage: '220',
      fundamentalCurrent: '100',
      shortCircuitRatio: '20',
      systemType: 'general',
      harmonics: [...defaultHarmonics]
    });
    setResults(null);
    setActiveTab(0);
    setErrors({});
  };
  
  // Handle save 
  const handleSave = () => {
    if (results) {
      try {
        const calculationData = {
          inputs,
          results,
          timestamp: Date.now()
        };
        
        // Save to localStorage
        const id = saveCalculation('harmonic-distortion', calculationName || `Harmonic Distortion Calculation - ${new Date().toLocaleString()}`, calculationData);
        
        if (id) {
          snackbar.enqueueSnackbar('Harmonic distortion calculation saved successfully', { variant: 'success' });
          setSaveDialogOpen(false);
          setCalculationName('');
          
          // Log success for debugging
          console.log('Successfully saved harmonic calculation with ID:', id);
          console.log('Saved data:', calculationData);
        } else {
          snackbar.enqueueSnackbar('Error saving calculation: No ID returned', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error saving calculation:', error);
        snackbar.enqueueSnackbar(`Error saving calculation: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
          variant: 'error' 
        });
      }
    } else {
      snackbar.enqueueSnackbar('Please calculate results before saving', { variant: 'warning' });
    }
  };
  
  // Handle loading a saved calculation
  const handleLoadCalculation = (data: any) => {
    try {
      console.log("Loading harmonic distortion calculation data:", data);
      
      // Extract the correct data structure
      let resultsData = data;
      
      // Check if data has a nested structure and extract the results
      if (data.data && data.data.results) {
        resultsData = data.data.results;
        
        // If there are inputs, restore them too
        if (data.data.inputs) {
          setInputs(data.data.inputs);
        }
      } else if (data.results) {
        resultsData = data.results;
        
        // If there are inputs, restore them too
        if (data.inputs) {
          setInputs(data.inputs);
        }
      }
      
      // Validate that we have the required properties
      if (!resultsData.thdVoltage && typeof resultsData.thdVoltage !== 'number') {
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

  // Determine voltage distortion limit based on system voltage
  const getVoltageDistortionLimit = (voltage: number): number => {
    if (voltage <= 1000) return voltageLimits.below1kV;
    if (voltage <= 69000) return voltageLimits['1to69kV'];
    if (voltage <= 161000) return voltageLimits['69to161kV'];
    return voltageLimits.above161kV;
  };
  
  // Update the export function
  const handleExportPdf = async () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate harmonic distortion before generating a report' });
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
  
  // Add function to create a new batch scenario from current inputs
  const addToBatchScenarios = () => {
    const isValid = validateInputs();
    
    if (!isValid) {
      enqueueSnackbar('Please fix input errors before adding to batch scenarios', { variant: 'error' });
      return;
    }
    
    const newScenario: BatchScenario = {
      id: `scenario_${Date.now()}`,
      name: `Scenario ${batchScenarios.length + 1}`,
      inputs: {
        systemVoltage: inputs.systemVoltage, 
        fundamentalVoltage: inputs.fundamentalVoltage, 
        fundamentalCurrent: inputs.fundamentalCurrent,
        shortCircuitRatio: inputs.shortCircuitRatio,
        systemType: inputs.systemType,
        harmonics: [...inputs.harmonics]
      }
    };
    
    setBatchScenarios([...batchScenarios, newScenario]);
    setShowBatchPanel(true);
    enqueueSnackbar('Scenario added to batch processing', { variant: 'success' });
  };

  // Add function to rename a batch scenario
  const renameBatchScenario = (id: string, newName: string) => {
    setBatchScenarios(
      batchScenarios.map(scenario => 
        scenario.id === id ? { ...scenario, name: newName } : scenario
      )
    );
  };

  // Add function to remove a batch scenario
  const removeBatchScenario = (id: string) => {
    setBatchScenarios(batchScenarios.filter(scenario => scenario.id !== id));
    
    if (batchScenarios.length <= 1) {
      setShowBatchPanel(false);
    }
  };

  // Add function to process all batch scenarios
  const processBatchScenarios = async () => {
    setProcessingBatch(true);
    
    const processedScenarios = await Promise.all(
      batchScenarios.map(async (scenario) => {
        const result = calculateHarmonicDistortionFromInputs(scenario.inputs);
        return {
          ...scenario,
          results: result
        };
      })
    );
    
    setBatchScenarios(processedScenarios);
    setProcessingBatch(false);
    enqueueSnackbar('Batch processing complete', { variant: 'success' });
  };

  // Add function to save all batch scenarios
  const saveBatchScenarios = () => {
    batchScenarios.forEach((scenario) => {
      if (scenario.results) {
        saveCalculation('harmonic-distortion', `Batch - ${scenario.name}`, scenario.results);
      }
    });
    
    enqueueSnackbar(`Saved ${batchScenarios.filter(s => s.results).length} batch calculations`, { 
      variant: 'success' 
    });
  };

  // Add function to calculate results from a specific input set
  const calculateHarmonicDistortionFromInputs = (inputs: HarmonicDistortionInputs): HarmonicDistortionResult => {
    const systemVoltageVal = parseFloat(inputs.systemVoltage);
    const fundamentalVoltageVal = parseFloat(inputs.fundamentalVoltage);
    const fundamentalCurrentVal = parseFloat(inputs.fundamentalCurrent);
    const shortCircuitRatioVal = parseFloat(inputs.shortCircuitRatio);
    
    // Calculate THD for voltage
    let sumOfSquaresVoltage = 0;
    
    // Calculate THD for current
    let sumOfSquaresCurrent = 0;
    
    const harmonicResults = inputs.harmonics.map(h => {
      const order = h.order;
      const voltageVal = typeof h.voltage === 'string' ? parseFloat(h.voltage) : h.voltage;
      const currentVal = typeof h.current === 'string' ? parseFloat(h.current) : h.current;
      
      // Add to sum of squares
      sumOfSquaresVoltage += Math.pow(voltageVal, 2);
      sumOfSquaresCurrent += Math.pow(currentVal, 2);
      
      // Determine voltage limit based on system voltage
      const voltageLimit = getVoltageDistortionLimit(systemVoltageVal);
      
      // Determine current limit based on harmonic order and Isc/IL ratio
      const currentLimit = getCurrentDistortionLimit(order, shortCircuitRatioVal, inputs.systemType);
      
      // Calculate individual distortion percentages
      const voltageDistortion = (voltageVal / fundamentalVoltageVal) * 100;
      const currentDistortion = (currentVal / fundamentalCurrentVal) * 100;
      
      // Check compliance
      const voltageCompliance = voltageDistortion <= voltageLimit ? 'compliant' as const : 'non-compliant' as const;
      const currentCompliance = currentDistortion <= currentLimit ? 'compliant' as const : 'non-compliant' as const;
      
      return {
        order,
        voltageDistortion,
        currentDistortion,
        voltageLimit,
        currentLimit,
        voltageCompliance,
        currentCompliance
      };
    });
    
    // Calculate THD
    const thdVoltage = Math.sqrt(sumOfSquaresVoltage) / fundamentalVoltageVal * 100;
    const thdCurrent = Math.sqrt(sumOfSquaresCurrent) / fundamentalCurrentVal * 100;
    
    // Determine the overall voltage limit
    const voltageLimit = getVoltageDistortionLimit(systemVoltageVal);
    
    // Get worst-case current limit for recommendation purposes
    const worstCurrentLimit = harmonicResults.length > 0 ? 
      Math.min(...harmonicResults.map(h => h.currentLimit)) : 5.0;
    
    // Generate recommendations
    const recommendations = generateRecommendations(thdVoltage, thdCurrent, voltageLimit, worstCurrentLimit);
    
    // Determine overall compliance
    const voltageCompliant = thdVoltage <= voltageLimit;
    const currentCompliant = harmonicResults.every(h => h.currentCompliance === 'compliant');
    const overallCompliance = voltageCompliant && currentCompliant ? 'compliant' as const : 'non-compliant' as const;
    
    return {
      thdVoltage,
      thdCurrent,
      systemVoltage: systemVoltageVal,
      fundamentalVoltage: fundamentalVoltageVal,
      fundamentalCurrent: fundamentalCurrentVal,
      shortCircuitRatio: shortCircuitRatioVal,
      systemType: inputs.systemType,
      individualHarmonics: harmonicResults,
      overallCompliance,
      recommendations,
      timestamp: Date.now()
    };
  };

  // Add function to load a batch scenario into the current calculator
  const loadBatchScenario = (scenario: BatchScenario) => {
    setInputs({
      systemVoltage: scenario.inputs.systemVoltage,
      fundamentalVoltage: scenario.inputs.fundamentalVoltage,
      fundamentalCurrent: scenario.inputs.fundamentalCurrent,
      shortCircuitRatio: scenario.inputs.shortCircuitRatio,
      systemType: scenario.inputs.systemType,
      harmonics: [...scenario.inputs.harmonics]
    });
    setActiveTab(0); // Switch to the input tab
    
    enqueueSnackbar(`Loaded scenario "${scenario.name}" into calculator`, { variant: 'info' });
  };

  // Add function to get current distortion limit from IEEE 519-2014 based on order and ratio
  const getCurrentDistortionLimit = (order: number, ratio: number, systemType: 'general' | 'special'): number => {
    // Get the appropriate limit table based on system type
    const limitsTable = currentLimits[systemType];
    
    // Find the appropriate row based on the Isc/IL ratio
    let limitRow = limitsTable[limitsTable.length - 1]; // Default to highest ratio
    
    for (let i = 0; i < limitsTable.length; i++) {
      if (ratio <= limitsTable[i].ratio) {
        limitRow = limitsTable[i];
        break;
      }
    }
    
    // Determine the limit based on the harmonic order
    let limitIndex = 0;
    if (order >= 11 && order < 17) limitIndex = 1;
    else if (order >= 17 && order < 23) limitIndex = 2;
    else if (order >= 23 && order < 35) limitIndex = 3;
    else if (order >= 35) limitIndex = 4;
    
    return limitRow.limits[limitIndex];
  };

  // Add BatchComparisonDialog component
  const BatchComparisonDialog = () => {
    return (
      <Dialog 
        open={batchComparisonOpen} 
        onClose={() => setBatchComparisonOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Batch Calculation Comparison</DialogTitle>
        <DialogContent dividers>
          {batchScenarios.filter(s => s.results).length === 0 ? (
            <Alert severity="info">
              Process batch calculations first to see comparison results.
            </Alert>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>THD Comparison</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell>Voltage THD (%)</TableCell>
                      <TableCell>Current THD (%)</TableCell>
                      <TableCell>System Voltage (V)</TableCell>
                      <TableCell>Compliance Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batchScenarios
                      .filter(scenario => scenario.results)
                      .map((scenario) => (
                        <TableRow key={scenario.id}>
                          <TableCell>{scenario.name}</TableCell>
                          <TableCell>
                            {scenario.results?.thdVoltage.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            {scenario.results?.thdCurrent.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            {scenario.results?.systemVoltage.toFixed(1)} V
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={scenario.results?.overallCompliance === 'compliant' ? 'Compliant' : 'Non-compliant'} 
                              color={scenario.results?.overallCompliance === 'compliant' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Recommendation Summary</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell>Recommendations</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batchScenarios
                      .filter(scenario => scenario.results)
                      .map((scenario) => (
                        <TableRow key={`${scenario.id}-rec`}>
                          <TableCell>{scenario.name}</TableCell>
                          <TableCell>
                            <List dense>
                              {scenario.results?.recommendations.map((rec, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={rec} />
                                </ListItem>
                              ))}
                            </List>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchComparisonOpen(false)}>Close</Button>
          {batchScenarios.filter(s => s.results).length > 0 && (
            <Button 
              onClick={saveBatchScenarios}
              startIcon={<SaveIcon />}
              variant="contained"
            >
              Save All Results
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Harmonic Distortion Calculator (IEEE 519-2014)
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
            calculationType="harmonic-distortion"
            onLoadCalculation={handleLoadCalculation}
          />
          <Tooltip title="Learn more about IEEE 519-2014 Harmonic Distortion Standards">
            <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=IEEE-519&section=5.1'}>
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Learn more about IEEE 519-2014 Standards">
            <IconButton onClick={() => setStandardsInfo(!standardsInfo)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {standardsInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            IEEE 519-2014 - Harmonic Distortion Limits
          </Typography>
          <Typography variant="body2">
            This standard sets limits for voltage and current harmonic distortion in electric power systems. 
            It helps ensure power quality and reduce equipment interference, overheating, and damage.
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">Key limits:</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Voltage THD Limits" 
                    secondary="≤1kV: 8.0%, 1-69kV: 5.0%, 69-161kV: 2.5%, >161kV: 1.5%" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Current TDD Limits" 
                    secondary="Varies based on Isc/IL ratio and system type" 
                  />
                </ListItem>
              </List>
            </Box>
          </Typography>
        </Alert>
      )}
      
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
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="System Parameters" />
        <Tab label="Harmonic Measurements" />
        <Tab label="Results" disabled={!results} />
        <Tab label="Visualization" disabled={!results} />
      </Tabs>
      
      {/* System Parameters Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Enter the electrical system parameters to establish the basis for harmonic distortion analysis.
                These values will be used to calculate percentage distortion and applicable IEEE 519-2014 limits.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Voltage Parameters
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="System Voltage"
                      fullWidth
                      variant="outlined"
                      value={inputs.systemVoltage}
                      onChange={handleInputChange('systemVoltage')}
                      error={!!errors.systemVoltage}
                      helperText={errors.systemVoltage || 'Nominal system voltage (V)'}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">V</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Fundamental Voltage (V1)"
                      fullWidth
                      variant="outlined"
                      value={inputs.fundamentalVoltage}
                      onChange={handleInputChange('fundamentalVoltage')}
                      error={!!errors.fundamentalVoltage}
                      helperText={errors.fundamentalVoltage || 'RMS voltage at fundamental frequency (60 Hz)'}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">V</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Voltage Distortion Limit: </strong>
                        {getVoltageDistortionLimit(Number(inputs.systemVoltage))}% THD
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Parameters
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Fundamental Current (I1)"
                      fullWidth
                      variant="outlined"
                      value={inputs.fundamentalCurrent}
                      onChange={handleInputChange('fundamentalCurrent')}
                      error={!!errors.fundamentalCurrent}
                      helperText={errors.fundamentalCurrent || 'RMS current at fundamental frequency (60 Hz)'}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">A</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Short Circuit Ratio (Isc/IL)"
                      fullWidth
                      variant="outlined"
                      value={inputs.shortCircuitRatio}
                      onChange={handleInputChange('shortCircuitRatio')}
                      error={!!errors.shortCircuitRatio}
                      helperText={errors.shortCircuitRatio || 'Ratio of available short circuit current to load current'}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="system-type-label">System Type</InputLabel>
                      <Select
                        labelId="system-type-label"
                        id="system-type"
                        name="systemType"
                        value={inputs.systemType}
                        label="System Type"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="general">General Distribution System</MenuItem>
                        <MenuItem value="special">Special Application (Hospitals, Airports, etc.)</MenuItem>
                      </Select>
                      <FormHelperText>
                        Special applications have stricter harmonic limits
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* System Voltage & Standards Selector */}
          <Grid item xs={12} md={6}>
            <StandardValueSelector
              type="harmonic-distortion"
              label="IEEE 519-2014 Harmonic Limits"
              helperText="Select IEEE standard limits for harmonic distortion"
              onValueSelect={(value) => {
                if (value && value.value) {
                  // Use the component-level snackbar instead of calling useSnackbar() inside callback
                  snackbar.enqueueSnackbar(
                    `Selected IEEE 519-2014 standard: ${value.description || ''} - ${value.value}${value.unit || ''} (${value.reference || ''})`, 
                    { variant: 'info' }
                  );
                }
              }}
            />
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
            Next: Harmonic Measurements
          </Button>
        </Box>
      </TabPanel>
      
      {/* Harmonic Measurements Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Enter the measured voltage and current values for each harmonic order.
                Typically, odd harmonics (3rd, 5th, 7th, etc.) are most significant in power systems.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Harmonic Measurements
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddHarmonic}
                    size="small"
                  >
                    Add Harmonic
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Harmonic Order (h)</TableCell>
                        <TableCell>Harmonic Voltage (V<sub>h</sub>)</TableCell>
                        <TableCell>Harmonic Current (I<sub>h</sub>)</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputs.harmonics.map((harmonic, index) => (
                        <TableRow key={`harmonic-${harmonic.order}`}>
                          <TableCell>{harmonic.order}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={harmonic.voltage}
                              onChange={handleHarmonicChange(index, 'voltage')}
                              error={!!errors[`harmonic_${index}_voltage`]}
                              helperText={errors[`harmonic_${index}_voltage`]}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">V</InputAdornment>,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={harmonic.current}
                              onChange={handleHarmonicChange(index, 'current')}
                              error={!!errors[`harmonic_${index}_current`]}
                              helperText={errors[`harmonic_${index}_current`]}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">A</InputAdornment>,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveHarmonic(index)}
                              disabled={inputs.harmonics.length <= 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => setActiveTab(0)}
          >
            Back to System Parameters
          </Button>
          <Button 
            variant="contained" 
            endIcon={<CalculateIcon />}
            onClick={calculateHarmonicDistortion}
            disabled={calculating}
          >
            {calculating ? <CircularProgress size={24} /> : 'Calculate Harmonic Distortion'}
          </Button>
        </Box>
      </TabPanel>
      
      {/* Results Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Results are based on IEEE 519-2014 standards for harmonic distortion limits.
                THD (Total Harmonic Distortion) is the ratio of the RMS value of all harmonic components to the RMS value of the fundamental.
              </Typography>
            </Alert>
          </Grid>
          
          {results && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Harmonic Distortion
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle2">Voltage THD</Typography>
                          <Typography 
                            variant="h4" 
                            color={results.thdVoltage > 5 ? 'error.main' : 'success.main'}
                          >
                            {results.thdVoltage.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Limit: 5.0%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle2">Current TDD</Typography>
                          <Typography 
                            variant="h4" 
                            color={results.thdCurrent > 8 ? 'error.main' : 'success.main'}
                          >
                            {results.thdCurrent.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Limit: 8.0%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Alert 
                        severity={results.overallCompliance === 'compliant' ? 'success' : 'error'}
                        sx={{ width: '100%' }}
                      >
                        <Typography variant="body1">
                          System is {results.overallCompliance === 'compliant' ? 'compliant' : 'not compliant'} with IEEE 519-2014
                        </Typography>
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {results.recommendations.length > 0 ? (
                      <List>
                        {results.recommendations.map((rec, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recommendations needed. System is within acceptable limits.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Individual Harmonic Analysis
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Harmonic Order</TableCell>
                            <TableCell>Voltage Distortion (%)</TableCell>
                            <TableCell>Voltage Limit (%)</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Current Distortion (%)</TableCell>
                            <TableCell>Current Limit (%)</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.individualHarmonics.map((h) => (
                            <TableRow key={`result-harmonic-${h.order}`}>
                              <TableCell>{h.order}</TableCell>
                              <TableCell>{h.voltageDistortion.toFixed(2)}%</TableCell>
                              <TableCell>{h.voltageLimit.toFixed(2)}%</TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  color={h.voltageCompliance === 'compliant' ? 'success.main' : 'error.main'}
                                >
                                  {h.voltageCompliance}
                                </Typography>
                              </TableCell>
                              <TableCell>{h.currentDistortion.toFixed(2)}%</TableCell>
                              <TableCell>{h.currentLimit.toFixed(2)}%</TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  color={h.currentCompliance === 'compliant' ? 'success.main' : 'error.main'}
                                >
                                  {h.currentCompliance}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          
          {!results && (
            <Grid item xs={12}>
              <Typography variant="body1">
                No results to display. Please enter system parameters and harmonic measurements, then calculate results.
              </Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Calculation
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPdf}
            disabled={!results}
          >
            Export PDF Report
          </Button>
        </Box>
      </TabPanel>
      
      {/* Visualization Tab */}
      <TabPanel value={activeTab} index={3}>
        {results ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Interactive visualization of harmonic distortion data based on IEEE 519-2014 standards.
                  Use the controls below to customize the visualization and explore harmonic components.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <HarmonicVisualization
                harmonics={inputs.harmonics.map(h => ({
                  order: h.order,
                  voltage: parseFloat(h.voltage),
                  current: parseFloat(h.current)
                }))}
                fundamentalValues={{
                  voltage: parseFloat(inputs.fundamentalVoltage),
                  current: parseFloat(inputs.fundamentalCurrent)
                }}
                thdValues={{
                  voltage: results.thdVoltage,
                  current: results.thdCurrent
                }}
                limits={{
                  voltageLimit: getVoltageDistortionLimit(parseFloat(inputs.systemVoltage)),
                  currentLimits: inputs.harmonics.map(h => 
                    getCurrentDistortionLimit(
                      h.order, 
                      parseFloat(inputs.shortCircuitRatio), 
                      inputs.systemType
                    )
                  ),
                  thdVoltageLimit: getVoltageDistortionLimit(parseFloat(inputs.systemVoltage)),
                  thdCurrentLimit: getCurrentDistortionLimit(
                    5, // Using a common harmonic order (5th) for the THD limit example
                    parseFloat(inputs.shortCircuitRatio),
                    inputs.systemType
                  )
                }}
              />
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body1">
            No results to visualize. Please calculate harmonic distortion first.
          </Typography>
        )}
      </TabPanel>
      
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
      
      {/* Add button to add current configuration to batch scenarios */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addToBatchScenarios}
          sx={{ mr: 1 }}
        >
          Add to Batch Scenarios
        </Button>
        
        {batchScenarios.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={showBatchPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowBatchPanel(!showBatchPanel)}
          >
            {showBatchPanel ? 'Hide' : 'Show'} Batch Panel ({batchScenarios.length})
          </Button>
        )}
      </Box>
      
      {/* Add batch processing panel */}
      <Collapse in={showBatchPanel}>
        <Box sx={{ px: 3, pb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Batch Processing ({batchScenarios.length} scenarios)
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>System Voltage</TableCell>
                    <TableCell>Harmonics</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchScenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell>
                        <TextField
                          value={scenario.name}
                          onChange={(e) => renameBatchScenario(scenario.id, e.target.value)}
                          variant="standard"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{scenario.inputs.systemVoltage} V</TableCell>
                      <TableCell>{scenario.inputs.harmonics.length} harmonics</TableCell>
                      <TableCell>{scenario.inputs.systemType === 'general' ? 'General' : 'Special'}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => loadBatchScenario(scenario)} 
                          title="Load scenario"
                        >
                          <ElectricalServicesIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => removeBatchScenario(scenario.id)} 
                          title="Remove scenario"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
                onClick={processBatchScenarios}
                disabled={batchScenarios.length === 0 || processingBatch}
              >
                {processingBatch ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Process All'
                )}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CompareArrowsIcon />}
                onClick={() => setBatchComparisonOpen(true)}
                disabled={batchScenarios.filter(s => s.results).length < 1}
              >
                Compare Results
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={saveBatchScenarios}
                disabled={batchScenarios.filter(s => s.results).length === 0}
              >
                Save All Results
              </Button>
            </Box>
          </Paper>
        </Box>
      </Collapse>
      
      {/* Add the batch comparison dialog */}
      <BatchComparisonDialog />
    </Paper>
  );
};

export default HarmonicDistortionCalculator; 