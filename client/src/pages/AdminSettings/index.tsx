import React, { useState, useEffect } from 'react';
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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar as MuiSnackbar,
  Pagination,
} from '@mui/material';
import {
  Save as SaveIcon,
  Backup as BackupIcon,
  CloudDownload as RestoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { UserRole } from '../../types';

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

type AuditLog = {
  id: string;
  username: string;
  action: string;
  details: string;
  created_at: string;
};

const AdminSettings: React.FC = () => {
  const { user, hasRole } = useAuthContext();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(20);
  const [auditCount, setAuditCount] = useState(0);
  const [auditUser, setAuditUser] = useState('');
  const [auditAction, setAuditAction] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: null | (() => void); message: string }>({ open: false, action: null, message: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [auditPageState, setAuditPageState] = useState(1);
  const paginatedAuditLogs = auditLogs.slice((auditPageState - 1) * auditLimit, auditPageState * auditLimit);

  useEffect(() => {
    if (!hasRole(UserRole.ADMIN)) {
      setError('Access denied. Admins only.');
      setLoading(false);
      return;
    }
    axios.get('/api/admin/settings')
      .then(res => {
        const apiSettings = res.data.reduce((acc: any, s: any) => {
          acc[s.setting_key] = s.setting_value === 'true' ? true : s.setting_value === 'false' ? false : isNaN(Number(s.setting_value)) ? s.setting_value : Number(s.setting_value);
          return acc;
        }, {});
        setSettings((prev) => ({ ...prev, ...apiSettings }));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (hasRole(UserRole.ADMIN)) {
      setAuditLoading(true);
      axios.get(`/api/audit-logs?page=${auditPage}&limit=${auditLimit}`)
        .then(res => {
          setAuditLogs(res.data.logs);
          setAuditCount(res.data.count);
          setAuditLoading(false);
        })
        .catch(() => {
          setAuditError('Failed to load audit logs');
          setAuditLoading(false);
        });
    }
  }, [user, auditPage, auditLimit]);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openConfirmDialog = (action: () => void, message: string) => {
    setConfirmDialog({ open: true, action, message });
  };

  const handleConfirm = () => {
    if (confirmDialog.action) confirmDialog.action();
    setConfirmDialog({ open: false, action: null, message: '' });
  };

  const handleCancel = () => setConfirmDialog({ open: false, action: null, message: '' });

  const handleSaveSettings = async () => {
    openConfirmDialog(async () => {
      // Validation
      if (settings.maxUsers <= 0) {
        setSettingsError('Max Users must be greater than 0');
        return;
      }
      if (settings.sessionTimeout <= 0) {
        setSettingsError('Session Timeout must be greater than 0');
        return;
      }
      if (settings.backupFrequency <= 0) {
        setSettingsError('Backup Frequency must be greater than 0');
        return;
      }
      setSettingsError(null);
      try {
        setLoading(true);
        await Promise.all(Object.entries(settings).map(([key, value]) =>
          axios.put(`/api/admin/settings/${key}`, { value })
        ));
        setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error saving settings', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }, 'Are you sure you want to save these settings?');
  };

  const handleBackup = async () => {
    openConfirmDialog(async () => {
      try {
        setBackupInProgress(true);
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSnackbar({ open: true, message: 'Backup completed successfully', severity: 'success' });
        setBackupInProgress(false);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error during backup', severity: 'error' });
        setBackupInProgress(false);
      }
    }, 'Are you sure you want to backup the system?');
  };

  const filteredAuditLogs = auditLogs.filter((log: AuditLog) =>
    (!auditUser || log.username === auditUser) &&
    (!auditAction || log.action === auditAction) &&
    (log.details?.toLowerCase().includes(auditSearch.toLowerCase()) || log.action?.toLowerCase().includes(auditSearch.toLowerCase()))
  );
  const uniqueUsers = Array.from(new Set(auditLogs.map((l: AuditLog) => l.username).filter(Boolean)));
  const uniqueActions = Array.from(new Set(auditLogs.map((l: AuditLog) => l.action).filter(Boolean)));

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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

      {settingsError && <Alert severity="error" sx={{ mt: 2 }}>{settingsError}</Alert>}

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

      {hasRole(UserRole.ADMIN) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Audit Log</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              select
              size="small"
              label="User"
              value={auditUser}
              onChange={e => setAuditUser(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueUsers.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            <TextField
              select
              size="small"
              label="Action"
              value={auditAction}
              onChange={e => setAuditAction(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueActions.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            <TextField
              size="small"
              label="Search"
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
            />
          </Box>
          {auditLoading ? (
            <div>Loading audit logs...</div>
          ) : auditError ? (
            <div style={{ color: 'red' }}>{auditError}</div>
          ) : (
            <>
              <Card>
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedAuditLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">No audit logs found.</TableCell>
                          </TableRow>
                        ) : (
                          paginatedAuditLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                              <TableCell>{log.username || 'System'}</TableCell>
                              <TableCell>{log.action}</TableCell>
                              <TableCell><pre style={{ margin: 0, fontSize: 12 }}>{log.details}</pre></TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Math.ceil(filteredAuditLogs.length / auditLimit)}
                  page={auditPageState}
                  onChange={(_, value) => setAuditPageState(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      )}

      <MuiSnackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog open={confirmDialog.open} onClose={handleCancel}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
