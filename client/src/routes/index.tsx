import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { User, UserRole } from '../types';

// Lazy load components
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ElectricalSystem = lazy(() => import('../pages/ElectricalSystem'));
const EnergyAudit = lazy(() => import('../pages/EnergyAudit'));
const SystemTools = lazy(() => import('../pages/SystemTools'));
const Testing = lazy(() => import('../pages/Testing'));
const TamEvaluation = lazy(() => import('../pages/TamEvaluation'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading component
const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// Protected Route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuthContext();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/electrical-system" element={<ProtectedRoute><ElectricalSystem /></ProtectedRoute>} />
        <Route path="/energy-audit" element={<ProtectedRoute><EnergyAudit /></ProtectedRoute>} />
        <Route path="/system-tools" element={<ProtectedRoute><SystemTools /></ProtectedRoute>} />
        <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
        <Route path="/tam-evaluation" element={<ProtectedRoute><TamEvaluation /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Redirect root to dashboard if authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
