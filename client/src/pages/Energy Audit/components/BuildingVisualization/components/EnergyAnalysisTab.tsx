import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
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
  TooltipProps
} from 'recharts';
import {
  LightbulbOutlined,
  PowerOutlined,
  AttachMoneyOutlined,
  FlashOnOutlined,
  TrendingUpOutlined,
  ErrorOutlineOutlined,
  CheckCircleOutlined,
  Lightbulb,
  ElectricBolt,
  Warning,
  OpenInNew,
  Check,
  Dvr
} from '@mui/icons-material';
import { RoomDetail, LampType, LoadSchedule, EnergyAnalysisMetrics, RoomTypeDistribution } from '../interfaces';
import { calculateEnergyConsumption, calculateIllumination, STANDARD_LAMPS } from '../utils/calculation';
import { useBuildingContext } from '../contexts/BuildingContext';
import { calculateBuildingEnergyMetrics } from '../utils/energyCalculations';
import { solDataService } from '../services/solDataService';

interface EnergyAnalysisTabProps {
  roomData: RoomDetail[];
  loadSchedules: LoadSchedule[];
  selectedTimeRange: string;
  onTimeRangeChange: (event: SelectChangeEvent<string>) => void;
  floorId: string;
  onRoomSelect: (roomId: string) => void;
}

const COLORS = ['#4CAF50', '#2196F3', '#F44336', '#FFC107', '#9C27B0', '#3F51B5', '#E91E63'];

// Add custom tooltip components
const CustomBarTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p>{`${payload[0].value} kWh`}</p>
        <p>{`Energy`}</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p>{`${payload[0].value} kWh`}</p>
        <p>{`Energy`}</p>
      </div>
    );
  }
  return null;
};

