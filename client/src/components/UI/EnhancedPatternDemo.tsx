import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Chart } from 'chart.js/auto';
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
import { ColorBlindnessType } from '../../utils/accessibility/colorBlindnessSimulation';
import { 
  EnhancedPatternConfig, 
  PATTERN_VARIATIONS, 
  getPatternGenerator 
} from '../../utils/accessibility/enhancedPatternFills';
import { PatternType } from '../../utils/accessibility/patternFills';

/**
 * Component to render a sample of the selected pattern
 */
interface PatternSampleProps {
  patternType: PatternType;
  useHighContrast: boolean;
}

const PatternSample: React.FC<PatternSampleProps> = ({ patternType, useHighContrast }) => {
  useEffect(() => {
    const canvas = document.getElementById('pattern-sample') as HTMLCanvasElement;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const patternGenerator = getPatternGenerator();
    const pattern = patternGenerator.createPattern({
      patternType: patternType,
      patternColor: useHighContrast ? '#FFFFFF' : '#000000',
      backgroundColor: useHighContrast ? '#000000' : '#FFFFFF',
      patternSize: 20
    });
    
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [patternType, useHighContrast]);
  
  return (
    <canvas 
      id="pattern-sample" 
      width={200} 
      height={100} 
      style={{ border: '1px solid #ccc', marginTop: '16px' }}
    />
  );
};

/**
 * Component to render variations of the selected pattern
 */
interface PatternVariationsProps {
  patternType: PatternType;
  useHighContrast: boolean;
}

const PatternVariations: React.FC<PatternVariationsProps> = ({ patternType, useHighContrast }) => {
  // Define pattern variations
  const variations: EnhancedPatternConfig[] = [
    { patternType: patternType, patternColor: '#000000', backgroundColor: '#FFFFFF' },
    { patternType: patternType, patternColor: '#000000', backgroundColor: '#FFFFFF', rotation: 45 },
    { patternType: patternType, patternColor: '#000000', backgroundColor: '#FFFFFF', density: 1.5 },
    { patternType: patternType, patternColor: '#000000', backgroundColor: '#FFFFFF', withBorder: true },
    { 
      patternType: patternType, 
      patternColor: '#000000', 
      backgroundColor: '#FFFFFF',
      secondaryPattern: 'dot',
      secondaryColor: '#555555'
    }
  ];
  
  useEffect(() => {
    variations.forEach((config, index) => {
      const canvas = document.getElementById(`variation-${index}`) as HTMLCanvasElement;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const patternGenerator = getPatternGenerator();
      const pattern = patternGenerator.createPattern({
        ...config,
        patternColor: useHighContrast ? '#FFFFFF' : config.patternColor,
        backgroundColor: useHighContrast ? '#000000' : config.backgroundColor,
        secondaryColor: useHighContrast ? '#AAAAAA' : config.secondaryColor
      });
      
      context.fillStyle = pattern;
      context.fillRect(0, 0, canvas.width, canvas.height);
    });
  }, [patternType, useHighContrast, variations]);
  
  return (
    <Grid container spacing={2} mt={2}>
      {variations.map((variation, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                {index === 0 && 'Basic'}
                {index === 1 && 'Rotated (45°)'}
                {index === 2 && 'Increased Density (1.5x)'}
                {index === 3 && 'With Border'}
                {index === 4 && 'Composite (with dots)'}
              </Typography>
              <canvas 
                id={`variation-${index}`}
                width={200}
                height={100}
                style={{ border: '1px solid #ccc' }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Component to demonstrate enhanced pattern fills for charts
 */
const EnhancedPatternDemo: React.FC = () => {
  const { settings, setColorBlindnessType } = useAccessibilitySettings();
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('line');
  const [useHighContrast, setUseHighContrast] = useState(false);
  
  // Generate sample chart data with patterns
  const generateBarChartData = () => {
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [65, 59, 80, 81, 56, 55],
          backgroundColor: '#4e79a7',
        },
        {
          label: 'Dataset 2',
          data: [28, 48, 40, 19, 86, 27],
          backgroundColor: '#f28e2c',
        },
        {
          label: 'Dataset 3',
          data: [35, 25, 30, 45, 35, 40],
          backgroundColor: '#e15759',
        },
        {
          label: 'Dataset 4',
          data: [45, 55, 65, 35, 25, 15],
          backgroundColor: '#76b7b2',
        },
        {
          label: 'Dataset 5',
          data: [25, 35, 45, 55, 65, 75],
          backgroundColor: '#59a14f',
        }
      ]
    };
    
    return chartData;
  };
  
  // Generate pie chart data for demonstrating patterns
  const generatePieChartData = () => {
    const chartData = {
      labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
      datasets: [
        {
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            '#4e79a7',
            '#f28e2c',
            '#e15759',
            '#76b7b2',
            '#59a14f'
          ],
        }
      ]
    };
    
    return chartData;
  };

  // Create bar chart configuration
  const barChartConfig = {
    type: 'bar' as const,
    data: generateBarChartData(),
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Enhanced Pattern Fill Demo - Bar Chart'
        }
      }
    }
  };
  
  // Create pie chart configuration
  const pieChartConfig = {
    type: 'pie' as const,
    data: generatePieChartData(),
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Enhanced Pattern Fill Demo - Pie Chart'
        }
      }
    }
  };

  // Handle color blindness simulation type change
  const handleColorBlindnessChange = (event: SelectChangeEvent) => {
    setColorBlindnessType(event.target.value as ColorBlindnessType);
  };
  
  // Handle pattern type change
  const handlePatternChange = (event: SelectChangeEvent) => {
    setSelectedPattern(event.target.value as PatternType);
  };
  
  // Handle high contrast toggle
  const handleHighContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseHighContrast(event.target.checked);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Pattern Fill Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This demo shows how enhanced pattern fills can improve chart accessibility, especially
        for users with color vision deficiencies. The patterns can be configured with variations
        in rotation, density, borders, and composite patterns.
      </Typography>
      
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="color-blindness-type-label">Color Blindness Simulation</InputLabel>
            <Select
              labelId="color-blindness-type-label"
              id="color-blindness-type-select"
              value={settings.colorBlindnessSimulation}
              label="Color Blindness Simulation"
              onChange={handleColorBlindnessChange}
            >
              <MenuItem value={ColorBlindnessType.NONE}>None</MenuItem>
              <MenuItem value={ColorBlindnessType.PROTANOPIA}>Protanopia (Red-Blind)</MenuItem>
              <MenuItem value={ColorBlindnessType.DEUTERANOPIA}>Deuteranopia (Green-Blind)</MenuItem>
              <MenuItem value={ColorBlindnessType.TRITANOPIA}>Tritanopia (Blue-Blind)</MenuItem>
              <MenuItem value={ColorBlindnessType.ACHROMATOPSIA}>Achromatopsia (Monochromacy)</MenuItem>
              <MenuItem value={ColorBlindnessType.PROTANOMALY}>Protanomaly (Red-Weak)</MenuItem>
              <MenuItem value={ColorBlindnessType.DEUTERANOMALY}>Deuteranomaly (Green-Weak)</MenuItem>
              <MenuItem value={ColorBlindnessType.TRITANOMALY}>Tritanomaly (Blue-Weak)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="pattern-type-label">Pattern Type</InputLabel>
            <Select
              labelId="pattern-type-label"
              id="pattern-type-select"
              value={selectedPattern}
              label="Pattern Type"
              onChange={handlePatternChange}
            >
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="line-vertical">Line Vertical</MenuItem>
              <MenuItem value="cross">Cross</MenuItem>
              <MenuItem value="plus">Plus</MenuItem>
              <MenuItem value="dash">Dash</MenuItem>
              <MenuItem value="dot">Dot</MenuItem>
              <MenuItem value="disc">Disc</MenuItem>
              <MenuItem value="ring">Ring</MenuItem>
              <MenuItem value="diamond">Diamond</MenuItem>
              <MenuItem value="square">Square</MenuItem>
              <MenuItem value="triangle">Triangle</MenuItem>
              <MenuItem value="zigzag">Zigzag</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch 
                checked={useHighContrast} 
                onChange={handleHighContrastChange}
              />
            }
            label="High Contrast"
            sx={{ mt: 2 }}
          />
          
          <PatternSample
            patternType={selectedPattern}
            useHighContrast={useHighContrast}
          />
        </Grid>
      </Grid>
      
      <Typography variant="h5" mt={4} mb={2}>
        Pattern Variations
      </Typography>
      <PatternVariations
        patternType={selectedPattern}
        useHighContrast={useHighContrast}
      />
      
      <Typography variant="h5" mt={4} mb={2}>
        Charts with Enhanced Pattern Fills
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AccessibleChartRenderer
            configuration={barChartConfig}
            themeName="default"
            height={300}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AccessibleChartRenderer
            configuration={pieChartConfig}
            themeName="default"
            height={300}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedPatternDemo; 