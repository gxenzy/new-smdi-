import type { Theme as MuiTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status?: {
      danger: string;
    };
  }
  
  interface ThemeOptions {
    status?: {
      danger: string;
    };
  }

  interface Palette {
    neutral?: Palette['primary'];
  }
  
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }

  interface TypeBackground {
    default: string;
    paper: string;
    darkPaper?: string;
  }
}

export interface DesignToken {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    info: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    neutral: {
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    backgrounds: {
      light: string;
      main: string;
      dark: string;
      darkPaper: string;
    };
    text: {
      lightPrimary: string;
      lightSecondary: string;
      darkPrimary: string;
      darkSecondary: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    round: string;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontFamily: {
    primary: string;
    code: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
    display: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  transitions: {
    quick: string;
    standard: string;
    slow: string;
    entrance: string;
  };
} 