const EnergyAnalysisTab: React.FC<EnergyAnalysisTabProps> = ({
  roomData,
  loadSchedules,
  selectedTimeRange,
  onTimeRangeChange,
  floorId,
  onRoomSelect
}) => {
  const [analysisTab, setAnalysisTab] = useState(0);
  const [selectedLampType, setSelectedLampType] = useState(STANDARD_LAMPS[0].id);
  const { getFloorRooms, buildingData } = useBuildingContext();
  
  const [metrics, setMetrics] = useState<EnergyAnalysisMetrics | null>(null);
  const [roomTypeDistribution, setRoomTypeDistribution] = useState<RoomTypeDistribution[]>([]);
  const [energyData, setEnergyData] = useState<Array<{
    id: string;
    name: string;
    monthlyConsumption: number;
    annualConsumption: number;
    monthlyCost: number;
    annualCost: number;
    connectedLoad: number;
    demandLoad: number;
    compliance: number;
    roomType: string;
  }>>([]);
  
  // Get lamp by ID
  const getLampById = (id: string): LampType => {
    return STANDARD_LAMPS.find(lamp => lamp.id === id) || STANDARD_LAMPS[0];
  };
  
  // Handle lamp type change
  const handleLampTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedLampType(event.target.value);
  };
  
  // Handle analysis tab change
  const handleAnalysisTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setAnalysisTab(newValue);
  };
  
  // Calculate total energy consumption
  const calculateTotalConsumption = () => {
    const lamp = getLampById(selectedLampType);
    
    let totalDailyConsumption = 0;
    let totalMonthlyConsumption = 0;
    let totalAnnualConsumption = 0;
    let totalAnnualCost = 0;
    
    roomData.forEach(room => {
      if (room.actualFixtures && room.actualFixtures > 0) {
        const consumption = calculateEnergyConsumption(room, lamp);
        totalDailyConsumption += consumption.dailyConsumption;
        totalMonthlyConsumption += consumption.monthlyConsumption;
        totalAnnualConsumption += consumption.annualConsumption;
        totalAnnualCost += consumption.annualCost;
      }
    });
    
    return {
      dailyConsumption: totalDailyConsumption,
      monthlyConsumption: totalMonthlyConsumption,
      annualConsumption: totalAnnualConsumption,
      annualCost: totalAnnualCost
    };
  };
  
  // Prepare data for charts
  const prepareConsumptionByRoomType = () => {
    const lamp = getLampById(selectedLampType);
    const consumptionByType: { [key: string]: number } = {};
    
    roomData.forEach(room => {
      if (room.actualFixtures && room.actualFixtures > 0) {
        const roomType = room.roomType || 'unknown';
        const consumption = calculateEnergyConsumption(room, lamp);
        
        // Use the appropriate consumption based on selected time range
        let value = 0;
        switch (selectedTimeRange) {
          case 'daily':
            value = consumption.dailyConsumption;
            break;
          case 'weekly':
            value = consumption.dailyConsumption * 5; // Assuming 5 days a week
            break;
          case 'monthly':
            value = consumption.monthlyConsumption;
            break;
          case 'annually':
            value = consumption.annualConsumption;
            break;
          default:
            value = consumption.monthlyConsumption;
        }
        
        if (consumptionByType[roomType]) {
          consumptionByType[roomType] += value;
        } else {
          consumptionByType[roomType] = value;
        }
      }
    });
    
    // Convert to array for charts
    return Object.keys(consumptionByType).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: Number(consumptionByType[type].toFixed(2))
    }));
  };
  
  const prepareRoomAnalysisData = () => {
    const lamp = getLampById(selectedLampType);
    
    return roomData.map(room => {
      const illumination = calculateIllumination(room, lamp);
      const consumption = calculateEnergyConsumption(room, lamp);
      
      // Get consumption value based on selected time range
      let consumptionValue = 0;
      switch (selectedTimeRange) {
        case 'daily':
          consumptionValue = consumption.dailyConsumption;
          break;
        case 'weekly':
          consumptionValue = consumption.dailyConsumption * 5; // Assuming 5 days a week
          break;
        case 'monthly':
          consumptionValue = consumption.monthlyConsumption;
          break;
        case 'annually':
          consumptionValue = consumption.annualConsumption;
          break;
        default:
          consumptionValue = consumption.monthlyConsumption;
      }
      
      // Calculate lighting compliance
      const compliance = room.requiredLux && illumination.averageIlluminance
        ? (illumination.averageIlluminance / room.requiredLux) * 100
        : 0;
      
      return {
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        area: room.area,
        consumption: consumptionValue,
        powerDensity: illumination.powerDensity,
        requiredLux: room.requiredLux || 0,
        actualLux: illumination.averageIlluminance,
        compliance: Math.min(compliance, 100), // Cap at 100%
        costPerPeriod: selectedTimeRange === 'annually' 
          ? consumption.annualCost 
          : selectedTimeRange === 'monthly'
            ? consumption.annualCost / 12
            : selectedTimeRange === 'weekly'
              ? consumption.annualCost / 52
              : consumption.annualCost / 365
      };
    }).sort((a, b) => b.consumption - a.consumption); // Sort by consumption
  };
  
  // Get total consumption
  const totalConsumption = calculateTotalConsumption();
  
  // Prepare chart data
  const consumptionByRoomType = prepareConsumptionByRoomType();
  const roomAnalysisData = prepareRoomAnalysisData();
  
  // Calculate metrics when selected floor changes
  useEffect(() => {
    if (!selectedTimeRange) return;
    
    // Get rooms for the selected floor
    const rooms = getFloorRooms(selectedTimeRange);
    
    // Calculate energy metrics
    const floorMetrics = calculateBuildingEnergyMetrics(rooms as any);
    setMetrics(floorMetrics);
    
    // Calculate room type distribution
    calculateRoomTypeDistribution(rooms as any);
    
    // Generate energy data for charts
    generateEnergyData(floorMetrics);
  }, [selectedTimeRange, buildingData]);
  
  // Calculate room type distribution
  const calculateRoomTypeDistribution = (rooms: RoomDetail[]) => {
    const distribution: { [key: string]: RoomTypeDistribution } = {};
    
    // Group rooms by type
    rooms.forEach(room => {
      const roomType = room.roomType || 'unknown';
      
      if (!distribution[roomType]) {
        distribution[roomType] = {
          roomType,
          count: 0,
          totalArea: 0,
          totalConsumption: 0,
          averageCompliance: 0,
          color: getRoomTypeColor(roomType)
        };
      }
      
      // Update metrics
      distribution[roomType].count += 1;
      distribution[roomType].totalArea += room.area;
      
      // Calculate lighting load
      const fixtureWatts = 36; // Assuming 36W per fixture
      const lightingLoad = (room.actualFixtures || 0) * fixtureWatts;
      distribution[roomType].totalConsumption += lightingLoad;
      
      // Add compliance (we'll calculate average later)
      distribution[roomType].averageCompliance += room.compliance || 0;
    });
    
    // Calculate averages and convert to array
    const result = Object.values(distribution).map(item => ({
      ...item,
      averageCompliance: item.count > 0 ? item.averageCompliance / item.count : 0
    }));
    
    // Sort by total consumption
    result.sort((a, b) => b.totalConsumption - a.totalConsumption);
    
    setRoomTypeDistribution(result);
  };
  
  // Generate energy consumption data for charts
  const generateEnergyData = (metrics: EnergyAnalysisMetrics) => {
    // Generate sample data based on time range and total consumption
    const periods = selectedTimeRange === 'daily' ? 24 : selectedTimeRange === 'monthly' ? 12 : 5;
    const basePeriodConsumption = selectedTimeRange === 'daily' 
      ? metrics.totalDailyConsumption / 24 
      : selectedTimeRange === 'monthly' 
        ? metrics.totalMonthlyConsumption / 12 
        : metrics.totalAnnualConsumption / 5;
    
    // Create labels based on time range
    const getLabel = (index: number): string => {
      if (selectedTimeRange === 'daily') {
        return `${index}:00`;
      } else if (selectedTimeRange === 'monthly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[index];
      } else {
        const currentYear = new Date().getFullYear();
        return `${currentYear - (4 - index)}`;
      }
    };
    
    // Generate simulated data with random fluctuation
    const data = Array.from({ length: periods }).map((_, i) => {
      const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% of base value
      return {
        name: getLabel(i),
        lighting: Math.round(basePeriodConsumption * randomFactor * 0.4 * 100) / 100,
        hvac: Math.round(basePeriodConsumption * randomFactor * 0.35 * 100) / 100,
        equipment: Math.round(basePeriodConsumption * randomFactor * 0.25 * 100) / 100
      };
    });
    
    setEnergyData(data.map(item => ({
      id: item.name,
      name: item.name,
      monthlyConsumption: item.lighting,
      annualConsumption: item.lighting * 12,
      monthlyCost: item.lighting * 0.12,
      annualCost: item.lighting * 1.44,
      connectedLoad: item.lighting * 36,
      demandLoad: item.lighting * 36,
      compliance: 100,
      roomType: 'unknown'
    })));
  };
  
  // Get color for room type
  const getRoomTypeColor = (roomType: string): string => {
    const typeColors: { [key: string]: string } = {
      'office': '#4CAF50',
      'conference': '#2196F3',
      'restroom': '#9C27B0',
      'kitchen': '#FF9800',
      'storage': '#795548',
      'electrical': '#F44336',
      'hallway': '#607D8B',
      'server': '#E91E63',
      'classroom': '#00BCD4',
      'reception': '#8BC34A',
      'lobby': '#3F51B5',
      'default': '#9E9E9E'
    };
    
    return typeColors[roomType] || typeColors.default;
  };
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  };
  
  // If metrics not available, show loading state
  if (!metrics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Loading energy data...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Header section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Energy Consumption Analysis
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Analyze energy usage across rooms and identify optimization opportunities
          </Typography>
        </Grid>
        
        {/* Control bar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={selectedTimeRange}
                    label="Time Range"
                    onChange={onTimeRangeChange}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lamp Type</InputLabel>
                  <Select
                    value={selectedLampType}
                    label="Lamp Type"
                    onChange={handleLampTypeChange}
                  >
                    {STANDARD_LAMPS.map(lamp => (
                      <MenuItem key={lamp.id} value={lamp.id}>
                        {lamp.name} ({lamp.wattage}W, {lamp.lumens} lm)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Chip 
                    icon={<FlashOnOutlined />} 
                    label={`${totalConsumption.annualConsumption.toFixed(0)} kWh/year`}
                    color="primary"
                  />
                  <Chip 
                    icon={<AttachMoneyOutlined />} 
                    label={`₱${totalConsumption.annualCost.toFixed(0)}/year`}
                    color="secondary"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Tab selection */}
        <Grid item xs={12}>
          <Tabs 
            value={analysisTab} 
            onChange={handleAnalysisTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Room Analysis" />
            <Tab label="Optimization" />
          </Tabs>
        </Grid>
        
        {/* Overview Tab */}
        {analysisTab === 0 && (
          <>
            {/* Summary cards */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Energy Consumption" 
                  subheader={`Based on ${selectedTimeRange} usage`}
                  avatar={<FlashOnOutlined color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Daily</Typography>
                      <Typography variant="body1">{totalConsumption.dailyConsumption.toFixed(2)} kWh</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Monthly</Typography>
                      <Typography variant="body1">{totalConsumption.monthlyConsumption.toFixed(2)} kWh</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Annual</Typography>
                      <Typography variant="body1">{totalConsumption.annualConsumption.toFixed(2)} kWh</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Annual Cost</Typography>
                      <Typography variant="body1" fontWeight="bold">₱{totalConsumption.annualCost.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Energy Consumption by Room Type" 
                  subheader={`${selectedTimeRange} consumption in kWh`}
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {/* Add wrapper div with aria role and label */}
                  <div
                    role="img"
                    aria-label={`Bar chart showing energy consumption by room type for ${selectedTimeRange} period`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={consumptionByRoomType}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<CustomBarTooltip />} />
                        <Legend />
                        <Bar dataKey="value" name="Energy (kWh)" fill="#4CAF50" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Hidden data table for screen readers */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      width: 1, 
                      height: 1, 
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                      clipPath: 'inset(50%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <table aria-label={`Data table for energy consumption by room type (${selectedTimeRange})`}>
                      <caption>Energy consumption by room type</caption>
                      <thead>
                        <tr>
                          <th scope="col">Room Type</th>
                          <th scope="col">Energy Consumption (kWh)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumptionByRoomType.map((item, index) => (
                          <tr key={index}>
                            <th scope="row">{item.name}</th>
                            <td>{item.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Distribution chart */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Energy Distribution" 
                  subheader="By room type"
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {/* Add wrapper div with aria role and label */}
                  <div
                    role="img"
                    aria-label={`Pie chart showing energy distribution by room type`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={consumptionByRoomType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {consumptionByRoomType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Hidden data table for screen readers */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      width: 1, 
                      height: 1, 
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                      clipPath: 'inset(50%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <table aria-label="Data table for energy distribution by room type">
                      <caption>Energy distribution by room type</caption>
                      <thead>
                        <tr>
                          <th scope="col">Room Type</th>
                          <th scope="col">Energy Consumption (kWh)</th>
                          <th scope="col">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumptionByRoomType.map((item, index) => {
                          const total = consumptionByRoomType.reduce((sum, item) => sum + item.value, 0);
                          const percent = (item.value / total * 100).toFixed(1);
                          return (
                            <tr key={index}>
                              <th scope="row">{item.name}</th>
                              <td>{item.value.toFixed(2)}</td>
                              <td>{percent}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader 
                  title="Top Energy Consumers" 
                  subheader={`Rooms with highest ${selectedTimeRange} consumption`}
                />
                <Divider />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Room</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Area (m²)</TableCell>
                          <TableCell align="right">Consumption (kWh)</TableCell>
                          <TableCell align="right">Cost (₱)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roomAnalysisData.slice(0, 5).map((room) => (
                          <TableRow key={room.id}>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.roomType}</TableCell>
                            <TableCell align="right">{room.area.toFixed(1)}</TableCell>
                            <TableCell align="right">{room.consumption.toFixed(2)}</TableCell>
                            <TableCell align="right">{room.costPerPeriod.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        
        {/* Room Analysis Tab */}
        {analysisTab === 1 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Room-by-Room Analysis" 
                subheader={`${selectedTimeRange} energy consumption and lighting adequacy`}
              />
              <Divider />
              <CardContent>
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Room</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Area (m²)</TableCell>
                        <TableCell align="right">Required (lux)</TableCell>
                        <TableCell align="right">Actual (lux)</TableCell>
                        <TableCell align="right">Compliance</TableCell>
                        <TableCell align="right">Energy (kWh)</TableCell>
                        <TableCell align="right">Cost (₱)</TableCell>
                        <TableCell align="right">W/m²</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomAnalysisData.map((room) => (
                        <TableRow 
                          key={room.id}
                          sx={{ 
                            backgroundColor: room.compliance < 70 
                              ? 'rgba(244, 67, 54, 0.1)' 
                              : room.compliance < 90
                                ? 'rgba(255, 152, 0, 0.1)'
                                : 'inherit'
                          }}
                        >
                          <TableCell>{room.name}</TableCell>
                          <TableCell>{room.roomType}</TableCell>
                          <TableCell align="right">{room.area.toFixed(1)}</TableCell>
                          <TableCell align="right">{room.requiredLux}</TableCell>
                          <TableCell align="right">{room.actualLux?.toFixed(0) || 0}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {room.compliance < 70 ? (
                                <ErrorOutlineOutlined fontSize="small" color="error" sx={{ mr: 0.5 }} />
                              ) : room.compliance < 90 ? (
                                <ErrorOutlineOutlined fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                              ) : (
                                <CheckCircleOutlined fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              )}
                              {room.compliance.toFixed(0)}%
                            </Box>
                          </TableCell>
                          <TableCell align="right">{room.consumption.toFixed(2)}</TableCell>
                          <TableCell align="right">{room.costPerPeriod.toFixed(2)}</TableCell>
                          <TableCell align="right">{room.powerDensity?.toFixed(1) || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Optimization Tab */}
        {analysisTab === 2 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Optimization Opportunities" 
                subheader="Potential savings and improvements"
              />
              <Divider />
              <CardContent sx={{ minHeight: 300 }}>
                <Typography color="text.secondary" sx={{ my: 2 }}>
                  Based on analysis of your current lighting configuration, we've identified the following opportunities:
                </Typography>
                
                <Grid container spacing={3}>
                  {roomAnalysisData
                    .filter(room => room.compliance < 90 || room.powerDensity > 10)
                    .slice(0, 4)
                    .map(room => (
                      <Grid item xs={12} md={6} key={room.id}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {room.name} ({room.roomType})
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {room.compliance < 90 
                              ? `This room has inadequate lighting (${room.compliance.toFixed(0)}% of requirements). Consider adding fixtures to improve illumination.`
                              : `This room has high power density (${room.powerDensity?.toFixed(1)} W/m²). Consider more efficient lighting.`
                            }
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {room.compliance < 90 && (
                              <Chip 
                                size="small" 
                                label={`Add ${Math.ceil((room.requiredLux - (room.actualLux || 0)) / 1000)} fixtures`} 
                                color="primary" 
                              />
                            )}
                            {room.powerDensity > 10 && (
                              <Chip 
                                size="small" 
                                label="Switch to LED" 
                                color="success" 
                              />
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    ))
                  }
                  
                  {/* Summary card */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h6" gutterBottom>
                        Potential Annual Savings
                      </Typography>
                      <Typography variant="body1">
                        By implementing LED lighting throughout all spaces, you could reduce energy consumption by approximately 30%, saving up to ₱{(totalConsumption.annualCost * 0.3).toFixed(2)} per year.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EnergyAnalysisTab; 