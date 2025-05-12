import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  EmojiEvents as AwardIcon,
  Lightbulb as LightbulbIcon,
  Whatshot as WhatshotIcon,
  Waves as WavesIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Define interfaces for benchmark data
interface BuildingData {
  id: string;
  name: string;
  type: string;
  location: string;
  area: number; // in sq meters
  annualEnergyUse: number; // in kWh
  energyIntensity: number; // in kWh/sq m
  co2Emissions: number; // in tons
  occupancy: number;
  yearBuilt: number;
  eui: number; // Energy Use Intensity
  performanceRating: number; // 1-100
}

// Sample data for benchmarking
const sampleBuildings: BuildingData[] = [
  {
    id: '1',
    name: 'UCLM Old Building',
    type: 'Educational',
    location: 'Mandaue City',
    area: 8500,
    annualEnergyUse: 425000,
    energyIntensity: 50,
    co2Emissions: 212.5,
    occupancy: 1200,
    yearBuilt: 1985,
    eui: 50,
    performanceRating: 65
  },
  {
    id: '2',
    name: 'UCLM New Building',
    type: 'Educational',
    location: 'Mandaue City',
    area: 12000,
    annualEnergyUse: 540000,
    energyIntensity: 45,
    co2Emissions: 270,
    occupancy: 1800,
    yearBuilt: 2010,
    eui: 45,
    performanceRating: 78
  },
  {
    id: '3',
    name: 'USC Main Campus',
    type: 'Educational',
    location: 'Cebu City',
    area: 24000,
    annualEnergyUse: 960000,
    energyIntensity: 40,
    co2Emissions: 480,
    occupancy: 3500,
    yearBuilt: 1995,
    eui: 40,
    performanceRating: 82
  },
  {
    id: '4',
    name: 'UP Cebu',
    type: 'Educational',
    location: 'Cebu City',
    area: 18000,
    annualEnergyUse: 810000,
    energyIntensity: 45,
    co2Emissions: 405,
    occupancy: 2500,
    yearBuilt: 1990,
    eui: 45,
    performanceRating: 75
  },
  {
    id: '5',
    name: 'CIT-U',
    type: 'Educational',
    location: 'Cebu City',
    area: 15000,
    annualEnergyUse: 750000,
    energyIntensity: 50,
    co2Emissions: 375,
    occupancy: 2200,
    yearBuilt: 1980,
    eui: 50,
    performanceRating: 65
  }
];

// National benchmarking standards (sample data)
const nationalStandards = {
  educational: {
    excellent: 35,
    good: 45,
    average: 55,
    poor: 70
  },
  commercial: {
    excellent: 30,
    good: 40,
    average: 50,
    poor: 65
  },
  hospital: {
    excellent: 45,
    good: 60,
    average: 75,
    poor: 90
  }
};

// Helper function to format numbers
const formatNumber = (value: number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  }).format(value);
};

// Helper function to determine rating label
const getRatingLabel = (eui: number, type: string = 'educational') => {
  const standards = nationalStandards.educational; // Default to educational
  
  if (eui <= standards.excellent) return { label: 'Excellent', color: 'success' };
  if (eui <= standards.good) return { label: 'Good', color: 'info' };
  if (eui <= standards.average) return { label: 'Average', color: 'warning' };
  return { label: 'Poor', color: 'error' };
};

