import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuthContext } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';
import userServiceObj from '../../services/userService';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { User } from '../../types/index';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  department: Yup.string(),
  currentPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useAuthContext();
  const [editMode, setEditMode] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      department: currentUser?.department || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setSaveError(null);
        
        // Update user profile - only send the fields that have changed
        const userData: Partial<User> = {};
        
        if (values.name !== currentUser?.name) {
          userData.name = values.name;
        }
        
        if (values.email !== currentUser?.email) {
          userData.email = values.email;
        }
        
        if (values.department !== currentUser?.department) {
          userData.department = values.department;
        }
        
        // Only call updateUser if there are changes
        if (Object.keys(userData).length > 0) {
        const success = await updateUser(userData);
        
        if (success) {
          setSaveSuccess(true);
          setEditMode(false);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          throw new Error('Failed to update profile');
          }
        } else {
          setEditMode(false);
        }
      } catch (error: any) {
        setSaveError(error.message || 'Failed to update profile. Please try again.');
        setTimeout(() => setSaveError(null), 5000);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleChangePassword = async () => {
    try {
      if (!formik.values.currentPassword || !formik.values.newPassword) {
        setSaveError('Current password and new password are required');
        return;
      }
      
      if (formik.values.newPassword !== formik.values.confirmPassword) {
        setSaveError('New password and confirmation do not match');
        return;
      }
      
      setLoading(true);
      setSaveError(null);
      
      const success = await userService.changePassword(
        formik.values.currentPassword,
        formik.values.newPassword
      );
      
      if (success) {
        setPasswordDialog(false);
        setSaveSuccess(true);
        formik.setFieldValue('currentPassword', '');
        formik.setFieldValue('newPassword', '');
        formik.setFieldValue('confirmPassword', '');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to change password. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setImageLoading(true);
      setSaveError(null);
      
      const success = await userService.updateProfileImage(file);
      
      if (success) {
        // Force refresh of current user
        if (currentUser?.id) {
          const updatedUser = await userServiceObj.getUserById(currentUser.id);
          updateUser(updatedUser);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to update profile image');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update profile image. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setImageLoading(false);
    }
  };

  // If user data changes, update the form
  useEffect(() => {
    if (currentUser) {
      formik.setValues({
        ...formik.values,
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Profile</Typography>
        {editMode ? (
          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => setEditMode(false)}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={() => formik.handleSubmit()}
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Changes saved successfully!
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={currentUser.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    mb: 2,
                    mx: 'auto',
                  }}
                >
                  {currentUser?.name?.[0] || currentUser?.username?.[0]}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleProfileImageChange}
                  disabled={imageLoading}
                />
                <label htmlFor="profile-image-upload">
                <IconButton
                    component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                  }}
                    disabled={imageLoading}
                >
                    {imageLoading ? <CircularProgress size={24} /> : <PhotoIcon />}
                </IconButton>
                </label>
              </Box>
              <Typography variant="h6">
                {currentUser?.name || currentUser?.username}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {currentUser?.role}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setPasswordDialog(true)}
                sx={{ mt: 2 }}
                disabled={loading}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Profile Details" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name ? String(formik.errors.name) : ''}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email ? String(formik.errors.email) : ''}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={currentUser.username}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={currentUser.role}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    helperText={formik.touched.department && formik.errors.department ? String(formik.errors.department) : ''}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1">
                    {(currentUser as any)?.student_id || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {currentUser?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Role
                  </Typography>
                  <Typography variant="body1">
                    {currentUser?.role || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => !loading && setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
              helperText={formik.touched.currentPassword && formik.errors.currentPassword ? String(formik.errors.currentPassword) : ''}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              name="newPassword"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword ? String(formik.errors.newPassword) : ''}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword ? String(formik.errors.confirmPassword) : ''}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              loading ||
              !formik.values.currentPassword ||
              !formik.values.newPassword ||
              formik.values.newPassword !== formik.values.confirmPassword
            }
          >
            {loading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
