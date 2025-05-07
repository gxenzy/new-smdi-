import { render, screen, waitFor } from '@testing-library/react';
import EnergyAuditDashboard from '../EnergyAuditDashboard';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url?.toString().includes('/api/energy-audit')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { _id: '1', name: 'Audit 1', status: 'Pending' },
          { _id: '2', name: 'Audit 2', status: 'Completed' }
        ])
      }) as any;
    }
    return Promise.reject('Unknown endpoint');
  }) as any;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading and then audits', async () => {
  render(<EnergyAuditDashboard />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/Audit 1/)).toBeInTheDocument());
  expect(screen.getByText(/Audit 2/)).toBeInTheDocument();
});

test('handles error state', async () => {
  (global.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: false }));
  render(<EnergyAuditDashboard />);
  await waitFor(() => expect(screen.getByText(/Failed to fetch audits/)).toBeInTheDocument());
}); 