import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUserContext } from '../../contexts/UserContext';
import { UserRole } from '../../types';

const UserTeamManagement: React.FC = () => {
  const { users, setCurrentUser, currentUser } = useUserContext();
  const [form, setForm] = useState({ name: '', email: '', role: UserRole.AUDITOR, team: '' });
  const [userList, setUserList] = useState(users);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleAdd = () => {
    if (!form.name || !form.email || !form.role || !form.team) return;
    setUserList(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        ...form,
      },
    ]);
    setForm({ name: '', email: '', role: UserRole.AUDITOR, team: '' });
  };

  const handleDelete = (id: string) => {
    setUserList(prev => prev.filter(u => u.id !== id));
  };

  // Group users by team
  const teams = Array.from(new Set(userList.map(u => u.team).filter(Boolean)));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>User & Team Management</Typography>
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1">Add User</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} size="small" />
            <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} size="small" />
            <TextField label="Role" select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} size="small">
              <MenuItem value={UserRole.AUDITOR}>Auditor</MenuItem>
              <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
            </TextField>
            <TextField label="Team" value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} size="small" />
            <Button variant="contained" onClick={handleAdd}>Add</Button>
          </Box>
        </Paper>
      )}
      {teams.map(team => (
        <Box key={team} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{team}</Typography>
          <Paper sx={{ p: 2 }}>
            <List>
              {userList.filter(u => u.team === team).map(u => (
                <ListItem key={u.id} secondaryAction={
                  isAdmin && (
                    <IconButton edge="end" color="error" onClick={() => handleDelete(u.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }>
                  <ListItemText
                    primary={`${u.name} (${u.role})`}
                    secondary={u.email}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      ))}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1">All Users</Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {userList.map(u => (
            <ListItem key={u.id} secondaryAction={
              isAdmin && (
                <IconButton edge="end" color="error" onClick={() => handleDelete(u.id)}>
                  <DeleteIcon />
                </IconButton>
              )
            }>
              <ListItemText
                primary={`${u.name} (${u.role})`}
                secondary={`Email: ${u.email} | Team: ${u.team}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default UserTeamManagement; 