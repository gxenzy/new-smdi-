import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Mock data
const buildingTypes = [
  { id: 'office', name: 'Office Building' },
  { id: 'retail', name: 'Retail' },
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'residential', name: 'Residential' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'manufacturing', name: 'Manufacturing' }
];

const regions = [
  { id: 'northeast', name: 'Northeast' },
  { id: 'midwest', name: 'Midwest' },
  { id: 'south', name: 'South' },
  { id: 'west', name: 'West' },
  { id: 'international', name: 'International' }
];

const years = [
  { id: '2023', name: '2023' },
  { id: '2022', name: '2022' },
  { id: '2021', name: '2021' },
  { id: '2020', name: '2020' },
  { id: '2019', name: '2019' }
];

// Mock benchmark data
const mockBenchmarkData = {
  'office': {
    'eui': {
      'value': 78.2,
      'unit': 'kBtu/ft²/year',
      'percentile': 65,
      'industry_avg': 93.7,
      'industry_best': 35.2,
      'peer_avg': 81.4
    },
    'ghg': {
      'value': 15.3,
      'unit': 'kgCO₂e/ft²/year',
      'percentile': 72,
      'industry_avg': 18.9,
      'industry_best': 8.1,
      'peer_avg': 16.8
    },
    'wui': {
      'value': 14.8,
      'unit': 'gal/ft²/year',
      'percentile': 58,
      'industry_avg': 18.2,
      'industry_best': 9.3,
      'peer_avg': 15.1
    },
    'energy_star': {
      'value': 77,
      'percentile': 77,
      'industry_avg': 50,
      'industry_best': 98,
      'peer_avg': 68
    }
  },
  'retail': {
    'eui': {
      'value': 64.3,
      'unit': 'kBtu/ft²/year',
      'percentile': 72,
      'industry_avg': 78.9,
      'industry_best': 32.5,
      'peer_avg': 67.8
    },
    'ghg': {
      'value': 12.7,
      'unit': 'kgCO₂e/ft²/year',
      'percentile': 65,
      'industry_avg': 15.2,
      'industry_best': 6.8,
      'peer_avg': 13.1
    },
    'wui': {
      'value': 10.2,
      'unit': 'gal/ft²/year',
      'percentile': 68,
      'industry_avg': 12.4,
      'industry_best': 6.3,
      'peer_avg': 10.8
    },
    'energy_star': {
      'value': 82,
      'percentile': 82,
      'industry_avg': 50,
      'industry_best': 98,
      'peer_avg': 73
    }
  }
};

