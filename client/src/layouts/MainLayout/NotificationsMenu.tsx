import React from 'react';
import {
  Menu,
  Typography,
  Box,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNotificationContext } from '../../contexts/NotificationContext';
import type { Notification, NotificationType } from '../../types';

interface NotificationsMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  [key: string]: any;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  anchorEl,
  open,
  onClose,
  ...props
}) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationContext();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const handleClearNotification = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const renderNotification = (notification: Notification) => (
    <ListItem
      key={notification.id}
      sx={{
        opacity: notification.read ? 0.7 : 1,
        backgroundColor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
      <ListItemText
        primary={notification.message}
        secondary={notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}
        primaryTypographyProps={{
          variant: 'body2',
          color: notification.read ? 'text.secondary' : 'text.primary',
        }}
      />
      <IconButton
        edge="end"
        size="small"
        onClick={() => handleClearNotification(notification.id)}
      >
        <ClearIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
          overflow: 'hidden',
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      {...props}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
        {notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map(renderNotification)}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 1 }}>
        <Button fullWidth onClick={onClose}>
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationsMenu;
