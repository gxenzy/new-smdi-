import { createTheme, responsiveFontSizes, Theme, Components } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import type { CSSObject } from '@emotion/styled';

// Define common gradients to be used throughout the app
export const gradients = {
  primary: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
  secondary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  success: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  energy: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)'
};

// Extend the Theme interfaces to include sidebar background
declare module '@mui/material/styles' {
  interface TypeBackground {
    sidebar: string;
  }
}

// Design System Tokens
export const designTokens = {
  colors: {
    // Modern color palette
    primary: {
      main: '#2563eb', // Vibrant blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#7c3aed', // Rich purple
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff'
    },
    success: {
      main: '#059669', // Emerald
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff'
    },
    error: {
      main: '#dc2626', // Modern red
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#d97706', // Amber
      light: '#fbbf24',
      dark: '#b45309',
      contrastText: '#ffffff'
    },
    info: {
      main: '#0284c7', // Sky blue
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff'
    },
    backgrounds: {
      light: '#f8fafc', // Subtle light
      main: '#ffffff',
      dark: '#121212', // True dark
      darkBlue: '#0f172a', // Dark blue
      darkPaper: '#1e1e1e',
      darkBluePaper: '#1e293b'
    },
    text: {
      lightPrimary: '#1e293b', // Slate 800
      lightSecondary: '#475569', // Slate 600
      darkPrimary: '#f1f5f9', // Slate 100
      darkSecondary: '#94a3b8' // Slate 400
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
};

// Enhanced component overrides with modern styling
const createBaseComponents = (mode: 'light' | 'dark'): Components<Theme> => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'light' ? '#f1f5f9' : '#1e1e1e',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'light' ? '#94a3b8' : '#475569',
          borderRadius: '3px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
        boxShadow: designTokens.shadows.card,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: designTokens.shadows.dropdown,
        },
        '& .MuiCardContent-root': {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px'
          }
        }
      } as CSSObject,
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.sm,
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 20px',
        transition: 'all 0.2s ease-in-out',
      } as CSSObject,
      contained: {
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: designTokens.shadows.dropdown,
        },
      } as CSSObject,
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.sm,
        fontWeight: 500,
      } as CSSObject,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        transition: 'all 0.2s ease-in-out',
      } as CSSObject,
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        backdropFilter: 'blur(8px)',
        backgroundColor: mode === 'light' 
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(18, 18, 18, 0.9)',
      } as CSSObject,
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        backdropFilter: 'blur(8px)',
        backgroundColor: mode === 'light'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(18, 18, 18, 0.9)',
      } as CSSObject,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#2a2a2a'}`,
      } as CSSObject,
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
      } as CSSObject,
    },
  },
});

// Enhanced base theme options
const createBaseTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
  components: createBaseComponents(mode),
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          primary: designTokens.colors.primary,
          secondary: designTokens.colors.secondary,
          error: designTokens.colors.error,
          warning: designTokens.colors.warning,
          info: designTokens.colors.info,
          success: designTokens.colors.success,
          background: {
            default: designTokens.colors.backgrounds.light,
            paper: designTokens.colors.backgrounds.main,
            sidebar: '#ffffff',
          },
          text: {
            primary: designTokens.colors.text.lightPrimary,
            secondary: designTokens.colors.text.lightSecondary,
          },
          divider: 'rgba(0, 0, 0, 0.08)',
        }
      : {
          primary: designTokens.colors.primary,
          secondary: designTokens.colors.secondary,
          error: designTokens.colors.error,
          warning: designTokens.colors.warning,
          info: designTokens.colors.info,
          success: designTokens.colors.success,
          background: {
            default: designTokens.colors.backgrounds.dark,
            paper: designTokens.colors.backgrounds.darkPaper,
          },
          text: {
            primary: designTokens.colors.text.darkPrimary,
            secondary: designTokens.colors.text.darkSecondary,
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },
});

