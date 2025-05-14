import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import ElectricalSystem from '../pages/ElectricalSystem';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import UserManagement from '../pages/UserManagement';
import { useAuthContext } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { UserRole } from '../types';
import EnergyAuditV2Router from '../pages/Energy Audit/Router';
import StandardsReference from '../pages/Energy Audit/components/StandardsReference/StandardsReference';
import IlluminationLevelCalculator from '../pages/Energy Audit/components/Calculators/IlluminationLevelCalculator';
import SavedCalculationsViewer from '../pages/Energy Audit/components/Calculators/SavedCalculationsViewer';
import StandardsManagement from '../pages/AdminSettings/StandardsManagement';

// Report Management Components
import { ReportList, ReportView, ReportEditor, ReportShare } from '../components/ReportManagement';
import Reports from '../pages/Reports';

// Auth Components
const LoginPage = lazy(() => import('../pages/Login'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

// Protected route component
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode; 
  requiredRole?: UserRole;
}> = ({ element, requiredRole }) => {
  const { isAuthenticated, user } = useAuthContext();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{element}</>;
};

// Loading component for Suspense
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <PageTransition variant="fade">
              <LoginPage />
          </PageTransition>
        } 
      />
      
      {/* Protected routes with MainLayout */}
      <Route 
        element={
          <ProtectedRoute 
            element={<MainLayout />}
          />
        }
      >
        <Route 
          path="/" 
          element={
            <PageTransition variant="fade">
              <Dashboard />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <PageTransition variant="fade">
              <Dashboard />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/energy-audit/*" 
          element={
            <PageTransition variant="slide">
              <EnergyAuditV2Router />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/energy-audit-v2/*" 
          element={
            <Navigate to="/energy-audit" replace />
          } 
        />
        
        <Route 
          path="/electrical-system" 
          element={
            <PageTransition variant="slide">
              <ElectricalSystem />
            </PageTransition>
          } 
        />
        
        {/* Standards Reference Route - Redirect to Energy Audit */}
        <Route 
          path="/standards" 
          element={
            <Navigate to="/energy-audit/standards-reference" replace />
          } 
        />
        
        {/* Report Management Routes */}
        <Route 
          path="/reports" 
          element={
            <Navigate to="/energy-audit/reports" replace />
          } 
        />
        
        <Route 
          path="/reports/view/:id" 
          element={
            <PageTransition variant="slide">
              <Box sx={{ p: 3 }}>
                <ReportView />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/reports/edit/:id" 
          element={
            <PageTransition variant="slide">
              <Box sx={{ p: 3 }}>
                <ReportEditor />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/reports/create" 
          element={
            <PageTransition variant="slide">
              <Box sx={{ p: 3 }}>
                <ReportEditor />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/reports/share/:id" 
          element={
            <PageTransition variant="slide">
              <Box sx={{ p: 3 }}>
                <ReportShare />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/reports/templates" 
          element={
            <PageTransition variant="fade">
              <Box sx={{ p: 3 }}>
                <ReportList reportsType="templates" />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/reports/shared" 
          element={
            <PageTransition variant="fade">
              <Box sx={{ p: 3 }}>
                <ReportList reportsType="shared" />
              </Box>
            </PageTransition>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <PageTransition variant="scale">
              <Profile />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <PageTransition variant="scale">
              <Settings />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/user-management" 
          element={
            <PageTransition variant="scale">
              <UserManagement />
            </PageTransition>
          }
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/standards-management" 
          element={
            <ProtectedRoute 
              element={
                <PageTransition variant="scale">
                  <StandardsManagement />
                </PageTransition>
              }
              requiredRole={UserRole.ADMIN}
            />
          }
        />
        
        {/* Standards Reference Route */}
        <Route 
          path="/standards" 
          element={
            <Navigate to="/energy-audit/standards-reference" replace />
          } 
        />
        
        {/* Add a route for the SavedCalculations page */}
        <Route 
          path="/energy-audit/saved-calculations" 
          element={
            <MainLayout>
              <Box sx={{ pt: 2, pb: 5, px: { xs: 2, md: 5 } }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Saved Calculations
                </Typography>
                <SavedCalculationsViewer />
              </Box>
            </MainLayout>
          }
        />
        
        {/* 404 Not Found */}
        <Route 
          path="*" 
          element={
            <PageTransition variant="fade">
                <NotFoundPage />
            </PageTransition>
          } 
        />
      </Route>
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
