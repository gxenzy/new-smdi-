import React, { Suspense } from 'react';
import AppRoutes from './routes/index';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { EnergyAuditProvider } from './contexts/EnergyAuditContext';

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

function AppContent() {
  return (
    <div style={{ padding: 40, fontSize: 24, color: 'red' }}>
      The frontend is working!<br />
      (If you see this, the white screen is fixed. Backend/API errors will not prevent this message from showing.)
    </div>
  );
}

function App() {
  const location = useLocation();
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.href = '/';
      }}
    >
      <EnergyAuditProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <AppRoutes key={location.pathname} />
          </AnimatePresence>
        </Suspense>
      </EnergyAuditProvider>
    </ErrorBoundary>
  );
}

export default App;
