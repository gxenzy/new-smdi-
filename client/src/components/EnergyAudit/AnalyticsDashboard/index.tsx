import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Button, Snackbar, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Finding, ActivityLogEntry } from '../../../types/energy-audit';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface Props {
  findings: Finding[];
  activityLog: ActivityLogEntry[];
}

const AnalyticsDashboard: React.FC<Props> = ({ findings, activityLog }) => {
  // Most active users (by comment count)
  const userCommentCounts: Record<string, number> = {};
  findings.forEach(finding => {
    finding.comments.forEach((comment: any) => {
      userCommentCounts[comment.author] = (userCommentCounts[comment.author] || 0) + 1;
    });
  });
  const mostActiveUsers = Object.entries(userCommentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most active users (by activity log)
  const userActivityCounts: Record<string, number> = {};
  activityLog.forEach(log => {
    if (log.user) {
      userActivityCounts[log.user as string] = (userActivityCounts[log.user as string] || 0) + 1;
    }
  });
  const mostActiveLogUsers = Object.entries(userActivityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most common actions
  const actionCounts: Record<string, number> = {};
  activityLog.forEach((log: any) => {
    if (log.action) {
      actionCounts[log.action as string] = (actionCounts[log.action as string] || 0) + 1;
    }
  });
  const mostCommonActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Comment counts per finding (bar chart)
  const commentCountsData = findings.map(finding => ({
    id: finding.id,
    description: finding.description.slice(0, 20) + (finding.description.length > 20 ? '...' : ''),
    comments: finding.comments.length,
  }));

  // Activity over time (line chart)
  const activityByDate: Record<string, number> = {};
  activityLog.forEach(log => {
    const date = log.timestamp.slice(0, 10);
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });
  const activityOverTimeData = Object.entries(activityByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // SLA tracking: average time in each workflow stage
  const approvalStages = ['Draft', 'Pending Review', 'Manager Approval', 'Final Approval', 'Approved', 'Rejected'];
  const avgStageTimes = approvalStages.map(stage => {
    const times: number[] = [];
    findings.forEach(f => {
      if (f.activityLog) {
        const stageEntries = f.activityLog.filter((a: any) => a.action === 'Approval Status Changed' && a.details && a.details.includes(stage));
        if (stageEntries.length > 0) {
          const first = stageEntries[0];
          const prev = f.activityLog.find((a: any) => a.timestamp < first.timestamp && a.action === 'Approval Status Changed');
          if (prev) {
            times.push(new Date(first.timestamp).getTime() - new Date(prev.timestamp).getTime());
          }
        }
      }
    });
    const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    return { stage, avgMs: avg };
  });
  const bottleneck = avgStageTimes.reduce((max, s) => (s.avgMs > max.avgMs ? s : max), { stage: '', avgMs: 0 });

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Energy Audit Analytics Report', 14, 18);
    doc.setFontSize(12);
    let y = 30;
    doc.text('Most Active Users (Comments):', 14, y);
    y += 6;
    findings.forEach(f => {
      f.comments.forEach((c: any) => {
        doc.text(`${c.author}: ${c.text}`, 16, y);
        y += 6;
      });
    });
    y += 4;
    doc.text('Most Active Users (Activity Log):', 14, y);
    y += 6;
    activityLog.forEach((a: any) => {
      doc.text(`${a.user}: ${a.action} (${a.timestamp})`, 16, y);
      y += 6;
    });
    y += 4;
    doc.text('Most Common Actions:', 14, y);
    y += 6;
    Object.entries(actionCounts).forEach(([action, count]) => {
      doc.text(`${action}: ${count}`, 16, y);
      y += 6;
    });
    y += 4;
    doc.text('SLA Tracking & Bottleneck Detection:', 14, y);
    y += 6;
    doc.text('See dashboard for detailed SLA table.', 16, y);
    y += 6;
    doc.save('energy_audit_analytics.pdf');
  };

  // CSV Export
  const exportCSV = () => {
    let csv = 'User,Comment\n';
    findings.forEach(f => {
      f.comments.forEach((c: any) => {
        csv += `${c.author},"${c.text.replace(/"/g, '""')}"\n`;
      });
    });
    csv += '\nUser,Action,Timestamp\n';
    activityLog.forEach((a: any) => {
      csv += `${a.user},${a.action},${a.timestamp}\n`;
    });
    csv += '\nAction,Count\n';
    Object.entries(actionCounts).forEach(([action, count]) => {
      csv += `${action},${count}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'energy_audit_analytics.csv');
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success'|'error'>('success');

  // Integration: Send analytics summary to external API
  const sendToExternalAPI = async () => {
    try {
      const summary = {
        mostActiveUsers: mostActiveUsers,
        mostActiveLogUsers: mostActiveLogUsers,
        mostCommonActions: mostCommonActions,
        bottleneck,
      };
      // Simulate POST to external API
      await fetch('https://webhook.site/your-dummy-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      setSnackbarMsg('Analytics summary sent to external API!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg('Failed to send analytics to external API.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Integration: Send analytics summary via email (dummy endpoint)
  const sendEmail = async () => {
    try {
      const summary = {
        mostActiveUsers: mostActiveUsers,
        mostActiveLogUsers: mostActiveLogUsers,
        mostCommonActions: mostCommonActions,
        bottleneck,
      };
      // Simulate POST to email API
      await fetch('https://webhook.site/your-dummy-email-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'admin@example.com', subject: 'Energy Audit Analytics', summary }),
      });
      setSnackbarMsg('Analytics summary sent via email!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg('Failed to send analytics via email.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Simulate scheduling daily/weekly analytics reporting
  const scheduleReport = async (type: 'email' | 'webhook', frequency: 'daily' | 'weekly') => {
    try {
      // Simulate API call to schedule report
      await fetch('https://webhook.site/your-dummy-schedule-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, frequency }),
      });
      setSnackbarMsg(`Scheduled ${frequency} analytics report via ${type}.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg('Failed to schedule analytics report.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={exportPDF}>Export PDF</Button>
        <Button variant="outlined" onClick={exportCSV}>Export CSV</Button>
        <Button variant="contained" color="info" onClick={sendToExternalAPI}>Send to External API</Button>
        <Button variant="contained" color="secondary" onClick={sendEmail}>Send via Email</Button>
        <Button variant="outlined" color="primary" onClick={() => scheduleReport('email', 'daily')}>Schedule Daily Email</Button>
        <Button variant="outlined" color="primary" onClick={() => scheduleReport('email', 'weekly')}>Schedule Weekly Email</Button>
        <Button variant="outlined" color="info" onClick={() => scheduleReport('webhook', 'daily')}>Schedule Daily Webhook</Button>
        <Button variant="outlined" color="info" onClick={() => scheduleReport('webhook', 'weekly')}>Schedule Weekly Webhook</Button>
      </Box>
      <Typography variant="h6" gutterBottom>Analytics Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Most Active Users (Comments)</Typography>
            <List dense>
              {mostActiveUsers.map(([user, count]) => (
                <ListItem key={user}>
                  <ListItemText primary={user} secondary={`Comments: ${count}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Most Active Users (Activity Log)</Typography>
            <List dense>
              {mostActiveLogUsers.map(([user, count]) => (
                <ListItem key={user}>
                  <ListItemText primary={user} secondary={`Activity Entries: ${count}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Most Common Actions</Typography>
            <List dense>
              {mostCommonActions.map(([action, count]) => (
                <ListItem key={action}>
                  <ListItemText primary={action} secondary={`Count: ${count}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Comment Counts per Finding</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commentCountsData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="description" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="comments" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Activity Over Time</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* SLA Tracking and Bottleneck Detection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">SLA Tracking & Bottleneck Detection</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 4 }}>Stage</th>
                  <th style={{ textAlign: 'left', padding: 4 }}>Avg Time (hours)</th>
                </tr>
              </thead>
              <tbody>
                {avgStageTimes.map(s => (
                  <tr key={s.stage} style={bottleneck.stage === s.stage && s.avgMs > 0 ? { background: '#fff3e0' } : {}}>
                    <td style={{ padding: 4 }}>{s.stage}</td>
                    <td style={{ padding: 4 }}>{(s.avgMs / 3600000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bottleneck.stage && bottleneck.avgMs > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Bottleneck: <b>{bottleneck.stage}</b> (Avg {(bottleneck.avgMs / 3600000).toFixed(2)} hours)
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnalyticsDashboard; 