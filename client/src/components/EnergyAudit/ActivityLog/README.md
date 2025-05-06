# ActivityLog Component

A modular React component for displaying and managing activity logs in the Energy Audit module.

## Features

- Display a list of activity log entries (action, user, details, timestamp)
- **Filter by user, action, and date**
- **Export filtered log as CSV**
- Responsive design using Material-UI components

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| activityLog | ActivityLogEntry[] | Yes | Array of activity log entries to display |

## Types

```typescript
export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  details?: string;
  timestamp: string;
}
```

## Usage Example

```tsx
import ActivityLog, { ActivityLogEntry } from './ActivityLog';

const activityLog: ActivityLogEntry[] = [
  {
    id: '1',
    action: 'Comment Added',
    user: 'John Doe',
    details: 'Added a comment',
    timestamp: '2024-03-20T10:00:00Z',
  },
  // ...more entries
];

<ActivityLog activityLog={activityLog} />
```

## Filtering

- **User:** Filter log entries by user (dropdown)
- **Action:** Filter log entries by action (dropdown)
- **Date:** Filter log entries by date (date picker)
- Filters can be combined

## CSV Export

- Click the **Export CSV** button to download the currently filtered log as a CSV file
- CSV includes columns: Action, User, Details, Timestamp

## Styling

- Uses Material-UI components
- Responsive layout
- Compact list with dividers

## Dependencies

- @mui/material
- file-saver

## Contributing

1. Maintain the existing prop interface
2. Add tests for new features
3. Update documentation for any changes
4. Follow the Material-UI design patterns 