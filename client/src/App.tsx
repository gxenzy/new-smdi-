import React, { Suspense } from 'react';
import AppRoutes from './routes/index';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { EnergyAuditProvider } from './contexts/EnergyAuditContext';
import { AccessibilitySettingsProvider } from './contexts/AccessibilitySettingsContext';
import ChartAccessibilityProvider from './utils/reportGenerator/ChartAccessibilityProvider';
import { EmergencyModeProvider, useEmergencyMode } from './contexts/EmergencyModeContext';
import EmergencyDbUpdateBanner from './components/UI/EmergencyDbUpdateBanner';
import { Toaster } from 'react-hot-toast';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {error.message}
      </Typography>
      <Button variant="contained" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </Box>
  );
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function AppContentWithEmergencyBanner() {
  const { isEmergencyMode } = useEmergencyMode();
  
  return (
    <>
      {isEmergencyMode && <EmergencyDbUpdateBanner />}
      <AppRoutes />
    </>
  );
}

function App() {
  const location = useLocation();
  
  return (
    <>
      <Toaster position="top-right" />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the state of your app here
          window.location.href = '/';
        }}
      >
        <EmergencyModeProvider>
          <AccessibilitySettingsProvider>
            <ChartAccessibilityProvider>
              <EnergyAuditProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <AnimatePresence mode="wait">
                    <AppContentWithEmergencyBanner key={location.pathname} />
                  </AnimatePresence>
                </Suspense>
              </EnergyAuditProvider>
            </ChartAccessibilityProvider>
          </AccessibilitySettingsProvider>
        </EmergencyModeProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
