import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  LinearProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

// Real audit findings from manual inspections
const initialFindings: Finding[] = [
  {
    id: 'F-001',
    title: 'Inadequate Circuit Capacity in Computer Laboratory',
    description: 'Manual measurement shows circuit CB-3A is loaded to 92% of rated capacity (18.4A on 20A circuit). Multiple workstations and air conditioning units connected to same circuit.',
    location: 'Old Building - 3rd Floor - Computer Laboratory',
    severity: 'High',
    status: 'Open',
    assignedTo: 'Juan Cruz',
    reportedDate: '2023-11-15',
    dueDate: '2023-12-15',
    category: 'Electrical Overload',
    standard: 'PEC 2017 2.50',
    images: 2,
    comments: 3,
    progress: 20,
    measurements: {
      current: '18.4A',
      voltage: '218V',
      temperature: '42°C at connection point'
    },
    recommendations: 'Redistribute loads to additional circuits. Add dedicated circuit for AC units.'
  },
  {
    id: 'F-002',
    title: 'Excessive Ground Resistance at Main Panel',
    description: 'Ground resistance measured at 28 ohms using fall-of-potential method, exceeding the 25 ohm maximum specified by PEC. Soil conditions and inadequate grounding electrode are contributing factors.',
    location: 'Old Building - 1st Floor - Main Distribution Panel',
    severity: 'Critical',
    status: 'In Progress',
    assignedTo: 'Maria Santos',
    reportedDate: '2023-11-18',
    dueDate: '2023-11-30',
    category: 'Grounding Issue',
    standard: 'PEC 2017 4.10',
    images: 1,
    comments: 5,
    progress: 60,
    measurements: {
      resistance: '28 ohms',
      soilCondition: 'Dry clay',
      electrodeType: 'Single 8ft copper rod'
    },
    recommendations: 'Install additional ground rods in parallel to reduce resistance. Consider chemical ground enhancement.'
  },
  {
    id: 'F-003',
    title: 'Insufficient Illumination in Emergency Stairwell',
    description: 'Light level measured at 45 lux using calibrated light meter, below the required 100 lux minimum for emergency stairwells. Two fixtures non-functional, one with flickering tubes.',
    location: 'Old Building - North Stairwell',
    severity: 'Medium',
    status: 'Open',
    assignedTo: 'Unassigned',
    reportedDate: '2023-11-20',
    dueDate: '2023-12-20',
    category: 'Lighting',
    standard: 'PEC 2017 5.30',
    images: 3,
    comments: 1,
    progress: 0,
    measurements: {
      illuminance: '45 lux',
      requiredLevel: '100 lux',
      fixtureType: 'T8 fluorescent, 2x36W'
    },
    recommendations: 'Replace non-functional fixtures. Upgrade to LED fixtures with higher output.'
  },
  {
    id: 'F-004',
    title: 'Compromised Insulation on Main Feeder Cable',
    description: 'Visual inspection and insulation resistance test revealed damaged insulation on main power feed to computer lab. Megger test shows insulation resistance of 0.8 MΩ, below the 1.0 MΩ minimum acceptable value.',
    location: 'Old Building - 2nd Floor - Computer Lab Feeder',
    severity: 'High',
    status: 'Resolved',
    assignedTo: 'Carlos Reyes',
    reportedDate: '2023-10-05',
    dueDate: '2023-10-20',
    category: 'Wiring',
    standard: 'PEC 2017 3.10',
    images: 4,
    comments: 7,
    progress: 100,
    measurements: {
      insulationResistance: '0.8 MΩ',
      cableType: 'THHN 3/0 AWG',
      testVoltage: '500V DC'
    },
    recommendations: 'Replace damaged section of feeder cable with proper splicing techniques.'
  },
  {
    id: 'F-005',
    title: 'Non-functional Emergency Lighting',
    description: 'Battery backup emergency lighting fixture in east corridor failed load test. Battery voltage drops from 12.2V to 9.8V within 15 minutes (should maintain >10.5V for 90 minutes).',
    location: 'Old Building - 1st Floor - East Corridor',
    severity: 'Medium',
    status: 'In Progress',
    assignedTo: 'Ana Lim',
    reportedDate: '2023-11-10',
    dueDate: '2023-12-10',
    category: 'Emergency Systems',
    standard: 'PEC 2017 7.05',
    images: 1,
    comments: 2,
    progress: 75,
    measurements: {
      batteryVoltage: '12.2V initial, 9.8V after 15min',
      requiredDuration: '90 minutes',
      batteryType: 'Sealed Lead Acid 12V 7Ah'
    },
    recommendations: 'Replace battery pack. Verify charging circuit operation.'
  }
];

// Extended interface for finding object with measurement data
interface Finding {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  reportedDate: string;
  dueDate: string;
  category: string;
  standard: string;
  images: number;
  comments: number;
  progress: number;
  measurements?: Record<string, string>;
  recommendations?: string;
}

