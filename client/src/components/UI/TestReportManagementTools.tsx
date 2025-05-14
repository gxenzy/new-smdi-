import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  TextField,
  IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { 
  getTestReports, 
  deleteTestReport, 
  exportTestReports, 
  importTestReports, 
  TestReport 
} from '../../utils/accessibility/testReportStorage';

/**
 * Component for batch operations on test reports
 */
const TestReportManagementTools: React.FC<{
  refreshReports: () => void;
}> = ({ refreshReports }) => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [fileInputRef] = useState(React.createRef<HTMLInputElement>());
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [screenReaderFilter, setScreenReaderFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [issueFilter, setIssueFilter] = useState<'all' | 'any' | 'none' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);
  
  // Load all reports
  const loadReports = () => {
    const allReports = getTestReports();
    setReports(allReports);
    setSelectedReports([]);
    setAllSelected(false);
  };
  
  // Toggle all reports selection
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
    setAllSelected(!allSelected);
  };
  
  // Toggle individual report selection
  const toggleReportSelection = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    } else {
      setSelectedReports(prev => [...prev, reportId]);
    }
  };
  
  // Get filtered reports based on filter criteria
  const getFilteredReports = (): TestReport[] => {
    return reports.filter(report => {
      let match = true;
      
      // Chart type filter
      if (chartTypeFilter !== 'all') {
        match = match && report.chartType === chartTypeFilter;
      }
      
      // Screen reader filter
      if (screenReaderFilter !== 'all') {
        match = match && report.screenReader === screenReaderFilter;
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const reportDate = new Date(report.testDate);
        const now = new Date();
        
        if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          match = match && reportDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          match = match && reportDate >= monthAgo;
        } else if (dateFilter === 'year') {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          match = match && reportDate >= yearAgo;
        }
      }
      
      // Issue filter
      if (issueFilter !== 'all') {
        if (issueFilter === 'any') {
          match = match && report.issues.length > 0;
        } else if (issueFilter === 'none') {
          match = match && report.issues.length === 0;
        } else if (issueFilter === 'critical') {
          match = match && report.issues.some(issue => issue.severity === 'critical');
        }
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        match = match && (
          report.chartType.toLowerCase().includes(query) ||
          report.screenReader.toLowerCase().includes(query) ||
          report.browser.toLowerCase().includes(query) ||
          report.tester.toLowerCase().includes(query) ||
          report.issues.some(issue => issue.description.toLowerCase().includes(query))
        );
      }
      
      return match;
    });
  };
  
  const filteredReports = getFilteredReports();
  
  // Open delete confirmation dialog
  const openDeleteDialog = () => {
    if (selectedReports.length === 0) {
      showSnackbar('Please select reports to delete', 'warning');
      return;
    }
    setDeleteDialogOpen(true);
  };
  
  // Delete selected reports
  const deleteSelectedReports = () => {
    let deleteCount = 0;
    
    selectedReports.forEach(id => {
      if (deleteTestReport(id)) {
        deleteCount++;
      }
    });
    
    setDeleteDialogOpen(false);
    setSelectedReports([]);
    setAllSelected(false);
    loadReports();
    refreshReports();
    
    showSnackbar(`Deleted ${deleteCount} report${deleteCount !== 1 ? 's' : ''}`, 'success');
  };
  
  // Export selected reports
  const exportSelectedReports = () => {
    if (selectedReports.length === 0) {
      showSnackbar('Please select reports to export', 'warning');
      return;
    }
    
    const reportsToExport = reports.filter(report => selectedReports.includes(report.id));
    exportTestReports(reportsToExport);
    
    showSnackbar(`Exported ${reportsToExport.length} report${reportsToExport.length !== 1 ? 's' : ''}`, 'success');
  };
  
  // Import reports
  const handleImportReports = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      importTestReports(files[0])
        .then((importedReports) => {
          loadReports();
          refreshReports();
          showSnackbar(`Imported ${importedReports.length} report${importedReports.length !== 1 ? 's' : ''}`, 'success');
        })
        .catch(error => {
          console.error('Error importing reports:', error);
          showSnackbar('Error importing reports: ' + error.message, 'error');
        });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Get unique chart types from reports
  const getUniqueChartTypes = (): string[] => {
    const chartTypes = new Set(reports.map(report => report.chartType));
    return Array.from(chartTypes);
  };
  
  // Get unique screen readers from reports
  const getUniqueScreenReaders = (): string[] => {
    const screenReaders = new Set(reports.map(report => report.screenReader));
    return Array.from(screenReaders);
  };
  
  // Handle chart type filter change
  const handleChartTypeFilterChange = (event: SelectChangeEvent) => {
    setChartTypeFilter(event.target.value);
  };
  
  // Handle screen reader filter change
  const handleScreenReaderFilterChange = (event: SelectChangeEvent) => {
    setScreenReaderFilter(event.target.value);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (event: SelectChangeEvent) => {
    setDateFilter(event.target.value as 'all' | 'week' | 'month' | 'year');
  };
  
  // Handle issue filter change
  const handleIssueFilterChange = (event: SelectChangeEvent) => {
    setIssueFilter(event.target.value as 'all' | 'any' | 'none' | 'critical');
  };
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setChartTypeFilter('all');
    setScreenReaderFilter('all');
    setDateFilter('all');
    setIssueFilter('all');
    setSearchQuery('');
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Report Management Tools</Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />} 
              onClick={toggleFilterPanel}
              sx={{ mr: 1 }}
            >
              Filters
              {(chartTypeFilter !== 'all' || screenReaderFilter !== 'all' || dateFilter !== 'all' || issueFilter !== 'all' || searchQuery) && (
                <Chip 
                  size="small" 
                  label="Active" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={() => {
                loadReports();
                refreshReports();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {filterOpen && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter Reports
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="chart-type-filter-label">Chart Type</InputLabel>
                  <Select
                    labelId="chart-type-filter-label"
                    value={chartTypeFilter}
                    label="Chart Type"
                    onChange={handleChartTypeFilterChange}
                  >
                    <MenuItem value="all">All Chart Types</MenuItem>
                    {getUniqueChartTypes().map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="screen-reader-filter-label">Screen Reader</InputLabel>
                  <Select
                    labelId="screen-reader-filter-label"
                    value={screenReaderFilter}
                    label="Screen Reader"
                    onChange={handleScreenReaderFilterChange}
                  >
                    <MenuItem value="all">All Screen Readers</MenuItem>
                    {getUniqueScreenReaders().map(reader => (
                      <MenuItem key={reader} value={reader}>{reader}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="date-filter-label">Date Range</InputLabel>
                  <Select
                    labelId="date-filter-label"
                    value={dateFilter}
                    label="Date Range"
                    onChange={handleDateFilterChange}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                    <MenuItem value="year">Last Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="issue-filter-label">Issues</InputLabel>
                  <Select
                    labelId="issue-filter-label"
                    value={issueFilter}
                    label="Issues"
                    onChange={handleIssueFilterChange}
                  >
                    <MenuItem value="all">All Reports</MenuItem>
                    <MenuItem value="any">With Any Issues</MenuItem>
                    <MenuItem value="none">With No Issues</MenuItem>
                    <MenuItem value="critical">With Critical Issues</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Reports"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                      endAdornment: searchQuery && (
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )
                    }}
                  />
                  <Button 
                    variant="text" 
                    onClick={resetFilters} 
                    sx={{ ml: 2, whiteSpace: 'nowrap' }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                onChange={toggleSelectAll}
                disabled={filteredReports.length === 0}
              />
            }
            label={`Select All (${filteredReports.length})`}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={openDeleteDialog}
            disabled={selectedReports.length === 0}
          >
            Delete Selected
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportSelectedReports}
            disabled={selectedReports.length === 0}
          >
            Export Selected
          </Button>
          
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
        </Box>
        
        {filteredReports.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No reports match the current filters. Try adjusting your filters or create new test reports.
          </Alert>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Reports</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedReports.length} selected report{selectedReports.length !== 1 ? 's' : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteSelectedReports} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestReportManagementTools; 