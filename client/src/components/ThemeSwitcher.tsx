import React from 'react';
import { useThemeMode, ThemeMode } from '../contexts/ThemeContext';
import { 
  FormControl, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Tooltip,
  useTheme,
  Box,
} from '@mui/material';
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  Waves as DarkBlueIcon,
  Palette as EnergyIcon,
  Circle as BlueIcon,
  FormatColorFill as GrayIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, isDarkMode } = useThemeMode();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  // Get theme display name and icon
  const getThemeInfo = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light':
        return { name: 'Light', icon: <LightIcon /> };
      case 'dark':
        return { name: 'Dark', icon: <DarkIcon /> };
      case 'darkBlue':
        return { name: 'Dark Blue', icon: <DarkBlueIcon sx={{ color: '#60a5fa' }} /> };
      case 'energy':
        return { name: 'Energy', icon: <EnergyIcon sx={{ color: '#059669' }} /> };
      case 'blue':
        return { name: 'Blue', icon: <BlueIcon sx={{ color: '#0284c7' }} /> };
      case 'gray':
        return { name: 'Gray', icon: <GrayIcon sx={{ color: '#374151' }} /> };
      default:
        return { name: 'Light', icon: <LightIcon /> };
    }
  };

  const currentTheme = getThemeInfo(mode);

  // Theme color previews
  const themePreview = (themeMode: ThemeMode) => {
    let colors;
    
    switch(themeMode) {
      case 'light':
        colors = { primary: '#2563eb', bg: '#f8fafc', text: '#1e293b' };
        break;
      case 'dark':
        colors = { primary: '#bb86fc', bg: '#121212', text: '#ffffff' };
        break;
      case 'darkBlue':
        colors = { primary: '#60a5fa', bg: '#0f172a', text: '#f1f5f9' };
        break;
      case 'energy':
        colors = { primary: '#059669', bg: '#0f172a', text: '#f1f5f9' };
        break;
      case 'blue':
        colors = { primary: '#0284c7', bg: '#e0f2fe', text: '#0f172a' };
        break;
      case 'gray':
        colors = { primary: '#374151', bg: '#f3f4f6', text: '#111827' };
        break;
      default:
        colors = { primary: '#2563eb', bg: '#f8fafc', text: '#1e293b' };
    }
    
    return (
      <Box 
        sx={{ 
          width: 16, 
          height: 16, 
          borderRadius: '50%', 
          background: colors.primary,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }} 
      />
    );
  };

  const marginLeft = theme.spacing(1);

  return (
    <>
      <Tooltip title="Change theme">
        <Button
          id="theme-button"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          endIcon={<ArrowDownIcon />}
          startIcon={currentTheme.icon}
          size="small"
          sx={{ 
            textTransform: 'none',
            borderRadius: '20px',
            px: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.text.primary,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          {currentTheme.name}
        </Button>
      </Tooltip>
      
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
          dense: true,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
          }
        }}
      >
        <MenuItem onClick={() => handleThemeChange('light')} selected={mode === 'light'}>
          <ListItemIcon>
            <LightIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
          {themePreview('light')}
        </MenuItem>
        
        <MenuItem onClick={() => handleThemeChange('dark')} selected={mode === 'dark'}>
          <ListItemIcon>
            <DarkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
          {themePreview('dark')}
        </MenuItem>
        
        <MenuItem onClick={() => handleThemeChange('darkBlue')} selected={mode === 'darkBlue'}>
          <ListItemIcon>
            <DarkBlueIcon fontSize="small" sx={{ color: '#60a5fa' }} />
          </ListItemIcon>
          <ListItemText>Dark Blue</ListItemText>
          {themePreview('darkBlue')}
        </MenuItem>
        
        <MenuItem onClick={() => handleThemeChange('energy')} selected={mode === 'energy'}>
          <ListItemIcon>
            <EnergyIcon fontSize="small" sx={{ color: '#059669' }} />
          </ListItemIcon>
          <ListItemText>Energy</ListItemText>
          {themePreview('energy')}
        </MenuItem>
        
        <MenuItem onClick={() => handleThemeChange('blue')} selected={mode === 'blue'}>
          <ListItemIcon>
            <BlueIcon fontSize="small" sx={{ color: '#0284c7' }} />
          </ListItemIcon>
          <ListItemText>Blue</ListItemText>
          {themePreview('blue')}
        </MenuItem>
        
        <MenuItem onClick={() => handleThemeChange('gray')} selected={mode === 'gray'}>
          <ListItemIcon>
            <GrayIcon fontSize="small" sx={{ color: '#374151' }} />
          </ListItemIcon>
          <ListItemText>Gray</ListItemText>
          {themePreview('gray')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeSwitcher; 