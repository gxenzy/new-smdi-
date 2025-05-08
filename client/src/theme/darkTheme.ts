import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    success: { main: '#00e676' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
});

export default darkTheme; 