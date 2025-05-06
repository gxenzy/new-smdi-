# FindingCard Component

The FindingCard component is a reusable React component that displays and manages individual energy audit findings. It provides a comprehensive interface for viewing, editing, and managing findings with features like photo uploads, comments, and approval workflows.

## Features

- Display and edit finding details (description, severity, cost, etc.)
- Photo upload with validation
- Comments system with mentions
- Approval workflow integration
- Loading states and error handling
- Keyboard shortcuts
- Form validation
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| finding | Finding | Yes | The finding object to display |
| section | 'lighting' \| 'hvac' \| 'envelope' | Yes | The section this finding belongs to |
| users | Array<{id: string, name: string, role: UserRole}> | Yes | List of users for assignment and mentions |
| currentUser | {name: string, role: UserRole} | Yes | Current user information |
| isSelected | boolean | Yes | Whether this finding is selected |
| onSelect | (id: string) => void | Yes | Callback when finding is selected |
| onUpdate | (field: string, value: any) => void | Yes | Callback when finding is updated |
| onRemove | () => void | Yes | Callback when finding is removed |
| onPhotoUpload | (file: File) => void | Yes | Callback when photo is uploaded |
| onAddComment | (text: string) => void | Yes | Callback when comment is added |
| onSetApprovalStatus | (status: string) => void | Yes | Callback when approval status changes |
| commentInput | string | Yes | Current comment input value |
| onCommentInputChange | (value: string) => void | Yes | Callback when comment input changes |

## Usage

```tsx
import FindingCard from './components/EnergyAudit/FindingCard';

const MyComponent = () => {
  const finding = {
    id: '1',
    description: 'Test finding',
    recommendation: 'Test recommendation',
    severity: 'Medium',
    estimatedCost: 1000,
    status: 'Open',
    assignee: '',
    section: 'lighting',
    createdAt: new Date().toISOString(),
    comments: [],
    approvalStatus: 'Draft',
    activityLog: [],
  };

  const users = [
    { id: '1', name: 'John Doe', role: 'ENGINEER' },
    { id: '2', name: 'Jane Smith', role: 'MANAGER' },
  ];

  const currentUser = {
    name: 'John Doe',
    role: 'ENGINEER',
  };

  return (
    <FindingCard
      finding={finding}
      section="lighting"
      users={users}
      currentUser={currentUser}
      isSelected={false}
      onSelect={(id) => console.log('Selected:', id)}
      onUpdate={(field, value) => console.log('Updated:', field, value)}
      onRemove={() => console.log('Removed')}
      onPhotoUpload={(file) => console.log('Photo uploaded:', file)}
      onAddComment={(text) => console.log('Comment added:', text)}
      onSetApprovalStatus={(status) => console.log('Status changed:', status)}
      commentInput=""
      onCommentInputChange={(value) => console.log('Comment input:', value)}
    />
  );
};
```

## Keyboard Shortcuts

- `Ctrl + S`: Save changes
- `Delete`: Remove finding (when selected)

## Form Validation

The component includes validation for:
- Required fields (description, recommendation)
- Photo upload (file type, size limit)
- Numeric fields (estimated cost)

## Error Handling

The component handles various error states:
- Save failures
- Photo upload errors
- Validation errors

## Loading States

The component shows loading states for:
- Saving changes
- Photo upload
- Status changes

## Styling

The component uses Material-UI components and follows the application's theme. It includes:
- Responsive grid layout
- Loading overlays
- Error alerts
- Tooltips
- Icons

## Testing

The component includes comprehensive tests covering:
- Rendering
- User interactions
- Form validation
- Error handling
- Loading states
- Keyboard shortcuts

## Dependencies

- @mui/material
- @mui/icons-material
- react-hotkeys-hook

## Contributing

When contributing to this component:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all props are properly typed
5. Handle loading and error states
6. Add keyboard shortcuts for new features 