// Light theme
export const lightTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('light'),
  palette: {
    mode: 'light',
    primary: designTokens.colors.primary,
    secondary: designTokens.colors.secondary,
    error: designTokens.colors.error,
    warning: designTokens.colors.warning,
    info: designTokens.colors.info,
    success: designTokens.colors.success,
    background: {
      default: designTokens.colors.backgrounds.light,
      paper: designTokens.colors.backgrounds.main,
      sidebar: '#ffffff',
    },
    text: {
      primary: designTokens.colors.text.lightPrimary,
      secondary: designTokens.colors.text.lightSecondary,
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
}));

// True Dark theme (completely black-based)
export const darkTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('dark'),
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc',
      light: '#e2b9ff',
      dark: '#8858c8',
      contrastText: '#000000'
    },
    secondary: {
      main: '#03dac6',
      light: '#66fff9',
      dark: '#00a896',
      contrastText: '#000000'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      sidebar: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...createBaseComponents('dark'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        } as CSSObject,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
        } as CSSObject,
      },
    },
  },
}));

// Dark Blue theme (navy-based)
export const darkBlueTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('dark'),
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#8b5cf6',
      contrastText: '#ffffff'
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
      sidebar: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  components: {
    ...createBaseComponents('dark'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#f1f5f9',
        } as CSSObject,
      },
    },
  },
}));

// Energy theme (Gradient)
export const energyTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('dark'),
  palette: {
    mode: 'dark',
    primary: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff'
    },
    background: {
      default: '#042f2e', // New darker teal/green background
      paper: '#064e3b', // Darker green paper
      sidebar: '#0a5c45',
    },
  },
  components: {
    ...createBaseComponents('dark'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: gradients.energy,
          color: '#ffffff',
          '& .MuiButton-root': {
            textTransform: 'none'
          }
        } as CSSObject,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a5c45',
          backgroundImage: 'linear-gradient(rgba(5, 150, 105, 0.9), rgba(2, 132, 199, 0.4))',
          color: '#ffffff',
        } as CSSObject,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &[aria-current="page"]': {
            color: '#ffffff !important', 
            backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
          },
          // Fix for capitalized text in Energy theme
          textTransform: 'none',
        } as CSSObject,
      },
    },
  },
}));

// Blue theme
export const blueTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('light'),
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7', // Deeper blue
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    background: {
      default: '#082f49', // Darker blue background
      paper: '#0c4a6e', // Darker blue paper
      sidebar: '#0284c7', // Matching sidebar with primary color
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...createBaseComponents('dark'), // Using dark components for contrast
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0284c7',
          color: '#ffffff',
          '& .MuiButton-root': {
            textTransform: 'none'
          }
        } as CSSObject,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0284c7',
          color: '#ffffff',
          '& .MuiListItemIcon-root': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiListItemText-primary': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiListItemButton-root': {
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.24)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
        } as CSSObject,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &[aria-current="page"]': {
            color: '#ffffff !important',
            backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
          },
          textTransform: 'none',
        } as CSSObject,
      },
    },
  },
}));

// Gray theme
export const grayTheme = responsiveFontSizes(createTheme({
  ...createBaseTheme('light'),
  palette: {
    mode: 'light',
    primary: {
      main: '#374151', // Deeper gray
      light: '#6b7280',
      dark: '#1f2937',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#4b5563',
      light: '#6b7280',
      dark: '#374151',
      contrastText: '#ffffff'
    },
    background: {
      default: '#1f2937', // Darker gray background
      paper: '#374151', // Darker gray paper
      sidebar: '#374151', // Match sidebar with primary color
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...createBaseComponents('dark'), // Using dark components for contrast
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#374151',
          color: '#ffffff',
          '& .MuiButton-root': {
            textTransform: 'none'
          }
        } as CSSObject,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#374151',
          color: '#ffffff',
          '& .MuiListItemIcon-root': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiListItemText-primary': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiListItemButton-root': {
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.24)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
        } as CSSObject,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &[aria-current="page"]': {
            color: '#ffffff !important',
            backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
          },
          textTransform: 'none',
        } as CSSObject,
      },
    },
  },
}));

// Default theme (using light theme as default)
export default lightTheme; 