import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Define notification types
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'activity' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  details?: any;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  maxHeight?: string | number;
  showTitle?: boolean;
  compact?: boolean;
  onClearAll?: () => void;
  onClearOne?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  maxHeight = 300,
  showTitle = true,
  compact = false,
  onClearAll,
  onClearOne,
  onNotificationClick
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifs(notifications);
    } else {
      // Mock notifications if none provided
      setNotifs([
        {
          id: '1',
          type: 'info',
          message: 'Energy audit data synchronized',
          timestamp: Date.now() - 3600000,
          read: true
        },
        {
          id: '2',
          type: 'warning',
          message: 'Missing required measurements in HVAC section',
          timestamp: Date.now() - 1800000,
          read: false
        },
        {
          id: '3',
          type: 'success',
          message: 'Report generation completed',
          timestamp: Date.now() - 900000,
          read: false
        },
        {
          id: '4',
          type: 'error',
          message: 'Failed to save lighting calculation',
          timestamp: Date.now() - 300000,
          read: false
        }
      ]);
    }
  }, [notifications]);

  const unreadCount = notifs.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'activity':
        return <AccessTimeIcon color="action" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };
  
  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      setNotifs([]);
    }
  };
  
  const handleClearOne = (id: string) => {
    if (onClearOne) {
      onClearOne(id);
    } else {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      // Mark as read
      setNotifs(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
  };
  
  // Compact version
  if (compact) {
    return (
      <Box>
        <Tooltip title={`${unreadCount} unread notifications`}>
          <IconButton color={unreadCount > 0 ? "primary" : "default"}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }}>
          <NotificationsIcon />
        </Badge>
        
        {showTitle && (
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
        )}
        
        {notifs.length > 0 && (
          <Tooltip title="Clear all notifications">
            <IconButton size="small" onClick={handleClearAll}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)} 
          sx={{ ml: 1 }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <Collapse in={expanded} timeout="auto">
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            maxHeight,
            mt: 1
          }}
        >
          {notifs.length === 0 ? (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ p: 2, textAlign: 'center' }}
            >
              No notifications
            </Typography>
          ) : (
            <List dense>
              {notifs.map((notification) => (
                <ListItem 
                  key={notification.id}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearOne(notification.id);
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  }
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          component="span"
                          sx={{ fontWeight: notification.read ? 'normal' : 'medium' }}
                        >
                          {notification.message}
                        </Typography>
                        <Chip 
                          label={notification.type}
                          size="small"
                          color={
                            notification.type === 'error' ? 'error' :
                            notification.type === 'warning' ? 'warning' :
                            notification.type === 'success' ? 'success' :
                            'default'
                          }
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <AccessTimeIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NotificationCenter; 