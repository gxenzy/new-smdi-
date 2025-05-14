import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab, FormControlLabel, Switch, FormGroup, CircularProgress, ButtonGroup, Button, useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { 
  createHarmonicSpectrumConfig, 
  createTHDComparisonConfig, 
  createHarmonicWaveformConfig,
  HarmonicMeasurement,
  HarmonicVisualizationOptions
} from './utils/harmonicVisualization';

// Register required Chart.js components
import { CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

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
      id={`visualization-tab-${index}`}
      aria-labelledby={`visualization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface ChartPanelProps {
  title: string;
  chartRef: React.RefObject<HTMLCanvasElement>;
  loading?: boolean;
}

function ChartPanel({ title, chartRef, loading = false }: ChartPanelProps) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ height: 300, position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10
          }}>
            <CircularProgress />
          </Box>
        )}
        <canvas ref={chartRef} />
      </Box>
    </Paper>
  );
}

export interface HarmonicVisualizationComponentProps {
  harmonics: HarmonicMeasurement[];
  fundamentalValues: {
    voltage: number;
    current: number;
  };
  thdValues: {
    voltage: number;
    current: number;
  };
  limits: {
    voltageLimit: number;
    currentLimits: number[];
    thdVoltageLimit: number;
    thdCurrentLimit: number;
  };
  loading?: boolean;
}

const HarmonicVisualization: React.FC<HarmonicVisualizationComponentProps> = ({
  harmonics,
  fundamentalValues,
  thdValues,
  limits,
  loading = false
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [visualizationOptions, setVisualizationOptions] = useState<HarmonicVisualizationOptions>({
    showVoltage: true,
    showCurrent: true,
    showLimits: true,
    colorScheme: 'default',
    darkMode: theme.palette.mode === 'dark'
  });

  // Chart refs
  const spectrumChartRef = useRef<HTMLCanvasElement>(null);
  const spectrumChartInstance = useRef<Chart | null>(null);
  
  const thdChartRef = useRef<HTMLCanvasElement>(null);
  const thdChartInstance = useRef<Chart | null>(null);
  
  const waveformChartRef = useRef<HTMLCanvasElement>(null);
  const waveformChartInstance = useRef<Chart | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle visualization option changes
  const handleOptionChange = (option: keyof HarmonicVisualizationOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizationOptions(prev => ({
      ...prev,
      [option]: event.target.checked
    }));
  };

  // Handle color scheme change
  const handleColorSchemeChange = (scheme: 'default' | 'accessibility' | 'print') => {
    setVisualizationOptions(prev => ({
      ...prev,
      colorScheme: scheme
    }));
  };

  // Effect to create/update the spectrum chart
  useEffect(() => {
    if (spectrumChartRef.current && harmonics.length > 0) {
      // Destroy previous chart instance if it exists
      if (spectrumChartInstance.current) {
        spectrumChartInstance.current.destroy();
      }

      // Create new chart
      const config = createHarmonicSpectrumConfig(
        harmonics,
        fundamentalValues,
        {
          voltageLimit: limits.voltageLimit,
          currentLimits: limits.currentLimits,
        },
        visualizationOptions
      );

      spectrumChartInstance.current = new Chart(spectrumChartRef.current, config);
    }

    // Cleanup on unmount
    return () => {
      if (spectrumChartInstance.current) {
        spectrumChartInstance.current.destroy();
      }
    };
  }, [harmonics, fundamentalValues, limits, visualizationOptions]);

  // Effect to create/update the THD comparison chart
  useEffect(() => {
    if (thdChartRef.current) {
      // Destroy previous chart instance if it exists
      if (thdChartInstance.current) {
        thdChartInstance.current.destroy();
      }

      // Create new chart
      const config = createTHDComparisonConfig(
        thdValues,
        {
          voltage: limits.thdVoltageLimit,
          current: limits.thdCurrentLimit
        },
        visualizationOptions
      );

      thdChartInstance.current = new Chart(thdChartRef.current, config);
    }

    // Cleanup on unmount
    return () => {
      if (thdChartInstance.current) {
        thdChartInstance.current.destroy();
      }
    };
  }, [thdValues, limits, visualizationOptions]);

  // Effect to create/update the waveform chart
  useEffect(() => {
    if (waveformChartRef.current && harmonics.length > 0) {
      // Destroy previous chart instance if it exists
      if (waveformChartInstance.current) {
        waveformChartInstance.current.destroy();
      }

      // Create new chart
      const config = createHarmonicWaveformConfig(
        harmonics,
        fundamentalValues,
        visualizationOptions
      );

      waveformChartInstance.current = new Chart(waveformChartRef.current, config);
    }

    // Cleanup on unmount
    return () => {
      if (waveformChartInstance.current) {
        waveformChartInstance.current.destroy();
      }
    };
  }, [harmonics, fundamentalValues, visualizationOptions]);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Harmonic Spectrum" />
        <Tab label="THD Comparison" />
        <Tab label="Waveform Analysis" />
      </Tabs>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={visualizationOptions.showVoltage}
                onChange={handleOptionChange('showVoltage')}
                name="showVoltage"
                color="primary"
              />
            }
            label="Voltage"
          />
          <FormControlLabel
            control={
              <Switch
                checked={visualizationOptions.showCurrent}
                onChange={handleOptionChange('showCurrent')}
                name="showCurrent"
                color="primary"
              />
            }
            label="Current"
          />
          <FormControlLabel
            control={
              <Switch
                checked={visualizationOptions.showLimits}
                onChange={handleOptionChange('showLimits')}
                name="showLimits"
                color="primary"
              />
            }
            label="Show Limits"
          />
        </FormGroup>
        
        <ButtonGroup size="small">
          <Button 
            variant={visualizationOptions.colorScheme === 'default' ? 'contained' : 'outlined'}
            onClick={() => handleColorSchemeChange('default')}
          >
            Default
          </Button>
          <Button 
            variant={visualizationOptions.colorScheme === 'accessibility' ? 'contained' : 'outlined'}
            onClick={() => handleColorSchemeChange('accessibility')}
          >
            High Contrast
          </Button>
          <Button 
            variant={visualizationOptions.colorScheme === 'print' ? 'contained' : 'outlined'}
            onClick={() => handleColorSchemeChange('print')}
          >
            Print
          </Button>
        </ButtonGroup>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ChartPanel 
          title="Harmonic Spectrum Analysis" 
          chartRef={spectrumChartRef} 
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ChartPanel 
          title="Total Harmonic Distortion Comparison" 
          chartRef={thdChartRef} 
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ChartPanel 
          title="Waveform Analysis" 
          chartRef={waveformChartRef} 
          loading={loading}
        />
      </TabPanel>
    </Box>
  );
};

export default HarmonicVisualization; 