import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  BarChart as ChartIcon,
  Assessment as ReportIcon,
  Create as RecorderIcon,
  Hearing as HearingIcon,
  Visibility as TestIcon,
  Dashboard as DashboardIcon,
  KeyboardAlt as KeyboardIcon,
  ColorLens as ColorIcon,
  ArrowForward as ArrowIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getTestReports, getTestReportStats, TestReport } from '../../utils/accessibility/testReportStorage';
import { ChartType } from 'chart.js';

/**
 * Central dashboard for accessibility testing tools
 */
const AccessibilityTestingDashboard: React.FC = () => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getTestReportStats> | null>(null);
  const [latestReports, setLatestReports] = useState<TestReport[]>([]);
  
  // List of chart types we want to ensure are tested
  const chartTypes: ChartType[] = ['bar', 'line', 'pie', 'doughnut', 'radar', 'scatter'];
  
  // List of screen readers we want to ensure are tested with
  const screenReaders: Array<'NVDA' | 'JAWS' | 'VoiceOver' | 'Narrator' | 'TalkBack' | 'Other'> = ['NVDA', 'JAWS', 'VoiceOver', 'Narrator'];
  
  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);
  
  // Load reports and calculate stats
  const loadReports = () => {
    const allReports = getTestReports();
    setReports(allReports);
    setStats(getTestReportStats());
    
    // Get the 3 most recent reports
    const sortedReports = [...allReports].sort((a, b) => 
      new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    );
    setLatestReports(sortedReports.slice(0, 3));
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
  
  const chartTypeCoverage = getChartTypeCoverage();
  const screenReaderCoverage = getScreenReaderCoverage();
  
  // Get pass rate for a report
  const getPassRate = (report: TestReport) => {
    if (report.results.length === 0) return 0;
    
    const passedCount = report.results.filter(r => r.passed).length;
    return (passedCount / report.results.length) * 100;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Accessibility Testing Dashboard
      </Typography>
      
      <Typography variant="body1" paragraph>
        Central dashboard for managing chart accessibility testing. Track your testing progress, access testing tools, and view recent test results.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Testing Progress
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {chartTypeCoverage.coverage.map((chart) => (
                        <Chip 
                          key={chart.type}
                          label={chart.type}
                          color={chart.tested ? "success" : "default"}
                          size="small"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {screenReaderCoverage.coverage.map((reader) => (
                        <Chip 
                          key={reader.reader}
                          label={reader.reader}
                          color={reader.tested ? "success" : "default"}
                          size="small"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Tests
                    </Typography>
                    <Typography variant="h4">
                      {stats?.testStats.total || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats?.testStats.passed || 0} passed
                      ({stats?.testStats.passRate.toFixed(1) || 0}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Issues Found
                    </Typography>
                    <Typography variant="h4">
                      {stats?.issueCounts.total || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats?.issueCounts.critical || 0} critical,
                      {stats?.issueCounts.high || 0} high
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Latest Reports */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Latest Test Reports
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {latestReports.length === 0 ? (
              <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                No test reports available. Start testing with the recorder.
              </Typography>
            ) : (
              <List>
                {latestReports.map((report) => (
                  <ListItem key={report.id} divider sx={{ display: 'block' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {report.chartType} Chart with {report.screenReader}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(report.testDate)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '50%' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getPassRate(report)} 
                          />
                        </Box>
                        <Typography variant="body2">
                          {getPassRate(report).toFixed(0)}%
                        </Typography>
                      </Box>
                      
                      <Button 
                        component={Link}
                        to={`/settings/accessibility/test-reports`}
                        size="small"
                        endIcon={<ArrowIcon />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to="/settings/accessibility/test-reports"
                variant="outlined"
                endIcon={<ReportIcon />}
              >
                All Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Testing Tools */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Testing Tools
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MapIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Testing Roadmap</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Step-by-step guide for comprehensive chart accessibility testing with progress tracking.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/roadmap"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    View Roadmap
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RecorderIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Test Recorder</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Document your findings when testing charts with screen readers and assistive technologies.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/test-recorder"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    Open Recorder
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TestIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Test Suite</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Automated testing suite for evaluating chart accessibility compliance with WCAG guidelines.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/test-suite"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    Open Test Suite
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HearingIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Testing Guide</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Step-by-step guides for testing with NVDA, JAWS, VoiceOver, and keyboard-only navigation.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/testing-guide"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    View Guide
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ChartIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Test Analytics</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Data visualizations and analytics for tracking testing progress and identifying patterns.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/test-stats"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    View Analytics
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColorIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Color Blindness Demo</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Simulations to visualize how charts appear to users with different types of color vision deficiency.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/color-blindness"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    View Demo
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <KeyboardIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6">Keyboard Demo</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Interactive example of keyboard navigation for charts with focus indicators and shortcuts.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to="/settings/accessibility/screen-reader"
                    size="small"
                    endIcon={<ArrowIcon />}
                  >
                    View Demo
                  </Button>
                </CardActions>
              </Card>
            </Stack>
          </Paper>
        </Grid>
        
        {/* Testing Suggestions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Suggested Next Tests
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {!chartTypeCoverage.coverage.every(c => c.tested) && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Chart Types to Test
                      </Typography>
                      <List dense>
                        {chartTypeCoverage.coverage
                          .filter(c => !c.tested)
                          .map(chart => (
                            <ListItem key={chart.type}>
                              <ListItemIcon>
                                <ChartIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary={`${chart.type} Chart`}
                                secondary="Not yet tested"
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        component={Link}
                        to="/settings/accessibility/test-recorder"
                        size="small"
                      >
                        Start Testing
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              )}
              
              {!screenReaderCoverage.coverage.every(c => c.tested) && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Screen Readers to Test
                      </Typography>
                      <List dense>
                        {screenReaderCoverage.coverage
                          .filter(c => !c.tested)
                          .map(reader => (
                            <ListItem key={reader.reader}>
                              <ListItemIcon>
                                <HearingIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary={reader.reader}
                                secondary="Not yet tested"
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        component={Link}
                        to="/settings/accessibility/testing-guide"
                        size="small"
                      >
                        View Testing Guide
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              )}
              
              {chartTypeCoverage.coverage.every(c => c.tested) && 
               screenReaderCoverage.coverage.every(c => c.tested) && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">
                      Great job! You've tested all chart types with all screen readers. 
                      Consider re-testing with specific combinations or testing additional scenarios.
                    </Typography>
                    <Button
                      component={Link}
                      to="/settings/accessibility/test-stats"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      View Test Analytics
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccessibilityTestingDashboard; 