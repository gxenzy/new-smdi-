import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  CircularProgress,
  Collapse,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  FormControlLabel,
  Paper
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import InfoIcon from '@mui/icons-material/Info';
import DoneIcon from '@mui/icons-material/Done';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useCircuitSync } from '../../../../contexts/CircuitSynchronizationContext';
import SyncHistoryDialog from './SyncHistoryDialog';
import SyncSettingsDialog from './SyncSettingsDialog';

// Define type for conflict items
interface ConflictItem {
  id: string;
  name: string;
  type: 'circuit' | 'loadSchedule';
  voltageDropSource: {
    value: number;
    timestamp: number;
  };
  scheduleOfLoadsSource: {
    value: number;
    timestamp: number;
  };
}

const SynchronizationPanel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const circuitSync = useCircuitSync();
  
  // Local state
  const [expanded, setExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncResult, setSyncResult] = useState<null | { success: boolean; message: string }>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  
  // Add state for sync history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // State for settings and info menus
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [infoAnchorEl, setInfoAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // Handle toggle expanded
  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Handle toggle sync enabled
  const handleToggleSyncEnabled = () => {
    circuitSync.enableSync(!circuitSync.syncStatus.isEnabled);
  };
  
  // Handle toggle auto sync
  const handleToggleAutoSync = () => {
    circuitSync.setAutoSync(!circuitSync.syncStatus.autoSync);
  };
  
  // Handle sync button click
  const handleManualSync = async () => {
    if (circuitSync.syncStatus.isSyncing) return;
    
    try {
      await circuitSync.syncNow();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };
  
  // Handle clear changes
  const handleClearChanges = () => {
    circuitSync.clearChanges();
    setSyncResult({
      success: true,
      message: 'Changes cleared successfully'
    });
  };
  
  // Handle resolve conflict
  const handleResolveConflict = (
    id: string, 
    resolution: 'use-voltage-drop' | 'use-schedule-of-loads' | 'use-manual' | 'merge'
  ) => {
    // Map the resolution values to the ones expected by circuitSync.resolveConflict
    let mappedResolution: 'voltage-drop' | 'schedule-of-loads' | 'manual' | 'merge';
    
    if (resolution === 'use-voltage-drop') {
      mappedResolution = 'voltage-drop';
    } else if (resolution === 'use-schedule-of-loads') {
      mappedResolution = 'schedule-of-loads';
    } else if (resolution === 'use-manual') {
      mappedResolution = 'manual';
    } else {
      mappedResolution = 'merge';
    }
    
    circuitSync.resolveConflict(id, mappedResolution);
    setConflictDialogOpen(false);
    setSelectedConflict(null);
  };
  
  // Show conflict dialog
  const handleShowConflictDialog = (conflict: ConflictItem) => {
    setSelectedConflict(conflict);
    setConflictDialogOpen(true);
  };
  
  // Add handler to open history dialog
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };
  
  // Format time
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Detect conflicts
  useEffect(() => {
    // In a real implementation, we would detect conflicts by comparing circuit data
    // Here we're just simulating conflicts for demonstration purposes
    const mockConflicts: ConflictItem[] = [];
    
    // Iterate over circuits and look for potential conflicts
    circuitSync.circuitData.forEach((circuit) => {
      if (circuit.source === 'voltage-drop' && circuit.sourceId) {
        // This circuit came from voltage drop but has a reference to a schedule of loads item
        // Check if there's a potential conflict with the schedule of loads data
        const loadSchedule = circuitSync.getLoadScheduleById(circuit.sourceId);
        
        if (loadSchedule && 
            circuit.voltageDropPercent !== undefined && 
            loadSchedule.voltageDropPercent !== undefined &&
            Math.abs(circuit.voltageDropPercent - loadSchedule.voltageDropPercent) > 0.5) {
          // Difference of more than 0.5% in voltage drop - potential conflict
          mockConflicts.push({
            id: circuit.id,
            name: circuit.name,
            type: 'circuit',
            voltageDropSource: {
              value: circuit.voltageDropPercent,
              timestamp: Date.now() - 3600000 // 1 hour ago (mock)
            },
            scheduleOfLoadsSource: {
              value: loadSchedule.voltageDropPercent,
              timestamp: Date.now() - 1800000 // 30 minutes ago (mock)
            }
          });
        }
      }
    });
    
    setConflicts(mockConflicts);
  }, [circuitSync.circuitData, circuitSync.loadSchedules]);
  
  // Handle settings menu open
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  // Handle settings menu close
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  
  // Handle info menu open
  const handleInfoClick = (event: React.MouseEvent<HTMLElement>) => {
    setInfoAnchorEl(event.currentTarget);
  };
  
  // Handle info menu close
  const handleInfoClose = () => {
    setInfoAnchorEl(null);
  };
  
  // Get last sync time formatted
  const getLastSyncTimeFormatted = () => {
    if (!circuitSync.syncStatus.lastSyncTime) {
      return 'Never';
    }
    
    return new Date(circuitSync.syncStatus.lastSyncTime).toLocaleTimeString();
  };
  
  // Get sync status text
  const getSyncStatusText = () => {
    if (circuitSync.syncStatus.isSyncing) {
      return 'Syncing...';
    }
    
    if (!circuitSync.syncStatus.isEnabled) {
      return 'Sync Disabled';
    }
    
    if (circuitSync.syncStatus.syncError) {
      return `Error: ${circuitSync.syncStatus.syncError}`;
    }
    
    return `Last sync: ${getLastSyncTimeFormatted()}`;
  };
  
  // Get badge count - number of conflicts
  const getConflictCount = () => {
    // In the real implementation, this would count conflicts from the context
    return circuitSync.syncStats.conflicts || 0;
  };
  
  // Render the sync button based on status
  const renderSyncButton = () => {
    if (circuitSync.syncStatus.isSyncing) {
      return (
        <IconButton disabled>
          <CircularProgress size={20} />
        </IconButton>
      );
    }
    
    if (circuitSync.syncStatus.syncError) {
      return (
        <Tooltip title="Sync Error - Click to retry">
          <IconButton
            onClick={handleManualSync}
            color="error"
          >
            <SyncProblemIcon />
          </IconButton>
        </Tooltip>
      );
    }
    
    if (!circuitSync.syncStatus.isEnabled) {
      return (
        <Tooltip title="Sync Disabled">
          <IconButton disabled>
            <LockIcon />
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <Tooltip title="Sync Now">
        <Badge 
          badgeContent={getConflictCount()} 
          color="error"
          overlap="circular"
          invisible={getConflictCount() === 0}
        >
          <IconButton
            onClick={handleManualSync}
            color="primary"
          >
            <SyncIcon />
          </IconButton>
        </Badge>
      </Tooltip>
    );
  };
  
  // Render conflict dialog
  const renderConflictDialog = () => {
    if (!selectedConflict) return null;
    
    return (
      <Dialog
        open={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Resolve Data Conflict
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            There is a conflict in the data for "{selectedConflict.name}".
            Please choose which version you want to keep:
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">
                    Voltage Drop Calculator Value
                  </Typography>
                  <Typography variant="h6">
                    {selectedConflict.voltageDropSource.value.toFixed(2)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {formatTime(selectedConflict.voltageDropSource.timestamp)}
                  </Typography>
                  <Box mt={2}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleResolveConflict(selectedConflict.id, 'use-voltage-drop')}
                      fullWidth
                    >
                      Use This Value
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">
                    Schedule of Loads Value
                  </Typography>
                  <Typography variant="h6">
                    {selectedConflict.scheduleOfLoadsSource.value.toFixed(2)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {formatTime(selectedConflict.scheduleOfLoadsSource.timestamp)}
                  </Typography>
                  <Box mt={2}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleResolveConflict(selectedConflict.id, 'use-schedule-of-loads')}
                      fullWidth
                    >
                      Use This Value
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => handleResolveConflict(selectedConflict.id, 'merge')}
                fullWidth
              >
                Merge Data (Use Newest Values From Both)
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // If synchronization is not enabled at all, show a minimal version
  if (!circuitSync.syncStatus.isEnabled) {
    return (
      <Paper 
        sx={{ 
          p: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Circuit synchronization is disabled
        </Typography>
        <Box>
          <Tooltip title="Enable Synchronization">
            <IconButton onClick={handleToggleSyncEnabled} size="small">
              <LockOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Sync History">
            <IconButton onClick={() => setHistoryDialogOpen(true)} size="small">
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper 
      sx={{ 
        p: 1,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 
          circuitSync.syncStatus.syncError ? 'error.light' : 
          circuitSync.syncStatus.isSyncing ? 'action.hover' : 
          'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderSyncButton()}
        
        <Box sx={{ ml: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Circuit Synchronization
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getSyncStatusText()}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip 
          size="small"
          label={circuitSync.syncStats.changedCircuits > 0 ? `${circuitSync.syncStats.changedCircuits} changes` : 'No changes'}
          color={circuitSync.syncStats.changedCircuits > 0 ? 'primary' : 'default'}
          variant="outlined"
          sx={{ mr: 1 }}
        />
        
        <Tooltip title="View Sync History">
          <IconButton 
            size="small"
            onClick={() => setHistoryDialogOpen(true)}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Sync Info">
          <IconButton 
            size="small"
            onClick={handleInfoClick}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Sync Settings">
          <IconButton 
            size="small"
            onClick={handleSettingsClick}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsClose}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={circuitSync.syncStatus.isEnabled}
                onChange={handleToggleSyncEnabled}
                size="small"
              />
            }
            label="Enable Synchronization"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={circuitSync.syncStatus.autoSync}
                onChange={handleToggleAutoSync}
                size="small"
                disabled={!circuitSync.syncStatus.isEnabled}
              />
            }
            label="Auto-Sync Changes"
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { 
          setSettingsDialogOpen(true);
          handleSettingsClose();
        }}>
          Advanced Settings
        </MenuItem>
      </Menu>
      
      {/* Info Menu */}
      <Menu
        anchorEl={infoAnchorEl}
        open={Boolean(infoAnchorEl)}
        onClose={handleInfoClose}
      >
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="subtitle2" gutterBottom>
            Circuit Synchronization Status
          </Typography>
          
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <DoneIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
              {circuitSync.syncStats.syncedCircuits} circuits synchronized
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <WarningIcon fontSize="small" color={circuitSync.syncStats.conflicts > 0 ? 'error' : 'disabled'} sx={{ mr: 0.5 }} />
              {circuitSync.syncStats.conflicts > 0 
                ? `${circuitSync.syncStats.conflicts} conflicts detected` 
                : 'No conflicts detected'}
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
              {circuitSync.syncStatus.autoSync ? 'Auto-sync is enabled' : 'Auto-sync is disabled'}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="caption" color="text.secondary">
            Data flows between the Voltage Drop Calculator and Schedule of Loads to maintain consistency.
          </Typography>
        </Box>
      </Menu>
      
      {/* Settings Dialog */}
      {settingsDialogOpen && (
        <SyncSettingsDialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
        />
      )}
      
      {/* History Dialog */}
      <SyncHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
      />
      
      {/* Conflict Resolution Dialog */}
      {renderConflictDialog()}
    </Paper>
  );
};

export default SynchronizationPanel; 