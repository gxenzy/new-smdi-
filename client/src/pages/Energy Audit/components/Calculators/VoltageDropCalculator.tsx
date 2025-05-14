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
import { 
  saveCalculatorState, 
  loadCalculatorState, 
  hasDraftState, 
  clearDraftState,
  createAutoSave 
} from './utils/calculatorStateStorage';
import CalculatorStateRecoveryDialog from './utils/CalculatorStateRecoveryDialog';

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

// Add VoltageDropState type to represent the complete calculator state
interface VoltageDropState {
  inputs: Omit<VoltageDropInputs, 'circuitConfiguration'>;
  circuitConfig: CircuitConfiguration;
  results: VoltageDropResult | null;
  isCalculated: boolean;
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

  // Add state variables for draft recovery
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');

  // Add state for saved calculations dialog
  const [savedCalcsDialogOpen, setSavedCalcsDialogOpen] = useState(false);
  
  // Add state for PDF export dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  
  // Add state for template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Add state for batch dialog
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  
  // Add state for load circuit dialog
  const [loadCircuitDialogOpen, setLoadCircuitDialogOpen] = useState(false);
  
  // Add state for available templates
  const [availableTemplates, setAvailableTemplates] = useState<VoltageDropTemplate[]>([]);

  // Create auto-save function using the utility
  const autoSave = React.useMemo(() => 
    createAutoSave<VoltageDropState>('voltage-drop', 3000), 
  []);
  