// Mock time series data
const mockTimeSeriesData = {
  'office': {
    'eui': [
      { year: 2019, value: 88.4 },
      { year: 2020, value: 84.1 },
      { year: 2021, value: 81.2 },
      { year: 2022, value: 79.3 },
      { year: 2023, value: 78.2 }
    ],
    'ghg': [
      { year: 2019, value: 18.1 },
      { year: 2020, value: 17.2 },
      { year: 2021, value: 16.3 },
      { year: 2022, value: 15.8 },
      { year: 2023, value: 15.3 }
    ],
    'wui': [
      { year: 2019, value: 16.2 },
      { year: 2020, value: 15.8 },
      { year: 2021, value: 15.3 },
      { year: 2022, value: 15.0 },
      { year: 2023, value: 14.8 }
    ],
    'energy_star': [
      { year: 2019, value: 68 },
      { year: 2020, value: 70 },
      { year: 2021, value: 73 },
      { year: 2022, value: 75 },
      { year: 2023, value: 77 }
    ]
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`benchmarking-tabpanel-${index}`}
      aria-labelledby={`benchmarking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Benchmarking component
const Benchmarking: React.FC = () => {
  const theme = useTheme();
  
  // States
  const [loading, setLoading] = useState(false);
  const [buildingType, setBuildingType] = useState('office');
  const [region, setRegion] = useState('northeast');
  const [year, setYear] = useState('2023');
  const [tabValue, setTabValue] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  
  // Get benchmark data
  const benchmarkData = mockBenchmarkData[buildingType as keyof typeof mockBenchmarkData] || mockBenchmarkData.office;
  const timeSeriesData = mockTimeSeriesData[buildingType as keyof typeof mockTimeSeriesData] || mockTimeSeriesData.office;
  
  // Load data on filter change
  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [buildingType, region, year]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Generate a color based on percentile (green for good, yellow for average, red for poor)
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return theme.palette.success.main;
    if (percentile >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Render metric card with comparison to industry average
  const renderMetricCard = (title: string, metricKey: 'eui' | 'ghg' | 'wui' | 'energy_star') => {
    const metricData = benchmarkData[metricKey];
    const percentileColor = getPercentileColor(metricData.percentile);
    
    // Check if this metric has a unit property
    const hasUnit = 'unit' in metricData;
    const unitValue = hasUnit ? (metricData as any).unit : undefined;
    
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
            <Typography variant="h4" component="div">
              {metricData.value}
            </Typography>
            {hasUnit && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {unitValue}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: `${percentileColor}20`,
            p: 1,
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ color: percentileColor, fontWeight: 'bold' }}>
              {metricData.percentile}th Percentile
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Comparison:
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Industry Avg</Typography>
              <Typography variant="caption" fontWeight="bold">
                {metricData.industry_avg}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Peer Avg</Typography>
              <Typography variant="caption" fontWeight="bold">
                {metricData.peer_avg}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">Industry Best</Typography>
              <Typography variant="caption" fontWeight="bold">
                {metricData.industry_best}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render trend chart (simplified with a basic visualization)
  const renderTrendChart = (metricKey: 'eui' | 'ghg' | 'wui' | 'energy_star') => {
    const data = timeSeriesData[metricKey];
    const max = Math.max(...data.map(d => d.value));
    
    const metricLabels: Record<string, string> = {
      'eui': 'Energy Use Intensity',
      'ghg': 'Greenhouse Gas Emissions',
      'wui': 'Water Usage Intensity',
      'energy_star': 'ENERGY STAR Score'
    };
    
    const chartLabel = metricLabels[metricKey];
    
    // Adding keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (index > 0) {
            const prevEl = document.getElementById(`trend-bar-${metricKey}-${index - 1}`);
            prevEl?.focus();
          }
          break;
        case 'ArrowRight':
          if (index < data.length - 1) {
            const nextEl = document.getElementById(`trend-bar-${metricKey}-${index + 1}`);
            nextEl?.focus();
          }
          break;
      }
    };
    
    return (
      <>
        <Box 
          sx={{ height: 200, display: 'flex', alignItems: 'flex-end' }}
          role="img"
          aria-label={`${chartLabel} trend chart showing data from ${data[0].year} to ${data[data.length - 1].year}`}
        >
          {data.map((item, index) => (
            <Box 
              key={index}
              sx={{
                flexGrow: 1,
                mx: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box 
                id={`trend-bar-${metricKey}-${index}`}
                tabIndex={0}
                role="button"
                aria-label={`${item.year}: ${item.value}`}
                aria-pressed="false"
                onKeyDown={(e) => handleKeyDown(e, index)}
                sx={{ 
                  width: '100%', 
                  height: `${(item.value / max) * 150}px`,
                  bgcolor: theme.palette.primary.main,
                  transition: 'height 0.5s',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  position: 'relative',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  '&:focus': {
                    outline: `2px solid ${theme.palette.primary.dark}`,
                    outlineOffset: 2,
                    bgcolor: theme.palette.primary.dark,
                  },
                  '&:hover::after, &:focus::after': {
                    content: `"${item.value}"`,
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'background.paper',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    boxShadow: 1
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 1 }}>
                {item.year}
              </Typography>
            </Box>
          ))}
        </Box>
        
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
          <table aria-label={`Data table for ${chartLabel} trend`}>
            <caption>{chartLabel} trend data</caption>
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <th scope="row">{item.year}</th>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </>
    );
  };
  
  return (
    <Box>
      {/* Header with title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Energy Benchmarking
        </Typography>
        
        <Box>
          <Tooltip title="Export Benchmark Data">
            <IconButton sx={{ mr: 1 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton sx={{ mr: 1 }} onClick={() => setLoading(true)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={showInfo ? "Hide Help" : "Show Help"}>
            <IconButton onClick={() => setShowInfo(!showInfo)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Info section */}
      {showInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Benchmark your building's energy performance against similar buildings in your region. 
            Energy Use Intensity (EUI), Greenhouse Gas Emissions (GHG), Water Usage Intensity (WUI), 
            and ENERGY STAR scores are provided for comparison.
          </Typography>
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="building-type-label">Building Type</InputLabel>
              <Select
                labelId="building-type-label"
                value={buildingType}
                label="Building Type"
                onChange={(e) => setBuildingType(e.target.value)}
              >
                {buildingTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                value={region}
                label="Region"
                onChange={(e) => setRegion(e.target.value)}
              >
                {regions.map(region => (
                  <MenuItem key={region.id} value={region.id}>{region.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map(year => (
                  <MenuItem key={year.id} value={year.id}>{year.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              startIcon={<FilterIcon />}
              onClick={() => setLoading(true)}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="benchmarking views">
          <Tab icon={<BarChartIcon fontSize="small" />} iconPosition="start" label="Current Benchmark" />
          <Tab icon={<TrendingUpIcon fontSize="small" />} iconPosition="start" label="Historical Trends" />
        </Tabs>
      </Box>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Current benchmark panel */}
      {!loading && (
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              {renderMetricCard('Energy Use Intensity', 'eui')}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderMetricCard('Greenhouse Gas Emissions', 'ghg')}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderMetricCard('Water Usage Intensity', 'wui')}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderMetricCard('ENERGY STAR Score', 'energy_star')}
            </Grid>
          </Grid>
        </TabPanel>
      )}
      
      {/* Historical trends panel */}
      {!loading && (
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Energy Use Intensity Trend</Typography>
                  <Box sx={{ mt: 2 }}>
                    {renderTrendChart('eui')}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Greenhouse Gas Emissions Trend</Typography>
                  <Box sx={{ mt: 2 }}>
                    {renderTrendChart('ghg')}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Water Usage Intensity Trend</Typography>
                  <Box sx={{ mt: 2 }}>
                    {renderTrendChart('wui')}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>ENERGY STAR Score Trend</Typography>
                  <Box sx={{ mt: 2 }}>
                    {renderTrendChart('energy_star')}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      )}
    </Box>
  );
};

export default Benchmarking; 