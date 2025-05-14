import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AccessibleChartRenderer } from './ChartAccessibilityProvider';
import ChartCustomizationPanel from './ChartCustomizationPanel';
import { ChartGenerator } from './chartGenerator';

// Define types for chart templates
interface ChartTemplate {
  id: string;
  name: string;
  description?: string;
  config: ChartConfiguration;
}

// Define the available chart templates
const chartTemplates: ChartTemplate[] = [
  {
    id: 'energy-savings',
    name: 'Energy Savings Potential',
    description: 'Bar chart showing potential energy savings by system',
    config: {
      type: 'bar',
      data: {
        labels: ['Lighting', 'HVAC', 'Equipment', 'Envelope', 'Controls'],
        datasets: [{
          label: 'Potential Savings (kWh)',
          data: [15000, 25000, 8000, 12000, 18000],
          backgroundColor: '#4CAF50'
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Energy Savings Potential'
          }
        }
      }
    }
  },
  {
    id: 'consumption-breakdown',
    name: 'Energy Consumption Breakdown',
    description: 'Pie chart showing energy use by system type',
    config: {
      type: 'pie',
      data: {
        labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
        datasets: [{
          data: [25, 40, 15, 15, 5],
          backgroundColor: ['#4C68D7', '#5CC668', '#8A5CC6', '#F9BF31', '#E74C5E']
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Energy Consumption Breakdown'
          }
        }
      }
    }
  },
  {
    id: 'financial-analysis',
    name: 'Financial Analysis',
    description: 'Bar chart showing ROI, payback period, and other financial metrics',
    config: {
      type: 'bar',
      data: {
        labels: ['Investment', 'Annual Savings', 'Payback Period', 'ROI'],
        datasets: [{
          label: 'Financial Metrics',
          data: [50000, 12000, 4.2, 24],
          backgroundColor: '#6A1B9A'
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Financial Analysis'
          }
        }
      }
    }
  }
];

// Convert ChartTemplate to a format the report builder can use
interface ReportChartConfig {
  id: string;
  title: string;
  chartConfig: ChartConfiguration;
  settings: {
    width: 'full' | 'half';
    height: number;
    showLegend: boolean;
    themeName: string;
  };
}

interface ChartReportIntegrationProps {
  onAddChartToReport: (chartConfig: ReportChartConfig) => void;
  availableCalculatorCharts?: ChartConfiguration[];
  allowCustomCharts?: boolean;
}

const ChartReportIntegration: React.FC<ChartReportIntegrationProps> = ({
  onAddChartToReport,
  availableCalculatorCharts = [],
  allowCustomCharts = true
}) => {
  const theme = useTheme();
  const [selectedChart, setSelectedChart] = useState<ChartConfiguration | null>(null);
  const [customizedChart, setCustomizedChart] = useState<ChartConfiguration | null>(null);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  
  // Combine available charts from calculators with predefined templates
  const availableCharts = [
    ...availableCalculatorCharts,
    ...chartTemplates.map(template => template.config)
  ];
  
  // Handle chart selection
  const handleSelectChart = (chart: ChartConfiguration) => {
    setSelectedChart(JSON.parse(JSON.stringify(chart))); // Deep clone
    setCustomizedChart(JSON.parse(JSON.stringify(chart))); // Deep clone
    setCustomizationDialogOpen(true);
  };
  
  // Handle chart customization
  const handleChartCustomization = (updatedConfig: ChartConfiguration) => {
    setCustomizedChart(updatedConfig);
  };
  
  // Add chart to report
  const handleAddToReport = () => {
    if (!customizedChart) return;
    
    // Extract title from chart config
    const chartTitle = customizedChart.options?.plugins?.title?.text || 'Untitled Chart';
    
    // Create report chart config
    const reportChart: ReportChartConfig = {
      id: `chart-${Date.now()}`,
      title: chartTitle as string,
      chartConfig: customizedChart,
      settings: {
        width: 'full',
        height: 300,
        showLegend: customizedChart.options?.plugins?.legend?.display !== false,
        themeName: 'default'
      }
    };
    
    // Add to report
    onAddChartToReport(reportChart);
    
    // Show success message
    setSnackbarMessage('Chart added to report');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Close dialog
    setCustomizationDialogOpen(false);
  };
  
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Charts for Report
      </Typography>
      
      <Grid container spacing={2}>
        {/* Available Chart Templates */}
        {chartTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Paper 
              sx={{ 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => handleSelectChart(template.config)}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {template.name}
              </Typography>
              
              {template.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
              )}
              
              <Box sx={{ height: 150, mb: 2, flex: 1 }}>
                <AccessibleChartRenderer
                  configuration={template.config}
                  themeName="default"
                  showExportOptions={false}
                  ariaLabel={`Chart preview: ${template.name}`}
                  sizePreset="compact"
                />
              </Box>
              
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectChart(template.config);
                }}
              >
                Customize & Add
              </Button>
            </Paper>
          </Grid>
        ))}
        
        {/* Available Calculator Charts */}
        {availableCalculatorCharts.map((chart, index) => (
          <Grid item xs={12} sm={6} md={4} key={`calc-chart-${index}`}>
            <Paper 
              sx={{ 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => handleSelectChart(chart)}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {chart.options?.plugins?.title?.text || `Calculator Chart ${index + 1}`}
              </Typography>
              
              <Box sx={{ height: 150, mb: 2, flex: 1 }}>
                <AccessibleChartRenderer
                  configuration={chart}
                  themeName="default"
                  showExportOptions={false}
                  ariaLabel={`Chart preview: ${chart.options?.plugins?.title?.text || `Calculator Chart`}`}
                  sizePreset="compact"
                />
              </Box>
              
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectChart(chart);
                }}
              >
                Customize & Add
              </Button>
            </Paper>
          </Grid>
        ))}
        
        {/* Custom Chart Option */}
        {allowCustomCharts && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper 
              sx={{ 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: `2px dashed ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover
                }
              }}
              onClick={() => {
                // Create a basic chart configuration
                const basicConfig: ChartConfiguration = {
                  type: 'bar',
                  data: {
                    labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
                    datasets: [{
                      label: 'Data Series',
                      data: [12, 19, 3, 5, 2],
                      backgroundColor: '#4C68D7'
                    }]
                  },
                  options: {
                    plugins: {
                      title: {
                        display: true,
                        text: 'Custom Chart'
                      }
                    }
                  }
                };
                handleSelectChart(basicConfig);
              }}
            >
              <AddIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="subtitle1" align="center" fontWeight="bold">
                Create Custom Chart
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                Design a chart from scratch
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Chart Customization Dialog */}
      <Dialog
        open={customizationDialogOpen}
        onClose={() => setCustomizationDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Customize Chart for Report</Typography>
            <IconButton onClick={() => setCustomizationDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              {customizedChart && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <AccessibleChartRenderer
                    configuration={customizedChart}
                    themeName="default"
                    showExportOptions={true}
                    ariaLabel="Preview of customized chart for report"
                    sizePreset="standard"
                  />
                </Paper>
              )}
            </Grid>
            <Grid item xs={12} md={5}>
              {customizedChart && (
                <ChartCustomizationPanel
                  chartConfig={customizedChart}
                  onConfigChange={handleChartCustomization}
                  availableTemplates={chartTemplates.map(t => ({ id: t.id, name: t.name }))}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizationDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddToReport}
            startIcon={<AddIcon />}
            disabled={!customizedChart}
          >
            Add to Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChartReportIntegration; 