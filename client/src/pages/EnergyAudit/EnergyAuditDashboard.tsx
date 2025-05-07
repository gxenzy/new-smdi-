import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Audit {
  _id?: string;
  id?: string;
  name: string;
  status: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  findings?: string[];
  createdAt?: string;
}

const EnergyAuditDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalAudits: 0, pendingAudits: 0, completedAudits: 0 });
  const [audits, setAudits] = useState<Audit[]>([]);
  const [recentAudits, setRecentAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [createStatus, setCreateStatus] = useState('Pending');
  const [createDescription, setCreateDescription] = useState('');
  const [createAssignedTo, setCreateAssignedTo] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');
  const [createFindings, setCreateFindings] = useState('');
  const [creating, setCreating] = useState(false);
  const [editAudit, setEditAudit] = useState<Audit | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editFindings, setEditFindings] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  const fetchAudits = () => {
    setLoading(true);
    setError(null);
    fetch('/api/energy-audit')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch audits');
        return res.json();
      })
      .then(data => {
        setAudits(data);
        setStats({
          totalAudits: data.length,
          pendingAudits: data.filter((a: Audit) => a.status === 'Pending').length,
          completedAudits: data.filter((a: Audit) => a.status === 'Completed').length,
        });
        setRecentAudits(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAudits();
    // Real-time updates
    // @ts-ignore
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:5000');
      socket.on('energyAuditUpdate', fetchAudits);
      socket.on('energyAuditDelete', fetchAudits);
      return () => {
        socket.off('energyAuditUpdate', fetchAudits);
        socket.off('energyAuditDelete', fetchAudits);
        socket.disconnect();
      };
    });
  }, []);

  // Create
  const handleCreate = () => {
    setCreating(true);
    fetch('/api/energy-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: createName,
        status: createStatus,
        description: createDescription,
        assignedTo: createAssignedTo,
        dueDate: createDueDate || undefined,
        findings: createFindings.split(',').map(f => f.trim()).filter(Boolean),
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create audit');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Audit created!', severity: 'success' });
        setCreateName('');
        setCreateStatus('Pending');
        setCreateDescription('');
        setCreateAssignedTo('');
        setCreateDueDate('');
        setCreateFindings('');
        fetchAudits();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setCreating(false));
  };

  // Edit
  const openEdit = (audit: Audit) => {
    setEditAudit(audit);
    setEditName(audit.name);
    setEditStatus(audit.status);
    setEditDescription(audit.description || '');
    setEditAssignedTo(audit.assignedTo || '');
    setEditDueDate(audit.dueDate ? audit.dueDate.slice(0, 10) : '');
    setEditFindings((audit.findings || []).join(', '));
  };
  const handleEdit = () => {
    if (!editAudit) return;
    setEditLoading(true);
    fetch(`/api/energy-audit/${editAudit._id || editAudit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        status: editStatus,
        description: editDescription,
        assignedTo: editAssignedTo,
        dueDate: editDueDate || undefined,
        findings: editFindings.split(',').map(f => f.trim()).filter(Boolean),
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update audit');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Audit updated!', severity: 'success' });
        setEditAudit(null);
        fetchAudits();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setEditLoading(false));
  };

  // Delete
  const handleDelete = (audit: Audit) => {
    setDeleteLoading(audit._id || audit.id || '');
    fetch(`/api/energy-audit/${audit._id || audit.id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete audit');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Audit deleted!', severity: 'success' });
        fetchAudits();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setDeleteLoading(null));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Energy Audit Dashboard</Typography>
      {/* Create Audit Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Create New Audit</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Audit Name" value={createName} onChange={e => setCreateName(e.target.value)} size="small" />
          <TextField label="Description" value={createDescription} onChange={e => setCreateDescription(e.target.value)} size="small" />
          <TextField label="Assigned To" value={createAssignedTo} onChange={e => setCreateAssignedTo(e.target.value)} size="small" />
          <TextField label="Due Date" type="date" value={createDueDate} onChange={e => setCreateDueDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Findings (comma separated)" value={createFindings} onChange={e => setCreateFindings(e.target.value)} size="small" />
          <TextField
            select
            label="Status"
            value={createStatus}
            onChange={e => setCreateStatus(e.target.value)}
            SelectProps={{ native: true }}
            size="small"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </TextField>
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating || !createName}>
            {creating ? 'Creating...' : 'Create Audit'}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Total Audits</Typography>
            <Typography variant="h3">{stats.totalAudits}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Pending Audits</Typography>
            <Typography variant="h3" color="warning.main">{stats.pendingAudits}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Completed Audits</Typography>
            <Typography variant="h3" color="success.main">{stats.completedAudits}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Recent Audits</Typography>
        <List>
          {recentAudits.map(audit => (
            <ListItem key={audit._id || audit.id} secondaryAction={
              <>
                <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openEdit(audit)}>Edit</Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(audit)} disabled={deleteLoading === (audit._id || audit.id)}>
                  {deleteLoading === (audit._id || audit.id) ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            }>
              <ListItemText
                primary={audit.name || `Audit #${audit._id || audit.id}`}
                secondary={
                  <>
                    <span>Status: {audit.status}</span><br />
                    {audit.description && <span>Description: {audit.description}<br /></span>}
                    {audit.assignedTo && <span>Assigned To: {audit.assignedTo}<br /></span>}
                    {audit.dueDate && <span>Due: {audit.dueDate.slice(0, 10)}<br /></span>}
                    {audit.findings && audit.findings.length > 0 && <span>Findings: {audit.findings.join(', ')}<br /></span>}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary">Go to Reports</Button>
        <Button variant="outlined" color="secondary">Schedule New Audit</Button>
      </Box>
      {/* Edit Audit Modal */}
      <Dialog open={!!editAudit} onClose={() => setEditAudit(null)}>
        <DialogTitle>Edit Audit</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="Audit Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <TextField label="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
          <TextField label="Assigned To" value={editAssignedTo} onChange={e => setEditAssignedTo(e.target.value)} />
          <TextField label="Due Date" type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Findings (comma separated)" value={editFindings} onChange={e => setEditFindings(e.target.value)} />
          <TextField
            select
            label="Status"
            value={editStatus}
            onChange={e => setEditStatus(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAudit(null)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editName}>
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

export default EnergyAuditDashboard; 