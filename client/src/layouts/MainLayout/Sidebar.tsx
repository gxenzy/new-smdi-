import React, { useState, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ElectricBolt as ElectricIcon,
  Assessment as AuditIcon,
  Build as ToolsIcon,
  Speed as TestingIcon,
  Poll as TamIcon,
  People as UsersIcon,
  Settings as AdminIcon,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  MonitorHeart as MonitorIcon,
  Assessment as ReportsIcon,
  MenuBook as StandardsIcon,
  Rule as ComplianceIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { useThemeMode } from '../../contexts/ThemeContext';
import { alpha } from '@mui/material/styles';

// Backup of removed sidebar items:
// { text: 'Electrical System', icon: <ElectricIcon />, path: '/electrical-system' },
// { text: 'Testing', icon: <TestingIcon />, path: '/testing' },
// { text: 'TAM Evaluation', icon: <TamIcon />, path: '/tam-evaluation' },
// { text: 'Energy Audit V2', icon: <AuditIcon />, path: '/energy-audit-v2' },
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  // { text: 'Electrical System', icon: <ElectricIcon />, path: '/electrical-system' }, // backed up
  { text: 'Energy Audit', icon: <AuditIcon />, path: '/energy-audit' },
  // { text: 'Reports', icon: <ReportsIcon />, path: '/reports' }, // moved inside Energy Audit
  // { text: 'Standards', icon: <StandardsIcon />, path: '/standards' }, // moved inside Energy Audit
  // { text: 'Energy Audit V2', icon: <AuditIcon />, path: '/energy-audit-v2' }, // backed up and removed
  { text: 'System Tools', icon: <ToolsIcon />, path: '/system-tools' },
  // { text: 'Testing', icon: <TestingIcon />, path: '/testing' }, // backed up
  // { text: 'TAM Evaluation', icon: <TamIcon />, path: '/tam-evaluation' }, // fully removed
  { text: 'Users', icon: <UsersIcon />, path: '/user-management' },
  { text: 'Admin', icon: <AdminIcon />, path: '/admin' },
  { text: 'Monitoring', icon: <MonitorIcon />, path: '/energy-monitoring' },
];

// Admin submenu items
const adminSubMenuItems = [
  { text: 'System Settings', icon: <AdminIcon />, path: '/admin/settings' },
  { text: 'User Management', icon: <UsersIcon />, path: '/user-management' },
  { text: 'Standards Management', icon: <ComplianceIcon />, path: '/admin/standards-management' },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  const handleToggleAdminMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdminMenuOpen(!adminMenuOpen);
  };

  const isOpen = !collapsed;
  const isAdmin = user?.role === UserRole.ADMIN;

  // Calculate colors based on theme
  const getThemeColors = () => {
    // Default avatar colors
    let avatarBg, avatarColor, avatarBorder;

    switch (mode) {
      case 'light':
        avatarBg = alpha(theme.palette.primary.main, 0.1);
        avatarColor = theme.palette.primary.main;
        avatarBorder = alpha(theme.palette.primary.main, 0.2);
        break;
      case 'dark':
        avatarBg = alpha('#bb86fc', 0.2);
        avatarColor = '#bb86fc';
        avatarBorder = alpha('#bb86fc', 0.3);
        break;
      case 'darkBlue':
        avatarBg = alpha('#60a5fa', 0.2);
        avatarColor = '#60a5fa';
        avatarBorder = alpha('#60a5fa', 0.3);
        break;
      case 'energy':
        avatarBg = alpha('#34d399', 0.2);
        avatarColor = '#ffffff';
        avatarBorder = alpha('#ffffff', 0.3);
        break;
      case 'blue':
        avatarBg = alpha('#ffffff', 0.2);
        avatarColor = '#ffffff';
        avatarBorder = alpha('#ffffff', 0.3);
        break;
      case 'gray':
        avatarBg = alpha('#ffffff', 0.2);
        avatarColor = '#ffffff';
        avatarBorder = alpha('#ffffff', 0.3);
        break;
      default:
        avatarBg = alpha(theme.palette.primary.main, 0.1);
        avatarColor = theme.palette.primary.main;
        avatarBorder = alpha(theme.palette.primary.main, 0.2);
    }

    return { avatarBg, avatarColor, avatarBorder };
  };

  const { avatarBg, avatarColor, avatarBorder } = getThemeColors();

  return (
    <Box
      sx={{
        width: isOpen ? 190 : 64,
        bgcolor: 'background.sidebar',
        color: theme.palette.mode === 'dark' || ['energy', 'blue', 'gray', 'darkBlue'].includes(mode) ? '#ffffff' : theme.palette.text.primary,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: theme => theme.transitions.create(['width', 'background-color'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
        position: 'relative',
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOpen ? 'flex-start' : 'center',
          p: 2,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: 'inherit',
            fontSize: isOpen ? '1.1rem' : '0.5rem',
            opacity: isOpen ? 1 : 0,
            transition: theme.transitions.create(['opacity', 'fontSize'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          Energy Audit
        </Typography>
        {isOpen && (
          <Typography
            variant="caption"
            sx={{ 
              color: 'text.secondary', 
              mt: -0.5,
              opacity: 0.8,
              fontWeight: 500
            }}
          >
            Platform
          </Typography>
        )}
      </Box>

      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ py: 0.5 }}>
        {menuItems.map((item) => (
          <Tooltip title={isOpen ? '' : item.text} placement="right" key={item.text}>
            <ListItem
              button
              onClick={(e) => item.text === 'Admin' ? handleToggleAdminMenu(e) : handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mb: 0.25,
                borderRadius: 1,
                bgcolor:
                  location.pathname === item.path
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
                color: 'inherit',
                opacity: 1,
                cursor: 'pointer',
                justifyContent: isOpen ? 'flex-start' : 'center',
                px: isOpen ? 1 : 1,
                py: 0.75,
                minHeight: 38,
                maxWidth: '100%',
                overflow: 'visible'
              }}
            >
              <>
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit', 
                    minWidth: 34, 
                    justifyContent: 'center' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {isOpen && (
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      margin: 0, 
                      pr: 0.5,
                      overflow: 'visible'
                    }}
                    primaryTypographyProps={{ 
                      fontSize: '0.85rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      display: 'block'
                    }} 
                  />
                )}
              </>
            </ListItem>
          </Tooltip>
        ))}

        {/* Admin Submenu */}
        {isAdmin && adminMenuOpen && isOpen && (
          <Box pl={2}>
            {adminSubMenuItems.map((item) => (
              <Tooltip title={isOpen ? '' : item.text} placement="right" key={item.text}>
                <ListItem
                  button
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    mb: 0.25,
                    borderRadius: 1,
                    bgcolor:
                      location.pathname === item.path
                        ? alpha(theme.palette.primary.main, 0.12)
                        : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    color: 'inherit',
                    opacity: 1,
                    cursor: 'pointer',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    px: isOpen ? 1 : 1,
                    py: 0.75,
                    minHeight: 32,
                    maxWidth: '100%',
                    overflow: 'visible'
                  }}
                >
                  <>
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === item.path ? theme.palette.primary.main : 'inherit', 
                        minWidth: 30, 
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {isOpen && (
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          margin: 0, 
                          pr: 0.5,
                          overflow: 'visible'
                        }}
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: location.pathname === item.path ? 600 : 400,
                          color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          display: 'block'
                        }} 
                      />
                    )}
                  </>
                </ListItem>
              </Tooltip>
            ))}
          </Box>
        )}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {/* Collapse/Expand Button */}
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <IconButton 
          onClick={handleToggleCollapse} 
          size="small" 
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main
            }
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
