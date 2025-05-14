import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Collapse
} from '@mui/material';
import {
  Contrast as ContrastIcon,
  TextFields as TextFieldsIcon,
  SlowMotionVideo as ReduceMotionIcon,
  AccessibilityNew as AccessibilityIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Visibility as VisionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
import { ColorBlindnessType, colorBlindnessLabels } from '../../utils/accessibility/colorBlindnessSimulation';

interface AccessibilitySettingsPanelProps {
  onClose?: () => void;
  variant?: 'modal' | 'embedded';
}

const AccessibilitySettingsPanel: React.FC<AccessibilitySettingsPanelProps> = ({
  onClose,
  variant = 'embedded'
}) => {
  const theme = useTheme();
  const { 
    settings, 
    toggleHighContrast, 
    toggleLargeText, 
    toggleReduceMotion, 
    toggleScreenReaderOptimization,
    setColorBlindnessType
  } = useAccessibilitySettings();

  const [colorBlindnessExpanded, setColorBlindnessExpanded] = useState(false);

  const handleColorBlindnessTypeChange = (event: SelectChangeEvent) => {
    setColorBlindnessType(event.target.value as ColorBlindnessType);
  };

  const toggleColorBlindnessExpanded = () => {
    setColorBlindnessExpanded(!colorBlindnessExpanded);
  };

  return (
    <Paper 
      elevation={variant === 'modal' ? 6 : 1}
      sx={{ 
        p: 3,
        width: '100%',
        maxWidth: variant === 'modal' ? 400 : '100%',
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        ...(settings.highContrastMode && {
          background: '#000000',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF'
        })
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessibilityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Accessibility Settings</Typography>
        </Box>
        {variant === 'modal' && onClose && (
          <IconButton onClick={onClose} size="small" aria-label="Close accessibility settings">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Settings Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.highContrastMode}
              onChange={toggleHighContrast}
              color="primary"
              inputProps={{ 'aria-label': 'Toggle high contrast mode' }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ContrastIcon sx={{ mr: 1 }} />
              <Typography>High Contrast Mode</Typography>
              <Tooltip title="Increases contrast for better visibility">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={settings.largeText}
              onChange={toggleLargeText}
              color="primary"
              inputProps={{ 'aria-label': 'Toggle large text mode' }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextFieldsIcon sx={{ mr: 1 }} />
              <Typography>Large Text Mode</Typography>
              <Tooltip title="Increases text size for better readability">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={settings.reduceMotion}
              onChange={toggleReduceMotion}
              color="primary"
              inputProps={{ 'aria-label': 'Toggle reduced motion' }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReduceMotionIcon sx={{ mr: 1 }} />
              <Typography>Reduce Motion</Typography>
              <Tooltip title="Minimizes animations and transitions">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={settings.screenReaderOptimization}
              onChange={toggleScreenReaderOptimization}
              color="primary"
              inputProps={{ 'aria-label': 'Toggle screen reader optimization' }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessibilityIcon sx={{ mr: 1 }} />
              <Typography>Screen Reader Optimization</Typography>
              <Tooltip title="Adds additional labels and descriptions for screen readers">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        {/* Color Blindness Simulation */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mb: colorBlindnessExpanded ? 2 : 0
            }}
            onClick={toggleColorBlindnessExpanded}
          >
            <VisionIcon sx={{ mr: 1 }} />
            <Typography>Color Blindness Simulation</Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              {colorBlindnessExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Tooltip title="Simulates how content appears to people with different types of color blindness">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Collapse in={colorBlindnessExpanded}>
            <FormControl 
              fullWidth 
              variant="outlined" 
              size="small"
              sx={{ 
                mt: 1,
                ...(settings.highContrastMode && {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFFFFF'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#FFFFFF'
                  },
                  '& .MuiSelect-select': {
                    color: '#FFFFFF'
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#FFFFFF'
                  }
                })
              }}
            >
              <InputLabel id="color-blindness-type-label">Simulation Type</InputLabel>
              <Select
                labelId="color-blindness-type-label"
                id="color-blindness-type"
                value={settings.colorBlindnessSimulation}
                onChange={handleColorBlindnessTypeChange}
                label="Simulation Type"
              >
                {Object.values(ColorBlindnessType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {colorBlindnessLabels[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This setting simulates how charts and colors appear to people with different types of color vision deficiency.
                It helps design accessible data visualizations.
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Box>
      
      {/* Information */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          These settings are saved automatically and will persist across your sessions.
          Use keyboard shortcut <strong>Alt+A</strong> to quickly open accessibility settings.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AccessibilitySettingsPanel; 