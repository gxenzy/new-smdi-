import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, darkBlueTheme, energyTheme, blueTheme, grayTheme } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'darkBlue' | 'energy' | 'blue' | 'gray';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: () => {},
  isDarkMode: false,
});

export const useThemeMode = () => useContext(ThemeContext);

const getThemeByMode = (mode: ThemeMode) => {
  switch (mode) {
    case 'dark':
      return darkTheme;
    case 'darkBlue':
      return darkBlueTheme;
    case 'energy':
      return energyTheme;
    case 'blue':
      return blueTheme;
    case 'gray':
      return grayTheme;
    default:
      return lightTheme;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.style.setProperty('data-theme', mode);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = mode === 'dark' ? '#121212' : 
                    mode === 'darkBlue' ? '#0f172a' : 
                    mode === 'energy' ? '#042f2e' :
                    mode === 'blue' ? '#082f49' :
                    mode === 'gray' ? '#1f2937' :
                    '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }, [mode]);

  const isDarkMode = ['dark', 'darkBlue', 'energy', 'blue', 'gray'].includes(mode);
  const theme = getThemeByMode(mode);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 