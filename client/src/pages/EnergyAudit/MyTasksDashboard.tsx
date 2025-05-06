import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Divider, Button } from '@mui/material';
import { useEnergyAudit, Finding } from './EnergyAuditContext';
import { useUserContext } from '../../contexts/UserContext';

const MyTasksDashboard: React.FC = () => {
  const { audit } = useEnergyAudit();
  const { currentUser } = useUserContext();
  const allFindings: Finding[] = [...audit.lighting, ...audit.hvac, ...audit.envelope];
  const myFindings = allFindings.filter(f => f.assignee === currentUser.name);

  const grouped = myFindings.reduce((acc, f) => {
    const key = `${f.status} | ${f.approvalStatus}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, Finding[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Assigned Findings</Typography>
      {Object.keys(grouped).length === 0 ? (
        <Typography>No findings assigned to you.</Typography>
      ) : (
        Object.entries(grouped).map(([group, findings]) => (
          <Paper key={group} sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6">{group}</Typography>
            <List>
              {findings.map(f => (
                <ListItem key={f.id} alignItems="flex-start">
                  <ListItemText
                    primary={f.description || '(No description)'}
                    secondary={
                      <>
                        <span>Section: <b>{f.section}</b></span><br/>
                        <span>Status: <Chip size="small" label={f.status} sx={{ mr: 1 }}/></span>
                        <span>Approval: <Chip size="small" label={f.approvalStatus} color={f.approvalStatus === 'Rejected' ? 'error' : f.approvalStatus === 'Approved' ? 'success' : 'default'} /></span><br/>
                        <span>Severity: <b>{f.severity}</b></span> | <span>Cost: ₱{f.estimatedCost.toLocaleString()}</span><br/>
                        <span>Created: {new Date(f.createdAt).toLocaleString()}</span>
                      </>
                    }
                  />
                  {/* Quick action: Go to section (could be improved with routing) */}
                  {/* <Button variant="outlined" size="small">View</Button> */}
                </ListItem>
              ))}
            </List>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default MyTasksDashboard; 