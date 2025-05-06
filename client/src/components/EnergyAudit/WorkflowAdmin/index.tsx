import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { useEnergyAudit } from '../../../pages/EnergyAudit/EnergyAuditContext';

interface WorkflowAdminProps {
  workflowStages: string[];
  onAddStage: (stage: string) => void;
  onRemoveStage: (stage: string) => void;
  isAdmin: boolean;
}

const WorkflowAdmin: React.FC<WorkflowAdminProps> = ({
  workflowStages,
  onAddStage,
  onRemoveStage,
  isAdmin,
}) => {
  const { reminderDays, escalationDays, setReminderDays, setEscalationDays } = useEnergyAudit();
  const [newStage, setNewStage] = useState('');
  const [error, setError] = useState('');

  const handleAddStage = () => {
    if (!newStage.trim()) {
      setError('Stage name cannot be empty');
      return;
    }
    if (workflowStages.includes(newStage.trim())) {
      setError('Stage already exists');
      return;
    }
    onAddStage(newStage.trim());
    setNewStage('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStage();
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Workflow Stages Management
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add new stage"
          error={!!error}
          helperText={error}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          onClick={handleAddStage}
          disabled={!newStage.trim()}
        >
          Add Stage
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {workflowStages.map((stage) => (
          <Chip
            key={stage}
            label={stage}
            onDelete={workflowStages.length > 1 ? () => onRemoveStage(stage) : undefined}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>

      {workflowStages.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No workflow stages defined. Add at least one stage to enable the workflow.
        </Alert>
      )}

      {isAdmin && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Reminder Days"
            type="number"
            value={reminderDays ?? 2}
            onChange={e => setReminderDays && setReminderDays(Number(e.target.value))}
            size="small"
            inputProps={{ min: 1 }}
            helperText="Days before sending reminder for pending approval"
          />
          <TextField
            label="Escalation Days"
            type="number"
            value={escalationDays ?? 5}
            onChange={e => setEscalationDays && setEscalationDays(Number(e.target.value))}
            size="small"
            inputProps={{ min: 1 }}
            helperText="Days before escalation for overdue approval"
          />
        </Box>
      )}
    </Box>
  );
};

export default WorkflowAdmin; 