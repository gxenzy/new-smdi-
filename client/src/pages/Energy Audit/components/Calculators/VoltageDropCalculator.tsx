import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Checkbox,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import SettingsIcon from '@mui/icons-material/Settings';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TemplateIcon from '@mui/icons-material/Assignment';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SyncIcon from '@mui/icons-material/Sync';

import { saveCalculation } from './utils/storage';
import {
  CircuitType,
  CircuitConfiguration,
  VoltageDropInputs,
  VoltageDropResult,
  COPPER_AMPACITY,
  ALUMINUM_AMPACITY,
  calculateVoltageDropResults,
  findOptimalConductorSize
} from './utils/voltageDropUtils';
import { CONDUCTOR_SIZES } from './utils/voltageRegulationUtils';
import VoltageDropVisualization, { VoltageDropVisualizationRef } from './VoltageDropVisualization';
import SavedCalculationsViewer from './SavedCalculationsViewer';
import { exportVoltageDropToPdf, captureChartAsImage, PdfExportOptions } from './utils/voltageDropPdfExport';
import {
  VOLTAGE_DROP_TEMPLATES,
  VoltageDropTemplate,
  getTemplatesForCircuitType
} from './utils/voltageDropTemplates';
import { clearCache } from './utils/voltageDropCaching';
import BatchProcessingDialog from './BatchProcessingDialog';
import BatchResultsVisualization from './BatchResultsVisualization';
import { BatchCalculationResult } from './utils/voltageDropBatchProcessing';
import ConductorComparisonView from './ConductorComparisonView';
import LoadCircuitDialog from './LoadCircuitDialog';
import { 
  UnifiedCircuitData, 
  loadScheduleToUnifiedCircuit, 
  loadItemToUnifiedCircuit, 
  unifiedCircuitToVoltageDropInputs,
  voltageDropInputsToUnifiedCircuit
} from './utils/circuitDataExchange';
import { useCircuitSync } from '../../../../contexts/CircuitSynchronizationContext';
import SynchronizationPanel from './SynchronizationPanel';

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
      id={`voltage-drop-tabpanel-${index}`}
      aria-labelledby={`voltage-drop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `voltage-drop-tab-${index}`,
    'aria-controls': `voltage-drop-tabpanel-${index}`,
  };
}

const VoltageDropCalculator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  
  // Add circuit sync context
  const circuitSync = useCircuitSync();
  
  // Add field assessment mode state
  const [fieldAssessmentMode, setFieldAssessmentMode] = useState(false);
  
  // Circuit configuration
  const [circuitConfig, setCircuitConfig] = useState<CircuitConfiguration>({
    circuitType: 'branch',
    distanceToFurthestOutlet: 30,
    startingCurrentMultiplier: 1.25,
    serviceFactor: 1.15,
    wireway: 'conduit',
    hasVFD: false
  });
  
  // Form state
  const [inputs, setInputs] = useState<Omit<VoltageDropInputs, 'circuitConfiguration'>>({
    systemVoltage: 230,
    loadCurrent: 20,
    conductorLength: 50,
    conductorSize: '12 AWG',
    conductorMaterial: 'copper',
    conduitMaterial: 'PVC',
    phaseConfiguration: 'single-phase',
    temperature: 30,
    powerFactor: 0.85
  });
  
  // Calculation results
  const [results, setResults] = useState<VoltageDropResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizedSize, setOptimizedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'info' | 'warning' | 'error'
  });

  // Add state for saved calculations dialog
  const [savedCalcsDialogOpen, setSavedCalcsDialogOpen] = useState(false);

  // Add state for PDF export dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfExportOptions, setPdfExportOptions] = useState<PdfExportOptions>({
    title: 'Voltage Drop Calculation Report',
    showVisualization: true,
    paperSize: 'a4',
    orientation: 'portrait',
    includeRecommendations: true
  });
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  
  // Add refs for charts to capture them as images
  const voltageProfileChartRef = useRef<any>(null);
  const conductorComparisonChartRef = useRef<any>(null);

  // Update visualization ref
  const visualizationRef = useRef<VoltageDropVisualizationRef>(null);

  // Add state for template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<VoltageDropTemplate[]>([]);

  // Add batch processing state
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchCalculationResult[]>([]);
  const [showBatchResults, setShowBatchResults] = useState(false);

  // Add state for load circuit dialog
  const [loadCircuitDialogOpen, setLoadCircuitDialogOpen] = useState(false);
  const [loadedCircuitData, setLoadedCircuitData] = useState<UnifiedCircuitData | null>(null);

  // Update the handleCircuitTypeChange function to clear cache
  const handleCircuitTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const circuitType = e.target.value as CircuitType;
    
    setCircuitConfig({
      ...circuitConfig,
      circuitType
    });
    
    // Reset any type-specific parameters that are not relevant to the new type
    if (circuitType !== 'branch') {
      delete circuitConfig.distanceToFurthestOutlet;
    }
    
    if (circuitType !== 'motor') {
      delete circuitConfig.startingCurrentMultiplier;
      delete circuitConfig.serviceFactor;
      delete circuitConfig.hasVFD;
    }
    
    // Update available templates for this circuit type
    setAvailableTemplates(getTemplatesForCircuitType(circuitType));
    
    // Clear calculation results and cache
    setIsCalculated(false);
    setResults(null);
    clearCache();
  };

  // Handle circuit configuration changes for numeric fields
  const handleCircuitConfigNumberChange = (field: keyof CircuitConfiguration) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setCircuitConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setIsCalculated(false);
    // Clear calculation cache when circuit type changes
    clearCache();
  };

  // Handle circuit configuration changes for select fields
  const handleCircuitConfigSelectChange = (field: keyof CircuitConfiguration) => (
    e: SelectChangeEvent
  ) => {
    setCircuitConfig(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setIsCalculated(false);
    // Clear calculation cache when circuit type changes
    clearCache();
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof CircuitConfiguration) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCircuitConfig(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
    setIsCalculated(false);
    // Clear calculation cache when circuit type changes
    clearCache();
  };

  // Handle input numeric changes
  const handleInputNumberChange = (field: keyof Omit<VoltageDropInputs, 'circuitConfiguration'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setIsCalculated(false);
  };

  // Handle input select changes
  const handleInputSelectChange = (field: keyof Omit<VoltageDropInputs, 'circuitConfiguration'>) => (
    e: SelectChangeEvent
  ) => {
    setInputs(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setIsCalculated(false);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle input changes for string or number fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
      setIsCalculated(false);
    }
  };

  // Calculate results
  const handleCalculate = () => {
    setError(null);
    setIsCalculating(true);
    
    try {
      // Combine inputs with circuit configuration
      const fullInputs: VoltageDropInputs = {
        ...inputs,
        circuitConfiguration: circuitConfig
      };
      
      // Calculate results
      const calculationResults = calculateVoltageDropResults(fullInputs);
      setResults(calculationResults);
      
      // Find optimized conductor size
      const optimized = findOptimalConductorSize({
        ...inputs,
        circuitConfiguration: circuitConfig
      });
      setOptimizedSize(optimized);
      
      setIsCalculated(true);
      setIsCalculating(false);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsCalculating(false);
    }
  };

  // Save calculation results
  const handleSave = () => {
    if (results) {
      const id = saveCalculation(
        'voltage-drop', 
        `Voltage Drop - ${circuitConfig.circuitType} circuit - ${new Date().toLocaleDateString()}`,
        {
          inputs: {
            ...inputs,
            circuitConfiguration: circuitConfig
          },
          results
        }
      );
      
      if (id) {
        showNotification('Calculation saved successfully', 'success');
      } else {
        showNotification('Failed to save calculation', 'error');
      }
    }
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Add load calculation handler
  const handleLoadCalculation = (calculationData: any) => {
    if (calculationData && calculationData.data) {
      const { inputs, results } = calculationData.data;
      
      // Set inputs state
      if (inputs) {
        // Set circuit configuration
        if (inputs.circuitConfiguration) {
          setCircuitConfig(inputs.circuitConfiguration);
        }
        
        // Set other inputs
        setInputs({
          systemVoltage: inputs.systemVoltage || 230,
          loadCurrent: inputs.loadCurrent || 20,
          conductorLength: inputs.conductorLength || 50,
          conductorSize: inputs.conductorSize || '12 AWG',
          conductorMaterial: inputs.conductorMaterial || 'copper',
          conduitMaterial: inputs.conduitMaterial || 'PVC',
          phaseConfiguration: inputs.phaseConfiguration || 'single-phase',
          temperature: inputs.temperature || 30,
          powerFactor: inputs.powerFactor || 0.85
        });
      }
      
      // Set results
      if (results) {
        setResults(results);
        setIsCalculated(true);
      }
      
      setSavedCalcsDialogOpen(false);
      showNotification('Calculation loaded successfully', 'success');
    }
  };

  // Update handleExportToPdf to use the visualization ref and optimized chart export
  const handleExportToPdf = async () => {
    if (!results) return;
    
    setIsPdfExporting(true);
    
    try {
      // Capture visualization if available and requested
      let visualizationImage = '';
      
      if (pdfExportOptions.showVisualization && visualizationRef.current) {
        const activeChart = tabValue === 0 
          ? visualizationRef.current.getVoltageProfileChart() 
          : visualizationRef.current.getConductorComparisonChart();
        
        // Use the optimized chart capture function
        visualizationImage = await captureChartAsImage(activeChart, {
          width: 1200, // Higher resolution for print
          height: 600,
          quality: 0.95,
          optimizeForPrint: true
        });
      }
      
      // Export to PDF
      exportVoltageDropToPdf(
        {
          ...inputs,
          circuitConfiguration: circuitConfig
        },
        results,
        visualizationImage,
        {
          ...pdfExportOptions,
          fileName: `voltage-drop-${circuitConfig.circuitType}-${new Date().toISOString().slice(0, 10)}.pdf`,
          optimizeVisualization: true,
          visualizationQuality: 0.95
        }
      );
      
      // Close dialog and show success notification
      setPdfDialogOpen(false);
      showNotification('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showNotification('Error exporting to PDF', 'error');
    } finally {
      setIsPdfExporting(false);
    }
  };
  
  // Handle PDF option changes
  const handlePdfOptionChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as any;
    if (!name) return;
    
    setPdfExportOptions(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  // Add a function to load a template
  const handleLoadTemplate = (template: VoltageDropTemplate) => {
    if (template.inputs) {
      // Set circuit configuration if present
      if (template.inputs.circuitConfiguration) {
        setCircuitConfig(template.inputs.circuitConfiguration);
      }
      
      // Set other inputs
      setInputs({
        systemVoltage: template.inputs.systemVoltage || inputs.systemVoltage,
        loadCurrent: template.inputs.loadCurrent || inputs.loadCurrent,
        conductorLength: template.inputs.conductorLength || inputs.conductorLength,
        conductorSize: template.inputs.conductorSize || inputs.conductorSize,
        conductorMaterial: template.inputs.conductorMaterial || inputs.conductorMaterial,
        conduitMaterial: template.inputs.conduitMaterial || inputs.conduitMaterial,
        phaseConfiguration: template.inputs.phaseConfiguration || inputs.phaseConfiguration,
        temperature: template.inputs.temperature || inputs.temperature,
        powerFactor: template.inputs.powerFactor || inputs.powerFactor
      });
      
      // Close dialog and show success notification
      setTemplateDialogOpen(false);
      showNotification(`Template "${template.name}" loaded successfully`, 'success');
      
      // Clear calculation results
      setIsCalculated(false);
      setResults(null);
    }
  };
  
  // Initialize available templates for the current circuit type
  useEffect(() => {
    setAvailableTemplates(getTemplatesForCircuitType(circuitConfig.circuitType));
  }, []);

  // Handle opening batch processing dialog
  const handleOpenBatchDialog = () => {
    setBatchDialogOpen(true);
  };

  // Handle batch results
  const handleBatchResults = (results: BatchCalculationResult[]) => {
    setBatchResults(results);
    setShowBatchResults(true);
  };

  // Handle closing batch results view
  const handleCloseBatchResults = () => {
    setShowBatchResults(false);
  };

  // Reset calculator to initial state
  const handleReset = () => {
    setInputs({
      systemVoltage: 230,
      loadCurrent: 20,
      conductorLength: 50,
      conductorSize: '12 AWG',
      conductorMaterial: 'copper',
      conduitMaterial: 'PVC',
      phaseConfiguration: 'single-phase',
      temperature: 30,
      powerFactor: 0.85
    });
    
    setCircuitConfig({
      circuitType: 'branch',
      distanceToFurthestOutlet: 30,
      startingCurrentMultiplier: 1.25,
      serviceFactor: 1.15,
      wireway: 'conduit',
      hasVFD: false
    });
    
    setResults(null);
    setIsCalculated(false);
    setOptimizedSize(null);
    setError(null);
    clearCache();
    
    // Show notification
    showNotification('Calculator reset to default values', 'info');
  };

  // Handle saved calculations dialog
  const handleOpenLoadDialog = () => {
    setSavedCalcsDialogOpen(true);
  };

  // Build complete voltage drop inputs from current state
  const buildVoltageDropInputs = (): VoltageDropInputs => {
    return {
      ...inputs,
      circuitConfiguration: circuitConfig
    };
  };

  // Render circuit type selection
  const renderCircuitTypeSelection = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Circuit Type
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TemplateIcon />}
                onClick={() => setTemplateDialogOpen(true)}
              >
                Load Template
              </Button>
            </Box>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                row
                name="circuitType"
                value={circuitConfig.circuitType}
                onChange={handleCircuitTypeChange}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel 
                      value="branch" 
                      control={<Radio />} 
                      label="Branch Circuit" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel 
                      value="feeder" 
                      control={<Radio />} 
                      label="Feeder" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel 
                      value="service" 
                      control={<Radio />} 
                      label="Service" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel 
                      value="motor" 
                      control={<Radio />} 
                      label="Motor Circuit" 
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Render circuit parameters for the selected circuit type
  const renderCircuitParameters = () => {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Circuit Parameters
          </Typography>

          {/* Branch circuit specific parameters */}
          {circuitConfig.circuitType === 'branch' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Distance to Furthest Outlet"
                type="number"
                value={circuitConfig.distanceToFurthestOutlet}
                onChange={handleCircuitConfigNumberChange('distanceToFurthestOutlet')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>
                }}
                margin="normal"
              />
            </Box>
          )}
          
          {/* Motor circuit specific parameters */}
          {circuitConfig.circuitType === 'motor' && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Starting Current Multiplier"
                    type="number"
                    value={circuitConfig.startingCurrentMultiplier}
                    onChange={handleCircuitConfigNumberChange('startingCurrentMultiplier')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">×</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Service Factor"
                    type="number"
                    value={circuitConfig.serviceFactor}
                    onChange={handleCircuitConfigNumberChange('serviceFactor')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel 
                    control={
                      <Checkbox
                        checked={circuitConfig.hasVFD === true}
                        onChange={handleCheckboxChange('hasVFD')}
                      />
                    }
                    label="Circuit has Variable Frequency Drive (VFD)"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Common parameters for all circuit types */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="System Voltage"
                name="systemVoltage"
                value={inputs.systemVoltage}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">V</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Load Current"
                name="loadCurrent"
                value={inputs.loadCurrent}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">A</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Conductor Length"
                name="conductorLength"
                value={inputs.conductorLength}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Size</InputLabel>
                <Select
                  name="conductorSize"
                  value={inputs.conductorSize}
                  onChange={handleInputSelectChange('conductorSize')}
                  label="Conductor Size"
                >
                  <MenuItem value="14 AWG">14 AWG</MenuItem>
                  <MenuItem value="12 AWG">12 AWG</MenuItem>
                  <MenuItem value="10 AWG">10 AWG</MenuItem>
                  <MenuItem value="8 AWG">8 AWG</MenuItem>
                  <MenuItem value="6 AWG">6 AWG</MenuItem>
                  <MenuItem value="4 AWG">4 AWG</MenuItem>
                  <MenuItem value="2 AWG">2 AWG</MenuItem>
                  <MenuItem value="1/0 AWG">1/0 AWG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Material</InputLabel>
                <Select
                  name="conductorMaterial"
                  value={inputs.conductorMaterial}
                  onChange={handleInputSelectChange('conductorMaterial')}
                  label="Conductor Material"
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conduit Material</InputLabel>
                <Select
                  name="conduitMaterial"
                  value={inputs.conduitMaterial}
                  onChange={handleInputSelectChange('conduitMaterial')}
                  label="Conduit Material"
                >
                  <MenuItem value="PVC">PVC</MenuItem>
                  <MenuItem value="steel">Steel</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Phase Configuration</InputLabel>
                <Select
                  name="phaseConfiguration"
                  value={inputs.phaseConfiguration}
                  onChange={handleInputSelectChange('phaseConfiguration')}
                  label="Phase Configuration"
                >
                  <MenuItem value="single-phase">Single-Phase</MenuItem>
                  <MenuItem value="three-phase">Three-Phase</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Power Factor"
                name="powerFactor"
                value={inputs.powerFactor}
                onChange={handleInputNumberChange('powerFactor')}
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Ambient Temperature"
                name="temperature"
                value={inputs.temperature}
                onChange={handleInputNumberChange('temperature')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°C</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render results section
  const renderResults = () => {
    if (!results) return null;

    const complianceColor = results.compliance === 'compliant' 
      ? theme.palette.success.main 
      : theme.palette.error.main;

    return (
      <Box mt={3}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Calculation Results
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card 
                variant="outlined"
                sx={{ 
                  bgcolor: results.compliance === 'compliant' ? 'success.light' : 'error.light',
                  borderColor: results.compliance === 'compliant' ? 'success.main' : 'error.main'
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {results.compliance === 'compliant' ? (
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6" color={complianceColor}>
                      {results.compliance === 'compliant' ? 'PEC 2017 Compliant' : 'Not PEC 2017 Compliant'}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Maximum allowed voltage drop: {results.maxAllowedDrop}%
                  </Typography>
                  <Typography variant="body2">
                    Your voltage drop: {results.voltageDropPercent.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Voltage Drop
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      Percentage: <strong>{results.voltageDropPercent.toFixed(2)}%</strong>
                    </Typography>
                    <Typography variant="body1">
                      Absolute: <strong>{results.voltageDrop.toFixed(2)} V</strong>
                    </Typography>
                    <Typography variant="body1">
                      Receiving End Voltage: <strong>{results.receivingEndVoltage.toFixed(2)} V</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Wire Capacity
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      Current Rating: <strong>{results.wireRating.ampacity} A</strong>
                    </Typography>
                    <Typography variant="body1">
                      Load Current: <strong>{inputs.loadCurrent} A</strong>
                    </Typography>
                    <Typography variant="body1" color={results.wireRating.isAdequate ? 'success.main' : 'error.main'}>
                      <strong>{results.wireRating.isAdequate ? 'Adequate' : 'Not Adequate'}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Power Losses
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      Resistive Loss: <strong>{results.resistiveLoss.toFixed(2)} W</strong>
                    </Typography>
                    <Typography variant="body1">
                      Reactive Loss: <strong>{results.reactiveLoss.toFixed(2)} VAR</strong>
                    </Typography>
                    <Typography variant="body1">
                      Total Loss: <strong>{results.totalLoss.toFixed(2)} VA</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Optimal Conductor Size
                  </Typography>
                  {optimizedSize && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        For this circuit, the optimal conductor size is: <strong>{optimizedSize}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This considers both voltage drop and ampacity requirements
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    {results.recommendations.map((recommendation, index) => (
                      <Typography key={index} variant="body2" paragraph>
                        • {recommendation}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  // Render error display
  const renderError = () => {
    if (!error) return null;

    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  };

  // Handle field assessment mode toggle
  const handleFieldAssessmentModeToggle = () => {
    setFieldAssessmentMode(!fieldAssessmentMode);
    
    // Reset the form to simpler defaults if entering field mode
    if (!fieldAssessmentMode) {
      // Use simpler defaults for field assessment
      setCircuitConfig({
        ...circuitConfig,
        circuitType: 'branch',
      });
      
      setInputs({
        systemVoltage: 230,
        loadCurrent: 20,
        conductorLength: 30,
        conductorSize: '12 AWG',
        conductorMaterial: 'copper',
        conduitMaterial: 'PVC',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85
      });
    }
  };

  // Render field assessment mode UI
  const renderFieldAssessmentUI = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Field Assessment Mode
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Simplified interface for field data collection. Enter the essential parameters below.
        </Typography>
        
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Voltage"
                name="systemVoltage"
                value={inputs.systemVoltage}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">V</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load Current"
                name="loadCurrent"
                value={inputs.loadCurrent}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">A</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Conductor Length"
                name="conductorLength"
                value={inputs.conductorLength}
                onChange={handleInputChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Size</InputLabel>
                <Select
                  name="conductorSize"
                  value={inputs.conductorSize}
                  onChange={handleInputSelectChange('conductorSize')}
                  label="Conductor Size"
                >
                  <MenuItem value="14 AWG">14 AWG</MenuItem>
                  <MenuItem value="12 AWG">12 AWG</MenuItem>
                  <MenuItem value="10 AWG">10 AWG</MenuItem>
                  <MenuItem value="8 AWG">8 AWG</MenuItem>
                  <MenuItem value="6 AWG">6 AWG</MenuItem>
                  <MenuItem value="4 AWG">4 AWG</MenuItem>
                  <MenuItem value="2 AWG">2 AWG</MenuItem>
                  <MenuItem value="1/0 AWG">1/0 AWG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Material</InputLabel>
                <Select
                  name="conductorMaterial"
                  value={inputs.conductorMaterial}
                  onChange={handleInputSelectChange('conductorMaterial')}
                  label="Conductor Material"
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={isCalculating ? <CircularProgress size={24} color="inherit" /> : <CalculateIcon />}
              onClick={handleCalculate}
              disabled={isCalculating}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Voltage Drop'}
            </Button>
          </Box>
        </Card>
        
        {isCalculated && results && (
          <Card sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            
            <Box sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: results.compliance === 'compliant' ? 'success.light' : 'error.light',
              color: results.compliance === 'compliant' ? 'success.dark' : 'error.dark',
              display: 'flex',
              alignItems: 'center',
              mb: 2
            }}>
              {results.compliance === 'compliant' ? (
                <CheckCircleIcon sx={{ mr: 1 }} />
              ) : (
                <ErrorIcon sx={{ mr: 1 }} />
              )}
              <Typography variant="body1" fontWeight="bold">
                {results.compliance === 'compliant' 
                  ? 'PEC 2017 Compliant' 
                  : 'Not PEC 2017 Compliant'}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  Voltage Drop: <strong>{results.voltageDropPercent.toFixed(2)}%</strong>
                </Typography>
                <Typography variant="body1">
                  Voltage Drop (V): <strong>{results.voltageDrop.toFixed(2)} V</strong>
                </Typography>
                <Typography variant="body1">
                  Receiving End Voltage: <strong>{results.receivingEndVoltage.toFixed(2)} V</strong>
                </Typography>
                <Typography variant="body1">
                  Wire Rating: <strong>{results.wireRating.ampacity} A</strong>
                </Typography>
                <Typography variant="body1">
                  Wire Capacity: <strong>{results.wireRating.isAdequate ? 'Adequate' : 'Not Adequate'}</strong>
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<RotateLeftIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </Card>
        )}
      </Box>
    );
  };

  // Auto-save results to circuit sync context when calculation is done
  useEffect(() => {
    if (isCalculated && results && circuitSync.syncStatus.isEnabled) {
      // Create a circuit ID or use existing one
      const circuitId = loadedCircuitData?.id || `vd-${Date.now()}`;
      
      // Convert current calculation to unified circuit data
      const circuitData = voltageDropInputsToUnifiedCircuit(
        buildVoltageDropInputs(),
        circuitId,
        `Voltage Drop Circuit ${new Date().toLocaleString()}`
      );
      
      // Add voltage drop results
      const updatedCircuitData: UnifiedCircuitData = {
        ...circuitData,
        voltageDropPercent: results.voltageDropPercent,
        voltageDrop: results.voltageDrop
      };
      
      // Update circuit in sync context
      circuitSync.updateCircuit(updatedCircuitData);
    }
  }, [isCalculated, results, circuitSync.syncStatus.isEnabled]);

  // Function to save circuit data to sync context
  const saveToSyncContext = () => {
    if (!isCalculated || !results) {
      showNotification('Please calculate results first', 'warning');
      return;
    }
    
    // Create a circuit ID or use existing one
    const circuitId = loadedCircuitData?.id || `vd-${Date.now()}`;
    
    // Convert current calculation to unified circuit data
    const circuitData = voltageDropInputsToUnifiedCircuit(
      buildVoltageDropInputs(),
      circuitId,
      `Voltage Drop Circuit ${new Date().toLocaleString()}`
    );
    
    // Add voltage drop results
    const updatedCircuitData: UnifiedCircuitData = {
      ...circuitData,
      voltageDropPercent: results.voltageDropPercent,
      voltageDrop: results.voltageDrop
    };
    
    // Update circuit in sync context
    circuitSync.updateCircuit(updatedCircuitData);
    
    showNotification('Circuit saved to sync context', 'success');
  };

  // Load from sync context
  const loadFromSyncContext = (circuitId: string) => {
    const circuitData = circuitSync.getCircuitById(circuitId);
    
    if (circuitData) {
      handleLoadCircuit(circuitData);
    }
  };

  // Modify renderActionButtons to include the sync button
  const renderActionButtons = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      <Button
        variant="contained"
        startIcon={<CalculateIcon />}
        onClick={handleCalculate}
        disabled={isCalculating}
      >
        {isCalculating ? 'Calculating...' : 'Calculate'}
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={!isCalculated}
      >
        Save Calculation
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<FolderOpenIcon />}
        onClick={() => setSavedCalcsDialogOpen(true)}
      >
        Load Saved
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setPdfDialogOpen(true)}
        disabled={!isCalculated}
      >
        Export PDF
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<TemplateIcon />}
        onClick={() => {
          setAvailableTemplates(getTemplatesForCircuitType(circuitConfig.circuitType));
          setTemplateDialogOpen(true);
        }}
      >
        Load Template
      </Button>
      
      {/* Add sync button */}
      <Button
        variant="outlined"
        startIcon={<SyncIcon />}
        onClick={saveToSyncContext}
        disabled={!isCalculated || !circuitSync.syncStatus.isEnabled}
      >
        Sync with SOL
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<ElectricalServicesIcon />}
        onClick={handleOpenLoadDialog}
      >
        Load from SOL
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<BatchPredictionIcon />}
        onClick={handleOpenBatchDialog}
      >
        Batch Analysis
      </Button>
      
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<RotateLeftIcon />}
        onClick={handleReset}
      >
        Reset
      </Button>
    </Box>
  );

  // Function to export a chart image directly to PDF
  const exportChartImageToPdf = async (chartImageUrl: string, title: string) => {
    if (!chartImageUrl || !results) return;
    
    setIsPdfExporting(true);
    
    try {
      const options: PdfExportOptions = {
        ...pdfExportOptions,
        title: title,
        fileName: `conductor-comparison-${new Date().getTime()}.pdf`,
        showVisualization: true
      };
      
      // Use the exportVoltageDropToPdf but with custom chart image
      await exportVoltageDropToPdf(
        {
          ...inputs,
          circuitConfiguration: circuitConfig
        },
        results,
        chartImageUrl,
        options
      );
      
      showNotification('Comparison exported to PDF', 'success');
    } catch (error) {
      console.error('Error exporting chart to PDF:', error);
      setError('Failed to export chart to PDF.');
    } finally {
      setIsPdfExporting(false);
    }
  };

  // Add handler to handle loading a circuit from Schedule of Loads
  const handleLoadCircuit = (circuitData: UnifiedCircuitData) => {
    setLoadedCircuitData(circuitData);
    
    // Convert the unified circuit data to voltage drop inputs
    const voltageDropInputs = unifiedCircuitToVoltageDropInputs(circuitData);
    
    // Update form state with the loaded circuit data
    setInputs({
      systemVoltage: voltageDropInputs.systemVoltage,
      loadCurrent: voltageDropInputs.loadCurrent,
      conductorLength: voltageDropInputs.conductorLength,
      conductorSize: voltageDropInputs.conductorSize,
      conductorMaterial: voltageDropInputs.conductorMaterial,
      conduitMaterial: voltageDropInputs.conduitMaterial,
      phaseConfiguration: voltageDropInputs.phaseConfiguration,
      temperature: voltageDropInputs.temperature,
      powerFactor: voltageDropInputs.powerFactor || 0.85
    });
    
    setCircuitConfig(voltageDropInputs.circuitConfiguration);
    
    // Reset calculation results when loading a new circuit
    setIsCalculated(false);
    setResults(null);
    
    setLoadCircuitDialogOpen(false);
    
    // Show notification that circuit was loaded
    showNotification(`Loaded ${circuitData.name} from Schedule of Loads`, 'success');
  };

  return (
    <Box sx={{ pb: 4 }}>
      {fieldAssessmentMode ? (
        renderFieldAssessmentUI()
      ) : (
        <>
          <Typography variant="h4" component="h1" gutterBottom>
            Voltage Drop Calculator
          </Typography>
          
          {/* Add synchronization panel */}
          <SynchronizationPanel />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="voltage drop calculator tabs"
            >
              <Tab label="Calculator" {...a11yProps(0)} />
              <Tab label="Visualization" {...a11yProps(1)} />
              <Tab label="Conductor Comparison" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: { xs: 2, md: 3 } }}>
              {renderCircuitTypeSelection()}
              {renderCircuitParameters()}
              {renderActionButtons()}
              {isCalculated && results ? renderResults() : null}
              {error ? renderError() : null}
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: { xs: 2, md: 3 } }}>
              {results && (
                <VoltageDropVisualization 
                  inputs={buildVoltageDropInputs()}
                  results={results}
                  isCalculated={isCalculated}
                  ref={visualizationRef}
                />
              )}
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: { xs: 2, md: 3 } }}>
              {results && (
                <ConductorComparisonView 
                  inputs={buildVoltageDropInputs()}
                  results={results}
                  isCalculated={isCalculated}
                  ref={conductorComparisonChartRef}
                />
              )}
            </Paper>
          </TabPanel>
        </>
      )}
      
      {/* Dialogs and notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Saved Calculations Dialog */}
      <Dialog
        open={savedCalcsDialogOpen}
        onClose={() => setSavedCalcsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Saved Voltage Drop Calculations</DialogTitle>
        <DialogContent>
          <SavedCalculationsViewer
            calculationType="voltage-drop"
            onLoadCalculation={handleLoadCalculation}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedCalcsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* PDF Export Dialog */}
      <Dialog
        open={pdfDialogOpen}
        onClose={() => !isPdfExporting && setPdfDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Export to PDF</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Configure PDF export options:
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Title"
                name="title"
                value={pdfExportOptions.title}
                onChange={handlePdfOptionChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Paper Size</InputLabel>
                <Select
                  name="paperSize"
                  value={pdfExportOptions.paperSize}
                  onChange={handlePdfOptionChange as any}
                  label="Paper Size"
                >
                  <MenuItem value="a4">A4</MenuItem>
                  <MenuItem value="letter">Letter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Orientation</InputLabel>
                <Select
                  name="orientation"
                  value={pdfExportOptions.orientation}
                  onChange={handlePdfOptionChange as any}
                  label="Orientation"
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pdfExportOptions.showVisualization}
                      onChange={handlePdfOptionChange}
                      name="showVisualization"
                    />
                  }
                  label="Include Visualizations"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pdfExportOptions.includeRecommendations}
                      onChange={handlePdfOptionChange}
                      name="includeRecommendations"
                    />
                  }
                  label="Include Recommendations"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPdfDialogOpen(false)}
            disabled={isPdfExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportToPdf}
            variant="contained"
            color="primary"
            startIcon={isPdfExporting ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
            disabled={isPdfExporting}
          >
            {isPdfExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Load Circuit Template</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Select a template to quickly set up a common circuit configuration:
          </DialogContentText>
          
          {availableTemplates.length === 0 ? (
            <Alert severity="info">
              No templates available for the selected circuit type.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {availableTemplates.map((template) => (
                <Grid item xs={12} key={template.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {template.description}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Processing Dialog */}
      <BatchProcessingDialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        baseInputs={buildVoltageDropInputs()}
        onViewResults={handleBatchResults}
      />

      {/* Load Circuit Dialog */}
      <LoadCircuitDialog 
        open={loadCircuitDialogOpen}
        onClose={() => setLoadCircuitDialogOpen(false)}
        onLoadCircuit={handleLoadCircuit}
      />
    </Box>
  );
};

export default VoltageDropCalculator; 