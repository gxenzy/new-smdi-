import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReportTemplates, MOCK_TEMPLATES } from '../index';

// Mock navigation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Helper component to wrap with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ReportTemplates Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders templates list with loading state', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Check loading state is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('displays templates after loading', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if template names are displayed
    MOCK_TEMPLATES.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    });
  });

  test('filters templates by type', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find and click the type filter
    const typeFilter = screen.getByLabelText('Filter by Type');
    fireEvent.mouseDown(typeFilter);
    
    // Select a type filter option (HVAC)
    const option = screen.getByText('HVAC');
    fireEvent.click(option);
    
    // Check if HVAC template is still shown
    const hvacTemplate = MOCK_TEMPLATES.find(t => t.report_type === 'hvac');
    expect(screen.getByText(hvacTemplate!.name)).toBeInTheDocument();
    
    // Check if other templates are hidden
    const nonHvacTemplate = MOCK_TEMPLATES.find(t => t.report_type !== 'hvac');
    expect(screen.queryByText(nonHvacTemplate!.name)).not.toBeInTheDocument();
  });

  test('opens template preview dialog when clicking on a template', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on first template
    const firstTemplate = MOCK_TEMPLATES[0];
    const templateCard = screen.getByText(firstTemplate.name);
    fireEvent.click(templateCard);
    
    // Check if dialog is open with template details
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(firstTemplate.name)[1]).toBeInTheDocument(); // One in card, one in dialog
    expect(screen.getByText(firstTemplate.description!)).toBeInTheDocument();
    
    // Check if template features are displayed
    expect(screen.getByText('Template Features:')).toBeInTheDocument();
    expect(screen.getByText('Pre-defined sections and structure')).toBeInTheDocument();
  });

  test('navigates to report creation when clicking "Use This Template"', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on first template
    const firstTemplate = MOCK_TEMPLATES[0];
    const templateCard = screen.getByText(firstTemplate.name);
    fireEvent.click(templateCard);
    
    // Click "Use This Template" button
    const useButton = screen.getByText('Use This Template');
    fireEvent.click(useButton);
    
    // Check if navigation was called with correct URL
    expect(mockedNavigate).toHaveBeenCalledWith(`/reports/create?template=${firstTemplate.id}`);
  });

  test('navigates to report creation when clicking "Create Custom Report"', async () => {
    renderWithRouter(<ReportTemplates />);
    
    // Wait for templates to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click "Create Custom Report" button
    const createButton = screen.getByText('Create Custom Report');
    fireEvent.click(createButton);
    
    // Check if navigation was called with correct URL
    expect(mockedNavigate).toHaveBeenCalledWith('/reports/create');
  });
}); 