import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { CHART_COLORS } from '../pages/EnergyAudit/components/Analytics/constants';

interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  isMobile: boolean;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  theme: ReturnType<typeof createTheme>;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: prefersDarkMode ? 'dark' : 'light',
    primaryColor: CHART_COLORS[0],
    secondaryColor: CHART_COLORS[1],
    fontSize: 1,
  });

  const isDarkMode = themeSettings.mode === 'dark';

  const toggleTheme = useCallback(() => {
    setThemeSettings(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const updateThemeSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeSettings.mode,
      primary: { main: themeSettings.primaryColor },
      secondary: { main: themeSettings.secondaryColor }
    },
    typography: {
      fontSize: 14 * themeSettings.fontSize
    }
  }), [themeSettings]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const value = useMemo(() => ({
    themeSettings,
    isMobile,
    updateThemeSettings,
    theme,
    isDarkMode,
    toggleTheme,
  }), [themeSettings, isMobile, updateThemeSettings, theme, isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 