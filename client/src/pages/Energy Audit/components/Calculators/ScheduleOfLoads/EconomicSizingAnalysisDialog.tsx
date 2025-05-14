import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tooltip,
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AttachMoney as AttachMoneyIcon,
  ElectricalServices as ElectricalServicesIcon,
  Bolt as BoltIcon,
  AccessTime as AccessTimeIcon,
  Engineering as EngineeringIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule } from './types';
import { analyzeLoadScheduleForEconomicSizing, compareConductorLifecycleCosts } from '../utils/economicSizingUtils';

interface EconomicSizingAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedule: LoadSchedule;
  loadItem?: LoadItem | null; // Optional - if provided, analyze just this item
  onApplyRecommendation?: (loadId: string, newConductorSize: string) => void;
}

const EconomicSizingAnalysisDialog: React.FC<EconomicSizingAnalysisDialogProps> = ({
  open,
  onClose,
  loadSchedule,
  loadItem,
  onApplyRecommendation
}) => {
  const [electricityRate, setElectricityRate] = useState<number>(10.5);
  const [operatingHoursPerYear, setOperatingHoursPerYear] = useState<number>(3000);
  const [yearsOfOperation, setYearsOfOperation] = useState<number>(20);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);

  // Run analysis when dialog opens or when parameters change
  useEffect(() => {
    if (open) {
      runAnalysis();
    }
  }, [open, electricityRate, operatingHoursPerYear, yearsOfOperation, loadSchedule, loadItem]);

  // Run the economic sizing analysis
  const runAnalysis = () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      try {
        if (loadItem) {
          // Validate loadItem has minimum required values
          const enhancedLoadItem = {
            ...loadItem,
            current: loadItem.current || 1.0, // Default to 1A minimum
            conductorLength: loadItem.conductorLength || 10, // Default to 10m minimum
            circuitDetails: {
              ...loadItem.circuitDetails,
              wireType: loadItem.circuitDetails?.wireType || 'THHN_COPPER',
              type: loadItem.circuitDetails?.type || 'lighting',
              poles: loadItem.circuitDetails?.poles || 1,
              phase: loadItem.circuitDetails?.phase || 'A',
              maxVoltageDropAllowed: loadItem.circuitDetails?.maxVoltageDropAllowed || 3
            }
          };
          
          // Analyze single load item
          const availableSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1 AWG'];
          const comparison = compareConductorLifecycleCosts(
            enhancedLoadItem,
            availableSizes,
            electricityRate,
            1000, // Base cost
            yearsOfOperation,
            operatingHoursPerYear
          );
          
          setAnalysisResults({
            singleItemAnalysis: true,
            loadItem: enhancedLoadItem,
            comparison
          });
          
          setDetailedAnalysis(comparison);
        } else {
          // Analyze entire load schedule
          const analysis = analyzeLoadScheduleForEconomicSizing(
            loadSchedule,
            electricityRate,
            1000, // Base cost
            yearsOfOperation,
            operatingHoursPerYear
          );
          
          setAnalysisResults({
            singleItemAnalysis: false,
            analysis
          });
          
          // If there are opportunities, select the first one for detailed view
          if (analysis.optimizationOpportunities.length > 0) {
            setSelectedLoadId(analysis.optimizationOpportunities[0].loadId);
            
            // Get detailed analysis for this load
            const selectedLoad = loadSchedule.loads.find(
              load => load.id === analysis.optimizationOpportunities[0].loadId
            );
            
            if (selectedLoad) {
              const availableSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1 AWG'];
              const comparison = compareConductorLifecycleCosts(
                selectedLoad,
                availableSizes,
                electricityRate,
                1000,
                yearsOfOperation,
                operatingHoursPerYear
              );
              
              setDetailedAnalysis(comparison);
            }
          }
        }
      } catch (error) {
        console.error('Error during economic sizing analysis:', error);
      } finally {
        setAnalyzing(false);
      }
    }, 500); // Small timeout to ensure UI responsiveness
  };

  // Handle selecting a load for detailed analysis
  const handleSelectLoad = (loadId: string) => {
    setSelectedLoadId(loadId);
    
    // Find the load item
    const selectedLoad = loadSchedule.loads.find(load => load.id === loadId);
    
    if (selectedLoad) {
      // Get available sizes to compare
      const availableSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1 AWG'];
      
      // Run detailed analysis
      const comparison = compareConductorLifecycleCosts(
        selectedLoad,
        availableSizes,
        electricityRate,
        1000,
        yearsOfOperation,
        operatingHoursPerYear
      );
      
      setDetailedAnalysis(comparison);
    }
  };

  // Handle applying a recommendation
  const handleApplyRecommendation = (loadId: string, recommendedSize: string) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(loadId, recommendedSize);
    }
  };

  // Render the summary section for a complete load schedule analysis
  const renderScheduleAnalysisSummary = () => {
    if (!analysisResults || analysisResults.singleItemAnalysis || !analysisResults.analysis) {
      return null;
    }
    
    const analysis = analysisResults.analysis;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Economic Sizing Analysis Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Optimization Opportunities
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ElectricalServicesIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4">
                  {analysis.optimizationOpportunities.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  circuits with potential savings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Annual Savings Potential
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4">
                  {analysis.totalPotentialSavings.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PHP per year
                </Typography>
                {analysis.totalPotentialSavings > 0 && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    {((analysis.totalPotentialSavings / Math.max(analysis.totalCurrentEnergyCost, 0.01)) * 100).toFixed(1)}% of current energy cost
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Required Investment
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4">
                  {analysis.totalUpfrontCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PHP upfront cost
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Average Payback Period
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AccessTimeIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4">
                  {analysis.averagePaybackPeriod.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  years to break even
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {analysis.recommendations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recommendations:
              </Typography>
              <List dense>
                {analysis.recommendations.map((recommendation: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {index === 0 ? (
                        <EngineeringIcon color="info" fontSize="small" />
                      ) : (
                        <InfoIcon color="info" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          </Box>
        )}
      </Box>
    );
  };

  // Render the opportunities table for a complete load schedule analysis
  const renderOpportunitiesTable = () => {
    if (!analysisResults || analysisResults.singleItemAnalysis || !analysisResults.analysis) {
      return null;
    }
    
    const { optimizationOpportunities } = analysisResults.analysis;
    
    if (optimizationOpportunities.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No economic sizing optimization opportunities found with the current parameters.
          Try adjusting the electricity rate, operating hours, or years of operation.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Optimization Opportunities
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Current Size</TableCell>
                <TableCell>Recommended</TableCell>
                <TableCell align="right">Annual Savings</TableCell>
                <TableCell align="right">Upfront Cost</TableCell>
                <TableCell align="right">Payback (Years)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {optimizationOpportunities.map((opportunity: any) => (
                <TableRow 
                  key={opportunity.loadId}
                  hover
                  selected={selectedLoadId === opportunity.loadId}
                  onClick={() => handleSelectLoad(opportunity.loadId)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{opportunity.description}</TableCell>
                  <TableCell>{opportunity.currentSize}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={opportunity.recommendedSize}
                      color="primary"
                      icon={opportunity.currentSize < opportunity.recommendedSize ? 
                        <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {opportunity.potentialAnnualSavings.toFixed(2)} PHP
                  </TableCell>
                  <TableCell align="right">
                    {opportunity.upfrontCost.toFixed(2)} PHP
                  </TableCell>
                  <TableCell align="right">
                    {opportunity.paybackPeriodYears.toFixed(1)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Apply Recommendation">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyRecommendation(opportunity.loadId, opportunity.recommendedSize);
                        }}
                      >
                        <CheckCircleIcon fontSize="small" color="success" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Render detailed analysis for a selected load
  const renderDetailedAnalysis = () => {
    if (!detailedAnalysis) {
      return null;
    }
    
    const { comparisonResults, recommendations } = detailedAnalysis;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Detailed Analysis
        </Typography>
        
        {recommendations.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Recommendations:
            </Typography>
            <List dense>
              {recommendations.map((recommendation: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InfoIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Conductor Size</TableCell>
                <TableCell align="right">Material Cost</TableCell>
                <TableCell align="right">Energy Loss/Year</TableCell>
                <TableCell align="right">Annual Energy Cost</TableCell>
                <TableCell align="right">Total Lifecycle Cost</TableCell>
                <TableCell align="right">Payback Period</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonResults.map((result: any) => (
                <TableRow 
                  key={result.conductorSize}
                  sx={{ 
                    backgroundColor: result.isOptimal ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                  }}
                >
                  <TableCell>{result.conductorSize}</TableCell>
                  <TableCell align="right">{result.materialCost.toFixed(2)} PHP</TableCell>
                  <TableCell align="right">{result.energyLossPerYear.toFixed(2)} kWh</TableCell>
                  <TableCell align="right">{result.annualEnergyCost.toFixed(2)} PHP</TableCell>
                  <TableCell align="right">{result.totalLifecycleCost.toFixed(2)} PHP</TableCell>
                  <TableCell align="right">
                    {result.paybackPeriodYears === null ? 
                      'N/A' : 
                      result.paybackPeriodYears === 0 ? 
                        'Immediate' : 
                        `${result.paybackPeriodYears.toFixed(1)} years`
                    }
                  </TableCell>
                  <TableCell align="center">
                    {result.isOptimal ? (
                      <Tooltip title="Optimal Choice">
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Tooltip>
                    ) : result.paybackPeriodYears !== null && result.paybackPeriodYears < yearsOfOperation ? (
                      <Tooltip title="Economically Viable">
                        <InfoIcon color="info" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Not Economically Viable">
                        <WarningIcon color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Economic Conductor Sizing Analysis
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {analyzing ? (
          <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
            <Typography variant="body2" gutterBottom align="center">
              Analyzing economic sizing options...
            </Typography>
            <LinearProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Analysis Parameters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Electricity Rate"
                    type="number"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(Number(e.target.value))}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">PHP/kWh</InputAdornment>,
                      inputProps: { min: 1, step: 0.5 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Operating Hours"
                    type="number"
                    value={operatingHoursPerYear}
                    onChange={(e) => setOperatingHoursPerYear(Number(e.target.value))}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">hours/year</InputAdornment>,
                      inputProps: { min: 1, step: 100 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Lifecycle Period"
                    type="number"
                    value={yearsOfOperation}
                    onChange={(e) => setYearsOfOperation(Number(e.target.value))}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">years</InputAdornment>,
                      inputProps: { min: 1, max: 50, step: 1 }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ElectricalServicesIcon />}
                  onClick={runAnalysis}
                >
                  Run Analysis
                </Button>
              </Box>
            </Box>
            
            {analysisResults && (
              <>
                {renderScheduleAnalysisSummary()}
                {renderOpportunitiesTable()}
                {renderDetailedAnalysis()}
              </>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EconomicSizingAnalysisDialog; 