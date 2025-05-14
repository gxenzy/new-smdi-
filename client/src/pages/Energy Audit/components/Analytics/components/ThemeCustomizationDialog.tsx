import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  SelectChangeEvent,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    fontSize: number;
  };
  onSettingsChange: (settings: {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    fontSize: number;
  }) => void;
}

const ThemeCustomizationDialog: React.FC<Props> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = React.useState<{
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    fontSize: number;
  }>(settings);

  const handleSelectChange = (field: 'mode') => (
    event: SelectChangeEvent
  ) => {
    const newSettings = {
      ...localSettings,
      [field]: event.target.value as 'light' | 'dark',
    };
    setLocalSettings(newSettings);
  };

  const handleInputChange = (field: 'primaryColor' | 'secondaryColor' | 'fontSize') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSettings = {
      ...localSettings,
      [field]: field === 'fontSize' ? Number(event.target.value) : event.target.value,
    };
    setLocalSettings(newSettings);
  };

  const handleSubmit = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customize Theme</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Theme Mode</InputLabel>
              <Select
                value={localSettings.mode}
                onChange={handleSelectChange('mode')}
                label="Theme Mode"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary Color"
              type="color"
              value={localSettings.primaryColor}
              onChange={handleInputChange('primaryColor')}
              InputProps={{ sx: { height: 56 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Color"
              type="color"
              value={localSettings.secondaryColor}
              onChange={handleInputChange('secondaryColor')}
              InputProps={{ sx: { height: 56 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Font Size Scale"
              value={localSettings.fontSize}
              onChange={handleInputChange('fontSize')}
              inputProps={{ min: 0.8, max: 1.5, step: 0.1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeCustomizationDialog; 