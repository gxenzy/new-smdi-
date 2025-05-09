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
  FormControlLabel,
  Switch,
  DialogContentText,
  Snackbar as MuiSnackbar,
  Pagination,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  SaveAlt as ExportIcon,
} from '@mui/icons-material';
import { User, UserRole } from '../../types';
import { useSocket } from '../../contexts/SocketContext';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridRowModel, GridToolbar, GridRowSelectionModel, GridRowEditStartParams, GridRowEditStopParams } from '@mui/x-data-grid';

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

interface UserPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  password?: string;
  is_active?: boolean;
}

const UserManagement: React.FC = () => {
  const { user, hasRole } = useAuthContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.MANAGER,
    password: '',
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(20);
  const [auditCount, setAuditCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: null | (() => void); message: string }>({ open: false, action: null, message: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [userPage, setUserPage] = useState(1);
  const [userLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userApiError, setUserApiError] = useState<string | null>(null);
  const [auditApiError, setAuditApiError] = useState<string | null>(null);
  const [selectedAuditUser, setSelectedAuditUser] = useState<UserData | null>(null);

  const socket = useSocket();

  useEffect(() => {
    if (!hasRole(UserRole.ADMIN)) {
      setError('Access denied. Admins only.');
      setLoading(false);
      return;
    }
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
        setUserApiError(null);
      })
      .catch((err) => {
        setUserApiError(err?.response?.data?.message || 'Failed to load users');
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (hasRole(UserRole.ADMIN)) {
      setAuditLoading(true);
      axios.get(`/api/audit-logs?page=${auditPage}&limit=${auditLimit}`)
        .then(res => {
          setAuditLogs(res.data.logs);
          setAuditCount(res.data.count);
          setAuditLoading(false);
          setAuditApiError(null);
        })
        .catch((err) => {
          setAuditApiError(err?.response?.data?.message || 'Failed to load audit logs');
          setAuditLoading(false);
        });
    }
  }, [user, auditPage, auditLimit]);

  const openDialogWithUser = (user: UserData | null) => {
    if (user) {
      setForm({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: '',
        is_active: user.status === 'active',
      });
    } else {
      setForm({ username: '', firstName: '', lastName: '', email: '', role: UserRole.MANAGER, password: '', is_active: true });
    }
    setFormError(null);
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleAddUser = () => openDialogWithUser(null);
  const handleEditUser = (user: UserData) => openDialogWithUser(user);

  const handleFormChange = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDialogSave = async () => {
    if (!form.username || !form.email || !form.role || (!editingUser && !form.password)) {
      setFormError('All fields are required.');
      return;
    }
    setFormError(null);
    const payload: UserPayload = { ...form, status: form.is_active ? 'active' : 'inactive' };
    if (editingUser && !form.password) {
      const { password, ...rest } = payload;
      await handleSaveUser(rest);
    } else {
      await handleSaveUser(payload);
    }
  };

  const openConfirmDialog = (action: () => void, message: string) => {
    setConfirmDialog({ open: true, action, message });
  };

  const handleConfirm = () => {
    if (confirmDialog.action) confirmDialog.action();
    setConfirmDialog({ open: false, action: null, message: '' });
  };

  const handleCancel = () => setConfirmDialog({ open: false, action: null, message: '' });

  const handleDeleteUser = async (userId: string) => {
    openConfirmDialog(async () => {
      try {
        await axios.delete(`/api/users/${userId}`);
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
      }
    }, 'Are you sure you want to delete this user?');
  };

  const handleToggleStatus = async (userId: string) => {
    openConfirmDialog(async () => {
      try {
        await axios.patch(`/api/users/${userId}/toggle-status`);
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
        ));
        setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
      }
    }, 'Are you sure you want to toggle this user\'s status?');
  };

  const handleSaveUser = async (formData: any) => {
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, formData);
        setUsers(prev => prev.map(user =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        ));
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        const res = await axios.post('/api/users', formData);
        setUsers(prev => [...prev, res.data]);
        setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
      }
      setOpenDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save user', severity: 'error' });
    }
  };

  const getRoleChip = (role: UserRole) => {
    const roleColors: Record<UserRole, 'error' | 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning'> = {
      [UserRole.ADMIN]: 'error',
      [UserRole.MANAGER]: 'primary',
      [UserRole.AUDITOR]: 'secondary',
      [UserRole.REVIEWER]: 'info',
      [UserRole.VIEWER]: 'default',
      [UserRole.STAFF]: 'success',
      [UserRole.MODERATOR]: 'warning',
      [UserRole.USER]: 'default'
    };

    return (
      <Chip
        label={role}
        color={roleColors[role]}
        size="small"
      />
    );
  };

  useEffect(() => {
    socket.on('userActivity', (event) => {
      if (event.action === 'created') {
        setUsers(prev => [...prev, {
          ...event.user,
          id: event.user.id || Math.random().toString(36).substr(2, 9),
          status: event.user.status || 'active',
        }]);
      } else if (event.action === 'updated') {
        setUsers(prev => prev.map(user =>
          user.id === (event.user.id) ? { ...user, ...event.user } : user
        ));
      }
    });
    socket.on('userDelete', (userId) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
    });
    return () => {
      socket.off('userActivity');
      socket.off('userDelete');
    };
  }, [socket]);

  const filteredUsers = users.filter(user =>
    (roleFilter ? user.role === roleFilter : true) &&
    (statusFilter ? user.status === statusFilter : true) &&
    (
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };
  const handleBulkDelete = async () => {
    await Promise.all(selectedUsers.map(id => handleDeleteUser(id)));
    setSelectedUsers([]);
  };
  const handleBulkToggleStatus = async () => {
    await Promise.all(selectedUsers.map(id => handleToggleStatus(id)));
    setSelectedUsers([]);
  };

  const paginatedUsers = users.slice((userPage - 1) * userLimit, userPage * userLimit);

  const exportToCSV = (data: any[], filename: string) => {
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(data[0] || {});
    const csv = [
      header.join(','),
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 150, renderCell: (params) => getRoleChip(params.value) },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'lastLogin', headerName: 'Last Login', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton size="small" onClick={() => handleEditUser(params.row)}><EditIcon /></IconButton>
          <IconButton size="small" onClick={() => handleDeleteUser(params.row.id)}><DeleteIcon /></IconButton>
          <IconButton size="small" onClick={() => handleToggleStatus(params.row.id)}><LockIcon /></IconButton>
        </>
      )
    }
  ];

  const handleRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const updatedUser = { ...oldRow, ...newRow };
    handleSaveUser(updatedUser);
    return updatedUser;
  };

  const handleRowEditStart = (params: GridRowEditStartParams, event: React.SyntheticEvent) => {
    // Implement row edit start logic if needed
  };

  const handleRowEditStop = (params: GridRowEditStopParams) => {
    // Implement row edit stop logic if needed
  };

  const CustomToolbar = () => {
    return <GridToolbar />;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(UserRole).map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Tooltip title="Export Users as CSV">
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => exportToCSV(filteredUsers, 'users.csv')}
              disabled={filteredUsers.length === 0}
            >
              Export
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
          {selectedUsers.length > 0 && (
            <>
              <Button variant="outlined" color="error" onClick={handleBulkDelete}>Bulk Delete</Button>
              <Button variant="outlined" onClick={handleBulkToggleStatus}>Bulk Toggle Status</Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pagination
          initialState={{
            pagination: { paginationModel: { pageSize: userLimit, page: 0 } }
          }}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(ids) => {
            const selectedIds = Array.isArray(ids) ? ids : [ids];
            setSelectedUsers(selectedIds.map(id => String(id)));
          }}
          processRowUpdate={handleRowUpdate}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          slots={{ toolbar: CustomToolbar }}
          getRowId={(row: any) => row.id}
        />
      </Box>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(users.length / userLimit)}
          page={userPage}
          onChange={(_, value) => setUserPage(value)}
          color="primary"
        />
      </Box>

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
              value={form.username}
              onChange={e => handleFormChange('username', e.target.value)}
            />
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={e => handleFormChange('firstName', e.target.value)}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={e => handleFormChange('lastName', e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={e => handleFormChange('email', e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={e => handleFormChange('role', e.target.value)}
              >
                <MenuItem value={UserRole.ADMIN}>{UserRole.ADMIN}</MenuItem>
                <MenuItem value={UserRole.MANAGER}>{UserRole.MANAGER}</MenuItem>
                <MenuItem value={UserRole.AUDITOR}>{UserRole.AUDITOR}</MenuItem>
                <MenuItem value={UserRole.REVIEWER}>{UserRole.REVIEWER}</MenuItem>
                <MenuItem value={UserRole.VIEWER}>{UserRole.VIEWER}</MenuItem>
                <MenuItem value={UserRole.STAFF}>{UserRole.STAFF}</MenuItem>
                <MenuItem value={UserRole.MODERATOR}>{UserRole.MODERATOR}</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={form.is_active} onChange={e => handleFormChange('is_active', e.target.checked)} />}
              label="Active"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={e => handleFormChange('password', e.target.value)}
              placeholder={editingUser ? 'Leave blank to keep current password' : ''}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDialogSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Log Viewer */}
      {hasRole(UserRole.ADMIN) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Audit Log</Typography>
          <Tooltip title="Export Audit Logs as CSV">
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => exportToCSV(auditLogs, 'audit-logs.csv')}
              disabled={auditLogs.length === 0}
              sx={{ mb: 2 }}
            >
              Export
            </Button>
          </Tooltip>
          {auditLoading ? (
            <Card><CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={32} sx={{ mb: 1 }} />
              ))}
            </CardContent></Card>
          ) : auditApiError ? (
            <Alert severity="error">{auditApiError}</Alert>
          ) : (
            <>
              <Card>
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            <TableCell>{log.username || 'System'}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell><pre style={{ margin: 0, fontSize: 12 }}>{log.details}</pre></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1}>Prev</Button>
                <Typography>Page {auditPage} of {Math.ceil(auditCount / auditLimit) || 1}</Typography>
                <Button onClick={() => setAuditPage(p => p + 1)} disabled={auditPage * auditLimit >= auditCount}>Next</Button>
              </Box>
            </>
          )}
        </Box>
      )}

      <MuiSnackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog open={confirmDialog.open} onClose={handleCancel}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedAuditUser} onClose={() => setSelectedAuditUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log for {selectedAuditUser?.username}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.filter(log => log.userId === selectedAuditUser?.id).map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell><pre style={{ margin: 0, fontSize: 12 }}>{log.details}</pre></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAuditUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
