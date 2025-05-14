import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CalculateIcon from '@mui/icons-material/Calculate';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PreviewIcon from '@mui/icons-material/Preview';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Import all utility functions from the index file
import {
  Fixture,
  RoomData,
  LPDResult,
  EnergySavings,
  BuildingPreset,
  RoomPreset,
  BUILDING_TYPES,
  BUILDING_PRESETS,
  DEFAULT_FIXTURES,
  calculateLPDResults,
  calculateEnergySavings,
  generateRecommendations,
  loadBuildingStandards,
  getBuildingPreset,
  getRoomPreset,
  BuildingStandardsType,
  saveCalculation,
  exportLPDToPDF,
  createLPDPDFDataUrl
} from './utils';

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
  
  // Presets state
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<BuildingPreset | null>(null);
  const [selectedRoomPreset, setSelectedRoomPreset] = useState<string>('');
  
  // Energy savings state
  const [calculateSavings, setCalculateSavings] = useState<boolean>(true);
  const [energyParameters, setEnergyParameters] = useState({
    hoursPerDay: 10,
    daysPerYear: 260,
    energyRate: 0.12,
    upgradeFixtureCost: 1000
  });
  const [showEnergyDialog, setShowEnergyDialog] = useState(false);
  
  // PDF export state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info'
  });
  
  // Standards state
  const [buildingStandards, setBuildingStandards] = useState<BuildingStandardsType>(BUILDING_TYPES);
  const [isLoadingStandards, setIsLoadingStandards] = useState(false);
  
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
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Open preset dialog
  const handleOpenPresetDialog = () => {
    setPresetDialogOpen(true);
  };
  
  // Close preset dialog
  const handleClosePresetDialog = () => {
    setPresetDialogOpen(false);
  };
  
  // Handle preset building selection
  const handlePresetBuildingChange = (e: SelectChangeEvent) => {
    const presetName = e.target.value;
    const preset = getBuildingPreset(presetName);
    setSelectedPreset(preset);
    setSelectedRoomPreset('');  // Reset room selection
  };
  
  // Handle preset room selection
  const handlePresetRoomChange = (e: SelectChangeEvent) => {
    setSelectedRoomPreset(e.target.value);
  };
  
  // Apply selected preset
  const applyPreset = () => {
    if (!selectedPreset) {
      return;
    }
    
    // If a specific room is selected, use that
    if (selectedRoomPreset) {
      const roomPreset = selectedPreset.typicalRooms.find(r => r.name === selectedRoomPreset);
      if (roomPreset) {
        setRoomData({
          name: roomPreset.name,
          area: roomPreset.area,
          buildingType: selectedPreset.buildingType,
          fixtures: roomPreset.fixtures.map(f => ({ ...f, id: `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
        });
        showNotification(`Applied preset for ${roomPreset.name}`, 'success');
      }
    } else {
      // Otherwise use the first room in the preset
      const roomPreset = selectedPreset.typicalRooms[0];
      setRoomData({
        name: roomPreset.name,
        area: roomPreset.area,
        buildingType: selectedPreset.buildingType,
        fixtures: roomPreset.fixtures.map(f => ({ ...f, id: `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
      });
      showNotification(`Applied preset for ${roomPreset.name}`, 'success');
    }
    
    // Reset calculation when preset is applied
    if (isCalculated) {
      setIsCalculated(false);
    }
    
    handleClosePresetDialog();
  };
  
  // Open energy parameters dialog
  const handleOpenEnergyDialog = () => {
    setShowEnergyDialog(true);
  };
  
  // Close energy parameters dialog
  const handleCloseEnergyDialog = () => {
    setShowEnergyDialog(false);
  };
  
  // Handle energy parameter changes
  const handleEnergyParamChange = (param: keyof typeof energyParameters) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = parseFloat(e.target.value) || 0;
      setEnergyParameters({
        ...energyParameters,
        [param]: value
      });
    };
  
  // Toggle calculate savings
  const handleToggleCalculateSavings = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalculateSavings(e.target.checked);
  };
  
  // Create and export PDF
  const handleExportPDF = async () => {
    if (!calculation) return;
    
    setExportingPdf(true);
    try {
      const exportData = {
        roomData,
        results: calculation,
        timestamp: new Date().toISOString()
      };
      
      const filename = exportLPDToPDF(exportData);
      showNotification(`Exported to ${filename}`, 'success');
    } catch (error) {
      showNotification('Failed to export PDF', 'error');
      console.error('PDF export error:', error);
    } finally {
      setExportingPdf(false);
    }
  };
  
  // Preview PDF
  const handlePreviewPDF = async () => {
    if (!calculation) return;
    
    setExportingPdf(true);
    try {
      const exportData = {
        roomData,
        results: calculation,
        timestamp: new Date().toISOString()
      };
      
      const dataUrl = createLPDPDFDataUrl(exportData);
      setPdfUrl(dataUrl);
      setShowPdfPreview(true);
    } catch (error) {
      showNotification('Failed to create PDF preview', 'error');
      console.error('PDF preview error:', error);
    } finally {
      setExportingPdf(false);
    }
  };
  
  // Close PDF preview
  const handleClosePdfPreview = () => {
    setShowPdfPreview(false);
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
      // Use the utility function to calculate results, including energy savings if enabled
      const result = await calculateLPDResults(
        roomData,
        calculateSavings,
        calculateSavings ? energyParameters : undefined
      );
      
      setCalculation(result);
      setIsCalculated(true);
      showNotification('Calculation completed successfully', 'success');
    } catch (error) {
      if (error instanceof Error) {
        setError(`Calculation error: ${error.message}`);
      } else {
        setError('An unknown error occurred during calculation.');
      }
      showNotification('Calculation failed', 'error');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Save calculation
  const handleSave = () => {
    if (calculation) {
      saveCalculation(
        'lighting',
        `LPD Calculation - ${roomData.name}`,
        {
          roomData,
          results: calculation,
          timestamp: new Date().toISOString()
        }
      );
      
      // Show success message
      alert('Calculation saved successfully!');
    }
  };
  
  return (
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
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleOpenPresetDialog}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Load Preset Configuration
                </Button>
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
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={calculateSavings} 
                      onChange={handleToggleCalculateSavings}
                      color="primary"
                    />
                  }
                  label="Calculate Energy Savings"
                />
                {calculateSavings && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleOpenEnergyDialog}
                    startIcon={<MonetizationOnIcon />}
                  >
                    Configure Parameters
                  </Button>
                )}
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
                  onClick={handleSave}
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
                
                {/* Energy Savings Section */}
                {calculation.potentialSavings && (
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        bgcolor: 'info.light',
                        borderColor: 'info.main',
                        mt: 2
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOnIcon sx={{ mr: 1 }} />
                          Energy Savings Potential
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Power Savings
                            </Typography>
                            <Typography variant="body1">
                              {calculation.potentialSavings.wattageSavings.toFixed(1)} W
                              {calculation.potentialSavings.percentageSavings > 0 && (
                                <Typography component="span" variant="body2" color="success.main" sx={{ ml: 1 }}>
                                  ({calculation.potentialSavings.percentageSavings.toFixed(1)}% reduction)
                                </Typography>
                              )}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Annual Energy Savings
                            </Typography>
                            <Typography variant="body1">
                              {calculation.potentialSavings.estimatedAnnualKwh.toFixed(1)} kWh/year
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Annual Cost Savings
                            </Typography>
                            <Typography variant="body1">
                              ${calculation.potentialSavings.estimatedAnnualCost.toFixed(2)}/year
                            </Typography>
                          </Grid>
                          
                          {calculation.potentialSavings.paybackPeriod && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Estimated Payback Period
                              </Typography>
                              <Typography variant="body1">
                                {calculation.potentialSavings.paybackPeriod.toFixed(1)} years
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<PreviewIcon />}
                      onClick={handlePreviewPDF}
                      disabled={exportingPdf}
                    >
                      Preview PDF
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={exportingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                      onClick={handleExportPDF}
                      disabled={exportingPdf}
                    >
                      Export PDF
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> This calculator uses the Philippine Green Building Code standards for Lighting Power Density.
              Values are based on space function and building type, with a focus on energy efficiency.
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Preset Dialog */}
      <Dialog 
        open={presetDialogOpen} 
        onClose={handleClosePresetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Load Room Preset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select a building type and room preset to quickly load a pre-configured room with typical fixtures.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Building Preset</InputLabel>
                <Select
                  value={selectedPreset?.name || ''}
                  label="Building Preset"
                  onChange={handlePresetBuildingChange}
                >
                  {BUILDING_PRESETS.map(preset => (
                    <MenuItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {selectedPreset && (
              <Grid item xs={12}>
                <Typography variant="body2" paragraph>
                  {selectedPreset.description}
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={selectedRoomPreset}
                    label="Room Type"
                    onChange={handlePresetRoomChange}
                  >
                    {selectedPreset.typicalRooms.map(room => (
                      <MenuItem key={room.name} value={room.name}>
                        {room.name} ({room.area} m²)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedRoomPreset && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Includes {selectedPreset.typicalRooms.find(r => r.name === selectedRoomPreset)?.fixtures.length} pre-configured fixtures
                    </Typography>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePresetDialog}>Cancel</Button>
          <Button 
            onClick={applyPreset} 
            variant="contained" 
            color="primary"
            disabled={!selectedPreset}
          >
            Apply Preset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Energy Parameters Dialog */}
      <Dialog 
        open={showEnergyDialog} 
        onClose={handleCloseEnergyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Energy Savings Parameters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure parameters used to calculate potential energy savings for your lighting design.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hours of Operation per Day"
                type="number"
                value={energyParameters.hoursPerDay}
                onChange={handleEnergyParamChange('hoursPerDay')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">h/day</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Days of Operation per Year"
                type="number"
                value={energyParameters.daysPerYear}
                onChange={handleEnergyParamChange('daysPerYear')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Electricity Rate"
                type="number"
                value={energyParameters.energyRate}
                onChange={handleEnergyParamChange('energyRate')}
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
                label="Estimated Upgrade Cost"
                type="number"
                value={energyParameters.upgradeFixtureCost}
                onChange={handleEnergyParamChange('upgradeFixtureCost')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                margin="normal"
                helperText="Total cost to upgrade fixtures"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnergyDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* PDF Preview Dialog */}
      <Dialog
        open={showPdfPreview}
        onClose={handleClosePdfPreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent sx={{ height: '80vh' }}>
          {pdfUrl && (
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="100%" 
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePdfPreview}>Close</Button>
          <Button 
            onClick={handleExportPDF} 
            variant="contained" 
            color="primary"
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default LightingPowerDensityCalculator; 