import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FindingCard from '../index';
import { Finding } from '../../../../pages/EnergyAudit/EnergyAuditContext';
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

const mockUsers = [
  { id: '1', name: 'John Doe', role: 'ENGINEER' as UserRole },
  { id: '2', name: 'Jane Smith', role: 'MANAGER' as UserRole },
];

const mockCurrentUser = {
  name: 'John Doe',
  role: 'ENGINEER' as UserRole,
};

const defaultProps = {
  finding: mockFinding,
  section: 'lighting' as const,
  users: mockUsers,
  currentUser: mockCurrentUser,
  isSelected: false,
  onSelect: jest.fn(),
  onUpdate: jest.fn(),
  onRemove: jest.fn(),
  onPhotoUpload: jest.fn(),
  onAddComment: jest.fn(),
  onSetApprovalStatus: jest.fn(),
  commentInput: '',
  onCommentInputChange: jest.fn(),
};

describe('FindingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields correctly', () => {
    render(<FindingCard {...defaultProps} />);
    
    expect(screen.getByLabelText(/finding description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recommendation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
  });

  it('handles finding selection', () => {
    render(<FindingCard {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockFinding.id);
  });

  it('updates finding fields', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const descriptionInput = screen.getByLabelText(/finding description/i);
    await userEvent.type(descriptionInput, 'Updated description');
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith('description', 'Updated description');
  });

  it('validates required fields', () => {
    render(<FindingCard {...defaultProps} finding={{ ...mockFinding, description: '', recommendation: '' }} />);
    
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/recommendation is required/i)).toBeInTheDocument();
  });

  it('handles photo upload', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/photo/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(defaultProps.onPhotoUpload).toHaveBeenCalledWith(file);
    });
  });

  it('validates photo upload', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/photo/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/please upload an image file/i)).toBeInTheDocument();
    });
  });

  it('handles finding removal', () => {
    render(<FindingCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it('handles comment addition', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    await userEvent.type(commentInput, 'Test comment');
    fireEvent.click(submitButton);
    
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('Test comment');
  });

  it('handles approval status changes', () => {
    render(<FindingCard {...defaultProps} />);
    
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);
    
    expect(defaultProps.onSetApprovalStatus).toHaveBeenCalledWith('Approved');
  });

  it('shows loading state during save', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when save fails', async () => {
    const mockError = new Error('Save failed');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);
    
    render(<FindingCard {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to save changes/i)).toBeInTheDocument();
    });
  });

  it('disables buttons during loading', async () => {
    render(<FindingCard {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /photo/i })).toBeDisabled();
  });
}); 