import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { DigitalSignature } from '../types';

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (signature: DigitalSignature) => void;
  userRole: string;
  userName: string;
}

export const SignatureDialog: React.FC<SignatureDialogProps> = ({
  open,
  onClose,
  onSign,
  userRole,
  userName,
}) => {
  const [signature, setSignature] = React.useState('');
  const [comments, setComments] = React.useState('');

  const handleSign = () => {
    if (signature) {
      onSign({
        id: Date.now().toString(),
        userId: 'current-user-id',
        userName,
        userRole,
        timestamp: new Date().toISOString(),
        signatureData: signature,
        comments,
      });
      setSignature('');
      setComments('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Digital Signature</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="subtitle2">Sign below:</Typography>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              height: 200,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Signature pad will be implemented here
            </Typography>
          </Box>
          <TextField
            label="Comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSign}
          variant="contained"
          startIcon={<VerifiedIcon />}
          disabled={!signature}
        >
          Sign & Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 