const FindingsManagement: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Finding | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open dialog to add new finding
  const handleAddFinding = () => {
    setCurrentFinding(null);
    setOpenDialog(true);
  };

  // Open dialog to edit finding
  const handleEditFinding = (finding: Finding) => {
    setCurrentFinding(finding);
    setOpenDialog(true);
  };

  // Open confirm dialog to delete finding
  const handleDeleteClick = (finding: Finding) => {
    setCurrentFinding(finding);
    setDeleteConfirmOpen(true);
  };

  // Delete finding
  const handleDeleteConfirm = () => {
    if (currentFinding) {
      setFindings(findings.filter(f => f.id !== currentFinding.id));
      setDeleteConfirmOpen(false);
      setCurrentFinding(null);
    }
  };

  // Close dialogs
  const handleClose = () => {
    setOpenDialog(false);
    setDeleteConfirmOpen(false);
    setCurrentFinding(null);
  };

  // Handle filter changes
  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };

  const handleFilterSeverityChange = (event: SelectChangeEvent) => {
    setFilterSeverity(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Apply filters
  const filteredFindings = findings.filter(finding => {
    const matchesStatus = filterStatus === 'all' || finding.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || finding.severity === filterSeverity;
    const matchesSearch = 
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // Get severity icon based on severity level
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <ErrorIcon color="error" />;
      case 'High':
        return <WarningIcon sx={{ color: 'orange' }} />;
      case 'Medium':
        return <InfoIcon color="primary" />;
      case 'Low':
        return <InfoIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  // Get status chip based on status
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Open':
        return <Chip label="Open" color="error" size="small" />;
      case 'In Progress':
        return <Chip label="In Progress" color="warning" size="small" />;
      case 'Resolved':
        return <Chip label="Resolved" color="success" size="small" />;
      case 'Closed':
        return <Chip label="Closed" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Energy Audit Findings
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddFinding}
        >
          Add Finding
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Findings
              </Typography>
              <Typography variant="h4">
                {findings.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {findings.filter(f => f.status === 'Open' || f.status === 'In Progress').length} active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Issues
              </Typography>
              <Typography variant="h4">
                {findings.filter(f => f.severity === 'Critical').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  Requires immediate attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved Issues
              </Typography>
              <Typography variant="h4">
                {findings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success">
                  Successfully addressed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unassigned Issues
              </Typography>
              <Typography variant="h4">
                {findings.filter(f => f.assignedTo === 'Unassigned').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="warning.main">
                  Needs assignment
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search findings..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Status"
                onChange={handleFilterStatusChange}
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="severity-filter-label">Severity</InputLabel>
              <Select
                labelId="severity-filter-label"
                id="severity-filter"
                value={filterSeverity}
                label="Severity"
                onChange={handleFilterSeverityChange}
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined"
              onClick={() => {
                setFilterStatus('all');
                setFilterSeverity('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Findings Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="findings table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Finding</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFindings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((finding) => (
                <TableRow key={finding.id} hover>
                  <TableCell component="th" scope="row">
                    {finding.id}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{finding.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                        {finding.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={finding.category} 
                          size="small" 
                          sx={{ mr: 1, fontSize: '0.7rem' }} 
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <Tooltip title={`${finding.images} images`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <ImageIcon fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>{finding.images}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title={`${finding.comments} comments`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CommentIcon fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>{finding.comments}</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{finding.location}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSeverityIcon(finding.severity)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {finding.severity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(finding.status)}</TableCell>
                  <TableCell>{finding.assignedTo}</TableCell>
                  <TableCell>{finding.dueDate}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={finding.progress} 
                          color={
                            finding.progress === 100 ? "success" :
                            finding.progress > 50 ? "primary" :
                            finding.progress > 0 ? "warning" : "error"
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{`${finding.progress}%`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditFinding(finding)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(finding)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Attach Files">
                        <IconButton size="small">
                          <AttachFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
            ))}
            {filteredFindings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="subtitle1" sx={{ py: 2 }}>
                    No findings match your search criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFindings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Finding Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{currentFinding ? 'Edit Finding' : 'Add New Finding'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                defaultValue={currentFinding?.title || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                defaultValue={currentFinding?.location || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                defaultValue={currentFinding?.description || ''}
                helperText="Include specific measurements and observed conditions"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  defaultValue={currentFinding?.severity || 'Medium'}
                  label="Severity"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={currentFinding?.status || 'Open'}
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assigned To"
                defaultValue={currentFinding?.assignedTo || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                defaultValue={currentFinding?.dueDate || new Date().toISOString().split('T')[0]}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                defaultValue={currentFinding?.category || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Standard Reference"
                defaultValue={currentFinding?.standard || ''}
                helperText="e.g., PEC 2017 4.10"
              />
            </Grid>
            
            {/* New Measurement Fields */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                Measurement Data
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Current (A)"
                      defaultValue={currentFinding?.measurements?.current || ''}
                      placeholder="e.g., 18.4A"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Voltage (V)"
                      defaultValue={currentFinding?.measurements?.voltage || ''}
                      placeholder="e.g., 218V"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Temperature"
                      defaultValue={currentFinding?.measurements?.temperature || ''}
                      placeholder="e.g., 42°C"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Resistance"
                      defaultValue={currentFinding?.measurements?.resistance || ''}
                      placeholder="e.g., 28 ohms"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Illuminance"
                      defaultValue={currentFinding?.measurements?.illuminance || ''}
                      placeholder="e.g., 45 lux"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recommendations"
                multiline
                rows={2}
                defaultValue={currentFinding?.recommendations || ''}
                helperText="Provide specific corrective actions based on measurements"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Progress</InputLabel>
                <Select
                  defaultValue={currentFinding?.progress.toString() || '0'}
                  label="Progress"
                >
                  <MenuItem value="0">0% - Not Started</MenuItem>
                  <MenuItem value="25">25% - Planning</MenuItem>
                  <MenuItem value="50">50% - In Progress</MenuItem>
                  <MenuItem value="75">75% - Testing</MenuItem>
                  <MenuItem value="100">100% - Complete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>
            {currentFinding ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the finding "{currentFinding?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FindingsManagement; 