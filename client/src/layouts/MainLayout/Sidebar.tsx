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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Electrical System', icon: <ElectricIcon />, path: '/electrical-system' },
  { text: 'Energy Audit', icon: <AuditIcon />, path: '/energy-audit' },
  { text: 'System Tools', icon: <ToolsIcon />, path: '/system-tools' },
  { text: 'Testing', icon: <TestingIcon />, path: '/testing' },
  { text: 'TAM Evaluation', icon: <TamIcon />, path: '/tam-evaluation' },
  { text: 'User Management', icon: <UsersIcon />, path: '/users' },
  { text: 'Admin Settings', icon: <AdminIcon />, path: '/admin' },
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  const isOpen = !collapsed;

  return (
    <Box
      sx={{
        width: isOpen ? 240 : 64,
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center', minHeight: 56 }}>
        {isOpen ? (
          <Typography variant="h6" noWrap>Energy Audit System</Typography>
        ) : (
          <MenuIcon />
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Tooltip title={isOpen ? '' : item.text} placement="right" key={item.text}>
            <ListItem
              button
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mb: 1,
                borderRadius: 1,
                bgcolor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                color: 'inherit',
                opacity: 1,
                cursor: 'pointer',
                justifyContent: isOpen ? 'flex-start' : 'center',
                px: isOpen ? 2 : 1,
                minHeight: 48,
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
              {isOpen && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: location.pathname === item.path ? 'bold' : 'normal' }} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {/* Collapse/Expand Button */}
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <IconButton onClick={handleToggleCollapse} size="small">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
