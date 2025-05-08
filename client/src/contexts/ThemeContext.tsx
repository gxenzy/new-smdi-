import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme, grayTheme, tileTheme, logoTheme } from '../theme';

const ThemeContext = createContext({
  mode: 'default',
  setMode: (mode: string) => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'default');

  // Use the selected theme based on mode
  const activeTheme = useMemo(() => {
    switch (mode) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'gray':
        return grayTheme;
      case 'tile':
        return tileTheme;
      case 'logo':
        return logoTheme;
      default:
        return lightTheme;
    }
  }, [mode]);

  const handleSetMode = (newMode: string) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Removed manual background effect; CssBaseline will apply the theme's background automatically

  return (
    <ThemeContext.Provider value={{ mode, setMode: handleSetMode }}>
      <MuiThemeProvider theme={activeTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 