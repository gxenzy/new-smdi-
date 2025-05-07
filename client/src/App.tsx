import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ElectricalSystem from './pages/ElectricalSystem';
import EnergyAudit from './pages/EnergyAudit';
import EnergyAuditAnalytics from './pages/EnergyAudit/EnergyAuditAnalytics';
import { EnergyAuditHistoryProvider } from './pages/EnergyAudit/EnergyAuditHistoryContext';
import SystemTools from './pages/SystemTools';
import Testing from './pages/Testing';
import TamEvaluation from './pages/TamEvaluation';
import UserManagement from './pages/UserManagement';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
import { UserRole } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { EnergyAuditProvider } from './pages/EnergyAudit/EnergyAuditContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationListener from './components/NotificationListener';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import FindingsDashboard from './pages/Findings/FindingsDashboard';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import EnergyAuditTesting from './pages/EnergyAudit/EnergyAuditTesting';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const LoginForm = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Energy Audit Login
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Demo Credentials:
            <br />
            Admin: admin@example.com / admin123
            <br />
            Auditor: demo@example.com / demo123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { user } = useAuthContext();
  const [loading, setLoading] = React.useState(false);

  // Example: Simulate loading state for dashboard
  React.useEffect(() => {
    if (location.pathname === '/dashboard') {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  if (isLoginPage) {
    return <LoginForm />;
  }

  return (
    <MainLayout>
      {loading && location.pathname === '/dashboard' ? (
        <LoadingSpinner />
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/electrical-system" element={<ProtectedRoute><ElectricalSystem /></ProtectedRoute>} />
          <Route path="/energy-audit" element={<ProtectedRoute><EnergyAudit /></ProtectedRoute>} />
          <Route path="/energy-audit/analytics" element={<ProtectedRoute><EnergyAuditHistoryProvider><EnergyAuditAnalytics /></EnergyAuditHistoryProvider></ProtectedRoute>} />
          <Route path="/energy-audit/testing" element={<ProtectedRoute><EnergyAuditHistoryProvider><EnergyAuditTesting /></EnergyAuditHistoryProvider></ProtectedRoute>} />
          <Route path="/system-tools" element={<ProtectedRoute><SystemTools /></ProtectedRoute>} />
          <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
          <Route path="/tam-evaluation" element={<ProtectedRoute><TamEvaluation /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/findings" element={<ProtectedRoute><FindingsDashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </MainLayout>
  );
};

const App = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <LoginForm />;
  }

  return <AppRoutes />;
};

export default App;
