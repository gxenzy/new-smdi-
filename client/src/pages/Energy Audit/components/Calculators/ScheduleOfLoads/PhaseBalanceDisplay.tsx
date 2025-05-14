import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Bolt as BoltIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  Balance as BalanceIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { LoadItem, LoadSchedule } from './types';
import { calculatePhaseLoads, analyzePhaseChangeImpact } from '../utils/phaseBalanceUtils';

interface PhaseBalanceDisplayProps {
  loadSchedule: LoadSchedule;
  onUpdateLoadPhase?: (loadId: string, newPhase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C') => void;
}

const PhaseBalanceDisplay: React.FC<PhaseBalanceDisplayProps> = ({ loadSchedule, onUpdateLoadPhase }) => {
  const [phaseAnalysis, setPhaseAnalysis] = useState<ReturnType<typeof calculatePhaseLoads> | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<LoadItem | null>(null);
  const [targetPhase, setTargetPhase] = useState<'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C'>('A');
  const [phaseChangeAnalysis, setPhaseChangeAnalysis] = useState<ReturnType<typeof analyzePhaseChangeImpact> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Calculate phase balance on component mount or loadSchedule change
  useEffect(() => {
    if (loadSchedule) {
      const analysis = calculatePhaseLoads(loadSchedule);
      setPhaseAnalysis(analysis);
    }
  }, [loadSchedule]);

  // Generate phase color based on load percentage
  const getPhaseColor = (phaseCurrent: number, maxCurrent: number) => {
    const loadPercentage = maxCurrent > 0 ? (phaseCurrent / maxCurrent) * 100 : 0;
    
    if (loadPercentage > 90) return '#f44336'; // Red for heavily loaded
    if (loadPercentage > 70) return '#ff9800'; // Orange for moderately loaded
    if (loadPercentage > 50) return '#4caf50'; // Green for optimally loaded
    return '#2196f3'; // Blue for lightly loaded
  };
  
  // Get phase imbalance color
  const getImbalanceColor = (imbalance: number) => {
    if (imbalance > 20) return '#f44336'; // Red for high imbalance
    if (imbalance > 10) return '#ff9800'; // Orange for moderate imbalance
    return '#4caf50'; // Green for good balance
  };
  
  // Handle load phase change
  const handlePhaseChange = (loadItem: LoadItem, phase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C') => {
    if (onUpdateLoadPhase) {
      onUpdateLoadPhase(loadItem.id, phase);
    }
    setDialogOpen(false);
    setSelectedLoad(null);
  };

  // Generate phase change analysis when a load and target phase is selected
  useEffect(() => {
    if (selectedLoad && loadSchedule) {
      const analysis = analyzePhaseChangeImpact(loadSchedule, selectedLoad, targetPhase);
      setPhaseChangeAnalysis(analysis);
    } else {
      setPhaseChangeAnalysis(null);
    }
  }, [selectedLoad, targetPhase, loadSchedule]);

  // Open phase change dialog for a load
  const openPhaseChangeDialog = (loadItem: LoadItem) => {
    setSelectedLoad(loadItem);
    if (loadItem.circuitDetails?.phase) {
      setTargetPhase(loadItem.circuitDetails.phase);
    }
    setDialogOpen(true);
  };

  // If not a three-phase panel or no analysis, show message
  if (!phaseAnalysis || loadSchedule.phaseConfiguration !== 'three-phase') {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Phase Balance Analysis
        </Typography>
        <Alert severity="info">
          Phase balance analysis is only applicable for three-phase panels. 
          Set the panel configuration to "Three Phase" in the panel settings.
        </Alert>
      </Paper>
    );
  }

