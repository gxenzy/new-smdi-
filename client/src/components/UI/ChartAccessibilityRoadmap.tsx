import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ArrowForward as ArrowIcon,
  Assignment as AssignmentIcon,
  Visibility as TestIcon,
  Create as RecorderIcon,
  Assessment as ReportIcon,
  HearingDisabled as HearingIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getTestReports, getTestReportStats, TestReport } from '../../utils/accessibility/testReportStorage';
import { ChartType } from 'chart.js';

/**
 * Component that displays a roadmap for chart accessibility testing
 */
const ChartAccessibilityRoadmap: React.FC = () => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getTestReportStats> | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // List of chart types we want to ensure are tested
  const chartTypes: ChartType[] = ['bar', 'line', 'pie', 'doughnut', 'radar', 'scatter'];
  
  // List of screen readers we want to ensure are tested with
  const screenReaders: Array<'NVDA' | 'JAWS' | 'VoiceOver' | 'Narrator' | 'TalkBack' | 'Other'> = ['NVDA', 'JAWS', 'VoiceOver', 'Narrator'];
  
  // Load reports on component mount
  useEffect(() => {
    loadReports();
    
    // Set active step based on current progress
    determineActiveStep();
  }, []);
  
  // Load reports and calculate stats
  const loadReports = () => {
    const allReports = getTestReports();
    setReports(allReports);
    setStats(getTestReportStats());
  };
  
  // Calculate testing coverage for chart types
  const getChartTypeCoverage = () => {
    const testedChartTypes = new Set(reports.map(r => r.chartType));
    const coverage = chartTypes.map(type => ({
      type,
      tested: testedChartTypes.has(type)
    }));
    
    return {
      coverage,
      percentage: (coverage.filter(c => c.tested).length / chartTypes.length) * 100
    };
  };
  
  // Calculate testing coverage for screen readers
  const getScreenReaderCoverage = () => {
    const testedScreenReaders = new Set(reports.map(r => r.screenReader));
    const coverage = screenReaders.map(reader => ({
      reader,
      tested: testedScreenReaders.has(reader)
    }));
    
    return {
      coverage,
      percentage: (coverage.filter(c => c.tested).length / screenReaders.length) * 100
    };
  };
  
  // Determine the current active step based on testing progress
  const determineActiveStep = () => {
    // If no reports, stay at step 0
    if (reports.length === 0) {
      setActiveStep(0);
      return;
    }
    
    // If some chart types tested, but not all, go to step 1
    const chartTypeCoverage = getChartTypeCoverage();
    if (chartTypeCoverage.percentage > 0 && chartTypeCoverage.percentage < 100) {
      setActiveStep(1);
      return;
    }
    
    // If all chart types tested, but not all screen readers, go to step 2
    const screenReaderCoverage = getScreenReaderCoverage();
    if (chartTypeCoverage.percentage === 100 && screenReaderCoverage.percentage < 100) {
      setActiveStep(2);
      return;
    }
    
    // If all chart types and screen readers tested, go to step 3
    if (chartTypeCoverage.percentage === 100 && screenReaderCoverage.percentage === 100) {
      setActiveStep(3);
      return;
    }
  };
  
  const chartTypeCoverage = getChartTypeCoverage();
  const screenReaderCoverage = getScreenReaderCoverage();
  
  // Steps for the roadmap
  const steps = [
    {
      label: 'Get Started with Testing',
      description: 'Begin by testing your first chart for accessibility. The Test Recorder will guide you through documenting your findings.',
      completed: reports.length > 0,
      link: '/settings/accessibility/testing-guide',
      linkText: 'View Testing Guide',
      secondaryLink: '/settings/accessibility/test-recorder',
      secondaryLinkText: 'Open Test Recorder',
      progress: reports.length > 0 ? 100 : 0
    },
    {
      label: 'Test All Chart Types',
      description: 'Test each chart type to ensure they all meet accessibility requirements. Different chart types have different accessibility challenges.',
      completed: chartTypeCoverage.percentage === 100,
      link: '/settings/accessibility/test-recorder',
      linkText: 'Continue Testing Charts',
      secondaryLink: '/settings/accessibility/test-reports',
      secondaryLinkText: 'View Test Reports',
      progress: chartTypeCoverage.percentage
    },
    {
      label: 'Test with Different Screen Readers',
      description: 'Ensure your charts work well with multiple screen readers. Different screen readers may behave differently with the same content.',
      completed: screenReaderCoverage.percentage === 100,
      link: '/settings/accessibility/testing-guide',
      linkText: 'Screen Reader Guide',
      secondaryLink: '/settings/accessibility/test-recorder',
      secondaryLinkText: 'Record Test Results',
      progress: screenReaderCoverage.percentage
    },
    {
      label: 'Analyze and Improve',
      description: 'Review your test results, identify patterns, and implement improvements to ensure your charts are fully accessible.',
      completed: false, // Always ongoing
      link: '/settings/accessibility/test-stats',
      linkText: 'View Analytics',
      secondaryLink: '/settings/accessibility/test-reports',
      secondaryLinkText: 'Review Reports',
      progress: Math.min(
        ((chartTypeCoverage.percentage + screenReaderCoverage.percentage) / 2),
        stats?.testStats.passRate || 0
      )
    }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Accessibility Testing Roadmap
      </Typography>
      
      <Typography variant="body1" paragraph>
        Follow this roadmap to ensure your charts are thoroughly tested for accessibility.
        Each step builds on the previous one to create a comprehensive testing strategy.
      </Typography>
      
      {/* Progress Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Progress Overview</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Chart Types Tested
                </Typography>
                <Typography variant="h4">
                  {chartTypeCoverage.percentage.toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={chartTypeCoverage.percentage}
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {chartTypeCoverage.coverage.filter(c => c.tested).length} of {chartTypes.length} types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Screen Readers Tested
                </Typography>
                <Typography variant="h4">
                  {screenReaderCoverage.percentage.toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={screenReaderCoverage.percentage} 
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {screenReaderCoverage.coverage.filter(c => c.tested).length} of {screenReaders.length} readers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pass Rate
                </Typography>
                <Typography variant="h4">
                  {stats?.testStats.passRate.toFixed(0) || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.testStats.passRate || 0} 
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {stats?.testStats.passed || 0} of {stats?.testStats.total || 0} tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant="h4">
                  {reports.length}
                </Typography>
                <Box sx={{ mt: 1, mb: 1, height: 4 }} />
                <Typography variant="body2" color="textSecondary">
                  {stats?.issueCounts.total || 0} issues identified
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Roadmap Steps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Testing Journey</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index} completed={step.completed}>
              <StepLabel>
                <Typography variant="subtitle1">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  {step.description}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={step.progress}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {step.progress.toFixed(0)}% complete
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    component={Link}
                    to={step.link}
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowIcon />}
                  >
                    {step.linkText}
                  </Button>
                  
                  <Button
                    component={Link}
                    to={step.secondaryLink}
                    variant="outlined"
                  >
                    {step.secondaryLinkText}
                  </Button>
                  
                  {index < steps.length - 1 && (
                    <Button
                      onClick={() => setActiveStep(index + 1)}
                      sx={{ ml: 'auto' }}
                    >
                      Next Step
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* Next Steps */}
      {activeStep < steps.length - 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Suggested Next Actions</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {activeStep === 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TestIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">Run Your First Test</Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Start by testing a bar chart with NVDA screen reader. Follow the step-by-step guide to document your findings.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip icon={<HearingIcon />} label="NVDA" size="small" />
                      <Chip icon={<AssignmentIcon />} label="Bar Chart" size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/testing-guide"
                      size="small"
                    >
                      Testing Guide
                    </Button>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/test-recorder"
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      Start Testing
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
            
            {activeStep === 1 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">Test Remaining Chart Types</Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      You've made progress testing chart types, but still have some to go. Focus on these remaining types:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {chartTypeCoverage.coverage
                        .filter(c => !c.tested)
                        .map(chart => (
                          <Chip key={chart.type} label={chart.type} size="small" />
                        ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/test-recorder"
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      Continue Testing
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
            
            {activeStep === 2 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <HearingIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">Test with Additional Screen Readers</Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Great job testing all chart types! Now expand your testing to include these screen readers:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {screenReaderCoverage.coverage
                        .filter(c => !c.tested)
                        .map(reader => (
                          <Chip key={reader.reader} icon={<HearingIcon />} label={reader.reader} size="small" />
                        ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/testing-guide"
                      size="small"
                    >
                      Screen Reader Guide
                    </Button>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/test-recorder"
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      Record Results
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
            
            {activeStep === 3 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ReportIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">Analyze Test Results</Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Excellent progress! You've tested all chart types with all screen readers. Now analyze the results to identify improvement opportunities.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link}
                      to="/settings/accessibility/test-stats"
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      View Analytics
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <KeyboardIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Test Keyboard Navigation</Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    In addition to screen reader testing, verify that all charts are fully navigable using only the keyboard.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <UncheckedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Test arrow key navigation between data points" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <UncheckedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Test Home/End key navigation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <UncheckedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Test keyboard shortcuts (Alt+D, Alt+H, Alt+A)" />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/testing-guide"
                    size="small"
                    variant="contained"
                    color="primary"
                  >
                    Keyboard Testing Guide
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ChartAccessibilityRoadmap; 