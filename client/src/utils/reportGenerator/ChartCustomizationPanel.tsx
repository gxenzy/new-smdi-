import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Collapse,
  useTheme,
  FormGroup
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ColorLens as ColorLensIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  LibraryAddCheck as DataTableIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { ScaleType, chartThemes, ChartColorTheme, AxisOptions } from './chartGenerator';
import { ChartConfiguration, ChartOptions, ChartType as ChartJsType } from 'chart.js';

// Define the available chart types
export type ChartType = 'bar' | 'pie' | 'line' | 'stacked' | 'comparison' | 'table' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';

// Map Chart.js types to our internal types
const chartJsTypeToCustomType = (chartJsType: string): ChartType => {
  // Handle all supported chart types
  const validTypes: Record<string, ChartType> = {
    'bar': 'bar',
    'line': 'line',
    'pie': 'pie',
    'doughnut': 'doughnut',
    'radar': 'radar',
    'polarArea': 'polarArea',
    'scatter': 'scatter',
    'bubble': 'bubble'
  };
  
  return validTypes[chartJsType] || 'bar';
};

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Interface for the customization options
export interface ChartCustomizationOptions {
  chartType: ChartType;
  title: string;
  width: number;
  height: number;
  showLegend: boolean;
  showGrid: boolean;
  themeName: string;
  customTheme?: ChartColorTheme;
  scaleType: ScaleType;
  fontSize: number;
  animated: boolean;
  xAxis?: AxisOptions;
  yAxis?: AxisOptions;
  showDataLabels?: boolean;
  showDataTable?: boolean;
}

// Default options
const defaultOptions: ChartCustomizationOptions = {
  chartType: 'bar',
  title: 'Chart Title',
  width: 800,
  height: 400,
  showLegend: true,
  showGrid: true,
  themeName: 'default',
  scaleType: 'linear',
  fontSize: 12,
  animated: false,
  xAxis: {
    title: '',
    displayGrid: true
  },
  yAxis: {
    title: '',
    displayGrid: true
  },
  showDataLabels: false,
  showDataTable: false
};

interface ChartCustomizationPanelProps {
  chartConfig?: ChartConfiguration;
  onConfigChange?: (config: ChartConfiguration) => void;
  onAddToReport?: (config: ChartConfiguration) => void;
  availableTemplates?: { id: string; name: string }[];
  initialOptions?: ChartCustomizationOptions;
  onOptionsChange?: (options: ChartCustomizationOptions) => void;
  onApply?: () => void;
  onPreview?: () => Promise<void>;
  previewChart?: React.ReactNode;
}

/**
 * Chart customization panel component for customizing chart appearance and settings
 */
