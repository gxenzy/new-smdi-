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
import SystemSettingsPage from '../pages/Admin/Dashboard/SystemSettings';
import AccessibilityChartExample from '../components/UI/AccessibilityChartExample';
import AccessibilityTester from '../components/UI/AccessibilityTester';
import ChartTypeSelector from '../components/UI/ChartTypeSelector';
import ColorBlindnessDemo from '../components/UI/ColorBlindnessDemo';
import EnhancedPatternDemo from '../components/UI/EnhancedPatternDemo';
import ScreenReaderAccessibilityDemo from '../components/UI/ScreenReaderAccessibilityDemo';
import ChartAccessibilityTestSuite from '../components/UI/ChartAccessibilityTestSuite';
import ChartAccessibilityTestRecorder from '../components/UI/ChartAccessibilityTestRecorder';
import ChartAccessibilityTestReports from '../components/UI/ChartAccessibilityTestReports';
import ScreenReaderTestingGuide from '../components/UI/ScreenReaderTestingGuide';
import ChartAccessibilityTestStats from '../components/UI/ChartAccessibilityTestStats';
import AccessibilityTestingDashboard from '../components/UI/AccessibilityTestingDashboard';
import ChartAccessibilityRoadmap from '../components/UI/ChartAccessibilityRoadmap';

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
        
        {/* Add System Settings route */}
        <Route 
          path="/settings/system" 
          element={
            <PageTransition variant="scale">
              <SystemSettingsPage />
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility chart example */}
        <Route 
          path="/settings/accessibility/chart-examples" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <AccessibilityChartExample />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for color blindness simulation */}
        <Route 
          path="/settings/accessibility/color-blindness" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Color Blindness Simulation
                </Typography>
                <Typography variant="body1" paragraph>
                  This tool demonstrates how colors appear to people with different types of color vision deficiency.
                  Use the accessibility settings panel to change the simulation type.
                </Typography>
                <ColorBlindnessDemo variant="full" />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for enhanced pattern fills demo */}
        <Route 
          path="/settings/accessibility/pattern-fills" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <EnhancedPatternDemo />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for screen reader accessibility demo */}
        <Route 
          path="/settings/accessibility/screen-reader" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <ScreenReaderAccessibilityDemo />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility testing tools */}
        <Route 
          path="/settings/accessibility/testing" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Testing Tools
                </Typography>
                <Typography variant="body1" paragraph>
                  These tools help test components for WCAG 2.1 AA compliance.
                </Typography>
                <ChartTypeSelector />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for comprehensive chart accessibility test suite */}
        <Route 
          path="/settings/accessibility/test-suite" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Chart Accessibility Test Suite
                </Typography>
                <Typography variant="body1" paragraph>
                  Advanced testing suite for comprehensive chart accessibility evaluation.
                </Typography>
                <ChartAccessibilityTestSuite />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility test recorder */}
        <Route 
          path="/settings/accessibility/test-recorder" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Test Recorder
                </Typography>
                <Typography variant="body1" paragraph>
                  Record and analyze accessibility test results.
                </Typography>
                <ChartAccessibilityTestRecorder />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility test reports */}
        <Route 
          path="/settings/accessibility/test-reports" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Test Reports
                </Typography>
                <Typography variant="body1" paragraph>
                  View and manage saved accessibility test reports.
                </Typography>
                <ChartAccessibilityTestReports />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for screen reader testing guide */}
        <Route 
          path="/settings/accessibility/testing-guide" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Screen Reader Testing Guide
                </Typography>
                <Typography variant="body1" paragraph>
                  Step-by-step guides for testing charts with screen readers and keyboard navigation.
                </Typography>
                <ScreenReaderTestingGuide />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility test statistics */}
        <Route 
          path="/settings/accessibility/test-stats" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Test Analytics
                </Typography>
                <Typography variant="body1" paragraph>
                  Analytics and statistics for accessibility testing results.
                </Typography>
                <ChartAccessibilityTestStats />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility testing dashboard */}
        <Route 
          path="/settings/accessibility/dashboard" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Testing Dashboard
                </Typography>
                <Typography variant="body1" paragraph>
                  Central hub for chart accessibility testing tools and progress tracking.
                </Typography>
                <AccessibilityTestingDashboard />
              </Box>
            </PageTransition>
          } 
        />
        
        {/* Add route for accessibility testing roadmap */}
        <Route 
          path="/settings/accessibility/roadmap" 
          element={
            <PageTransition variant="scale">
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Accessibility Testing Roadmap
                </Typography>
                <Typography variant="body1" paragraph>
                  Step-by-step guide for comprehensive chart accessibility testing.
                </Typography>
                <ChartAccessibilityRoadmap />
              </Box>
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
