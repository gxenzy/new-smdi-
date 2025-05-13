import React, { useRef, useEffect, useState } from 'react';
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
  useTheme
} from '@mui/material';
import Chart from 'chart.js/auto';
import { VoltageRegulationInputs, VoltageRegulationResult, CONDUCTOR_SIZES } from './utils/voltageRegulationUtils';
import { 
  createVoltageDropProfileConfig, 
  createConductorComparisonConfig,
  VoltageDropVisualizationOptions
} from './utils/voltageDropVisualization';

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
  inputs: VoltageRegulationInputs;
  results: VoltageRegulationResult;
}

const VoltageDropVisualization: React.FC<VoltageDropVisualizationProps> = ({ inputs, results }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Chart refs
  const voltageProfileChartRef = useRef<HTMLCanvasElement | null>(null);
  const conductorComparisonChartRef = useRef<HTMLCanvasElement | null>(null);
  
  // Chart instances
  const [voltageProfileChart, setVoltageProfileChart] = useState<Chart | null>(null);
  const [conductorComparisonChart, setconductorComparisonChart] = useState<Chart | null>(null);
  
  // Visualization options
  const [options, setOptions] = useState<VoltageDropVisualizationOptions>({
    showLimits: true,
    colorScheme: 'default',
    darkMode: theme.palette.mode === 'dark'
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle options change
  const handleOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, checked } = e.target;
    
    setOptions(prev => ({
      ...prev,
      [name]: name === 'showLimits' ? checked : value
    }));
  };
  
  // Create voltage profile chart
  useEffect(() => {
    if (voltageProfileChartRef.current && results) {
      // Clean up previous chart
      if (voltageProfileChart) {
        voltageProfileChart.destroy();
      }
      
      // Create chart config
      const chartConfig = createVoltageDropProfileConfig(results, inputs, options);
      
      // Create new chart
      const chart = new Chart(voltageProfileChartRef.current, chartConfig);
      setVoltageProfileChart(chart);
      
      // Cleanup function
      return () => {
        chart.destroy();
      };
    }
  }, [results, inputs, options, tabValue]);
  
  // Create conductor comparison chart
  useEffect(() => {
    if (conductorComparisonChartRef.current && results) {
      // Clean up previous chart
      if (conductorComparisonChart) {
        conductorComparisonChart.destroy();
      }
      
      // Get a subset of conductor sizes for comparison
      const allSizes = Object.keys(CONDUCTOR_SIZES);
      const currentSizeIndex = allSizes.indexOf(inputs.conductorSize);
      
      // Get a reasonable range of sizes around the current one
      const startIndex = Math.max(0, currentSizeIndex - 3);
      const endIndex = Math.min(allSizes.length - 1, currentSizeIndex + 3);
      const sizesToCompare = allSizes.slice(startIndex, endIndex + 1);
      
      // Create chart config
      const chartConfig = createConductorComparisonConfig(inputs, sizesToCompare, options);
      
      // Create new chart
      const chart = new Chart(conductorComparisonChartRef.current, chartConfig);
      setconductorComparisonChart(chart);
      
      // Cleanup function
      return () => {
        chart.destroy();
      };
    }
  }, [results, inputs, options, tabValue]);
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Voltage Drop Visualization
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
              label="Show Limits"
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
          </FormGroup>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 400 }}>
            <canvas ref={voltageProfileChartRef} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This chart shows how voltage drops along the length of the conductor.
            The horizontal lines represent the acceptable limits according to PEC 2017 Section 2.30.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 400 }}>
            <canvas ref={conductorComparisonChartRef} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This chart compares voltage drop percentages for different conductor sizes.
            Vertical lines show PEC 2017 limits for feeders (2%) and branch circuits (3%).
          </Typography>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default VoltageDropVisualization; 