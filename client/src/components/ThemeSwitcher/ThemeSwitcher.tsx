import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useThemeMode, ThemeMode } from '../../contexts/ThemeContext';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    ...(theme.palette.mode === 'dark' && {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        background: `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
        borderRadius: '50%',
        zIndex: -1,
      },
    }),
  },
}));

const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactElement }[] = [
  { mode: 'light', label: 'Light Theme', icon: <Brightness7Icon /> },
  { mode: 'dark', label: 'Dark Theme', icon: <Brightness4Icon /> },
  { mode: 'darkBlue', label: 'Dark Blue Theme', icon: <NightsStayIcon /> },
  { mode: 'energy', label: 'Energy Theme', icon: <WaterDropIcon /> },
  { mode: 'blue', label: 'Blue Theme', icon: <InvertColorsIcon /> },
  { mode: 'gray', label: 'Gray Theme', icon: <ColorLensIcon /> },
];

export const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  const currentTheme = themeOptions.find((option) => option.mode === mode);

  return (
    <>
      <Tooltip title="Change theme">
        <StyledIconButton
          onClick={handleClick}
          color="inherit"
          aria-label="change theme"
          aria-controls="theme-menu"
          aria-haspopup="true"
        >
          {currentTheme?.icon}
        </StyledIconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleThemeChange(option.mode)}
            selected={mode === option.mode}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}; 