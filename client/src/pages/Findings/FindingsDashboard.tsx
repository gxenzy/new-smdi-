import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, MenuItem } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Finding {
  _id?: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  auditId: string;
  createdBy?: string;
  createdAt?: string;
}

const typeOptions = ['Safety', 'Efficiency', 'Compliance', 'Other'];
const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FindingsDashboard: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createFinding, setCreateFinding] = useState<Partial<Finding>>({ type: 'Other', status: 'Open' });
  const [creating, setCreating] = useState(false);
  const [editFinding, setEditFinding] = useState<Finding | null>(null);
  const [editFields, setEditFields] = useState<Partial<Finding>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });

  const fetchFindings = () => {
    setLoading(true);
    setError(null);
    fetch('/api/findings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch findings');
        return res.json();
      })
      .then(data => {
        setFindings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFindings();
    // Real-time updates
    // @ts-ignore
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:5000');
      socket.on('findingUpdate', fetchFindings);
      socket.on('findingDelete', fetchFindings);
      return () => {
        socket.off('findingUpdate', fetchFindings);
        socket.off('findingDelete', fetchFindings);
        socket.disconnect();
      };
    });
  }, []);

  // Create
  const handleCreate = () => {
    setCreating(true);
    fetch('/api/findings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createFinding),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create finding');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Finding created!', severity: 'success' });
        setCreateFinding({ type: 'Other', status: 'Open' });
        fetchFindings();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setCreating(false));
  };

  // Edit
  const openEdit = (finding: Finding) => {
    setEditFinding(finding);
    setEditFields({ ...finding });
  };
  const handleEdit = () => {
    if (!editFinding) return;
    setEditLoading(true);
    fetch(`/api/findings/${editFinding._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update finding');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Finding updated!', severity: 'success' });
        setEditFinding(null);
        fetchFindings();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setEditLoading(false));
  };

  // Delete
  const handleDelete = (finding: Finding) => {
    setDeleteLoading(finding._id || '');
    fetch(`/api/findings/${finding._id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete finding');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Finding deleted!', severity: 'success' });
        fetchFindings();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setDeleteLoading(null));
  };

  // Analytics
  const typeCounts = findings.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const statusCounts = findings.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const typeData = Object.entries(typeCounts).map(([type, value]) => ({ name: type, value }));
  const statusData = Object.entries(statusCounts).map(([status, value]) => ({ name: status, value }));

  // Add export handlers
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(findings.map(({ _id, ...rest }) => rest));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Findings');
    XLSX.writeFile(wb, 'findings.xlsx');
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Findings', 14, 16);
    // Prepare data for autoTable
    const tableColumn = ['Title', 'Description', 'Type', 'Status', 'Audit ID'];
    const tableRows = findings.map(f => [f.title, f.description || '', f.type, f.status, f.auditId]);
    // @ts-ignore
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22 });
    doc.save('findings.pdf');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" gutterBottom>Findings Management</Typography>
      {/* Create Finding Form */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Create New Finding</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, flexWrap: 'wrap' }}>
          <TextField label="Title" value={createFinding.title || ''} onChange={e => setCreateFinding(f => ({ ...f, title: e.target.value }))} size="small" inputProps={{ 'aria-label': 'Finding Title' }} fullWidth={true} />
          <TextField label="Description" value={createFinding.description || ''} onChange={e => setCreateFinding(f => ({ ...f, description: e.target.value }))} size="small" inputProps={{ 'aria-label': 'Finding Description' }} fullWidth={true} />
          <TextField select label="Type" value={createFinding.type || 'Other'} onChange={e => setCreateFinding(f => ({ ...f, type: e.target.value }))} size="small" inputProps={{ 'aria-label': 'Finding Type' }} fullWidth={true}>
            {typeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={createFinding.status || 'Open'} onChange={e => setCreateFinding(f => ({ ...f, status: e.target.value }))} size="small" inputProps={{ 'aria-label': 'Finding Status' }} fullWidth={true}>
            {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField label="Audit ID" value={createFinding.auditId || ''} onChange={e => setCreateFinding(f => ({ ...f, auditId: e.target.value }))} size="small" inputProps={{ 'aria-label': 'Audit ID' }} fullWidth={true} />
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating || !createFinding.title || !createFinding.auditId} aria-label="Create Finding">
            {creating ? 'Creating...' : 'Create Finding'}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6">Findings by Type</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {typeData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6">Findings by Status</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {statusData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleExportExcel} aria-label="Export to Excel">Export to Excel</Button>
          <Button variant="outlined" onClick={handleExportPDF} aria-label="Export to PDF">Export to PDF</Button>
        </Box>
        <Typography variant="h6">All Findings</Typography>
        <List>
          {findings.map(finding => (
            <ListItem key={finding._id} secondaryAction={
              <>
                <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openEdit(finding)} aria-label={`Edit finding ${finding.title}`}>Edit</Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(finding)} disabled={deleteLoading === finding._id} aria-label={`Delete finding ${finding.title}`}>
                  {deleteLoading === finding._id ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            }>
              <ListItemText
                primary={finding.title}
                secondary={
                  <>
                    <span>Type: {finding.type}</span><br />
                    <span>Status: {finding.status}</span><br />
                    <span>Audit ID: {finding.auditId}</span><br />
                    {finding.description && <span>Description: {finding.description}</span>}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Edit Finding Modal */}
      <Dialog open={!!editFinding} onClose={() => setEditFinding(null)} aria-labelledby="edit-finding-dialog-title">
        <DialogTitle id="edit-finding-dialog-title">Edit Finding</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { xs: 200, sm: 300 } }}>
          <TextField label="Title" value={editFields.title || ''} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} inputProps={{ 'aria-label': 'Edit Title' }} fullWidth />
          <TextField label="Description" value={editFields.description || ''} onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))} inputProps={{ 'aria-label': 'Edit Description' }} fullWidth />
          <TextField select label="Type" value={editFields.type || 'Other'} onChange={e => setEditFields(f => ({ ...f, type: e.target.value }))} inputProps={{ 'aria-label': 'Edit Type' }} fullWidth>
            {typeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={editFields.status || 'Open'} onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))} inputProps={{ 'aria-label': 'Edit Status' }} fullWidth>
            {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField label="Audit ID" value={editFields.auditId || ''} onChange={e => setEditFields(f => ({ ...f, auditId: e.target.value }))} inputProps={{ 'aria-label': 'Edit Audit ID' }} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFinding(null)} aria-label="Cancel Edit">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editFields.title || !editFields.auditId} aria-label="Save Edit">
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FindingsDashboard; 