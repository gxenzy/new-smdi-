import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { User, UserRole } from '../../types';

const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Default credentials for demo purposes
const DEFAULT_CREDENTIALS = [
  { email: 'admin@example.com', password: 'admin123', name: 'Admin User' },
  { email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
];

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.MANAGER, label: 'Manager' },
  { value: UserRole.AUDITOR, label: 'Auditor' },
];

const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN, team: 'Demo' },
  { id: '2', name: 'Demo User', email: 'demo@example.com', password: 'demo123', role: UserRole.AUDITOR, team: 'Demo' },
  { id: '3', name: 'Admin User', email: 'admin@admin.com', password: 'admin123', role: UserRole.ADMIN, team: 'Admin' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { login } = useAuthContext();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleUseDemo = () => {
    formik.setValues(DEFAULT_CREDENTIALS[0]);
    setSelectedRole(UserRole.ADMIN);
    setShowDemo(true);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value as UserRole);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        dispatch(loginStart());
        const user = mockUsers.find(u => u.email === values.email && u.password === values.password);
        if (user) {
          const mockUser: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team,
            notifications: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const mockToken = 'mock-jwt-token';
          dispatch(loginSuccess({ token: mockToken, user: mockUser }));
          login(mockUser.email, values.password);
          navigate('/dashboard');
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Login failed. Please check your credentials.';
        dispatch(loginFailure(errorMessage));
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              py: 4,
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              SMDI
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: 'white', opacity: 0.9 }}
            >
              Smart Monitoring Device Integration
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 3, sm: 6 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {showDemo && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Using demo credentials: 
                <br />
                Email: {DEFAULT_CREDENTIALS[0].email}
                <br />
                Password: {DEFAULT_CREDENTIALS[0].password}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              Demo Users:<br />
              <b>{DEFAULT_CREDENTIALS[0].email}</b> / <b>{DEFAULT_CREDENTIALS[0].password}</b> &nbsp;|&nbsp; <b>{DEFAULT_CREDENTIALS[1].email}</b> / <b>{DEFAULT_CREDENTIALS[1].password}</b> (role selectable below)
            </Alert>

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
            >
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
                disabled={loading}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 3 }}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={selectedRole}
                  label="Role"
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  height: 48,
                  position: 'relative',
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                ) : (
                  'Login'
                )}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  formik.setValues(DEFAULT_CREDENTIALS[0]);
                  setSelectedRole(UserRole.ADMIN);
                  setShowDemo(true);
                }}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                Use Demo Credentials (Admin)
              </Button>
            </Box>

            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ mt: 3 }}
            >
              Only authorized personnel can access this system.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
