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
} from '@mui/material';
import {
  ElectricBolt as ElectricIcon,
  Assessment as AuditIcon,
  Speed as TestingIcon,
  Poll as TamIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { useEnergyAudit } from '../EnergyAudit/EnergyAuditContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useSocket } from '../../contexts/SocketContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  progress?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  progress,
  onClick,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box>
          {icon}
          {onClick && (
            <IconButton
              size="small"
              onClick={onClick}
              sx={{ ml: 1 }}
            >
              <ArrowIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      {progress !== undefined && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="textSecondary">
            {progress}% Complete
          </Typography>
        </>
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { audit } = useEnergyAudit();
  const theme = useTheme();
  const socket = useSocket();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetch('/api/findings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch findings');
        return res.json();
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {canAccessElectrical && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Electrical System"
              value={`${electricalProgress}%`}
              icon={<ElectricIcon color="primary" />}
              progress={electricalProgress}
              onClick={() => navigate('/electrical-system')}
            />
          </Grid>
        )}

        {canAccessAudit && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Energy Audit"
              value={auditCount}
              icon={<AuditIcon color="secondary" />}
              progress={65}
              onClick={() => navigate('/energy-audit')}
            />
          </Grid>
        )}

        {canAccessTesting && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Tests"
              value={testingCount}
              icon={<TestingIcon color="info" />}
              progress={45}
              onClick={() => navigate('/testing')}
            />
          </Grid>
        )}

        {canAccessTam && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TAM Evaluation"
              value={`${tamProgress}%`}
              icon={<TamIcon color="success" />}
              progress={tamProgress}
              onClick={() => navigate('/tam-evaluation')}
            />
          </Grid>
        )}
      </Grid>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Findings by Severity" />
            <CardContent>
              {severityCounts.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={severityCounts} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="severity" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Findings by Status" />
            <CardContent>
              {statusCounts.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusCounts} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                      {statusCounts.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={statusColors[idx % statusColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
