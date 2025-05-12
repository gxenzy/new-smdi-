import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as ReportsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Build as ToolsIcon,
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// Icon mapping for different page types
const icons: Record<string, React.ReactElement> = {
  dashboard: <DashboardIcon fontSize="large" />,
  reports: <ReportsIcon fontSize="large" />,
  profile: <ProfileIcon fontSize="large" />,
  settings: <SettingsIcon fontSize="large" />,
  tools: <ToolsIcon fontSize="large" />,
  users: <UsersIcon fontSize="large" />,
  admin: <AdminIcon fontSize="large" />,
  help: <HelpIcon fontSize="large" />
};

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string | React.ReactElement;
  actions?: React.ReactNode;
  variant?: 'default' | 'compact' | 'transparent';
}

/**
 * PageHeader component for consistent page headers across the application
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  variant = 'default'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine the icon to display
  const headerIcon = React.isValidElement(icon) 
    ? icon 
    : typeof icon === 'string' && icons[icon] 
      ? icons[icon] 
      : null;
  
  // Style variations based on variant prop
  const getContainerStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          p: 1.5,
          mb: 2,
          borderRadius: 2
        };
      case 'transparent':
        return {
          p: 2,
          mb: 3,
          boxShadow: 'none',
          bgcolor: 'transparent'
        };
      case 'default':
      default:
        return {
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2
        };
    }
  };
  
  return (
    <Paper
      elevation={variant === 'transparent' ? 0 : 1}
      sx={{
        ...getContainerStyles(),
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        bgcolor: variant === 'transparent' ? 'transparent' : theme.palette.background.paper
      }}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: { xs: 2, sm: 0 }
      }}>
        {headerIcon && (
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              mr: 2,
              width: variant === 'compact' ? 40 : 48,
              height: variant === 'compact' ? 40 : 48
            }}
          >
            {headerIcon}
          </Avatar>
        )}
        
        <Box>
          <Typography 
            variant={variant === 'compact' ? 'h6' : 'h5'} 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          
          {description && (
            <Typography 
              variant="body1" 
              color="textSecondary"
              sx={{ 
                mt: 0.5,
                display: variant === 'compact' && isMobile ? 'none' : 'block' 
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      
      {actions && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          mt: { xs: 1, sm: 0 },
          ml: { xs: 0, sm: 2 }
        }}>
          {actions}
        </Box>
      )}
    </Paper>
  );
};

export default PageHeader; 