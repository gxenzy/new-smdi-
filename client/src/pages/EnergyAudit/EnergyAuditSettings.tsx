import React, { useState } from 'react';
import { Box, Typography, TextField, FormControlLabel, Switch, Button, Paper } from '@mui/material';

const EnergyAuditSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultThreshold, setDefaultThreshold] = useState(80);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Energy Audit Settings</Typography>
        <FormControlLabel
          control={<Switch checked={notificationsEnabled} onChange={e => setNotificationsEnabled(e.target.checked)} />}
          label="Enable Notifications"
        />
        <TextField
          label="Default Threshold (%)"
          type="number"
          value={defaultThreshold}
          onChange={e => setDefaultThreshold(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ mt: 2 }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {saved && <Typography color="success.main" sx={{ mt: 2 }}>Settings saved!</Typography>}
      </Paper>
    </Box>
  );
};

export default EnergyAuditSettings; 