import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Help & Support</DialogTitle>
    <DialogContent>
      <Typography variant="body1">
        Welcome to the Energy Audit Analytics dashboard!<br/>
        Use the wizard for a guided tour, or hover over tooltips for more info.<br/>
        For further help, contact your administrator.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default HelpDialog; 