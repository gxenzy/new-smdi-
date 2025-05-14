import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Tooltip,
  Chip,
  CircularProgress,
  Collapse,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Calculate as CalculateIcon,
  PictureAsPdf as PictureAsPdfIcon,
  RestartAlt as RestartAltIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
  ElectricalServices as ElectricalServicesIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MenuBook as MenuBookIcon,
  WaterDrop as WaterDropIcon,
  Bolt as BoltIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule, PowerCalculationResults, CIRCUIT_BREAKER_OPTIONS, CONDUCTOR_SIZE_OPTIONS, CIRCUIT_TYPE_OPTIONS } from './types';
import { v4 as uuidv4 } from 'uuid';
import SavedCalculationsViewer from '../SavedCalculationsViewer';
import { saveCalculation } from '../utils/storage';
import { useSnackbar } from 'notistack';
import VoltageDropAnalysisDialog from './VoltageDropAnalysisDialog';
import QuickStartDialog from './QuickStartDialog';
import LoadItemInfoDialog from './LoadItemInfoDialog';
import { useCircuitSync } from '../../../../../contexts/CircuitSynchronizationContext';
import SynchronizationPanel from '../SynchronizationPanel';
import { UnifiedCircuitData } from '../utils/circuitDataExchange';
import PhaseBalanceDisplay from './PhaseBalanceDisplay';
import CircuitDetailsDialog from './CircuitDetailsDialog';
import ComplianceReportTab from './ComplianceReportTab';
import { updateLoadScheduleCompliance } from '../utils/pecComplianceUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, index, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export interface ScheduleOfLoadsCalculatorProps {
  onSave?: (data: LoadSchedule) => void;
  onExportPdf?: (data: LoadSchedule) => Promise<void>;
  initialData?: LoadSchedule;
}

const defaultLoadItem: Omit<LoadItem, 'id'> = {
  description: '',
  quantity: 1,
  rating: 0,
  demandFactor: 1,
  connectedLoad: 0,
  demandLoad: 0,
  current: 0,
  voltAmpere: 0,
  circuitBreaker: '',
  conductorSize: ''
};

const defaultLoadSchedule: LoadSchedule = {
  id: uuidv4(),
  name: 'New Schedule of Loads',
  panelName: 'Panel P-1',
  voltage: 230,
  powerFactor: 0.90,
  totalConnectedLoad: 0,
  totalDemandLoad: 0,
  current: 0,
  loads: [],
};

