import React from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { UserRole } from '../../../types';
import { ApprovalStatus } from '../../../pages/EnergyAudit/EnergyAuditContext';

interface ApprovalWorkflowProps {
  currentStatus: ApprovalStatus;
  currentUserRole: UserRole;
  onStatusChange: (status: ApprovalStatus) => void;
  workflowStages: string[];
  isAdmin?: boolean;
  onAddStage?: (stage: string) => void;
  onRemoveStage?: (stage: string) => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  currentStatus,
  currentUserRole,
  onStatusChange,
  workflowStages,
  isAdmin,
  onAddStage,
  onRemoveStage,
}) => {
  const canApprove = (status: ApprovalStatus) => {
    switch (status) {
      case 'Draft':
        return currentUserRole === UserRole.AUDITOR;
      case 'Pending Review':
        return currentUserRole === UserRole.MANAGER;
      case 'Manager Approval':
      case 'Final Approval':
        return currentUserRole === UserRole.ADMIN;
      default:
        return false;
    }
  };

  const canReject = (status: ApprovalStatus) => {
    return ['Pending Review', 'Manager Approval', 'Final Approval'].includes(status) &&
      (currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.ADMIN);
  };

  const getNextStatus = (current: ApprovalStatus): ApprovalStatus | null => {
    const currentIndex = workflowStages.indexOf(current);
    if (currentIndex === -1 || currentIndex === workflowStages.length - 1) return null;
    return workflowStages[currentIndex + 1] as ApprovalStatus;
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Approval Status: <b>{currentStatus}</b>
      </Typography>

      {/* Approval Actions */}
      {canApprove(currentStatus) && (
        <Button
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
          onClick={() => {
            const nextStatus = getNextStatus(currentStatus);
            if (nextStatus) onStatusChange(nextStatus);
          }}
        >
          {currentStatus === 'Final Approval' ? 'Approve' : 'Submit for Review'}
        </Button>
      )}

      {canReject(currentStatus) && (
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => onStatusChange('Rejected')}
        >
          Reject
        </Button>
      )}

      {/* Admin Workflow Management */}
      {isAdmin && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Workflow Stages
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {workflowStages.map((stage) => (
              <Chip
                key={stage}
                label={stage}
                color={stage === currentStatus ? 'primary' : 'default'}
                onDelete={workflowStages.length > 1 ? () => onRemoveStage?.(stage) : undefined}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ApprovalWorkflow; 