import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const mockReports = [
  { id: 1, title: 'Q1 2024 Energy Audit', date: '2024-04-01', status: 'Completed' },
  { id: 2, title: 'Q2 2024 Energy Audit', date: '2024-07-01', status: 'In Progress' },
  { id: 3, title: 'Special Audit - March', date: '2024-03-15', status: 'Completed' },
];

const EnergyAuditReport: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Energy Audit Reports</Typography>
      <Paper sx={{ p: 3 }}>
        <List>
          {mockReports.map(report => (
            <ListItem key={report.id} secondaryAction={
              <>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>Download</Button>
                <Button variant="contained" size="small">View Details</Button>
              </>
            }>
              <ListItemText
                primary={report.title}
                secondary={`Date: ${report.date} | Status: ${report.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default EnergyAuditReport; 