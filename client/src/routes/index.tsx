import React, { lazy, Suspense } from 'react';
import { Navigate, useRoutes, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';
import MainLayout from '../layouts/MainLayout';

// Lazy load components
const LoginPage = lazy(() => import('../pages/Login'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const EnergyAuditPage = lazy(() => import('../pages/EnergyAudit'));
const SystemToolsPage = lazy(() => import('../pages/SystemTools'));
const UserManagementPage = lazy(() => import('../pages/UserManagement'));
const AdminSettingsPage = lazy(() => import('../pages/AdminSettings'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const SettingsPage = lazy(() => import('../pages/Settings'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const EnergyMonitoringDashboard = lazy(() => import('../components/EnergyMonitoring/Dashboard'));

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

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();

  const routes = [
    {
      path: '/login',
      element: !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
    },
    {
      path: '/',
      element: isAuthenticated ? (
        <MainLayout>
          <Outlet />
        </MainLayout>
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        { path: '', element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'energy-monitoring', element: <EnergyMonitoringDashboard /> },
        { path: 'energy-audit/*', element: <EnergyAuditPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'system-tools', element: <SystemToolsPage /> },
        ...(user?.role === ('admin' as UserRole) ? [
          { path: 'admin', element: <Navigate to="/admin/settings" replace /> },
          { path: 'admin/settings', element: <AdminSettingsPage /> },
          { path: 'admin/user-management', element: <UserManagementPage /> },
          { path: 'user-management', element: <UserManagementPage /> }
        ] : []),
      ]
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ];

  const routing = useRoutes(routes);

  return <Suspense fallback={<LoadingScreen />}>{routing}</Suspense>;
};

export default AppRoutes;
