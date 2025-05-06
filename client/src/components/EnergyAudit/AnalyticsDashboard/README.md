# AnalyticsDashboard Component

A dashboard for visualizing and exporting key analytics in the Energy Audit module.

## Features

- Most active users (by comment count and activity log count)
- Most common actions (from activity log)
- Comment counts per finding (bar chart)
- Activity over time (line chart)
- SLA tracking and bottleneck detection
- **Export analytics as PDF/CSV**
- **Export full audit trail (activity log) as CSV for compliance**
- **Send analytics summary to external API (webhook)**
- **Send analytics summary via email**
- **Schedule daily/weekly analytics reports via email or webhook**
- Responsive layout using Material-UI and recharts

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| findings | Finding[] | Yes | Array of findings to analyze |
| activityLog | ActivityLogEntry[] | Yes | Array of activity log entries to analyze |

## Types

```typescript
import { Finding } from '../../../pages/EnergyAudit/EnergyAuditContext';
import { ActivityLogEntry } from '../ActivityLog';
```

## Usage Example

```tsx
import AnalyticsDashboard from './AnalyticsDashboard';
import { Finding } from '../../../pages/EnergyAudit/EnergyAuditContext';
import { ActivityLogEntry } from '../ActivityLog';

const findings: Finding[] = [/* ... */];
const activityLog: ActivityLogEntry[] = [/* ... */];

<AnalyticsDashboard findings={findings} activityLog={activityLog} />
```

## Analytics

- **Most Active Users (Comments):** Top 5 users by comment count
- **Most Active Users (Activity Log):** Top 5 users by activity log entries
- **Most Common Actions:** Top 5 actions in the activity log
- **Comment Counts per Finding:** Bar chart of comment counts for each finding
- **Activity Over Time:** Line chart of activity log entries per day
- **SLA Tracking & Bottleneck Detection:** Table of average time in each workflow stage, with bottleneck highlighted

## Export & Integration

- **Export PDF:** Download a PDF summary of analytics
- **Export CSV:** Download a CSV summary of analytics
- **Export Audit Trail CSV:** Download the full activity log for compliance
- **Send to External API:** Simulate sending analytics summary to a webhook
- **Send via Email:** Simulate sending analytics summary via email
- **Schedule Daily/Weekly Email/Webhook:** Simulate scheduling automated analytics reports

## Compliance

- Audit trail export supports compliance and audit requirements
- All exports include timestamps and user actions

## Styling

- Uses Material-UI for layout and cards
- Uses recharts for charts
- Responsive and mobile-friendly

## Dependencies

- @mui/material
- recharts
- jsPDF
- file-saver

## Contributing

1. Maintain the existing prop interface
2. Add tests for new features
3. Update documentation for any changes
4. Follow the Material-UI and recharts design patterns 