import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { CustomBenchmark } from '../types';

interface CustomBenchmarkDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (benchmark: CustomBenchmark) => void;
}

export const CustomBenchmarkDialog: React.FC<CustomBenchmarkDialogProps> = ({ open, onClose, onAdd }) => {
  const [newBenchmark, setNewBenchmark] = React.useState<Partial<CustomBenchmark>>({
    name: '',
    lighting: 85,
    hvac: 90,
    power: 10500,
    description: '',
  });

  const handleAdd = () => {
    const benchmark: CustomBenchmark = {
      id: Date.now().toString(),
      name: newBenchmark.name || 'New Benchmark',
      lighting: newBenchmark.lighting || 85,
      hvac: newBenchmark.hvac || 90,
      power: newBenchmark.power || 10500,
      description: newBenchmark.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(benchmark);
    setNewBenchmark({});
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Benchmark</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Benchmark Name"
            value={newBenchmark.name}
            onChange={e => setNewBenchmark({ ...newBenchmark, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Lighting Efficiency (%)"
            type="number"
            value={newBenchmark.lighting}
            onChange={e => setNewBenchmark({ ...newBenchmark, lighting: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="HVAC Efficiency (%)"
            type="number"
            value={newBenchmark.hvac}
            onChange={e => setNewBenchmark({ ...newBenchmark, hvac: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Power Usage (W)"
            type="number"
            value={newBenchmark.power}
            onChange={e => setNewBenchmark({ ...newBenchmark, power: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Description"
            value={newBenchmark.description}
            onChange={e => setNewBenchmark({ ...newBenchmark, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">Add Benchmark</Button>
      </DialogActions>
    </Dialog>
  );
}; 