import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { useUserContext } from '../../contexts/UserContext';
import { NotificationType } from '../../types';

const Settings: React.FC = () => {
  const { currentUser } = useAuthContext();
  const dispatch = useAppDispatch();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { setNotificationPreferences } = useUserContext();
  
  const [settings, setSettings] = useState({
    emailNotifications: false,
    darkMode: false,
    language: 'en',
    visibility: 'public',
    twoFactorAuth: false,
  });

  // Notification Preferences State
  const [notifEnabled, setNotifEnabled] = useState(currentUser.notificationPreferences?.enabled ?? true);
  const [notifTypes, setNotifTypes] = useState<NotificationType[]>(currentUser.notificationPreferences?.types ?? [NotificationType.Info, NotificationType.Success, NotificationType.Warning, NotificationType.Error]);

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  const handleNotifTypeChange = (type: NotificationType) => {
    setNotifTypes((prev) => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSaveNotificationPrefs = () => {
    setNotificationPreferences({ enabled: notifEnabled, types: notifTypes });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Notifications" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive email notifications for important updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Appearance" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DarkModeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Use dark theme across the application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Language"
                    secondary="Select your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Notification Preferences" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText primary="Enable Notifications" />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifEnabled}
                      onChange={(e) => setNotifEnabled(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Notification Types" secondary="Select which types of notifications you want to receive" />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={notifTypes.includes(NotificationType.Info) ? 'contained' : 'outlined'}
                        onClick={() => handleNotifTypeChange(NotificationType.Info)}
                      >Info</Button>
                      <Button
                        variant={notifTypes.includes(NotificationType.Success) ? 'contained' : 'outlined'}
                        onClick={() => handleNotifTypeChange(NotificationType.Success)}
                      >Success</Button>
                      <Button
                        variant={notifTypes.includes(NotificationType.Warning) ? 'contained' : 'outlined'}
                        onClick={() => handleNotifTypeChange(NotificationType.Warning)}
                      >Warning</Button>
                      <Button
                        variant={notifTypes.includes(NotificationType.Error) ? 'contained' : 'outlined'}
                        onClick={() => handleNotifTypeChange(NotificationType.Error)}
                      >Error</Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveNotificationPrefs}>
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy & Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Privacy" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VisibilityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profile Visibility"
                    secondary="Control who can see your profile"
                  />
                  <ListItemSecondaryAction>
                    <Select
                      value={settings.visibility}
                      onChange={(e) => handleSettingChange('visibility', e.target.value)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="team">Team Only</MenuItem>
                    </Select>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="Security" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card sx={{ mt: 3, bgcolor: 'error.main' }}>
            <CardHeader
              title={
                <Typography color="white">Danger Zone</Typography>
              }
            />
            <Divider />
            <CardContent>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialog(true)}
                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'grey.100' } }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone
            and all your data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button color="error" onClick={() => setDeleteDialog(false)}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
