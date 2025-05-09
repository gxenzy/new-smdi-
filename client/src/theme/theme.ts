import { createTheme, alpha, Theme, Components } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import type { CardProps } from '@mui/material/Card';
import type { DrawerProps } from '@mui/material/Drawer';

export type ThemeMode = 'light' | 'dark' | 'gradient' | 'blue' | 'gray';

declare module '@mui/material/styles' {
  interface Palette {
    neutral?: Palette['primary'];
    status: {
      pending: string;
      inProgress: string;
      completed: string;
    };
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    status?: {
      pending: string;
      inProgress: string;
      completed: string;
    };
  }
  interface TypeBackground {
    sidebar: string;
    default: string;
    paper: string;
  }
}

const getDesignTokens = (mode: ThemeMode) => {
  switch (mode) {
    case 'dark':
      return {
        palette: {
          mode: 'dark' as PaletteMode,
          primary: {
            main: '#00e5ff',
            light: '#6effff',
            dark: '#00b2cc',
          },
          secondary: {
            main: '#80deea',
            light: '#b4ffff',
            dark: '#4bacb8',
          },
          background: {
            default: '#0a0a0a',
            paper: '#121212',
            sidebar: '#1a1a1a',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        },
      };
    case 'gradient':
      return {
        palette: {
          mode: 'dark' as PaletteMode,
          primary: {
            main: '#6200ea',
            light: '#9d46ff',
            dark: '#0a00b6',
          },
          secondary: {
            main: '#00bcd4',
            light: '#62efff',
            dark: '#008ba3',
          },
          background: {
            default: '#141e30',
            paper: '#1a2942',
            sidebar: '#6200ea',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        },
      };
    case 'blue':
      return {
        palette: {
          mode: 'light' as PaletteMode,
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          secondary: {
            main: '#03a9f4',
            light: '#4fc3f7',
            dark: '#0288d1',
          },
          background: {
            default: '#e3f2fd',
            paper: '#ffffff',
            sidebar: '#2196f3',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        },
      };
    case 'gray':
      return {
        palette: {
          mode: 'dark' as PaletteMode,
          primary: {
            main: '#607d8b',
            light: '#90a4ae',
            dark: '#455a64',
          },
          secondary: {
            main: '#78909c',
            light: '#b0bec5',
            dark: '#546e7a',
          },
          background: {
            default: '#2f3a42',
            paper: '#37474f',
            sidebar: '#263238',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        },
      };
    default: // light
      return {
        palette: {
          mode: 'light' as PaletteMode,
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
            sidebar: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        },
      };
  }
};

const getComponents = (mode: ThemeMode) => {
  const tokens = getDesignTokens(mode);
  
  return {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.palette.background.sidebar,
          color: tokens.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          borderRight: `1px solid ${alpha(tokens.palette.primary.main, 0.12)}`,
          '& .MuiListItemIcon-root': {
            color: 'inherit',
          },
          '& .MuiListItemText-primary': {
            color: 'inherit',
          },
          '& .MuiListItemButton-root': {
            '&:hover': {
              backgroundColor: alpha(tokens.palette.primary.main, 0.08),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(tokens.palette.primary.main, 0.16),
              '&:hover': {
                backgroundColor: alpha(tokens.palette.primary.main, 0.24),
              },
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.palette.background.default,
          color: tokens.palette.text.primary,
        },
      },
    },
  };
};

export const getTheme = (mode: ThemeMode) => {
  const tokens = getDesignTokens(mode);
  
  return createTheme({
    ...tokens,
    components: getComponents(mode),
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
  });
};