import React from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="theme-select-label">Theme</InputLabel>
      <Select
        labelId="theme-select-label"
        value={mode}
        label="Theme"
        onChange={e => setMode(e.target.value)}
      >
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
        <MenuItem value="gradient">Gradient</MenuItem>
        {/* Add more custom themes here if needed */}
      </Select>
    </FormControl>
  );
};

export default ThemeSwitcher; 