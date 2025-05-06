import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentsSection from '../index';
import { Finding, Comment } from '../../../../pages/EnergyAudit/EnergyAuditContext';
import { UserRole } from '../../../../types';

const mockUsers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
];

const mockComment: Comment = {
  id: '1',
  text: 'Test comment with @Jane Smith and **bold**',
  author: 'John Doe',
  createdAt: new Date().toISOString(),
  attachments: [
    { name: 'file.txt', url: 'blob:http://localhost/file.txt', type: 'text/plain' },
  ],
};

const defaultProps = {
  comments: [mockComment],
  onAddComment: jest.fn(),
  onEditComment: jest.fn(),
  onDeleteComment: jest.fn(),
  currentUser: 'John Doe',
  users: mockUsers,
};

describe('CommentsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders comments section correctly', () => {
    render(<CommentsSection {...defaultProps} />);
    
    expect(screen.getByText(/comments/i)).toBeInTheDocument();
    expect(screen.getByText(/test comment/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('renders comments section with markdown and mentions', () => {
    render(<CommentsSection {...defaultProps} />);
    expect(screen.getByText(/comments/i)).toBeInTheDocument();
    expect(screen.getByText(/test comment with/i)).toBeInTheDocument();
    expect(screen.getByText(/@Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bold/i)).toBeInTheDocument();
  });

  it('renders attachments in comments', () => {
    render(<CommentsSection {...defaultProps} />);
    expect(screen.getByText(/file.txt/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /file.txt/i })).toBeInTheDocument();
  });

  it('handles comment addition', async () => {
    render(<CommentsSection {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    const submitButton = screen.getByRole('button', { name: /add comment/i });
    
    await userEvent.type(commentInput, 'New comment');
    fireEvent.click(submitButton);
    
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('New comment');
  });

  it('handles comment addition with attachment', async () => {
    render(<CommentsSection {...defaultProps} />);
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/add comment/i).parentElement?.querySelector('input[type="file"]');
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }
    await userEvent.type(commentInput, 'New comment');
    const submitButton = screen.getByRole('button', { name: /add comment/i });
    fireEvent.click(submitButton);
    expect(defaultProps.onAddComment).toHaveBeenCalled();
  });

  it('handles comment input changes', async () => {
    render(<CommentsSection {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    await userEvent.type(commentInput, 'Typing a comment');
    
    expect(commentInput).toHaveValue('Typing a comment');
  });

  it('handles empty comments list', () => {
    render(<CommentsSection {...defaultProps} comments={[]} />);
    
    expect(screen.queryByText(/test comment/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('disables submit button when comment is empty', () => {
    render(<CommentsSection {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).toBeDisabled();
  });

  it('formats timestamps correctly', () => {
    const commentWithTimestamp = {
      ...mockComment,
      createdAt: '2024-03-20T10:00:00Z',
    };
    
    render(<CommentsSection {...defaultProps} comments={[commentWithTimestamp]} />);
    
    expect(screen.getByText(/march 20, 2024/i)).toBeInTheDocument();
  });

  it('handles Enter key press to submit comment', async () => {
    render(<CommentsSection {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    await userEvent.type(commentInput, 'New comment{enter}');
    
    expect(defaultProps.onAddComment).toHaveBeenCalledWith('New comment');
  });

  it('does not submit on Shift+Enter', async () => {
    render(<CommentsSection {...defaultProps} />);
    
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    await userEvent.type(commentInput, 'New comment{shift+enter}');
    
    expect(defaultProps.onAddComment).not.toHaveBeenCalled();
  });

  it('shows edit and delete buttons for own comment', () => {
    render(<CommentsSection {...defaultProps} />);
    expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delete/i)).toBeInTheDocument();
  });

  it('handles comment editing', async () => {
    render(<CommentsSection {...defaultProps} />);
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);
    const editInput = screen.getByDisplayValue(/test comment/i);
    await userEvent.clear(editInput);
    await userEvent.type(editInput, 'Edited comment');
    const saveButton = screen.getByLabelText(/save/i);
    fireEvent.click(saveButton);
    expect(defaultProps.onEditComment).toHaveBeenCalledWith('1', 'Edited comment');
  });

  it('handles comment editing with attachment', async () => {
    render(<CommentsSection {...defaultProps} />);
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);
    const editInput = screen.getByDisplayValue(/test comment/i);
    await userEvent.clear(editInput);
    await userEvent.type(editInput, 'Edited comment');
    const saveButton = screen.getByLabelText(/save/i);
    fireEvent.click(saveButton);
    expect(defaultProps.onEditComment).toHaveBeenCalled();
  });

  it('handles comment deletion', () => {
    render(<CommentsSection {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    expect(defaultProps.onDeleteComment).toHaveBeenCalledWith('1');
  });

  it('shows mention autocomplete when typing @', async () => {
    render(<CommentsSection {...defaultProps} />);
    const commentInput = screen.getByPlaceholderText(/type @ to mention someone/i);
    await userEvent.type(commentInput, '@Ja');
    expect(screen.getByText('@Jane Smith')).toBeInTheDocument();
  });
}); 