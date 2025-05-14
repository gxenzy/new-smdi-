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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { VoltageDropInputs, COPPER_AMPACITY, ALUMINUM_AMPACITY } from './utils/voltageDropUtils';
import {
  processBatch,
  createConductorSizeVariations,
  createConductorLengthVariations,
  BatchCalculationJob,
  BatchCalculationResult
} from './utils/voltageDropBatchProcessing';

// Properties for the dialog component
interface BatchProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  baseInputs: VoltageDropInputs;
  onViewResults: (results: BatchCalculationResult[]) => void;
}

/**
 * Dialog for configuring and running batch calculations
 */
const BatchProcessingDialog: React.FC<BatchProcessingDialogProps> = ({
  open,
  onClose,
  baseInputs,
  onViewResults
}) => {
  // Batch type selection
  const [batchType, setBatchType] = useState<'conductor-size' | 'conductor-length'>('conductor-size');
  
  // Batch options for conductor size variations
  const [selectedConductorSizes, setSelectedConductorSizes] = useState<string[]>([]);
  
  // Batch options for conductor length variations
  const [lengthRange, setLengthRange] = useState({
    min: 10,
    max: 100,
    steps: 10
  });
  
  // Batch processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<BatchCalculationResult[]>([]);
  
  // Get available conductor sizes based on material
  const availableConductorSizes = React.useMemo(() => {
    const ampacityTable = baseInputs.conductorMaterial === 'copper' 
      ? COPPER_AMPACITY 
      : ALUMINUM_AMPACITY;
    return Object.keys(ampacityTable);
  }, [baseInputs.conductorMaterial]);
  
  // Reset selected sizes when available sizes change
  useEffect(() => {
    setSelectedConductorSizes([]);
  }, [availableConductorSizes]);
  
  // Handle conductor size selection
  const handleSizeToggle = (size: string) => {
    setSelectedConductorSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };
  
  // Handle length range change
  const handleLengthRangeChange = (field: 'min' | 'max' | 'steps') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10) || 0;
    setLengthRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Start batch processing
  const handleStartBatchProcessing = async () => {
    setIsProcessing(true);
    setProgress({ completed: 0, total: 0 });
    setResults([]);
    
    try {
      let jobs: BatchCalculationJob[] = [];
      
      // Create jobs based on selected batch type
      if (batchType === 'conductor-size' && selectedConductorSizes.length > 0) {
        jobs = createConductorSizeVariations(baseInputs, selectedConductorSizes);
      } else if (batchType === 'conductor-length') {
        const { min, max, steps } = lengthRange;
        jobs = createConductorLengthVariations(baseInputs, min, max, steps);
      }
      
      // Set total jobs for progress tracking
      setProgress({ completed: 0, total: jobs.length });
      
      // Process jobs
      const batchResults = await processBatch(jobs, {
        concurrentJobs: 4,
        onProgress: (completed, total) => {
          setProgress({ completed, total });
        },
        onJobComplete: (result) => {
          setResults(prev => [...prev, result]);
        }
      });
      
      // Update final results
      setResults(batchResults);
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // View batch results
  const handleViewResults = () => {
    onViewResults(results);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isProcessing ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Batch Processing
        {!isProcessing && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent>
        {isProcessing ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Calculations
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress.total ? (progress.completed / progress.total) * 100 : 0} 
              sx={{ my: 2 }}
            />
            <Typography variant="body2" align="center">
              {progress.completed} of {progress.total} calculations completed
            </Typography>
            
            {results.length > 0 && (
              <Paper sx={{ mt: 3, p: 2, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Results Preview
                </Typography>
                <List dense>
                  {results.map((result, index) => (
                    <ListItem key={result.jobId} divider={index < results.length - 1}>
                      <ListItemText
                        primary={`Job ${result.jobId}`}
                        secondary={`Voltage Drop: ${result.result.voltageDropPercent.toFixed(2)}%, Compliance: ${result.result.compliance}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Batch Type</InputLabel>
              <Select
                value={batchType}
                onChange={(e) => setBatchType(e.target.value as any)}
                label="Batch Type"
              >
                <MenuItem value="conductor-size">Conductor Size Variations</MenuItem>
                <MenuItem value="conductor-length">Conductor Length Variations</MenuItem>
              </Select>
            </FormControl>
            
            {batchType === 'conductor-size' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Conductor Sizes to Compare
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current size: {baseInputs.conductorSize}
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <FormGroup row>
                  <Grid container spacing={1}>
                    {availableConductorSizes.map((size) => (
                      <Grid item xs={4} sm={3} md={2} key={size}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedConductorSizes.includes(size)}
                              onChange={() => handleSizeToggle(size)}
                            />
                          }
                          label={size}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {selectedConductorSizes.length} sizes selected
                </Typography>
              </Box>
            )}
            
            {batchType === 'conductor-length' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Configure Length Range
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current length: {baseInputs.conductorLength} m
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Minimum Length (m)"
                      type="number"
                      fullWidth
                      value={lengthRange.min}
                      onChange={handleLengthRangeChange('min')}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Maximum Length (m)"
                      type="number"
                      fullWidth
                      value={lengthRange.max}
                      onChange={handleLengthRangeChange('max')}
                      InputProps={{ inputProps: { min: lengthRange.min + 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Number of Steps"
                      type="number"
                      fullWidth
                      value={lengthRange.steps}
                      onChange={handleLengthRangeChange('steps')}
                      InputProps={{ inputProps: { min: 2, max: 50 } }}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  This will generate {lengthRange.steps} calculations with lengths from {lengthRange.min}m to {lengthRange.max}m
                </Typography>
              </Box>
            )}
            
            {results.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Previous Results Available
                </Typography>
                <Typography variant="body2">
                  You have {results.length} results from a previous batch calculation.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {isProcessing ? (
          <Button 
            onClick={handleViewResults} 
            disabled={results.length === 0}
            startIcon={<CompareArrowsIcon />}
          >
            View Results
          </Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            
            {results.length > 0 && (
              <Button 
                onClick={handleViewResults}
                startIcon={<CompareArrowsIcon />}
              >
                View Previous Results
              </Button>
            )}
            
            <Button 
              onClick={handleStartBatchProcessing} 
              variant="contained" 
              color="primary"
              disabled={
                (batchType === 'conductor-size' && selectedConductorSizes.length === 0) ||
                (batchType === 'conductor-length' && (
                  lengthRange.min >= lengthRange.max || 
                  lengthRange.steps < 2
                ))
              }
              startIcon={<DownloadIcon />}
            >
              Start Batch Processing
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BatchProcessingDialog; 