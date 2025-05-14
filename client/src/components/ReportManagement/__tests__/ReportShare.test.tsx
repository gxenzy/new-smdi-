import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReportShare } from '../index';
import reportService from '../../../services/reportService';
import userService from '../../../services/userService';

// Mock the services
jest.mock('../../../services/reportService', () => ({
  getReportById: jest.fn(),
  shareReport: jest.fn(),
  revokeReportAccess: jest.fn(),
  generatePublicLink: jest.fn(),
  revokePublicLink: jest.fn(),
  updateReport: jest.fn(),
}));

jest.mock('../../../services/userService', () => ({
  getAllUsers: jest.fn(),
}));

// Mock report data
const mockReport = {
  id: 1,
  title: 'Test Report',
  description: 'Test description',
  type: 'energy_audit',
  status: 'published',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  created_by: 1,
  is_template: false,
  is_public: false,
  version: 1,
};

// Mock users data
const mockUsers = [
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'admin' },
];

// Set up mocked params
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}));

// Helper component to wrap with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ReportShare Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup the mock implementations
    (reportService.getReportById as jest.Mock).mockResolvedValue(mockReport);
    (reportService.shareReport as jest.Mock).mockResolvedValue(true);
    (reportService.revokeReportAccess as jest.Mock).mockResolvedValue(true);
    (reportService.generatePublicLink as jest.Mock).mockResolvedValue('https://example.com/reports/public/abc123');
    (reportService.revokePublicLink as jest.Mock).mockResolvedValue(true);
    (reportService.updateReport as jest.Mock).mockResolvedValue({...mockReport, is_public: true});
    (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  test('renders loading state initially', async () => {
    renderWithRouter(<ReportShare />);
    
    // Check loading state is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('loads report and users data', async () => {
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if report title is displayed
    expect(screen.getByText('Share "Test Report"')).toBeInTheDocument();
    
    // Check if user options are loaded in select
    const userSelect = screen.getByLabelText('Select User *');
    fireEvent.mouseDown(userSelect);
    
    // Check if user names are in the dropdown
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
  });

  test('shares report with selected user', async () => {
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Select a user from dropdown
    const userSelect = screen.getByLabelText('Select User *');
    fireEvent.mouseDown(userSelect);
    const userOption = screen.getByText('Jane Smith');
    fireEvent.click(userOption);
    
    // Select permission level
    const permissionSelect = screen.getByLabelText('Permission Level *');
    fireEvent.mouseDown(permissionSelect);
    const permissionOption = screen.getByText('View Only');
    fireEvent.click(permissionOption);
    
    // Click share button
    const shareButton = screen.getByText('Share Report');
    fireEvent.click(shareButton);
    
    // Check if shareReport was called with correct args
    await waitFor(() => {
      expect(reportService.shareReport).toHaveBeenCalledWith(1, 2, 'view');
    });
    
    // Check success message
    expect(screen.getByText('Report shared successfully!')).toBeInTheDocument();
  });

  test('validates form before submission', async () => {
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Try to submit without selecting user
    const shareButton = screen.getByText('Share Report');
    fireEvent.click(shareButton);
    
    // Check validation error is shown
    expect(screen.getByText('Please select a user')).toBeInTheDocument();
    
    // Select a user but skip permission
    const userSelect = screen.getByLabelText('Select User *');
    fireEvent.mouseDown(userSelect);
    const userOption = screen.getByText('Jane Smith');
    fireEvent.click(userOption);
    
    // Try to submit again
    fireEvent.click(shareButton);
    
    // Check validation error for permission
    expect(screen.getByText('Please select a permission level')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Setup error response
    (reportService.shareReport as jest.Mock).mockRejectedValue(new Error('Failed to share report'));
    
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Select a user
    const userSelect = screen.getByLabelText('Select User *');
    fireEvent.mouseDown(userSelect);
    const userOption = screen.getByText('Jane Smith');
    fireEvent.click(userOption);
    
    // Select permission level
    const permissionSelect = screen.getByLabelText('Permission Level *');
    fireEvent.mouseDown(permissionSelect);
    const permissionOption = screen.getByText('View Only');
    fireEvent.click(permissionOption);
    
    // Click share button
    const shareButton = screen.getByText('Share Report');
    fireEvent.click(shareButton);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Failed to share report')).toBeInTheDocument();
    });
  });

  test('displays current shares of the report', async () => {
    // Update mock report to include shares
    const reportWithShares = {
      ...mockReport,
      shares: [
        { 
          id: 1, 
          report_id: 1, 
          user_id: 2, 
          permission: 'view', 
          created_by: 1,
          user: { id: 2, name: 'Jane Smith', email: 'jane@example.com' } 
        },
        { 
          id: 2, 
          report_id: 1, 
          user_id: 3, 
          permission: 'edit', 
          created_by: 1,
          user: { id: 3, name: 'Bob Johnson', email: 'bob@example.com' } 
        }
      ]
    };
    
    (reportService.getReportById as jest.Mock).mockResolvedValue(reportWithShares);
    
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if current shares section is displayed
    expect(screen.getByText('Current Shares')).toBeInTheDocument();
    
    // Check if the shared users are displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('View Only')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Can Edit')).toBeInTheDocument();
  });

  test('revokes user access to the report', async () => {
    // Update mock report to include shares
    const reportWithShares = {
      ...mockReport,
      shares: [
        { 
          id: 1, 
          report_id: 1, 
          user_id: 2, 
          permission: 'view', 
          created_by: 1,
          user: { id: 2, name: 'Jane Smith', email: 'jane@example.com' } 
        }
      ]
    };
    
    (reportService.getReportById as jest.Mock).mockResolvedValue(reportWithShares);
    
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the revoke access button
    const revokeButton = screen.getByLabelText('Revoke Access');
    fireEvent.click(revokeButton);
    
    // Confirm revocation in the confirmation dialog
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Check if revokeReportAccess was called with correct args
    await waitFor(() => {
      expect(reportService.revokeReportAccess).toHaveBeenCalledWith(1, 1);
    });
    
    // Check success message
    expect(screen.getByText('Access revoked successfully')).toBeInTheDocument();
  });

  test('generates public link for the report', async () => {
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the generate public link button
    const publicLinkButton = screen.getByText('Generate Public Link');
    fireEvent.click(publicLinkButton);
    
    // Check if generatePublicLink was called with correct args
    await waitFor(() => {
      expect(reportService.generatePublicLink).toHaveBeenCalledWith(1);
    });
    
    // Check if the public link is displayed
    expect(screen.getByText('https://example.com/reports/public/abc123')).toBeInTheDocument();
  });

  test('makes report public', async () => {
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the make public switch
    const publicSwitch = screen.getByLabelText('Make Report Public');
    fireEvent.click(publicSwitch);
    
    // Check if updateReport was called with correct args
    await waitFor(() => {
      expect(reportService.updateReport).toHaveBeenCalledWith(1, { is_public: true });
    });
    
    // Check success message
    expect(screen.getByText('Report visibility updated')).toBeInTheDocument();
  });

  test('copies link to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });

    // Update mock report to include public link
    const reportWithPublicLink = {
      ...mockReport,
      public_link: 'https://example.com/reports/public/abc123'
    };
    
    (reportService.getReportById as jest.Mock).mockResolvedValue(reportWithPublicLink);
    
    renderWithRouter(<ReportShare />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the copy link button
    const copyButton = screen.getByLabelText('Copy Link');
    fireEvent.click(copyButton);
    
    // Check if clipboard API was called with correct args
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/reports/public/abc123');
    });
    
    // Check success message
    expect(screen.getByText('Link copied to clipboard')).toBeInTheDocument();
  });
}); 