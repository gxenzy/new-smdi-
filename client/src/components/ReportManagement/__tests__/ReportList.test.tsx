import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReportList } from '../index';
import reportService from '../../../services/reportService';

// Mock the report service
jest.mock('../../../services/reportService', () => ({
  getAllReports: jest.fn(),
  deleteReport: jest.fn(),
}));

// Mock data for testing
const mockReports = [
  {
    id: 1,
    title: 'Test Report 1',
    type: 'energy_audit',
    status: 'draft',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    created_by: 1,
    is_template: false,
    is_public: false,
    version: 1,
  },
  {
    id: 2,
    title: 'Test Report 2',
    type: 'lighting',
    status: 'published',
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-02T00:00:00Z',
    created_by: 1,
    is_template: false,
    is_public: true,
    version: 1,
  },
];

// Helper component to wrap with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ReportList Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup the mock implementation
    (reportService.getAllReports as jest.Mock).mockResolvedValue(mockReports);
    (reportService.deleteReport as jest.Mock).mockResolvedValue(true);
  });

  test('renders report list with loading state', async () => {
    renderWithRouter(<ReportList />);
    
    // Check loading state is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for reports to load
    await waitFor(() => {
      expect(reportService.getAllReports).toHaveBeenCalled();
    });
  });

  test('displays reports after loading', async () => {
    renderWithRouter(<ReportList />);
    
    // Wait for reports to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if report titles are displayed
    expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    expect(screen.getByText('Test Report 2')).toBeInTheDocument();
  });

  test('filters reports by type', async () => {
    renderWithRouter(<ReportList />);
    
    // Wait for reports to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the type filter
    const typeFilter = screen.getByLabelText('Filter by Type');
    fireEvent.mouseDown(typeFilter);
    
    // Select a type filter option
    const option = screen.getByText('Energy Audit');
    fireEvent.click(option);
    
    // Check if filter was applied
    expect(reportService.getAllReports).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'energy_audit' })
    );
  });

  test('handles report deletion', async () => {
    renderWithRouter(<ReportList />);
    
    // Wait for reports to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the delete button for the first report
    const deleteButtons = screen.getAllByLabelText('delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion in the dialog
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    
    // Check if delete API was called
    await waitFor(() => {
      expect(reportService.deleteReport).toHaveBeenCalledWith(mockReports[0].id);
    });
  });
}); 