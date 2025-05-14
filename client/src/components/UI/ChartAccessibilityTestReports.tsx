import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ChartType } from 'chart.js';
import {
  getTestReports,
  deleteTestReport,
  exportTestReports,
  importTestReports,
  getTestReportStats,
  TestReport
} from '../../utils/accessibility/testReportStorage';
import TestReportManagementTools from './TestReportManagementTools';

/**
 * Component to view and manage saved accessibility test reports
 */
const ChartAccessibilityTestReports: React.FC = () => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getTestReportStats> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileInputRef] = useState(React.createRef<HTMLInputElement>());
  
  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);
  
  // Load reports from storage
  const loadReports = () => {
    const loadedReports = getTestReports();
    setReports(loadedReports);
    setStats(getTestReportStats());
  };
  
  // View report details
  const viewReport = (report: TestReport) => {
    setSelectedReport(report);
    setReportDialogOpen(true);
  };
  
  // Close report dialog
  const closeReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedReport(null);
  };
  
  // Open delete confirmation dialog
  const confirmDelete = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };
  
  // Delete report
  const handleDelete = () => {
    if (reportToDelete) {
      deleteTestReport(reportToDelete);
      loadReports(); // Refresh reports list
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };
  
  // Export all reports
  const handleExportReports = () => {
    exportTestReports();
  };
  
  // Import reports
  const handleImportReports = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      importTestReports(files[0])
        .then(() => {
          loadReports(); // Refresh reports list
        })
        .catch(error => {
          console.error('Error importing reports:', error);
          // Could add a snackbar message here
        });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Filter reports by search query
  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.chartType.toLowerCase().includes(searchLower) ||
      report.screenReader.toLowerCase().includes(searchLower) ||
      report.browser.toLowerCase().includes(searchLower) ||
      report.tester.toLowerCase().includes(searchLower)
    );
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Get pass rate for a report
  const getPassRate = (report: TestReport) => {
    if (report.results.length === 0) return 0;
    
    const passedCount = report.results.filter(r => r.passed).length;
    return (passedCount / report.results.length) * 100;
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Accessibility Test Reports
      </Typography>
      
      <Typography variant="body1" paragraph>
        View and manage saved accessibility test reports.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Test Report Statistics
              </Typography>
              <Button
                component={Link}
                to="/settings/accessibility/test-stats"
                variant="outlined"
                startIcon={<AssessmentIcon />}
                size="small"
              >
                View Detailed Analytics
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {stats && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Reports
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalReports}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Tests Performed
                      </Typography>
                      <Typography variant="h4">
                        {stats.testStats.total}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={stats.testStats.passRate} 
                          sx={{ flex: 1, mr: 1 }} 
                        />
                        <Typography variant="body2">
                          {stats.testStats.passRate.toFixed(1)}% Pass
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Issues Found
                      </Typography>
                      <Typography variant="h4">
                        {stats.issueCounts?.total || 0}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          size="small" 
                          color="error" 
                          label={`${stats.issueCounts?.critical || 0} Critical`} 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        <Chip 
                          size="small" 
                          color="warning" 
                          label={`${stats.issueCounts?.high || 0} High`} 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        <Chip 
                          size="small" 
                          color="info" 
                          label={`${stats.issueCounts?.medium || 0} Medium`} 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        <Chip 
                          size="small" 
                          label={`${stats.issueCounts?.low || 0} Low`} 
                          sx={{ mb: 1 }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Most Tested Chart
                      </Typography>
                      {Object.entries(stats.chartTypeCounts).length > 0 ? (
                        <>
                          <Typography variant="h4">
                            {Object.entries(stats.chartTypeCounts)
                              .sort((a, b) => b[1] - a[1])[0][0]}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {Object.entries(stats.chartTypeCounts)
                              .sort((a, b) => b[1] - a[1])[0][1]} tests
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1">No data</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
        
        {/* Tools and Search */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Search Reports"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImportReports}
                />
                <Button 
                  variant="outlined" 
                  startIcon={<UploadIcon />} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import Reports
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={handleExportReports}
                >
                  Export All Reports
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/settings/accessibility/test-recorder"
                  startIcon={<AddIcon />}
                >
                  Create New Test
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Advanced Report Management */}
        <Grid item xs={12}>
          <TestReportManagementTools refreshReports={loadReports} />
        </Grid>
        
        {/* Reports Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Reports
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {filteredReports.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No test reports found. Use the Accessibility Test Recorder to create reports.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Chart Type</TableCell>
                      <TableCell>Screen Reader</TableCell>
                      <TableCell>Tester</TableCell>
                      <TableCell>Pass Rate</TableCell>
                      <TableCell>Issues</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(report.testDate)}</TableCell>
                        <TableCell>{report.chartType}</TableCell>
                        <TableCell>{report.screenReader}</TableCell>
                        <TableCell>{report.tester}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={getPassRate(report)} 
                              sx={{ width: 100, mr: 1 }} 
                            />
                            <Typography variant="body2">
                              {getPassRate(report).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {report.issues.length > 0 ? (
                            <Box>
                              {report.issues.map((issue, index) => (
                                index < 2 && (
                                  <Tooltip key={issue.id} title={issue.description}>
                                    <Chip 
                                      size="small" 
                                      color={getSeverityColor(issue.severity) as any} 
                                      label={issue.severity} 
                                      sx={{ mr: 0.5, mb: 0.5 }} 
                                    />
                                  </Tooltip>
                                )
                              ))}
                              {report.issues.length > 2 && (
                                <Tooltip title={`${report.issues.length - 2} more issues`}>
                                  <Chip 
                                    size="small" 
                                    label={`+${report.issues.length - 2}`} 
                                    sx={{ mb: 0.5 }} 
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2">None</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <IconButton size="small" onClick={() => viewReport(report)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => confirmDelete(report.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Report Details Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={closeReportDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              Test Report: {selectedReport.chartType} Chart with {selectedReport.screenReader}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Test Date:</Typography>
                  <Typography variant="body1" gutterBottom>{formatDate(selectedReport.testDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Tester:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedReport.tester}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Browser:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedReport.browser}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">OS:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedReport.os}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Test Results</Typography>
                  
                  {/* Test Results */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Test Results Summary ({selectedReport.results.filter(r => r.passed).length}/{selectedReport.results.length} Passed)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Test</TableCell>
                              <TableCell>Result</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedReport.results.map((result) => (
                              <TableRow key={result.id}>
                                <TableCell>{result.testId}</TableCell>
                                <TableCell>{result.testName}</TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    color={result.passed ? 'success' : 'error'} 
                                    label={result.passed ? 'Pass' : 'Fail'} 
                                  />
                                </TableCell>
                                <TableCell>{result.notes}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Issues */}
                  <Accordion defaultExpanded={selectedReport.issues.length > 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Issues ({selectedReport.issues.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedReport.issues.length === 0 ? (
                        <Typography variant="body2">No issues reported.</Typography>
                      ) : (
                        <Box>
                          {selectedReport.issues.map((issue) => (
                            <Paper key={issue.id} sx={{ p: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1">{issue.description}</Typography>
                                <Chip 
                                  label={issue.severity} 
                                  color={getSeverityColor(issue.severity) as any} 
                                  size="small" 
                                />
                              </Box>
                              <Typography variant="body2"><strong>Steps to Reproduce:</strong> {issue.stepsToReproduce}</Typography>
                              <Typography variant="body2"><strong>Expected Behavior:</strong> {issue.expectedBehavior}</Typography>
                              <Typography variant="body2"><strong>Actual Behavior:</strong> {issue.actualBehavior}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Recommendations */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Recommendations ({selectedReport.recommendations.filter(r => r.trim() !== '').length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {selectedReport.recommendations.filter(r => r.trim() !== '').length === 0 ? (
                        <Typography variant="body2">No recommendations provided.</Typography>
                      ) : (
                        <Box component="ol" sx={{ pl: 2 }}>
                          {selectedReport.recommendations.filter(r => r.trim() !== '').map((rec, index) => (
                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                              {rec}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Additional Notes */}
                  {selectedReport.additionalNotes.trim() !== '' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body1">
                          {selectedReport.additionalNotes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeReportDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Delete Test Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this test report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChartAccessibilityTestReports; 