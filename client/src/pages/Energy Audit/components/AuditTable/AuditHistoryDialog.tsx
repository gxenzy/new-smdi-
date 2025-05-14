import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface AuditHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  auditId: number;
  history: { timestamp: string; data: any }[];
  onRestore: (versionIdx: number) => void;
}

const AuditHistoryDialog: React.FC<AuditHistoryDialogProps> = ({ open, onClose, auditId, history, onRestore }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Audit History</DialogTitle>
      <DialogContent>
        {history.length === 0 ? (
          <Typography>No history available for this audit.</Typography>
        ) : (
          <List>
            {history.map((h, idx) => (
              <ListItem key={idx} divider secondaryAction={
                <Button variant="outlined" size="small" onClick={() => onRestore(idx)}>
                  Restore
                </Button>
              }>
                <ListItemText
                  primary={`Version ${history.length - idx}`}
                  secondary={h.timestamp}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditHistoryDialog; 