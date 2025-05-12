import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { CustomBenchmark } from '../../../../../types/energy-audit';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (benchmark: CustomBenchmark) => void;
}

const CustomBenchmarkDialog: React.FC<Props> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [form, setForm] = useState<Omit<CustomBenchmark, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    lighting: 0,
    hvac: 0,
    power: 0,
    description: '',
  });

  const handleSubmit = () => {
    const newBenchmark: CustomBenchmark = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(newBenchmark);
    setForm({
      name: '',
      lighting: 0,
      hvac: 0,
      power: 0,
      description: '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Custom Benchmark</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lighting Efficiency (%)"
              type="number"
              value={form.lighting}
              onChange={(e) => setForm({ ...form, lighting: Number(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="HVAC Efficiency (%)"
              type="number"
              value={form.hvac}
              onChange={(e) => setForm({ ...form, hvac: Number(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Power Usage (W)"
              type="number"
              value={form.power}
              onChange={(e) => setForm({ ...form, power: Number(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!form.name}>
          Add Benchmark
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomBenchmarkDialog; 