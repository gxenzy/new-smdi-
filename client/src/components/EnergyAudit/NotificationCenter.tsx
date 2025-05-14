import React from 'react';
import { Box, Typography, Paper, Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

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
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications = [], 
  maxHeight = 400, 
  showTitle = true 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Paper sx={{ p: 2 }}>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </Box>
      )}
      <Box sx={{ maxHeight, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No notifications.
          </Typography>
        ) : (
          notifications.map(notification => (
            <Box 
              key={notification.id} 
              sx={{ 
                mb: 1, 
                p: 1, 
                borderRadius: 1,
                bgcolor: notification.read ? 'transparent' : 'action.hover'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: notification.read ? 'regular' : 'medium' }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.timestamp).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default NotificationCenter; 