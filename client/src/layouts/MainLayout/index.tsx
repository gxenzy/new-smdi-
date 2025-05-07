import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import NotificationsMenu from './NotificationsMenu';
import { styled } from '@mui/material/styles';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';
import NotificationListener from '../../components/NotificationListener';

const drawerWidth = 240;

const Main = styled('main')<{
  sidebarwidth: number;
}>(({ theme, sidebarwidth }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: sidebarwidth,
}));

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { notifications, markAsRead } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<typeof notifications[0] | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 64 : drawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    handleProfileMenuClose();
    navigate('/settings');
  };

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrent(notifications.find(n => !n.read) || notifications[0]);
      setOpen(true);
    }
  }, [notifications]);

  const handleClose = () => {
    setOpen(false);
    if (current) markAsRead(current.id);
  };

  const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useThemeContext();
    return (
      <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle dark mode">
        {theme === 'light' ? <span role="img" aria-label="dark">🌙</span> : <span role="img" aria-label="light">☀️</span>}
      </IconButton>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
      <CssBaseline />
      <NotificationListener />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          ml: { sm: `${sidebarWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default,
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SMDI Admin Panel
          </Typography>
          <ThemeToggleButton />
          <IconButton color="inherit" onClick={handleNotificationsOpen}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen || !sidebarCollapsed}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: sidebarWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: sidebarCollapsed ? '2px 0 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'width 0.3s',
            bgcolor: theme.palette.background.default,
          },
        }}
      >
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </Drawer>

      <Main sidebarwidth={sidebarWidth} sx={{ flex: 1, transition: 'margin-left 0.3s' }}>
        <Toolbar />
        {children}
      </Main>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 'unset', width: 'auto', px: 0 } }}
      >
        <MenuItem onClick={handleProfileClick}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <NotificationsMenu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 'unset', width: 'auto', px: 0 } }}
      />

      <Snackbar open={open && !!current} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {current && (
          <Alert onClose={handleClose} severity={current.type} sx={{ width: '100%' }}>
            {current.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default MainLayout;
