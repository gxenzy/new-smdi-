import React, { useRef } from 'react';
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { useFocusManagement } from '../../../../../hooks/useFocusManagement';

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onExport: () => void;
  onPrint: () => void;
  onShare: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onTutorial: () => void;
}

const MobileMenu: React.FC<Props> = ({
  open,
  onOpen,
  onClose,
  onExport,
  onPrint,
  onShare,
  onSettings,
  onHelp,
  onTutorial,
}) => {
  // Use focus management hook
  const { 
    containerRef, 
    handleKeyDown 
  } = useFocusManagement(open, {
    autoFocus: true,
    returnFocus: true,
    trapFocus: true,
    onEscapeKey: onClose
  });
  
  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="Open menu"
        onClick={onOpen}
        sx={{ display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        sx={{ display: { sm: 'none' } }}
        aria-label="Mobile menu"
        onKeyDown={handleKeyDown}
      >
        <Box
          sx={{ width: 250 }}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="mobile-menu-title"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          ref={containerRef as React.Ref<HTMLDivElement>}
        >
          <List aria-label="Main actions">
            <ListItemButton 
              onClick={onExport}
              tabIndex={0}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Export" />
            </ListItemButton>
            <ListItemButton 
              onClick={onPrint}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <PrintIcon />
              </ListItemIcon>
              <ListItemText primary="Print" />
            </ListItemButton>
            <ListItemButton 
              onClick={onShare}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <ShareIcon />
              </ListItemIcon>
              <ListItemText primary="Share" />
            </ListItemButton>
            <ListItemButton 
              onClick={onSettings}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
          <Divider />
          <List aria-label="Help and information">
            <ListItemButton 
              onClick={onHelp}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItemButton>
            <ListItemButton 
              onClick={onTutorial}
              role="menuitem"
            >
              <ListItemIcon aria-hidden="true">
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText primary="Tutorial" />
            </ListItemButton>
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default MobileMenu; 