import { createTheme } from '@mui/material/styles';

const gradientTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a355e' },
    secondary: { main: '#3bb54a' },
    success: { main: '#00b894' },
    background: {
      default: 'linear-gradient(135deg, #456789 0%, #3bb54a 100%)',
      paper: '#fff',
    },
    text: {
      primary: '#1a355e',
      secondary: '#3bb54a',
    },
  },
});

export default gradientTheme; 