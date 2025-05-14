import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { 
  Box, 
  Card,
  CardContent, 
  Typography, 
  FormControlLabel, 
  Switch, 
  FormGroup,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  useTheme,
  Alert,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Fade,
  Zoom,
  CircularProgress
} from '@mui/material';
import Chart from 'chart.js/auto';
import { CONDUCTOR_SIZES } from './utils/voltageRegulationUtils';
import { 
  VoltageDropInputs,
  VoltageDropResult,
  CircuitType
} from './utils/voltageDropUtils';
import { 
  createVoltageDropProfileConfig, 
  createConductorComparisonConfig,
  VoltageDropVisualizationOptions
} from './utils/voltageDropVisualization';
import { estimateOptimalPointCount, DownsampleOptions } from './utils/visualizationOptimizer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Add this utility for smooth chart animations
// import 'chartjs-plugin-animation';

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
      id={`voltage-visualization-tabpanel-${index}`}
      aria-labelledby={`voltage-visualization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `voltage-visualization-tab-${index}`,
    'aria-controls': `voltage-visualization-tabpanel-${index}`,
  };
}

interface VoltageDropVisualizationProps {
  inputs: VoltageDropInputs;
  results: VoltageDropResult | null;
  isCalculated: boolean;
}

// Define the chart methods that will be exposed via ref
export interface VoltageDropVisualizationRef {
  getVoltageProfileChart: () => Chart | null;
  getConductorComparisonChart: () => Chart | null;
  toDataURL: (type?: string, quality?: number) => string;
}

const VoltageDropVisualization = forwardRef<VoltageDropVisualizationRef, VoltageDropVisualizationProps>(({ inputs, results, isCalculated }, ref) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Chart refs
  const voltageProfileChartRef = useRef<HTMLCanvasElement | null>(null);
  const conductorComparisonChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Chart instances
  const [voltageProfileChart, setVoltageProfileChart] = useState<Chart | null>(null);
  const [conductorComparisonChart, setConductorComparisonChart] = useState<Chart | null>(null);
  
  // Container dimensions for responsive downsampling
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Monitor container size changes
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Set initial container width
    setContainerWidth(chartContainerRef.current.clientWidth);
    
    // Create ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });
    
    // Start observing
    resizeObserver.observe(chartContainerRef.current);
    
    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Calculate optimal point count based on container width
  const optimalPointCount = useCallback(() => {
    // Start with a base point count based on width
    const baseCount = estimateOptimalPointCount(containerWidth);
    
    // Adjust based on conductor length
    const lengthFactor = Math.min(2, Math.max(0.5, inputs.conductorLength / 100));
    
    return Math.floor(baseCount * lengthFactor);
  }, [containerWidth, inputs.conductorLength]);
  
  // Visualization options
  const [options, setOptions] = useState<VoltageDropVisualizationOptions>({
    showLimits: true,
    colorScheme: 'default',
    darkMode: theme.palette.mode === 'dark',
    showComplianceZones: true,
    downsampleOptions: {
      maxPoints: 50,
      algorithm: 'lttb',
      preserveExtremes: true
    }
  });
  
  // Update max points when container width changes
  useEffect(() => {
    if (containerWidth > 0) {
      setOptions(prev => ({
        ...prev,
        downsampleOptions: {
          ...prev.downsampleOptions,
          maxPoints: optimalPointCount()
        }
      }));
    }
  }, [containerWidth, optimalPointCount]);
  
  // Advanced options panel
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Inside the component function, update the animation-related states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chartKey, setChartKey] = useState(0); // Used to force re-render with animation
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create enhanced chart configurations with custom animations
  const createEnhancedVoltageDropProfileConfig = useCallback(() => {
    if (!results) return null;
    
    const config = createVoltageDropProfileConfig(results, inputs, options);
    
    // Add enhanced animation options
    if (!config.options) config.options = {};
    if (!config.options.animation) config.options.animation = {};
    
    config.options.animation = {
      duration: 800,
      easing: 'easeOutQuart',
      ...config.options.animation
    };
    
    return config;
  }, [inputs, options, results]);

  const createEnhancedConductorComparisonConfig = useCallback(() => {
    if (!results) return null;
    
    // Get a subset of conductor sizes for comparison
    const allSizes = Object.keys(CONDUCTOR_SIZES);
    const currentSizeIndex = allSizes.indexOf(inputs.conductorSize);
    
    // Get a reasonable range of sizes around the current one
    const startIndex = Math.max(0, currentSizeIndex - 3);
    const endIndex = Math.min(allSizes.length - 1, currentSizeIndex + 3);
    const sizesToCompare = allSizes.slice(startIndex, endIndex + 1);
    
    const config = createConductorComparisonConfig(inputs, sizesToCompare, options);
    
    return config;
  }, [inputs, options, results]);
  
  // Expose chart methods via ref
  useImperativeHandle(ref, () => ({
    getVoltageProfileChart: () => voltageProfileChart,
    getConductorComparisonChart: () => conductorComparisonChart,
    toDataURL: (type = 'image/png', quality = 1.0) => {
      if (tabValue === 0 && voltageProfileChartRef.current) {
        return voltageProfileChartRef.current.toDataURL(type, quality);
      } else if (tabValue === 1 && conductorComparisonChartRef.current) {
        return conductorComparisonChartRef.current.toDataURL(type, quality);
      }
      return '';
    }
  }));
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Modified handleOptionsChange to include transition effect
  const handleOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, checked } = e.target;
    
    // Set transitioning state for animation
    setIsTransitioning(true);
    
    // Update options after a short delay to allow fade-out
    setTimeout(() => {
      setOptions(prev => ({
        ...prev,
        [name]: name === 'showLimits' || name === 'showComplianceZones' ? checked : value
      }));
      
      // Increment chart key to trigger re-render with animation
      setChartKey(prev => prev + 1);
      
      // Set a timeout to stop transitioning state
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 750); // Match this with CSS transition duration
    }, 300);
  };
  
  // Similarly, update the handleDownsampleOptionsChange
  const handleDownsampleOptionsChange = (field: keyof DownsampleOptions) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setOptions(prev => ({
        ...prev,
        downsampleOptions: {
          ...prev.downsampleOptions,
          [field]: field === 'maxPoints' ? Number(value) : value
        }
      }));
      
      setChartKey(prev => prev + 1);
      
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);
    }, 300);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);
  
  // Create and update voltage profile chart
  useEffect(() => {
    if (!voltageProfileChartRef.current || !results) return;
    
    // Clean up previous chart before creating a new one
    if (voltageProfileChart) {
      voltageProfileChart.destroy();
    }
    
    // Create the chart
    const ctx = voltageProfileChartRef.current.getContext('2d');
    if (!ctx) return;
    
    const config = createEnhancedVoltageDropProfileConfig();
    if (!config) return;
    
    const newChart = new Chart(ctx, config);
    setVoltageProfileChart(newChart);
    
    // Clean up
    return () => {
      newChart.destroy();
    };
  }, [results, inputs, options, createEnhancedVoltageDropProfileConfig, voltageProfileChart]);
  
  // Create and update conductor comparison chart
  useEffect(() => {
    if (!conductorComparisonChartRef.current || !results) return;
    
    // Clean up previous chart
    if (conductorComparisonChart) {
      conductorComparisonChart.destroy();
    }
    
    // Create the chart
    const ctx = conductorComparisonChartRef.current.getContext('2d');
    if (!ctx) return;
    
    const config = createEnhancedConductorComparisonConfig();
    if (!config) return;
    
    const newChart = new Chart(ctx, config);
    setConductorComparisonChart(newChart);
    
    // Clean up
    return () => {
      newChart.destroy();
    };
  }, [results, inputs, options, createEnhancedConductorComparisonConfig, conductorComparisonChart]);
  
  const circuitTypeNames: Record<CircuitType, string> = {
    'branch': 'Branch Circuit',
    'feeder': 'Feeder',
    'service': 'Service',
    'motor': 'Motor Circuit'
  };
  
  const circuitTypeDescription = circuitTypeNames[inputs.circuitConfiguration.circuitType] || 'Circuit';
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Voltage Drop Visualization - {circuitTypeDescription}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="voltage drop visualization tabs"
          >
            <Tab label="Voltage Profile" {...a11yProps(0)} />
            <Tab label="Conductor Comparison" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={options.showLimits}
                  onChange={handleOptionsChange}
                  name="showLimits"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Show Limits</span>
                  <Tooltip 
                    title="Display PEC 2017 voltage drop limits (3% for branch circuits, 5% for feeders, 8% total) as reference lines on the charts."
                    arrow
                  >
                    <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={options.showComplianceZones}
                  onChange={handleOptionsChange}
                  name="showComplianceZones"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Show Compliance Zones</span>
                  <Tooltip 
                    title="Display color-coded zones to visualize PEC 2017 compliance thresholds. Green indicates compliant values, yellow shows warning zone (80% of limit), and red indicates non-compliant values."
                    arrow
                  >
                    <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              }
            />
            <RadioGroup
              row
              name="colorScheme"
              value={options.colorScheme}
              onChange={handleOptionsChange}
            >
              <FormControlLabel value="default" control={<Radio size="small" />} label="Default" />
              <FormControlLabel value="accessibility" control={<Radio size="small" />} label="High Contrast" />
              <FormControlLabel value="print" control={<Radio size="small" />} label="Print" />
            </RadioGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={showAdvancedOptions}
                  onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                  name="showAdvancedOptions"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Advanced</span>
                  <Tooltip 
                    title="Show advanced visualization settings including downsampling options and chart optimization controls."
                    arrow
                  >
                    <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              }
            />
          </FormGroup>
        </Box>
        
        {showAdvancedOptions && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Visualization Settings</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="algorithm-select-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>Algorithm</span>
                    <Tooltip 
                      title="LTTB: Best visual quality for curves. Min-Max: Preserves extreme values. Every Nth: Faster but less accurate."
                      arrow
                    >
                      <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                </InputLabel>
                <Select
                  value={options.downsampleOptions?.algorithm || 'lttb'}
                  onChange={handleDownsampleOptionsChange('algorithm')}
                  label="Sampling Algorithm"
                >
                  <MenuItem value="lttb">LTTB (Best Quality)</MenuItem>
                  <MenuItem value="min-max">Min-Max (Fast)</MenuItem>
                  <MenuItem value="every-nth">Uniform (Simple)</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="body2" sx={{ minWidth: 100 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Data Points</span>
                  <Tooltip 
                    title="Controls how many data points to show in the chart. More points show more detail but may reduce performance on large datasets."
                    arrow
                  >
                    <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Slider
                size="small"
                value={options.downsampleOptions?.maxPoints || 50}
                onChange={(_, value) => {
                  setOptions(prev => ({
                    ...prev,
                    downsampleOptions: {
                      ...prev.downsampleOptions,
                      maxPoints: value as number
                    }
                  }));
                }}
                step={10}
                marks
                min={20}
                max={200}
                valueLabelDisplay="auto"
                sx={{ maxWidth: 200 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={options.downsampleOptions?.preserveExtremes}
                    onChange={(e) => {
                      setOptions(prev => ({
                        ...prev,
                        downsampleOptions: {
                          ...prev.downsampleOptions,
                          preserveExtremes: e.target.checked
                        }
                      }));
                    }}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>Preserve Extremes</span>
                    <Tooltip 
                      title="Ensure maximum and minimum values are always preserved in the visualization, even when downsampling."
                      arrow
                    >
                      <HelpOutlineIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </Box>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 400 }} ref={chartContainerRef}>
            <Fade in={!isTransitioning} timeout={500}>
              <Box sx={{ height: '100%', position: 'relative' }}>
                {isTransitioning && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                )}
                <canvas ref={voltageProfileChartRef} key={`voltage-profile-${chartKey}`} />
              </Box>
            </Fade>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This chart shows how voltage drops along the length of the conductor.
            {options.showLimits && results && (
              <> The horizontal line represents the acceptable limit ({results.maxAllowedDrop}%) for {circuitTypeDescription.toLowerCase()} according to PEC 2017.</>
            )}
            {options.showComplianceZones && (
              <> Color zones indicate compliance status: green (safe), yellow (warning), and red (critical).</>
            )}
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 400 }}>
            <Fade in={!isTransitioning} timeout={500}>
              <Box sx={{ height: '100%', position: 'relative' }}>
                {isTransitioning && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                )}
                <canvas ref={conductorComparisonChartRef} key={`conductor-comparison-${chartKey}`} />
              </Box>
            </Fade>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This chart compares voltage drop percentages for different conductor sizes.
            {options.showLimits && results && (
              <> The vertical line shows the PEC 2017 limit ({results.maxAllowedDrop}%) for {circuitTypeDescription.toLowerCase()}.</>
            )}
            {options.showComplianceZones && (
              <> Bar colors indicate compliance status: green (compliant), yellow (warning), and red (non-compliant).</>
            )}
          </Typography>
        </TabPanel>
      </CardContent>
    </Card>
  );
});

export default VoltageDropVisualization; 