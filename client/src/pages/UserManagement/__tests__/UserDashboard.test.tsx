import { render, screen, waitFor } from '@testing-library/react';
import UserDashboard from '../UserDashboard';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url?.toString().includes('/api/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { _id: '1', username: 'user1', email: 'user1@example.com', firstName: 'User', lastName: 'One', role: 'USER' },
          { _id: '2', username: 'user2', email: 'user2@example.com', firstName: 'User', lastName: 'Two', role: 'ADMIN' }
        ])
      }) as any;
    }
    return Promise.reject('Unknown endpoint');
  }) as any;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading and then users', async () => {
  render(<UserDashboard />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/user1/)).toBeInTheDocument());
  expect(screen.getByText(/user2/)).toBeInTheDocument();
});

test('handles error state', async () => {
  (global.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: false }));
  render(<UserDashboard />);
  await waitFor(() => expect(screen.getByText(/Failed to fetch users/)).toBeInTheDocument());
}); 