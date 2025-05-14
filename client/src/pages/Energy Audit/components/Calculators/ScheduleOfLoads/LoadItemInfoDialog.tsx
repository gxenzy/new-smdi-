import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import { LoadItem } from './types';

interface LoadItemInfoDialogProps {
  open: boolean;
  onClose: () => void;
  loadItem: LoadItem | null;
}

const LoadItemInfoDialog: React.FC<LoadItemInfoDialogProps> = ({ open, onClose, loadItem }) => {
  if (!loadItem) {
    return null;
  }

  const isPECCompliant = loadItem.isPECCompliant !== undefined ? loadItem.isPECCompliant : null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <BoltIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Load Item Details: {loadItem.description}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Basic Information
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                Quantity
              </Typography>
              <Typography variant="body1">
                {loadItem.quantity}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                Rating
              </Typography>
              <Typography variant="body1">
                {loadItem.rating} W
              </Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                Demand Factor
              </Typography>
              <Typography variant="body1">
                {loadItem.demandFactor}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                Circuit Breaker
              </Typography>
              <Typography variant="body1">
                {loadItem.circuitBreaker || "Not specified"}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                Conductor Size
              </Typography>
              <Typography variant="body1">
                {loadItem.conductorSize || "Not specified"}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Load Calculations
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Connected Load</TableCell>
                  <TableCell>Demand Load</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>VA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{loadItem.connectedLoad.toFixed(1)} W</TableCell>
                  <TableCell>{loadItem.demandLoad.toFixed(1)} W</TableCell>
                  <TableCell>{loadItem.current?.toFixed(2) || 'N/A'} A</TableCell>
                  <TableCell>{loadItem.voltAmpere?.toFixed(1) || 'N/A'} VA</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {loadItem.voltageDropPercent !== undefined && (
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Voltage Drop Analysis
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {isPECCompliant === true && (
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="PEC Compliant" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
              )}
              {isPECCompliant === false && (
                <Chip 
                  icon={<ErrorIcon />} 
                  label="Not PEC Compliant" 
                  color="error" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
              )}
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Voltage Drop</TableCell>
                    <TableCell>Voltage Drop %</TableCell>
                    <TableCell>Receiving End Voltage</TableCell>
                    <TableCell>Conductor Length</TableCell>
                    <TableCell>Optimal Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{loadItem.voltageDrop?.toFixed(2) || 'N/A'} V</TableCell>
                    <TableCell>{loadItem.voltageDropPercent?.toFixed(2) || 'N/A'} %</TableCell>
                    <TableCell>{loadItem.receivingEndVoltage?.toFixed(1) || 'N/A'} V</TableCell>
                    <TableCell>{loadItem.conductorLength || 'N/A'} m</TableCell>
                    <TableCell>{loadItem.optimalConductorSize || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {loadItem.voltageDropPercent !== undefined && loadItem.voltageDropPercent > 3 && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2">
                  <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  The voltage drop exceeds the PEC 2017 recommended limit of 3%. Consider using a larger conductor size.
                </Typography>
              </Box>
            )}
          </Paper>
        )}
        
        {loadItem.optimizationMetadata && (
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Optimization Recommendations
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`Priority: ${loadItem.optimizationMetadata.priority}`} 
                color={
                  loadItem.optimizationMetadata.priority === 'critical' ? 'error' :
                  loadItem.optimizationMetadata.priority === 'high' ? 'warning' :
                  loadItem.optimizationMetadata.priority === 'medium' ? 'info' : 'default'
                }
                size="small" 
                sx={{ mr: 1 }}
              />
            </Box>
            <Typography variant="body2" paragraph>
              {loadItem.optimizationMetadata.optimizationReason}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">
                  Material Cost Change
                </Typography>
                <Typography variant="body1">
                  {loadItem.optimizationMetadata.materialCostChange > 0 ? '+' : ''}
                  {loadItem.optimizationMetadata.materialCostChange.toFixed(2)} ₱
                </Typography>
              </Box>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">
                  Annual Energy Savings
                </Typography>
                <Typography variant="body1">
                  {loadItem.optimizationMetadata.energySavingsAnnual.toFixed(2)} kWh
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadItemInfoDialog; 