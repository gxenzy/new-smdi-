import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import './theme/theme.css';
import { SocketProvider } from './contexts/SocketContext';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import { EnergyAuditProvider } from './pages/Energy Audit/EnergyAuditContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
const future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

root.render(
  <Provider store={store}>
    <ThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <BrowserRouter future={future}>
          <AuthProvider>
            <UserProvider>
              <NotificationProvider>
                <SocketProvider>
                  <EnergyAuditProvider>
                    <App />
                  </EnergyAuditProvider>
                </SocketProvider>
              </NotificationProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  </Provider>
);
