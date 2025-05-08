import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#00ADB5' },      // Cyan/Teal
    secondary: { main: '#30475E' },    // Deep Blue
    background: {
      default: 'linear-gradient(135deg, #222831 0%, #30475E 100%)',
      paper: '#EEEEEE',
    },
    text: {
      primary: '#222831',
      secondary: '#30475E',
    },
    success: { main: '#FFD369' },      // Gold
    info: { main: '#0077B6' },         // Royal Blue
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { color: '#222831' },
    h6: { color: '#30475E' },
  },
  shape: { borderRadius: 12 },
}); 