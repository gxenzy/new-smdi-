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
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  ExitToApp,
  Brightness4,
  Brightness7,
  KeyboardArrowUp,
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
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (current) markAsRead(current.id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          boxShadow: 1,
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
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: '#1976d2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>
              C
            </Box>
          </Box>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: theme.palette.mode === 'light' ? '#222' : 'inherit',
              fontWeight: 700
            }}
          >
            CompAT - Compliance Audit Tool
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              sx={{ color: theme.palette.mode === 'light' ? '#222' : 'inherit', display: { xs: 'none', sm: 'flex' } }}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton 
              sx={{ color: theme.palette.mode === 'light' ? '#222' : 'inherit', '& .MuiBadge-badge': { right: -3, top: 3 } }}
              onClick={handleNotificationsOpen}
              aria-label="notifications"
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton 
              sx={{ color: theme.palette.mode === 'light' ? '#222' : 'inherit', display: { xs: 'none', sm: 'flex' }, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
              onClick={handleProfileMenuOpen}
              aria-label="profile"
            >
              <AccountCircle />
            </IconButton>
          </Box>
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
            overflowX: 'hidden',
          },
        }}
      >
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </Drawer>

      <Main 
        sidebarwidth={sidebarWidth} 
        sx={{ 
          flex: 1, 
          transition: 'margin-left 0.3s',
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', sm: `calc(100% - ${sidebarWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          sx: { 
            minWidth: '200px',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            }
          } 
        }}
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
        PaperProps={{ 
          sx: { 
            minWidth: '300px',
            maxWidth: '90vw',
            mt: 1.5,
          } 
        }}
      />

      <Snackbar 
        open={open && !!current} 
        autoHideDuration={4000} 
        onClose={handleClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        {current && (
          <Alert 
            onClose={handleClose} 
            severity={current.type} 
            sx={{ 
              width: '100%',
              boxShadow: 3,
            }}
          >
            {current.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default MainLayout;
