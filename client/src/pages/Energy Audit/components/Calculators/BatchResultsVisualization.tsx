import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';
import { BatchCalculationResult } from './utils/voltageDropBatchProcessing';
import { getPDFExportService } from '../../../../utils/reportGenerator/PDFExporter';

// Properties for the batch results visualization component
interface BatchResultsVisualizationProps {
  results: BatchCalculationResult[];
  onExportPDF?: () => void;
  onClose?: () => void;
}

/**
 * Component to visualize batch processing results
 */
const BatchResultsVisualization: React.FC<BatchResultsVisualizationProps> = ({
  results,
  onExportPDF,
  onClose
}) => {
  // Tab control
  const [activeTab, setActiveTab] = useState(0);
  
  // Chart references
  const lineChartRef = useRef<ChartJS | null>(null);
  const barChartRef = useRef<ChartJS | null>(null);
  
  // Chart configuration
  const [chartConfig, setChartConfig] = useState({
    dataPoint: 'voltageDropPercent',
    sortBy: 'none'
  });
  
  // Determine if we're comparing conductor sizes or lengths
  const isConductorSizeComparison = React.useMemo(() => {
    if (results.length < 2) return false;
    
    // Check if all conductor sizes are the same
    const firstSize = results[0].result.wireRating.ampacity;
    return !results.every(r => r.result.wireRating.ampacity === firstSize);
  }, [results]);
  
  // Extract labels and data for charts
  const lineChartData = React.useMemo(() => {
    if (results.length === 0) return { labels: [], datasets: [] };
    
    let sortedResults = [...results];
    
    // Apply sorting if needed
    if (chartConfig.sortBy === 'voltageDropAsc') {
      sortedResults.sort((a, b) => a.result.voltageDropPercent - b.result.voltageDropPercent);
    } else if (chartConfig.sortBy === 'voltageDropDesc') {
      sortedResults.sort((a, b) => b.result.voltageDropPercent - a.result.voltageDropPercent);
    }
    
    // Determine labels based on the calculation type
    const labels = sortedResults.map(result => {
      const inputs = result.result;
      
      if (isConductorSizeComparison) {
        // For conductor size comparison
        return inputs.wireRating ? 
          `${result.jobId.split('-')[1]} (${inputs.wireRating.ampacity}A)` : 
          result.jobId;
      } else {
        // For conductor length comparison
        return `${result.jobId.split('-')[1]}`;
      }
    });
    
    // Determine data points based on selected data point
    let dataPoints: number[] = [];
    switch (chartConfig.dataPoint) {
      case 'voltageDropPercent':
        dataPoints = sortedResults.map(r => r.result.voltageDropPercent);
        break;
      case 'voltageDrop':
        dataPoints = sortedResults.map(r => r.result.voltageDrop);
        break;
      case 'receivingEndVoltage':
        dataPoints = sortedResults.map(r => r.result.receivingEndVoltage);
        break;
      case 'powerLoss':
        dataPoints = sortedResults.map(r => r.result.totalLoss);
        break;
      default:
        dataPoints = sortedResults.map(r => r.result.voltageDropPercent);
    }
    
    // Get the maximum allowed voltage drop as a reference line
    const maxAllowedDrop = sortedResults[0].result.maxAllowedDrop;
    
    // Create datasets including reference line
    return {
      labels,
      datasets: [
        {
          label: getDataPointLabel(chartConfig.dataPoint),
          data: dataPoints,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        // Reference line for voltage drop percent
        ...(chartConfig.dataPoint === 'voltageDropPercent' ? [{
          label: 'Maximum Allowed',
          data: Array(labels.length).fill(maxAllowedDrop),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          type: 'line' as const,
        }] : [])
      ]
    };
  }, [results, chartConfig, isConductorSizeComparison]);
  
  // Create bar chart data (without reference line)
  const barChartData = React.useMemo(() => {
    if (results.length === 0) return { labels: [], datasets: [] };
    
    let sortedResults = [...results];
    
    // Apply sorting if needed
    if (chartConfig.sortBy === 'voltageDropAsc') {
      sortedResults.sort((a, b) => a.result.voltageDropPercent - b.result.voltageDropPercent);
    } else if (chartConfig.sortBy === 'voltageDropDesc') {
      sortedResults.sort((a, b) => b.result.voltageDropPercent - a.result.voltageDropPercent);
    }
    
    // Determine labels based on the calculation type
    const labels = sortedResults.map(result => {
      const inputs = result.result;
      
      if (isConductorSizeComparison) {
        // For conductor size comparison
        return inputs.wireRating ? 
          `${result.jobId.split('-')[1]} (${inputs.wireRating.ampacity}A)` : 
          result.jobId;
      } else {
        // For conductor length comparison
        return `${result.jobId.split('-')[1]}`;
      }
    });
    
    // Determine data points based on selected data point
    let dataPoints: number[] = [];
    switch (chartConfig.dataPoint) {
      case 'voltageDropPercent':
        dataPoints = sortedResults.map(r => r.result.voltageDropPercent);
        break;
      case 'voltageDrop':
        dataPoints = sortedResults.map(r => r.result.voltageDrop);
        break;
      case 'receivingEndVoltage':
        dataPoints = sortedResults.map(r => r.result.receivingEndVoltage);
        break;
      case 'powerLoss':
        dataPoints = sortedResults.map(r => r.result.totalLoss);
        break;
      default:
        dataPoints = sortedResults.map(r => r.result.voltageDropPercent);
    }
    
    // Only return the main dataset (no reference line)
    return {
      labels,
      datasets: [
        {
          label: getDataPointLabel(chartConfig.dataPoint),
          data: dataPoints,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    };
  }, [results, chartConfig, isConductorSizeComparison]);
  
  // Convert chart reference to image for PDF export
  const getChartImage = (chartRef: React.RefObject<ChartJS>) => {
    return chartRef.current?.toBase64Image('image/jpeg', 1.0) || '';
  };
  
  // Helper function to get labels for data points
  const getDataPointLabel = (dataPoint: string): string => {
    switch (dataPoint) {
      case 'voltageDropPercent':
        return 'Voltage Drop (%)';
      case 'voltageDrop':
        return 'Voltage Drop (V)';
      case 'receivingEndVoltage':
        return 'Receiving End Voltage (V)';
      case 'powerLoss':
        return 'Power Loss (W)';
      default:
        return 'Value';
    }
  };
  
  // Export results to PDF
  const handleExportPDF = async () => {
    const pdfService = getPDFExportService();
    
    // Create a report document
    const report: any = {
      title: 'Voltage Drop Batch Calculation Results',
      author: 'Energy Audit System',
      type: 'voltage_drop_batch',
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'generated',
      contents: [
        {
          type: 'section-header',
          title: 'Batch Calculation Results',
          level: 1
        },
        {
          type: 'text',
          content: `This report presents the results of batch voltage drop calculations for ${results.length} variations.`
        },
        {
          type: 'chart',
          image: getChartImage(activeTab === 0 ? lineChartRef : barChartRef),
          title: `${getDataPointLabel(chartConfig.dataPoint)} Comparison`,
          caption: `Comparison of ${getDataPointLabel(chartConfig.dataPoint)} across different scenarios.`
        },
        {
          type: 'section-header',
          title: 'Detailed Results',
          level: 2
        },
        {
          type: 'table',
          headers: ['Job ID', 'Voltage Drop (%)', 'Voltage (V)', 'Power Loss (W)', 'Compliance'],
          rows: results.map(r => [
            r.jobId,
            r.result.voltageDropPercent.toFixed(2),
            r.result.receivingEndVoltage.toFixed(2),
            r.result.totalLoss.toFixed(2),
            r.result.compliance === 'compliant' ? 'Yes' : 'No'
          ])
        },
        {
          type: 'section-header',
          title: 'Compliance Analysis',
          level: 2
        },
        {
          type: 'text',
          content: `Maximum allowed voltage drop: ${results[0].result.maxAllowedDrop}%`
        },
        {
          type: 'text',
          content: `Number of compliant results: ${results.filter(r => r.result.compliance === 'compliant').length} out of ${results.length}`
        }
      ]
    };
    
    await pdfService.generatePDF(report, 'voltage-drop-batch-results.pdf');
  };
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle chart config change
  const handleConfigChange = (field: 'dataPoint' | 'sortBy') => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setChartConfig(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Batch Calculation Results
          </Typography>
          <Box>
            <Button 
              startIcon={<DownloadIcon />} 
              onClick={handleExportPDF}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            {onClose && (
              <Button 
                startIcon={<CompareArrowsIcon />} 
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </Box>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          {results.length} calculations processed
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Data Point</InputLabel>
              <Select
                value={chartConfig.dataPoint}
                onChange={handleConfigChange('dataPoint') as any}
                label="Data Point"
              >
                <MenuItem value="voltageDropPercent">Voltage Drop (%)</MenuItem>
                <MenuItem value="voltageDrop">Voltage Drop (V)</MenuItem>
                <MenuItem value="receivingEndVoltage">Receiving End Voltage</MenuItem>
                <MenuItem value="powerLoss">Power Loss (W)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort Results</InputLabel>
              <Select
                value={chartConfig.sortBy}
                onChange={handleConfigChange('sortBy') as any}
                label="Sort Results"
              >
                <MenuItem value="none">Default Order</MenuItem>
                <MenuItem value="voltageDropAsc">Voltage Drop (Ascending)</MenuItem>
                <MenuItem value="voltageDropDesc">Voltage Drop (Descending)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Line Chart" />
          <Tab label="Bar Chart" />
          <Tab label="Table View" />
        </Tabs>
        
        {activeTab === 0 && (
          <Box sx={{ height: 400 }}>
            <Line
              ref={lineChartRef as any}
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: `${getDataPointLabel(chartConfig.dataPoint)} Comparison`
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: ${value.toFixed(2)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: getDataPointLabel(chartConfig.dataPoint)
                    }
                  }
                }
              }}
            />
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box sx={{ height: 400 }}>
            <Bar
              ref={barChartRef as any}
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: `${getDataPointLabel(chartConfig.dataPoint)} Comparison`
                  }
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: getDataPointLabel(chartConfig.dataPoint)
                    }
                  }
                }
              }}
            />
          </Box>
        )}
        
        {activeTab === 2 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Voltage Drop (%)</TableCell>
                  <TableCell>Voltage Drop (V)</TableCell>
                  <TableCell>Receiving End Voltage</TableCell>
                  <TableCell>Power Loss (W)</TableCell>
                  <TableCell>Compliance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow 
                    key={result.jobId}
                    sx={{ 
                      backgroundColor: result.result.compliance === 'compliant' ? 
                        'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                    }}
                  >
                    <TableCell>{result.jobId}</TableCell>
                    <TableCell>{result.result.voltageDropPercent.toFixed(2)}%</TableCell>
                    <TableCell>{result.result.voltageDrop.toFixed(2)}V</TableCell>
                    <TableCell>{result.result.receivingEndVoltage.toFixed(2)}V</TableCell>
                    <TableCell>{result.result.totalLoss.toFixed(2)}W</TableCell>
                    <TableCell>
                      {result.result.compliance === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Compliance Summary
        </Typography>
        <Typography variant="body1" paragraph>
          Maximum allowed voltage drop: <strong>{results[0]?.result.maxAllowedDrop}%</strong>
        </Typography>
        <Typography variant="body1">
          Compliant results: <strong>{results.filter(r => r.result.compliance === 'compliant').length}</strong> out of <strong>{results.length}</strong>
        </Typography>
      </Paper>
    </Box>
  );
};

export default BatchResultsVisualization;
