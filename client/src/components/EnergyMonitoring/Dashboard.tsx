import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { PowerUsageData, EnergyMetrics } from '../../services/realTimeService';

const Dashboard: React.FC = () => {
  const [powerData, setPowerData] = useState<PowerUsageData[]>([]);
  const [metrics, setMetrics] = useState<EnergyMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const socket = useSocket();
  const theme = useTheme();

  useEffect(() => {
    startMonitoring();
    return () => {
      socket.emit('stopMonitoring');
      setIsMonitoring(false);
    };
  }, [socket]);

  const startMonitoring = () => {
    socket.emit('startMonitoring');
    setIsMonitoring(true);

    socket.on('powerUsage', (data: PowerUsageData) => {
      setPowerData(prev => [...prev.slice(-30), data]); // Keep last 30 data points
    });

    socket.on('energyMetrics', (data: EnergyMetrics) => {
      setMetrics(data);
    });
  };

  const formatValue = (value: number) => value.toFixed(2);
  const formatCost = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const chartStyle = {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
          Energy Monitoring Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={startMonitoring} disabled={isMonitoring}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.primary.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Current Power Usage</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.primary.contrastText }}>
                {powerData.length > 0 ? formatValue(powerData[powerData.length - 1].powerUsage) : '0'} kW
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.success.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Daily Energy Cost</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.success.contrastText }}>
                {metrics ? formatCost(metrics.totalCost) : '₱0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.warning.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Power Factor</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.warning.contrastText }}>
                {powerData.length > 0 ? formatValue(powerData[powerData.length - 1].powerFactor) : '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.error.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Peak Demand</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.error.contrastText }}>
                {metrics ? formatValue(metrics.peakDemand) : '0'} kW
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time Power Usage Chart */}
      <Paper sx={{ ...chartStyle, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Real-time Power Usage</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <RechartsTooltip
                formatter={(value: number) => [`${formatValue(value)} kW`, 'Power Usage']}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="powerUsage" 
                stroke={theme.palette.primary.main} 
                name="Power Usage (kW)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Power Quality Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={chartStyle}>
            <Typography variant="h6" gutterBottom>Voltage & Current</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={powerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis yAxisId="voltage" orientation="left" />
                  <YAxis yAxisId="current" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    yAxisId="voltage"
                    type="monotone" 
                    dataKey="voltage" 
                    stroke={theme.palette.error.main} 
                    name="Voltage (V)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="current"
                    type="monotone" 
                    dataKey="current" 
                    stroke={theme.palette.success.main} 
                    name="Current (A)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={chartStyle}>
            <Typography variant="h6" gutterBottom>Environmental Conditions</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={powerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis yAxisId="temp" orientation="left" />
                  <YAxis yAxisId="humidity" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke={theme.palette.warning.main}
                    fill={theme.palette.warning.light}
                    fillOpacity={0.3}
                    name="Temperature (°C)"
                  />
                  <Area
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humidity"
                    stroke={theme.palette.info.main}
                    fill={theme.palette.info.light}
                    fillOpacity={0.3}
                    name="Humidity (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Loading State */}
      {!powerData.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 