import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useEnergyAuditHistory } from './EnergyAuditHistoryContext';

interface TestApprovalPanelProps {
  userRole: 'admin' | 'auditor' | 'reviewer';
  userName: string;
}

const TestApprovalPanel: React.FC<TestApprovalPanelProps> = ({ userRole, userName }) => {
  const { testHistory, updateTestStatus } = useEnergyAuditHistory();
  const [selectedTest, setSelectedTest] = React.useState<string | null>(null);
  const [approvalNote, setApprovalNote] = React.useState('');

  const canApprove = userRole === 'admin' || userRole === 'reviewer';

  const handleApprove = (id: string) => {
    if (canApprove) {
      updateTestStatus(id, 'approved', userName);
      setSelectedTest(null);
      setApprovalNote('');
    }
  };

  const handleReject = (id: string) => {
    if (canApprove) {
      updateTestStatus(id, 'rejected', userName);
      setSelectedTest(null);
      setApprovalNote('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Test Approvals
          {!canApprove && (
            <Chip
              label="View Only"
              color="info"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>

        <List>
          {testHistory
            .filter(test => test.status === 'pending')
            .map(test => (
              <ListItem key={test.id}>
                <ListItemText
                  primary={`${test.testType.toUpperCase()} Test - ${new Date(test.date).toLocaleDateString()}`}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        Standard: {test.standard}
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span">
                        Results: {JSON.stringify(test.results)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={getStatusIcon(test.status)}
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                    {canApprove && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => setSelectedTest(test.id)}
                        >
                          Review
                        </Button>
                      </>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>

        <Dialog open={!!selectedTest} onClose={() => setSelectedTest(null)}>
          <DialogTitle>Review Test Results</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Approval Notes"
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedTest(null)}>Cancel</Button>
            <Button
              color="error"
              onClick={() => selectedTest && handleReject(selectedTest)}
            >
              Reject
            </Button>
            <Button
              color="success"
              onClick={() => selectedTest && handleApprove(selectedTest)}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TestApprovalPanel; 