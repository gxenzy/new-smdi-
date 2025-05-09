import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { realTimeService, PowerUsageData, EnergyMetrics } from '../../services/realTimeService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const EnergyDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [powerData, setPowerData] = useState<PowerUsageData[]>([]);
  const [metrics, setMetrics] = useState<EnergyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      const historicalData = await realTimeService.getHistoricalData(startDate, endDate);
      const currentMetrics = await realTimeService.getEnergyMetrics();
      
      setPowerData(historicalData);
      setMetrics(currentMetrics);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const handlePowerUsage = (data: PowerUsageData) => {
      setPowerData(prev => [...prev.slice(-50), data]);
    };

    const handleEnergyMetrics = (data: EnergyMetrics) => {
      setMetrics(data);
    };

    realTimeService.startMonitoring(handlePowerUsage, handleEnergyMetrics);
    setIsMonitoring(true);

    return () => {
      realTimeService.stopMonitoring();
      setIsMonitoring(false);
    };
  }, []);

  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      realTimeService.stopMonitoring();
    } else {
      realTimeService.startMonitoring(
        (data: PowerUsageData) => setPowerData(prev => [...prev.slice(-50), data]),
        (data: EnergyMetrics) => setMetrics(data)
      );
    }
    setIsMonitoring(!isMonitoring);
  }, [isMonitoring]);

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Energy Monitoring Dashboard</Typography>
        <Box>
          <Button
            variant={isMonitoring ? "contained" : "outlined"}
            color={isMonitoring ? "success" : "primary"}
            onClick={toggleMonitoring}
            sx={{ mr: 2 }}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <IconButton onClick={() => loadInitialData()} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Current Power Usage" />
            <CardContent>
              <Typography variant="h3">
                {powerData[powerData.length - 1]?.powerUsage.toFixed(2) || '0'} kW
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {metrics && metrics.dailyUsage > 0 ? (
                  <>
                    <TrendingUp color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                      {((metrics.dailyUsage / 24) * 100).toFixed(1)}% avg. load
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDown color="error" />
                    <Typography variant="body2" color="error.main" sx={{ ml: 1 }}>
                      Low power usage
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Power Factor" />
            <CardContent>
              <Typography variant="h3">
                {powerData[powerData.length - 1]?.powerFactor.toFixed(2) || '0'}
              </Typography>
              {powerData[powerData.length - 1]?.powerFactor < 0.85 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="body2" color="warning.main" sx={{ ml: 1 }}>
                    Power factor below recommended level
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Daily Energy Cost" />
            <CardContent>
              <Typography variant="h3">
                ₱{metrics?.totalCost.toFixed(2) || '0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Based on current rate: ₱8.50/kWh
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Power Usage Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Power Usage Trend</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={powerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm')}
            />
            <YAxis />
            <ChartTooltip 
              formatter={(value: number) => [`${value.toFixed(2)} kW`, 'Power Usage']}
              labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="powerUsage" 
              stroke="#8884d8" 
              name="Power Usage (kW)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Additional Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Energy Usage Breakdown" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Daily Usage</Typography>
                  <Typography variant="h6">{metrics?.dailyUsage.toFixed(2)} kWh</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Weekly Usage</Typography>
                  <Typography variant="h6">{metrics?.weeklyUsage.toFixed(2)} kWh</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Monthly Usage</Typography>
                  <Typography variant="h6">{metrics?.monthlyUsage.toFixed(2)} kWh</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Peak Demand</Typography>
                  <Typography variant="h6">{metrics?.peakDemand.toFixed(2)} kW</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Environmental Impact" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">CO2 Emissions</Typography>
                  <Typography variant="h6">
                    {((metrics?.monthlyUsage || 0) * 0.92).toFixed(2)} kg
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Trees Needed</Typography>
                  <Typography variant="h6">
                    {Math.ceil(((metrics?.monthlyUsage || 0) * 0.92) / 21.7)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnergyDashboard; 