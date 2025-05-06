import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ElectricalSystem from './pages/ElectricalSystem';
import EnergyAudit from './pages/EnergyAudit';
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

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { user } = useAuthContext();

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <EnergyAuditProvider>
              <Dashboard />
            </EnergyAuditProvider>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/electrical-system" element={<ProtectedRoute><ElectricalSystem /></ProtectedRoute>} />
        <Route path="/energy-audit" element={<ProtectedRoute><EnergyAudit /></ProtectedRoute>} />
        <Route path="/system-tools" element={<ProtectedRoute><SystemTools /></ProtectedRoute>} />
        <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
        <Route path="/tam-evaluation" element={<ProtectedRoute><TamEvaluation /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
