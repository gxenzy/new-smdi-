import React from 'react';
import {
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// Types
interface ValidationError {
  [key: string]: string | null;
}

interface StandardValue {
  [key: string]: number;
}

interface Standard {
  power: StandardValue;
  lighting: StandardValue;
  hvac: StandardValue;
}

interface ComplianceHistoryItem {
  date: string;
  standard: string;
  compliant: boolean;
}

// Props types
interface ValidationSummaryProps {
  category: 'power' | 'lighting' | 'hvac';
  errors: ValidationError;
}

interface StandardComparisonProps {
  category: 'power' | 'lighting' | 'hvac';
  standards: Array<{ label: string; value: string }>;
  defaultStandards: { [key: string]: Standard };
}

interface ComplianceHistoryProps {
  category: 'power' | 'lighting' | 'hvac';
  history: ComplianceHistoryItem[];
}

// Components
export const ValidationSummary: React.FC<ValidationSummaryProps> = ({ category, errors }) => {
  const hasErrors = Object.values(errors).some(error => error !== null);
  if (!hasErrors) return null;

  return (
    <Alert severity="error" sx={{ mt: 1 }}>
      <Typography variant="subtitle2">Validation Errors:</Typography>
      <List dense>
        {Object.entries(errors).map(([field, error]) => (
          error && (
            <ListItem key={field}>
              <ListItemIcon>
                <ErrorIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={error as string} />
            </ListItem>
          )
        ))}
      </List>
    </Alert>
  );
};

export const StandardComparison: React.FC<StandardComparisonProps> = ({ category, standards, defaultStandards }) => {
  const getValue = (standard: string, field: string) => {
    return defaultStandards[standard][category][field];
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Standard Comparison:</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Standard</TableCell>
            {Object.keys(defaultStandards.ashrae2019[category]).map(field => (
              <TableCell key={field}>{field}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {standards.map(standard => (
            <TableRow key={standard.value}>
              <TableCell>{standard.label}</TableCell>
              {Object.keys(defaultStandards.ashrae2019[category]).map(field => (
                <TableCell key={field}>{getValue(standard.value, field)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export const ComplianceHistory: React.FC<ComplianceHistoryProps> = ({ category, history }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Recent Compliance History:</Typography>
      <List dense>
        {history.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {item.compliant ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
            </ListItemIcon>
            <ListItemText
              primary={`${new Date(item.date).toLocaleDateString()} - ${item.standard}`}
              secondary={item.compliant ? 'Compliant' : 'Non-compliant'}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export const HelpDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Energy Audit Testing Help</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>Standards Selection</Typography>
        <Typography paragraph>
          Choose from predefined standards or set custom values. Each standard has specific requirements for power usage, lighting, and HVAC systems.
        </Typography>
        <Typography variant="h6" gutterBottom>Manual Values</Typography>
        <Typography paragraph>
          When using manual values, ensure they fall within the recommended ranges. The system will validate your inputs and provide feedback.
        </Typography>
        <Typography variant="h6" gutterBottom>Compliance Checking</Typography>
        <Typography paragraph>
          The system automatically checks compliance against the selected standard. Results are saved in the compliance history.
        </Typography>
        <Typography variant="h6" gutterBottom>Export Options</Typography>
        <Typography paragraph>
          Export your test results in CSV or PDF format for reporting and documentation purposes.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 