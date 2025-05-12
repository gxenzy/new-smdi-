import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  LinearProgress,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Mock data for energy consumption
const MOCK_DATA = {
  monthly: [
    { month: 'Jan', lighting: 12800, hvac: 18400, equipment: 8600, total: 39800 },
    { month: 'Feb', lighting: 12400, hvac: 17200, equipment: 8200, total: 37800 },
    { month: 'Mar', lighting: 12600, hvac: 17800, equipment: 8400, total: 38800 },
    { month: 'Apr', lighting: 13200, hvac: 19400, equipment: 9000, total: 41600 },
    { month: 'May', lighting: 13800, hvac: 21200, equipment: 9400, total: 44400 },
    { month: 'Jun', lighting: 14200, hvac: 22800, equipment: 9800, total: 46800 },
    { month: 'Jul', lighting: 14400, hvac: 23600, equipment: 10000, total: 48000 },
    { month: 'Aug', lighting: 14200, hvac: 23200, equipment: 9800, total: 47200 },
    { month: 'Sep', lighting: 13800, hvac: 21800, equipment: 9400, total: 45000 },
    { month: 'Oct', lighting: 13400, hvac: 20600, equipment: 9200, total: 43200 },
    { month: 'Nov', lighting: 13000, hvac: 19200, equipment: 8800, total: 41000 },
    { month: 'Dec', lighting: 12600, hvac: 18000, equipment: 8400, total: 39000 }
  ],
  buildings: [
    { name: 'Main Building', lighting: 55000, hvac: 85000, equipment: 40000, total: 180000 },
    { name: 'Science Building', lighting: 28000, hvac: 52000, equipment: 35000, total: 115000 },
    { name: 'Admin Building', lighting: 18000, hvac: 31000, equipment: 16000, total: 65000 },
    { name: 'Library', lighting: 22000, hvac: 28000, equipment: 12000, total: 62000 },
    { name: 'Cafeteria', lighting: 12000, hvac: 25000, equipment: 18000, total: 55000 }
  ],
  hourly: [
    { hour: '00:00', consumption: 28 },
    { hour: '01:00', consumption: 25 },
    { hour: '02:00', consumption: 22 },
    { hour: '03:00', consumption: 20 },
    { hour: '04:00', consumption: 18 },
    { hour: '05:00', consumption: 22 },
    { hour: '06:00', consumption: 30 },
    { hour: '07:00', consumption: 45 },
    { hour: '08:00', consumption: 78 },
    { hour: '09:00', consumption: 92 },
    { hour: '10:00', consumption: 98 },
    { hour: '11:00', consumption: 100 },
    { hour: '12:00', consumption: 95 },
    { hour: '13:00', consumption: 98 },
    { hour: '14:00', consumption: 100 },
    { hour: '15:00', consumption: 96 },
    { hour: '16:00', consumption: 92 },
    { hour: '17:00', consumption: 88 },
    { hour: '18:00', consumption: 75 },
    { hour: '19:00', consumption: 65 },
    { hour: '20:00', consumption: 58 },
    { hour: '21:00', consumption: 48 },
    { hour: '22:00', consumption: 40 },
    { hour: '23:00', consumption: 32 }
  ],
  benchmarks: {
    lighting: { actual: 12.5, target: 10.0, industry: 11.2 },
    hvac: { actual: 18.2, target: 15.0, industry: 16.5 },
    equipment: { actual: 8.8, target: 7.5, industry: 8.0 },
    total: { actual: 39.5, target: 32.5, industry: 35.7 }
  },
  anomalies: [
    { date: '2023-06-15', time: '14:30', system: 'HVAC', value: 28.4, expected: 22.1, deviation: 28.5 },
    { date: '2023-07-02', time: '11:15', system: 'Lighting', value: 15.2, expected: 12.1, deviation: 25.6 },
    { date: '2023-07-18', time: '09:45', system: 'Equipment', value: 12.8, expected: 8.9, deviation: 43.8 }
  ]
};

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EnergyConsumptionAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('yearly');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [energyType, setEnergyType] = useState('total');
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  // Handle building filter change
  const handleBuildingFilterChange = (event: SelectChangeEvent) => {
    setBuildingFilter(event.target.value);
  };
  
  // Handle energy type change
  const handleEnergyTypeChange = (event: SelectChangeEvent) => {
    setEnergyType(event.target.value);
  };
  
  // Format currency values
  const formatEnergy = (value: number): string => {
    return `${value.toLocaleString()} kWh`;
  };
  
  // Calculate percentage of target achieved
  const calculatePercentage = (actual: number, target: number): number => {
    return (actual / target) * 100;
  };
  
  // Determine color based on percentage (red if over target, green if under)
  const getColorByPercentage = (actual: number, target: number): string => {
    return actual <= target ? '#4caf50' : '#f44336';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Energy Consumption Analytics</Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Analyze energy consumption patterns and identify opportunities for improvement
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Detailed Analysis" />
        <Tab label="Benchmarking" />
        <Tab label="Anomaly Detection" />
      </Tabs>
      
      {activeTab === 0 && (
          <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                    labelId="time-range-label"
                    value={timeRange}
                    label="Time Range"
                    onChange={handleTimeRangeChange}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="building-filter-label">Building</InputLabel>
              <Select
                    labelId="building-filter-label"
                    value={buildingFilter}
                    label="Building"
                    onChange={handleBuildingFilterChange}
                  >
                    <MenuItem value="all">All Buildings</MenuItem>
                    {MOCK_DATA.buildings.map((building) => (
                      <MenuItem key={building.name} value={building.name}>{building.name}</MenuItem>
                    ))}
              </Select>
            </FormControl>
        </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="energy-type-label">Energy Type</InputLabel>
                  <Select
                    labelId="energy-type-label"
                    value={energyType}
                    label="Energy Type"
                    onChange={handleEnergyTypeChange}
                  >
                    <MenuItem value="total">Total Energy</MenuItem>
                    <MenuItem value="lighting">Lighting</MenuItem>
                    <MenuItem value="hvac">HVAC</MenuItem>
                    <MenuItem value="equipment">Equipment</MenuItem>
                  </Select>
                </FormControl>
        </Grid>
            </Grid>
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Annual Energy Consumption Trend</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Monthly energy consumption by category (kWh)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={MOCK_DATA.monthly}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: number) => formatEnergy(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="lighting" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="hvac" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="equipment" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
        </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Energy Consumption by Building</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Total energy consumption per building (kWh)
            </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={MOCK_DATA.buildings}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: number) => formatEnergy(value)} />
                      <Legend />
                      <Bar dataKey="lighting" stackId="a" fill="#8884d8" />
                      <Bar dataKey="hvac" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="equipment" stackId="a" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
          </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Energy Distribution</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Percentage breakdown of energy consumption by type
            </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Lighting', value: MOCK_DATA.buildings.reduce((sum, item) => sum + item.lighting, 0) },
                          { name: 'HVAC', value: MOCK_DATA.buildings.reduce((sum, item) => sum + item.hvac, 0) },
                          { name: 'Equipment', value: MOCK_DATA.buildings.reduce((sum, item) => sum + item.equipment, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {MOCK_DATA.buildings.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatEnergy(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
          </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Daily Load Profile</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Hourly energy consumption pattern (% of peak load)
            </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={MOCK_DATA.hourly}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Line type="monotone" dataKey="consumption" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
          </Box>
              </Paper>
            </Grid>
          </Grid>
            </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          {/* Detailed Analysis Tab Content */}
          <Typography variant="h6" gutterBottom>Detailed Energy Analysis</Typography>
          <Typography variant="body2" paragraph>
            This section would contain detailed energy analysis including time-series decomposition, correlation analysis, 
            and drill-down capabilities for specific buildings and systems.
            </Typography>
            </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Energy Performance Benchmarking</Typography>
          <Typography variant="body2" paragraph>
            Compare your building's energy performance against targets and industry standards.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Energy Intensity Benchmarking (kWh/m²/year)</Typography>
                <Box sx={{ mt: 4 }}>
                  {Object.entries(MOCK_DATA.benchmarks).map(([key, values]) => (
                    <Box key={key} sx={{ mb: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {key}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ width: '100%', position: 'relative', height: 35 }}>
                            <LinearProgress
                              variant="determinate"
                              value={calculatePercentage(values.actual, values.target)}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getColorByPercentage(values.actual, values.target),
                                  borderRadius: 5,
                                }
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                left: `${calculatePercentage(values.industry, values.target)}%`,
                                top: 0,
                                height: '10px',
                                width: '2px',
                                bgcolor: '#000',
                                transform: 'translateX(-50%)'
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">0</Typography>
                              <Typography variant="caption" color="text.secondary">{values.target * 2}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="body2">
                            Actual: <strong>{values.actual}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Target: {values.target} | Industry: {values.industry}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Anomaly Detection</Typography>
          <Typography variant="body2" paragraph>
            Identify unusual energy consumption patterns that may indicate equipment issues or inefficiencies.
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Detected Anomalies</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {MOCK_DATA.anomalies.map((anomaly, index) => (
                <Card key={index} variant="outlined" sx={{ borderColor: '#f44336' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="primary">{anomaly.system}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {anomaly.date} at {anomaly.time}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <Typography variant="body2">
                          Detected value: <strong>{anomaly.value} kWh</strong> (Expected: {anomaly.expected} kWh)
                        </Typography>
                        <Typography variant="body2" color="error">
                          {anomaly.deviation}% above normal range
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button size="small" variant="outlined" color="primary">
                          Investigate
                        </Button>
          </Grid>
        </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EnergyConsumptionAnalytics; 