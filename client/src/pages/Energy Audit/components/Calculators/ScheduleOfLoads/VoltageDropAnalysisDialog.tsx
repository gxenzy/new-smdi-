import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ElectricalServices as ElectricalServicesIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Compare as CompareIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule } from './types';
import { 
  unifiedCircuitToVoltageDropInputs,
  loadItemToUnifiedCircuit,
  loadScheduleToUnifiedCircuit,
  updateLoadItemWithVoltageDropResults,
  updateLoadScheduleWithVoltageDropResults,
  UnifiedCircuitData
} from '../utils/circuitDataExchange';
import { 
  VoltageDropInputs, 
  VoltageDropResult,
  calculateVoltageDropResults,
  findOptimalConductorSize
} from '../utils/voltageDropUtils';
import VoltageDropVisualization from '../VoltageDropVisualization';
import BatchVoltageDropAnalysisDialog from './BatchVoltageDropAnalysisDialog';

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

interface VoltageDropAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  loadItem?: LoadItem | null;
  loadSchedule: LoadSchedule;
  onSaveResults: (
    loadItem: LoadItem | null,
    updatedLoadSchedule: LoadSchedule
  ) => void;
}

const VoltageDropAnalysisDialog: React.FC<VoltageDropAnalysisDialogProps> = ({
  open,
  onClose,
  loadItem,
  loadSchedule,
  onSaveResults
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [circuitData, setCircuitData] = useState<UnifiedCircuitData | null>(null);
  const [voltageDropInputs, setVoltageDropInputs] = useState<VoltageDropInputs | null>(null);
  const [calculationResults, setCalculationResults] = useState<VoltageDropResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizedSize, setOptimizedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize circuit data from load item or load schedule
  useEffect(() => {
    if (open) {
      let initialCircuitData: UnifiedCircuitData;
      
      if (loadItem) {
        // We're analyzing a specific load item
        initialCircuitData = loadItemToUnifiedCircuit(
          loadItem,
          loadSchedule.voltage,
          loadSchedule.powerFactor
        );
        
        // Pre-populate with existing values if available
        if (loadItem.conductorLength) {
          initialCircuitData.conductorLength = loadItem.conductorLength;
        }
      } else {
        // We're analyzing the entire panel
        initialCircuitData = loadScheduleToUnifiedCircuit(loadSchedule);
        
        // Pre-populate with existing values if available
        if (loadSchedule.conductorLength) {
          initialCircuitData.conductorLength = loadSchedule.conductorLength;
        }
        
        if (loadSchedule.phaseConfiguration) {
          initialCircuitData.phaseConfiguration = loadSchedule.phaseConfiguration;
        }
      }
      
      setCircuitData(initialCircuitData);
      setVoltageDropInputs(unifiedCircuitToVoltageDropInputs(initialCircuitData));
      
      // Reset calculation state
      setCalculationResults(null);
      setOptimizedSize(null);
      setError(null);
      setTabValue(0);
    }
  }, [open, loadItem, loadSchedule]);
  
  // Handle input changes
  const handleInputChange = (field: keyof UnifiedCircuitData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    if (!circuitData) return;
    
    const value = event.target.value;
    const updatedCircuitData = {
      ...circuitData,
      [field]: value
    };
    
    setCircuitData(updatedCircuitData);
    setVoltageDropInputs(unifiedCircuitToVoltageDropInputs(updatedCircuitData));
    
    // Reset calculation results when inputs change
    setCalculationResults(null);
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
      const results = calculateVoltageDropResults(voltageDropInputs);
      setCalculationResults(results);
      
      // Find optimized conductor size
      const optimized = findOptimalConductorSize(voltageDropInputs);
      setOptimizedSize(optimized);
      
      // Switch to results tab
      setTabValue(1);
      setIsCalculating(false);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsCalculating(false);
    }
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
        
        onSaveResults(null, updatedLoadSchedule);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving results:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving results');
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ElectricalServicesIcon sx={{ mr: 1 }} />
          {loadItem ? 'Circuit Voltage Drop Analysis' : 'Panel Voltage Drop Analysis'}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Parameters" />
          <Tab label="Results" disabled={!calculationResults} />
          <Tab label="Visualization" disabled={!calculationResults} />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            {error}
          </Alert>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {loadItem ? `Analyzing: ${loadItem.description}` : `Analyzing: ${loadSchedule.panelName}`}
              </Typography>
              {loadItem && (
                <Typography variant="body2" color="text.secondary">
                  Load: {loadItem.connectedLoad.toFixed(2)} W ({loadItem.current?.toFixed(2) || 'N/A'} A)
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                System Voltage: {loadSchedule.voltage} V, Power Factor: {loadSchedule.powerFactor}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Conductor Length"
                type="number"
                value={circuitData?.conductorLength || ''}
                onChange={handleInputChange('conductorLength')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>
                }}
                required
                helperText="Distance from source to load"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Conductor Size</InputLabel>
                <Select
                  value={circuitData?.conductorSize || ''}
                  onChange={handleInputChange('conductorSize') as any}
                  label="Conductor Size"
                  required
                >
                  <MenuItem value="14 AWG">14 AWG</MenuItem>
                  <MenuItem value="12 AWG">12 AWG</MenuItem>
                  <MenuItem value="10 AWG">10 AWG</MenuItem>
                  <MenuItem value="8 AWG">8 AWG</MenuItem>
                  <MenuItem value="6 AWG">6 AWG</MenuItem>
                  <MenuItem value="4 AWG">4 AWG</MenuItem>
                  <MenuItem value="3 AWG">3 AWG</MenuItem>
                  <MenuItem value="2 AWG">2 AWG</MenuItem>
                  <MenuItem value="1 AWG">1 AWG</MenuItem>
                  <MenuItem value="1/0 AWG">1/0 AWG</MenuItem>
                  <MenuItem value="2/0 AWG">2/0 AWG</MenuItem>
                  <MenuItem value="3/0 AWG">3/0 AWG</MenuItem>
                  <MenuItem value="4/0 AWG">4/0 AWG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Conductor Material</InputLabel>
                <Select
                  value={circuitData?.conductorMaterial || 'copper'}
                  onChange={handleInputChange('conductorMaterial') as any}
                  label="Conductor Material"
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Conduit Material</InputLabel>
                <Select
                  value={circuitData?.conduitMaterial || 'PVC'}
                  onChange={handleInputChange('conduitMaterial') as any}
                  label="Conduit Material"
                >
                  <MenuItem value="PVC">PVC</MenuItem>
                  <MenuItem value="steel">Steel</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Circuit Type</InputLabel>
                <Select
                  value={circuitData?.circuitType || 'branch'}
                  onChange={handleInputChange('circuitType') as any}
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
              <FormControl fullWidth>
                <InputLabel>Phase Configuration</InputLabel>
                <Select
                  value={circuitData?.phaseConfiguration || 'single-phase'}
                  onChange={handleInputChange('phaseConfiguration') as any}
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
                value={circuitData?.temperature || ''}
                onChange={handleInputChange('temperature')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">°C</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {calculationResults ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      bgcolor: calculationResults.compliance === 'compliant' ? 'success.light' : 'error.light',
                      borderColor: calculationResults.compliance === 'compliant' ? 'success.main' : 'error.main'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        {calculationResults.compliance === 'compliant' ? (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <WarningIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="h6">
                          {calculationResults.compliance === 'compliant' ? 'PEC 2017 Compliant' : 'Not PEC 2017 Compliant'}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Maximum allowed voltage drop: {calculationResults.maxAllowedDrop}%
                      </Typography>
                      <Typography variant="body2">
                        Your voltage drop: {calculationResults.voltageDropPercent.toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Voltage Drop
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1">
                          Percentage: <strong>{calculationResults.voltageDropPercent.toFixed(2)}%</strong>
                        </Typography>
                        <Typography variant="body1">
                          Absolute: <strong>{calculationResults.voltageDrop.toFixed(2)} V</strong>
                        </Typography>
                        <Typography variant="body1">
                          Receiving End Voltage: <strong>{calculationResults.receivingEndVoltage.toFixed(2)} V</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Wire Capacity
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1">
                          Current Rating: <strong>{calculationResults.wireRating.ampacity} A</strong>
                        </Typography>
                        <Typography variant="body1">
                          Load Current: <strong>{voltageDropInputs?.loadCurrent} A</strong>
                        </Typography>
                        <Typography variant="body1" color={calculationResults.wireRating.isAdequate ? 'success.main' : 'error.main'}>
                          <strong>{calculationResults.wireRating.isAdequate ? 'Adequate' : 'Not Adequate'}</strong>
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
                            Optimal size: <strong>{optimizedSize}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {optimizedSize === circuitData?.conductorSize 
                              ? 'Your current conductor size is optimal.' 
                              : 'Consider using this conductor size for optimal results.'}
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
                        {calculationResults.recommendations.map((recommendation, index) => (
                          <Typography key={index} variant="body2" paragraph>
                            • {recommendation}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              Calculate voltage drop first to see results.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {calculationResults && voltageDropInputs ? (
            <VoltageDropVisualization
              inputs={voltageDropInputs}
              results={calculationResults}
              isCalculated={true}
            />
          ) : (
            <Alert severity="info">
              Calculate voltage drop first to see visualization.
            </Alert>
          )}
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        
        {tabValue === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCalculate}
            startIcon={isCalculating ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Voltage Drop'}
          </Button>
        )}
        
        {calculationResults && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveResults}
            startIcon={<ElectricalServicesIcon />}
          >
            Save Results
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VoltageDropAnalysisDialog; 