import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ThemeSettings } from '../types';

interface ThemeCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onSettingsChange: (settings: ThemeSettings) => void;
}

export const ThemeCustomizationDialog: React.FC<ThemeCustomizationDialogProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const handleChange = (key: keyof ThemeSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Theme Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <FormControl>
            <InputLabel>Theme Mode</InputLabel>
            <Select
              value={settings.mode}
              label="Theme Mode"
              onChange={e => handleChange('mode', e.target.value)}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Primary Color</InputLabel>
            <Select
              value={settings.primaryColor}
              label="Primary Color"
              onChange={e => handleChange('primaryColor', e.target.value)}
            >
              <MenuItem value="#1976d2">Blue</MenuItem>
              <MenuItem value="#2e7d32">Green</MenuItem>
              <MenuItem value="#ed6c02">Orange</MenuItem>
              <MenuItem value="#9c27b0">Purple</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Secondary Color</InputLabel>
            <Select
              value={settings.secondaryColor}
              label="Secondary Color"
              onChange={e => handleChange('secondaryColor', e.target.value)}
            >
              <MenuItem value="#9c27b0">Purple</MenuItem>
              <MenuItem value="#2e7d32">Green</MenuItem>
              <MenuItem value="#ed6c02">Orange</MenuItem>
              <MenuItem value="#1976d2">Blue</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={settings.fontSize}
              label="Font Size"
              onChange={e => handleChange('fontSize', e.target.value)}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 