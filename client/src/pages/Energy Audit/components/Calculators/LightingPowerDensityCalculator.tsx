import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CalculateIcon from '@mui/icons-material/Calculate';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PreviewIcon from '@mui/icons-material/Preview';
import TemplateIcon from '@mui/icons-material/AutoAwesome';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestoreIcon from '@mui/icons-material/Restore';

import { saveCalculation } from './utils/storage';
import {
  Fixture,
  RoomData,
  LPDResult,
  EnergySavings,
  BuildingPreset,
  RoomPreset,
  EnergyParameters,
  BUILDING_TYPES,
  BUILDING_PRESETS,
  DEFAULT_FIXTURES,
  calculateLPDResults,
  calculateEnergySavings,
  generateRecommendations,
  loadBuildingStandards,
  getBuildingPreset,
  getRoomPreset
} from './utils/lightingPowerDensityUtils';
import { BuildingStandardsType } from './utils/standards';

// Import PDF export functionality
import { exportLPDToPDF, createLPDPDFDataUrl } from './utils/pdfExport';

// Import data persistence utilities
import { 
  saveCalculatorState, 
  loadCalculatorState, 
  hasDraftState, 
  clearDraftState,
  createAutoSave 
} from './utils/calculatorStateStorage';
import CalculatorStateRecoveryDialog from './utils/CalculatorStateRecoveryDialog';

// Define the state structure for storage
interface LightingCalculatorState {
  roomData: RoomData;
  calculation: LPDResult | null;
  isCalculated: boolean;
  energyParameters: EnergyParameters;
}

