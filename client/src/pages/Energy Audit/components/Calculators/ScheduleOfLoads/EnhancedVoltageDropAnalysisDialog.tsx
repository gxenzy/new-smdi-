import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ElectricalServices as ElectricalServicesIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Compare as CompareIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  SettingsEthernet as CircuitIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule, INSULATION_TYPE_OPTIONS } from './types';
import { 
  unifiedCircuitToVoltageDropInputs,
  loadItemToUnifiedCircuit,
  loadScheduleToUnifiedCircuit,
  updateLoadItemWithVoltageDropResults,
  updateLoadScheduleWithVoltageDropResults,
  UnifiedCircuitData
} from '../utils/circuitDataExchange';
import { calculateEnhancedVoltageDropResults, findEnhancedMinimumConductorSize, EnhancedVoltageDropInputs, InsulationType } from '../utils/enhancedVoltageDropUtils';
import EnhancedVoltageDropVisualization from '../EnhancedVoltageDropVisualization';
import { VoltageDropResult } from '../utils/voltageDropUtils';
import { CONDUCTOR_SIZES } from '../utils/voltageRegulationUtils';
import { circuitChangeTracker } from '../utils/circuitChangeTracker';
import { voltageDropRecalculator, VoltageDropRecalculator, RecalculationEvent } from '../utils/voltageDropRecalculator';
import RecalculationStatusIndicator from './RecalculationStatusIndicator';
import VoltageProfileChart from '../VoltageProfileChart';
import CircuitDiagram from '../CircuitDiagram';
import ComplianceMeter from '../ComplianceMeter';
import ComplianceVisualization from '../ComplianceVisualization';

