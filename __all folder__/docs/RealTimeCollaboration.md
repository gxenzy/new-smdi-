# Real-Time Collaboration User Guide

This guide explains how to use the real-time collaboration features in the Energy Audit module.

## Overview

The Energy Audit module includes comprehensive real-time collaboration features that allow multiple users to work together on the same audit simultaneously. The system provides immediate updates when changes are made, shows who is currently viewing or editing various parts of the audit, and tracks all activity for accountability and future reference.

## Key Features

### 1. Real-Time Status Indicator

The RealTimeIndicator component appears in various sections of the Energy Audit module, showing:

- **Connection Status**: A green icon indicates you're connected to the real-time server, while red indicates you're offline.
- **Active Users**: See which team members are currently viewing or editing the same audit.
- **Sync Status**: Shows whether your data is fully synced, syncing, or has pending changes.

**How to use**: Look for the status indicator in the top-right corner of most audit screens. Hover over it to see more details, or click to get a list of active users.

### 2. Activity Log

The ActivityLog component provides a complete history of all actions taken in an audit:

- **Real-Time Updates**: See actions as they happen across the team.
- **Filtering**: Filter by action type (create, update, delete, sync).
- **Detailed Information**: Each entry shows who performed the action, what was changed, and when.
- **Compact Mode**: Available in a compact format for embedding in dashboards or sidebars.
- **Multiple View Options**: Switch between detailed and summary views.
- **Clear Categorization**: Color-coded and icon-based categorization of different activity types.
- **Time-Based Organization**: Activities are shown in chronological order with relative timestamps.

**How to use**: 
- The ActivityLog appears on the Dashboard and in specific modules like Field Data Collection.
- Use the filter chips to focus on specific types of actions (Create, Update, Delete, System).
- The refresh button updates the log with the latest events.
- In compact mode, click "View All" to see the complete activity history.
- Activity entries are automatically updated in real-time as team members take actions.

### 3. Notification Center

The NotificationCenter delivers alerts about important events:

- **Badge Counter**: Shows the number of unread notifications.
- **Toast Alerts**: Temporary pop-ups for new notifications when they arrive.
- **Categories**: Different types of notifications (alerts, updates, info, reminders, errors) with appropriate icons.
- **Actions**: Some notifications have action links to directly navigate to relevant screens.
- **Priority Levels**: High-priority notifications are clearly marked.
- **Tab Filtering**: Easily switch between all notifications and unread ones.
- **Mute Control**: Temporarily silence notifications when needed.
- **Mark As Read**: Both individual and "mark all as read" options.
- **Source Identification**: Each notification shows its originating system or module.
- **Integrated with Activity Log**: Notifications can be logged to the activity log for a complete audit trail.

**How to use**:
- Click the bell icon in the top navigation bar to open the notification panel.
- Use tabs to switch between all notifications and unread ones.
- Click on a notification to mark it as read and perform its associated action (if any).
- Use the mute button if you need to temporarily stop receiving notification alerts.
- Toast notifications appear automatically for new events and disappear after 5 seconds.
- High-priority notifications are marked with a "High Priority" chip.

### 4. Collaborative Editing

The system manages collaborative editing to prevent conflicts:

- **Edit Locking**: When someone begins editing a section, it's temporarily locked for others.
- **User Indicators**: See who is currently editing which sections.
- **Lock Expiration**: Locks automatically expire after a period of inactivity.
- **Lock Override**: Administrators can override locks if necessary.

**How to use**:
- When you begin editing, the system automatically acquires a lock.
- If someone else is editing, you'll see their name and when the lock expires.
- Save your work promptly to release the lock for others.

### 5. Offline Mode and Synchronization

Work can continue even when your internet connection is unreliable:

- **Offline Mode**: Toggle to explicitly work offline.
- **Automatic Sync**: Changes made offline are automatically synchronized when connection is restored.
- **Sync Indicators**: Clear visual cues show when you have pending changes to sync.

**How to use**:
- Enable "Offline Mode" in data collection screens if you know you'll be working without internet.
- The system will track unsynchronized changes automatically.
- When back online, use the "Sync Data" button to push your changes to the server.
- Conflicts are automatically resolved based on timestamps.

## Best Practices

1. **Regular Saves**: Save your work frequently to ensure others can see your updates.

2. **Check the Activity Log**: Before making significant changes, check the activity log to see what others have been doing.

3. **Use Comments**: Add comments to explain your changes, especially for significant modifications.

4. **Coordinate Complex Tasks**: For major changes affecting multiple sections, use the commenting system to coordinate with team members.

5. **Report Sync Issues**: If you notice synchronization problems, report them immediately and export your data as a backup.

6. **Manage Notifications**: Use the notification mute feature during focused work sessions to avoid interruptions.

7. **Clear Notifications Regularly**: Keep your notification count low by regularly reviewing and clearing notifications.

## Troubleshooting

### Connection Issues

If you see a red connection indicator:

1. Check your internet connection
2. Try refreshing the page
3. Look for system alerts in the notification center
4. Switch to offline mode if you need to continue working

### Sync Problems

If changes aren't syncing properly:

1. Click the refresh button on the real-time indicator
2. Try manual synchronization using the "Sync Data" button
3. Check the activity log for error events
4. If problems persist, export your data and contact support

### Persistent Locks

If you can't edit because of a persistent lock:

1. Wait for the lock expiration (shown in the interface)
2. Contact the user who has the lock (shown in the interface)
3. Administrators can use the "Override Lock" function in emergency situations

## FAQ

**Q: How many people can work on the same audit simultaneously?**  
A: The system supports unlimited simultaneous viewers, though editing is managed through the locking mechanism to prevent conflicts.

**Q: Are my changes saved if I lose connection?**  
A: Yes, all changes are stored locally and will synchronize when your connection is restored.

**Q: How do I know if someone else has made changes?**  
A: You'll see real-time notifications, updates in the activity log, and the data will automatically refresh in your view.

**Q: Can I turn off notifications temporarily?**  
A: Yes, use the mute button in the notification center to temporarily silence notifications.

**Q: How do I view historical activity for auditing purposes?**  
A: The full activity log is available on the Dashboard and can be filtered and exported as needed.

**Q: Will I be notified of all changes or just important ones?**  
A: The notification system is intelligent and will only notify you of significant changes and events to prevent notification fatigue. You can see all activities in the Activity Log.

**Q: How long are activities and notifications stored?**  
A: Activity logs are stored for the entire lifecycle of the audit. Notifications are kept for 30 days by default. 