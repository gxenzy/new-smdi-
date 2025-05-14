import React, { useState, useEffect } from 'react';
import {
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
  SelectChangeEvent,
  CircularProgress,
  Tab,
  Tabs,
  Drawer,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
  TablePagination
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Whatshot as WhatshotIcon,
  WaterDrop as WaterDropIcon,
  Power as PowerIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { LoadSchedule } from './ScheduleOfLoads/types';
import { useTheme } from '@mui/material/styles';

// Import the themed chart components instead of Chart.js
import { ThemedBarChart, ThemedPieChart } from './utils/ChartComponents';

// Replace the old Chart.js imports with our chart utils
import { getChartThemeColors } from './utils/chartUtils';

// Define types inline since there are issues with the external file
export type CircuitComplianceStatus = 'compliant' | 'nonCompliant' | 'critical';

export interface CircuitInfo {
  id: string;
  name: string;
  panelId: string;
  panelName: string;
  voltageDrop: number;
  current?: number;
  conductorSize?: string;
  optimalSize?: string;
}

export interface CircuitAnalysisSummary {
  totalCircuits: number;
  compliantCircuits: number;
  nonCompliantCircuits: number;
  highestVoltageDrop: {
    value: number;
    circuitId: string;
    circuitName: string;
    panelId: string;
  };
  averageVoltageDrop: number;
  criticalCircuits: CircuitInfo[];
}

interface CircuitInsightsDashboardProps {
  loadSchedules: LoadSchedule[];
  onSelectCircuit?: (circuitId: string, panelId: string) => void;
  isLoading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Add type for Chart.js context
interface ChartContext {
  dataset: {
    label?: string;
  };
  parsed: {
    y: number;
  } | any;
  label?: string;
}

// Add type for Chart.js tooltip items
interface TooltipItem {
  dataIndex: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, index, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`circuit-insights-tabpanel-${index}`}
      aria-labelledby={`circuit-insights-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  panels: LoadSchedule[];
  filters: {
    panelId: string;
    statusFilter: string;
    showCriticalOnly: boolean;
    searchQuery: string;
  };
  onFilterChange: (filterName: string, value: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  open,
  onClose,
  panels,
  filters,
  onFilterChange
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 300, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Panel</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.panelId}
            onChange={(e) => onFilterChange('panelId', e.target.value)}
          >
            <MenuItem value="all">All Panels</MenuItem>
            {panels.map(panel => (
              <MenuItem key={panel.id} value={panel.id}>
                {panel.panelName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Compliance Status</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.statusFilter}
            onChange={(e) => onFilterChange('statusFilter', e.target.value)}
          >
            <MenuItem value="all">All Circuits</MenuItem>
            <MenuItem value="compliant">Compliant Only</MenuItem>
            <MenuItem value="nonCompliant">Non-Compliant Only</MenuItem>
            <MenuItem value="critical">Critical Only</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Search</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search circuits..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.showCriticalOnly}
              onChange={(e) => onFilterChange('showCriticalOnly', e.target.checked)}
            />
          }
          label="Show Critical Circuits Only"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <Button 
          variant="outlined" 
          fullWidth
          onClick={() => {
            onFilterChange('panelId', 'all');
            onFilterChange('statusFilter', 'all');
            onFilterChange('showCriticalOnly', false);
            onFilterChange('searchQuery', '');
          }}
        >
          Reset
        </Button>
        <Button 
          variant="contained" 
          fullWidth
          onClick={onClose}
        >
          Apply
        </Button>
      </Box>
    </Drawer>
  );
};

const CircuitInsightsDashboard: React.FC<CircuitInsightsDashboardProps> = ({
  loadSchedules,
  onSelectCircuit,
  isLoading = false
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filterPanel, setFilterPanel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('voltageDropDesc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(theme.palette.mode === 'dark');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [circuitAnalysisSummary, setCircuitAnalysisSummary] = useState<CircuitAnalysisSummary>({
    totalCircuits: 0,
    compliantCircuits: 0,
    nonCompliantCircuits: 0,
    highestVoltageDrop: {
      value: 0,
      circuitId: '',
      circuitName: '',
      panelId: ''
    },
    averageVoltageDrop: 0,
    criticalCircuits: []
  });
  
  // Effect to generate aggregated dashboard data from load schedules
  useEffect(() => {
    if (loadSchedules.length === 0) return;
    
    // Aggregate data from all load schedules
    let totalCircuits = 0;
    let compliantCircuits = 0;
    let nonCompliantCircuits = 0;
    let totalVoltageDrop = 0;
    let maxVoltageDrop = 0;
    let maxVoltageDropCircuit = {
      value: 0,
      circuitId: '',
      circuitName: '',
      panelId: ''
    };
    
    const criticalCircuits: CircuitInfo[] = [];
    
    // Process each load schedule
    for (const panel of loadSchedules) {
      if (!panel.loads) continue;
      
      for (const circuit of panel.loads) {
        if (circuit.voltageDropPercent !== undefined) {
          totalCircuits++;
          totalVoltageDrop += circuit.voltageDropPercent;
          
          // Track compliant vs non-compliant
          if (circuit.isPECCompliant) {
            compliantCircuits++;
          } else {
            nonCompliantCircuits++;
            
            // Add to critical circuits if voltage drop is high
            if (circuit.voltageDropPercent > 4) {
              criticalCircuits.push({
                id: circuit.id,
                name: circuit.description,
                panelId: panel.id,
                panelName: panel.panelName,
                voltageDrop: circuit.voltageDropPercent,
                current: circuit.current || 0,
                conductorSize: circuit.conductorSize || '',
                optimalSize: circuit.optimalConductorSize || ''
              });
            }
          }
          
          // Track highest voltage drop
          if (circuit.voltageDropPercent > maxVoltageDrop) {
            maxVoltageDrop = circuit.voltageDropPercent;
            maxVoltageDropCircuit = {
              value: circuit.voltageDropPercent,
              circuitId: circuit.id,
              circuitName: circuit.description,
              panelId: panel.id
            };
          }
        }
      }
    }
    
    // Calculate average voltage drop
    const averageVoltageDrop = totalCircuits > 0 ? totalVoltageDrop / totalCircuits : 0;
    
    // Sort critical circuits by voltage drop
    criticalCircuits.sort((a, b) => b.voltageDrop - a.voltageDrop);
    
    // Update the summary state
    setCircuitAnalysisSummary({
      totalCircuits,
      compliantCircuits,
      nonCompliantCircuits,
      highestVoltageDrop: maxVoltageDropCircuit,
      averageVoltageDrop,
      criticalCircuits
    });
    
    // Don't need to manually create charts anymore - they'll be created by the components
    // createVoltageDropChart();
    // createComplianceChart();
    
  }, [loadSchedules]);
  
  // No need for this effect anymore - the charts handle theme changes automatically
  // useEffect(() => {
  //   if (loadSchedules.length > 0) {
  //     createVoltageDropChart();
  //     createComplianceChart();
  //   }
  // }, [darkMode]);
  
  const getTopCircuitsByVoltageDrop = (count: number) => {
    const allCircuits: {
      id: string;
      name: string;
      panelId: string;
      panelName: string;
      voltageDrop: number;
    }[] = [];
    
    // Collect all circuits with voltage drop information
    for (const panel of loadSchedules) {
      if (!panel.loads) continue;
      
      for (const circuit of panel.loads) {
        if (circuit.voltageDropPercent !== undefined) {
          allCircuits.push({
            id: circuit.id,
            name: circuit.description,
            panelId: panel.id,
            panelName: panel.panelName,
            voltageDrop: circuit.voltageDropPercent
          });
        }
      }
    }
    
    // Sort by voltage drop descending and take the top N
    return allCircuits
      .sort((a, b) => b.voltageDrop - a.voltageDrop)
      .slice(0, count);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle filter panel toggle
  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName: string, value: any) => {
    switch (filterName) {
      case 'panelId':
        setFilterPanel(value);
        break;
      case 'statusFilter':
        setFilterStatus(value);
        break;
      case 'showCriticalOnly':
        setShowCriticalOnly(value);
        break;
      case 'searchQuery':
        setSearchQuery(value);
        break;
    }
  };
  
  // Get filtered circuits for the critical circuits table
  const getFilteredCriticalCircuits = () => {
    let circuits = [...circuitAnalysisSummary.criticalCircuits];
    
    // Filter by panel
    if (filterPanel !== 'all') {
      circuits = circuits.filter(circuit => circuit.panelId === filterPanel);
    }
    
    // Filter by status
    if (filterStatus === 'compliant') {
      circuits = circuits.filter(circuit => circuit.voltageDrop <= 3);
    } else if (filterStatus === 'nonCompliant') {
      circuits = circuits.filter(circuit => circuit.voltageDrop > 3);
    } else if (filterStatus === 'critical') {
      circuits = circuits.filter(circuit => circuit.voltageDrop > 5);
    }
    
    // Show only critical
    if (showCriticalOnly) {
      circuits = circuits.filter(circuit => circuit.voltageDrop > 4);
    }
    
    // Search by name
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      circuits = circuits.filter(
        circuit => 
          circuit.name.toLowerCase().includes(query) || 
          circuit.panelName.toLowerCase().includes(query)
      );
    }
    
    // Sort
    if (sortBy === 'voltageDropDesc') {
      circuits.sort((a, b) => b.voltageDrop - a.voltageDrop);
    } else if (sortBy === 'voltageDropAsc') {
      circuits.sort((a, b) => a.voltageDrop - b.voltageDrop);
    } else if (sortBy === 'currentDesc' && circuits[0]?.current !== undefined) {
      circuits.sort((a, b) => (b.current || 0) - (a.current || 0));
    } else if (sortBy === 'nameAsc') {
      circuits.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return circuits;
  };
  
  // Handle circuit selection
  const handleCircuitClick = (circuitId: string, panelId: string) => {
    if (onSelectCircuit) {
      onSelectCircuit(circuitId, panelId);
    }
  };
  
  // Handle page change for pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Get paginated circuits for the table
  const getPaginatedCircuits = () => {
    const filteredCircuits = getFilteredCriticalCircuits();
    return filteredCircuits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
  
  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up all charts when component unmounts
      // chartManager.destroyChart('voltage-drop-chart');
      // chartManager.destroyChart('compliance-chart');
    };
  }, []);
  
  // Prepare chart data
  const topCircuits = getTopCircuitsByVoltageDrop(10);
  const chartColors = getChartThemeColors(theme);
  
  // Format data for ThemedBarChart
  const voltageDropChartData = {
    labels: topCircuits.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name),
    datasets: [
      {
        label: 'Voltage Drop (%)',
        data: topCircuits.map(c => c.voltageDrop),
        backgroundColor: topCircuits.map(c => c.voltageDrop > 3 ? chartColors.error : chartColors.primary),
        borderColor: topCircuits.map(c => c.voltageDrop > 3 ? chartColors.error : chartColors.primary)
      }
    ]
  };
  
  // Format data for ThemedPieChart
  const complianceChartLabels = ['Compliant', 'Non-Compliant'];
  const complianceChartData = [
    circuitAnalysisSummary.compliantCircuits, 
    circuitAnalysisSummary.nonCompliantCircuits
  ];
  const complianceColors = [chartColors.success, chartColors.error];
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Circuit Insights Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex' }}>
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={toggleDarkMode} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter Circuits">
            <IconButton onClick={toggleFilterDrawer}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Circuits
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.totalCircuits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDropIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Avg. Voltage Drop
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.averageVoltageDrop.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WhatshotIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Max Voltage Drop
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.highestVoltageDrop.value.toFixed(2)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {circuitAnalysisSummary.highestVoltageDrop.circuitName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PieChartIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Non-Compliant
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.nonCompliantCircuits}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {circuitAnalysisSummary.totalCircuits > 0 ? 
                      `${Math.round((circuitAnalysisSummary.nonCompliantCircuits / circuitAnalysisSummary.totalCircuits) * 100)}%` : 
                      '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="circuit insights tabs"
            >
              <Tab label="Dashboard" />
              <Tab label="Critical Circuits" />
            </Tabs>
          </Box>
          
          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Circuits by Voltage Drop
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Replace canvas element with ThemedBarChart */}
                    <Box sx={{ height: 300 }}>
                      <ThemedBarChart
                        id="voltage-drop-chart"
                        labels={voltageDropChartData.labels}
                        datasets={voltageDropChartData.datasets}
                        options={{
                          xAxisTitle: 'Circuit',
                          yAxisTitle: 'Voltage Drop (%)',
                          beginAtZero: true
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      PEC Compliance Status
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Replace canvas element with ThemedPieChart */}
                    <Box sx={{ height: 300 }}>
                      <ThemedPieChart
                        id="compliance-chart"
                        labels={complianceChartLabels}
                        data={complianceChartData}
                        options={{
                          isDoughnut: true,
                          cutout: 60,
                          legendPosition: 'bottom',
                          backgroundColor: complianceColors
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Critical Circuits Tab */}
          <TabPanel value={activeTab} index={1}>
            {/* Keep the existing content */}
          </TabPanel>
        </>
      )}
      
      {/* Keep the filter drawer component */}
    </Paper>
  );
};

export default CircuitInsightsDashboard; 