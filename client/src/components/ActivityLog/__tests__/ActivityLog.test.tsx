import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityLog from '../index';
import useEnergyAuditRealTime from '../../../../hooks/useEnergyAuditRealTime';
import { WebSocketEvent } from '../../../../services/energyAuditWebSocketService';

// Mock the useEnergyAuditRealTime hook
jest.mock('../../../../hooks/useEnergyAuditRealTime');

describe('ActivityLog Component', () => {
  const mockSubscribeToEvent = jest.fn();
  const mockRefreshWithNotification = jest.fn().mockResolvedValue(true);
  const mockAuditId = 'test-audit-123';

  beforeEach(() => {
    // Default mock implementation
    (useEnergyAuditRealTime as jest.Mock).mockReturnValue({
      isConnected: true,
      activeUsers: [],
      lastEvent: null,
      syncStatus: 'synced',
      subscribeToEvent: mockSubscribeToEvent,
      refreshWithNotification: mockRefreshWithNotification
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the activity log with title', () => {
    render(<ActivityLog auditId={mockAuditId} />);
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
  });

  it('shows loading state when loading data', () => {
    render(<ActivityLog auditId={mockAuditId} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays "no activity" message when no logs are available', async () => {
    // Simulate loading completed with no logs
    (useEnergyAuditRealTime as jest.Mock).mockReturnValue({
      isConnected: true,
      activeUsers: [],
      lastEvent: null,
      syncStatus: 'synced',
      subscribeToEvent: mockSubscribeToEvent,
      refreshWithNotification: mockRefreshWithNotification
    });

    render(<ActivityLog auditId={mockAuditId} />);
    
    // Wait for loading to complete (implementation dependent)
    await waitFor(() => {
      expect(screen.getByText('No activity recorded yet')).toBeInTheDocument();
    });
  });

  it('subscribes to WebSocket events', () => {
    render(<ActivityLog auditId={mockAuditId} />);
    
    // Verify that it subscribes to all important event types
    expect(mockSubscribeToEvent).toHaveBeenCalledWith('auditUpdated', expect.any(Function));
    expect(mockSubscribeToEvent).toHaveBeenCalledWith('findingUpdated', expect.any(Function));
    expect(mockSubscribeToEvent).toHaveBeenCalledWith('dataPointUpdated', expect.any(Function));
    expect(mockSubscribeToEvent).toHaveBeenCalledWith('auditCommentAdded', expect.any(Function));
    expect(mockSubscribeToEvent).toHaveBeenCalledWith('syncCompleted', expect.any(Function));
  });

  it('filters logs based on selected filter chips', async () => {
    // Mock implementation with sample logs
    let auditCreatedCallback: ((event: WebSocketEvent<any>) => void) | null = null;
    let findingUpdatedCallback: ((event: WebSocketEvent<any>) => void) | null = null;
    
    // This will capture the callbacks that are passed to subscribeToEvent
    mockSubscribeToEvent.mockImplementation((eventType, callback) => {
      if (eventType === 'auditCreated') {
        auditCreatedCallback = callback;
      } else if (eventType === 'findingUpdated') {
        findingUpdatedCallback = callback;
      }
      return jest.fn(); // Return unsubscribe function
    });
    
    render(<ActivityLog auditId={mockAuditId} />);
    
    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByText('Create')).toBeInTheDocument();
    });
    
    // Click on the "Create" filter to enable it
    fireEvent.click(screen.getByText('Create'));
    
    // Verify that the filter is active (implementation dependent)
    const createFilter = screen.getByText('Create').closest('button') || screen.getByText('Create');
    expect(createFilter).toHaveAttribute('color', 'primary');
  });

  it('refreshes data when refresh button is clicked', async () => {
    render(<ActivityLog auditId={mockAuditId} />);
    
    // Find and click the refresh button
    const refreshButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label') === 'Refresh' || 
               button.textContent?.includes('Refresh')
    );
    
    if (refreshButton) {
      fireEvent.click(refreshButton);
      
      // Verify refresh was called
      expect(mockRefreshWithNotification).toHaveBeenCalled();
    } else {
      throw new Error('Refresh button not found');
    }
  });

  it('renders in compact mode when compact prop is true', () => {
    render(<ActivityLog auditId={mockAuditId} compact={true} />);
    
    // In compact mode, we expect a different header
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // And we should not see the filter chips in compact mode
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  // Test handling of real-time events
  it('adds new logs when real-time events are received', async () => {
    // Set up a handler that will be called when subscribeToEvent is called
    mockSubscribeToEvent.mockImplementation((eventType, callback) => {
      // Only trigger a mock event for the auditCreated type
      if (eventType === 'auditCreated') {
        // Schedule to trigger the callback with a mock event
        setTimeout(() => {
          const mockEvent = {
            type: 'auditCreated',
            auditId: mockAuditId,
            timestamp: new Date().toISOString(),
            userId: 'user-123',
            userName: 'Test User',
            data: {
              id: 'new-audit-123',
              name: 'New Test Audit',
              status: 'success'
            }
          };
          
          // Call the callback directly
          callback(mockEvent);
        }, 0);
      }
      return jest.fn(); // Return unsubscribe function
    });
    
    // Render the component which will set up the subscriptions
    render(<ActivityLog auditId={mockAuditId} />);
    
    // Verify that subscribeToEvent was called
    expect(mockSubscribeToEvent).toHaveBeenCalled();
    
    // The callback should be triggered by our implementation above,
    // so we wait for the text to appear as a result
    await waitFor(() => {
      expect(screen.getByText('New Test Audit')).toBeInTheDocument();
    });
  });
}); 