  // Check for draft state on initial load
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      
      // Check if we should show draft recovery dialog
      if (hasDraftState('voltage-drop')) {
        setRecoveryDialogOpen(true);
      }
    }
  }, [isInitialLoad]);
  
  // Set up auto-save when calculator state changes
  useEffect(() => {
    if (!isInitialLoad) {
      // Only auto-save if the user has made meaningful inputs
      if (inputs.loadCurrent > 0 && inputs.conductorLength > 0) {
        const state: VoltageDropState = {
          inputs,
          circuitConfig,
          results,
          isCalculated
        };
        autoSave(state);
      }
    }
  }, [autoSave, inputs, circuitConfig, results, isCalculated, isInitialLoad]);
  
  // Handle recovery of draft state
  const handleRecoverDraft = () => {
    const draftState = loadCalculatorState<VoltageDropState>('voltage-drop', true);
    
    if (draftState) {
      setInputs(draftState.inputs);
      setCircuitConfig(draftState.circuitConfig);
      setResults(draftState.results);
      setIsCalculated(draftState.isCalculated);
      showNotification('Recovered unsaved work', 'success');
    } else {
      showNotification('Failed to recover unsaved work', 'error');
    }
  };
  
  // Handle discarding draft state
  const handleDiscardDraft = () => {
    clearDraftState('voltage-drop');
    showNotification('Discarded unsaved work', 'info');
  };
  
  // Add function to open save dialog
  const handleOpenSaveDialog = () => {
    setSaveName(`Voltage Drop - ${circuitConfig.circuitType} circuit - ${new Date().toLocaleDateString()}`);
    setSaveDialogOpen(true);
  };
  
  // Modify save function to use both storage systems
  const handleSave = () => {
    if (!saveName) {
      showNotification('Please enter a name for the calculation', 'error');
      return;
    }
    
    if (results) {
      try {
        // Save to the existing storage system for backwards compatibility
        const id = saveCalculation(
          'voltage-drop', 
          saveName,
          {
            inputs: {
              ...inputs,
              circuitConfiguration: circuitConfig
            },
            results
          }
        );
        
        // Also save to the new persistent storage
        const calculationToSave: VoltageDropState = {
          inputs,
          circuitConfig,
          results,
          isCalculated
        };
        
        saveCalculatorState('voltage-drop', calculationToSave, false);
        
        // Clear the draft state since we've now saved properly
        clearDraftState('voltage-drop');
        
        if (id) {
          showNotification('Calculation saved successfully', 'success');
          setSaveDialogOpen(false);
        } else {
          showNotification('Failed to save calculation', 'error');
        }
      } catch (error) {
        console.error('Error saving calculation:', error);
        showNotification('Failed to save calculation', 'error');
      }
    }
  };
  
  // Calculate results 
  const handleCalculate = () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Combine inputs with circuit configuration
      const fullInputs: VoltageDropInputs = {
        ...inputs,
        circuitConfiguration: circuitConfig
      };
      
      // Calculate results
      const calculationResults = calculateVoltageDropResults(fullInputs);
      setResults(calculationResults);
      setIsCalculated(true);
      
      // Calculate optimal conductor size
      if (calculationResults.voltageDropPercent > 3) {
        const optimal = findOptimalConductorSize(fullInputs);
        setOptimizedSize(optimal);
      } else {
        setOptimizedSize(null);
      }
      
      showNotification('Calculation completed successfully', 'success');
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      showNotification('Error calculating voltage drop', 'error');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Reset calculator to initial state
  const handleReset = () => {
    // Reset form inputs to defaults
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
    
    // Reset circuit configuration
    setCircuitConfig({
      circuitType: 'branch',
      distanceToFurthestOutlet: 30,
      startingCurrentMultiplier: 1.25,
      serviceFactor: 1.15,
      wireway: 'conduit',
      hasVFD: false
    });
    
    // Clear results
    setResults(null);
    setIsCalculated(false);
    setOptimizedSize(null);
    setError(null);
    
    // Clear draft state
    clearDraftState('voltage-drop');
    
    showNotification('Calculator has been reset', 'info');
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
  
  // Open load dialog stub
  const handleOpenLoadDialog = () => {
    setLoadCircuitDialogOpen(true);
  };
  
  // Open batch dialog stub
  const handleOpenBatchDialog = () => {
    setBatchDialogOpen(true);
  };
  
  // Save to sync context 
  const saveToSyncContext = () => {
    if (!results || !circuitSync.syncStatus.isEnabled) {
      showNotification('Cannot sync: No calculation results or sync not enabled', 'error');
      return;
    }
    
    try {
      // Create an id and name for the circuit
      const circuitId = `vd-${Date.now()}`;
      const circuitName = `Voltage Drop Circuit - ${new Date().toLocaleDateString()}`;
      
      // Convert voltage drop inputs to unified circuit format
      const unifiedCircuit = voltageDropInputsToUnifiedCircuit(
        {
          ...inputs,
          circuitConfiguration: circuitConfig
        },
        circuitId,  // Pass the id as the second parameter
        circuitName // Pass the name as the third parameter
      );
      
      // Add voltage drop results to the unified circuit
      unifiedCircuit.voltageDropPercent = results.voltageDropPercent;
      unifiedCircuit.voltageDrop = results.voltageDrop;
      
      // Update circuit in the sync context
      circuitSync.updateCircuit(unifiedCircuit);
      
      showNotification('Circuit added to synchronization context', 'success');
    } catch (err) {
      console.error('Error syncing with SOL:', err);
      showNotification('Failed to sync with Schedule of Loads', 'error');
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
        onClick={handleOpenSaveDialog}
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

  // Add the CalculatorStateRecoveryDialog to the component's render return statement
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 2 }}>
      {/* ... existing content ... */}
      
      {/* Add Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for this voltage drop calculation to save it for future reference.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Calculation Name"
            type="text"
            fullWidth
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={!saveName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Recovery Dialog */}
      <CalculatorStateRecoveryDialog
        open={recoveryDialogOpen}
        onClose={() => setRecoveryDialogOpen(false)}
        calculatorType="voltage-drop"
        onRecoverDraft={handleRecoverDraft}
        onDiscardDraft={handleDiscardDraft}
      />
      
      {/* ... other dialogs ... */}
    </Paper>
  );
};

export default VoltageDropCalculator; 