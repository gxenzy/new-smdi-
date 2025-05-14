import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ChartConfiguration, ChartType } from 'chart.js';
import EnhancedAccessibleChart from '../../utils/reportGenerator/EnhancedAccessibleChart';
import { testChartAccessibility, ChartAccessibilityTestResult, formatTestResults } from '../../utils/accessibility/chartAccessibilityTester';
import AccessibilityKeyboardDemoChart from './AccessibilityKeyboardDemoChart';

// Sample chart configuration for report generation
const getSampleChartConfig = (chartType: ChartType): ChartConfiguration => {
  // Common labels across chart types
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  // Default options for all charts
  const defaultOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Example`
      },
      legend: {
        position: 'top' as const,
      }
    }
  };
  
  switch (chartType) {
    case 'bar':
      return {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Dataset 1',
              data: [65, 59, 80, 81, 56, 55],
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
              label: 'Dataset 2',
              data: [28, 48, 40, 19, 86, 27],
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        },
        options: defaultOptions,
      };
      
    case 'line':
      return {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Dataset 1',
              data: [65, 59, 80, 81, 56, 55],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
              label: 'Dataset 2',
              data: [28, 48, 40, 19, 86, 27],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        },
        options: defaultOptions,
      };
      
    default:
      return {
        type: chartType,
        data: {
          labels,
          datasets: [
            {
              label: 'Dataset 1',
              data: [65, 59, 80, 81, 56, 55],
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
          ],
        },
        options: defaultOptions,
      };
  }
};

/**
 * Component for testing chart accessibility
 */
const ChartAccessibilityTest: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<ChartAccessibilityTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testOptions, setTestOptions] = useState({
    testKeyboardAccessibility: true,
    testScreenReaderAccessibility: true,
    testHighContrastMode: true,
    testDataTableView: true
  });
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setSelectedChartType(event.target.value as ChartType);
  };
  
  // Handle test execution
  const runTests = async () => {
    if (!chartContainerRef.current) {
      setErrorMessage('Chart container not found');
      return;
    }
    
    // Ensure the container has an ID
    if (!chartContainerRef.current.id) {
      chartContainerRef.current.id = 'chart-accessibility-test-container';
    }
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const results = await testChartAccessibility({
        containerId: chartContainerRef.current.id,
        ...testOptions
      });
      
      setTestResults(results);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle option change
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestOptions({
      ...testOptions,
      [event.target.name]: event.target.checked
    });
  };
  
  // Generate test report
  const generateReport = () => {
    if (!testResults) return '';
    
    // Get the current chart configuration from the demo chart
    const chartConfig = getSampleChartConfig(selectedChartType);
    
    return formatTestResults(testResults, chartConfig);
  };
  
  // Download test report
  const downloadReport = () => {
    if (!testResults) return;
    
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart-accessibility-test-report.md';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Render violation severity
  const renderSeverity = (impact: any): React.ReactNode => {
    switch (impact as string) {
      case 'critical':
        return (
          <Chip 
            size="small" 
            color="error" 
            icon={<ErrorIcon />} 
            label="Critical" 
          />
        );
      case 'serious':
        return (
          <Chip 
            size="small" 
            color="error" 
            icon={<WarningIcon />} 
            label="Serious" 
          />
        );
      case 'moderate':
        return (
          <Chip 
            size="small" 
            color="warning" 
            icon={<WarningIcon />} 
            label="Moderate" 
          />
        );
      case 'minor':
        return (
          <Chip 
            size="small" 
            color="info" 
            icon={<InfoIcon />} 
            label="Minor" 
          />
        );
      default:
        return (
          <Chip 
            size="small" 
            color="default" 
            icon={<InfoIcon />} 
            label="Unknown" 
          />
        );
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Chart Accessibility Testing
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          This tool tests chart components for accessibility compliance according to WCAG 2.1 standards.
          It checks for keyboard navigation, screen reader support, high contrast mode, and data table views.
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="chart-type-select-label">Chart Type</InputLabel>
                <Select
                  labelId="chart-type-select-label"
                  id="chart-type-select"
                  value={selectedChartType}
                  label="Chart Type"
                  onChange={handleChartTypeChange}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                  <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                  <MenuItem value="radar">Radar Chart</MenuItem>
                  <MenuItem value="scatter">Scatter Chart</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Test Options
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={testOptions.testKeyboardAccessibility}
                      onChange={handleOptionChange}
                      name="testKeyboardAccessibility"
                    />
                  }
                  label="Keyboard Accessibility"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={testOptions.testScreenReaderAccessibility}
                      onChange={handleOptionChange}
                      name="testScreenReaderAccessibility"
                    />
                  }
                  label="Screen Reader Accessibility"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={testOptions.testHighContrastMode}
                      onChange={handleOptionChange}
                      name="testHighContrastMode"
                    />
                  }
                  label="High Contrast Mode"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={testOptions.testDataTableView}
                      onChange={handleOptionChange}
                      name="testDataTableView"
                    />
                  }
                  label="Data Table View"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={runTests}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Running Tests...
            </>
          ) : (
            'Run Accessibility Tests'
          )}
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          onClick={downloadReport}
          disabled={!testResults || loading}
        >
          Download Report
        </Button>
      </Paper>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Chart
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box ref={chartContainerRef} id="chart-accessibility-test-container">
              <AccessibilityKeyboardDemoChart chartType={selectedChartType} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : testResults ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">
                    Overall Status:
                  </Typography>
                  {testResults.passed ? (
                    <Chip
                      color="success"
                      icon={<CheckIcon />}
                      label="PASSED"
                    />
                  ) : (
                    <Chip
                      color="error"
                      icon={<ErrorIcon />}
                      label="FAILED"
                    />
                  )}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Violations ({testResults.violations.length})
                </Typography>
                
                {testResults.violations.length > 0 ? (
                  <List>
                    {testResults.violations.map((violation, index) => (
                      <ListItem key={index} alignItems="flex-start" divider>
                        <ListItemIcon>
                          {renderSeverity(violation.impact)}
                        </ListItemIcon>
                        <ListItemText
                          primary={violation.id}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {violation.description}
                              </Typography>
                              <br />
                              <Typography variant="caption" component="span">
                                Affected elements: {violation.nodes?.length || 0}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">
                    No violations found!
                  </Alert>
                )}
                
                {testResults.keyboardAccessibility && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Keyboard Accessibility
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.keyboardAccessibility.isNavigable ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="Keyboard Navigable" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.keyboardAccessibility.hasFocusIndicators ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="Focus Indicators" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.keyboardAccessibility.hasKeyboardShortcuts ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="Keyboard Shortcuts" />
                      </ListItem>
                    </List>
                  </>
                )}
                
                {testResults.screenReaderAccessibility && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                      Screen Reader Accessibility
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.screenReaderAccessibility.hasAriaAttributes ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="ARIA Attributes" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.screenReaderAccessibility.hasAlternativeText ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="Alternative Text" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {testResults.screenReaderAccessibility.hasDataTable ? 
                            <CheckIcon color="success" /> : 
                            <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText primary="Data Table" />
                      </ListItem>
                    </List>
                  </>
                )}
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <Typography color="textSecondary">
                  Run tests to see results
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartAccessibilityTest; 