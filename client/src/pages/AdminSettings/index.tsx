import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Backup as BackupIcon,
  CloudDownload as RestoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface SystemSettings {
  maxUsers: number;
  sessionTimeout: number;
  backupFrequency: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
  apiUrl: string;
  allowRegistration: boolean;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maxUsers: 100,
    sessionTimeout: 30,
    backupFrequency: 24,
    emailNotifications: true,
    maintenanceMode: false,
    debugMode: false,
    apiUrl: 'http://localhost:5000',
    allowRegistration: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Here you would typically make an API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupInProgress(true);
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBackupInProgress(false);
    } catch (error) {
      console.error('Error during backup:', error);
      setBackupInProgress(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Admin Settings</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={backupInProgress ? <SettingsIcon /> : <BackupIcon />}
            onClick={handleBackup}
            disabled={backupInProgress}
            sx={{ mr: 1 }}
          >
            {backupInProgress ? 'Backing up...' : 'Backup System'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="API URL"
                    secondary="Base URL for API endpoints"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      value={settings.apiUrl}
onChange={(e) => {
  console.log('API URL change event:', e);
  if (e.target) {
    handleSettingChange('apiUrl', e.target.value);
  }
}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Max Users"
                    secondary="Maximum number of users allowed"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      size="small"
                      value={settings.maxUsers}
onChange={(e) => {
  console.log('Max Users change event:', e);
  if (e.target) {
    handleSettingChange('maxUsers', parseInt(e.target.value));
  }
}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Session timeout in minutes"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      size="small"
                      value={settings.sessionTimeout}
onChange={(e) => {
  console.log('Session Timeout change event:', e);
  if (e.target) {
    handleSettingChange('sessionTimeout', parseInt(e.target.value));
  }
}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backup Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Backup Frequency"
                    secondary="Hours between automatic backups"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      size="small"
                      value={settings.backupFrequency}
onChange={(e) => {
  console.log('Backup Frequency change event:', e);
  if (e.target) {
    handleSettingChange('backupFrequency', parseInt(e.target.value));
  }
}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Features
              </Typography>
              <List>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      />
                    }
                    label="Maintenance Mode"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.debugMode}
                        onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                      />
                    }
                    label="Debug Mode"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowRegistration}
                        onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                      />
                    }
                    label="Allow User Registration"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Maintenance
              </Typography>
              <List>
                <ListItem>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RestoreIcon />}
                    color="warning"
                  >
                    Restore from Backup
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                  >
                    Clear System Cache
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;
