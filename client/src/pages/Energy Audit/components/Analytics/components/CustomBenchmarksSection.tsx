import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomBenchmark } from '../../../../../types/energy-audit';

interface Props {
  benchmarks: CustomBenchmark[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<CustomBenchmark>) => void;
  onDelete: (id: string) => void;
}

const CustomBenchmarksSection: React.FC<Props> = ({
  benchmarks,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Custom Benchmarks</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add Benchmark
          </Button>
        </Box>
        <List>
          {benchmarks.map(benchmark => (
            <ListItem
              key={benchmark.id}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => onUpdate(benchmark.id, benchmark)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(benchmark.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={benchmark.name}
                secondary={`Lighting: ${benchmark.lighting}%, HVAC: ${benchmark.hvac}%, Power: ${benchmark.power}W`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CustomBenchmarksSection; 