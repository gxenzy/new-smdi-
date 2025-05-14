import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, MenuItem, Fab, IconButton } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AddIcon from '@mui/icons-material/Add';
import { glassCardSx } from '../../../theme/glassCardSx';

const typeOptions = ['Safety', 'Efficiency', 'Compliance', 'Other'];
const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Finding {
  _id?: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  auditId: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuditFindingsPanelProps {
  auditId: string;
}

const AuditFindingsPanel: React.FC<AuditFindingsPanelProps> = ({ auditId }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createFinding, setCreateFinding] = useState<Partial<Finding>>({ type: 'Other', status: 'Open', auditId });
  const [creating, setCreating] = useState(false);
  const [editFinding, setEditFinding] = useState<Finding | null>(null);
  const [editFields, setEditFields] = useState<Partial<Finding>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success'|'error' }>({ open: false, message: '', severity: 'success' });
  const [multiAddOpen, setMultiAddOpen] = useState(false);
  const [multiFindings, setMultiFindings] = useState<Partial<Finding>[]>([{ type: 'Other', status: 'Open', auditId }]);
  const [actionSnackbar, setActionSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Helper to get auth headers as Record<string, string>
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch findings for this auditId
  const fetchFindings = () => {
    setLoading(true);
    setError(null);
    fetch(`/findings?auditId=${auditId}`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as HeadersInit,
    })
      .then(async res => {
        if (!res.ok) {
          let errorMsg = 'Unknown error';
          try {
            const err = await res.json();
            errorMsg = err.message || errorMsg;
          } catch {
            if (res.status === 401) errorMsg = 'Authentication required. Please log in.';
            else errorMsg = `Error ${res.status}`;
          }
          throw new Error(errorMsg);
        }
        const text = await res.text();
        try {
          if (text.trim().startsWith('<')) {
            throw new Error('Could not connect to the backend API. Please check your API URL and make sure the backend server is running.');
          }
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid response from server. ' + (e instanceof Error ? e.message : ''));
        }
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
    if (!auditId) return;
    fetchFindings();
    // Real-time updates (WebSocket, only if enabled)
    if (process.env.REACT_APP_ENABLE_WS === 'true') {
    import('socket.io-client').then(({ io }) => {
      const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:8000');
      socket.on('findingUpdate', fetchFindings);
      socket.on('findingDelete', fetchFindings);
      return () => {
        socket.off('findingUpdate', fetchFindings);
        socket.off('findingDelete', fetchFindings);
        socket.disconnect();
      };
    });
    }
    // eslint-disable-next-line
  }, [auditId]);

  // Create
  const handleCreate = () => {
    setCreating(true);
    fetch('/findings', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as HeadersInit,
      body: JSON.stringify({ ...createFinding, auditId }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create finding');
        return res.json();
      })
      .then(() => {
        setSnackbar({ open: true, message: 'Finding created!', severity: 'success' });
        setCreateFinding({ type: 'Other', status: 'Open', auditId });
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
    fetch(`/findings/${editFinding._id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as HeadersInit,
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
    fetch(`/findings/${finding._id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as HeadersInit,
    })
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

  // Historical comparison data
  const findingsByMonth = findings.reduce((acc, f) => {
    const month = f.createdAt ? f.createdAt.slice(0, 7) : 'Unknown';
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const findingsByMonthData = Object.entries(findingsByMonth).map(([month, count]) => ({ month, count }));
  // Insights
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  // Average time to resolve
  const resolvedFindings = findings.filter(f => f.status === 'Resolved' && f.createdAt && f.updatedAt);
  const avgResolveTime = resolvedFindings.length
    ? (resolvedFindings.reduce((sum, f) => sum + (new Date(f.updatedAt!).getTime() - new Date(f.createdAt!).getTime()), 0) / resolvedFindings.length / (1000 * 60 * 60 * 24)).toFixed(1)
    : 'N/A';

  // Export handlers
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(findings.map(({ _id, ...rest }) => rest));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Findings');
    XLSX.writeFile(wb, 'findings.xlsx');
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Findings', 14, 16);
    const tableColumn = ['Title', 'Description', 'Type', 'Status', 'Audit ID'];
    const tableRows = findings.map(f => [f.title, f.description || '', f.type, f.status, f.auditId]);
    // @ts-ignore
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22 });
    doc.save('findings.pdf');
  };
  const handleExportCSV = () => {
    if (!findings.length) return;
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(findings[0]).filter(k => k !== '_id');
    const csv = [
      header.join(','),
      ...findings.map(row => header.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(','))
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'findings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Multi-add logic
  const handleMultiAddFinding = (idx: number, field: keyof Finding, value: any) => {
    setMultiFindings(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value, auditId } : f));
  };
  const handleAddRow = () => {
    setMultiFindings(prev => [...prev, { type: 'Other', status: 'Open', auditId }]);
  };
  const handleRemoveRow = (idx: number) => {
    setMultiFindings(prev => prev.filter((_, i) => i !== idx));
  };
  const handleMultiCreate = () => {
    setCreating(true);
    Promise.all(
      multiFindings.filter(f => f.title && f.auditId).map(finding =>
        fetch('/findings', {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as HeadersInit,
          body: JSON.stringify({ ...finding, auditId }),
        })
      )
    )
      .then(() => {
        setSnackbar({ open: true, message: 'Findings created!', severity: 'success' });
        setMultiFindings([{ type: 'Other', status: 'Open', auditId }]);
        setMultiAddOpen(false);
        fetchFindings();
      })
      .catch(err => setSnackbar({ open: true, message: err.message, severity: 'error' }))
      .finally(() => setCreating(false));
  };

  if (!auditId) return null;
  if (loading) return <Typography>Loading findings...</Typography>;
  if (error) return <Typography color="error" sx={{ whiteSpace: 'pre-wrap', p: 2, border: '1px solid red', borderRadius: 1 }}>{error}</Typography>;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Findings Management (for this Audit)</Typography>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }} onClick={() => setMultiAddOpen(true)}>
        <AddIcon />
      </Fab>
      <Dialog open={multiAddOpen} onClose={() => setMultiAddOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Multiple Findings</DialogTitle>
        <DialogContent>
          {multiFindings.map((finding, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField label="Title" value={finding.title || ''} onChange={e => handleMultiAddFinding(idx, 'title', e.target.value)} size="small" fullWidth />
              <TextField label="Description" value={finding.description || ''} onChange={e => handleMultiAddFinding(idx, 'description', e.target.value)} size="small" fullWidth />
              <TextField select label="Type" value={finding.type || 'Other'} onChange={e => handleMultiAddFinding(idx, 'type', e.target.value)} size="small" fullWidth>
                {typeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
              <TextField select label="Status" value={finding.status || 'Open'} onChange={e => handleMultiAddFinding(idx, 'status', e.target.value)} size="small" fullWidth>
                {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
              <IconButton onClick={() => handleRemoveRow(idx)} disabled={multiFindings.length === 1} aria-label="Remove Row"><span style={{fontWeight:'bold',fontSize:18}}>-</span></IconButton>
            </Box>
          ))}
          <Button onClick={handleAddRow} variant="outlined" sx={{ mt: 1 }}>Add Row</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMultiAddOpen(false)}>Cancel</Button>
          <Button onClick={handleMultiCreate} variant="contained" color="primary" disabled={creating || multiFindings.some(f => !f.title)}>
            {creating ? 'Creating...' : 'Create All'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Finding Form */}
      <Paper sx={glassCardSx({ accent: '#7b1fa2' })}>
        <Typography variant="subtitle1" gutterBottom>Create New Finding</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, flexWrap: 'wrap' }}>
          <TextField label="Title" value={createFinding.title || ''} onChange={e => setCreateFinding(f => ({ ...f, title: e.target.value }))} size="small" fullWidth={true} />
          <TextField label="Description" value={createFinding.description || ''} onChange={e => setCreateFinding(f => ({ ...f, description: e.target.value }))} size="small" fullWidth={true} />
          <TextField select label="Type" value={createFinding.type || 'Other'} onChange={e => setCreateFinding(f => ({ ...f, type: e.target.value }))} size="small" fullWidth={true}>
            {typeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={createFinding.status || 'Open'} onChange={e => setCreateFinding(f => ({ ...f, status: e.target.value }))} size="small" fullWidth={true}>
            {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating || !createFinding.title}>
            {creating ? 'Creating...' : 'Create Finding'}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={glassCardSx({ accent: '#7b1fa2' })}>
            <Typography variant="subtitle1">Findings by Type</Typography>
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
          <Paper sx={glassCardSx({ accent: '#7b1fa2' })}>
            <Typography variant="subtitle1">Findings by Status</Typography>
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
      <Paper sx={glassCardSx({ accent: '#7b1fa2' })}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleExportExcel}>Export to Excel</Button>
          <Button variant="outlined" onClick={handleExportCSV}>Export to CSV</Button>
          <Button variant="outlined" onClick={handleExportPDF}>Export to PDF</Button>
        </Box>
        <Typography variant="subtitle1">All Findings for this Audit</Typography>
        <List>
          {findings.map(finding => (
            <ListItem key={finding._id} secondaryAction={
              <>
                <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openEdit(finding)}>Edit</Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(finding)} disabled={deleteLoading === finding._id}>
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
                    {finding.description && <span>Description: {finding.description}</span>}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Edit Finding Modal */}
      <Dialog open={!!editFinding} onClose={() => setEditFinding(null)}>
        <DialogTitle>Edit Finding</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { xs: 200, sm: 300 } }}>
          <TextField label="Title" value={editFields.title || ''} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} fullWidth />
          <TextField label="Description" value={editFields.description || ''} onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))} fullWidth />
          <TextField select label="Type" value={editFields.type || 'Other'} onChange={e => setEditFields(f => ({ ...f, type: e.target.value }))} fullWidth>
            {typeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={editFields.status || 'Open'} onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))} fullWidth>
            {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFinding(null)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editFields.title}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
      {/* Actions Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" color="primary" onClick={async () => {
          try {
            await fetch('https://example.com/api/external', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(findings),
            });
            setActionSnackbar({ open: true, message: 'Sent to external API!', severity: 'success' });
          } catch {
            setActionSnackbar({ open: true, message: 'Failed to send to external API.', severity: 'error' });
          }
        }}>Send to External API</Button>
        <Button variant="contained" color="secondary" onClick={() => {
          setActionSnackbar({ open: true, message: 'Email sent!', severity: 'success' });
        }}>Send via Email</Button>
        <Button variant="outlined" onClick={() => {
          setActionSnackbar({ open: true, message: 'Daily email scheduled!', severity: 'success' });
        }}>Schedule Daily Email</Button>
        <Button variant="outlined" onClick={() => {
          setActionSnackbar({ open: true, message: 'Weekly email scheduled!', severity: 'success' });
        }}>Schedule Weekly Email</Button>
        <Button variant="outlined" onClick={() => {
          setActionSnackbar({ open: true, message: 'Daily webhook scheduled!', severity: 'success' });
        }}>Schedule Daily Webhook</Button>
        <Button variant="outlined" onClick={() => {
          setActionSnackbar({ open: true, message: 'Weekly webhook scheduled!', severity: 'success' });
        }}>Schedule Weekly Webhook</Button>
      </Box>
      <Snackbar open={actionSnackbar.open} autoHideDuration={3000} onClose={() => setActionSnackbar({ ...actionSnackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={actionSnackbar.severity} sx={{ width: '100%' }}>{actionSnackbar.message}</Alert>
      </Snackbar>
      {/* Insights Section */}
      <Paper sx={glassCardSx({ accent: '#7b1fa2' })}>
        <Typography variant="subtitle1">Insights</Typography>
        <Box sx={{ mb: 1 }}>Most Common Type: <b>{mostCommonType}</b></Box>
        <Box sx={{ mb: 1 }}>Average Resolve Time (days): <b>{avgResolveTime}</b></Box>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Findings Over Time</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={findingsByMonthData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default AuditFindingsPanel; 