import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  InfoOutlined as InfoIcon,
  EditOutlined as EditIcon,
  VisibilityOutlined as ViewIcon,
  AddOutlined as AddIcon,
  DeleteOutlined as RemoveIcon,
  SyncOutlined as SyncIcon,
  WarningOutlined as WarningIcon,
  ErrorOutlined as ErrorIcon,
  CheckCircleOutlined as SuccessIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import useEnergyAuditRealTime from '../../hooks/useEnergyAuditRealTime';

export interface ActivityEvent {
  id: string;
  type: string;
  timestamp: number;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  message: string;
  userId: string;
  userName: string;
  status?: 'success' | 'error' | 'warning' | 'info' | 'pending';
  details?: any;
}

export interface ActivityLogProps {
  auditId?: string;
  maxEvents?: number;
  height?: string;
  showFilters?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  onEventClick?: (event: ActivityEvent) => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  auditId = 'sample-audit-id',
  maxEvents = 20,
  height = '400px',
  showFilters = false,
  compact = false,
  autoRefresh = false,
  onEventClick
}) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterExpanded, setFilterExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [useRealTimeUpdates, setUseRealTimeUpdates] = useState<boolean>(autoRefresh);
  
  // Get real-time context - use the provided auditId
  const { lastEvent } = useEnergyAuditRealTime(auditId);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
    
    // Set up auto-refresh interval if enabled
    let refreshInterval: any = null;
    if (useRealTimeUpdates) {
      refreshInterval = setInterval(() => {
        loadEvents(false);
      }, 15000); // Refresh every 15 seconds
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [useRealTimeUpdates]);
  
  // Update on real-time events
  useEffect(() => {
    if (lastEvent && lastEvent.type === 'activity' && useRealTimeUpdates) {
      addNewEvent(lastEvent.data);
    }
  }, [lastEvent, useRealTimeUpdates]);
  
  // Load activity events
  const loadEvents = (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockEvents: ActivityEvent[] = generateMockEvents(maxEvents);
      setEvents(mockEvents);
      setLoading(false);
    }, 800);
  };
  
  // Generate mock events for demonstration
  const generateMockEvents = (count: number): ActivityEvent[] => {
    const eventTypes = ['view', 'edit', 'create', 'delete', 'sync', 'login', 'export'];
    const resourceTypes = ['audit', 'finding', 'dataPoint', 'report', 'comment', 'document'];
    const statusOptions = ['success', 'error', 'warning', 'info', 'pending'];
    const userNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Alex Brown'];
    
    return Array(count).fill(0).map((_, index) => {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'success' | 'error' | 'warning' | 'info' | 'pending';
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const timestamp = Date.now() - Math.floor(Math.random() * 86400000); // Random time in the last 24 hours
      
      return {
        id: `activity-${index}`,
        type,
        timestamp,
        resourceType,
        resourceId: `${resourceType}-${1000 + Math.floor(Math.random() * 9000)}`,
        resourceName: `Sample ${resourceType} ${1000 + Math.floor(Math.random() * 9000)}`,
        message: generateMockMessage(type, resourceType, status),
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userName,
        status
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending
  };
  
  // Generate a mock message for an event
  const generateMockMessage = (type: string, resourceType: string, status: string): string => {
    switch (type) {
      case 'view':
        return `Viewed ${resourceType} details`;
      case 'edit':
        return `Updated ${resourceType} information`;
      case 'create':
        return `Created new ${resourceType}`;
      case 'delete':
        return `Deleted ${resourceType}`;
      case 'sync':
        return `Synchronized ${resourceType} data (${status})`;
      case 'login':
        return 'Logged into the system';
      case 'export':
        return `Exported ${resourceType} to report`;
      default:
        return `Performed action on ${resourceType}`;
    }
  };
  
  // Add a new event to the list
  const addNewEvent = (event: ActivityEvent) => {
    setEvents(prevEvents => {
      // Check if event already exists
      if (prevEvents.some(e => e.id === event.id)) {
        return prevEvents;
      }
      
      // Add new event and sort
      const newEvents = [event, ...prevEvents].sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to max events
      return newEvents.slice(0, maxEvents);
    });
  };
  
  // Filter events based on search query and filters
  const filteredEvents = events.filter(event => {
    // Apply search query filter
    const searchMatches = searchQuery === '' || 
      event.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    const typeMatches = selectedType === 'all' || event.type === selectedType;
    
    // Apply status filter
    const statusMatches = selectedStatus === 'all' || event.status === selectedStatus;
    
    return searchMatches && typeMatches && statusMatches;
  });
  
  // Get icon for event type
  const getEventIcon = (event: ActivityEvent) => {
    switch (event.type) {
      case 'view':
        return <ViewIcon color="primary" />;
      case 'edit':
        return <EditIcon color="primary" />;
      case 'create':
        return <AddIcon color="success" />;
      case 'delete':
        return <RemoveIcon color="error" />;
      case 'sync':
        return <SyncIcon color="primary" />;
      case 'login':
        return <InfoIcon color="primary" />;
      case 'export':
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get status icon/chip
  const getStatusIndicator = (status?: string) => {
    if (!status || status === 'info') {
      return null;
    }
    
    let icon;
    let color: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
    
    switch (status) {
      case 'success':
        icon = <SuccessIcon fontSize="small" />;
        color = 'success';
        break;
      case 'error':
        icon = <ErrorIcon fontSize="small" />;
        color = 'error';
        break;
      case 'warning':
        icon = <WarningIcon fontSize="small" />;
        color = 'warning';
        break;
      case 'pending':
        icon = <CircularProgress size={16} />;
        color = 'default';
        break;
      default:
        return null;
    }
    
    return (
      <Chip 
        size="small" 
        color={color} 
        label={status}
        icon={icon}
        sx={{ ml: 1 }}
      />
    );
  };
  
  // Handle event click
  const handleEventClick = (event: ActivityEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  // Render compact version
  if (compact) {
    return (
      <Card variant="outlined">
        <CardHeader
          title="Recent Activity"
          titleTypography={{ variant: 'subtitle1' }}
          action={
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => loadEvents()} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0, maxHeight: height, overflow: 'auto' }}>
          {loading && events.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredEvents.length > 0 ? (
                filteredEvents.slice(0, 5).map((event) => (
                  <ListItem 
                    key={event.id}
                    button 
                    onClick={() => handleEventClick(event)}
                    divider
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getEventIcon(event)}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.message}
                      secondary={`${formatDistanceToNow(new Date(event.timestamp))} ago`}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No activity to show"
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', align: 'center' }}
                  />
                </ListItem>
              )}
            </List>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Render full version
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Activity Log"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showFilters && (
              <Tooltip title="Show Filters">
                <IconButton 
                  size="small" 
                  onClick={() => setFilterExpanded(!filterExpanded)}
                  color={filterExpanded ? 'primary' : 'default'}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => loadEvents()} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      {filterExpanded && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="activity-type-label">Type</InputLabel>
                <Select
                  labelId="activity-type-label"
                  value={selectedType}
                  label="Type"
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="view">View</MenuItem>
                  <MenuItem value="edit">Edit</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="sync">Sync</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="activity-status-label">Status</InputLabel>
                <Select
                  labelId="activity-status-label"
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={useRealTimeUpdates}
                    onChange={(e) => setUseRealTimeUpdates(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto-update"
                sx={{ m: 0 }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Divider />
      
      <CardContent sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
        {loading && events.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <ListItem 
                  key={event.id}
                  alignItems="flex-start"
                  button 
                  onClick={() => handleEventClick(event)}
                  divider
                >
                  <ListItemIcon>
                    {getEventIcon(event)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" component="span">
                          {event.message}
                        </Typography>
                        {getStatusIndicator(event.status)}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="text.primary">
                          {event.resourceName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                            {formatDistanceToNow(new Date(event.timestamp))} ago
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            by {event.userName}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  No activity records found
                </Typography>
              </Box>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog; 