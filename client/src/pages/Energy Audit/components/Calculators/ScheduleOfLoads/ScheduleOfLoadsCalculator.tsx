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
  LinearProgress
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
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule, PowerCalculationResults } from './types';
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

interface ScheduleOfLoadsCalculatorProps {
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
    
    // Calculate connected load and demand load
    const calculatedItem = calculateLoadValues(newLoadItem);
    
    // Add to load schedule
    const newItem: LoadItem = {
      id: uuidv4(),
      ...calculatedItem
    };
    
    const updatedLoads = [...loadSchedule.loads, newItem];
    
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
    
    // Reset new item form
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
      
      setCalculationResults(results);
      setCalculating(false);
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

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Schedule of Loads Calculator</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Quick Start Guide">
              <IconButton onClick={() => setQuickStartOpen(true)}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            <SavedCalculationsViewer 
              calculationType="schedule-of-loads"
              onLoadCalculation={(data) => {
                try {
                  console.log("Loading schedule of loads data:", data);
                  
                  // Handle different data structures
                  let loadScheduleData;
                  
                  // Check for nested data structure - handle multiple potential formats
                  if (data.data) {
                    if (data.data.loadSchedule) {
                      // Standard format with loadSchedule property
                      loadScheduleData = data.data.loadSchedule;
                      
                      // Also restore calculation results if available
                      if (data.data.calculationResults) {
                        setCalculationResults(data.data.calculationResults);
                      }
                    } else if (typeof data.data === 'object' && data.data.id && data.data.name && data.data.loads) {
                      // Direct loadSchedule object
                      loadScheduleData = data.data;
                    }
                  } else if (typeof data === 'object' && data.id && data.name && data.loads) {
                    // Direct loadSchedule object at root level
                    loadScheduleData = data;
                  }
                  
                  // If we still don't have valid data, try reconstructing from what we have
                  if (!loadScheduleData || !loadScheduleData.loads) {
                    console.warn("Could not find standard loadSchedule data format, attempting to reconstruct", data);
                    
                    // Create a default structure
                    loadScheduleData = {
                      ...defaultLoadSchedule,
                      id: data.id || uuidv4(),
                      name: data.name || 'Recovered Schedule of Loads',
                      loads: []
                    };
                    
                    // Try to find loads array in nested properties
                    if (data.loads && Array.isArray(data.loads)) {
                      loadScheduleData.loads = data.loads;
                    } else if (data.data && data.data.loads && Array.isArray(data.data.loads)) {
                      loadScheduleData.loads = data.data.loads;
                    }
                    
                    // If we still don't have loads, this is truly invalid data
                    if (!loadScheduleData.loads || !Array.isArray(loadScheduleData.loads)) {
                      throw new Error("Invalid load schedule data format: missing loads array");
                    }
                  }
                  
                  // Ensure all required properties exist with reasonable defaults
                  loadScheduleData = {
                    ...defaultLoadSchedule,
                    ...loadScheduleData,
                    // Ensure these are numbers even if they were saved as strings
                    voltage: Number(loadScheduleData.voltage) || defaultLoadSchedule.voltage,
                    powerFactor: Number(loadScheduleData.powerFactor) || defaultLoadSchedule.powerFactor,
                    totalConnectedLoad: Number(loadScheduleData.totalConnectedLoad) || 0,
                    totalDemandLoad: Number(loadScheduleData.totalDemandLoad) || 0,
                    current: Number(loadScheduleData.current) || 0
                  };
                  
                  // Ensure loads is an array with properly formatted items
                  if (!Array.isArray(loadScheduleData.loads)) {
                    loadScheduleData.loads = [];
                  }
                  
                  // Process each load item to ensure it has all required properties
                  loadScheduleData.loads = loadScheduleData.loads.map((load: any) => ({
                    id: load.id || uuidv4(),
                    description: load.description || 'Unknown Item',
                    quantity: Number(load.quantity) || 1,
                    rating: Number(load.rating) || 0,
                    demandFactor: Number(load.demandFactor) || 1,
                    connectedLoad: Number(load.connectedLoad) || 0,
                    demandLoad: Number(load.demandLoad) || 0,
                    current: Number(load.current) || 0,
                    voltAmpere: Number(load.voltAmpere) || 0,
                    circuitBreaker: load.circuitBreaker || '',
                    conductorSize: load.conductorSize || ''
                  }));
                  
                  // Recalculate totals to ensure consistency
                  const totalConnectedLoad = loadScheduleData.loads.reduce((sum: number, item: LoadItem) => sum + item.connectedLoad, 0);
                  const totalDemandLoad = loadScheduleData.loads.reduce((sum: number, item: LoadItem) => sum + item.demandLoad, 0);
                  const current = totalDemandLoad / loadScheduleData.voltage;
                  
                  loadScheduleData.totalConnectedLoad = totalConnectedLoad;
                  loadScheduleData.totalDemandLoad = totalDemandLoad;
                  loadScheduleData.current = current;
                  
                  console.log("Processed load schedule data:", loadScheduleData);
                  
                  setLoadSchedule(loadScheduleData);
                  setCalculationName(loadScheduleData.name || '');
                  
                  if (loadScheduleData.loads.length > 0) {
                    // Calculate power consumption based on the loaded data
                    calculatePowerConsumption();
                  }
                  
                  // Move to results tab if we have loads, otherwise go to load items tab
                  setActiveTab(loadScheduleData.loads.length > 0 ? 2 : 1);
                } catch (error) {
                  console.error("Error loading schedule of loads:", error);
                  enqueueSnackbar(`Error loading saved data: ${error instanceof Error ? error.message : 'Invalid data format'}`, {
                    variant: 'error',
                    autoHideDuration: 5000
                  });
                }
              }}
            />
            <Tooltip title="Learn more about PEC 2017 Schedule of Loads requirements">
              <IconButton onClick={() => window.location.href = '/energy-audit/standards-reference?standard=PEC-2017&section=2.4'}>
                <MenuBookIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="What is Schedule of Loads?">
              <IconButton onClick={() => setInfoOpen(true)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Add Synchronization Panel */}
        <SynchronizationPanel />
        