  // Calculate total and max current for visualization
  const totalCurrent = phaseAnalysis.phaseLoads.A + phaseAnalysis.phaseLoads.B + phaseAnalysis.phaseLoads.C;
  const maxPhaseCurrent = Math.max(
    phaseAnalysis.phaseLoads.A,
    phaseAnalysis.phaseLoads.B,
    phaseAnalysis.phaseLoads.C
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Phase Balance Analysis
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowDetailedView(!showDetailedView)}
          startIcon={showDetailedView ? <InfoIcon /> : <BarChartIcon />}
        >
          {showDetailedView ? 'Show Summary' : 'Show Details'}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Phase Imbalance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ color: getImbalanceColor(phaseAnalysis.maxImbalance) }}>
                    {phaseAnalysis.maxImbalance.toFixed(1)}%
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    {phaseAnalysis.isBalanced ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                    ) : (
                      <WarningIcon sx={{ color: '#f44336', fontSize: 32 }} />
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  PEC 2017 recommends less than 20% imbalance
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Phase Loading (Amps)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Tooltip title={`Phase A: ${phaseAnalysis.phaseLoads.A.toFixed(1)} A`}>
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Phase A
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(phaseAnalysis.phaseLoads.A / maxPhaseCurrent) * 100}
                            sx={{ 
                              height: 20, 
                              borderRadius: 1,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getPhaseColor(phaseAnalysis.phaseLoads.A, maxPhaseCurrent)
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                            {phaseAnalysis.phaseLoads.A.toFixed(1)} A
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip title={`Phase B: ${phaseAnalysis.phaseLoads.B.toFixed(1)} A`}>
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Phase B
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(phaseAnalysis.phaseLoads.B / maxPhaseCurrent) * 100}
                            sx={{ 
                              height: 20, 
                              borderRadius: 1,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getPhaseColor(phaseAnalysis.phaseLoads.B, maxPhaseCurrent)
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                            {phaseAnalysis.phaseLoads.B.toFixed(1)} A
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip title={`Phase C: ${phaseAnalysis.phaseLoads.C.toFixed(1)} A`}>
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Phase C
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(phaseAnalysis.phaseLoads.C / maxPhaseCurrent) * 100}
                            sx={{ 
                              height: 20, 
                              borderRadius: 1,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getPhaseColor(phaseAnalysis.phaseLoads.C, maxPhaseCurrent)
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                            {phaseAnalysis.phaseLoads.C.toFixed(1)} A
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total current: {totalCurrent.toFixed(1)} A
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Recommendations Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Recommendations
        </Typography>
        <Alert severity={phaseAnalysis.isBalanced ? "success" : "warning"}>
          <List dense>
            {phaseAnalysis.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {index === 0 ? (
                    <BalanceIcon color={phaseAnalysis.isBalanced ? "success" : "warning"} fontSize="small" />
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

      {/* Detailed View - Load Distribution by Phase */}
      {showDetailedView && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Load Distribution by Phase
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {['A', 'B', 'C'].map((phase) => (
              <Grid item xs={12} md={4} key={phase}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Phase {phase} Loads
                    </Typography>
                    <List dense>
                      {loadSchedule.loads
                        .filter(load => load.circuitDetails?.phase === phase || 
                                        load.circuitDetails?.phase === `A-${phase}` || 
                                        load.circuitDetails?.phase === `${phase}-A` || 
                                        load.circuitDetails?.phase === `B-${phase}` || 
                                        load.circuitDetails?.phase === `${phase}-B` || 
                                        load.circuitDetails?.phase === `C-${phase}` || 
                                        load.circuitDetails?.phase === `${phase}-C` || 
                                        load.circuitDetails?.phase === 'A-B-C')
                        .map(load => (
                          <ListItem 
                            key={load.id}
                            secondaryAction={
                              onUpdateLoadPhase && (
                                <Tooltip title="Change Phase">
                                  <SwapHorizIcon 
                                    fontSize="small" 
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => openPhaseChangeDialog(load)}
                                  />
                                </Tooltip>
                              )
                            }
                          >
                            <ListItemIcon>
                              <CircleIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: load.circuitDetails?.phase === phase ? 
                                    '#2196f3' : 
                                    '#f44336' 
                                }} 
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={load.description}
                              secondary={`${load.current?.toFixed(1) || '0.0'} A, ${
                                load.circuitDetails?.phase === phase ? 
                                'Single Phase' : 
                                (load.circuitDetails?.phase === 'A-B-C' ? 
                                  'Three Phase' : 'Two Phase')
                              }`}
                            />
                          </ListItem>
                        ))
                      }
                      {loadSchedule.loads.filter(load => 
                        load.circuitDetails?.phase === phase || 
                        load.circuitDetails?.phase === `A-${phase}` || 
                        load.circuitDetails?.phase === `${phase}-A` || 
                        load.circuitDetails?.phase === `B-${phase}` || 
                        load.circuitDetails?.phase === `${phase}-B` || 
                        load.circuitDetails?.phase === `C-${phase}` || 
                        load.circuitDetails?.phase === `${phase}-C` || 
                        load.circuitDetails?.phase === 'A-B-C'
                      ).length === 0 && (
                        <ListItem>
                          <ListItemText primary="No loads on this phase" />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Phase Change Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Change Phase for {selectedLoad?.description}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Current phase: {selectedLoad?.circuitDetails?.phase || 'Not set'}
            </Typography>
            <Typography variant="body2">
              Current: {selectedLoad?.current?.toFixed(2) || '0.00'} A
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Select Target Phase:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {(['A', 'B', 'C'] as const).map((phase) => (
              <Grid item xs={4} key={phase}>
                <Button
                  variant={targetPhase === phase ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => setTargetPhase(phase)}
                  color="primary"
                >
                  Phase {phase}
                </Button>
              </Grid>
            ))}
            {(['A-B', 'B-C', 'C-A'] as const).map((phase) => (
              <Grid item xs={4} key={phase}>
                <Button
                  variant={targetPhase === phase ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => setTargetPhase(phase)}
                  color="secondary"
                >
                  {phase}
                </Button>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button
                variant={targetPhase === 'A-B-C' ? "contained" : "outlined"}
                fullWidth
                onClick={() => setTargetPhase('A-B-C')}
                color="info"
              >
                Three Phase (A-B-C)
              </Button>
            </Grid>
          </Grid>

          {phaseChangeAnalysis && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={
                  phaseChangeAnalysis.improvement > 0 
                    ? "success" 
                    : phaseChangeAnalysis.improvement < 0 
                      ? "warning" 
                      : "info"
                }
              >
                <Typography variant="subtitle2" gutterBottom>
                  Phase Change Impact
                </Typography>
                <Typography variant="body2">
                  {phaseChangeAnalysis.recommendation}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Current imbalance: {phaseChangeAnalysis.currentImbalance.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    New imbalance: {phaseChangeAnalysis.newImbalance.toFixed(1)}%
                  </Typography>
                </Box>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          {onUpdateLoadPhase && selectedLoad && (
            <Button 
              onClick={() => handlePhaseChange(selectedLoad, targetPhase)}
              color="primary"
              variant="contained"
              disabled={selectedLoad.circuitDetails?.phase === targetPhase}
            >
              Apply Change
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PhaseBalanceDisplay; 