import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  AlertProps,
  Alert,
  Collapse,
  FormGroup,
  Slider,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { useCircuitSync } from '../../../../contexts/CircuitSynchronizationContext';

interface SyncSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SyncSettingsDialog: React.FC<SyncSettingsDialogProps> = ({ open, onClose }) => {
  const circuitSync = useCircuitSync();
  
  // State for advanced settings
  const [confirmClearDataOpen, setConfirmClearDataOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ message: string; severity: AlertProps['severity'] } | null>(null);
  
  // Local state for settings
  const [settings, setSettings] = useState({
    syncEnabled: circuitSync.syncStatus.isEnabled,
    autoSync: circuitSync.syncStatus.autoSync,
    syncInterval: 5, // minutes
    conflictResolutionStrategy: 'ask', // 'ask', 'newer', 'voltage-drop', 'schedule-of-loads'
    notificationsEnabled: true,
    keepSyncHistory: true,
    syncHistoryDuration: 30, // days
  });
  
  // Conflict resolution strategy options
  const conflictStrategyOptions = [
    { value: 'ask', label: 'Ask me every time' },
    { value: 'voltage-drop', label: 'Always use Voltage Drop calculator data' },
    { value: 'schedule-of-loads', label: 'Always use Schedule of Loads data' },
    { value: 'newest', label: 'Use newest data' }
  ];
  
  // Handle settings change
  const handleSettingChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Apply settings to context
    circuitSync.enableSync(settings.syncEnabled);
    circuitSync.setAutoSync(settings.autoSync);
    
    // Close dialog
    onClose();
  };
  
  // Clear all data
  const handleClearAllData = () => {
    try {
      // In the real implementation, this would clear all synchronized data
      circuitSync.clearChanges();
      setAlertMessage({
        message: 'All synchronized data has been cleared successfully.',
        severity: 'success'
      });
      setConfirmClearDataOpen(false);
    } catch (error) {
      setAlertMessage({
        message: 'Error clearing synchronized data. Please try again.',
        severity: 'error'
      });
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Synchronization Settings</Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Collapse in={!!alertMessage}>
          <Alert 
            severity={alertMessage?.severity || 'info'} 
            onClose={() => setAlertMessage(null)}
            sx={{ mb: 2 }}
          >
            {alertMessage?.message}
          </Alert>
        </Collapse>
        
        <Typography variant="subtitle1" gutterBottom>
          General Settings
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.syncEnabled}
                onChange={(e) => handleSettingChange('syncEnabled', e.target.checked)}
              />
            }
            label="Enable Circuit Synchronization"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSync}
                onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                disabled={!settings.syncEnabled}
              />
            }
            label="Automatically Sync Changes"
          />
          
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography id="sync-interval-slider" gutterBottom>
              Auto-Sync Interval (minutes)
            </Typography>
            <Slider
              value={settings.syncInterval}
              onChange={(_, value) => handleSettingChange('syncInterval', value)}
              aria-labelledby="sync-interval-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={15}
              disabled={!settings.syncEnabled || !settings.autoSync}
            />
          </Box>
        </FormGroup>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Conflict Resolution
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Default Conflict Resolution Strategy</InputLabel>
          <Select
            value={settings.conflictResolutionStrategy}
            onChange={(e) => handleSettingChange('conflictResolutionStrategy', e.target.value)}
            label="Default Conflict Resolution Strategy"
          >
            <MenuItem value="ask">Always Ask</MenuItem>
            <MenuItem value="newer">Use Newer Values</MenuItem>
            <MenuItem value="voltage-drop">Prefer Voltage Drop Calculator</MenuItem>
            <MenuItem value="schedule-of-loads">Prefer Schedule of Loads</MenuItem>
          </Select>
        </FormControl>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          The default strategy will be applied when auto-resolving conflicts. You can always manually resolve conflicts.
        </Alert>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          History & Notifications
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notificationsEnabled}
                onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
              />
            }
            label="Show Notifications for Sync Events"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.keepSyncHistory}
                onChange={(e) => handleSettingChange('keepSyncHistory', e.target.checked)}
              />
            }
            label="Keep Sync History"
          />
        </FormGroup>
        
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography gutterBottom>
            Keep Sync History For (days)
          </Typography>
          <Slider
            value={settings.syncHistoryDuration}
            onChange={(_, value) => handleSettingChange('syncHistoryDuration', value)}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={90}
            disabled={!settings.keepSyncHistory}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Advanced Settings
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Sync History Size" 
              secondary="Maximum number of events to keep in history"
            />
            <ListItemSecondaryAction>
              <Box width={80}>
                <TextField
                  size="small"
                  type="number"
                  value="500" // In a real implementation, this would be stored in context
                  onChange={() => {}} // In a real implementation, this would update context
                  inputProps={{ min: 100, max: 5000, step: 100 }}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Clear All Circuit Data" 
              secondary="Remove all synchronized circuit data (cannot be undone)"
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                color="error"
                onClick={() => setConfirmClearDataOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Reset Sync Statistics" 
              secondary="Clear sync statistics counters"
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                color="primary"
                onClick={() => {
                  // In a real implementation, this would reset statistics
                  setAlertMessage({
                    message: 'Sync statistics have been reset successfully.',
                    severity: 'success'
                  });
                }}
              >
                <RefreshIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        
        {/* Confirm Clear Data Dialog */}
        <Dialog
          open={confirmClearDataOpen}
          onClose={() => setConfirmClearDataOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Confirm Clear All Data
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography variant="body2">
              Are you sure you want to clear all synchronized circuit data? This will remove all circuit data from the synchronization context, but will not affect saved calculations.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmClearDataOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleClearAllData}
              color="error"
              variant="contained"
            >
              Clear All Data
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSaveSettings}
          variant="contained" 
          color="primary"
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncSettingsDialog; 