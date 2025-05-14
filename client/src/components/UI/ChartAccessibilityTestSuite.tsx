import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Stack,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import CompareIcon from '@mui/icons-material/Compare';
import ScreenshotIcon from '@mui/icons-material/Screenshot';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { 
  runAccessibilityTests, 
  AccessibilityTestResult,
  formatViolations,
  logAccessibilityResults
} from '../../utils/accessibility/axeUtils';
import { 
  createChartDescription, 
  generateChartScreenReaderText, 
  createAccessibleDataTable 
} from '../../utils/accessibility/chartScreenReaderUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-suite-tabpanel-${index}`}
      aria-labelledby={`test-suite-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Sample chart configurations for different chart types
const getDefaultChartConfig = (chartType: ChartType): ChartConfiguration => {
  // Common labels and datasets
  const commonLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const commonData = [65, 59, 80, 81, 56, 55];
  const secondaryData = [28, 48, 40, 19, 86, 27];
  
  // Configuration based on chart type
  switch (chartType) {
    case 'bar':
      return {
        type: 'bar',
        data: {
          labels: commonLabels,
          datasets: [{
            label: 'Energy Consumption',
            data: commonData,
            backgroundColor: '#4e79a7'
          }, {
            label: 'Energy Savings',
            data: secondaryData,
            backgroundColor: '#59a14f'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Energy Consumption and Savings'
            }
          }
        }
      };
      
    case 'line':
      return {
        type: 'line',
        data: {
          labels: commonLabels,
          datasets: [{
            label: 'Energy Consumption',
            data: commonData,
            borderColor: '#4e79a7',
            backgroundColor: 'rgba(78, 121, 167, 0.2)',
            tension: 0.1,
            fill: true
          }, {
            label: 'Energy Savings',
            data: secondaryData,
            borderColor: '#59a14f',
            backgroundColor: 'rgba(89, 161, 79, 0.2)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Energy Consumption and Savings Trends'
            }
          }
        }
      };
      
    case 'pie':
      return {
        type: 'pie',
        data: {
          labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
          datasets: [{
            data: [30, 40, 15, 10, 5],
            backgroundColor: [
              '#4e79a7',
              '#f28e2c',
              '#e15759',
              '#76b7b2',
              '#59a14f'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Energy Usage Distribution'
            }
          }
        }
      };
      
    case 'doughnut':
      return {
        type: 'doughnut',
        data: {
          labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
          datasets: [{
            data: [30, 40, 15, 10, 5],
            backgroundColor: [
              '#4e79a7',
              '#f28e2c',
              '#e15759',
              '#76b7b2',
              '#59a14f'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Energy Usage Distribution'
            }
          }
        }
      };
      
    case 'radar':
      return {
        type: 'radar',
        data: {
          labels: ['Lighting', 'HVAC', 'Insulation', 'Windows', 'Controls', 'Equipment'],
          datasets: [{
            label: 'Current Building',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: 'rgba(78, 121, 167, 0.2)',
            borderColor: '#4e79a7',
            pointBackgroundColor: '#4e79a7'
          }, {
            label: 'Benchmark',
            data: [28, 48, 40, 19, 86, 27],
            backgroundColor: 'rgba(89, 161, 79, 0.2)',
            borderColor: '#59a14f',
            pointBackgroundColor: '#59a14f'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Building Performance Assessment'
            }
          }
        }
      };
      
    case 'scatter':
      return {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Energy vs Cost',
            data: [
              { x: 10, y: 20 },
              { x: 15, y: 30 },
              { x: 20, y: 25 },
              { x: 25, y: 40 },
              { x: 30, y: 35 },
              { x: 35, y: 50 },
              { x: 40, y: 45 }
            ],
            backgroundColor: '#4e79a7'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Energy Usage vs Cost Analysis'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Energy Usage (kWh)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Cost ($)'
              }
            }
          }
        }
      };
      
    default:
      return {
        type: 'bar',
        data: {
          labels: commonLabels,
          datasets: [{
            label: 'Dataset 1',
            data: commonData,
            backgroundColor: '#4e79a7'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Chart Accessibility Test'
            }
          }
        }
      };
  }
};

// Interface for test configuration
interface TestConfig {
  chartType: ChartType;
  themeName: 'default' | 'energy' | 'financial';
  usePatternFills: boolean;
  useHighContrast: boolean;
}

// Interface for test result summary
interface TestResultSummary {
  testId: string;
  timestamp: string;
  chartType: ChartType;
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  config: TestConfig;
}

/**
 * Component that provides comprehensive accessibility testing for charts
 */
const ChartAccessibilityTestSuite: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for chart configuration
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [themeName, setThemeName] = useState<'default' | 'energy' | 'financial'>('default');
  const [usePatternFills, setUsePatternFills] = useState<boolean>(false);
  const [useHighContrast, setUseHighContrast] = useState<boolean>(false);
  
  // State for chart configuration
  const [chartConfig, setChartConfig] = useState<ChartConfiguration>(getDefaultChartConfig('bar'));
  
  // Refs for chart testing
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // State for test results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<AccessibilityTestResult | null>(null);
  const [screenReaderText, setScreenReaderText] = useState<string>('');
  const [dataTableText, setDataTableText] = useState<string>('');
  const [testHistory, setTestHistory] = useState<TestResultSummary[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    const newChartType = event.target.value as ChartType;
    setChartType(newChartType);
    setChartConfig(getDefaultChartConfig(newChartType));
  };
  
  // Handle theme change
  const handleThemeChange = (event: SelectChangeEvent) => {
    setThemeName(event.target.value as 'default' | 'energy' | 'financial');
  };
  
  // Handle pattern fills toggle
  const handlePatternFillsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsePatternFills(event.target.checked);
  };
  
  // Handle high contrast toggle
  const handleHighContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseHighContrast(event.target.checked);
  };
  
  // Generate screen reader text and data table when chart configuration changes
  useEffect(() => {
    // Generate screen reader text
    const srText = generateChartScreenReaderText(chartConfig);
    setScreenReaderText(srText);
    
    // Generate data table
    const dataTable = createAccessibleDataTable(chartConfig);
    setDataTableText(dataTable);
  }, [chartConfig]);
  
  // Run accessibility test
  const runTest = async () => {
    if (!chartContainerRef.current) {
      setTestError('Chart container reference not found');
      return;
    }
    
    setIsLoading(true);
    setTestError(null);
    
    try {
      // Run accessibility test
      const results = await runAccessibilityTests({
        context: chartContainerRef.current
      });
      
      setTestResults(results);
      
      // Add to test history
      const testId = `test-${Date.now()}`;
      const summary: TestResultSummary = {
        testId,
        timestamp: results.timestamp,
        chartType,
        violations: results.violations.length,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
        config: {
          chartType,
          themeName,
          usePatternFills,
          useHighContrast
        }
      };
      
      setTestHistory(prev => [summary, ...prev]);
      
      // Log results to console
      logAccessibilityResults(results);
    } catch (error) {
      setTestError(`Failed to run accessibility test: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate and download test report
  const downloadTestReport = () => {
    if (!testResults) return;
    
    // Create report content
    const report = `
Chart Accessibility Test Report
==============================
Timestamp: ${testResults.timestamp}

Chart Configuration
------------------
Chart Type: ${chartType}
Theme: ${themeName}
Pattern Fills: ${usePatternFills ? 'Yes' : 'No'}
High Contrast: ${useHighContrast ? 'Yes' : 'No'}

Test Results
-----------
Passes: ${testResults.passes}
Violations: ${testResults.violations.length}
Incomplete: ${testResults.incomplete}
Inapplicable: ${testResults.inapplicable}

${testResults.violations.length > 0 ? 'Violations:\n' + formatViolations(testResults.violations) : 'No violations found.'}

Screen Reader Text
-----------------
${screenReaderText}

Data Table
---------
${dataTableText}
`;
    
    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-a11y-report-${chartType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Get severity color for accessibility violations
  const getSeverityColor = (impact: string): string => {
    switch (impact) {
      case 'critical': return '#d32f2f';
      case 'serious': return '#f44336';
      case 'moderate': return '#ff9800';
      case 'minor': return '#ffb74d';
      default: return '#757575';
    }
  };
  
  // Clear test history
  const clearTestHistory = () => {
    setTestHistory([]);
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Chart Accessibility Test Suite
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This tool tests chart components for WCAG 2.1 AA compliance and generates reports for accessibility issues.
        </Typography>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="chart accessibility testing tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Test Configuration" id="test-suite-tab-0" aria-controls="test-suite-tabpanel-0" />
          <Tab label="Test Results" id="test-suite-tab-1" aria-controls="test-suite-tabpanel-1" />
          <Tab label="Screen Reader" id="test-suite-tab-2" aria-controls="test-suite-tabpanel-2" />
          <Tab label="Test History" id="test-suite-tab-3" aria-controls="test-suite-tabpanel-3" />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="chart-type-label">Chart Type</InputLabel>
                <Select
                  labelId="chart-type-label"
                  id="chart-type-select"
                  value={chartType}
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
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="theme-label">Theme</InputLabel>
                <Select
                  labelId="theme-label"
                  id="theme-select"
                  value={themeName}
                  label="Theme"
                  onChange={handleThemeChange}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="energy">Energy</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                  <Typography component="legend">Accessibility Options</Typography>
                  <div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={usePatternFills}
                          onChange={handlePatternFillsChange}
                        />
                      }
                      label="Use Pattern Fills"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={useHighContrast}
                          onChange={handleHighContrastChange}
                        />
                      }
                      label="High Contrast Mode"
                    />
                  </div>
                </FormControl>
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preview Chart
              </Typography>
              <Box 
                ref={chartContainerRef}
                id="chart-a11y-test-container"
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  p: 2,
                  mb: 3,
                  height: 350
                }}
              >
                <AccessibleChartRenderer
                  configuration={chartConfig}
                  themeName={themeName}
                  height={300}
                  sizePreset="standard"
                />
              </Box>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={runTest}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Running Test...' : 'Run Accessibility Test'}
                </Button>
                
                <Button 
                  variant="outlined"
                  onClick={downloadTestReport}
                  disabled={!testResults || isLoading}
                  startIcon={<DownloadIcon />}
                >
                  Download Test Report
                </Button>
              </Stack>
              
              {testError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {testError}
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {testResults ? (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Chip 
                  label={`Passes: ${testResults.passes}`} 
                  color="success" 
                  icon={<CheckCircleIcon />}
                />
                <Chip 
                  label={`Violations: ${testResults.violations.length}`} 
                  color={testResults.violations.length > 0 ? 'error' : 'default'} 
                  icon={testResults.violations.length > 0 ? <ErrorIcon /> : undefined}
                />
                <Chip 
                  label={`Incomplete: ${testResults.incomplete}`} 
                  color={testResults.incomplete > 0 ? 'warning' : 'default'} 
                  icon={testResults.incomplete > 0 ? <WarningIcon /> : undefined}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  Test run: {new Date(testResults.timestamp).toLocaleString()}
                </Typography>
              </Box>
              
              {testResults.violations.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Violations Found
                  </Typography>
                  
                  {testResults.violations.map((violation, index) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: getSeverityColor(violation.impact),
                              mr: 1
                            }} 
                          />
                          <Typography variant="subtitle1">
                            {violation.id} - {violation.description}
                          </Typography>
                          <Chip 
                            label={violation.impact} 
                            size="small" 
                            sx={{ ml: 'auto', bgcolor: getSeverityColor(violation.impact), color: 'white' }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" paragraph>
                          {violation.help}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">
                            Learn more about this issue
                          </a>
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Affected Elements:
                        </Typography>
                        <List dense>
                          {violation.nodes.map((node, nodeIndex) => (
                            <ListItem key={nodeIndex} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                              <ListItemText
                                primary={`Element ${nodeIndex + 1}: ${node.target.join(', ')}`}
                                secondary={node.html}
                                secondaryTypographyProps={{ component: 'pre', sx: { mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, overflowX: 'auto' } }}
                              />
                              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {node.failureSummary}
                              </Typography>
                              <Divider sx={{ width: '100%', my: 1 }} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No accessibility violations found! This chart meets WCAG 2.1 AA standards.
                </Alert>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Remediation Recommendations
                </Typography>
                
                {testResults.violations.length > 0 ? (
                  <List>
                    {testResults.violations.map((violation, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={violation.id}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {violation.help}
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                <strong>How to fix:</strong> Implement proper ARIA labels, ensure sufficient contrast, 
                                provide alternative text descriptions, and follow 
                                <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer"> WAI-ARIA chart practices</a>.
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2">
                    This chart already follows best practices for accessibility. Continue to monitor with future updates.
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              Run an accessibility test first to see results here.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Screen Reader Output
          </Typography>
          <Typography variant="body2" paragraph>
            This is what screen readers will announce to users with visual impairments:
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {screenReaderText || 'No screen reader text available.'}
            </pre>
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Data Table Representation
          </Typography>
          <Typography variant="body2" paragraph>
            This tabular representation will be available to screen reader users:
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {dataTableText || 'No data table available.'}
            </pre>
          </Paper>
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Test History
            </Typography>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={clearTestHistory}
              disabled={testHistory.length === 0}
            >
              Clear History
            </Button>
          </Box>
          
          {testHistory.length > 0 ? (
            <Grid container spacing={2}>
              {testHistory.map((result) => (
                <Grid item xs={12} md={6} key={result.testId}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {result.chartType.charAt(0).toUpperCase() + result.chartType.slice(1)} Chart Test
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(result.timestamp).toLocaleString()}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Results:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          <Chip 
                            label={`Passes: ${result.passes}`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`Violations: ${result.violations}`} 
                            size="small" 
                            color={result.violations > 0 ? 'error' : 'default'} 
                            variant="outlined"
                          />
                          <Chip 
                            label={`Incomplete: ${result.incomplete}`} 
                            size="small" 
                            color={result.incomplete > 0 ? 'warning' : 'default'} 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Configuration:</strong>
                        </Typography>
                        <Typography variant="body2">
                          Theme: {result.config.themeName}
                        </Typography>
                        <Typography variant="body2">
                          Pattern Fills: {result.config.usePatternFills ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2">
                          High Contrast: {result.config.useHighContrast ? 'Yes' : 'No'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No test history available. Run some tests to see results here.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ChartAccessibilityTestSuite; 