import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  CircularProgress,
  Pagination
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useCircuitSync, SyncEvent, SyncEventFilter } from '../../../../contexts/CircuitSynchronizationContext';
import SyncHistoryVisualization from './SyncHistoryVisualization';

// Define props for the dialog
interface SyncHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

const SyncHistoryDialog: React.FC<SyncHistoryDialogProps> = ({ open, onClose }) => {
  const circuitSync = useCircuitSync();
  
  // State for sync history
  const [loading, setLoading] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState<SyncEventFilter>({
    types: [],
    sources: [],
    startDate: null,
    endDate: null,
    search: '',
    offset: 0,
    limit: 10,
    startTime: undefined,
    endTime: undefined,
    searchTerm: '',
  });
  
  // State for visualization view
  const [showVisualization, setShowVisualization] = useState(false);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  
  // State for events
  const [events, setEvents] = useState<SyncEvent[]>([]);

  // Get total event count for pagination
  useEffect(() => {
    if (open) {
      setLoading(true);
      circuitSync.getSyncEvents(filters).then(result => {
        setEvents(result.events);
        setTotalEvents(result.total);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [open, filters, circuitSync]);
  
  // Update offset when page changes
  useEffect(() => {
    setFilters((prev: SyncEventFilter) => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 10)
    }));
  }, [page]);
  
  // Handle filter changes
  const handleFilterChange = (field: keyof SyncEventFilter) => (
    e: SelectChangeEvent<unknown>
  ) => {
    const value = e.target.value;
    
    setFilters((prev: SyncEventFilter) => ({
      ...prev,
      [field]: value,
      // Reset pagination when filters change
      offset: 0
    }));
    setPage(1);
  };
  
  // Handle text field changes
  const handleTextFieldChange = (field: keyof SyncEventFilter) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    
    setFilters((prev: SyncEventFilter) => ({
      ...prev,
      [field]: value,
      // Reset pagination when filters change
      offset: 0
    }));
    setPage(1);
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      types: [],
      sources: [],
      startDate: null,
      endDate: null,
      search: '',
      offset: 0,
      limit: 10,
      startTime: undefined,
      endTime: undefined,
      searchTerm: '',
    });
    setPage(1);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get icon for event type
  const getEventIcon = (event: SyncEvent) => {
    switch (event.type) {
      case 'sync-requested':
        return <SyncIcon />;
      case 'sync-completed':
        return event.data.successful ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
      case 'circuit-updated':
      case 'circuit-created':
      case 'load-schedule-updated':
      case 'load-item-updated':
        return <InfoIcon color="primary" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };
  
  // Get color for source chip
  const getSourceColor = (source: string): 'primary' | 'secondary' | 'default' => {
    switch (source) {
      case 'voltage-drop':
        return 'primary';
      case 'schedule-of-loads':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Get description text for event
  const getEventDescription = (event: SyncEvent): string => {
    switch (event.type) {
      case 'sync-requested':
        return `Sync requested${event.data.manual ? ' manually' : ' automatically'}`;
      
      case 'sync-completed':
        if (event.data.successful) {
          return `Sync completed successfully in ${event.data.duration}ms. Processed ${event.data.circuitsProcessed || 0} circuits and ${event.data.loadSchedulesProcessed || 0} load schedules.`;
        } else {
          return `Sync failed: ${event.data.error || 'Unknown error'}`;
        }
      
      case 'circuit-updated':
        return `Circuit "${event.data.name || event.data.id}" updated`;
      
      case 'circuit-created':
        return `Circuit "${event.data.name || event.data.id}" created`;
      
      case 'circuit-deleted':
        return `Circuit "${event.data.name || event.data.id}" deleted`;
      
      case 'load-schedule-updated':
        return `Load schedule "${event.data.name || event.data.id}" updated`;
      
      case 'load-item-updated':
        return `Load item "${event.data.loadItem?.description || 'unknown'}" in schedule "${event.data.loadScheduleId}" updated`;
      
      default:
        return `Event: ${event.type}`;
    }
  };
  
  // Export history to CSV
  const exportToCSV = () => {
    const csvHeader = 'Timestamp,Event Type,Source,Description\n';
    const csvRows = events.map((event: SyncEvent) => {
      return `"${formatTimestamp(event.timestamp)}","${event.type}","${event.source}","${getEventDescription(event).replace(/"/g, '""')}"`;
    });
    const csvContent = csvHeader + csvRows.join('\n');
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sync-events-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render filters
  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1">
          Filter Sync History
        </Typography>
        <Box flexGrow={1} />
        <Button 
          size="small" 
          startIcon={<ClearAllIcon />}
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Event Type</InputLabel>
            <Select
              multiple
              value={filters.types || []}
              onChange={handleFilterChange('types')}
              label="Event Type"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="sync-requested">Sync Requested</MenuItem>
              <MenuItem value="sync-completed">Sync Completed</MenuItem>
              <MenuItem value="circuit-updated">Circuit Updated</MenuItem>
              <MenuItem value="circuit-created">Circuit Created</MenuItem>
              <MenuItem value="circuit-deleted">Circuit Deleted</MenuItem>
              <MenuItem value="load-schedule-updated">Load Schedule Updated</MenuItem>
              <MenuItem value="load-item-updated">Load Item Updated</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Source</InputLabel>
            <Select
              multiple
              value={filters.sources || []}
              onChange={handleFilterChange('sources')}
              label="Source"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="voltage-drop">Voltage Drop</MenuItem>
              <MenuItem value="schedule-of-loads">Schedule of Loads</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Start Date"
            type="date"
            value={filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
              setFilters((prev: SyncEventFilter) => ({ ...prev, startDate: date ? new Date(date).toISOString().slice(0, 10) : null, offset: 0 }));
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="End Date"
            type="date"
            value={filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => {
              let date = e.target.value ? new Date(e.target.value) : undefined;
              if (date) {
                // Set to end of day
                date.setHours(23, 59, 59, 999);
              }
              setFilters((prev: SyncEventFilter) => ({ ...prev, endDate: date ? date.toISOString().slice(0, 10) : null, offset: 0 }));
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Search in event data..."
            value={filters.search || ''}
            onChange={handleTextFieldChange('search')}
          />
        </Grid>
      </Grid>
    </Paper>
  );
  
  // Render history table
  const renderHistoryTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {circuitSync.syncEvents.length === 0 
                    ? "No synchronization events recorded yet." 
                    : "No sync events found matching the current filters."}
                </Typography>
              </TableCell>
            </TableRow>
          ) :
            events.map((event: SyncEvent, index: number) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatTimestamp(event.timestamp)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getEventIcon(event)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {event.type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={event.source} 
                    size="small" 
                    color={getSourceColor(event.source) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getEventDescription(event)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Render visualization view
  const renderVisualization = () => (
    <SyncHistoryVisualization events={events} loading={loading} />
  );
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <SyncIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Synchronization History
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Toggle Visualization View">
              <IconButton 
                onClick={() => setShowVisualization(!showVisualization)}
                color={showVisualization ? "primary" : "default"}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to CSV">
              <IconButton onClick={exportToCSV}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {renderFilters()}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2">
            {loading 
              ? 'Loading events...' 
              : `${totalEvents} ${totalEvents === 1 ? 'event' : 'events'} found (showing ${events.length})`}
          </Typography>
        </Box>
        
        {showVisualization ? renderVisualization() : renderHistoryTable()}
        
        {/* Pagination */}
        {totalEvents > 0 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination 
              count={Math.ceil(totalEvents / (filters.limit || 10))} 
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncHistoryDialog; 