import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  useTheme,
  Button,
  Grid,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine
} from 'recharts';
import { 
  FlashOn as VoltageIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  AccountTree as CircuitIcon
} from '@mui/icons-material';
import { EnhancedVoltageDropInputs } from './utils/enhancedVoltageDropUtils';
import { VoltageDropResult } from './utils/voltageDropUtils';
import { CONDUCTOR_SIZES } from './utils/voltageRegulationUtils';

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
      id={`voltage-drop-viz-tabpanel-${index}`}
      aria-labelledby={`voltage-drop-viz-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface EnhancedVoltageDropVisualizationProps {
  inputs: EnhancedVoltageDropInputs;
  results: VoltageDropResult;
  alternativeSizes?: string[];
  alternativeResults?: Record<string, VoltageDropResult>;
  isLoading?: boolean;
}

const EnhancedVoltageDropVisualization: React.FC<EnhancedVoltageDropVisualizationProps> = ({
  inputs,
  results,
  alternativeSizes,
  alternativeResults,
  isLoading = false
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Colors for charts
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const error = theme.palette.error.main;
  const warning = theme.palette.warning.main;
  const success = theme.palette.success.main;
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Generate voltage profile data
  const generateVoltageProfileData = () => {
    const { systemVoltage, conductorLength } = inputs;
    const { voltageDrop } = results;
    
    // Generate points along the conductor
    const points = [];
    const numPoints = 10;
    
    for (let i = 0; i <= numPoints; i++) {
      const distance = (i / numPoints) * conductorLength;
      const voltage = systemVoltage - (voltageDrop * (distance / conductorLength));
      
      points.push({
        distance,
        voltage,
        percentage: ((systemVoltage - voltage) / systemVoltage) * 100
      });
    }
    
    return points;
  };
  
  // Generate comparison data for different conductor sizes
  const generateComparisonData = () => {
    if (!alternativeResults || !alternativeSizes) return [];
    
    const comparisonData = [{
      size: inputs.conductorSize,
      voltageDrop: results.voltageDropPercent,
      resistance: results.resistiveLoss,
      compliance: results.compliance === 'compliant',
      current: inputs.loadCurrent
    }];
    
    alternativeSizes.forEach(size => {
      if (alternativeResults[size]) {
        comparisonData.push({
          size,
          voltageDrop: alternativeResults[size].voltageDropPercent,
          resistance: alternativeResults[size].resistiveLoss,
          compliance: alternativeResults[size].compliance === 'compliant',
          current: inputs.loadCurrent
        });
      }
    });
    
    return comparisonData;
  };
  
  // Generate circuit diagram data
  const generateCircuitDiagramData = () => {
    const { systemVoltage, conductorLength } = inputs;
    const { voltageDrop, receivingEndVoltage } = results;
    
    return [
      { name: 'Source', voltage: systemVoltage, position: 0 },
      { name: 'Receiving End', voltage: receivingEndVoltage, position: 100, drop: voltageDrop }
    ];
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <VoltageIcon sx={{ mr: 1 }} />
          Enhanced Voltage Drop Visualization
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab 
              icon={<TimelineIcon />} 
              label="Voltage Profile" 
              id="voltage-drop-viz-tab-0"
              aria-controls="voltage-drop-viz-tabpanel-0"
            />
            <Tab 
              icon={<CompareIcon />} 
              label="Conductor Comparison" 
              id="voltage-drop-viz-tab-1"
              aria-controls="voltage-drop-viz-tabpanel-1"
              disabled={!alternativeResults || !alternativeSizes}
            />
            <Tab 
              icon={<CircuitIcon />} 
              label="Circuit Diagram" 
              id="voltage-drop-viz-tab-2"
              aria-controls="voltage-drop-viz-tabpanel-2"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle2" gutterBottom>
            Voltage profile along the conductor length
          </Typography>
          
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={generateVoltageProfileData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="distance" 
                  name="Distance" 
                  label={{ value: 'Distance (m)', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  yAxisId="left"
                  name="Voltage" 
                  label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  name="Percentage" 
                  label={{ value: 'Voltage Drop (%)', angle: 90, position: 'insideRight' }} 
                />
                <RechartsTooltip 
                  formatter={(value: number, name: string) => {
                    return [
                      name === 'voltage' 
                        ? `${value.toFixed(2)} V` 
                        : `${value.toFixed(2)}%`,
                      name === 'voltage' ? 'Voltage' : 'Voltage Drop'
                    ];
                  }}
                  labelFormatter={(value) => `Distance: ${value.toFixed(2)} m`}
                />
                <Legend />
                <ReferenceLine
                  yAxisId="right"
                  y={results.maxAllowedDrop}
                  stroke={error}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Max: ${results.maxAllowedDrop}%`,
                    position: 'right', 
                    fill: error, 
                    fontSize: 12 
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  name="voltage"
                  stroke={primary}
                  strokeWidth={2}
                  dot={{ stroke: primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: primary, strokeWidth: 2, r: 6 }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="percentage"
                  name="percentage"
                  fill={warning}
                  stroke={warning}
                  fillOpacity={0.3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {results.compliance === 'compliant' ? (
                <Box sx={{ color: success, display: 'flex', alignItems: 'center' }}>
                  <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Voltage drop is within acceptable limits ({results.voltageDropPercent.toFixed(2)}% ≤ {results.maxAllowedDrop}%)
                </Box>
              ) : (
                <Box sx={{ color: error, display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Voltage drop exceeds acceptable limits ({results.voltageDropPercent.toFixed(2)}% &gt; {results.maxAllowedDrop}%)
                </Box>
              )}
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle2" gutterBottom>
            Comparison of different conductor sizes
          </Typography>
          
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={generateComparisonData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="size" />
                <YAxis 
                  label={{ value: 'Voltage Drop (%)', angle: -90, position: 'insideLeft' }} 
                />
                <RechartsTooltip 
                  formatter={(value: number, name: string, props: any) => {
                    const { payload } = props;
                    if (name === 'voltageDrop') {
                      return [
                        `${value.toFixed(2)}%`, 
                        'Voltage Drop',
                        payload.compliance ? '✅ Compliant' : '❌ Non-compliant'
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <ReferenceLine 
                  y={results.maxAllowedDrop} 
                  stroke={error}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Max: ${results.maxAllowedDrop}%`,
                    position: 'right', 
                    fill: error, 
                    fontSize: 12 
                  }}
                />
                <Bar 
                  dataKey="voltageDrop" 
                  name="Voltage Drop" 
                  fill={primary}
                  shape={(props: any) => {
                    const { payload, x, y, width, height } = props;
                    const color = payload.compliance ? success : error;
                    
                    return (
                      <g>
                        <rect x={x} y={y} width={width} height={height} fill={color} />
                        {payload.size === inputs.conductorSize && (
                          <rect
                            x={x - 2}
                            y={y - 2}
                            width={width + 4}
                            height={height + 4}
                            fill="none"
                            stroke={secondary}
                            strokeWidth={2}
                            strokeDasharray="5,2"
                          />
                        )}
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Current conductor size: <strong>{inputs.conductorSize}</strong> ({CONDUCTOR_SIZES[inputs.conductorSize]} cmil)
            </Typography>
            {alternativeResults && alternativeSizes && alternativeSizes.some(size => 
              alternativeResults[size].compliance === 'compliant' && 
              results.compliance === 'non-compliant'
            ) && (
              <Typography variant="body2" sx={{ color: warning, mt: 1 }}>
                Increasing conductor size could improve voltage drop compliance.
              </Typography>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle2" gutterBottom>
            Circuit diagram with voltage drop
          </Typography>
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              height: 300, 
              position: 'relative', 
              background: theme.palette.background.default
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 3
              }}
            >
              {/* Source */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: `2px solid ${primary}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 1
                  }}
                >
                  <Typography variant="subtitle2">Source</Typography>
                  <Typography variant="body2" color="primary">
                    {inputs.systemVoltage}V
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    flex: 1,
                    height: 10,
                    display: 'flex',
                    mx: 2,
                    position: 'relative'
                  }}
                >
                  {/* Conductor representation */}
                  <Box 
                    sx={{ 
                      height: 10, 
                      width: '100%', 
                      background: `linear-gradient(to right, ${success}, ${results.compliance === 'compliant' ? success : error})`,
                      borderRadius: 5,
                      position: 'relative'
                    }}
                  />
                  
                  {/* Length indicator */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute', 
                      top: -20,
                      left: 0,
                      right: 0,
                      textAlign: 'center'
                    }}
                  >
                    Length: {inputs.conductorLength}m
                  </Typography>
                  
                  {/* Voltage drop indicator */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -20,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      color: results.compliance === 'compliant' ? success : error
                    }}
                  >
                    Drop: {results.voltageDropPercent.toFixed(2)}%
                  </Typography>
                </Box>
                
                {/* Load */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: `2px solid ${results.compliance === 'compliant' ? success : error}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 1
                  }}
                >
                  <Typography variant="subtitle2">Load</Typography>
                  <Typography 
                    variant="body2" 
                    color={results.compliance === 'compliant' ? 'success' : 'error'}
                  >
                    {results.receivingEndVoltage.toFixed(1)}V
                  </Typography>
                </Box>
              </Box>
              
              {/* Circuit details */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption">Current</Typography>
                    <Typography variant="body2">{inputs.loadCurrent} A</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption">Conductor</Typography>
                    <Typography variant="body2">{inputs.conductorSize}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1, bgcolor: results.compliance === 'compliant' ? success : error }}>
                    <Typography variant="caption" sx={{ color: '#fff' }}>Status</Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {results.compliance === 'compliant' ? 'Compliant' : 'Non-compliant'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default EnhancedVoltageDropVisualization; 