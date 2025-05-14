# Notification Center Component

A real-time notification system for the Energy Audit module that displays alerts, updates, and system events.

## Features

- Real-time notifications for important events
- Badge counter for unread notifications
- Toast notifications for new alerts
- Categorized notification types (alerts, updates, info, etc.)
- Notification priority levels
- Mark as read functionality
- Mute/unmute notifications option
- Tab filters for viewing all or only unread notifications
- Clickable notifications with action links
- Integration with the Activity Log for comprehensive event tracking

## Usage

### Basic Usage

```tsx
import NotificationCenter from 'components/EnergyAudit/NotificationCenter';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Energy Audit</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <NotificationCenter />
      </Toolbar>
    </AppBar>
  );
}
```

### With Navigation Handler

```tsx
import NotificationCenter from 'components/EnergyAudit/NotificationCenter';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  
  const handleNavigate = (route: string) => {
    navigate(route);
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Energy Audit</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <NotificationCenter onNavigate={handleNavigate} />
      </Toolbar>
    </AppBar>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxItems` | number | 20 | Maximum number of notifications to display |
| `onNavigate` | function | - | Callback when a notification with an action link is clicked |
| `showControls` | boolean | true | Whether to show settings controls |

## Notification Types

The component supports different types of notifications:

- `alert` - Important alerts that need attention
- `info` - Informational updates
- `update` - System or content updates
- `reminder` - Scheduled events or deadlines
- `error` - Error conditions or failures

## Integration with Real-Time Events

The NotificationCenter component automatically subscribes to WebSocket events through the `useEnergyAuditRealTime` hook and converts them to notifications:

- `auditCreated` → New audit notification
- `auditUpdated` → Audit updated notification
- `findingCreated` → New finding notification
- `auditCommentAdded` → New comment notification
- `syncCompleted` → Data sync notification

## Integration with EnergyAuditContext

The component integrates with the `EnergyAuditContext` to:

1. Log notifications as activity events
2. Access centralized application state
3. Provide a unified event tracking system

## Toast Notifications

When a new notification is received while the notification panel is closed, a toast notification appears in the bottom right corner of the screen. This toast automatically disappears after 5 seconds or can be dismissed manually.

## Future Enhancements

Planned features for future versions:

1. Notification persistence across sessions
2. Customizable notification settings
3. Sound alerts for high-priority notifications
4. Mobile push notification integration
5. Notification groups for related events
6. Advanced filtering options 