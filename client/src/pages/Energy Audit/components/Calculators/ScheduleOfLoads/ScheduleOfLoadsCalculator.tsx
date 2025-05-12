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
  Chip
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
  ElectricalServices as ElectricalServicesIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule, PowerCalculationResults } from './types';
import { v4 as uuidv4 } from 'uuid';

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

  // Add state for new load item
  const [newLoadItem, setNewLoadItem] = useState<Omit<LoadItem, 'id'>>({...defaultLoadItem});
  
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
    if (onSave && loadSchedule) {
      // Include calculation results if available
      onSave(loadSchedule);
      setSaveDialogOpen(false);
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

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Schedule of Loads Calculator
        </Typography>
        <Box>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)} sx={{ mr: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Learn more about Schedule of Loads">
            <IconButton onClick={() => setInfoOpen(!infoOpen)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
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
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rating (W)</TableCell>
                        <TableCell align="right">Demand Factor</TableCell>
                        <TableCell align="right">Connected Load (W)</TableCell>
                        <TableCell align="right">Demand Load (W)</TableCell>
                        <TableCell align="right">Current (A)</TableCell>
                        <TableCell align="right">VA</TableCell>
                        <TableCell align="right">Circuit Breaker</TableCell>
                        <TableCell align="right">Conductor</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadSchedule.loads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} align="center">
                            <Typography variant="body2" color="textSecondary">
                              No load items added yet. Add some items to continue.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        loadSchedule.loads.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.rating}</TableCell>
                            <TableCell align="right">{item.demandFactor.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.connectedLoad.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.demandLoad.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.current?.toFixed(2) || '-'}</TableCell>
                            <TableCell align="right">{item.voltAmpere?.toFixed(2) || '-'}</TableCell>
                            <TableCell align="right">{item.circuitBreaker || '-'}</TableCell>
                            <TableCell align="right">{item.conductorSize || '-'}</TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => setEditingLoad(item)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteLoadItem(item.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      
                      {/* Show totals if we have items */}
                      {loadSchedule.loads.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="subtitle2">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.totalConnectedLoad.toFixed(2)} W
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.totalDemandLoad.toFixed(2)} W
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {loadSchedule.current.toFixed(2)} A
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {(loadSchedule.totalDemandLoad / loadSchedule.powerFactor).toFixed(2)} VA
                            </Typography>
                          </TableCell>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                  onClick={handleExportPdf}
                  startIcon={<PictureAsPdfIcon />}
                  sx={{ mr: 2 }}
                  disabled={!onExportPdf || calculating}
                >
                  Export as PDF
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setSaveDialogOpen(true)}
                  startIcon={<SaveIcon />}
                  disabled={calculating}
                >
                  Save Results
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
      
      {/* Quick Start Guide Dialog */}
      <Dialog open={quickStartOpen} onClose={() => setQuickStartOpen(false)} maxWidth="md">
        <DialogTitle>Schedule of Loads Quick Start Guide</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>How to Use the Schedule of Loads Calculator</Typography>
          
          <Typography variant="subtitle1" gutterBottom>Step 1: Enter Basic Information</Typography>
          <Typography variant="body2" paragraph>
            Start by entering the basic information about your electrical panel including the panel name, location, and electrical specifications.
            Include voltage, power factor, and circuit breaker information if available.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>Step 2: Add Load Items</Typography>
          <Typography variant="body2" paragraph>
            Add each electrical load item by specifying its description, quantity, power rating in watts, and demand factor.
            The demand factor is a decimal value between 0 and 1 that represents the percentage of connected load expected to operate simultaneously.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>Step 3: Review Results</Typography>
          <Typography variant="body2" paragraph>
            After adding load items, you can review the summary, which includes connected load, demand load, current calculations,
            and estimated energy consumption. You can save the schedule or export it as a PDF for your records.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>Tips for Accurate Calculations:</Typography>
          <Typography variant="body2" component="ul">
            <li>Use accurate power ratings from equipment nameplates when available</li>
            <li>Consider appropriate demand factors based on the load type and usage patterns</li>
            <li>For lighting, use the actual fixture wattage including ballast factor if applicable</li>
            <li>For motors, include starting current considerations if appropriate</li>
            <li>Double-check all measurements and specifications for accuracy</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickStartOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScheduleOfLoadsCalculator; 