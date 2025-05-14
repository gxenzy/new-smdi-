import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  FormHelperText,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  ElectricalServices as ElectricalServicesIcon
} from '@mui/icons-material';
import { LoadItem, CIRCUIT_TYPE_OPTIONS, CIRCUIT_BREAKER_OPTIONS, CONDUCTOR_SIZE_OPTIONS } from './types';
import { recommendCircuitComponents } from '../utils/pecComplianceUtils';

interface CircuitDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  loadItem: LoadItem | null;
  onSave: (updatedLoadItem: LoadItem) => void;
  systemVoltage: number;
}

const CircuitDetailsDialog: React.FC<CircuitDetailsDialogProps> = ({
  open,
  onClose,
  loadItem,
  onSave,
  systemVoltage
}) => {
  const [updatedItem, setUpdatedItem] = useState<LoadItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<{
    breakerSize: string;
    conductorSize: string;
  } | null>(null);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (loadItem) {
      setUpdatedItem({
        ...loadItem,
        circuitDetails: loadItem.circuitDetails || {
          type: 'lighting',
          poles: 1,
          phase: 'A',
          wireType: 'THHN_COPPER',
          maxVoltageDropAllowed: 3 // Default 3% per PEC 2017
        }
      });

      // Calculate recommended components
      if (loadItem.current) {
        const isContinuous = loadItem.circuitDetails?.type === 'lighting';
        const rec = recommendCircuitComponents(
          loadItem.current,
          isContinuous,
          loadItem.circuitDetails?.wireType?.includes('COPPER') ? 'copper' : 'aluminum'
        );
        setRecommendations(rec);
      }
    }
  }, [loadItem]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    if (!updatedItem) return;

    // For circuit details
    if (field.startsWith('circuitDetails.')) {
      const detailField = field.split('.')[1];
      setUpdatedItem({
        ...updatedItem,
        circuitDetails: {
          ...updatedItem.circuitDetails!,
          [detailField]: value
        }
      });
    } else {
      // For regular fields
      setUpdatedItem({
        ...updatedItem,
        [field]: value
      });
    }

    // Clear any error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Update recommendations when circuit type or wire type changes
  useEffect(() => {
    if (updatedItem?.current && updatedItem.circuitDetails) {
      const isContinuous = updatedItem.circuitDetails.type === 'lighting';
      const rec = recommendCircuitComponents(
        updatedItem.current,
        isContinuous,
        updatedItem.circuitDetails.wireType?.includes('COPPER') ? 'copper' : 'aluminum'
      );
      setRecommendations(rec);
    }
  }, [updatedItem?.circuitDetails?.type, updatedItem?.circuitDetails?.wireType, updatedItem?.current]);

  // Handle save button click
  const handleSave = () => {
    if (!updatedItem) return;

    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!updatedItem.circuitBreaker) {
      newErrors['circuitBreaker'] = 'Circuit breaker size is required';
    }
    
    if (!updatedItem.conductorSize) {
      newErrors['conductorSize'] = 'Conductor size is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save changes
    onSave(updatedItem);
    onClose();
  };

  // If no load item is provided, don't render
  if (!updatedItem) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Circuit Details: {updatedItem.description}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Enter circuit details to enable PEC 2017 compliance checking.
            This information is required for accurate compliance analysis and recommendations.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Circuit Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors['circuitBreaker']}>
              <InputLabel>Circuit Breaker Size</InputLabel>
              <Select
                value={updatedItem.circuitBreaker || ''}
                label="Circuit Breaker Size"
                onChange={(e) => handleChange('circuitBreaker', e.target.value)}
              >
                {CIRCUIT_BREAKER_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              {recommendations && (
                <FormHelperText>
                  Recommended: {recommendations.breakerSize}
                </FormHelperText>
              )}
              {errors['circuitBreaker'] && (
                <FormHelperText error>{errors['circuitBreaker']}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors['conductorSize']}>
              <InputLabel>Conductor Size</InputLabel>
              <Select
                value={updatedItem.conductorSize || ''}
                label="Conductor Size"
                onChange={(e) => handleChange('conductorSize', e.target.value)}
              >
                {CONDUCTOR_SIZE_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              {recommendations && (
                <FormHelperText>
                  Recommended: {recommendations.conductorSize}
                </FormHelperText>
              )}
              {errors['conductorSize'] && (
                <FormHelperText error>{errors['conductorSize']}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Circuit Details for PEC Compliance
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Circuit Type</InputLabel>
              <Select
                value={updatedItem.circuitDetails?.type || 'lighting'}
                label="Circuit Type"
                onChange={(e) => handleChange('circuitDetails.type', e.target.value)}
              >
                {CIRCUIT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Used for demand factor and safety factors in PEC 2017
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Wire Type</InputLabel>
              <Select
                value={updatedItem.circuitDetails?.wireType || 'THHN_COPPER'}
                label="Wire Type"
                onChange={(e) => handleChange('circuitDetails.wireType', e.target.value)}
              >
                <MenuItem value="THHN_COPPER">THHN Copper</MenuItem>
                <MenuItem value="THWN_COPPER">THWN Copper</MenuItem>
                <MenuItem value="XHHW_COPPER">XHHW Copper</MenuItem>
                <MenuItem value="THHN_ALUMINUM">THHN Aluminum</MenuItem>
                <MenuItem value="THWN_ALUMINUM">THWN Aluminum</MenuItem>
                <MenuItem value="XHHW_ALUMINUM">XHHW Aluminum</MenuItem>
              </Select>
              <FormHelperText>
                Affects ampacity ratings per PEC 2017 Table 2.5
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Number of Poles</InputLabel>
              <Select
                value={updatedItem.circuitDetails?.poles || 1}
                label="Number of Poles"
                onChange={(e) => handleChange('circuitDetails.poles', Number(e.target.value))}
              >
                <MenuItem value={1}>1 Pole</MenuItem>
                <MenuItem value={2}>2 Pole</MenuItem>
                <MenuItem value={3}>3 Pole</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select
                value={updatedItem.circuitDetails?.phase || 'A'}
                label="Phase"
                onChange={(e) => handleChange('circuitDetails.phase', e.target.value)}
              >
                <MenuItem value="A">Phase A</MenuItem>
                <MenuItem value="B">Phase B</MenuItem>
                <MenuItem value="C">Phase C</MenuItem>
                <MenuItem value="A-B">Phase A-B</MenuItem>
                <MenuItem value="B-C">Phase B-C</MenuItem>
                <MenuItem value="C-A">Phase C-A</MenuItem>
                <MenuItem value="A-B-C">Three Phase (A-B-C)</MenuItem>
              </Select>
              <FormHelperText>
                Used for phase balance analysis
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Maximum Voltage Drop (%)"
              type="number"
              value={updatedItem.circuitDetails?.maxVoltageDropAllowed || 3}
              onChange={(e) => handleChange('circuitDetails.maxVoltageDropAllowed', Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 5, step: 0.5 } }}
              helperText="PEC 2017 recommends 3% for branch circuits"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Conductor Length (m)"
              type="number"
              value={updatedItem.conductorLength || 0}
              onChange={(e) => handleChange('conductorLength', Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              helperText="Required for voltage drop calculations"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          startIcon={<ElectricalServicesIcon />}
        >
          Save Circuit Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CircuitDetailsDialog; 