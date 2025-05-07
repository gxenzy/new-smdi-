import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, MenuItem, Avatar } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  _id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: string;
  active?: boolean;
  createdAt?: string;
}

const roleOptions = ['ADMIN', 'MODERATOR', 'STAFF', 'USER'];

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createUser, setCreateUser] = useState<Partial<User>>({ role: 'USER' });
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFields, setEditFields] = useState<Partial<User>>({});
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    // Real-time updates
    // @ts-ignore
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:5001');
      socket.on('userUpdate', fetchUsers);
      socket.on('userDelete', fetchUsers);
      return () => {
        socket.off('userUpdate', fetchUsers);
        socket.off('userDelete', fetchUsers);
        socket.disconnect();
      };
    });
  }, []);

  // Create
  const handleCreate = () => {
    setCreating(true);
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...createUser, password: createPassword }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'User created!', severity: 'success' });
        setCreateUser({ role: 'USER' });
        setCreatePassword('');
        fetchUsers();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setCreating(false));
  };

  // Edit
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditFields({ ...user });
    setEditPassword('');
  };
  const handleEdit = () => {
    if (!editUser) return;
    setEditLoading(true);
    fetch(`/api/users/${editUser._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editFields, ...(editPassword ? { password: editPassword } : {}) }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'User updated!', severity: 'success' });
        setEditUser(null);
        fetchUsers();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setEditLoading(false));
  };

  // Delete
  const handleDelete = (user: User) => {
    setDeleteLoading(user._id || '');
    fetch(`/api/users/${user._id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'User deleted!', severity: 'success' });
        fetchUsers();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setDeleteLoading(null));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      {/* Create User Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Create New User</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Username" value={createUser.username || ''} onChange={e => setCreateUser(u => ({ ...u, username: e.target.value }))} size="small" />
          <TextField label="Email" value={createUser.email || ''} onChange={e => setCreateUser(u => ({ ...u, email: e.target.value }))} size="small" />
          <TextField label="First Name" value={createUser.firstName || ''} onChange={e => setCreateUser(u => ({ ...u, firstName: e.target.value }))} size="small" />
          <TextField label="Last Name" value={createUser.lastName || ''} onChange={e => setCreateUser(u => ({ ...u, lastName: e.target.value }))} size="small" />
          <TextField label="Password" type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} size="small" />
          <TextField select label="Role" value={createUser.role || 'USER'} onChange={e => setCreateUser(u => ({ ...u, role: e.target.value }))} size="small">
            {roleOptions.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </TextField>
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating || !createUser.username || !createUser.email || !createUser.firstName || !createUser.lastName || !createPassword}>
            {creating ? 'Creating...' : 'Create User'}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">All Users</Typography>
            <List>
              {users.map(user => (
                <ListItem key={user._id} secondaryAction={
                  <>
                    <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openEdit(user)}>Edit</Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(user)} disabled={deleteLoading === user._id}>
                      {deleteLoading === user._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </>
                }>
                  <Avatar src={user.profileImage} sx={{ mr: 2 }}>{user.firstName?.[0]}</Avatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName} (${user.username})`}
                    secondary={
                      <>
                        <span>Email: {user.email}</span><br />
                        <span>Role: {user.role}</span><br />
                        <span>Status: {user.active ? 'Active' : 'Inactive'}</span><br />
                        {user.createdAt && <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      {/* Edit User Modal */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="Username" value={editFields.username || ''} onChange={e => setEditFields(f => ({ ...f, username: e.target.value }))} />
          <TextField label="Email" value={editFields.email || ''} onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))} />
          <TextField label="First Name" value={editFields.firstName || ''} onChange={e => setEditFields(f => ({ ...f, firstName: e.target.value }))} />
          <TextField label="Last Name" value={editFields.lastName || ''} onChange={e => setEditFields(f => ({ ...f, lastName: e.target.value }))} />
          <TextField label="Password (leave blank to keep)" type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
          <TextField select label="Role" value={editFields.role || 'USER'} onChange={e => setEditFields(f => ({ ...f, role: e.target.value }))}>
            {roleOptions.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editFields.username || !editFields.email || !editFields.firstName || !editFields.lastName}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard; 