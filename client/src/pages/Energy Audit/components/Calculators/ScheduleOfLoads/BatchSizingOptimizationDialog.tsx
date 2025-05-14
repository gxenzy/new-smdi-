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
  optimizeCircuit,
  optimizeAllCircuits,
  getOptimizationRecommendation,
  calculateOptimizationROI,
  CircuitOptimizationResult,
  BatchOptimizationResult
} from '../utils/circuitOptimizationUtils';
import { exportBatchSizingToPdf } from '../utils/batchSizingReport';

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
      id={`batch-optimization-tabpanel-${index}`}
      aria-labelledby={`batch-optimization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface BatchSizingOptimizationDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedule: LoadSchedule;
  onSaveResults: (updatedLoadSchedule: LoadSchedule) => void;
}

/**
 * Dialog component for batch sizing optimization of circuits
 */
const BatchSizingOptimizationDialog: React.FC<BatchSizingOptimizationDialogProps> = ({
  open,
  onClose,
  loadSchedule,
  onSaveResults
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<BatchOptimizationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    needsOptimization: false,
    highPriorityOnly: false,
    positiveROIOnly: true
  });
  
  // Optimization parameters
  const [optimizationParams, setOptimizationParams] = useState({
    operatingHoursPerYear: 2500, // ~7 hours per day
    energyCostPerKwh: 0.12, // USD per kWh
    analysisTimeframeYears: 5, // Look at 5-year ROI
    maxVoltageDropPercent: 3.0, // PEC 2017 recommended max for branch circuits
    optimizeForCompliance: true, // Prioritize compliance
    optimizeForEconomics: true, // Consider economic factors
    includeSafetyFactor: true, // Include safety factor in sizing
    safetyFactorPercent: 20 // 20% safety margin
  });
  
  // Add PDF export options state
  const [pdfExportOptions, setPdfExportOptions] = useState({
    title: `Sizing Optimization - ${loadSchedule.panelName || 'Panel'}`,
    includeNonOptimizedCircuits: false,
    includeCharts: true,
    paperSize: 'a4' as 'a4' | 'letter',
    orientation: 'landscape' as 'portrait' | 'landscape'
  });
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsOptimizing(false);
      setProgress(0);
      setOptimizationResults(null);
      setTabValue(0);
    }
  }, [open]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle parameter changes
  const handleParamChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setOptimizationParams({
      ...optimizationParams,
      [field]: event.target.value
    });
  };
  
  // Handle boolean parameter changes
  const handleBooleanParamChange = (field: string) => (
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
  
  // Start the batch optimization
  const handleStartOptimization = async () => {
    if (!loadSchedule || !loadSchedule.loads || loadSchedule.loads.length === 0) {
      return;
    }

    setIsOptimizing(true);
    setProgress(0);
    setOptimizationResults(null);

    try {
      // Perform batch optimization
      const batchOptResults = optimizeAllCircuits(
        loadSchedule,
        {
          maxVoltageDropPercent: optimizationParams.maxVoltageDropPercent,
          operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
          energyCostPerKwh: optimizationParams.energyCostPerKwh,
          // Use the onProgress callback to update progress
          onProgress: (completedItems, totalItems) => {
            setProgress(Math.round((completedItems / totalItems) * 100));
          }
        }
      );
      
      // Set the optimization results
      setOptimizationResults(batchOptResults);
      
      // Switch to results tab
      setTabValue(1);
    } catch (error) {
      console.error("Error performing batch optimization:", error);
    } finally {
      setIsOptimizing(false);
      setProgress(100); // Ensure progress bar completes
    }
  };
  
  // Handle applying all recommended optimizations
  const handleApplyAllOptimizations = () => {
    if (!optimizationResults) return;
    
    // Create a copy of the load schedule
    const updatedLoadSchedule = { ...loadSchedule };
    
    // Apply all optimization recommendations
    optimizationResults.results.forEach(result => {
      // Find the corresponding load item
      const loadIndex = updatedLoadSchedule.loads.findIndex(load => load.id === result.loadId);
      if (loadIndex >= 0) {
        // Only apply if there's a recommendation and it's different from current size
        if (result.optimizedConductorSize && result.optimizedConductorSize !== result.originalConductorSize) {
          updatedLoadSchedule.loads[loadIndex].conductorSize = result.optimizedConductorSize;
          
          // Update voltage drop results if available
          if (result.optimizedVoltageDropPercent !== undefined) {
            if (!updatedLoadSchedule.loads[loadIndex].voltageDropResults) {
              updatedLoadSchedule.loads[loadIndex].voltageDropResults = {
                voltageDropPercent: result.optimizedVoltageDropPercent,
                isCompliant: result.optimizedVoltageDropPercent <= optimizationParams.maxVoltageDropPercent
              };
            } else {
              updatedLoadSchedule.loads[loadIndex].voltageDropResults = {
                ...updatedLoadSchedule.loads[loadIndex].voltageDropResults,
                voltageDropPercent: result.optimizedVoltageDropPercent,
                isCompliant: result.optimizedVoltageDropPercent <= optimizationParams.maxVoltageDropPercent
              };
            }
          }
        }
      }
    });
    
    // Save the updated load schedule
    onSaveResults(updatedLoadSchedule);
    onClose();
  };
  
  // Apply selected optimizations
  const handleApplySelectedOptimizations = (selectedIds: string[]) => {
    if (!optimizationResults || selectedIds.length === 0) return;
    
    // Create a copy of the load schedule
    const updatedLoadSchedule = { ...loadSchedule };
    
    // Apply selected optimization recommendations
    selectedIds.forEach(id => {
      const result = optimizationResults.results.find(r => r.loadId === id);
      if (!result) return;
      
      // Find the corresponding load item
      const loadIndex = updatedLoadSchedule.loads.findIndex(load => load.id === result.loadId);
      if (loadIndex >= 0) {
        // Only apply if there's a recommendation and it's different from current size
        if (result.optimizedConductorSize && result.optimizedConductorSize !== result.originalConductorSize) {
          updatedLoadSchedule.loads[loadIndex].conductorSize = result.optimizedConductorSize;
          
          // Update voltage drop results if available
          if (result.optimizedVoltageDropPercent !== undefined) {
            if (!updatedLoadSchedule.loads[loadIndex].voltageDropResults) {
              updatedLoadSchedule.loads[loadIndex].voltageDropResults = {
                voltageDropPercent: result.optimizedVoltageDropPercent,
                isCompliant: result.optimizedVoltageDropPercent <= optimizationParams.maxVoltageDropPercent
              };
            } else {
              updatedLoadSchedule.loads[loadIndex].voltageDropResults = {
                ...updatedLoadSchedule.loads[loadIndex].voltageDropResults,
                voltageDropPercent: result.optimizedVoltageDropPercent,
                isCompliant: result.optimizedVoltageDropPercent <= optimizationParams.maxVoltageDropPercent
              };
            }
          }
        }
      }
    });
    
    // Save the updated load schedule
    onSaveResults(updatedLoadSchedule);
    onClose();
  };
  
  // Filter optimization results based on search term and filter options
  const getFilteredResults = () => {
    if (!optimizationResults) return [];
    
    return optimizationResults.results.filter(result => {
      // Find the load item for this result
      const loadItem = loadSchedule.loads.find(l => l.id === result.loadId);
      if (!loadItem) return false;
      
      // Filter by search term (case-insensitive)
      const matchesSearch = !searchTerm || 
        loadItem.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter based on optimization options
      const needsOptimization = result.optimizedConductorSize !== result.originalConductorSize;
      const isHighPriority = result.priority === 'critical' || result.priority === 'high';
      const hasPositiveROI = result.breakEvenTimeMonths < (optimizationParams.analysisTimeframeYears * 12);
      
      // Apply filters
      let passesFilters = true;
      if (filterOptions.needsOptimization) passesFilters = passesFilters && needsOptimization;
      if (filterOptions.highPriorityOnly) passesFilters = passesFilters && isHighPriority;
      if (filterOptions.positiveROIOnly) passesFilters = passesFilters && hasPositiveROI;
      
      return matchesSearch && passesFilters;
    });
  };
  
  // Handle exporting to PDF
  const handleExportToPdf = async () => {
    if (!optimizationResults) return;
    
    try {
      await exportBatchSizingToPdf(
        loadSchedule,
        optimizationResults,
        {
          operatingHoursPerYear: optimizationParams.operatingHoursPerYear,
          energyCostPerKwh: optimizationParams.energyCostPerKwh,
          analysisTimeframeYears: optimizationParams.analysisTimeframeYears,
          maxVoltageDropPercent: optimizationParams.maxVoltageDropPercent
        },
        pdfExportOptions
      );
    } catch (error) {
      console.error('Error exporting optimization results to PDF:', error);
    }
  };
  
  // Render the optimization parameters configuration
  const renderParameterConfig = () => {
    return (
      <Box>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Panel Information
            </Typography>
            <Typography variant="body1">
              {loadSchedule.panelName} - {loadSchedule.name || 'Schedule of Loads'}
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
              Economic Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operating Hours per Year"
                  type="number"
                  value={optimizationParams.operatingHoursPerYear}
                  onChange={handleParamChange('operatingHoursPerYear')}
                  margin="normal"
                  helperText="Estimated yearly operating hours"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Energy Cost"
                  type="number"
                  value={optimizationParams.energyCostPerKwh}
                  onChange={handleParamChange('energyCostPerKwh')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">per kWh</InputAdornment>
                  }}
                  margin="normal"
                  helperText="Cost of electricity per kWh"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Analysis Timeframe"
                  type="number"
                  value={optimizationParams.analysisTimeframeYears}
                  onChange={handleParamChange('analysisTimeframeYears')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">years</InputAdornment>
                  }}
                  margin="normal"
                  helperText="Timeframe for ROI analysis"
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Switch
                  checked={optimizationParams.optimizeForEconomics}
                  onChange={handleBooleanParamChange('optimizeForEconomics')}
                  color="primary"
                />
              }
              label="Prioritize economic factors in recommendations"
            />
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Technical Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Voltage Drop"
                  type="number"
                  value={optimizationParams.maxVoltageDropPercent}
                  onChange={handleParamChange('maxVoltageDropPercent')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  margin="normal"
                  helperText="Maximum allowed voltage drop percentage"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Safety Factor"
                  type="number"
                  value={optimizationParams.safetyFactorPercent}
                  onChange={handleParamChange('safetyFactorPercent')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  disabled={!optimizationParams.includeSafetyFactor}
                  margin="normal"
                  helperText="Safety margin for conductor sizing"
                />
              </Grid>
            </Grid>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={optimizationParams.optimizeForCompliance}
                    onChange={handleBooleanParamChange('optimizeForCompliance')}
                    color="primary"
                  />
                }
                label="Prioritize PEC compliance in recommendations"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={optimizationParams.includeSafetyFactor}
                    onChange={handleBooleanParamChange('includeSafetyFactor')}
                    color="primary"
                  />
                }
                label="Include safety factor in sizing calculations"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  // Render the optimization results
  const renderOptimizationResults = () => {
    if (!optimizationResults) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No optimization results available. Please run optimization first.
        </Alert>
      );
    }

    const filteredResults = getFilteredResults();
    
    return (
      <Box>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimization Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Total Circuits</Typography>
                <Typography variant="h5">{optimizationResults.results.length}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Non-Compliant Circuits</Typography>
                <Typography variant="h5" color="error.main">
                  {optimizationResults.totalNonCompliantCircuits}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Optimizable Circuits</Typography>
                <Typography variant="h5" color="primary.main">
                  {optimizationResults.totalOptimizedCircuits}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Annual Energy Savings</Typography>
                <Typography variant="h5" color="success.main">
                  ${Math.abs(optimizationResults.totalEnergySavingsAnnual).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search circuits..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ mr: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.needsOptimization}
                    onChange={handleFilterChange('needsOptimization')}
                  />
                }
                label="Needs Optimization"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.highPriorityOnly}
                    onChange={handleFilterChange('highPriorityOnly')}
                  />
                }
                label="High Priority Only"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterOptions.positiveROIOnly}
                    onChange={handleFilterChange('positiveROIOnly')}
                  />
                }
                label="Positive ROI Only"
              />
            </Box>
          </Box>
        </Box>
        
        {filteredResults.length === 0 ? (
          <Alert severity="info">
            No circuits match your filter criteria.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Circuit</TableCell>
                  <TableCell>Current Size</TableCell>
                  <TableCell>Current VD%</TableCell>
                  <TableCell>Recommended Size</TableCell>
                  <TableCell>New VD%</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Material Cost</TableCell>
                  <TableCell>Annual Savings</TableCell>
                  <TableCell>ROI Period</TableCell>
                  <TableCell>Options</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.map((result) => {
                  const loadItem = loadSchedule.loads.find(l => l.id === result.loadId);
                  if (!loadItem) return null;
                  
                  // Determine if this optimization should be emphasized
                  const needsOptimization = result.optimizedConductorSize !== result.originalConductorSize;
                  const isHighPriority = result.priority === 'critical' || result.priority === 'high';
                  const hasPositiveROI = result.breakEvenTimeMonths < (optimizationParams.analysisTimeframeYears * 12);
                  
                  // Determine row style
                  const rowStyle = needsOptimization 
                    ? (isHighPriority ? { backgroundColor: 'rgba(255, 232, 232, 0.5)' } : undefined)
                    : undefined;
                  
                  return (
                    <TableRow key={result.loadId} style={rowStyle}>
                      <TableCell>
                        {loadItem.description}
                        {result.isNonCompliant && (
                          <Tooltip title="Non-compliant with PEC 2017">
                            <WarningIcon fontSize="small" color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{result.originalConductorSize}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          color={result.originalVoltageDropPercent > optimizationParams.maxVoltageDropPercent ? 'error' : 'textPrimary'}
                        >
                          {result.originalVoltageDropPercent.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {needsOptimization ? (
                          <Typography component="span" fontWeight="bold" color="primary">
                            {result.optimizedConductorSize}
                          </Typography>
                        ) : (
                          result.optimizedConductorSize
                        )}
                      </TableCell>
                      <TableCell>
                        {result.optimizedVoltageDropPercent && (
                          <Typography
                            component="span"
                            color={result.optimizedVoltageDropPercent > optimizationParams.maxVoltageDropPercent ? 'error' : 'success.main'}
                          >
                            {result.optimizedVoltageDropPercent.toFixed(2)}%
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.priority}
                          size="small"
                          color={
                            result.priority === 'critical' ? 'error' :
                            result.priority === 'high' ? 'warning' :
                            result.priority === 'medium' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        ${Math.abs(result.materialCostChange).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          color={result.energySavingsAnnual > 0 ? 'success.main' : 'textPrimary'}
                        >
                          ${result.energySavingsAnnual.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {result.breakEvenTimeMonths < (optimizationParams.analysisTimeframeYears * 12) ? (
                          <Typography component="span" color="success.main">
                            {(result.breakEvenTimeMonths / 12).toFixed(1)} yrs
                          </Typography>
                        ) : (
                          <Typography component="span" color="text.secondary">
                            {'>'} {optimizationParams.analysisTimeframeYears} yrs
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          disabled={!needsOptimization}
                          onClick={() => handleApplySelectedOptimizations([result.loadId])}
                        >
                          Apply
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isOptimizing ? undefined : onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Batch Sizing Optimization</Typography>
          {!isOptimizing && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isOptimizing ? (
          <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Optimizing Circuits...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 2, mb: 1, maxWidth: 400, mx: 'auto' }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress}% Complete
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Configuration" />
                <Tab label="Results" disabled={!optimizationResults} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {renderParameterConfig()}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderOptimizationResults()}
            </TabPanel>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        {isOptimizing ? (
          <Button disabled>
            Please wait...
          </Button>
        ) : (
          <>
            {tabValue === 0 && (
              <>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartOptimization}
                  startIcon={<CalculateIcon />}
                >
                  Start Optimization
                </Button>
              </>
            )}
            
            {tabValue === 1 && optimizationResults && (
              <>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleExportToPdf}
                  startIcon={<PictureAsPdfIcon />}
                  sx={{ mr: 1 }}
                >
                  Export PDF
                </Button>
                {optimizationResults.totalOptimizedCircuits > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyAllOptimizations}
                    startIcon={<UpgradeIcon />}
                  >
                    Apply All Optimizations
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BatchSizingOptimizationDialog; 