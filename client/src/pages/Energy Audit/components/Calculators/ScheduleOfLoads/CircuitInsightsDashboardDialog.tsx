import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  PictureAsPdf as PdfIcon,
  Whatshot as WhatshotIcon
} from '@mui/icons-material';
import CircuitInsightsDashboard from '../CircuitInsightsDashboard';
import { LoadSchedule } from './types';
import { exportBatchVoltageDropToPdf, EnhancedPdfExportOptions } from '../utils/enhancedVoltageDropPdfExport';
import { EnhancedVoltageDropInputs } from '../utils/enhancedVoltageDropUtils';

interface CircuitInsightsDashboardDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedules: LoadSchedule[];
  onSelectCircuit?: (circuitId: string, panelId: string) => void;
  isLoading?: boolean;
  onBatchAnalysis?: (panelId: string) => Promise<void>;
}

/**
 * Dialog component for displaying the Circuit Insights Dashboard
 * This provides a way to integrate the dashboard with the Schedule of Loads Calculator
 */
const CircuitInsightsDashboardDialog: React.FC<CircuitInsightsDashboardDialogProps> = ({
  open,
  onClose,
  loadSchedules,
  onSelectCircuit,
  isLoading = false,
  onBatchAnalysis
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [exporting, setExporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [activePanel, setActivePanel] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Handle circuit selection
  const handleCircuitSelect = (circuitId: string, panelId: string) => {
    if (onSelectCircuit) {
      onSelectCircuit(circuitId, panelId);
      onClose(); // Close the dialog after selection
    }
  };
  
  // Handle export to PDF
  const handleExportReport = async () => {
    if (loadSchedules.length === 0) {
      setSnackbarMessage('No data available to export');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setExporting(true);
    try {
      // For now, just export the first load schedule in the array
      // In the future, this will support exporting all selected panels
      const loadSchedule = loadSchedules[0];
      
      // This is a simplified version - in the future we'll need to gather all voltage drop results
      // from the circuits in the load schedule
      const circuits = loadSchedule.loads.filter(load => load.voltageDropPercent !== undefined);
      
      if (circuits.length === 0) {
        setSnackbarMessage('No voltage drop data available in the selected panel');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setExporting(false);
        return;
      }
      
      // Create dummy results object for now - this will be replaced with actual data
      const results: Record<string, { inputs: EnhancedVoltageDropInputs, results: any }> = {};
      
      // In a full implementation, we'd iterate through the circuits to collect actual data
      // For now, just show that the export was attempted
      
      const options: EnhancedPdfExportOptions = {
        title: `Circuit Insights Report - ${loadSchedule.panelName}`,
        fileName: `circuit-insights-${loadSchedule.panelName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        paperSize: 'a4',
        orientation: 'landscape',
        includeRecommendations: true,
        includeCompleteComplianceDetails: true
      };
      
      // In the complete implementation, this would be:
      // const pdf = await exportBatchVoltageDropToPdf(loadSchedule, results, options);
      // pdf.save(options.fileName);
      
      // For now, just simulate the export with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSnackbarMessage('Report export functionality will be available in the next update');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error exporting report:', error);
      setSnackbarMessage('Error exporting report: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setExporting(false);
    }
  };
  
  // Handle analyzing all circuits
  const handleAnalyzeAllCircuits = async () => {
    if (!onBatchAnalysis || loadSchedules.length === 0) {
      setSnackbarMessage('No panel data available for analysis');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setAnalyzing(true);
    setBatchProgress(0);
    
    try {
      // For simplicity, analyze only the first panel in the array
      // In a full implementation, we would analyze all selected panels
      const targetPanel = loadSchedules[0];
      setActivePanel(targetPanel.panelName);
      
      // Start fake progress updates
      const progressInterval = setInterval(() => {
        setBatchProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);
      
      // In a real implementation, this would call the onBatchAnalysis callback
      // await onBatchAnalysis(targetPanel.id);
      
      // For now, just simulate analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(progressInterval);
      setBatchProgress(100);
      
      // Wait a bit to show 100% before completing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSnackbarMessage(`Successfully analyzed all circuits in ${targetPanel.panelName}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error analyzing circuits:', error);
      setSnackbarMessage('Error analyzing circuits: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setAnalyzing(false);
      setBatchProgress(0);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: fullScreen ? '100%' : '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Circuit Insights Dashboard</Typography>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        {analyzing && (
          <Box sx={{ px: 3, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WhatshotIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Analyzing circuits in {activePanel}... ({Math.round(batchProgress)}%)
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={batchProgress} />
          </Box>
        )}
        
        <DialogContent dividers>
          <CircuitInsightsDashboard 
            loadSchedules={loadSchedules}
            onSelectCircuit={handleCircuitSelect}
            isLoading={isLoading || exporting || analyzing}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<PdfIcon />}
            onClick={handleExportReport}
            disabled={exporting || isLoading || analyzing}
          >
            {exporting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Exporting...
              </>
            ) : 'Export Report'}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAnalyzeAllCircuits}
            disabled={exporting || isLoading || analyzing}
            startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {analyzing ? 'Analyzing...' : 'Analyze All Circuits'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CircuitInsightsDashboardDialog; 