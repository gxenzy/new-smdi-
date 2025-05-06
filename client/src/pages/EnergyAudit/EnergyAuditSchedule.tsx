import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useScheduleContext } from './EnergyAuditScheduleContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNotificationContext } from '../../contexts/NotificationContext';

const EnergyAuditSchedule: React.FC = () => {
  const { audits, addAudit, deleteAudit } = useScheduleContext();
  const { users } = useUserContext();
  const { addNotification } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', location: '', team: '' });

  const handleAdd = () => {
    if (!form.name || !form.date || !form.location || !form.team) return;
    addAudit(form);
    addNotification({
      message: `Audit "${form.name}" scheduled for ${form.date} at ${form.location}.`,
      type: 'info',
    });
    setForm({ name: '', date: '', location: '', team: '' });
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Audit Schedule</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Schedule New Audit</Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        <List>
          {audits.length === 0 && <ListItem><ListItemText primary="No scheduled audits." /></ListItem>}
          {audits.map(audit => (
            <ListItem key={audit.id} secondaryAction={
              <IconButton edge="end" color="error" onClick={() => deleteAudit(audit.id)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText
                primary={`${audit.name} (${audit.status})`}
                secondary={`Date: ${new Date(audit.date).toLocaleString()} | Location: ${audit.location} | Team: ${audit.team}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Schedule New Audit</DialogTitle>
        <DialogContent>
          <TextField
            label="Audit Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Date & Time"
            type="datetime-local"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Team"
            select
            value={form.team}
            onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Array.from(new Set(users.map(u => u.team).filter(Boolean))).map(team => (
              <MenuItem key={team} value={team}>{team}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnergyAuditSchedule; 