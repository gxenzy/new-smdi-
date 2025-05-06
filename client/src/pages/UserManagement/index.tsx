import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { User, UserRole } from '../../types';

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: Date;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      status: 'active',
      lastLogin: new Date(),
    },
    {
      id: '2',
      username: 'moderator',
      firstName: 'Mod',
      lastName: 'User',
      email: 'mod@example.com',
      role: UserRole.MANAGER,
      status: 'active',
      lastLogin: new Date(),
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const handleAddUser = () => {
    setEditingUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    showAlertMessage('User deleted successfully', 'success');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const showAlertMessage = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSaveUser = (formData: any) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev =>
        prev.map(user =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        )
      );
      showAlertMessage('User updated successfully', 'success');
    } else {
      // Add new user
      const newUser: UserData = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        status: 'active',
      };
      setUsers(prev => [...prev, newUser]);
      showAlertMessage('User added successfully', 'success');
    }
    setOpenDialog(false);
  };

  const getRoleChip = (role: UserRole) => {
    const roleColors = {
      [UserRole.ADMIN]: 'error',
      [UserRole.MANAGER]: 'default',
    };

    return (
      <Chip
        label={role}
        color={roleColors[role] as any}
        size="small"
      />
    );
  };

  useEffect(() => {
    // If socket is needed, define it locally or mock it for now.
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {showAlert && (
        <Alert
          severity={alertSeverity}
          sx={{ mb: 2 }}
          onClose={() => setShowAlert(false)}
        >
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLogin?.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(user.id)}
                        sx={{ mr: 1 }}
                      >
                        {user.status === 'active' ? <LockIcon /> : <UnlockIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Username"
              defaultValue={editingUser?.username}
            />
            <TextField
              fullWidth
              label="First Name"
              defaultValue={editingUser?.firstName}
            />
            <TextField
              fullWidth
              label="Last Name"
              defaultValue={editingUser?.lastName}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={editingUser?.email}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                defaultValue={editingUser?.role || 'user'}
                label="Role"
              >
                <MenuItem value={UserRole.ADMIN}>{UserRole.ADMIN}</MenuItem>
                <MenuItem value={UserRole.MANAGER}>{UserRole.MANAGER}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleSaveUser({})} // Add form data here
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
