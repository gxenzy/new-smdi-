import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { getTestReports, getTestReportStats, TestReport } from '../../utils/accessibility/testReportStorage';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

/**
 * Component to display statistics and analytics for accessibility test results
 */
const ChartAccessibilityTestStats: React.FC = () => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getTestReportStats> | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');
  
  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);
  
  // Update filtered reports when timeRange changes
  useEffect(() => {
    filterReportsByTimeRange();
  }, [timeRange]);
  
  // Load all reports
  const loadReports = () => {
    const allReports = getTestReports();
    setReports(allReports);
    setStats(getTestReportStats());
  };
  
  // Filter reports by time range
  const filterReportsByTimeRange = () => {
    const allReports = getTestReports();
    const now = new Date();
    
    let filteredReports = allReports;
    
    if (timeRange === 'week') {
      // Last 7 days
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredReports = allReports.filter(report => new Date(report.testDate) >= weekAgo);
    } else if (timeRange === 'month') {
      // Last 30 days
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredReports = allReports.filter(report => new Date(report.testDate) >= monthAgo);
    }
    
    setReports(filteredReports);
    
    // Calculate stats based on filtered reports
    // This is a simplified approach - ideally we'd refactor getTestReportStats to accept reports
    const tempStats = {
      totalReports: filteredReports.length,
      chartTypeCounts: {} as Record<string, number>,
      screenReaderCounts: {} as Record<string, number>,
      testStats: {
        total: 0,
        passed: 0,
        failed: 0,
        passRate: 0
      },
      issueCounts: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
    
    // Process filtered reports
    filteredReports.forEach(report => {
      // Chart type counts
      tempStats.chartTypeCounts[report.chartType] = (tempStats.chartTypeCounts[report.chartType] || 0) + 1;
      
      // Screen reader counts
      tempStats.screenReaderCounts[report.screenReader] = (tempStats.screenReaderCounts[report.screenReader] || 0) + 1;
      
      // Test result counts
      report.results.forEach(result => {
        tempStats.testStats.total++;
        if (result.passed) {
          tempStats.testStats.passed++;
        }
      });
      
      // Issue severity counts
      report.issues.forEach(issue => {
        tempStats.issueCounts.total++;
        tempStats.issueCounts[issue.severity as keyof typeof tempStats.issueCounts]++;
      });
    });
    
    // Calculate pass rate
    if (tempStats.testStats.total > 0) {
      tempStats.testStats.failed = tempStats.testStats.total - tempStats.testStats.passed;
      tempStats.testStats.passRate = (tempStats.testStats.passed / tempStats.testStats.total) * 100;
    }
    
    setStats(tempStats as any);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value as 'all' | 'month' | 'week');
  };
  
  // Chart data for pass/fail rates by chart type
  const passRateByChartTypeData = {
    labels: Object.keys(stats?.chartTypeCounts || {}),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: Object.keys(stats?.chartTypeCounts || {}).map(chartType => {
          const chartReports = reports.filter(r => r.chartType === chartType);
          let passed = 0;
          let total = 0;
          
          chartReports.forEach(report => {
            report.results.forEach(result => {
              total++;
              if (result.passed) passed++;
            });
          });
          
          return total > 0 ? (passed / total) * 100 : 0;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Chart data for issue distribution
  const issueDistributionData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats?.issueCounts?.critical || 0,
          stats?.issueCounts?.high || 0,
          stats?.issueCounts?.medium || 0,
          stats?.issueCounts?.low || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Chart data for test frequency trend
  const testFrequencyData = {
    labels: getLast6Months(),
    datasets: [
      {
        label: 'Number of Tests',
        data: getLast6Months().map(month => {
          const [monthName, year] = month.split(' ');
          return reports.filter(report => {
            const reportDate = new Date(report.testDate);
            return reportDate.getMonth() === getMonthNumber(monthName) && 
                  reportDate.getFullYear().toString() === year;
          }).length;
        }),
        fill: false,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        tension: 0.1
      }
    ]
  };
  
  // Helper to get last 6 months as strings
  function getLast6Months(): string[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      result.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
    }
    
    return result;
  }
  
  // Helper to convert month name to number
  function getMonthNumber(monthName: string): number {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthName as keyof typeof months];
  }
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '',
      },
    },
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Accessibility Testing Analytics
        </Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary stats cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalReports || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pass Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats?.testStats?.passRate.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.testStats?.passed || 0} of {stats?.testStats?.total || 0} tests passed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Issues
                  </Typography>
                  <Typography variant="h4">
                    {stats?.issueCounts?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.issueCounts?.critical || 0} critical, {stats?.issueCounts?.high || 0} high
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Most Tested
                  </Typography>
                  <Typography variant="h4">
                    {stats && Object.entries(stats.chartTypeCounts).length > 0
                      ? Object.entries(stats.chartTypeCounts)
                          .sort((a, b) => b[1] - a[1])[0][0]
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats && Object.entries(stats.chartTypeCounts).length > 0
                      ? `${Object.entries(stats.chartTypeCounts)
                          .sort((a, b) => b[1] - a[1])[0][1]} tests`
                      : 'No data'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Accessibility Pass Rate by Chart Type
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              {Object.keys(stats?.chartTypeCounts || {}).length > 0 ? (
                <Bar 
                  data={passRateByChartTypeData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Pass Rate by Chart Type (%)'
                      }
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: 100
                      }
                    }
                  }} 
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">
                    No data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Issue Distribution by Severity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              {stats?.issueCounts?.total ? (
                <Pie 
                  data={issueDistributionData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Issue Distribution by Severity'
                      }
                    }
                  }} 
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="textSecondary">
                    No issues reported
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Testing Frequency Trend
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              <Line 
                data={testFrequencyData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Number of Tests Per Month'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartAccessibilityTestStats; 