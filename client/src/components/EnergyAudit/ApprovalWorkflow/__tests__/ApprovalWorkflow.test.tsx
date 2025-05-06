import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApprovalWorkflow from '../index';
import { Finding, ApprovalStatus } from '../../../../pages/EnergyAudit/EnergyAuditContext';
import { UserRole } from '../../../../types';

const mockFinding: Finding = {
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

const mockWorkflowStages: ApprovalStatus[] = [
  'Draft',
  'Pending Review',
  'Manager Approval',
  'Final Approval',
  'Approved',
  'Rejected',
];

const defaultProps = {
  currentStatus: 'Draft' as ApprovalStatus,
  currentUserRole: 'ENGINEER' as UserRole,
  onStatusChange: jest.fn(),
  workflowStages: mockWorkflowStages,
  onAddComment: jest.fn(),
  commentInput: '',
  onCommentInputChange: jest.fn(),
};

describe('ApprovalWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders approval workflow correctly', () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    expect(screen.getByText(/approval workflow/i)).toBeInTheDocument();
    expect(screen.getByText(/current status/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('shows correct buttons based on user role and status', () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    // Engineer should see Submit for Review button
    expect(screen.getByRole('button', { name: /submit for review/i })).toBeInTheDocument();
    
    // Change to manager role
    render(<ApprovalWorkflow {...defaultProps} currentUserRole={'MANAGER' as UserRole} />);
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('handles status changes', () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);
    
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Pending Review');
  });

  it('handles comment addition', async () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    await userEvent.type(commentInput, 'Test comment');
    fireEvent.click(submitButton);
    
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('Test comment');
  });

  it('shows approval history', () => {
    const findingWithHistory = {
      ...mockFinding,
      activityLog: [
        {
          type: 'status_change',
          status: 'Pending Review',
          user: 'John Doe',
          timestamp: new Date().toISOString(),
          comment: 'Submitted for review',
        },
      ],
    };
    
    render(<ApprovalWorkflow {...defaultProps} />);
    
    expect(screen.getByText(/submitted for review/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('handles approval with comment', async () => {
    render(<ApprovalWorkflow {...defaultProps} currentUserRole={'MANAGER' as UserRole} />);
    
    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    const approveButton = screen.getByRole('button', { name: /approve/i });
    
    await userEvent.type(commentInput, 'Approved with changes');
    fireEvent.click(approveButton);
    
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Approved');
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('Approved with changes');
  });

  it('handles rejection with comment', async () => {
    render(<ApprovalWorkflow {...defaultProps} currentUserRole={'MANAGER' as UserRole} />);
    
    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    
    await userEvent.type(commentInput, 'Needs more information');
    fireEvent.click(rejectButton);
    
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('Rejected');
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('Needs more information');
  });

  it('shows loading state during status change', async () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables buttons during loading', async () => {
    render(<ApprovalWorkflow {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /comment/i })).toBeDisabled();
  });

  it('shows error state when status change fails', async () => {
    const mockError = new Error('Status change failed');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);
    
    render(<ApprovalWorkflow {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to update status/i)).toBeInTheDocument();
    });
  });
}); 