import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useEnergyAudit } from '../../contexts/EnergyAuditContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

// Types
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  onClick?: () => void;
}

interface AuditStatusChipProps {
  status: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  status: string;
  date: string;
}

interface AuditStatus {
  status: string;
  count: number;
}

interface FindingCategory {
  category: string;
  count: number;
  savings: number;
}

interface EnergyTrend {
  month: string;
  consumption: number;
  baseline: number;
}

interface DashboardData {
  totalAudits: number;
  completedAudits: number;
  totalFindings: number;
  criticalFindings: number;
  potentialSavings: number;
  implementedSavings: number;
  recentActivity: RecentActivity[];
  auditsByStatus: AuditStatus[];
  findingsByCategory: FindingCategory[];
  energyTrends: EnergyTrend[];
}

// Custom components
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, onClick }) => (
  <motion.div
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ color: color, p: 1, borderRadius: 1, bgcolor: alpha(color, 0.1) }}>
            {icon}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                {trend}
        </Typography>
          </Box>
        )}
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>{value}</Typography>
        <Typography color="textSecondary">{title}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const AuditStatusChip: React.FC<AuditStatusChipProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{ minWidth: 80 }}
    />
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { audits, findings, metrics } = useEnergyAudit();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAudits: 0,
    completedAudits: 0,
    totalFindings: 0,
    criticalFindings: 0,
    potentialSavings: 0,
    implementedSavings: 0,
    recentActivity: [],
    auditsByStatus: [],
    findingsByCategory: [],
    energyTrends: [],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        const mockData: DashboardData = {
          totalAudits: 45,
          completedAudits: 32,
          totalFindings: 128,
          criticalFindings: 15,
          potentialSavings: 250000,
          implementedSavings: 120000,
          recentActivity: [
            { id: 1, type: 'audit', title: 'Building A Audit', status: 'Completed', date: '2024-03-15' },
            { id: 2, type: 'finding', title: 'HVAC Optimization', status: 'In Progress', date: '2024-03-14' },
            { id: 3, type: 'approval', title: 'Lighting Retrofit', status: 'Pending', date: '2024-03-13' },
          ],
          auditsByStatus: [
            { status: 'Completed', count: 32 },
            { status: 'In Progress', count: 8 },
            { status: 'Pending', count: 5 },
          ],
          findingsByCategory: [
            { category: 'HVAC', count: 45, savings: 120000 },
            { category: 'Lighting', count: 38, savings: 80000 },
            { category: 'Envelope', count: 25, savings: 50000 },
            { category: 'Other', count: 20, savings: 30000 },
          ],
          energyTrends: Array.from({ length: 12 }, (_, i) => ({
            month: format(new Date(2024, i, 1), 'MMM'),
            consumption: Math.random() * 1000 + 500,
            baseline: 800,
          })),
        };

        setDashboardData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Energy Audit Dashboard</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/energy-audit/new')}
            sx={{ mr: 2 }}
          >
            New Audit
          </Button>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => {}}>
              <DownloadIcon sx={{ mr: 1 }} /> Export Report
            </MenuItem>
            <MenuItem onClick={() => {}}>
              <RefreshIcon sx={{ mr: 1 }} /> Refresh Data
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
            title="Total Audits"
            value={dashboardData.totalAudits}
            icon={<Assessment />}
            color="#1976d2"
            trend="+12% this month"
            onClick={() => navigate('/energy-audit')}
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
            title="Total Findings"
            value={dashboardData.totalFindings}
            icon={<Warning />}
            color="#ed6c02"
            trend="+8 new"
            onClick={() => navigate('/findings')}
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
            title="Potential Savings"
            value={`₱${(dashboardData.potentialSavings / 1000).toFixed(0)}K`}
            icon={<TrendingUp />}
            color="#2e7d32"
            trend="+15% identified"
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
            title="Critical Findings"
            value={dashboardData.criticalFindings}
            icon={<Warning />}
            color="#d32f2f"
            trend="5 unresolved"
          />
          </Grid>
        </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
          <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
                <CardContent>
              <Typography variant="h6" gutterBottom>Energy Consumption Trends</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.energyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Actual Consumption"
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Baseline"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Findings by Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.findingsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <ChartTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Number of Findings" />
                  <Bar yAxisId="right" dataKey="savings" fill="#82ca9d" name="Potential Savings (₱)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
          </Grid>

        {/* Right Column */}
          <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
                <CardContent>
              <Typography variant="h6" gutterBottom>Audit Status</Typography>
              <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                    data={dashboardData.auditsByStatus}
                    dataKey="count"
                    nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                    label
                  >
                    {dashboardData.auditsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4caf50', '#ff9800', '#2196f3'][index % 3]} />
                        ))}
                      </Pie>
                  <ChartTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

          <Card>
                <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button size="small">View All</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dashboardData.recentActivity.map((activity) => (
                      <Box 
                    key={activity.id}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          p: 1, 
                          borderRadius: 1,
                      bgcolor: 'background.default',
                        }}
                      >
                        <Avatar 
                          sx={{ 
                        bgcolor: activity.type === 'audit' ? 'primary.main' : 'warning.main',
                            width: 40,
                            height: 40,
                        mr: 2,
                          }}
                        >
                      {activity.type === 'audit' ? <Assessment /> : <Warning />}
                        </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">{activity.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                        {format(new Date(activity.date), 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                    <AuditStatusChip status={activity.status} />
                      </Box>
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
