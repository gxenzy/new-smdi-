import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import EnergyAudit from '../pages/EnergyAudit';
import ElectricalSystem from '../pages/ElectricalSystem';
import TamEvaluation from '../pages/TamEvaluation';
import Testing from '../pages/Testing';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import UserManagement from '../pages/UserManagement';
import { useAuthContext } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { UserRole } from '../types';

// Protected route component
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode; 
  requiredRole?: UserRole;
}> = ({ element, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuthContext();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{element}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <PageTransition variant="fade">
            <Login />
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
              <EnergyAudit />
            </PageTransition>
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
        
        <Route 
          path="/tam-evaluation" 
          element={
            <PageTransition variant="slide">
              <TamEvaluation />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/testing" 
          element={
            <PageTransition variant="slide">
              <Testing />
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
        
        {/* 404 Not Found */}
        <Route 
          path="*" 
          element={
            <PageTransition variant="fade">
              <NotFound />
            </PageTransition>
          } 
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
