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
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Sample data - replace with real data from your API
const energyData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

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

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Energy Usage"
            value="24,500 kWh"
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value="156"
            icon={<People sx={{ fontSize: 40 }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Audits Completed"
            value="45"
            icon={<AuditIcon sx={{ fontSize: 40 }} />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alerts"
            value="3"
            icon={<Warning sx={{ fontSize: 40 }} />}
            color={theme.palette.error.main}
          />
        </Grid>

        {/* Energy Usage Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Energy Usage Trend"
              action={
                <IconButton aria-label="settings">
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
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
                {[1, 2, 3].map((item) => (
                  <Paper
                    key={item}
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
                      {item}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Activity {item}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Description of activity {item}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
