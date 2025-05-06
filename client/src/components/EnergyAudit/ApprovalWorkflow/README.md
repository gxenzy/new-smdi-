# ApprovalWorkflow Component

The ApprovalWorkflow component is a reusable React component that manages the approval process for energy audit findings. It provides a user interface for submitting, approving, and rejecting findings based on user roles and current status.

## Features

- Role-based approval actions
- Multi-stage workflow support
- Status change tracking
- Admin workflow management
- Loading states
- Error handling
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| currentStatus | ApprovalStatus | Yes | Current approval status of the finding |
| currentUserRole | UserRole | Yes | Role of the current user |
| onStatusChange | (status: ApprovalStatus) => void | Yes | Callback when status changes |
| workflowStages | ApprovalStatus[] | Yes | List of available workflow stages |
| isAdmin | boolean | No | Whether the current user is an admin |
| onAddStage | (stage: string) => void | No | Callback when adding a new stage (admin only) |
| onRemoveStage | (stage: string) => void | No | Callback when removing a stage (admin only) |

## Usage

```tsx
import ApprovalWorkflow from './components/EnergyAudit/ApprovalWorkflow';
import { ApprovalStatus } from './pages/EnergyAudit/EnergyAuditContext';
import { UserRole } from './types';

const MyComponent = () => {
  const workflowStages: ApprovalStatus[] = [
    'Draft',
    'Pending Review',
    'Manager Approval',
    'Final Approval',
    'Approved',
    'Rejected',
  ];

  return (
    <ApprovalWorkflow
      currentStatus="Draft"
      currentUserRole="ENGINEER"
      onStatusChange={(status) => console.log('Status changed:', status)}
      workflowStages={workflowStages}
      isAdmin={false}
    />
  );
};
```

## Workflow Stages

The component supports the following default workflow stages:
1. Draft
2. Pending Review
3. Manager Approval
4. Final Approval
5. Approved
6. Rejected

## Role-Based Permissions

The component implements the following role-based permissions:

| Role | Can Submit | Can Approve | Can Reject |
|------|------------|-------------|------------|
| Auditor | Yes | No | No |
| Manager | No | Yes | Yes |
| Admin | No | Yes | Yes |

## Admin Features

When `isAdmin` is true, the component provides additional features:
- View all workflow stages
- Remove stages (if more than one exists)
- Add new stages

## Error Handling

The component handles various error states:
- Invalid status transitions
- Permission errors
- Network errors during status changes

## Loading States

The component shows loading states for:
- Status changes
- Stage management (admin only)

## Styling

The component uses Material-UI components and follows the application's theme. It includes:
- Status chips
- Action buttons
- Loading indicators
- Error messages

## Testing

The component includes comprehensive tests covering:
- Rendering
- Role-based permissions
- Status transitions
- Error handling
- Loading states
- Admin features

## Dependencies

- @mui/material
- @mui/icons-material

## Contributing

When contributing to this component:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all props are properly typed
5. Handle loading and error states
6. Consider role-based permissions 