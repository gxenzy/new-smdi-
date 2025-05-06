import React from 'react';
import { Badge, IconButton, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotificationContext } from '../../contexts/NotificationContext';

const NotificationBell: React.FC = () => {
  const { notifications, markAllRead, clearNotifications } = useNotificationContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem disabled>
          <Typography variant="subtitle2">Notifications</Typography>
        </MenuItem>
        {notifications.length === 0 && (
          <MenuItem disabled>No notifications</MenuItem>
        )}
        {notifications.map(n => (
          <MenuItem key={n.id} selected={!n.read}>
            <ListItemText
              primary={n.message}
              secondary={new Date(n.createdAt).toLocaleString()}
            />
          </MenuItem>
        ))}
        <MenuItem onClick={() => { markAllRead(); handleClose(); }}>Mark all as read</MenuItem>
        <MenuItem onClick={() => { clearNotifications(); handleClose(); }}>Clear all</MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell; 