// Create a type that extends UnifiedCircuitData for our enhanced properties
interface EnhancedCircuitData extends UnifiedCircuitData {
  insulationType: InsulationType;
  ambientTemperature: number;
  harmonicFactor: number;
  parallelSets: number;
  bundleAdjustmentFactor: number;
}

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
      id={`voltage-drop-analysis-tabpanel-${index}`}
      aria-labelledby={`voltage-drop-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface EnhancedVoltageDropAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  loadItem?: LoadItem | null;
  loadSchedule: LoadSchedule;
  onSaveResults: (
    loadItem: LoadItem | null,
    updatedLoadSchedule: LoadSchedule
  ) => void;
}

const EnhancedVoltageDropAnalysisDialog: React.FC<EnhancedVoltageDropAnalysisDialogProps> = ({
  open,
  onClose,
  loadItem,
  loadSchedule,
  onSaveResults
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [circuitData, setCircuitData] = useState<EnhancedCircuitData | null>(null);
  const [voltageDropInputs, setVoltageDropInputs] = useState<EnhancedVoltageDropInputs | null>(null);
  const [calculationResults, setCalculationResults] = useState<VoltageDropResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizedSize, setOptimizedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRecalculate, setAutoRecalculate] = useState<boolean>(true);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [alternativeSizes, setAlternativeSizes] = useState<string[]>([]);
  const [alternativeResults, setAlternativeResults] = useState<Record<string, VoltageDropResult>>({});
  const [recalculator, setRecalculator] = useState<VoltageDropRecalculator | null>(null);
  const [visualizationTab, setVisualizationTab] = useState<number>(0);
  
  // Initialize circuit data from load item or load schedule
  useEffect(() => {
    if (open) {
      let initialUnifiedCircuitData: UnifiedCircuitData;
      
      if (loadItem) {
        // We're analyzing a specific load item
        initialUnifiedCircuitData = loadItemToUnifiedCircuit(
          loadItem,
          loadSchedule.voltage,
          loadSchedule.powerFactor
        );
        
        // Pre-populate with existing values if available
        if (loadItem.conductorLength) {
          initialUnifiedCircuitData.conductorLength = loadItem.conductorLength;
        }
      } else {
        // We're analyzing the entire panel
        initialUnifiedCircuitData = loadScheduleToUnifiedCircuit(loadSchedule);
        
        // Pre-populate with existing values if available
        if (loadSchedule.conductorLength) {
          initialUnifiedCircuitData.conductorLength = loadSchedule.conductorLength;
        }
        
        if (loadSchedule.phaseConfiguration) {
          initialUnifiedCircuitData.phaseConfiguration = loadSchedule.phaseConfiguration;
        }
      }
      
      // Add enhanced properties with default values
      const initialCircuitData: EnhancedCircuitData = {
        ...initialUnifiedCircuitData,
        insulationType: (loadItem?.insulationType || loadSchedule.insulationType || 'THWN') as InsulationType,
        ambientTemperature: loadItem?.ambientTemperature || loadSchedule.ambientTemperature || 30,
        harmonicFactor: loadItem?.harmonicFactor || loadSchedule.harmonicFactor || 1.0,
        parallelSets: loadItem?.parallelSets || loadSchedule.parallelSets || 1,
        bundleAdjustmentFactor: loadItem?.bundleAdjustmentFactor || loadSchedule.bundleAdjustmentFactor || 1.0
      };
      
      setCircuitData(initialCircuitData);
      setVoltageDropInputs(unifiedCircuitToVoltageDropInputs(initialCircuitData) as EnhancedVoltageDropInputs);
      
      // Reset calculation state
      setCalculationResults(null);
      setOptimizedSize(null);
      setError(null);
      setTabValue(0);
      setAlternativeSizes([]);
      setAlternativeResults({});
    }
  }, [open, loadItem, loadSchedule]);
  
  // Initialize the recalculator with a circuit data provider
  useEffect(() => {
    // Create a function to get circuit data by ID
    const getCircuitData = (circuitId: string): UnifiedCircuitData | undefined => {
      if (circuitData && circuitData.id === circuitId) {
        return circuitData;
      }
      return undefined;
    };

    // Create the recalculator
    const newRecalculator = new VoltageDropRecalculator(getCircuitData);
    newRecalculator.setEnabled(autoRecalculate);
    setRecalculator(newRecalculator);

    return () => {
      // Clean up by clearing pending recalculations
      newRecalculator.clearPendingRecalculations();
    };
  }, [autoRecalculate, circuitData]);
  
  // Handle input changes
  const handleNumberInputChange = (field: keyof EnhancedCircuitData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!circuitData) return;
    
    const value = Number(event.target.value);
    const updatedCircuitData = {
      ...circuitData,
      [field]: value
    };
    
    setCircuitData(updatedCircuitData);
    setVoltageDropInputs(unifiedCircuitToVoltageDropInputs(updatedCircuitData) as EnhancedVoltageDropInputs);
    
    // Reset calculation results when inputs change
    setCalculationResults(null);
    
    // If auto-recalculate is enabled, trigger calculation after a delay
    if (autoRecalculate) {
      // Track the change for circuit change tracker
      if (loadItem) {
        circuitChangeTracker.trackChange(
          loadItem.id,
          field,
          circuitData[field],
          value
        );
      }
      
      // Trigger calculation
      handleCalculate();
    }
  };

  // Handle select changes
  const handleSelectChange = (field: keyof EnhancedCircuitData) => (
    event: SelectChangeEvent<string>
  ) => {
    if (!circuitData) return;
    
    const value = event.target.value;
    const updatedCircuitData = {
      ...circuitData,
      [field]: value
    };
    
    setCircuitData(updatedCircuitData);
    setVoltageDropInputs(unifiedCircuitToVoltageDropInputs(updatedCircuitData) as EnhancedVoltageDropInputs);
    
    // Reset calculation results when inputs change
    setCalculationResults(null);
    
    // If auto-recalculate is enabled, trigger calculation after a delay
    if (autoRecalculate) {
      // Track the change for circuit change tracker
      if (loadItem) {
        circuitChangeTracker.trackChange(
          loadItem.id,
          field,
          circuitData[field],
          value
        );
      }
      
      // Trigger calculation
      handleCalculate();
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Calculate voltage drop
  const handleCalculate = () => {
    if (!voltageDropInputs) return;
    
    setError(null);
    setIsCalculating(true);
    
    try {
      // Calculate results
      const results = calculateEnhancedVoltageDropResults(voltageDropInputs);
      setCalculationResults(results);
      
      // Find optimized conductor size
      const optimized = findEnhancedMinimumConductorSize(voltageDropInputs);
      setOptimizedSize(optimized);
      
      // Generate alternative sizes results
      if (advancedMode) {
        generateAlternativeSizesResults(voltageDropInputs);
      }
      
      // Switch to results tab if not auto-recalculate
      if (!autoRecalculate) {
        setTabValue(1);
      }
      
      setIsCalculating(false);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsCalculating(false);
    }
  };
  
  // Generate results for alternative conductor sizes
  const generateAlternativeSizesResults = (inputs: EnhancedVoltageDropInputs) => {
    // Get available conductor sizes for comparison
    const availableSizes = Object.keys(CONDUCTOR_SIZES)
      .filter(size => 
        // Filter to include only a few sizes above and below the current size
        CONDUCTOR_SIZES[size] !== CONDUCTOR_SIZES[inputs.conductorSize]
      )
      .sort((a, b) => CONDUCTOR_SIZES[a] - CONDUCTOR_SIZES[b]);
    
    // Take a few sizes above and below
    const currentSizeIndex = availableSizes.findIndex(
      size => CONDUCTOR_SIZES[size] > CONDUCTOR_SIZES[inputs.conductorSize]
    ) - 1;
    
    const startIndex = Math.max(0, currentSizeIndex - 2);
    const endIndex = Math.min(availableSizes.length - 1, currentSizeIndex + 3);
    
    const sizesToCompare = availableSizes.slice(startIndex, endIndex + 1);
    setAlternativeSizes(sizesToCompare);
    
    // Calculate results for each alternative size
    const results: Record<string, VoltageDropResult> = {};
    
    sizesToCompare.forEach(size => {
      const sizeInputs: EnhancedVoltageDropInputs = {
        ...inputs,
        conductorSize: size
      };
      
      results[size] = calculateEnhancedVoltageDropResults(sizeInputs);
    });
    
    setAlternativeResults(results);
  };
  
  // Save results and close dialog
  const handleSaveResults = () => {
    if (!circuitData || !calculationResults) return;
    
    try {
      let updatedLoadSchedule = { ...loadSchedule };
      
      if (loadItem) {
        // Update the specific load item
        const updatedItem = updateLoadItemWithVoltageDropResults(
          loadItem,
          calculationResults.voltageDropPercent,
          calculationResults.voltageDrop,
          calculationResults.receivingEndVoltage,
          calculationResults.compliance === 'compliant',
          circuitData.conductorLength,
          optimizedSize || undefined
        );
        
        // Add enhanced properties if in advanced mode
        if (advancedMode) {
          updatedItem.insulationType = circuitData.insulationType;
          updatedItem.ambientTemperature = circuitData.ambientTemperature;
          updatedItem.harmonicFactor = circuitData.harmonicFactor;
          updatedItem.parallelSets = circuitData.parallelSets;
          updatedItem.bundleAdjustmentFactor = circuitData.bundleAdjustmentFactor;
        }
        
        // Update the load item in the schedule
        updatedLoadSchedule = {
          ...loadSchedule,
          loads: loadSchedule.loads.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
        };
        
        onSaveResults(updatedItem, updatedLoadSchedule);
      } else {
        // Update the entire panel/load schedule
        updatedLoadSchedule = updateLoadScheduleWithVoltageDropResults(
          loadSchedule,
          calculationResults.voltageDropPercent,
          calculationResults.voltageDrop,
          calculationResults.receivingEndVoltage,
          calculationResults.compliance === 'compliant',
          circuitData.conductorLength,
          optimizedSize || undefined,
          circuitData.phaseConfiguration
        );
        
        // Add enhanced properties if in advanced mode
        if (advancedMode) {
          updatedLoadSchedule.insulationType = circuitData.insulationType;
          updatedLoadSchedule.ambientTemperature = circuitData.ambientTemperature;
          updatedLoadSchedule.harmonicFactor = circuitData.harmonicFactor;
          updatedLoadSchedule.parallelSets = circuitData.parallelSets;
          updatedLoadSchedule.bundleAdjustmentFactor = circuitData.bundleAdjustmentFactor;
        }
        
        onSaveResults(null, updatedLoadSchedule);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving results:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving results');
    }
  };
  
  // Toggle advanced mode
  const handleToggleAdvancedMode = () => {
    setAdvancedMode(!advancedMode);
    
    // If turning on advanced mode, generate alternative sizes results
    if (!advancedMode && voltageDropInputs && calculationResults) {
      generateAlternativeSizesResults(voltageDropInputs);
    }
  };

  // Handle toggling automatic recalculation
  const handleToggleAutoRecalculate = useCallback(() => {
    setAutoRecalculate(prev => !prev);
    if (recalculator) {
      recalculator.setEnabled(!autoRecalculate);
    }
  }, [autoRecalculate, recalculator]);

  // Add a handler for recalculation events to update results
  useEffect(() => {
    if (!recalculator || !circuitData) return;

    const handleRecalculationEvent = (event: RecalculationEvent) => {
      if (event.completed && event.circuitIds.includes(circuitData.id) && event.results[circuitData.id]) {
        // Convert VoltageDropCalculationResult to VoltageDropResult
        const calculationResult = event.results[circuitData.id];
        const voltageDropResult = {
          ...calculationResult,
          // Add any missing properties required by VoltageDropResult type
          reactiveLoss: 0, // Default value since it's missing in VoltageDropCalculationResult
        };
        
        // Update the results from the recalculation
        setCalculationResults(voltageDropResult);
      }
    };

    const removeListener = recalculator.addRecalculationListener(handleRecalculationEvent);

    // Initial calculation request
    recalculator.requestRecalculation(circuitData.id);

    return () => {
      removeListener();
    };
  }, [recalculator, circuitData]);
  
  // Create handler for visualization tab changes
  const handleVisualizationTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setVisualizationTab(newValue);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <ElectricalServicesIcon sx={{ mr: 1 }} />
            {loadItem ? 'Circuit Voltage Drop Analysis' : 'Panel Voltage Drop Analysis'}
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRecalculate}
                  onChange={handleToggleAutoRecalculate}
                  size="small"
                />
              }
              label="Auto-recalculate"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={advancedMode}
                  onChange={handleToggleAdvancedMode}
                  size="small"
                />
              }
              label="Advanced mode"
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label="Input Parameters"
            icon={<SettingsIcon />}
            id="voltage-drop-analysis-tab-0"
            aria-controls="voltage-drop-analysis-tabpanel-0"
          />
          <Tab
            label="Results & Visualization"
            icon={<CalculateIcon />}
            id="voltage-drop-analysis-tab-1"
            aria-controls="voltage-drop-analysis-tabpanel-1"
            disabled={!calculationResults}
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Conductor Length"
                type="number"
                fullWidth
                margin="normal"
                value={circuitData?.conductorLength || ''}
                onChange={handleNumberInputChange('conductorLength')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Size</InputLabel>
                <Select
                  value={circuitData?.conductorSize || ''}
                  onChange={handleSelectChange('conductorSize')}
                  label="Conductor Size"
                >
                  {Object.keys(CONDUCTOR_SIZES).map(size => (
                    <MenuItem key={size} value={size}>
                      {size} ({CONDUCTOR_SIZES[size]} cmil)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conductor Material</InputLabel>
                <Select
                  value={circuitData?.conductorMaterial || 'copper'}
                  onChange={handleSelectChange('conductorMaterial')}
                  label="Conductor Material"
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Conduit Material</InputLabel>
                <Select
                  value={circuitData?.conduitMaterial || 'PVC'}
                  onChange={handleSelectChange('conduitMaterial')}
                  label="Conduit Material"
                >
                  <MenuItem value="PVC">PVC</MenuItem>
                  <MenuItem value="steel">Steel</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Phase Configuration</InputLabel>
                <Select
                  value={circuitData?.phaseConfiguration || 'single-phase'}
                  onChange={handleSelectChange('phaseConfiguration')}
                  label="Phase Configuration"
                >
                  <MenuItem value="single-phase">Single-phase</MenuItem>
                  <MenuItem value="three-phase">Three-phase</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Power Factor"
                type="number"
                fullWidth
                margin="normal"
                value={circuitData?.powerFactor || ''}
                onChange={handleNumberInputChange('powerFactor')}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />
            </Grid>
            
            {advancedMode && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Advanced Parameters" />
                  </Divider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Insulation Type</InputLabel>
                    <Select
                      value={circuitData?.insulationType || 'THWN'}
                      onChange={handleSelectChange('insulationType')}
                      label="Insulation Type"
                    >
                      {INSULATION_TYPE_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ambient Temperature"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={circuitData?.ambientTemperature || 30}
                    onChange={handleNumberInputChange('ambientTemperature')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">°C</InputAdornment>
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Harmonic Factor"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={circuitData?.harmonicFactor || 1.0}
                    onChange={handleNumberInputChange('harmonicFactor')}
                    helperText="Factor for harmonic content (1.0 = no harmonics)"
                    inputProps={{ min: 1, step: 0.1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Parallel Sets"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={circuitData?.parallelSets || 1}
                    onChange={handleNumberInputChange('parallelSets')}
                    helperText="Number of parallel conductor sets"
                    inputProps={{ min: 1, step: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bundle Adjustment Factor"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={circuitData?.bundleAdjustmentFactor || 1.0}
                    onChange={handleNumberInputChange('bundleAdjustmentFactor')}
                    helperText="Derating factor for bundled conductors"
                    inputProps={{ min: 0.1, max: 1, step: 0.05 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {!autoRecalculate && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                disabled={isCalculating}
              >
                {isCalculating ? <CircularProgress size={24} /> : 'Calculate Voltage Drop'}
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {calculationResults && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Voltage Drop Results
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 1
                          }}>
                            <ComplianceMeter
                              value={calculationResults.voltageDropPercent}
                              threshold={calculationResults.maxAllowedDrop}
                              label="Voltage Drop Compliance"
                              showDetails={true}
                              size="medium"
                              animated={true}
                              description={`PEC 2017 maximum allowed voltage drop: ${calculationResults.maxAllowedDrop}%`}
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Analysis Summary
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mb: 1,
                              color: calculationResults.compliance === 'compliant' ? 'success.main' : 'error.main'
                            }}>
                              {calculationResults.compliance === 'compliant' ? (
                                <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                              ) : (
                                <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                              )}
                              <Typography variant="subtitle1">
                                {calculationResults.compliance === 'compliant' ? 'Compliant' : 'Non-compliant'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Voltage Drop:</Typography>
                          <Typography variant="body1">
                            {calculationResults.voltageDropPercent.toFixed(2)}% ({calculationResults.voltageDrop.toFixed(2)} V)
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Max Allowed:</Typography>
                          <Typography variant="body1">
                            {calculationResults.maxAllowedDrop}%
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Receiving Voltage:</Typography>
                          <Typography variant="body1">
                            {calculationResults.receivingEndVoltage.toFixed(2)} V
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Wire Rating:</Typography>
                          <Typography 
                            variant="body1"
                            color={calculationResults.wireRating.isAdequate ? 'success.main' : 'error.main'}
                          >
                            {calculationResults.wireRating.ampacity.toFixed(1)} A 
                            {calculationResults.wireRating.isAdequate ? ' (Adequate)' : ' (Inadequate)'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Power Loss:</Typography>
                          <Typography variant="body1">
                            {calculationResults.totalLoss.toFixed(2)} W (Resistive: {calculationResults.resistiveLoss.toFixed(2)} W)
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>
                      
                      {optimizedSize && optimizedSize !== circuitData?.conductorSize && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Recommended Conductor Size:
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'primary.main'
                          }}>
                            <CompareIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography>
                              {optimizedSize} (Current: {circuitData?.conductorSize})
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Analysis:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {calculationResults.recommendations.map((recommendation, index) => (
                            <Box component="li" key={index} sx={{ mb: 0.5 }}>
                              <Typography variant="body2">{recommendation}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <EnhancedVoltageDropVisualization
                inputs={voltageDropInputs as EnhancedVoltageDropInputs}
                results={calculationResults}
                alternativeSizes={alternativeSizes}
                alternativeResults={alternativeResults}
                isLoading={isCalculating}
              />
              
              <Box sx={{ mt: 3 }}>
                <Tabs 
                  value={visualizationTab} 
                  onChange={handleVisualizationTabChange} 
                  variant="fullWidth"
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab 
                    label="Voltage Profile" 
                    icon={<ElectricalServicesIcon fontSize="small" />} 
                    id="voltage-visualization-tab-0" 
                  />
                  <Tab 
                    label="Circuit Diagram" 
                    icon={<CircuitIcon fontSize="small" />} 
                    id="voltage-visualization-tab-1" 
                  />
                  <Tab 
                    label="Compliance" 
                    icon={<CheckCircleIcon fontSize="small" />} 
                    id="voltage-visualization-tab-2" 
                  />
                </Tabs>
                
                <Box hidden={visualizationTab !== 0}>
                  {calculationResults && circuitData && (
                    <VoltageProfileChart
                      circuitData={circuitData}
                      voltageDropResult={{
                        ...calculationResults,
                        // Add any missing properties required by VoltageProfileChart
                        // Make sure the types match correctly
                      }}
                      showReferenceLine={true}
                      interactive={true}
                      height={300}
                      onPointHover={(distance, voltage) => {
                        console.log(`Voltage at ${distance}m: ${voltage}V`);
                      }}
                    />
                  )}
                </Box>
                
                <Box hidden={visualizationTab !== 1}>
                  {calculationResults && circuitData && (
                    <CircuitDiagram
                      circuitData={circuitData}
                      voltageDropResult={{
                        ...calculationResults,
                        // Convert VoltageDropResult to VoltageDropCalculationResult if needed
                      }}
                      highlightMode="voltage"
                      showAnimation={true}
                      animationSpeed={1}
                      showLabels={true}
                      interactive={true}
                      height={350}
                      onComponentClick={(componentId) => {
                        console.log(`Component clicked: ${componentId}`);
                      }}
                    />
                  )}
                </Box>
                
                <Box hidden={visualizationTab !== 2}>
                  {calculationResults && circuitData && (
                    <ComplianceVisualization 
                      circuitData={circuitData}
                      voltageDropResult={calculationResults}
                      showStandardsReferences={true}
                      showEducationalInfo={true}
                      onReferenceClick={(reference) => {
                        console.log(`Reference clicked: ${reference}`);
                        // TODO: Navigate to standards reference or show dialog
                      }}
                    />
                  )}
                </Box>
              </Box>
            </>
          )}
        </TabPanel>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRecalculate}
                onChange={handleToggleAutoRecalculate}
                color="primary"
              />
            }
            label="Auto-recalculate when circuit properties change"
          />
          
          {recalculator && (
            <Box sx={{ mt: 1 }}>
              <RecalculationStatusIndicator 
                recalculator={recalculator}
                onToggleEnabled={handleToggleAutoRecalculate}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        
        {!autoRecalculate && calculationResults && tabValue === 0 && (
          <Button
            onClick={() => setTabValue(1)}
            variant="outlined"
            color="primary"
            startIcon={<CalculateIcon />}
          >
            View Results
          </Button>
        )}
        
        {calculationResults && (
          <Button
            onClick={handleSaveResults}
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Save Results
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedVoltageDropAnalysisDialog; 