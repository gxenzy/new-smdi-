import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import type { DigitalSignature } from '../../../../../types/energy-audit';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (signature: Partial<DigitalSignature>) => void;
  userName: string;
  userRole: string;
}

const SignatureDialog: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  userName,
  userRole,
}) => {
  const signatureRef = React.useRef<SignatureCanvas>(null);
  const [comments, setComments] = React.useState('');

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSave = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      onSave({
        userName,
        userRole,
        signatureData,
        comments,
        timestamp: new Date().toISOString(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Digital Signature</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              backgroundColor: '#fff',
            }}
          >
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas',
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog; 