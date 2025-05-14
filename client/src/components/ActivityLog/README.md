# Activity Log Component

A real-time activity tracking component for the Energy Audit module that displays user actions, system events, and collaborative editing activities.

## Features

- Real-time event tracking and display
- Filterable activity history
- Compact and full-size display modes
- User-friendly timestamps with relative time
- Icon indicators for different event types
- Status indicators for operation results
- New event notifications/badges

## Usage

### Basic Usage

```tsx
import ActivityLog from 'components/EnergyAudit/ActivityLog';

function MyComponent() {
  return (
    <ActivityLog
      auditId="audit-123" 
      height={400} 
    />
  );
}
```

### Compact Mode

```tsx
<ActivityLog
  auditId="audit-123"
  compact={true}
  height={300}
  showControls={false}
/>
```

### With Custom Event Handler

```tsx
const handleLogEvent = (event) => {
  console.log('New activity:', event);
  // Do something with the event
};

<ActivityLog
  auditId="audit-123"
  onLogEvent={handleLogEvent}
  filterTypes={['create', 'update']}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `auditId` | string | - | ID of the audit to track activities for (required) |
| `maxItems` | number | 50 | Maximum number of items to display |
| `compact` | boolean | false | Whether to use compact display mode |
| `filterTypes` | string[] | [] | Initial filter types to apply |
| `height` | string or number | 400 | Height of the component |
| `showControls` | boolean | true | Whether to show filter and refresh controls |
| `onLogEvent` | function | - | Callback when a new event is logged |

## Event Types

Activity events can be of the following types:

- `create` - Resource creation events
- `update` - Resource update events
- `delete` - Resource deletion events
- `sync` - Data synchronization events
- `view` - User viewing/presence events
- `lock` - Resource locking for editing
- `unlock` - Resource unlocking after editing
- `system` - System messages and status updates

## Resource Types

Events can be associated with these resource types:

- `audit` - Energy audit data
- `finding` - Audit findings
- `dataPoint` - Field data points
- `area` - Audit areas
- `comment` - User comments
- `document` - Documents and reports

## Integration with EnergyAuditContext

The ActivityLog component integrates with the `EnergyAuditContext` to:

1. Subscribe to real-time WebSocket events
2. Log activities in a centralized place
3. Provide filtering and display options

Example of accessing the activity log from the context:

```tsx
import { useEnergyAudit } from 'contexts/EnergyAuditContext';

function EventSummary() {
  const { activityLog } = useEnergyAudit();
  
  return (
    <div>
      <h3>Recent Activity Summary</h3>
      <p>Total events: {activityLog.length}</p>
      <p>Latest event: {activityLog[0]?.details}</p>
    </div>
  );
}
```

## Manually Logging Events

You can manually log events using the `logActivity` function from the context:

```tsx
import { useEnergyAudit } from 'contexts/EnergyAuditContext';

function CustomAction() {
  const { logActivity } = useEnergyAudit();
  
  const handleCustomAction = () => {
    // Perform some action
    
    // Log the activity
    logActivity({
      id: `custom-${Date.now()}`,
      type: 'system',
      resourceType: 'audit',
      resourceId: 'audit-123',
      resourceName: 'Main Building Audit',
      userId: 'current-user-id',
      userName: 'John Doe',
      timestamp: new Date().toISOString(),
      details: 'Performed custom calculation',
      status: 'success'
    });
  };
  
  return (
    <button onClick={handleCustomAction}>
      Perform Custom Action
    </button>
  );
}
``` 