const ScheduleOfLoadsCalculator: React.FC<ScheduleOfLoadsCalculatorProps> = ({ 
  onSave, 
  onExportPdf,
  initialData
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loadSchedule, setLoadSchedule] = useState<LoadSchedule>(initialData || defaultLoadSchedule);
  const [editingLoad, setEditingLoad] = useState<LoadItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [calculationName, setCalculationName] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [errorHelpOpen, setErrorHelpOpen] = useState(false);
  const [calculationResults, setCalculationResults] = useState<PowerCalculationResults | null>(null);
  
  // Add snackbar
  const { enqueueSnackbar } = useSnackbar();
  
  // Add state for new load item
  const [newLoadItem, setNewLoadItem] = useState<Omit<LoadItem, 'id'>>({...defaultLoadItem});
  
  // Add state for voltage drop analysis
  const [voltageDropDialogOpen, setVoltageDropDialogOpen] = useState(false);
  const [selectedLoadItem, setSelectedLoadItem] = useState<LoadItem | null>(null);
  const [itemInfoDialogOpen, setItemInfoDialogOpen] = useState(false);
  
  // Get circuit sync context
  const circuitSync = useCircuitSync();

  // Add state for circuit details dialog
  const [circuitDetailsDialogOpen, setCircuitDetailsDialogOpen] = useState(false);
  const [selectedCircuitItem, setSelectedCircuitItem] = useState<LoadItem | null>(null);

  // Update the circuit sync context whenever the loadSchedule changes
  useEffect(() => {
    // Only update if not from an initial load and if we have actual loads
    if (loadSchedule && loadSchedule.id && loadSchedule.loads.length > 0) {
      circuitSync.updateLoadSchedule(loadSchedule);
    }
  }, [loadSchedule, circuitSync]);

  // Calculate connected and demand loads
  const calculateLoadValues = (item: Omit<LoadItem, 'id' | 'connectedLoad' | 'demandLoad' | 'current' | 'voltAmpere'>) => {
    const connectedLoad = item.quantity * item.rating;
    const demandLoad = connectedLoad * item.demandFactor;
    const current = demandLoad / loadSchedule.voltage;
    const voltAmpere = demandLoad / loadSchedule.powerFactor;
    
    return {
      ...item,
      connectedLoad,
      demandLoad,
      current,
      voltAmpere
    };
  };
  
  // Handle adding a new load item
  const handleAddLoadItem = () => {
    // Validate input
    if (!newLoadItem.description) {
      setErrors({...errors, description: 'Description is required'});
      return;
    }
    
    if (newLoadItem.rating <= 0) {
      setErrors({...errors, rating: 'Rating must be greater than 0'});
      return;
    }
    
    // Calculate connected load, demand load, etc.
    const calculatedItem = calculateLoadValues(newLoadItem);
    
    // Add default circuit details
    const newItem: LoadItem = {
      id: uuidv4(),
      ...calculatedItem,
      // Add default circuit details to enable PEC compliance checking
      circuitDetails: {
        type: 'lighting',
        poles: 1, 
        phase: 'A',
        wireType: 'THHN_COPPER',
        maxVoltageDropAllowed: 3 // Default 3% per PEC 2017
      }
    };
    
    // Add to the load schedule
    const updatedLoads = [...loadSchedule.loads, newItem];
    
    // Calculate totals
    const totalConnectedLoad = updatedLoads.reduce((sum, item) => sum + item.connectedLoad, 0);
    const totalDemandLoad = updatedLoads.reduce((sum, item) => sum + item.demandLoad, 0);
    const totalCurrent = totalDemandLoad / loadSchedule.voltage;
    
    setLoadSchedule({
      ...loadSchedule,
      loads: updatedLoads,
      totalConnectedLoad,
      totalDemandLoad,
      current: totalCurrent
    });
    
    // Reset the form
    setNewLoadItem({...defaultLoadItem});
    setErrors({});
  };
  
  // Handle updating a load item
  const handleUpdateLoadItem = () => {
    if (!editingLoad) return;
    
    // Validate input
    if (!editingLoad.description) {
      setErrors({...errors, editDescription: 'Description is required'});
      return;
    }
    
    if (editingLoad.rating <= 0) {
      setErrors({...errors, editRating: 'Rating must be greater than 0'});
      return;
    }
    
    // Calculate values
    const calculatedValues = calculateLoadValues({
      description: editingLoad.description,
      quantity: editingLoad.quantity,
      rating: editingLoad.rating,
      demandFactor: editingLoad.demandFactor,
      circuitBreaker: editingLoad.circuitBreaker,
      conductorSize: editingLoad.conductorSize
    });
    
    // Update in load schedule
    const updatedLoads = loadSchedule.loads.map(item => 
      item.id === editingLoad.id ? { ...calculatedValues, id: item.id } : item
    );
    
    // Calculate totals
    const totalConnectedLoad = updatedLoads.reduce((sum, item) => sum + item.connectedLoad, 0);
    const totalDemandLoad = updatedLoads.reduce((sum, item) => sum + item.demandLoad, 0);
    const current = totalDemandLoad / loadSchedule.voltage;
    
    setLoadSchedule({
      ...loadSchedule,
      loads: updatedLoads,
      totalConnectedLoad,
      totalDemandLoad,
      current
    });
    
    // Close editing
    setEditingLoad(null);
    setErrors({});
  };
  
  // Handle deleting a load item
  const handleDeleteLoadItem = (id: string) => {
    const updatedLoads = loadSchedule.loads.filter(item => item.id !== id);
    
    // Calculate totals
    const totalConnectedLoad = updatedLoads.reduce((sum, item) => sum + item.connectedLoad, 0);
    const totalDemandLoad = updatedLoads.reduce((sum, item) => sum + item.demandLoad, 0);
    const current = totalDemandLoad > 0 ? totalDemandLoad / loadSchedule.voltage : 0;
    
    setLoadSchedule({
      ...loadSchedule,
      loads: updatedLoads,
      totalConnectedLoad,
      totalDemandLoad,
      current
    });
  };
  
  // Handle input change for new load item
  const handleNewItemChange = (field: keyof Omit<LoadItem, 'id' | 'connectedLoad' | 'demandLoad' | 'current' | 'voltAmpere'>) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = field === 'description' || field === 'circuitBreaker' || field === 'conductorSize'
      ? e.target.value as string
      : Number(e.target.value);
      
    setNewLoadItem({
      ...newLoadItem,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      const { [field]: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };
  
  // Handle input change for editing load item
  const handleEditingItemChange = (field: keyof Omit<LoadItem, 'id' | 'connectedLoad' | 'demandLoad' | 'current' | 'voltAmpere'>) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    if (!editingLoad) return;
    
    const value = field === 'description' || field === 'circuitBreaker' || field === 'conductorSize'
      ? e.target.value as string
      : Number(e.target.value);
      
    setEditingLoad({
      ...editingLoad,
      [field]: value
    });
    
    // Clear error for this field
    const errorField = `edit${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorField]) {
      const { [errorField]: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Initialize or reset the component
  useEffect(() => {
    if (initialData) {
      setLoadSchedule(initialData);
      setCalculationName(initialData.name);
    }
  }, [initialData]);

  // Calculate power consumption
  const calculatePowerConsumption = () => {
    setCalculating(true);
    
    setTimeout(() => {
      // Import the compliance checking utility
      import('../utils/pecComplianceUtils').then(({ updateLoadScheduleCompliance }) => {
        try {
          // For demonstration, assume 8 hours per day, 22 days per month as default operation
          const dailyOperatingHours = 8;
          const daysPerMonth = 22;
          const electricityRate = 10.5; // PHP per kWh
          
          // Calculate energy consumption in kWh
          const dailyEnergyConsumption = loadSchedule.totalDemandLoad * dailyOperatingHours / 1000;
          const monthlyEnergyConsumption = dailyEnergyConsumption * daysPerMonth;
          const annualEnergyConsumption = monthlyEnergyConsumption * 12;
          
          // Calculate costs
          const monthlyCost = monthlyEnergyConsumption * electricityRate;
          const annualCost = annualEnergyConsumption * electricityRate;
          
          // Calculate peak demand in kW
          const peakDemand = loadSchedule.totalDemandLoad / 1000;
          
          // Calculate load factor (typically done with more data, but simplified here)
          const loadFactor = 0.65; // Assume 65% load factor for demonstration
          
          const results: PowerCalculationResults = {
            monthlyEnergyConsumption,
            annualEnergyConsumption,
            monthlyCost,
            annualCost,
            dailyOperatingHours,
            peakDemand,
            loadFactor
          };
          
          // Update compliance status for the entire load schedule
          const compliantLoadSchedule = updateLoadScheduleCompliance(loadSchedule);
          
          // Update state with results and compliant load schedule
          setCalculationResults(results);
          setLoadSchedule(compliantLoadSchedule);
          
          // Notify user if there are compliance issues
          if (!compliantLoadSchedule.isPECCompliant) {
            const nonCompliantCount = compliantLoadSchedule.loads.filter(
              load => load.pecCompliance && !load.pecCompliance.isCompliant
            ).length;
            
            if (nonCompliantCount > 0) {
              enqueueSnackbar(
                `Found ${nonCompliantCount} items that don't comply with PEC 2017 standards. Check the results tab for details.`,
                { variant: 'warning', autoHideDuration: 5000 }
              );
            }
          }
        } catch (error) {
          console.error('Error during calculation:', error);
          enqueueSnackbar(
            `Error during calculation: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { variant: 'error', autoHideDuration: 5000 }
          );
        } finally {
          setCalculating(false);
        }
      }).catch(error => {
        console.error('Error loading compliance utilities:', error);
        setCalculating(false);
      });
    }, 500); // Simulate calculation time
  };
  
  // Handle save
  const handleSave = () => {
    if (loadSchedule) {
      try {
        // Create a data object that includes all necessary information
        const calculationData = {
          loadSchedule,
          calculationResults,
          timestamp: Date.now()
        };
        
        // First try using our onSave prop if provided
        if (onSave) {
          onSave(loadSchedule);
        }
        
        // Save to localStorage
        const id = saveCalculation('schedule-of-loads', calculationName || `Schedule of Loads - ${loadSchedule.panelName} - ${new Date().toLocaleString()}`, calculationData);
        
        if (id) {
          // Show success message
          console.log('Successfully saved schedule of loads with ID:', id);
          console.log('Saved data:', calculationData);
          enqueueSnackbar('Schedule of Loads saved successfully', { variant: 'success' });
          setSaveDialogOpen(false);
          setCalculationName('');
        } else {
          console.error('Error saving Schedule of Loads: No ID returned');
          enqueueSnackbar('Error saving Schedule of Loads: No ID returned', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error saving Schedule of Loads:', error);
        enqueueSnackbar(`Error saving Schedule of Loads: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' });
      }
    }
  };
  
  // Handle PDF export
  const handleExportPdf = async () => {
    if (!onExportPdf || !loadSchedule) {
      setErrors({ ...errors, general: 'Unable to generate PDF at this time' });
      return;
    }
    
    setCalculating(true);
    try {
      await onExportPdf(loadSchedule);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setErrors({ ...errors, general: 'Error generating PDF' });
    } finally {
      setCalculating(false);
    }
  };
  
  // Generate display when opening Results tab
  useEffect(() => {
    if (activeTab === 2 && loadSchedule.loads.length > 0 && !calculationResults) {
      calculatePowerConsumption();
    }
  }, [activeTab, loadSchedule.loads.length, calculationResults]);

  // Add handler to open voltage drop analysis for a specific load
  const handleOpenVoltageDropForLoad = (loadItem: LoadItem) => {
    setSelectedLoadItem(loadItem);
    setVoltageDropDialogOpen(true);
  };
  
  // Add handler to open voltage drop analysis for the entire panel
  const handleOpenVoltageDropForPanel = () => {
    setSelectedLoadItem(null);
    setVoltageDropDialogOpen(true);
  };
  
  // Add handler for saving voltage drop analysis results
  const handleSaveVoltageDropResults = (
    loadItem: LoadItem | null,
    updatedLoadSchedule: LoadSchedule
  ) => {
    if (loadItem) {
      // Update the specific load item with voltage drop results
      const updatedLoads = loadSchedule.loads.map(item => 
        item.id === loadItem.id ? loadItem : item
      );
      
      setLoadSchedule({
        ...loadSchedule,
        loads: updatedLoads
      });
      
      // Also update in circuit sync context
      circuitSync.updateLoadItem(loadItem);
      
      enqueueSnackbar('Voltage drop analysis results saved to load item', { 
        variant: 'success',
        autoHideDuration: 3000
      });
    }
    
    setVoltageDropDialogOpen(false);
    setSelectedLoadItem(null);
  };

  // Check if a load item has been analyzed with voltage drop
  const hasVoltageDropAnalysis = (loadItem: LoadItem): boolean => {
    return loadItem.voltageDropPercent !== undefined && loadItem.voltageDrop !== undefined;
  };

  // Check if a load item is synchronized with the voltage drop calculator
  const isSynchronized = (loadItem: LoadItem): boolean => {
    // Check if this load item exists in the circuit data with voltage-drop source
    const loadItemCircuitId = `${loadSchedule.id}-${loadItem.id}`;
    
    // Convert Map to Array to avoid iterator issues
    const circuits = Array.from(circuitSync.circuitData);
    
    return circuits.some((circuit: UnifiedCircuitData) => 
      circuit.source === 'voltage-drop' && 
      (circuit.sourceId === loadItem.id || circuit.id === loadItemCircuitId)
    );
  };

  // Add function to open circuit details dialog
  const handleOpenCircuitDetails = (loadItem: LoadItem) => {
    setSelectedCircuitItem(loadItem);
    setCircuitDetailsDialogOpen(true);
  };
  
  // Add function to save circuit details
  const handleSaveCircuitDetails = (updatedLoadItem: LoadItem) => {
    // Update the load item with new circuit details
    const updatedLoads = loadSchedule.loads.map(item => 
      item.id === updatedLoadItem.id ? updatedLoadItem : item
    );
    
    // Update load schedule
    const updatedSchedule = {
      ...loadSchedule,
      loads: updatedLoads
    };
    
    // Check compliance after updating circuit details
    const compliantSchedule = updateLoadScheduleCompliance(updatedSchedule);
    
    setLoadSchedule(compliantSchedule);
    setCircuitDetailsDialogOpen(false);
    setSelectedCircuitItem(null);
    
    // Show notification
    enqueueSnackbar('Circuit details updated successfully', { variant: 'success' });
  };

  // Handle phase configuration change in Panel Settings
  const handlePhaseConfigChange = (newConfig: 'single-phase' | 'three-phase') => {
    setLoadSchedule(prev => ({
      ...prev,
      phaseConfiguration: newConfig
    }));
  };

  // Handle load phase change (for 3-phase panels)
  const handleUpdateLoadPhase = (loadId: string, newPhase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C') => {
    // Update the phase information for the specific load
    const updatedLoads = loadSchedule.loads.map(item => {
      if (item.id === loadId && item.circuitDetails) {
        return {
          ...item,
          circuitDetails: {
            ...item.circuitDetails,
            phase: newPhase
          }
        };
      }
      return item;
    });
    
    // Update load schedule with the new loads
    const updatedSchedule = {
      ...loadSchedule,
      loads: updatedLoads
    };
    
    // Check compliance after updating phase configuration
    const compliantSchedule = updateLoadScheduleCompliance(updatedSchedule);
    
    setLoadSchedule(compliantSchedule);
  };
  
  // Handle saving panel settings
  const handleSaveSettings = () => {
    // Check compliance after updating settings
    const compliantSchedule = updateLoadScheduleCompliance(loadSchedule);
    setLoadSchedule(compliantSchedule);
    
    // Show notification
    enqueueSnackbar('Panel settings updated successfully', { variant: 'success' });
  };

  const renderPanelSummary = () => {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Panel Summary</Typography>
            
            <Box>
              <Tooltip title="Analyze Voltage Drop for Panel">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<WaterDropIcon />}
                  onClick={handleOpenVoltageDropForPanel}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Voltage Drop
                </Button>
              </Tooltip>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={calculatePowerConsumption}
                startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                disabled={calculating || loadSchedule.loads.length === 0}
                size="small"
              >
                Calculate Power
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                Panel Name: <strong>{loadSchedule.panelName}</strong>
              </Typography>
              <Typography variant="body1">
                Total Connected Load: <strong>{loadSchedule.totalConnectedLoad.toFixed(2)} W</strong>
              </Typography>
              <Typography variant="body1">
                Total Demand Load: <strong>{loadSchedule.totalDemandLoad.toFixed(2)} W</strong>
              </Typography>
              <Typography variant="body1">
                Current: <strong>{loadSchedule.current.toFixed(2)} A</strong>
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                Voltage: <strong>{loadSchedule.voltage} V</strong>
              </Typography>
              <Typography variant="body1">
                Power Factor: <strong>{loadSchedule.powerFactor}</strong>
              </Typography>
              
              {/* Add voltage drop information if available */}
              {loadSchedule.voltageDropPercent !== undefined && (
                <>
                  <Typography variant="body1">
                    Voltage Drop: 
                    <strong style={{ 
                      color: loadSchedule.isPECCompliant ? 'green' : 'red'
                    }}>
                      {' '}{loadSchedule.voltageDropPercent.toFixed(2)}%
                    </strong>
                  </Typography>
                  <Typography variant="body1">
                    Feeder Size: <strong>{loadSchedule.conductorSize || 'Not set'}</strong>
                    {loadSchedule.optimalConductorSize && loadSchedule.optimalConductorSize !== loadSchedule.conductorSize && (
                      <Tooltip title="Recommended optimal size based on voltage drop analysis">
                        <Chip 
                          label={`Recommend: ${loadSchedule.optimalConductorSize}`}
                          color="info"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Tooltip>
                    )}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderLoadItemsTable = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Rating (W)</TableCell>
              <TableCell align="right">Demand Factor</TableCell>
              <TableCell align="right">Connected Load (W)</TableCell>
              <TableCell align="right">Demand Load (W)</TableCell>
              <TableCell align="right">Current (A)</TableCell>
              <TableCell align="right">CB Size</TableCell>
              <TableCell align="right">Conductor</TableCell>
              <TableCell align="right">VD Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadSchedule.loads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No loads added yet. Add your first load above.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              loadSchedule.loads.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {isSynchronized(item) && (
                        <Tooltip title="Synchronized with Voltage Drop Calculator">
                          <SyncIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                        </Tooltip>
                      )}
                      {item.description}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.rating}</TableCell>
                  <TableCell align="right">{item.demandFactor}</TableCell>
                  <TableCell align="right">{item.connectedLoad.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.demandLoad.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.current?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell align="right">{item.circuitBreaker || 'N/A'}</TableCell>
                  <TableCell align="right">{item.conductorSize || 'N/A'}</TableCell>
                  <TableCell align="right">
                    {hasVoltageDropAnalysis(item) ? (
                      <Tooltip title={`Voltage Drop: ${item.voltageDropPercent?.toFixed(2)}%`}>
                        <Chip 
                          size="small" 
                          label={item.voltageDropPercent?.toFixed(1) + '%'} 
                          color={item.isPECCompliant ? "success" : "error"}
                          onClick={() => {
                            setSelectedLoadItem(item);
                            setItemInfoDialogOpen(true);
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Chip 
                        size="small" 
                        label="Not analyzed" 
                        variant="outlined" 
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <Tooltip title="Edit Load">
                        <IconButton
                          size="small"
                          onClick={() => setEditingLoad(item)}
                          sx={{ mx: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Load">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLoadItem(item.id)}
                          color="error"
                          sx={{ mx: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Analyze with Voltage Drop Calculator">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedLoadItem(item);
                            setVoltageDropDialogOpen(true);
                          }}
                          color={hasVoltageDropAnalysis(item) ? "primary" : "default"}
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Main render for the calculator
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 2 }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom>
              Schedule of Loads Calculator
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Calculate load schedule based on PEC 2017 requirements
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<HelpOutlineIcon />}
              onClick={() => setQuickStartOpen(true)}
              sx={{ mr: 1 }}
            >
              Quick Start
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<InfoIcon />}
              onClick={() => setInfoOpen(true)}
            >
              Info
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main content */}
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Input" />
          <Tab label="Results" />
          <Tab label="Settings" />
          <Tab label="Compliance Report" />
        </Tabs>

        {/* Input Tab */}
        <TabPanel value={activeTab} index={0}>
          {/* Panel information */}
          {renderPanelSummary()}
          
          {/* Load items table */}
          {renderLoadItemsTable()}
          
          {/* Add new load item form */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add New Load Item
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth
                  label="Description"
                  value={newLoadItem.description}
                  onChange={handleNewItemChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField 
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={newLoadItem.quantity}
                  onChange={handleNewItemChange('quantity')}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField 
                  fullWidth
                  label="Rating (W)"
                  type="number"
                  value={newLoadItem.rating}
                  onChange={handleNewItemChange('rating')}
                  InputProps={{ inputProps: { min: 0 } }}
                  error={!!errors.rating}
                  helperText={errors.rating}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField 
                  fullWidth
                  label="Demand Factor"
                  type="number"
                  value={newLoadItem.demandFactor}
                  onChange={handleNewItemChange('demandFactor')}
                  InputProps={{ inputProps: { min: 0, max: 1, step: 0.1 } }}
                  error={!!errors.demandFactor}
                  helperText={errors.demandFactor}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAddLoadItem}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Results Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total Connected Load
                      </Typography>
                      <Typography variant="h6">
                        {loadSchedule.totalConnectedLoad.toFixed(2)} W
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total Demand Load
                      </Typography>
                      <Typography variant="h6">
                        {loadSchedule.totalDemandLoad.toFixed(2)} W
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Current
                      </Typography>
                      <Typography variant="h6">
                        {loadSchedule.current.toFixed(2)} A
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Volt-Ampere
                      </Typography>
                      <Typography variant="h6">
                        {(loadSchedule.totalDemandLoad / loadSchedule.powerFactor).toFixed(2)} VA
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Power Consumption Estimation */}
            {calculationResults && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Power Consumption Estimation
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Monthly Energy Consumption
                        </Typography>
                        <Typography variant="h6">
                          {calculationResults.monthlyEnergyConsumption.toFixed(2)} kWh
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Annual Energy Consumption
                        </Typography>
                        <Typography variant="h6">
                          {calculationResults.annualEnergyConsumption.toFixed(2)} kWh
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Monthly Cost
                        </Typography>
                        <Typography variant="h6">
                          ₱{calculationResults.monthlyCost.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Annual Cost
                        </Typography>
                        <Typography variant="h6">
                          ₱{calculationResults.annualCost.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Peak Demand
                        </Typography>
                        <Typography variant="h6">
                          {calculationResults.peakDemand.toFixed(2)} kW
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Load Factor
                        </Typography>
                        <Typography variant="h6">
                          {calculationResults.loadFactor.toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Add Phase Balance Display if three-phase panel */}
            {loadSchedule.phaseConfiguration === 'three-phase' && (
              <Grid item xs={12}>
                <PhaseBalanceDisplay 
                  loadSchedule={loadSchedule} 
                  onUpdateLoadPhase={handleUpdateLoadPhase} 
                />
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CalculateIcon />}
              onClick={calculatePowerConsumption}
              disabled={loadSchedule.loads.length === 0}
            >
              Calculate Power Consumption
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                sx={{ mr: 1 }}
                disabled={loadSchedule.loads.length === 0}
              >
                Save
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPdf}
                disabled={loadSchedule.loads.length === 0 || !onExportPdf}
              >
                Export PDF
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Phase Configuration</InputLabel>
                <Select
                  value={loadSchedule.phaseConfiguration || 'single-phase'}
                  label="Phase Configuration"
                  onChange={(e) => handlePhaseConfigChange(e.target.value as 'single-phase' | 'three-phase')}
                >
                  <MenuItem value="single-phase">Single Phase</MenuItem>
                  <MenuItem value="three-phase">Three Phase</MenuItem>
                </Select>
                <FormHelperText>
                  This affects phase balance calculations and compliance requirements
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Main Circuit Breaker"
                value={loadSchedule.circuitBreaker || ''}
                onChange={(e) => setLoadSchedule({...loadSchedule, circuitBreaker: e.target.value})}
                margin="normal"
                variant="outlined"
                select
              >
                {(CIRCUIT_BREAKER_OPTIONS || ['15A', '20A', '30A', '40A', '50A', '60A', '100A']).map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Main Feeder Conductor Size"
                value={loadSchedule.conductorSize || ''}
                onChange={(e) => setLoadSchedule({...loadSchedule, conductorSize: e.target.value})}
                margin="normal"
                variant="outlined"
                select
              >
                {(CONDUCTOR_SIZE_OPTIONS || ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG']).map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Incoming Feeder Size"
                value={loadSchedule.incomingFeederSize || ''}
                onChange={(e) => setLoadSchedule({...loadSchedule, incomingFeederSize: e.target.value})}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Feeder Protection Size"
                value={loadSchedule.feederProtectionSize || ''}
                onChange={(e) => setLoadSchedule({...loadSchedule, feederProtectionSize: e.target.value})}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Conductor Length (m)"
                type="number"
                value={loadSchedule.conductorLength || ''}
                onChange={(e) => setLoadSchedule({...loadSchedule, conductorLength: Number(e.target.value)})}
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveSettings}
                startIcon={<SaveIcon />}
              >
                Save Panel Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Compliance Report Tab */}
        <TabPanel value={activeTab} index={3}>
          <ComplianceReportTab 
            loadSchedule={loadSchedule}
            onUpdateLoadSchedule={setLoadSchedule}
            onOpenCircuitDetails={handleOpenCircuitDetails}
          />
        </TabPanel>
      </Box>
      
      {/* Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            fullWidth
            variant="outlined"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" disabled={!calculationName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <QuickStartDialog
        open={quickStartOpen}
        onClose={() => setQuickStartOpen(false)}
      />
      
      <VoltageDropAnalysisDialog
        open={voltageDropDialogOpen}
        onClose={() => setVoltageDropDialogOpen(false)}
        loadItem={selectedLoadItem}
        loadSchedule={loadSchedule}
        onSaveResults={handleSaveVoltageDropResults}
      />
      
      <LoadItemInfoDialog
        open={itemInfoDialogOpen}
        onClose={() => setItemInfoDialogOpen(false)}
        loadItem={selectedLoadItem}
      />
      
      {/* Circuit Details Dialog */}
      <CircuitDetailsDialog
        open={circuitDetailsDialogOpen}
        onClose={() => setCircuitDetailsDialogOpen(false)}
        loadItem={selectedCircuitItem}
        onSave={handleSaveCircuitDetails}
        systemVoltage={loadSchedule.voltage}
      />
    </Paper>
  );
};

export default ScheduleOfLoadsCalculator; 