import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Chip,
  Switch
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ElectricalServices as ElectricalServicesIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  SaveAlt as SaveAltIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Upgrade as UpgradeIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule } from './types';
import { 
  unifiedCircuitToVoltageDropInputs,
  loadItemToUnifiedCircuit,
  updateLoadItemWithVoltageDropResults
} from '../utils/circuitDataExchange';
import { 
  VoltageDropInputs, 
  VoltageDropResult,
  calculateVoltageDropResults,
  findOptimalConductorSize,
  CircuitType
} from '../utils/voltageDropUtils';
import { 
  optimizeCircuit,
  optimizeAllCircuits,
  getOptimizationRecommendation,
  calculateOptimizationROI,
  CircuitOptimizationResult,
  BatchOptimizationResult
} from '../utils/circuitOptimizationUtils';
import { exportBatchVoltageDropToPdf } from '../utils/batchVoltageDropReport';
import { voltageDropRecalculator, VoltageDropRecalculator, RecalculationEvent } from '../utils/voltageDropRecalculator';
import RecalculationStatusIndicator from './RecalculationStatusIndicator';
import { UnifiedCircuitData } from '../utils/CircuitSynchronization';

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
      id={`batch-voltage-drop-analysis-tabpanel-${index}`}
      aria-labelledby={`batch-voltage-drop-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface BatchVoltageDropAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedule: LoadSchedule;
  onSaveResults: (updatedLoadSchedule: LoadSchedule) => void;
}

interface BatchAnalysisResult {
  loadItem: LoadItem;
  result: VoltageDropResult | null;
  optimizedSize: string | null;
  error: string | null;
  voltageDropPercent: number | null;
  isCompliant: boolean | null;
  optimizationResult?: CircuitOptimizationResult | null;
}

const BatchVoltageDropAnalysisDialog: React.FC<BatchVoltageDropAnalysisDialogProps> = ({
  open,
  onClose,
  loadSchedule,
  onSaveResults
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<BatchAnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    compliantOnly: false,
    nonCompliantOnly: false,
    withErrors: false,
    needsOptimization: false
  });
  const [analysisParams, setAnalysisParams] = useState({
    conductorLength: loadSchedule.conductorLength || 30,
    conductorMaterial: 'copper',
    conduitMaterial: 'PVC',
    temperature: 30,
    phaseConfiguration: loadSchedule.phaseConfiguration || 'single-phase',
    circuitType: 'branch'
  });
  const [optimizationParams, setOptimizationParams] = useState({
    operatingHoursPerYear: 2500, // ~7 hours per day
    energyCostPerKwh: 0.12,      // USD per kWh
    includeOptimization: true
  });
  const [summaryStats, setSummaryStats] = useState({
    totalCircuits: 0,
    compliantCircuits: 0,
    nonCompliantCircuits: 0,
    errorCircuits: 0,
    avgVoltageDropPercent: 0,
    maxVoltageDropPercent: 0,
    circuitsNeedingOptimization: 0,
    totalMaterialCostChange: 0,
    totalEnergySavingsAnnual: 0
  });
  const [optimizationResults, setOptimizationResults] = useState<BatchOptimizationResult | null>(null);
  const [pdfExportOptions, setPdfExportOptions] = useState({
    title: `Voltage Drop Analysis - ${loadSchedule.panelName}`,
    includeOptimizationSuggestions: true,
    includeNoncompliantOnly: false,
    paperSize: 'a4' as 'a4' | 'letter',
    orientation: 'landscape' as 'portrait' | 'landscape'
  });
  const [autoRecalculate, setAutoRecalculate] = useState<boolean>(true);
  const [recalculator, setRecalculator] = useState<VoltageDropRecalculator | null>(null);
  const [batchResults, setBatchResults] = useState<Record<string, VoltageDropResult>>({});

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsAnalyzing(false);
      setProgress(0);
      setAnalysisResults([]);
      setTabValue(0);
      setAnalysisParams({
        conductorLength: loadSchedule.conductorLength || 30,
        conductorMaterial: 'copper',
        conduitMaterial: 'PVC',
        temperature: 30,
        phaseConfiguration: loadSchedule.phaseConfiguration || 'single-phase',
        circuitType: 'branch'
      });
    }
  }, [open, loadSchedule]);

  // Initialize the recalculator
  useEffect(() => {
    if (!loadSchedule) return;

    // Create a function to get circuit data by ID
    const getCircuitData = (circuitId: string): UnifiedCircuitData | undefined => {
      const loadItem = loadSchedule.loads.find(item => item.id === circuitId);
      
      if (loadItem) {
        return loadItemToUnifiedCircuit(
          loadItem,
          loadSchedule.voltage,
          loadSchedule.powerFactor
        );
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
  }, [loadSchedule, autoRecalculate]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle parameter changes
  const handleParamChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setAnalysisParams({
      ...analysisParams,
      [field]: event.target.value
    });
  };

  // Handle optimization parameter changes
  const handleOptimizationParamChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setOptimizationParams({
      ...optimizationParams,
      [field]: event.target.value
    });
  };

  // Handle boolean optimization parameter changes
  const handleBooleanOptimizationParamChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOptimizationParams({
      ...optimizationParams,
      [field]: event.target.checked
    });
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof typeof filterOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterOptions({
      ...filterOptions,
      [field]: event.target.checked
    });
  };

  // Handle search term changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter results based on search and filter options
  const getFilteredResults = () => {
    return analysisResults.filter(item => {
      // Apply search filter
      const matchesSearch = item.loadItem.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply compliance filters
      const matchesCompliance = 
        (filterOptions.compliantOnly && item.isCompliant === true) ||
        (filterOptions.nonCompliantOnly && item.isCompliant === false) ||
        (filterOptions.withErrors && item.error !== null) ||
        (filterOptions.needsOptimization && 
          item.optimizationResult && 
          (item.optimizationResult.priority === 'critical' || item.optimizationResult.priority === 'high')) ||
        (!filterOptions.compliantOnly && 
         !filterOptions.nonCompliantOnly && 
         !filterOptions.withErrors &&
         !filterOptions.needsOptimization);
      
      return matchesSearch && matchesCompliance;
    });
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
    if (!recalculator || !loadSchedule) return;

    const handleRecalculationEvent = (event: RecalculationEvent) => {
      if (event.completed && event.results) {
        // Update batch results with new voltage drop calculations
        const newBatchResults = { ...batchResults };
        
        event.circuitIds.forEach(circuitId => {
          if (event.results[circuitId]) {
            // Convert VoltageDropCalculationResult to VoltageDropResult
            // by adding any missing properties required by VoltageDropResult
            const calculationResult = event.results[circuitId];
            const voltageDropResult: VoltageDropResult = {
              ...calculationResult,
              // Add missing properties required by VoltageDropResult
              reactiveLoss: 0, // Default value since it's missing in VoltageDropCalculationResult
            };
            
            newBatchResults[circuitId] = voltageDropResult;
          }
        });
        
        setBatchResults(newBatchResults);
        
        // Update progress
        const totalCircuits = loadSchedule.loads.length;
        const processedCircuits = Object.keys(newBatchResults).length;
        setProgress((processedCircuits / totalCircuits) * 100);
        
        // Check if all circuits have been processed
        if (processedCircuits === totalCircuits) {
          setIsAnalyzing(false);
        }
      }
    };

    const removeListener = recalculator.addRecalculationListener(handleRecalculationEvent);

    return () => {
      removeListener();
    };
  }, [recalculator, loadSchedule, batchResults]);

  // Modify the calculateAll function to use the recalculator
  const calculateAll = useCallback(() => {
    if (!loadSchedule || !recalculator) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setBatchResults({});
    
    // Get IDs of all circuits in the load schedule
    const circuitIds = loadSchedule.loads.map(item => item.id);
    
    // Request batch recalculation
    recalculator.requestBatchRecalculation(circuitIds);
  }, [loadSchedule, recalculator]);

  // Start the batch analysis
  const handleStartAnalysis = async () => {
    if (!loadSchedule || !loadSchedule.loads || loadSchedule.loads.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults([]);
    setOptimizationResults(null);

    const results: BatchAnalysisResult[] = [];
    const totalCircuits = loadSchedule.loads.length;
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let errorCount = 0;
    let totalVoltageDropPercent = 0;
    let maxVoltageDropPercent = 0;
    let circuitsNeedingOptimization = 0;
    let totalMaterialCostChange = 0;
    let totalEnergySavingsAnnual = 0;

    // Process each load item
    for (let i = 0; i < loadSchedule.loads.length; i++) {
      const loadItem = loadSchedule.loads[i];
      
      try {
        // Skip items with no current (they can't be analyzed)
        if (!loadItem.current || loadItem.current <= 0) {
          results.push({
            loadItem,
            result: null,
            optimizedSize: null,
            error: "Invalid current value",
            voltageDropPercent: null,
            isCompliant: null,
            optimizationResult: null
          });
          errorCount++;
          continue;
        }

        // Convert to unified format
        const circuitData = loadItemToUnifiedCircuit(
          loadItem,
          loadSchedule.voltage,
          loadSchedule.powerFactor
        );

        // Apply analysis parameters
        circuitData.conductorLength = analysisParams.conductorLength;
        circuitData.conductorMaterial = analysisParams.conductorMaterial as 'copper' | 'aluminum';
        circuitData.conduitMaterial = analysisParams.conduitMaterial as 'PVC' | 'steel' | 'aluminum';
        circuitData.temperature = analysisParams.temperature;
        circuitData.phaseConfiguration = analysisParams.phaseConfiguration as 'single-phase' | 'three-phase';
        circuitData.circuitType = analysisParams.circuitType as CircuitType;

        // Convert to voltage drop inputs
        const voltageDropInputs = unifiedCircuitToVoltageDropInputs(circuitData);

        // Calculate voltage drop
        const result = calculateVoltageDropResults(voltageDropInputs);
        
        // Find optimized conductor size
        const optimizedSize = findOptimalConductorSize(voltageDropInputs);

        // Perform circuit optimization analysis if enabled
        let optimizationResult = null;
        if (optimizationParams.includeOptimization) {
          optimizationResult = optimizeCircuit(
            loadItem,
            loadSchedule.voltage,
            loadSchedule.powerFactor,
            {
              conductorLength: analysisParams.conductorLength,
              circuitType: analysisParams.circuitType as CircuitType,
              conductorMaterial: analysisParams.conductorMaterial as 'copper' | 'aluminum',
              conduitMaterial: analysisParams.conduitMaterial as 'PVC' | 'steel' | 'aluminum',
              phaseConfiguration: analysisParams.phaseConfiguration as 'single-phase' | 'three-phase',
              temperature: analysisParams.temperature,
              operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
              energyCostPerKwh: optimizationParams.energyCostPerKwh
            }
          );
          
          // Update optimization stats
          if (optimizationResult.priority === 'critical' || optimizationResult.priority === 'high') {
            circuitsNeedingOptimization++;
          }
          
          totalMaterialCostChange += optimizationResult.materialCostChange;
          totalEnergySavingsAnnual += optimizationResult.energySavingsAnnual;
        }

        // Update stats
        if (result.compliance === 'compliant') {
          compliantCount++;
        } else {
          nonCompliantCount++;
        }

        totalVoltageDropPercent += result.voltageDropPercent;
        if (result.voltageDropPercent > maxVoltageDropPercent) {
          maxVoltageDropPercent = result.voltageDropPercent;
        }

        // Add to results
        results.push({
          loadItem,
          result,
          optimizedSize,
          error: null,
          voltageDropPercent: result.voltageDropPercent,
          isCompliant: result.compliance === 'compliant',
          optimizationResult
        });
      } catch (error) {
        console.error(`Error analyzing circuit ${loadItem.description}:`, error);
        results.push({
          loadItem,
          result: null,
          optimizedSize: null,
          error: error instanceof Error ? error.message : "Unknown error",
          voltageDropPercent: null,
          isCompliant: null,
          optimizationResult: null
        });
        errorCount++;
      }

      // Update progress
      setProgress(Math.round(((i + 1) / totalCircuits) * 100));
    }

    // If optimization was enabled, generate batch optimization results
    if (optimizationParams.includeOptimization) {
      try {
        const batchOptResults = optimizeAllCircuits(
          loadSchedule,
          {
            conductorLength: analysisParams.conductorLength,
            circuitType: analysisParams.circuitType as CircuitType,
            conductorMaterial: analysisParams.conductorMaterial as 'copper' | 'aluminum',
            conduitMaterial: analysisParams.conduitMaterial as 'PVC' | 'steel' | 'aluminum',
            phaseConfiguration: analysisParams.phaseConfiguration as 'single-phase' | 'three-phase',
            temperature: analysisParams.temperature,
            operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
            energyCostPerKwh: optimizationParams.energyCostPerKwh
          }
        );
        
        setOptimizationResults(batchOptResults);
      } catch (error) {
        console.error("Error performing batch optimization:", error);
      }
    }

    // Calculate summary statistics
    setSummaryStats({
      totalCircuits,
      compliantCircuits: compliantCount,
      nonCompliantCircuits: nonCompliantCount,
      errorCircuits: errorCount,
      avgVoltageDropPercent: totalCircuits > 0 ? totalVoltageDropPercent / (totalCircuits - errorCount) : 0,
      maxVoltageDropPercent,
      circuitsNeedingOptimization,
      totalMaterialCostChange,
      totalEnergySavingsAnnual
    });

    setAnalysisResults(results);
    setIsAnalyzing(false);
    setTabValue(1); // Switch to results tab
  };

  // Apply all results to the load schedule
  const handleApplyAllResults = () => {
    if (!loadSchedule || analysisResults.length === 0) return;

    let updatedLoadSchedule = { ...loadSchedule };
    const updatedLoads = [...loadSchedule.loads];

    // Update each load item with analysis results
    analysisResults.forEach(analysisResult => {
      if (analysisResult.result && analysisResult.loadItem) {
        const { loadItem, result, optimizedSize, voltageDropPercent, optimizationResult } = analysisResult;
        
        // Find the load item in the array
        const index = updatedLoads.findIndex(item => item.id === loadItem.id);
        
        if (index !== -1) {
          // Update the load item with voltage drop results
          updatedLoads[index] = updateLoadItemWithVoltageDropResults(
            loadItem,
            result.voltageDropPercent,
            result.voltageDrop,
            result.receivingEndVoltage,
            result.compliance === 'compliant',
            analysisParams.conductorLength,
            optimizedSize || undefined
          );
          
          // Add optimization metadata if available
          if (optimizationParams.includeOptimization && optimizationResult) {
            updatedLoads[index].optimizationMetadata = {
              priority: optimizationResult.priority,
              materialCostChange: optimizationResult.materialCostChange,
              energySavingsAnnual: optimizationResult.energySavingsAnnual,
              optimizationReason: optimizationResult.optimizationReason
            };
          }
        }
      }
    });

    // Update the load schedule with the modified loads
    updatedLoadSchedule.loads = updatedLoads;
    
    // Add optimization parameters to the load schedule for future reference
    if (optimizationParams.includeOptimization) {
      updatedLoadSchedule.optimizationParams = {
        operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
        energyCostPerKwh: optimizationParams.energyCostPerKwh
      };
    }
    
    onSaveResults(updatedLoadSchedule);
    onClose();
  };

  // Render the parameter configuration
  const renderParameterConfig = () => {
    return (
      <Box>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Panel Information
            </Typography>
            <Typography variant="body1">
              {loadSchedule.panelName} - {loadSchedule.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System Voltage: {loadSchedule.voltage}V
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Power Factor: {loadSchedule.powerFactor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Circuits: {loadSchedule.loads.length}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These parameters will be applied to all circuits during the batch analysis.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Conductor Length"
                  type="number"
                  value={analysisParams.conductorLength}
                  onChange={handleParamChange('conductorLength')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>
                  }}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Circuit Type</InputLabel>
                  <Select
                    value={analysisParams.circuitType}
                    onChange={handleParamChange('circuitType') as any}
                    label="Circuit Type"
                  >
                    <MenuItem value="branch">Branch Circuit</MenuItem>
                    <MenuItem value="feeder">Feeder</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                    <MenuItem value="motor">Motor Circuit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Conductor Material</InputLabel>
                  <Select
                    value={analysisParams.conductorMaterial}
                    onChange={handleParamChange('conductorMaterial') as any}
                    label="Conductor Material"
                  >
                    <MenuItem value="copper">Copper</MenuItem>
                    <MenuItem value="aluminum">Aluminum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Conduit Material</InputLabel>
                  <Select
                    value={analysisParams.conduitMaterial}
                    onChange={handleParamChange('conduitMaterial') as any}
                    label="Conduit Material"
                  >
                    <MenuItem value="PVC">PVC</MenuItem>
                    <MenuItem value="steel">Steel</MenuItem>
                    <MenuItem value="aluminum">Aluminum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Phase Configuration</InputLabel>
                  <Select
                    value={analysisParams.phaseConfiguration}
                    onChange={handleParamChange('phaseConfiguration') as any}
                    label="Phase Configuration"
                  >
                    <MenuItem value="single-phase">Single-Phase</MenuItem>
                    <MenuItem value="three-phase">Three-Phase</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ambient Temperature"
                  type="number"
                  value={analysisParams.temperature}
                  onChange={handleParamChange('temperature')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">°C</InputAdornment>
                  }}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Circuit Optimization Parameters
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={optimizationParams.includeOptimization}
                    onChange={handleBooleanOptimizationParamChange('includeOptimization')}
                    color="primary"
                  />
                }
                label="Enable Optimization"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              These parameters are used to analyze potential optimizations for circuit conductors.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operating Hours per Year"
                  type="number"
                  value={optimizationParams.operatingHoursPerYear}
                  onChange={handleOptimizationParamChange('operatingHoursPerYear')}
                  disabled={!optimizationParams.includeOptimization}
                  margin="normal"
                  helperText="Estimated yearly hours of operation"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Energy Cost"
                  type="number"
                  value={optimizationParams.energyCostPerKwh}
                  onChange={handleOptimizationParamChange('energyCostPerKwh')}
                  disabled={!optimizationParams.includeOptimization}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">per kWh</InputAdornment>
                  }}
                  margin="normal"
                  helperText="Cost of electricity per kWh"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
      </Box>
    );
  };

  // Render the summary statistics
  const renderSummaryStats = () => {
    const compliancePercentage = summaryStats.totalCircuits > 0 
      ? (summaryStats.compliantCircuits / (summaryStats.totalCircuits - summaryStats.errorCircuits)) * 100 
      : 0;
    
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analysis Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Circuits
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.totalCircuits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Compliant
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {summaryStats.compliantCircuits}
                    <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                      ({summaryStats.totalCircuits > 0 ? ((summaryStats.compliantCircuits / (summaryStats.totalCircuits - summaryStats.errorCircuits)) * 100).toFixed(1) : 0}%)
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Non-Compliant
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {summaryStats.nonCompliantCircuits}
                    <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                      ({summaryStats.totalCircuits > 0 ? ((summaryStats.nonCompliantCircuits / (summaryStats.totalCircuits - summaryStats.errorCircuits)) * 100).toFixed(1) : 0}%)
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Errors
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {summaryStats.errorCircuits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Voltage Drop
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.avgVoltageDropPercent.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Maximum Voltage Drop
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.maxVoltageDropPercent.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ bgcolor: optimizationParams.includeOptimization ? 'info.light' : 'background.paper' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Circuits Needing Optimization
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {optimizationParams.includeOptimization ? summaryStats.circuitsNeedingOptimization : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {optimizationParams.includeOptimization && (
              <>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Material Cost Change
                      </Typography>
                      <Typography variant="h4" color={summaryStats.totalMaterialCostChange > 0 ? 'error.main' : 'success.main'}>
                        ${Math.abs(summaryStats.totalMaterialCostChange).toFixed(2)}
                        <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                          ({summaryStats.totalMaterialCostChange > 0 ? 'increase' : 'savings'})
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Annual Energy Savings
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {summaryStats.totalEnergySavingsAnnual.toFixed(2)} kWh
                        <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                          (${(summaryStats.totalEnergySavingsAnnual * optimizationParams.energyCostPerKwh).toFixed(2)}/year)
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render the results table
  const renderResultsTable = () => {
    const filteredResults = getFilteredResults();
    
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search circuits..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              }}
              sx={{ mr: 2 }}
            />
            
            <Tooltip title="Filter Results">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.compliantOnly}
                  onChange={handleFilterChange('compliantOnly')}
                />
              }
              label="Compliant Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.nonCompliantOnly}
                  onChange={handleFilterChange('nonCompliantOnly')}
                />
              }
              label="Non-Compliant Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.withErrors}
                  onChange={handleFilterChange('withErrors')}
                />
              }
              label="Errors Only"
            />
            {optimizationParams.includeOptimization && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.needsOptimization}
                    onChange={handleFilterChange('needsOptimization')}
                  />
                }
                label="Needs Optimization"
              />
            )}
          </Box>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Circuit</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Load</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Conductor Size</TableCell>
                <TableCell align="right">Voltage Drop</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Optimized Size</TableCell>
                {optimizationParams.includeOptimization && (
                  <>
                    <TableCell align="right">Priority</TableCell>
                    <TableCell align="right">Annual Savings</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={optimizationParams.includeOptimization ? 10 : 8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No results match your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((item) => (
                  <TableRow key={item.loadItem.id}>
                    <TableCell>{item.loadItem.id.split('-')[0] || 'N/A'}</TableCell>
                    <TableCell>{item.loadItem.description}</TableCell>
                    <TableCell align="right">{item.loadItem.connectedLoad.toFixed(2)} W</TableCell>
                    <TableCell align="right">{item.loadItem.current?.toFixed(2) || 'N/A'} A</TableCell>
                    <TableCell align="right">{item.loadItem.conductorSize || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {item.error ? (
                        <Tooltip title={item.error}>
                          <Typography variant="body2" color="error">Error</Typography>
                        </Tooltip>
                      ) : (
                        `${item.voltageDropPercent?.toFixed(2) || 'N/A'}%`
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.error ? (
                        <Chip 
                          label="Error" 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      ) : item.isCompliant ? (
                        <Chip 
                          label="Compliant" 
                          size="small" 
                          color="success" 
                          icon={<CheckCircleIcon />} 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Non-Compliant" 
                          size="small" 
                          color="error" 
                          icon={<WarningIcon />} 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.optimizedSize || 'N/A'}
                      {item.optimizedSize && item.loadItem.conductorSize && item.optimizedSize !== item.loadItem.conductorSize && (
                        <Tooltip title="Recommendation: Upgrade conductor size">
                          <UpgradeIcon fontSize="small" color="warning" sx={{ ml: 1, verticalAlign: 'middle' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    {optimizationParams.includeOptimization && (
                      <>
                        <TableCell align="right">
                          {item.optimizationResult ? (
                            <Chip
                              label={item.optimizationResult.priority.charAt(0).toUpperCase() + item.optimizationResult.priority.slice(1)}
                              size="small"
                              color={
                                item.optimizationResult.priority === 'critical' ? 'error' :
                                item.optimizationResult.priority === 'high' ? 'warning' :
                                item.optimizationResult.priority === 'medium' ? 'info' : 'default'
                              }
                              variant="outlined"
                            />
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {item.optimizationResult ? (
                            <>
                              ${(item.optimizationResult.energySavingsAnnual * optimizationParams.energyCostPerKwh).toFixed(2)}
                              <Tooltip title={item.optimizationResult.optimizationReason}>
                                <InfoIcon fontSize="small" color="info" sx={{ ml: 1, verticalAlign: 'middle' }} />
                              </Tooltip>
                            </>
                          ) : 'N/A'}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Add a function to handle PDF export before the return statement
  const handleExportToPdf = () => {
    if (analysisResults.length === 0) return;
    
    exportBatchVoltageDropToPdf(
      loadSchedule,
      analysisResults,
      summaryStats,
      analysisParams,
      pdfExportOptions,
      optimizationParams.includeOptimization ? {
        operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
        energyCostPerKwh: optimizationParams.energyCostPerKwh,
        includeOptimization: true
      } : undefined
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isAnalyzing ? undefined : onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Batch Voltage Drop Analysis</Typography>
          {!isAnalyzing && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {isAnalyzing ? (
          <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
            <Typography variant="body1" gutterBottom>
              Analyzing circuits... ({progress}%)
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
        ) : (
          <>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Parameters" />
              <Tab label="Results" disabled={analysisResults.length === 0} />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              {renderParameterConfig()}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderSummaryStats()}
              {renderResultsTable()}
            </TabPanel>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        {tabValue === 0 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartAnalysis}
            startIcon={<CalculateIcon />}
            disabled={isAnalyzing}
          >
            Start Batch Analysis
          </Button>
        ) : (
          <>
            <Button 
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportToPdf}
              disabled={analysisResults.length === 0}
            >
              Export Report
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyAllResults}
              startIcon={<SaveAltIcon />}
              disabled={analysisResults.length === 0}
            >
              Apply All Results
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BatchVoltageDropAnalysisDialog; 