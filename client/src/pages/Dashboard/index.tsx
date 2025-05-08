import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  CardHeader,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import {
  ElectricBolt as ElectricIcon,
  Assessment as AuditIcon,
  Speed as TestingIcon,
  Poll as TamIcon,
  ArrowForward as ArrowIcon,
  TrendingUp,
  People,
  Warning,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { useEnergyAudit } from '../EnergyAudit/EnergyAuditContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useSocket } from '../../contexts/SocketContext';
import { glassCardSx } from '../../theme/glassCardSx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  progress?: number;
  onClick?: () => void;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  progress,
  onClick,
  color,
}) => (
  <Card 
    sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-4px)' } : {},
      ...glassCardSx(),
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="textSecondary" sx={{ color: '#222' }}>
            {title}
          </Typography>
        <Box sx={{ color }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1, color: '#222' }}>
        {value}
      </Typography>
      {progress !== undefined && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color
              }
            }} 
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, token } = useAuthContext();
  const { audit } = useEnergyAudit();
  const theme = useTheme();
  const socket = useSocket();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for real data
  const [totalEnergyUsage, setTotalEnergyUsage] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [auditsCompleted, setAuditsCompleted] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<number | null>(null);
  const [energyTrend, setEnergyTrend] = useState<{ name: string; value: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const [electricalProgress, setElectricalProgress] = useState(85);
  const [auditCount, setAuditCount] = useState(42);
  const [testingCount, setTestingCount] = useState(12);
  const [tamProgress, setTamProgress] = useState(78);
  const [severityData, setSeverityData] = useState(audit.lighting.map(f => ({
    severity: f.severity,
    count: 1
  })));
  const [statusData, setStatusData] = useState(audit.lighting.map(f => ({
    status: f.status,
    count: 1
  })));

  const canAccessElectrical = currentUser?.role === UserRole.ADMIN;
  const canAccessAudit = currentUser?.role === UserRole.ADMIN;
  const canAccessTesting = currentUser?.role === UserRole.ADMIN;
  const canAccessTam = currentUser?.role === UserRole.ADMIN;
  const canViewUsers = currentUser?.role === UserRole.ADMIN;
  const canViewReports = currentUser?.role === UserRole.ADMIN;
  const canViewSettings = currentUser?.role === UserRole.ADMIN;
  const canViewAnalytics = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    setSeverityData(audit.lighting.map(f => ({
      severity: f.severity,
      count: 1
    })));
    setStatusData(audit.lighting.map(f => ({
      status: f.status,
      count: 1
    })));
  }, [audit]);

  useEffect(() => {
    socket.on('chartUpdate', (update) => {
      setSeverityData(prev => prev.map(d =>
        d.severity === update.category ? { ...d, count: update.findings } : d
      ));
      // If you want to update statusData, add similar logic here
    });
    return () => {
      socket.off('chartUpdate');
    };
  }, [socket]);

  // Fetch findings from backend
  const fetchFindings = () => {
    setLoading(true);
    setError(null);
    fetch(`${process.env.REACT_APP_API_URL}/api/findings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch findings');
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          if (text.trim().startsWith('<')) {
            throw new Error('Could not connect to the backend API. Please check your API URL and make sure the backend server is running.');
          }
          throw new Error('Invalid response from server.');
        }
      })
      .then(data => {
        setFindings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFindings();
    socket.on('findingUpdate', fetchFindings);
    socket.on('findingDelete', fetchFindings);
    return () => {
      socket.off('findingUpdate', fetchFindings);
      socket.off('findingDelete', fetchFindings);
    };
  }, [socket]);

  // Chart data
  const severityCounts = ['Low', 'Medium', 'High', 'Critical'].map(sev => ({
    severity: sev,
    count: findings.filter(f => f.severity === sev).length
  }));
  const statusCounts = ['Open', 'In Progress', 'Resolved'].map(status => ({
    status,
    count: findings.filter(f => f.status === status).length
  }));

  // Analytics data
  const allFindings = [...audit.lighting, ...audit.hvac, ...audit.envelope];
  const statusColors = [theme.palette.info.main, theme.palette.warning.main, theme.palette.success.main];

  // Debug output
  console.log('allFindings', allFindings);
  console.log('severityCounts', severityCounts);
  console.log('statusCounts', statusCounts);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Fetch all dashboard data in parallel
      const [energyRes, usersRes, auditsRes, alertsRes, trendRes, activityRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/energy-usage/total`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/users/active`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/audits/completed`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/alerts/count`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/energy-usage/trend`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/activity/recent`, { headers }),
      ]);

      // Check for errors in responses
      const responses = [energyRes, usersRes, auditsRes, alertsRes, trendRes, activityRes];
      const errors = responses.filter(res => !res.ok);
      if (errors.length > 0) {
        throw new Error('One or more API requests failed');
      }

      // Parse responses
      const [energyData, usersData, auditsData, alertsData, trendData, activityData] = await Promise.all(
        responses.map(res => res.json())
      );

      setTotalEnergyUsage(energyData.total);
      setActiveUsers(usersData.count);
      setAuditsCompleted(auditsData.count);
      setAlerts(alertsData.count);
      setEnergyTrend(trendData.trend);
      setRecentActivity(activityData.activity);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load dashboard data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time updates via socket
    if (socket) {
      socket.on('dashboardUpdate', fetchDashboardData);
      return () => {
        socket.off('dashboardUpdate', fetchDashboardData);
      };
    }
  }, [token, socket]);

  // Trend indicators (dummy logic, replace with real trend calculation)
  const trendUp = (curr: number | null, prev: number | null) => curr !== null && prev !== null && curr > prev;
  const trendDown = (curr: number | null, prev: number | null) => curr !== null && prev !== null && curr < prev;

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Date Range:</Typography>
        {/* Add your date range picker here and update setDateRange */}
      </Box>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Energy Usage"
            value={typeof totalEnergyUsage === 'number' ? `${totalEnergyUsage.toLocaleString()} kWh` : '--'}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/energy-audit/analytics')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={activeUsers !== null ? activeUsers : '--'}
            icon={<People sx={{ fontSize: 40 }} />}
            color={theme.palette.success.main}
            onClick={() => navigate('/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Audits Completed"
            value={auditsCompleted !== null ? auditsCompleted : '--'}
            icon={<AuditIcon sx={{ fontSize: 40 }} />}
            color={theme.palette.info.main}
            onClick={() => navigate('/energy-audit')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alerts"
            value={alerts !== null ? alerts : '--'}
            icon={<Warning sx={{ fontSize: 40 }} />}
            color={theme.palette.error.main}
            onClick={() => navigate('/admin')}
          />
        </Grid>
        {/* Energy Usage Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Energy Usage Trend"
              action={
                <IconButton onClick={() => navigate('/energy-audit/analytics')}>
                  <ArrowIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      name="Energy Usage (kWh)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Recent Activity"
              action={
                <IconButton aria-label="settings">
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No recent activity.</Typography>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <Paper
                      key={activity.id || idx}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: theme.palette.background.default,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">{activity.title || activity.action}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {activity.description || activity.details || ''}
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
