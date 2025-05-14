import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import { AccessibilityNew as AccessibilityIcon } from '@mui/icons-material';
import AccessibilitySettingsModal from './AccessibilitySettingsModal';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';

interface AccessibilitySettingsButtonProps {
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

const AccessibilitySettingsButton: React.FC<AccessibilitySettingsButtonProps> = ({
  tooltip = 'Accessibility Settings',
  size = 'medium'
}) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const { settings } = useAccessibilitySettings();
  
  // Count how many accessibility features are enabled
  const enabledFeatures = Object.values(settings).filter(Boolean).length;
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  return (
    <>
      <Tooltip title={tooltip}>
        <Badge
          badgeContent={enabledFeatures}
          color="primary"
          invisible={enabledFeatures === 0}
        >
          <IconButton
            onClick={handleOpenModal}
            aria-label="Open accessibility settings"
            size={size}
            sx={{
              ...(settings.highContrastMode && {
                color: '#FFFFFF',
                backgroundColor: '#000000',
                border: '2px solid #FFFFFF',
                '&:hover': {
                  backgroundColor: '#333333',
                }
              })
            }}
          >
            <AccessibilityIcon />
          </IconButton>
        </Badge>
      </Tooltip>
      
      <AccessibilitySettingsModal
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default AccessibilitySettingsButton; 