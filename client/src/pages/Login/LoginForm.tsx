import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const { login, error: authError } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use theme palette for gradients and accents
  const gradientBg = `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`;
  const buttonGradient = `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`;
  const buttonHoverGradient = `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, sm: 2 } }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: theme.shadows[8],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(2px)',
            maxWidth: { xs: '95vw', sm: 400 },
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.dark,
              letterSpacing: 1,
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }}
          >
            COMPAT
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{
              color: theme.palette.secondary.dark,
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Compliance Audit Tool
          </Typography>
          {(error || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || authError}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', mt: 1 }}
          >
            <TextField
              fullWidth
              label="Username or Student ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                background: buttonGradient,
                color: '#fff',
                boxShadow: theme.shadows[2],
                borderRadius: 2,
                '&:hover': {
                  background: buttonHoverGradient,
                },
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm; 