const ChartCustomizationPanel: React.FC<ChartCustomizationPanelProps> = ({
  chartConfig,
  onConfigChange,
  onAddToReport,
  availableTemplates = [],
  initialOptions,
  onOptionsChange,
  onApply,
  onPreview,
  previewChart
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [colorTheme, setColorTheme] = useState<string>('default');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(2);
  const [animate, setAnimate] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generalExpanded, setGeneralExpanded] = useState<boolean>(true);
  const [styleExpanded, setStyleExpanded] = useState<boolean>(false);
  const [advancedExpanded, setAdvancedExpanded] = useState<boolean>(false);

  // Initialize state from chartConfig
  useEffect(() => {
    if (!chartConfig) return;
    
    // Update basic properties
    setChartType(chartJsTypeToCustomType(chartConfig.type as string));
    if (chartConfig.options?.plugins?.title?.text) {
      setTitle(chartConfig.options.plugins.title.text as string);
    }
    
    // Update style properties
    setShowLegend(chartConfig.options?.plugins?.legend?.display !== false);
    setShowGridLines(chartConfig.options?.scales?.x?.grid?.display !== false && 
                   chartConfig.options?.scales?.y?.grid?.display !== false);
                   
    // Update animation
    setAnimate(chartConfig.options?.animation !== false);
  }, [chartConfig]);

  // Initialize from initialOptions if provided
  useEffect(() => {
    if (initialOptions) {
      setTitle(initialOptions.title);
      setChartType(initialOptions.chartType);
      setColorTheme(initialOptions.themeName);
      setShowLegend(initialOptions.showLegend);
      setShowGridLines(initialOptions.showGrid);
      setAnimate(initialOptions.animated);
      // Set other properties as needed
    }
  }, [initialOptions]);

  // Update chart configuration when settings change
  useEffect(() => {
    if (!chartConfig || !onConfigChange) return;
    
    // Create deep copy of configuration to avoid mutating props
    const updatedConfig = JSON.parse(JSON.stringify(chartConfig));
    
    // Initialize options if not present
    if (!updatedConfig.options) {
      updatedConfig.options = {};
    }
    
    // Initialize plugins if not present
    if (!updatedConfig.options.plugins) {
      updatedConfig.options.plugins = {};
    }
    
    // Update title
    if (!updatedConfig.options.plugins.title) {
      updatedConfig.options.plugins.title = {};
    }
    updatedConfig.options.plugins.title.display = !!title;
    updatedConfig.options.plugins.title.text = title;
    updatedConfig.options.plugins.title.font = {
      size: 16,
      weight: 'bold'
    };
    
    // Update legend
    if (!updatedConfig.options.plugins.legend) {
      updatedConfig.options.plugins.legend = {};
    }
    updatedConfig.options.plugins.legend.display = showLegend;
    
    // Update grid lines
    if (!updatedConfig.options.scales) {
      updatedConfig.options.scales = {};
    }
    ['x', 'y'].forEach(axis => {
      if (!updatedConfig.options.scales[axis]) {
        updatedConfig.options.scales[axis] = {};
      }
      if (!updatedConfig.options.scales[axis].grid) {
        updatedConfig.options.scales[axis].grid = {};
      }
      updatedConfig.options.scales[axis].grid.display = showGridLines;
    });
    
    // Update aspect ratio
    updatedConfig.options.aspectRatio = aspectRatio;
    
    // Update animation
    updatedConfig.options.animation = animate;
    
    // Update chart type if changed and compatible
    if (chartType !== updatedConfig.type) {
      // Only change if the chart types are compatible
      const compatibleTypes: Record<string, ChartType[]> = {
        'bar': ['bar', 'line', 'radar'],
        'line': ['line', 'bar', 'radar'],
        'pie': ['pie', 'doughnut'],
        'doughnut': ['doughnut', 'pie'],
        'radar': ['radar', 'bar', 'line'],
        'polarArea': ['polarArea', 'pie', 'doughnut'],
        'scatter': ['scatter', 'line'],
        'bubble': ['bubble'],
      };
      
      const compatibleWithCurrent = compatibleTypes[updatedConfig.type as string] || [];
      if (compatibleWithCurrent.includes(chartType)) {
        updatedConfig.type = chartType;
      }
    }
    
    // Apply the selected color theme
    // We would typically call our ChartGenerator service to apply the theme
    // But for this example we'll just update the config directly
    
    // Notify parent of config change
    onConfigChange(updatedConfig);

    // If onOptionsChange is provided, update the parent component
    if (onOptionsChange) {
      const options: ChartCustomizationOptions = {
        chartType,
        title,
        width: 800, // Default value
        height: 400, // Default value
        showLegend,
        showGrid: showGridLines,
        themeName: colorTheme,
        scaleType: 'linear', // Default value
        fontSize: 12, // Default value
        animated: animate,
        xAxis: {
          title: '',
          displayGrid: showGridLines
        },
        yAxis: {
          title: '',
          displayGrid: showGridLines
        }
      };
      onOptionsChange(options);
    }
  }, [title, chartType, colorTheme, showLegend, showGridLines, aspectRatio, animate, onConfigChange, onOptionsChange, chartConfig]);

  // Always update options if using the initialOptions/onOptionsChange pattern
  useEffect(() => {
    if (!onOptionsChange) return;
    
    const options: ChartCustomizationOptions = {
      chartType,
      title,
      width: 800, // Default value
      height: 400, // Default value
      showLegend,
      showGrid: showGridLines,
      themeName: colorTheme,
      scaleType: 'linear', // Default value
      fontSize: 12, // Default value
      animated: animate,
      xAxis: {
        title: '',
        displayGrid: showGridLines
      },
      yAxis: {
        title: '',
        displayGrid: showGridLines
      }
    };
    onOptionsChange(options);
  }, [title, chartType, colorTheme, showLegend, showGridLines, animate, onOptionsChange]);

  const handleAddToReport = () => {
    if (onAddToReport && chartConfig) {
      onAddToReport(chartConfig);
    }
    if (onApply) {
      onApply();
    }
  };

  const handleResetToDefault = () => {
    // Reset to default values
    if (chartConfig && chartConfig.options?.plugins?.title?.text) {
      setTitle(chartConfig.options.plugins.title.text as string);
      if (chartConfig.type) {
        setChartType(chartJsTypeToCustomType(chartConfig.type as string));
      }
    } else if (initialOptions) {
      setTitle(initialOptions.title);
      setChartType(initialOptions.chartType);
    } else {
      setTitle('');
      setChartType('bar');
    }
    setColorTheme('default');
    setShowLegend(true);
    setShowGridLines(true);
    setAspectRatio(2);
    setAnimate(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // In a real app, we would load a predefined chart template
    // For this example, we'll just update a few settings based on template ID
    if (templateId === 'energy-savings') {
      setTitle('Energy Savings Potential');
      setColorTheme('energy');
      setChartType('bar');
    } else if (templateId === 'financial-analysis') {
      setTitle('Financial Analysis');
      setColorTheme('financial');
      setChartType('bar');
    } else if (templateId === 'consumption-breakdown') {
      setTitle('Energy Consumption Breakdown');
      setColorTheme('default');
      setChartType('pie');
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Chart Customization
      </Typography>
      
      {/* Template selector */}
      {availableTemplates.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Chart Template</InputLabel>
            <Select
              value={selectedTemplate}
              label="Chart Template"
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Custom</em>
              </MenuItem>
              {availableTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* General settings */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            py: 1
          }}
          onClick={() => setGeneralExpanded(!generalExpanded)}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            General Settings
          </Typography>
          <IconButton size="small">
            {generalExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Divider />
        <Collapse in={generalExpanded}>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Chart Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="dense"
              size="small"
            />
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value as ChartType)}
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                <MenuItem value="radar">Radar Chart</MenuItem>
                <MenuItem value="polarArea">Polar Area Chart</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Color Theme</InputLabel>
              <Select
                value={colorTheme}
                label="Color Theme"
                onChange={(e) => setColorTheme(e.target.value)}
              >
                {Object.keys(chartThemes).map((themeName) => (
                  <MenuItem key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Box>
      
      {/* Style settings */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            py: 1
          }}
          onClick={() => setStyleExpanded(!styleExpanded)}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Style Settings
          </Typography>
          <IconButton size="small">
            {styleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Divider />
        <Collapse in={styleExpanded}>
          <Box sx={{ pt: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                  />
                }
                label="Show Legend"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showGridLines}
                    onChange={(e) => setShowGridLines(e.target.checked)}
                  />
                }
                label="Show Grid Lines"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={animate}
                    onChange={(e) => setAnimate(e.target.checked)}
                  />
                }
                label="Enable Animations"
              />
            </FormGroup>
            
            <Box sx={{ mt: 2 }}>
              <Typography id="aspect-ratio-slider" gutterBottom>
                Aspect Ratio: {aspectRatio}:1
              </Typography>
              <Slider
                value={aspectRatio}
                onChange={(_, value) => setAspectRatio(value as number)}
                aria-labelledby="aspect-ratio-slider"
                step={0.1}
                marks
                min={0.5}
                max={4}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </Collapse>
      </Box>
      
      {/* Advanced settings */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            py: 1
          }}
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Advanced Settings
          </Typography>
          <IconButton size="small">
            {advancedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Divider />
        <Collapse in={advancedExpanded}>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Advanced settings allow fine-tuning of chart appearance and behavior.
            </Typography>
            
            {/* Advanced settings would go here */}
            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
              Advanced customization options would be implemented based on specific requirements.
            </Typography>
          </Box>
        </Collapse>
      </Box>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Tooltip title="Reset to default settings">
          <Button
            startIcon={<ResetIcon />}
            variant="outlined"
            color="secondary"
            onClick={handleResetToDefault}
          >
            Reset
          </Button>
        </Tooltip>
        
        {onAddToReport && !onApply && (
          <Tooltip title="Add chart to report">
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={handleAddToReport}
            >
              Add to Report
            </Button>
          </Tooltip>
        )}
        
        {onApply && (
          <Tooltip title="Apply changes">
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              color="primary"
              onClick={onApply}
            >
              Apply Changes
            </Button>
          </Tooltip>
        )}
        
        {onPreview && (
          <Tooltip title="Preview changes">
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              color="primary"
              onClick={onPreview}
            >
              Preview
            </Button>
          </Tooltip>
        )}
      </Box>
      
      {/* Preview content if provided */}
      {previewChart && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Preview</Typography>
          {previewChart}
        </Box>
      )}
    </Paper>
  );
};

export default ChartCustomizationPanel; 