const LightingPowerDensityCalculator: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [roomData, setRoomData] = useState<RoomData>({
    name: 'Sample Room',
    area: 100,
    buildingType: 'office',
    fixtures: []
  });
  
  const [newFixture, setNewFixture] = useState<Omit<Fixture, 'id'>>({
    name: DEFAULT_FIXTURES[0].name,
    wattage: DEFAULT_FIXTURES[0].wattage,
    ballastFactor: DEFAULT_FIXTURES[0].ballastFactor,
    quantity: 1
  });
  
  const [customFixtureName, setCustomFixtureName] = useState('');
  const [customFixtureSelected, setCustomFixtureSelected] = useState(false);
  
  const [calculation, setCalculation] = useState<LPDResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Standards state - use the BuildingStandardsType instead of the specific BUILDING_TYPES shape
  const [buildingStandards, setBuildingStandards] = useState<BuildingStandardsType>(BUILDING_TYPES);
  const [isLoadingStandards, setIsLoadingStandards] = useState(false);
  
  // Presets dialog state
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [selectedBuildingPreset, setSelectedBuildingPreset] = useState<BuildingPreset | null>(null);
  const [selectedRoomPreset, setSelectedRoomPreset] = useState<RoomPreset | null>(null);
  
  // Energy savings calculation
  const [calculateSavings, setCalculateSavings] = useState(false);
  const [energySavingsDialogOpen, setEnergySavingsDialogOpen] = useState(false);
  const [energyParameters, setEnergyParameters] = useState<EnergyParameters>({
    hoursPerDay: 10,
    daysPerYear: 260,
    energyRate: 0.15, // $/kWh
    upgradeFixtureCost: 2000
  });
  
  // PDF preview
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  
  // Notification
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Add state for recovery dialog and save dialog
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  
  // Create auto-save function with debounce
  const autoSave = createAutoSave<LightingCalculatorState>('lighting', 3000);
  
  // Check for draft and handle recovery on initial load
  useEffect(() => {
    if (isInitialLoad) {
      const hasDraft = hasDraftState('lighting');
      if (hasDraft) {
        setRecoveryDialogOpen(true);
      }
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);
  
  // Auto-save whenever state changes
  useEffect(() => {
    // Only trigger auto-save if not on initial load and there's at least one fixture
    if (!isInitialLoad && roomData.fixtures.length > 0) {
      const state: LightingCalculatorState = {
        roomData,
        calculation,
        isCalculated,
        energyParameters
      };
      autoSave(state);
    }
  }, [roomData, calculation, isCalculated, energyParameters, isInitialLoad]);
  
  // Recovery dialog handlers
  const handleRecoverDraft = () => {
    try {
      const savedState = loadCalculatorState<LightingCalculatorState>('lighting', true);
      if (savedState) {
        setRoomData(savedState.roomData);
        setCalculation(savedState.calculation);
        setIsCalculated(savedState.isCalculated);
        setEnergyParameters(savedState.energyParameters);
        
        showNotification('Recovered draft calculation', 'success');
      }
    } catch (error) {
      console.error('Failed to recover draft:', error);
      showNotification('Failed to recover draft', 'error');
    }
    
    setRecoveryDialogOpen(false);
  };
  
  const handleDiscardDraft = () => {
    clearDraftState('lighting');
    setRecoveryDialogOpen(false);
    showNotification('Discarded draft calculation', 'info');
  };

  // Save dialog functions
  const handleOpenSaveDialog = () => {
    if (isCalculated && calculation) {
      setSaveName(`Lighting Calculation - ${roomData.name}`);
      setSaveDialogOpen(true);
    } else {
      showNotification('Please calculate results before saving', 'warning');
    }
  };
  
  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
  };
  
  const handleSaveConfirm = () => {
    if (saveName.trim() === '') {
      showNotification('Please enter a name for the calculation', 'warning');
      return;
    }
    
    handleSave();
    setSaveDialogOpen(false);
    
    // Clear draft state after explicit save
    clearDraftState('lighting');
  };
  
  // Load standards on component mount
  useEffect(() => {
    const fetchStandards = async () => {
      setIsLoadingStandards(true);
      try {
        const standards = await loadBuildingStandards();
        setBuildingStandards(standards);
      } catch (error) {
        console.error('Failed to load building standards:', error);
        // Keep using the default BUILDING_TYPES
      } finally {
        setIsLoadingStandards(false);
      }
    };
    
    fetchStandards();
  }, []);
  
  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Open presets dialog
  const openPresetsDialog = () => {
    setPresetsOpen(true);
  };
  
  // Close presets dialog
  const closePresetsDialog = () => {
    setPresetsOpen(false);
  };
  
  // Handle building preset selection
  const handleBuildingPresetChange = (event: SelectChangeEvent) => {
    const presetName = event.target.value;
    const preset = getBuildingPreset(presetName);
    setSelectedBuildingPreset(preset);
    setSelectedRoomPreset(null);
  };
  
  // Handle room preset selection
  const handleRoomPresetChange = (event: SelectChangeEvent) => {
    if (!selectedBuildingPreset) return;
    
    const roomName = event.target.value;
    const roomPreset = getRoomPreset(selectedBuildingPreset, roomName);
    setSelectedRoomPreset(roomPreset);
  };
  
  // Apply selected preset
  const applyPreset = () => {
    if (selectedRoomPreset && selectedBuildingPreset) {
      setRoomData({
        name: selectedRoomPreset.name,
        area: selectedRoomPreset.area,
        buildingType: selectedBuildingPreset.buildingType,
        fixtures: selectedRoomPreset.fixtures.map(fixture => ({
          ...fixture,
          id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        }))
      });
      
      setIsCalculated(false);
      closePresetsDialog();
      showNotification('Preset applied successfully', 'success');
    }
  };
  
  // Open energy savings dialog
  const openEnergySavingsDialog = () => {
    setEnergySavingsDialogOpen(true);
  };
  
  // Close energy savings dialog
  const closeEnergySavingsDialog = () => {
    setEnergySavingsDialogOpen(false);
  };
  
  // Apply energy parameters
  const applyEnergyParameters = () => {
    setCalculateSavings(true);
    closeEnergySavingsDialog();
    // Recalculate if we already have a calculation
    if (isCalculated) {
      calculateLPD();
    }
  };
  
  // Handle energy parameter change
  const handleEnergyParameterChange = (field: keyof EnergyParameters) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = parseFloat(e.target.value) || 0;
      setEnergyParameters({
        ...energyParameters,
        [field]: value
      });
    };
  
  // Handle text input changes
  const handleTextInputChange = (field: keyof Omit<RoomData, 'fixtures'>) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'area' ? 
        parseFloat(e.target.value) || 0 : 
        e.target.value;
        
      setRoomData({
        ...roomData,
        [field]: value
      });
      
      // Reset calculation when inputs change
      if (isCalculated) {
        setIsCalculated(false);
      }
    };
  
  // Handle select changes
  const handleSelectChange = (field: keyof Omit<RoomData, 'fixtures'>) => 
    (e: SelectChangeEvent) => {
      setRoomData({
        ...roomData,
        [field]: e.target.value
      });
      
      // Reset calculation when inputs change
      if (isCalculated) {
        setIsCalculated(false);
      }
    };
  
  // Handle fixture selection
  const handleFixtureTypeChange = (e: SelectChangeEvent) => {
    const selected = e.target.value;
    
    if (selected === 'custom') {
      setCustomFixtureSelected(true);
      setNewFixture({
        ...newFixture,
        name: customFixtureName || 'Custom Fixture'
      });
    } else {
      setCustomFixtureSelected(false);
      const fixture = DEFAULT_FIXTURES.find(f => f.name === selected);
      if (fixture) {
        setNewFixture({
          name: fixture.name,
          wattage: fixture.wattage,
          ballastFactor: fixture.ballastFactor,
          quantity: newFixture.quantity
        });
      }
    }
  };
  
  // Handle custom fixture name change
  const handleCustomFixtureNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.value;
    setCustomFixtureName(name);
    setNewFixture({
      ...newFixture,
      name: name || 'Custom Fixture'
    });
  };
  
  // Handle new fixture parameter changes
  const handleNewFixtureChange = (field: keyof Omit<Fixture, 'id' | 'name'>) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = parseFloat(e.target.value) || 0;
      setNewFixture({
        ...newFixture,
        [field]: value
      });
    };
  
  // Add fixture to room
  const addFixture = () => {
    const fixture: Fixture = {
      id: `fixture-${Date.now()}`,
      ...newFixture
    };
    
    setRoomData({
      ...roomData,
      fixtures: [...roomData.fixtures, fixture]
    });
    
    // Reset quantity but keep other properties
    setNewFixture({
      ...newFixture,
      quantity: 1
    });
    
    // Reset calculation when fixtures change
    if (isCalculated) {
      setIsCalculated(false);
    }
  };
  
  // Remove fixture from room
  const removeFixture = (id: string) => {
    setRoomData({
      ...roomData,
      fixtures: roomData.fixtures.filter(f => f.id !== id)
    });
    
    // Reset calculation when fixtures change
    if (isCalculated) {
      setIsCalculated(false);
    }
  };
  
  // Calculate LPD
  const calculateLPD = async () => {
    // Ensure we have valid inputs
    if (roomData.area <= 0) {
      setError('Please enter a valid room area.');
      return;
    }
    
    if (roomData.fixtures.length === 0) {
      setError('Please add at least one fixture to the room.');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Use the utility function to calculate results
      const result = await calculateLPDResults(roomData, calculateSavings, calculateSavings ? energyParameters : undefined);
      setCalculation(result);
      setIsCalculated(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Calculation error: ${error.message}`);
      } else {
        setError('An unknown error occurred during calculation.');
      }
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Modify handleSave to include the updated save functionality
  const handleSave = () => {
    if (!isCalculated || !calculation) {
      showNotification('Please calculate results before saving', 'warning');
      return;
    }
    
    try {
      // Save the calculation to the saved calculations store
      const savedId = saveCalculation('lighting', 
        saveName || `Lighting Calculation - ${roomData.name}`,
        {
          roomData,
          calculation,
          energyParameters,
          calculatedSavings: calculateSavings
        }
      );
      
      if (!savedId) {
        throw new Error('Failed to save calculation to storage');
      }
      
      // Also save to calculator state storage as a permanent saved state
      saveCalculatorState('lighting', {
        roomData,
        calculation,
        isCalculated,
        energyParameters
      }, false); // false means this is a user-saved state, not a draft
      
      // Clear draft state after explicit save
      clearDraftState('lighting');
      
      showNotification('Calculation saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save calculation:', error);
      showNotification('Failed to save calculation', 'error');
    }
  };
  
  // Export to PDF
  const handleExportPDF = () => {
    if (calculation) {
      try {
        const filename = exportLPDToPDF({
          roomData,
          results: calculation,
          timestamp: new Date().toISOString()
        });
        
        showNotification(`Exported as ${filename}`, 'success');
      } catch (error) {
        console.error('PDF Export error:', error);
        showNotification('Failed to export PDF. Please try again.', 'error');
      }
    }
  };
  
  // Preview PDF
  const handlePreviewPDF = () => {
    if (calculation) {
      try {
        const dataUrl = createLPDPDFDataUrl({
          roomData,
          results: calculation,
          timestamp: new Date().toISOString()
        });
        
        setPdfDataUrl(dataUrl);
        setPdfPreviewOpen(true);
      } catch (error) {
        console.error('PDF Preview error:', error);
        showNotification('Failed to generate PDF preview. Please try again.', 'error');
      }
    }
  };
  
  // Handle PDF preview close
  const handlePdfPreviewClose = () => {
    setPdfPreviewOpen(false);
  };
  
  return (
    <>
      {/* Add Recovery Dialog */}
      <CalculatorStateRecoveryDialog
        open={recoveryDialogOpen}
        onClose={() => setRecoveryDialogOpen(false)}
        calculatorType="lighting"
        onRecoverDraft={handleRecoverDraft}
        onDiscardDraft={handleDiscardDraft}
      />
      
      {/* Add Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={handleSaveDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            fullWidth
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveConfirm} 
            color="primary" 
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Lighting Power Density (LPD) Calculator
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Calculate lighting power density and verify compliance with PEC 2017 standards.
          Enter room details and add fixtures to determine if your lighting design meets energy efficiency requirements.
        </Typography>
        
        {isLoadingStandards && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading standards data...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'error.light', 
              color: 'error.main',
              borderRadius: 1
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
        
        <Grid container spacing={3}>
          {/* Room Information Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Room Information
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<TemplateIcon />}
                  onClick={openPresetsDialog}
                  size="small"
                >
                  Load Preset
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Name"
                    name="name"
                    value={roomData.name}
                    onChange={handleTextInputChange('name')}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Room Area"
                    name="area"
                    type="number"
                    value={roomData.area}
                    onChange={handleTextInputChange('area')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m²</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Building Type</InputLabel>
                    <Select
                      value={roomData.buildingType}
                      label="Building Type"
                      onChange={handleSelectChange('buildingType')}
                    >
                      {Object.entries(buildingStandards).map(([key, { label }]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Tooltip title={`Maximum LPD for ${buildingStandards[roomData.buildingType as keyof typeof buildingStandards]?.label}: ${buildingStandards[roomData.buildingType as keyof typeof buildingStandards]?.maxLPD} W/m²`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoOutlinedIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="info.main">
                        PEC Standard: {buildingStandards[roomData.buildingType as keyof typeof buildingStandards]?.maxLPD} W/m²
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Add Fixtures Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Fixtures
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Fixture Type</InputLabel>
                    <Select
                      value={customFixtureSelected ? 'custom' : newFixture.name}
                      label="Fixture Type"
                      onChange={handleFixtureTypeChange}
                    >
                      {DEFAULT_FIXTURES.map(fixture => (
                        <MenuItem key={fixture.name} value={fixture.name}>
                          {fixture.name} ({fixture.wattage}W)
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Custom Fixture</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {customFixtureSelected && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Fixture Name"
                      value={customFixtureName}
                      onChange={handleCustomFixtureNameChange}
                      margin="normal"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sm={customFixtureSelected ? 4 : 6}>
                  <TextField
                    fullWidth
                    label="Wattage"
                    type="number"
                    value={newFixture.wattage}
                    onChange={handleNewFixtureChange('wattage')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">W</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={customFixtureSelected ? 4 : 6} sm={customFixtureSelected ? 4 : 3}>
                  <TextField
                    fullWidth
                    label="Ballast Factor"
                    type="number"
                    value={newFixture.ballastFactor}
                    onChange={handleNewFixtureChange('ballastFactor')}
                    inputProps={{ step: 0.01, min: 0.5, max: 1.5 }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={customFixtureSelected ? 4 : 6} sm={customFixtureSelected ? 4 : 3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={newFixture.quantity}
                    onChange={handleNewFixtureChange('quantity')}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addFixture}
                    fullWidth
                  >
                    Add Fixture
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Fixtures List Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fixtures List
              </Typography>
              
              {roomData.fixtures.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table aria-label="fixtures table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fixture Type</TableCell>
                        <TableCell align="right">Wattage (W)</TableCell>
                        <TableCell align="right">Ballast Factor</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total Wattage (W)</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomData.fixtures.map((fixture) => {
                        const totalFixtureWattage = fixture.wattage * fixture.ballastFactor * fixture.quantity;
                        
                        return (
                          <TableRow key={fixture.id}>
                            <TableCell component="th" scope="row">
                              {fixture.name}
                            </TableCell>
                            <TableCell align="right">{fixture.wattage}</TableCell>
                            <TableCell align="right">{fixture.ballastFactor.toFixed(2)}</TableCell>
                            <TableCell align="right">{fixture.quantity}</TableCell>
                            <TableCell align="right">{totalFixtureWattage.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <IconButton onClick={() => removeFixture(fixture.id)} color="error" size="small">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="text.secondary">
                    No fixtures added yet. Add fixtures using the form above.
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={calculateSavings}
                        onChange={() => calculateSavings ? setCalculateSavings(false) : openEnergySavingsDialog()}
                      />
                    }
                    label="Calculate Energy Savings"
                  />
                  <Tooltip title="Configure energy savings parameters" arrow>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={openEnergySavingsDialog}
                      disabled={!calculateSavings}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={isCalculating ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    onClick={calculateLPD}
                    disabled={roomData.fixtures.length === 0 || isCalculating}
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate LPD'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<SaveIcon />}
                    onClick={handleOpenSaveDialog}
                    disabled={!isCalculated}
                  >
                    Save Results
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Results Section */}
          {isCalculated && calculation && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Calculation Results
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Total Lighting Power
                            </Typography>
                            <Typography variant="h5">
                              {calculation.totalWattage.toFixed(2)} W
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Lighting Power Density (LPD)
                            </Typography>
                            <Typography variant="h5">
                              {calculation.lpd.toFixed(2)} W/m²
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            bgcolor: calculation.isCompliant ? 'success.light' : 'error.light',
                            borderColor: calculation.isCompliant ? 'success.main' : 'error.main'
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {calculation.isCompliant ? (
                                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                              ) : (
                                <ErrorIcon color="error" sx={{ mr: 1 }} />
                              )}
                              
                              <Typography 
                                variant="h6" 
                                color={calculation.isCompliant ? 'success.main' : 'error.main'}
                              >
                                {calculation.isCompliant ? 'Compliant' : 'Non-Compliant'} with PEC 2017 Standards
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Standard for {calculation.buildingTypeLabel}: {calculation.standardLPD} W/m²
                            </Typography>
                            
                            <Typography variant="body2">
                              Your design: {calculation.lpd.toFixed(2)} W/m² 
                              ({calculation.isCompliant 
                                ? `${((1 - calculation.lpd / calculation.standardLPD) * 100).toFixed(1)}% below limit` 
                                : `${((calculation.lpd / calculation.standardLPD - 1) * 100).toFixed(1)}% above limit`})
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {calculation.potentialSavings && (
                        <Grid item xs={12}>
                          <Card variant="outlined" sx={{ bgcolor: 'info.light', borderColor: 'info.main' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MonetizationOnIcon color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="info.main">
                                  Energy Savings Potential
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Power Savings:
                                  </Typography>
                                  <Typography variant="body1">
                                    {calculation.potentialSavings.wattageSavings.toFixed(1)} W
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Percentage:
                                  </Typography>
                                  <Typography variant="body1">
                                    {calculation.potentialSavings.percentageSavings.toFixed(1)}%
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Annual Savings:
                                  </Typography>
                                  <Typography variant="body1">
                                    {calculation.potentialSavings.estimatedAnnualKwh.toFixed(0)} kWh
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="textSecondary">
                                    Cost Savings:
                                  </Typography>
                                  <Typography variant="body1">
                                    ${calculation.potentialSavings.estimatedAnnualCost.toFixed(2)}/yr
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommendations
                        </Typography>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        {calculation.recommendations.map((recommendation, index) => (
                          <Typography key={index} variant="body2" paragraph>
                            {recommendation}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PreviewIcon />}
                        onClick={handlePreviewPDF}
                      >
                        Preview PDF
                      </Button>
                      
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleExportPDF}
                      >
                        Export PDF
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> This calculator uses the Philippine Green Building Code standards for Lighting Power Density.
                        Values are based on space function and building type, with a focus on energy efficiency.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Building Presets Dialog */}
      <Dialog open={presetsOpen} onClose={closePresetsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Select Room Preset</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Building Type</InputLabel>
                <Select
                  value={selectedBuildingPreset?.name || ''}
                  label="Building Type"
                  onChange={handleBuildingPresetChange}
                >
                  {BUILDING_PRESETS.map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedBuildingPreset && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedBuildingPreset.description}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" disabled={!selectedBuildingPreset}>
                <InputLabel>Room Preset</InputLabel>
                <Select
                  value={selectedRoomPreset?.name || ''}
                  label="Room Preset"
                  onChange={handleRoomPresetChange}
                  disabled={!selectedBuildingPreset}
                >
                  {selectedBuildingPreset?.typicalRooms.map((room) => (
                    <MenuItem key={room.name} value={room.name}>
                      {room.name} ({room.area} m²)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedRoomPreset && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedRoomPreset.description}
                </Typography>
              )}
            </Grid>
            
            {selectedRoomPreset && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preset Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Building Type: {selectedBuildingPreset?.buildingType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room Area: {selectedRoomPreset.area} m²
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Fixtures: {selectedRoomPreset.fixtures.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fixture Types: {Array.from(new Set(selectedRoomPreset.fixtures.map(f => f.name))).join(', ')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePresetsDialog}>Cancel</Button>
          <Button 
            onClick={applyPreset} 
            color="primary" 
            variant="contained"
            disabled={!selectedRoomPreset}
          >
            Apply Preset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Energy Savings Dialog */}
      <Dialog open={energySavingsDialogOpen} onClose={closeEnergySavingsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Energy Savings Parameters</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure parameters to calculate potential energy and cost savings.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Daily Operating Hours"
                type="number"
                value={energyParameters.hoursPerDay}
                onChange={handleEnergyParameterChange('hoursPerDay')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hrs/day</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Operating Days per Year"
                type="number"
                value={energyParameters.daysPerYear}
                onChange={handleEnergyParameterChange('daysPerYear')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days/yr</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Energy Rate"
                type="number"
                value={energyParameters.energyRate}
                onChange={handleEnergyParameterChange('energyRate')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">per kWh</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fixture Upgrade Cost"
                type="number"
                value={energyParameters.upgradeFixtureCost}
                onChange={handleEnergyParameterChange('upgradeFixtureCost')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEnergySavingsDialog}>Cancel</Button>
          <Button 
            onClick={applyEnergyParameters} 
            color="primary" 
            variant="contained"
          >
            Apply Parameters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onClose={handlePdfPreviewClose} maxWidth="lg" fullWidth>
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ height: '70vh', width: '100%' }}>
            {pdfDataUrl && (
              <iframe
                src={pdfDataUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePdfPreviewClose}>Close</Button>
          <Button 
            onClick={handleExportPDF} 
            color="primary" 
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LightingPowerDensityCalculator; 