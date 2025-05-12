import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';

import {
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  NotificationsActive as NotificationsIcon,
  AssignmentTurnedIn as CompletedIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Define types for our task data
interface TaskComment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface AuditTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
  priority: string;
  dueDate: string;
  completedDate?: string;
  approvalStatus: string;
  approvedBy?: string;
  comments: TaskComment[];
}

// Type for new tasks that don't yet have all required fields
type NewAuditTask = Partial<AuditTask> & { comments: TaskComment[] };

// Mock data - in a real app this would come from your API
const mockAuditTasks = [
  {
    id: '1',
    title: 'Initial Site Assessment',
    description: 'Perform initial walkthrough and identify key areas for detailed audit',
    assignedTo: 'John Doe',
    status: 'completed',
    priority: 'high',
    dueDate: '2023-10-15',
    completedDate: '2023-10-14',
    approvalStatus: 'approved',
    approvedBy: 'Jane Smith',
    comments: [
      { id: '1', text: 'Completed on schedule', author: 'John Doe', date: '2023-10-14' },
      { id: '2', text: 'Approved - good work', author: 'Jane Smith', date: '2023-10-15' }
    ]
  },
  {
    id: '2',
    title: 'HVAC System Evaluation',
    description: 'Conduct detailed assessment of HVAC efficiency and performance',
    assignedTo: 'Sarah Johnson',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2023-10-20',
    approvalStatus: 'pending',
    comments: [
      { id: '3', text: 'Started evaluation, found several inefficiencies', author: 'Sarah Johnson', date: '2023-10-16' }
    ]
  },
  {
    id: '3',
    title: 'Lighting System Audit',
    description: 'Evaluate lighting systems and recommend energy efficient alternatives',
    assignedTo: 'Michael Brown',
    status: 'not_started',
    priority: 'medium',
    dueDate: '2023-10-25',
    approvalStatus: 'not_submitted',
    comments: []
  },
  {
    id: '4',
    title: 'Building Envelope Assessment',
    description: 'Inspect insulation, windows, and building envelope for energy loss',
    assignedTo: 'Emma Wilson',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2023-10-22',
    approvalStatus: 'pending',
    comments: [
      { id: '4', text: 'Found significant air leakage around windows', author: 'Emma Wilson', date: '2023-10-17' }
    ]
  },
  {
    id: '5',
    title: 'Final Report Compilation',
    description: 'Compile findings from all assessments into final audit report',
    assignedTo: 'John Doe',
    status: 'not_started',
    priority: 'high',
    dueDate: '2023-11-01',
    approvalStatus: 'not_submitted',
    comments: []
  }
];

const mockUsers = [
  { id: '1', name: 'John Doe', role: 'Energy Auditor' },
  { id: '2', name: 'Jane Smith', role: 'Audit Manager' },
  { id: '3', name: 'Sarah Johnson', role: 'HVAC Specialist' },
  { id: '4', name: 'Michael Brown', role: 'Lighting Specialist' },
  { id: '5', name: 'Emma Wilson', role: 'Building Inspector' }
];