        {infoOpen && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Schedule of Loads (SOL)
            </Typography>
            <Typography variant="body2">
              A Schedule of Loads is a detailed listing of all electrical loads in a system, panel, or area. It helps in
              properly sizing electrical equipment and determining energy consumption patterns. The PEC (Philippine Electrical 
              Code) requires a properly prepared Schedule of Loads for all electrical installations.
            </Typography>
          </Alert>
        )}
        
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Basic Information" />
          <Tab label="Load Items" />
          <Tab label="Results" disabled={loadSchedule.loads.length === 0} />
        </Tabs>
        
        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Panel Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Enter basic information about the electrical panel and its location.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Schedule Name"
                        value={loadSchedule.name}
                        onChange={(e) => setLoadSchedule({...loadSchedule, name: e.target.value})}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Panel Name"
                        value={loadSchedule.panelName}
                        onChange={(e) => setLoadSchedule({...loadSchedule, panelName: e.target.value})}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Room/Area Name"
                        value={loadSchedule.roomId || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, roomId: e.target.value})}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Floor Name"
                        value={loadSchedule.floorName || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, floorName: e.target.value})}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Electrical Specifications
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Enter electrical specifications for the panel.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Voltage"
                        type="number"
                        value={loadSchedule.voltage}
                        onChange={(e) => setLoadSchedule({...loadSchedule, voltage: Number(e.target.value)})}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">V</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Power Factor"
                        type="number"
                        value={loadSchedule.powerFactor}
                        onChange={(e) => setLoadSchedule({...loadSchedule, powerFactor: Number(e.target.value)})}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Main Circuit Breaker"
                        value={loadSchedule.circuitBreaker || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, circuitBreaker: e.target.value})}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 100AT/100AF 3P"
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Conductor Size"
                        value={loadSchedule.conductorSize || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, conductorSize: e.target.value})}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 30mm² THHN"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Incoming Feeder Size"
                        value={loadSchedule.incomingFeederSize || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, incomingFeederSize: e.target.value})}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 4-30mm² THHN"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Feeder Protection Size"
                        value={loadSchedule.feederProtectionSize || ''}
                        onChange={(e) => setLoadSchedule({...loadSchedule, feederProtectionSize: e.target.value})}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 100AT/100AF 3P"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              endIcon={<CalculateIcon />}
              onClick={() => setActiveTab(1)}
              color="primary"
            >
              Next: Load Items
            </Button>
          </Box>
        </TabPanel>
        
        {/* Load Items Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
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
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., Lighting Fixtures, Air Conditioner"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={newLoadItem.quantity}
                        onChange={handleNewItemChange('quantity')}
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Rating"
                        type="number"
                        value={newLoadItem.rating}
                        onChange={handleNewItemChange('rating')}
                        error={!!errors.rating}
                        helperText={errors.rating}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">W</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Demand Factor"
                        type="number"
                        value={newLoadItem.demandFactor}
                        onChange={handleNewItemChange('demandFactor')}
                        error={!!errors.demandFactor}
                        helperText={errors.demandFactor || "0.0 - 1.0"}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Circuit Breaker (optional)"
                        value={newLoadItem.circuitBreaker}
                        onChange={handleNewItemChange('circuitBreaker')}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 20AT 2P"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Conductor Size (optional)"
                        value={newLoadItem.conductorSize}
                        onChange={handleNewItemChange('conductorSize')}
                        margin="normal"
                        variant="outlined"
                        placeholder="e.g., 3.5mm² THHN"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddLoadItem}
                        sx={{ mt: 2, height: 40 }}
                        fullWidth
                      >
                        Add Load Item
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Load Items
                  </Typography>
                  
                  {renderLoadItemsTable()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setActiveTab(0)}
            >
              Back to Basic Information
            </Button>
            <Button 
              variant="contained" 
              endIcon={<CalculateIcon />}
              onClick={() => setActiveTab(2)}
              disabled={loadSchedule.loads.length === 0}
              color="primary"
            >
              View Results
            </Button>
          </Box>
        </TabPanel>
        
        {/* Edit Load Item Dialog */}
        <Dialog open={!!editingLoad} onClose={() => setEditingLoad(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Load Item</DialogTitle>
          <DialogContent>
            {editingLoad && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={editingLoad.description}
                    onChange={handleEditingItemChange('description')}
                    error={!!errors.editDescription}
                    helperText={errors.editDescription}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={editingLoad.quantity}
                    onChange={handleEditingItemChange('quantity')}
                    error={!!errors.editQuantity}
                    helperText={errors.editQuantity}
                    margin="normal"
                    variant="outlined"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Rating"
                    type="number"
                    value={editingLoad.rating}
                    onChange={handleEditingItemChange('rating')}
                    error={!!errors.editRating}
                    helperText={errors.editRating}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">W</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Demand Factor"
                    type="number"
                    value={editingLoad.demandFactor}
                    onChange={handleEditingItemChange('demandFactor')}
                    error={!!errors.editDemandFactor}
                    helperText={errors.editDemandFactor || "0.0 - 1.0"}
                    margin="normal"
                    variant="outlined"
                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Circuit Breaker"
                    value={editingLoad.circuitBreaker}
                    onChange={handleEditingItemChange('circuitBreaker')}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Conductor Size"
                    value={editingLoad.conductorSize}
                    onChange={handleEditingItemChange('conductorSize')}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Calculated Values (Read Only)
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Connected Load"
                        value={editingLoad.connectedLoad.toFixed(2)}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">W</InputAdornment>,
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Demand Load"
                        value={editingLoad.demandLoad.toFixed(2)}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">W</InputAdornment>,
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Current"
                        value={editingLoad.current?.toFixed(2) || '0.00'}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">A</InputAdornment>,
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Volt-Amperes"
                        value={editingLoad.voltAmpere?.toFixed(2) || '0.00'}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">VA</InputAdornment>,
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingLoad(null)}>Cancel</Button>
            <Button onClick={handleUpdateLoadItem} color="primary">Update</Button>
          </DialogActions>
        </Dialog>
        
        {/* Results Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle1">
                  Schedule of Loads Summary
                </Typography>
                <Typography variant="body2">
                  This schedule of loads for {loadSchedule.name} contains {loadSchedule.loads.length} load items
                  with a total connected load of {loadSchedule.totalConnectedLoad.toFixed(0)} watts ({(loadSchedule.totalConnectedLoad/1000).toFixed(2)} kW)
                  and total demand load of {loadSchedule.totalDemandLoad.toFixed(0)} watts ({(loadSchedule.totalDemandLoad/1000).toFixed(2)} kW).
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Panel Specifications
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Panel Name</TableCell>
                          <TableCell align="right">{loadSchedule.panelName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Location</TableCell>
                          <TableCell align="right">{loadSchedule.floorName || '-'} {loadSchedule.roomId ? `, ${loadSchedule.roomId}` : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Voltage</TableCell>
                          <TableCell align="right">{loadSchedule.voltage} V</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Current</TableCell>
                          <TableCell align="right">{loadSchedule.current.toFixed(2)} A</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Power Factor</TableCell>
                          <TableCell align="right">{loadSchedule.powerFactor.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Connected Load</TableCell>
                          <TableCell align="right">{loadSchedule.totalConnectedLoad.toFixed(0)} W ({(loadSchedule.totalConnectedLoad/1000).toFixed(2)} kW)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Demand Load</TableCell>
                          <TableCell align="right">{loadSchedule.totalDemandLoad.toFixed(0)} W ({(loadSchedule.totalDemandLoad/1000).toFixed(2)} kW)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Apparent Power</TableCell>
                          <TableCell align="right">{(loadSchedule.totalDemandLoad / loadSchedule.powerFactor).toFixed(0)} VA ({(loadSchedule.totalDemandLoad / loadSchedule.powerFactor / 1000).toFixed(2)} kVA)</TableCell>
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
                    Energy Consumption Estimate
                  </Typography>
                  
                  {calculationResults ? (
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" scope="row">Daily Operating Hours</TableCell>
                            <TableCell align="right">{calculationResults.dailyOperatingHours} hours</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Peak Demand</TableCell>
                            <TableCell align="right">{calculationResults.peakDemand.toFixed(2)} kW</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Load Factor</TableCell>
                            <TableCell align="right">{(calculationResults.loadFactor * 100).toFixed(0)}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Monthly Energy Consumption</TableCell>
                            <TableCell align="right">{calculationResults.monthlyEnergyConsumption.toFixed(2)} kWh</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Annual Energy Consumption</TableCell>
                            <TableCell align="right">{calculationResults.annualEnergyConsumption.toFixed(2)} kWh</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Estimated Monthly Cost</TableCell>
                            <TableCell align="right">PHP {calculationResults.monthlyCost.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">Estimated Annual Cost</TableCell>
                            <TableCell align="right">PHP {calculationResults.annualCost.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <Typography color="textSecondary">Calculating energy consumption...</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schedule of Loads Details
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Rating (W)</TableCell>
                          <TableCell align="right">D.F.</TableCell>
                          <TableCell align="right">Connected (W)</TableCell>
                          <TableCell align="right">Demand (W)</TableCell>
                          <TableCell align="right">Current (A)</TableCell>
                          <TableCell align="right">Circuit Breaker</TableCell>
                          <TableCell align="right">Conductor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadSchedule.loads.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.rating}</TableCell>
                            <TableCell align="right">{item.demandFactor.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.connectedLoad.toFixed(0)}</TableCell>
                            <TableCell align="right">{item.demandLoad.toFixed(0)}</TableCell>
                            <TableCell align="right">{item.current?.toFixed(2) || '-'}</TableCell>
                            <TableCell align="right">{item.circuitBreaker || '-'}</TableCell>
                            <TableCell align="right">{item.conductorSize || '-'}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="subtitle2">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.totalConnectedLoad.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.totalDemandLoad.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.current.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    1. D.F. = Demand Factor
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    2. Power factor used for calculations: {loadSchedule.powerFactor.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    3. Voltage: {loadSchedule.voltage} V
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setActiveTab(1)}
                >
                  Back to Load Items
                </Button>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => setSaveDialogOpen(true)}
                    startIcon={<SaveIcon />}
                    sx={{ mr: 2 }}
                    disabled={calculating}
                  >
                    Save Results
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={handleExportPdf}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ mr: 2 }}
                    disabled={!onExportPdf || calculating}
                  >
                    Export as PDF
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save Schedule of Loads</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Schedule Name"
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
      <QuickStartDialog
        open={quickStartOpen}
        onClose={() => setQuickStartOpen(false)}
      />
      
      {/* Voltage Drop Analysis Dialog */}
      <VoltageDropAnalysisDialog
        open={voltageDropDialogOpen}
        onClose={() => setVoltageDropDialogOpen(false)}
        loadItem={selectedLoadItem}
        loadSchedule={loadSchedule}
        onSaveResults={handleSaveVoltageDropResults}
      />
      
      {/* Load Item Info Dialog */}
      <LoadItemInfoDialog
        open={itemInfoDialogOpen}
        onClose={() => setItemInfoDialogOpen(false)}
        loadItem={selectedLoadItem}
      />
    </Box>
  );
};

export default ScheduleOfLoadsCalculator; 