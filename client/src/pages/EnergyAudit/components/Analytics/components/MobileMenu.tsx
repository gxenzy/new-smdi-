import React from 'react';
import {
  SwipeableDrawer,
  List,
  ListItem,
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
  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
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
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={onClose}
          onKeyDown={onClose}
        >
          <List>
            <ListItem button onClick={onExport}>
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Export" />
            </ListItem>
            <ListItem button onClick={onPrint}>
              <ListItemIcon>
                <PrintIcon />
              </ListItemIcon>
              <ListItemText primary="Print" />
            </ListItem>
            <ListItem button onClick={onShare}>
              <ListItemIcon>
                <ShareIcon />
              </ListItemIcon>
              <ListItemText primary="Share" />
            </ListItem>
            <ListItem button onClick={onSettings}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={onHelp}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItem>
            <ListItem button onClick={onTutorial}>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText primary="Tutorial" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default MobileMenu; 