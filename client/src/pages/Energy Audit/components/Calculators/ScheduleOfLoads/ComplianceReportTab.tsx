import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  RefreshOutlined as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  PriorityHigh as PriorityHighIcon,
  ElectricalServices as ElectricalServicesIcon
} from '@mui/icons-material';
import { LoadSchedule, LoadItem } from './types';
import { updateLoadScheduleCompliance } from '../utils/pecComplianceUtils';

interface ComplianceReportTabProps {
  loadSchedule: LoadSchedule;
  onUpdateLoadSchedule: (updatedSchedule: LoadSchedule) => void;
  onOpenCircuitDetails: (loadItem: LoadItem) => void;
}

const ComplianceReportTab: React.FC<ComplianceReportTabProps> = ({
  loadSchedule,
  onUpdateLoadSchedule,
  onOpenCircuitDetails
}) => {
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Update compliance information when component mounts or loadSchedule changes
  useEffect(() => {
    updateComplianceReport();
  }, []);

  // Generate compliance report
  const updateComplianceReport = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const updatedSchedule = updateLoadScheduleCompliance(loadSchedule);
        onUpdateLoadSchedule(updatedSchedule);
      } catch (error) {
        console.error('Error updating compliance:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // Small timeout to ensure UI responsiveness
  };

  // Toggle expanded state of a load item
  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculate compliance statistics
  const complianceStats = React.useMemo(() => {
    const total = loadSchedule.loads.length;
    const compliant = loadSchedule.loads.filter(item => item.isPECCompliant).length;
    const nonCompliant = total - compliant;
    const panelCompliant = loadSchedule.isPECCompliant || false;
    
    // Count loads missing circuit details
    const missingDetails = loadSchedule.loads.filter(item => 
      !item.circuitDetails || !item.circuitBreaker || !item.conductorSize
    ).length;
    
    return {
      total,
      compliant,
      nonCompliant,
      panelCompliant,
      missingDetails,
      percentCompliant: total > 0 ? (compliant / total) * 100 : 0
    };
  }, [loadSchedule]);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              PEC 2017 Compliance Report
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={updateComplianceReport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Compliance Report'}
            </Button>
          </Box>
        </Grid>

        {/* Compliance Summary */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Compliance Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Overall Status
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      {loadSchedule.isPECCompliant ? (
                        <CheckCircleIcon color="success" sx={{ fontSize: 50 }} />
                      ) : (
                        <WarningIcon color="error" sx={{ fontSize: 50 }} />
                      )}
                    </Box>
                    <Chip
                      label={loadSchedule.isPECCompliant ? 'PEC 2017 Compliant' : 'Non-Compliant'}
                      color={loadSchedule.isPECCompliant ? 'success' : 'error'}
                      icon={loadSchedule.isPECCompliant ? <VerifiedUserIcon /> : <PriorityHighIcon />}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Compliance Rate
                    </Typography>
                    <Typography variant="h3" color={complianceStats.percentCompliant > 80 ? 'success.main' : 'error.main'}>
                      {complianceStats.percentCompliant.toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {complianceStats.compliant} of {complianceStats.total} loads compliant
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Issues Found
                    </Typography>
                    <Typography variant="h3" color={complianceStats.nonCompliant > 0 ? 'error.main' : 'success.main'}>
                      {complianceStats.nonCompliant}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {complianceStats.missingDetails > 0 && `${complianceStats.missingDetails} loads missing details`}
                      {complianceStats.missingDetails === 0 && "All loads have complete details"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Panel Compliance Section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Panel Compliance Assessment
            </Typography>

            {loadSchedule.panelCompliance ? (
              <>
                {!loadSchedule.panelCompliance.isCompliant && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      Panel Level Issues:
                    </Typography>
                    <List dense>
                      {loadSchedule.panelCompliance.issues.map((issue, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={issue} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                {loadSchedule.panelCompliance.recommendations.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      Panel Recommendations:
                    </Typography>
                    <List dense>
                      {loadSchedule.panelCompliance.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon color="info" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="info">
                Run the compliance check to analyze panel compliance.
              </Alert>
            )}

            {/* Phase Balance Information */}
            {loadSchedule.phaseConfiguration === 'three-phase' && loadSchedule.panelCompliance?.loadBalancePercentage !== undefined && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Phase Balance:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <LinearProgressWithLabel 
                      value={loadSchedule.panelCompliance.loadBalancePercentage} 
                      isGood={loadSchedule.panelCompliance.loadBalancePercentage < 20} 
                    />
                  </Box>
                  <Chip 
                    label={`${loadSchedule.panelCompliance.loadBalancePercentage.toFixed(1)}%`} 
                    color={loadSchedule.panelCompliance.loadBalancePercentage < 20 ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  PEC 2017 recommends phase imbalance less than 20%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Load Items Compliance */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Individual Load Compliance
            </Typography>

            {complianceStats.missingDetails > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {complianceStats.missingDetails} load items are missing circuit details required for compliance checking.
                  Click the circuit icon to add details.
                </Typography>
              </Alert>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Current (A)</TableCell>
                    <TableCell>Circuit Breaker</TableCell>
                    <TableCell>Conductor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadSchedule.loads.map((load) => (
                    <React.Fragment key={load.id}>
                      <TableRow 
                        hover
                        onClick={() => toggleItemExpanded(load.id)}
                        sx={{ 
                          cursor: 'pointer',
                          backgroundColor: !load.circuitDetails ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell>{load.description}</TableCell>
                        <TableCell>{load.current?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>{load.circuitBreaker || '-'}</TableCell>
                        <TableCell>{load.conductorSize || '-'}</TableCell>
                        <TableCell>
                          {!load.circuitDetails || !load.circuitBreaker ? (
                            <Chip 
                              size="small" 
                              label="Missing Details" 
                              color="default" 
                              icon={<InfoIcon />} 
                            />
                          ) : load.isPECCompliant ? (
                            <Chip 
                              size="small" 
                              label="Compliant" 
                              color="success" 
                              icon={<CheckCircleIcon />} 
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="Non-Compliant" 
                              color="error" 
                              icon={<WarningIcon />} 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Circuit Details">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCircuitDetails(load);
                              }}
                            >
                              <ElectricalServicesIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded row with compliance details */}
                      {expandedItems[load.id] && load.pecCompliance && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                              {!load.isPECCompliant && load.pecCompliance.issues.length > 0 && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2">
                                    Compliance Issues:
                                  </Typography>
                                  <List dense>
                                    {load.pecCompliance.issues.map((issue, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                          <WarningIcon color="warning" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={issue} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Alert>
                              )}
                              
                              {load.pecCompliance.recommendations.length > 0 && (
                                <Alert severity="info">
                                  <Typography variant="subtitle2">
                                    Recommendations:
                                  </Typography>
                                  <List dense>
                                    {load.pecCompliance.recommendations.map((rec, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                          <BuildIcon color="info" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={rec} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Alert>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom LinearProgress with label
const LinearProgressWithLabel = ({ value, isGood }: { value: number; isGood: boolean }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <div style={{ 
            height: 10, 
            width: '100%', 
            backgroundColor: '#e0e0e0',
            borderRadius: 5,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(value, 100)}%`,
              backgroundColor: isGood ? '#4caf50' : '#ff9800',
              borderRadius: 5
            }} />
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default ComplianceReportTab; 