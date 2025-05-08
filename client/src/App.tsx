import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ToastNotification from './components/ToastNotification';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './pages/Login/LoginForm';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const location = useLocation();
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastNotification />
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
              <Route path="/energy-audit" element={
                <ProtectedRoute>
                  <EnergyAudit />
                </ProtectedRoute>
              } />
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
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
