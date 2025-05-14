import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Menu,
  Snackbar
} from '@mui/material';

import {
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

// Define interfaces at the top, after the imports

// Define comment type
interface TaskComment {
  id: string;
  text: string;
  author: string;
  date: string;
}

// Define task interface with all possible properties
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

const mockAuditTasks: AuditTask[] = [
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

// Add this helper function before the AuditWorkflow component
const updateTask = (task: AuditTask | null, updates: Partial<AuditTask>): AuditTask => {
  if (!task) {
    // Create a new task with default values and apply updates
    return {
      id: '',
      title: '',
      description: '',
      assignedTo: '',
      status: 'not_started',
      priority: 'medium',
      dueDate: '',
      approvalStatus: 'not_submitted',
      comments: [],
      ...updates
    };
  }
  
  // Update existing task
  return { ...task, ...updates };
};

// Audit phases for the stepper
const auditPhases = [
  'Planning',
  'Data Collection',
  'Analysis',
  'Findings',
  'Recommendations',
  'Reporting',
  'Follow-up'
];

const AuditWorkflow: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState<AuditTask[]>(mockAuditTasks);
  const [loading, setLoading] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<AuditTask | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhase, setActivePhase] = useState(1); // 0-based index
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info'
  });
  
  // Function to launch calculators based on task type
  const launchRelatedCalculator = (taskTitle: string) => {
    let calculatorType = '';
    let calculatorIndex = 0;
    
    // Determine which calculator to launch based on task title/description
    if (taskTitle.toLowerCase().includes('lighting') || 
        taskTitle.toLowerCase().includes('lpd') || 
        taskTitle.toLowerCase().includes('light')) {
      // For lighting-related tasks, navigate to the LPD calculator
      calculatorType = 'Lighting Power Density Calculator';
      calculatorIndex = 10;
    } else if (taskTitle.toLowerCase().includes('hvac') || 
               taskTitle.toLowerCase().includes('air conditioning')) {
      // For HVAC-related tasks
      calculatorType = 'HVAC Calculator';
      calculatorIndex = 5;
    } else if (taskTitle.toLowerCase().includes('power') || 
               taskTitle.toLowerCase().includes('electrical') || 
               taskTitle.toLowerCase().includes('energy')) {
      // For electrical system tasks
      calculatorType = 'Energy Calculator';
      calculatorIndex = 1;
    } else if (taskTitle.toLowerCase().includes('harmonic')) {
      // For harmonic distortion tasks
      calculatorType = 'Harmonic Distortion Calculator';
      calculatorIndex = 8;
    } else if (taskTitle.toLowerCase().includes('voltage') || 
               taskTitle.toLowerCase().includes('drop')) {
      // For voltage regulation tasks
      calculatorType = 'Voltage Regulation Calculator';
      calculatorIndex = 9;
    } else if (taskTitle.toLowerCase().includes('illumination') || 
               taskTitle.toLowerCase().includes('lux')) {
      // For illumination tasks
      calculatorType = 'Illumination Calculator';
      calculatorIndex = 3;
    } else if (taskTitle.toLowerCase().includes('roi') || 
               taskTitle.toLowerCase().includes('return on investment') || 
               taskTitle.toLowerCase().includes('payback')) {
      // For ROI calculation tasks
      calculatorType = 'ROI Calculator';
      calculatorIndex = 6;
    } else if (taskTitle.toLowerCase().includes('power factor')) {
      // For power factor tasks
      calculatorType = 'Power Factor Calculator';
      calculatorIndex = 7;
    } else {
      // Default to calculator overview
      calculatorType = 'Calculators Overview';
      calculatorIndex = 0;
    }
    
    // Show feedback to user before navigating
    showNotification(`Launching ${calculatorType}...`, 'info');
    
    // Navigate to the appropriate calculator
    navigate(`/energy-audit/calculators?tab=${calculatorIndex}`);
  };
  
  // Fetch data - in a real app, this would be an API call
  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setTasks(mockAuditTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateTask = () => {
    const newTask: AuditTask = {
      id: '',
      title: '',
      description: '',
      assignedTo: '',
      status: 'not_started',
      priority: 'medium',
      dueDate: '',
      approvalStatus: 'not_submitted',
      comments: []
    };
    setCurrentTask(newTask);
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
          task.id === currentTask.id ? currentTask : task
        ));
      } else {
        // Create new task
        const newTask = {
          ...currentTask,
          id: Date.now().toString()
        };
        setTasks([...tasks, newTask]);
      }
      setTaskDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const handleApproveTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Create a properly typed object
        const updatedTask: AuditTask = { 
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
        return updatedTask;
      }
      return task;
    }));
  };

  const handleRejectTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Create a properly typed object
        const updatedTask: AuditTask = { 
          ...task, 
          approvalStatus: 'rejected',
          comments: [...task.comments, {
            id: Date.now().toString(),
            text: 'Task rejected - needs revisions',
            author: 'Jane Smith', // In real app, this would be the current user
            date: new Date().toISOString().split('T')[0]
          }]
        };
        return updatedTask;
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

  // Handle phase change
  const handlePhaseChange = (phase: number) => {
    if (phase >= 0 && phase < auditPhases.length) {
      setActivePhase(phase);
    }
  };

  // Open task menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuTaskId(taskId);
  };

  // Close task menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTaskId(null);
  };

  // Open task details
  const handleOpenTask = (task: AuditTask) => {
    setCurrentTask(task);
    setEditMode(false);
  };

  // Close task details
  const handleCloseTask = () => {
    setCurrentTask(null);
    setEditMode(false);
  };

  // Edit task
  const handleEditTaskDetails = () => {
    setEditMode(true);
    handleMenuClose();
  };

  // Delete task
  const handleDeleteTask = () => {
    if (menuTaskId) {
      setTasks(tasks.filter(task => task.id !== menuTaskId));
      if (currentTask && currentTask.id === menuTaskId) {
        setCurrentTask(null);
      }
    }
    handleMenuClose();
  };

  // Add new comment
  const handleAddComment = () => {
    if (currentTask && newComment.trim()) {
      const newCommentObj: TaskComment = {
        id: `c${Date.now()}`,
        author: 'Current User', // In a real app, this would come from auth context
        text: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedTask = {
        ...currentTask,
        comments: [...currentTask.comments, newCommentObj]
      };
      
      setCurrentTask(updatedTask);
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? updatedTask : task
      ));
      setNewComment('');
    }
  };

  // Get color for status
  const getStatusColor = (status: AuditTask['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'not_started': return 'default';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  // Get color for priority
  const getPriorityColor = (priority: AuditTask['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Formatted date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add notification display function if it doesn't exist
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({...prev, open: false}));
    }, 3000);
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Audit Management Workflow</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setNewTaskOpen(true)}
        >
          New Task
        </Button>
      </Box>

      {/* Audit Phases Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activePhase} alternativeLabel>
          {auditPhases.map((label, index) => (
            <Step key={label} completed={index < activePhase}>
              <StepLabel
                StepIconProps={{
                  onClick: () => handlePhaseChange(index)
                }}
                sx={{ cursor: 'pointer' }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            disabled={activePhase === 0}
            onClick={() => handlePhaseChange(activePhase - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={activePhase === auditPhases.length - 1}
            onClick={() => handlePhaseChange(activePhase + 1)}
          >
            Next Phase
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Task List */}
        <Grid item xs={12} md={currentTask ? 6 : 12}>
          <Paper sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">Tasks - {auditPhases[activePhase]} Phase</Typography>
            </Box>
            {tasks.map(task => (
              <Box 
                key={task.id}
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenTask(task)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={task.status.replace('_', ' ')}
                        color={getStatusColor(task.status)}
                      />
                      <Chip
                        size="small"
                        label={`Priority: ${task.priority}`}
                        color={getPriorityColor(task.priority)}
                      />
                      <Chip
                        size="small"
                        icon={<PersonIcon />}
                        label={task.assignedTo === 'Unassigned' ? 'Unassigned' : task.assignedTo}
                      />
                      <Chip
                        size="small"
                        icon={<CalendarIcon />}
                        label={`Due: ${formatDate(task.dueDate)}`}
                      />
                    </Box>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, task.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            {tasks.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No tasks found for this phase. Click "New Task" to create one.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Task Details */}
        {currentTask && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {editMode ? 'Edit Task' : 'Task Details'}
                </Typography>
                <Box>
                  {editMode ? (
                    <>
                      <Button 
                        startIcon={<SaveIcon />} 
                        variant="contained" 
                        size="small"
                        onClick={handleSaveTask}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button 
                        startIcon={<CancelIcon />} 
                        variant="outlined" 
                        size="small"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        startIcon={<EditIcon />} 
                        variant="outlined" 
                        size="small"
                        onClick={handleEditTaskDetails}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        size="small"
                        onClick={handleCloseTask}
                      >
                        Close
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              {editMode ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Title"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        value={currentTask.status}
                        onChange={(e) => setCurrentTask({ 
                          ...currentTask, 
                          status: e.target.value as AuditTask['status'] 
                        })}
                      >
                        <MenuItem value="not_started">Not Started</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Priority"
                        value={currentTask.priority}
                        onChange={(e) => setCurrentTask({ 
                          ...currentTask, 
                          priority: e.target.value as AuditTask['priority'] 
                        })}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Assignee"
                        value={currentTask.assignedTo}
                        onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Due Date"
                        type="date"
                        value={currentTask.dueDate}
                        onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6">{currentTask.title}</Typography>
                  <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                    {currentTask.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={currentTask.status.replace('_', ' ')}
                        color={getStatusColor(currentTask.status)}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                      <Chip
                        label={currentTask.priority}
                        color={getPriorityColor(currentTask.priority)}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {currentTask.assignedTo}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formatDate(currentTask.dueDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Add Calculator Button */}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CalculateIcon />}
                      onClick={() => launchRelatedCalculator(currentTask.title)}
                      fullWidth
                    >
                      Launch Related Calculator
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Comments</Typography>
                  
                  {currentTask.comments.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      {currentTask.comments.map(comment => (
                        <Card key={comment.id} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2">{comment.author}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.date).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2">{comment.text}</Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No comments yet.
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      size="small"
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTaskDetails}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteTask}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({...prev, open: false}))}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default AuditWorkflow; 