import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { ChartConfiguration } from 'chart.js';

/**
 * Component to test accessibility of charts and display the results
 * 
 * Note: This component is meant for development environments only.
 * It requires axe-core to be installed, which should not be included in production builds.
 */
const AccessibilityTester: React.FC<{
  title?: string;
  chartConfig: ChartConfiguration;
  themeName?: 'default' | 'energy' | 'financial';
}> = ({ title = 'Chart Accessibility Test', chartConfig, themeName = 'default' }) => {
  // Track if we're in a development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Reference to the chart container
  const chartRef = useRef<HTMLDivElement>(null);
  
  // State for test results
  const [loading, setLoading] = useState<boolean>(false);
  const [testRun, setTestRun] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Run accessibility test
  const runTest = async () => {
    if (!isDevelopment) {
      setError('Accessibility testing is only available in development environments.');
      return;
    }
    
    if (!chartRef.current) {
      setError('Chart reference not found.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Dynamically import axe utilities to prevent production inclusion
      const axeUtils = await import('../../utils/accessibility/axeUtils');
      
      // Run the test
      const testResults = await axeUtils.runAccessibilityTests({
        context: chartRef.current
      });
      
      setResults(testResults);
      setTestRun(true);
    } catch (err) {
      setError(`Failed to run accessibility test: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Get severity color
  const getSeverityColor = (impact: string): string => {
    switch (impact) {
      case 'critical': return '#d32f2f';
      case 'serious': return '#f44336';
      case 'moderate': return '#ff9800';
      case 'minor': return '#ffb74d';
      default: return '#757575';
    }
  };
  
  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return null;
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        
        <Box 
          ref={chartRef}
          id="accessibility-test-chart"
          sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            p: 2,
            mb: 3 
          }}
        >
          <AccessibleChartRenderer
            configuration={chartConfig}
            title="Accessibility Test Chart"
            themeName={themeName}
            ariaLabel="Chart for accessibility testing"
            sizePreset="standard"
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={runTest}
            disabled={loading || !isDevelopment}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Running Test...' : 'Run Accessibility Test'}
          </Button>
          
          {!isDevelopment && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Note: Accessibility testing is only available in development environments.
            </Typography>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {testRun && results && (
          <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Chip 
                label={`Passes: ${results.passes}`} 
                color="success" 
                icon={<CheckCircleIcon />}
              />
              <Chip 
                label={`Violations: ${results.violations.length}`} 
                color={results.violations.length > 0 ? 'error' : 'default'} 
                icon={results.violations.length > 0 ? <ErrorIcon /> : undefined}
              />
              <Chip 
                label={`Incomplete: ${results.incomplete}`} 
                color={results.incomplete > 0 ? 'warning' : 'default'} 
                icon={results.incomplete > 0 ? <WarningIcon /> : undefined}
              />
            </Box>
            
            {results.violations.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Violations Found
                </Typography>
                
                {results.violations.map((violation: any, index: number) => (
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
                          Learn more
                        </a>
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Affected Elements:
                      </Typography>
                      <List dense>
                        {violation.nodes.map((node: any, nodeIndex: number) => (
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
              <Alert severity="success">
                No accessibility violations found!
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AccessibilityTester; 