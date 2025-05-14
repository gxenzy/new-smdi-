import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Checkbox,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Alert,
  Collapse,
  CircularProgress,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import MergeIcon from '@mui/icons-material/MergeType';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SyncIcon from '@mui/icons-material/Sync';
import { useCircuitSync, Conflict } from '../../../../contexts/CircuitSynchronizationContext';
import { ConflictSeverity } from '../../../../services/ConflictService';
import ConflictResolutionDialog from './ConflictResolutionDialog';

/**
 * Component for managing and resolving synchronization conflicts between
 * Voltage Drop Calculator and Schedule of Loads
 */
const ConflictManagementPanel: React.FC = () => {
  const theme = useTheme();
  const circuitSync = useCircuitSync();
  
  // Local state
  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<ConflictSeverity[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'resolved' | 'unresolved' | ''>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentConflict, setCurrentConflict] = useState<Conflict | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [batchResolutionMenuAnchorEl, setBatchResolutionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Memoized/filtered conflicts
  const filteredConflicts = circuitSync.conflicts
    .filter((conflict: Conflict) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = conflict.name.toLowerCase().includes(searchLower);
        const typeMatch = conflict.type.toLowerCase().includes(searchLower);
        const circuitMatch = conflict.circuitId.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !typeMatch && !circuitMatch) {
          return false;
        }
      }
      
      // Filter by severity
      if (severityFilter.length > 0 && !severityFilter.includes(conflict.severity)) {
        return false;
      }
      
      // Filter by type
      if (typeFilter.length > 0 && !typeFilter.includes(conflict.type)) {
        return false;
      }
      
      // Filter by status
      if (statusFilter === 'resolved' && !conflict.resolved) {
        return false;
      }
      
      if (statusFilter === 'unresolved' && conflict.resolved) {
        return false;
      }
      
      return true;
    })
    .sort((a: Conflict, b: Conflict) => {
      // Sort by severity (highest first)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (a.severity !== b.severity) {
        return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      }
      
      // Then sort by detection time (newest first)
      return b.timestamp - a.timestamp;
    });
  
  // Reset selected conflicts when filters change
  useEffect(() => {
    setSelectedConflicts([]);
  }, [searchTerm, severityFilter, typeFilter, statusFilter]);
  
  // Handle conflict selection toggle
  const handleToggleSelection = (conflictId: string) => {
    setSelectedConflicts(prev => 
      prev.includes(conflictId)
        ? prev.filter(id => id !== conflictId)
        : [...prev, conflictId]
    );
  };
  
  // Handle select all conflicts
  const handleSelectAll = () => {
    if (selectedConflicts.length === filteredConflicts.length) {
      // Deselect all
      setSelectedConflicts([]);
    } else {
      // Select all
      setSelectedConflicts(filteredConflicts.map((conflict: Conflict) => conflict.id));
    }
  };
  
  // Handle filter menu open
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle filter menu close
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle batch resolution menu open
  const handleOpenBatchMenu = (event: React.MouseEvent<HTMLElement>) => {
    setBatchResolutionMenuAnchorEl(event.currentTarget);
  };
  
  // Handle batch resolution menu close
  const handleCloseBatchMenu = () => {
    setBatchResolutionMenuAnchorEl(null);
  };
  
  // Handle opening resolution dialog for a conflict
  const handleOpenConflictDialog = (conflict: Conflict) => {
    setCurrentConflict(conflict);
    setResolveDialogOpen(true);
  };
  
  // Handle closing resolution dialog
  const handleCloseConflictDialog = () => {
    setResolveDialogOpen(false);
    setCurrentConflict(null);
  };
  
  // Handle batch resolution
  const handleBatchResolve = async (
    strategy: 'voltage-drop' | 'schedule-of-loads' | 'merge'
  ) => {
    if (selectedConflicts.length === 0) return;
    
    setProcessingBatch(true);
    handleCloseBatchMenu();
    
    try {
      // Resolve each selected conflict
      for (const conflictId of selectedConflicts) {
        await new Promise<void>((resolve) => {
          // Simulate processing time
          setTimeout(() => {
            circuitSync.resolveConflict(conflictId, strategy);
            resolve();
          }, 100);
        });
      }
      
      // Show success message
      setAlertMessage({
        message: `Successfully resolved ${selectedConflicts.length} conflicts using "${strategy}" strategy`,
        severity: 'success'
      });
      
      // Clear selection
      setSelectedConflicts([]);
    } catch (error) {
      // Show error message
      setAlertMessage({
        message: `Error resolving conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setProcessingBatch(false);
    }
  };
  
  // Toggle severity filter
  const handleToggleSeverityFilter = (severity: ConflictSeverity) => {
    setSeverityFilter(prev => 
      prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };
  
  // Toggle type filter
  const handleToggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Count conflicts by status
  const unresolvedCount = circuitSync.conflicts.filter((c: Conflict) => !c.resolved).length;
  const resolvedCount = circuitSync.conflicts.length - unresolvedCount;
  
  // Get icon for conflict severity
  const getSeverityIcon = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get unique conflict types for filtering
  const conflictTypes = Array.from(new Set(
    circuitSync.conflicts.map((conflict: Conflict) => conflict.type)
  )) as string[];
  
  // Handle sync now
  const handleSyncNow = () => {
    circuitSync.syncNow();
  };
  
  // Handle toggle expansion
  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <>
      <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Circuit Synchronization Conflicts
          </Typography>
          
          <Box display="flex" gap={1}>
            <TextField
              placeholder="Search conflicts..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ width: 200 }}
            />
            
            <Tooltip title="Filter Conflicts">
              <IconButton
                onClick={handleOpenMenu}
                size="small"
                color={severityFilter.length > 0 || typeFilter.length > 0 || statusFilter ? 'primary' : 'default'}
              >
                <Badge
                  badgeContent={severityFilter.length + typeFilter.length + (statusFilter ? 1 : 0)}
                  color="primary"
                  invisible={severityFilter.length === 0 && typeFilter.length === 0 && !statusFilter}
                >
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2">Filter by Severity</Typography>
              </MenuItem>
              
              <MenuItem dense onClick={() => handleToggleSeverityFilter('critical')}>
                <Checkbox
                  checked={severityFilter.includes('critical')}
                  size="small"
                  color="error"
                />
                <ListItemText primary="Critical" />
                <ErrorIcon fontSize="small" color="error" />
              </MenuItem>
              
              <MenuItem dense onClick={() => handleToggleSeverityFilter('high')}>
                <Checkbox
                  checked={severityFilter.includes('high')}
                  size="small"
                  color="error"
                />
                <ListItemText primary="High" />
                <WarningIcon fontSize="small" color="error" />
              </MenuItem>
              
              <MenuItem dense onClick={() => handleToggleSeverityFilter('medium')}>
                <Checkbox
                  checked={severityFilter.includes('medium')}
                  size="small"
                  color="warning"
                />
                <ListItemText primary="Medium" />
                <WarningIcon fontSize="small" color="warning" />
              </MenuItem>
              
              <MenuItem dense onClick={() => handleToggleSeverityFilter('low')}>
                <Checkbox
                  checked={severityFilter.includes('low')}
                  size="small"
                  color="info"
                />
                <ListItemText primary="Low" />
                <InfoIcon fontSize="small" color="info" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem disabled>
                <Typography variant="subtitle2">Filter by Type</Typography>
              </MenuItem>
              
              {conflictTypes.map((type: string) => (
                <MenuItem key={type} dense onClick={() => handleToggleTypeFilter(type)}>
                  <Checkbox
                    checked={typeFilter.includes(type)}
                    size="small"
                  />
                  <ListItemText primary={type.replace(/-/g, ' ')} />
                </MenuItem>
              ))}
              
              <Divider />
              
              <MenuItem disabled>
                <Typography variant="subtitle2">Filter by Status</Typography>
              </MenuItem>
              
              <MenuItem dense onClick={() => setStatusFilter(statusFilter === 'unresolved' ? '' : 'unresolved')}>
                <Checkbox
                  checked={statusFilter === 'unresolved'}
                  size="small"
                />
                <ListItemText primary="Unresolved" />
              </MenuItem>
              
              <MenuItem dense onClick={() => setStatusFilter(statusFilter === 'resolved' ? '' : 'resolved')}>
                <Checkbox
                  checked={statusFilter === 'resolved'}
                  size="small"
                />
                <ListItemText primary="Resolved" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={() => {
                setSeverityFilter([]);
                setTypeFilter([]);
                setStatusFilter('');
                handleCloseMenu();
              }}>
                <ListItemText primary="Clear All Filters" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            {unresolvedCount} unresolved {unresolvedCount === 1 ? 'conflict' : 'conflicts'} and{' '}
            {resolvedCount} resolved {resolvedCount === 1 ? 'conflict' : 'conflicts'} found
          </Typography>
        </Box>
        
        <Collapse in={Boolean(alertMessage)}>
          <Alert 
            severity={alertMessage?.severity || 'info'} 
            onClose={() => setAlertMessage(null)}
            sx={{ mb: 2 }}
          >
            {alertMessage?.message}
          </Alert>
        </Collapse>
        
        {filteredConflicts.length > 0 ? (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Checkbox
                indeterminate={selectedConflicts.length > 0 && selectedConflicts.length < filteredConflicts.length}
                checked={selectedConflicts.length === filteredConflicts.length && filteredConflicts.length > 0}
                onChange={handleSelectAll}
              />
              
              <Typography variant="body2" sx={{ ml: 1 }}>
                {selectedConflicts.length > 0 
                  ? `${selectedConflicts.length} ${selectedConflicts.length === 1 ? 'conflict' : 'conflicts'} selected` 
                  : 'Select all'}
              </Typography>
              
              {selectedConflicts.length > 0 && (
                <Box sx={{ ml: 'auto' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BatchPredictionIcon />}
                    onClick={handleOpenBatchMenu}
                    disabled={processingBatch}
                  >
                    {processingBatch ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : (
                      'Batch Resolve'
                    )}
                  </Button>
                  
                  <Menu
                    anchorEl={batchResolutionMenuAnchorEl}
                    open={Boolean(batchResolutionMenuAnchorEl)}
                    onClose={handleCloseBatchMenu}
                  >
                    <MenuItem onClick={() => handleBatchResolve('merge')}>
                      <ListItemIcon>
                        <MergeIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Smart Merge" secondary="Recommended" />
                    </MenuItem>
                    
                    <MenuItem onClick={() => handleBatchResolve('voltage-drop')}>
                      <ListItemIcon>
                        <CheckIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Use Voltage Drop Values" />
                    </MenuItem>
                    
                    <MenuItem onClick={() => handleBatchResolve('schedule-of-loads')}>
                      <ListItemIcon>
                        <CheckIcon fontSize="small" color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="Use Schedule of Loads Values" />
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
            
            <List sx={{ mb: 1 }}>
              {filteredConflicts.map((conflict: Conflict) => (
                <Card
                  key={conflict.id}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    transition: 'all 0.2s',
                    bgcolor: conflict.resolved ? 'action.hover' : 'background.paper',
                    '&:hover': {
                      boxShadow: 1
                    }
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={selectedConflicts.includes(conflict.id)}
                        onChange={() => handleToggleSelection(conflict.id)}
                        disabled={conflict.resolved}
                      />
                      
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getSeverityIcon(conflict.severity)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="body1" fontWeight={conflict.resolved ? 'normal' : 'medium'}>
                              {conflict.name}
                            </Typography>
                            
                            {conflict.resolved && (
                              <Chip 
                                size="small" 
                                label="Resolved" 
                                color="success" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip 
                              size="small" 
                              label={conflict.type.replace(/-/g, ' ')} 
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(conflict.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          onClick={() => handleOpenConflictDialog(conflict)}
                          color={conflict.resolved ? 'inherit' : 'primary'}
                        >
                          {conflict.resolved ? 'View Details' : 'Resolve'}
                        </Button>
                      </ListItemSecondaryAction>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Conflicts Found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {circuitSync.conflicts.length === 0 
                ? 'All data is synchronized between calculators.' 
                : 'No conflicts match your current filters.'}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <ConflictResolutionDialog
        open={resolveDialogOpen}
        onClose={handleCloseConflictDialog}
        conflict={currentConflict}
      />
    </>
  );
};

export default ConflictManagementPanel; 