const AuditManagementWorkflow: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState<any[]>(mockAuditTasks);
  const [loading, setLoading] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data - in a real app, this would be an API call
  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setTasks(mockAuditTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateTask = () => {
    setCurrentTask({
      id: '',
      title: '',
      description: '',
      assignedTo: '',
      status: 'not_started',
      priority: 'medium',
      dueDate: '',
      approvalStatus: 'not_submitted',
      comments: []
    });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: AuditTask) => {
    setCurrentTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!currentTask) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (currentTask.id) {
        // Edit existing task
        setTasks(tasks.map(task => 
          task.id === currentTask.id ? 
            // Ensure all required fields are present
            {
              id: currentTask.id,
              title: currentTask.title || '',
              description: currentTask.description || '',
              assignedTo: currentTask.assignedTo || '',
              status: currentTask.status || 'not_started',
              priority: currentTask.priority || 'medium',
              dueDate: currentTask.dueDate || '',
              completedDate: currentTask.completedDate,
              approvalStatus: currentTask.approvalStatus || 'not_submitted',
              approvedBy: currentTask.approvedBy,
              comments: currentTask.comments || []
            } as AuditTask
            : task
        ));
      } else {
        // Create new task with all required fields
        const newTask: AuditTask = {
          id: Date.now().toString(),
          title: currentTask.title || '',
          description: currentTask.description || '',
          assignedTo: currentTask.assignedTo || '',
          status: currentTask.status || 'not_started',
          priority: currentTask.priority || 'medium',
          dueDate: currentTask.dueDate || '',
          approvalStatus: currentTask.approvalStatus || 'not_submitted',
          comments: currentTask.comments || []
        };
        setTasks([...tasks, newTask]);
      }
      setTaskDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleApproveTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          approvalStatus: 'approved',
          approvedBy: 'Jane Smith', // In real app, this would be the current user
          comments: [...task.comments, {
            id: Date.now().toString(),
            text: 'Task approved',
            author: 'Jane Smith', // In real app, this would be the current user
            date: new Date().toISOString().split('T')[0]
          }]
        };
      }
      return task;
    }));
  };

  const handleRejectTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          approvalStatus: 'rejected',
          comments: [...task.comments, {
            id: Date.now().toString(),
            text: 'Task rejected - needs revisions',
            author: 'Jane Smith', // In real app, this would be the current user
            date: new Date().toISOString().split('T')[0]
          }]
        };
      }
      return task;
    }));
  };

  // Filter tasks based on current tab and search query
  const filteredTasks = tasks.filter(task => {
    // Filter by tab
    if (currentTab === 0) {
      // All tasks
      return true;
    } else if (currentTab === 1) {
      // My tasks
      return task.assignedTo === 'John Doe'; // In real app, this would be the current user
    } else if (currentTab === 2) {
      // Pending approval
      return task.approvalStatus === 'pending';
    } else if (currentTab === 3) {
      // Completed
      return task.status === 'completed';
    }
    
    // Filter by status if selected
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Statistics for dashboard
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
    pendingApproval: tasks.filter(t => t.approvalStatus === 'pending').length,
    overdue: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return dueDate < today && t.status !== 'completed';
    }).length
  };

  const renderTaskStatus = (status: string) => {
    switch(status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'in_progress':
        return <Chip label="In Progress" color="primary" size="small" />;
      case 'not_started':
        return <Chip label="Not Started" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const renderApprovalStatus = (status: string) => {
    switch(status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      case 'pending':
        return <Chip label="Pending Approval" color="warning" size="small" />;
      case 'not_submitted':
        return <Chip label="Not Submitted" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const renderPriority = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Chip label="High" color="error" size="small" />;
      case 'medium':
        return <Chip label="Medium" color="warning" size="small" />;
      case 'low':
        return <Chip label="Low" color="info" size="small" />;
      default:
        return <Chip label={priority} size="small" />;
    }
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Audit Management Workflow</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
        >
          New Task
        </Button>
      </Box>

      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Tasks</Typography>
              <Typography variant="h4">{taskStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
              <Typography variant="h4">{taskStats.completed}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.completed / taskStats.total) * 100} 
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">In Progress</Typography>
              <Typography variant="h4">{taskStats.inProgress}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.inProgress / taskStats.total) * 100} 
                color="primary"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Not Started</Typography>
              <Typography variant="h4">{taskStats.notStarted}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.notStarted / taskStats.total) * 100} 
                color="secondary"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Pending Approval</Typography>
              <Typography variant="h4">{taskStats.pendingApproval}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.pendingApproval / taskStats.total) * 100} 
                color="warning"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Overdue</Typography>
              <Typography variant="h4" color="error.main">{taskStats.overdue}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(taskStats.overdue / taskStats.total) * 100} 
                color="error"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Search */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="audit workflow tabs">
            <Tab label="All Tasks" />
            <Tab label="My Tasks" />
            <Tab 
              label={
                <Badge badgeContent={taskStats.pendingApproval} color="error">
                  Pending Approval
                </Badge>
              } 
            />
            <Tab label="Completed" />
          </Tabs>
        </Paper>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tasks List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredTasks.length === 0 ? (
            <Alert severity="info">No tasks found matching the current filters.</Alert>
          ) : (
            <List>
              {filteredTasks.map((task) => (
                <Paper key={task.id} sx={{ mb: 2, p: 0 }}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {task.status !== 'completed' && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<CheckIcon />}
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {task.approvalStatus === 'pending' && (
                          <>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              startIcon={<CheckIcon />}
                              onClick={() => handleApproveTask(task.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error" 
                              startIcon={<CloseIcon />}
                              onClick={() => handleRejectTask(task.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <IconButton edge="end" onClick={() => handleEditTask(task)}>
                          <EditIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <AssignmentIcon color={task.status === 'completed' ? 'success' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="subtitle1">{task.title}</Typography>
                          {renderTaskStatus(task.status)}
                          {renderPriority(task.priority)}
                          {renderApprovalStatus(task.approvalStatus)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" sx={{ mr: 2 }}>
                              {task.assignedTo}
                            </Typography>
                            <Typography variant="body2">
                              Due: {task.dueDate}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* New/Edit Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTask?.id ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={currentTask?.title || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={currentTask?.description || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={currentTask?.assignedTo || ''}
                  label="Assigned To"
                  onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
                >
                  {mockUsers.map(user => (
                    <MenuItem key={user.id} value={user.name}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={currentTask?.priority || 'medium'}
                  label="Priority"
                  onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={currentTask?.dueDate || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentTask?.status || 'not_started'}
                  label="Status"
                  onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                >
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTask}
            disabled={!currentTask?.title || !currentTask?.assignedTo || !currentTask?.dueDate}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditManagementWorkflow; 