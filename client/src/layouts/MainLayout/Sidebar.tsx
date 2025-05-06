import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ width: 240, bgcolor: '#1976d2', color: 'white', height: '100vh' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">Energy Audit System</Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
                sx={{
                  mb: 1,
                  borderRadius: 1,
              bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.08)' : 'transparent',
                  '&:hover': {
                bgcolor: 'rgba(255,255,255,0.12)',
                  },
              color: 'inherit',
              opacity: 1,
              cursor: 'pointer',
                }}
              >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: location.pathname === item.path ? 'bold' : 'normal' }} />
              </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