const Benchmarking: React.FC = () => {
  const [buildings, setBuildings] = useState<BuildingData[]>(sampleBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<string>(buildings[0].id);
  const [benchmarkType, setBenchmarkType] = useState<string>('eui');
  const [buildingType, setBuildingType] = useState<string>('educational');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Find the selected building
  const currentBuilding = buildings.find(b => b.id === selectedBuilding) || buildings[0];
  
  // Sort buildings by EUI
  const sortedBuildings = [...buildings].sort((a, b) => {
    const valueA = benchmarkType === 'eui' ? a.eui : a.co2Emissions / a.area;
    const valueB = benchmarkType === 'eui' ? b.eui : b.co2Emissions / b.area;
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });
  
  // Calculate ranking of current building
  const currentRank = sortedBuildings.findIndex(b => b.id === selectedBuilding) + 1;
  
  // Calculate percentile
  const percentile = Math.round(((buildings.length - currentRank) / buildings.length) * 100);
  
  // Get rating for current building
  const rating = getRatingLabel(currentBuilding.eui, buildingType);
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <CompareIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Energy Performance Benchmarking
      </Typography>
      
      <Grid container spacing={3}>
        {/* Building Selector and Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Building Selection</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Building</InputLabel>
              <Select
                value={selectedBuilding}
                label="Select Building"
                onChange={(e) => setSelectedBuilding(e.target.value as string)}
              >
                {buildings.map((building) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Benchmark Type
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <Select
                value={benchmarkType}
                onChange={(e) => setBenchmarkType(e.target.value)}
              >
                <MenuItem value="eui">Energy Use Intensity (EUI)</MenuItem>
                <MenuItem value="co2">CO₂ Emissions Intensity</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Building Type
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <Select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
              >
                <MenuItem value="educational">Educational</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="hospital">Hospital</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Building Details</Typography>
            {currentBuilding && (
              <Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Building Type</Typography>
                    <Typography variant="body1">{currentBuilding.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Year Built</Typography>
                    <Typography variant="body1">{currentBuilding.yearBuilt}</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Floor Area</Typography>
                    <Typography variant="body1">{formatNumber(currentBuilding.area)} m²</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Occupancy</Typography>
                    <Typography variant="body1">{formatNumber(currentBuilding.occupancy)} people</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Annual Energy Consumption</Typography>
                    <Typography variant="body1">{formatNumber(currentBuilding.annualEnergyUse)} kWh</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Main Benchmarking Results */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Performance Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LightbulbIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>EUI Rating</Typography>
                    <Chip 
                      label={rating.label} 
                      color={rating.color as any} 
                      sx={{ fontSize: '1rem', py: 2, px: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {currentBuilding.eui} kWh/m²/year
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 36, color: 'info.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Ranking</Typography>
                    <Typography variant="h4">{currentRank} of {buildings.length}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {percentile}th Percentile
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <WhatshotIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>CO₂ Emissions</Typography>
                    <Typography variant="h4">{formatNumber(currentBuilding.co2Emissions)}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      tons per year
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Comparison Chart */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {benchmarkType === 'eui' ? 'EUI Comparison' : 'CO₂ Emissions Comparison'}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Sort {sortOrder === 'asc' ? '↓' : '↑'}
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Building</TableCell>
                      <TableCell align="center">
                        {benchmarkType === 'eui' ? 'EUI (kWh/m²/year)' : 'CO₂ (kg/m²/year)'}
                      </TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedBuildings.map((building, index) => {
                      const isCurrentBuilding = building.id === selectedBuilding;
                      const buildingRating = getRatingLabel(building.eui, buildingType);
                      const value = benchmarkType === 'eui' 
                        ? building.eui 
                        : Math.round((building.co2Emissions * 1000) / building.area); // Convert to kg/m²
                      
                      return (
                        <TableRow 
                          key={building.id}
                          sx={{ 
                            bgcolor: isCurrentBuilding ? 'action.selected' : 'inherit',
                            fontWeight: isCurrentBuilding ? 'bold' : 'normal'
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {isCurrentBuilding && (
                                <SchoolIcon 
                                  fontSize="small" 
                                  color="primary"
                                  sx={{ mr: 1 }} 
                                />
                              )}
                              {building.name}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{value}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={buildingRating.label} 
                              color={buildingRating.color as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            {/* Performance Standards */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                National Benchmarking Standards
                <Tooltip title="These standards are based on national energy efficiency guidelines for different building types">
                  <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {buildingType === 'educational' ? 'Educational Buildings' : 
                     buildingType === 'commercial' ? 'Commercial Buildings' : 'Hospitals'}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Excellent</Typography>
                      <Typography variant="body2">
                        &lt; {nationalStandards[buildingType as keyof typeof nationalStandards].excellent} kWh/m²/year
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={100} 
                      color="success"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Good</Typography>
                      <Typography variant="body2">
                        &lt; {nationalStandards[buildingType as keyof typeof nationalStandards].good} kWh/m²/year
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={80} 
                      color="info"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Average</Typography>
                      <Typography variant="body2">
                        &lt; {nationalStandards[buildingType as keyof typeof nationalStandards].average} kWh/m²/year
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={60} 
                      color="warning"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Poor</Typography>
                      <Typography variant="body2">
                        &gt; {nationalStandards[buildingType as keyof typeof nationalStandards].poor} kWh/m²/year
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={40} 
                      color="error"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Your Building Performance</Typography>
                  
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1">{currentBuilding.name}</Typography>
                      <Chip 
                        label={rating.label} 
                        color={rating.color as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ position: 'relative', height: 40, mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={100}
                        sx={{ 
                          height: 30, 
                          borderRadius: 1,
                          background: 'linear-gradient(90deg, #4caf50 25%, #2196f3 25%, #2196f3 50%, #ff9800 50%, #ff9800 75%, #f44336 75%)'
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          left: `${Math.min(Math.max((currentBuilding.eui / nationalStandards[buildingType as keyof typeof nationalStandards].poor) * 100, 0), 100)}%`, 
                          top: 0,
                          transform: 'translateX(-50%)',
                          width: '8px',
                          height: '30px',
                          bgcolor: 'black',
                          zIndex: 1
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Excellent</Typography>
                      <Typography variant="caption">Good</Typography>
                      <Typography variant="caption">Average</Typography>
                      <Typography variant="caption">Poor</Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Current EUI: <b>{currentBuilding.eui} kWh/m²/year</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {currentBuilding.name} ranks {currentRank} out of {buildings.length} similar buildings.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Benchmarking; 