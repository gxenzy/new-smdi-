import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { saveCalculation } from './utils/storage';
import {
  calculateVoltageRegulation,
  CONDUCTOR_SIZES,
  VoltageRegulationInputs,
  VoltageRegulationResult,
  VOLTAGE_DROP_LIMITS,
  findMinimumConductorSize
} from './utils/voltageRegulationUtils';
import VoltageDropVisualization from './VoltageDropVisualization';

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
      id={`voltage-regulation-tabpanel-${index}`}
      aria-labelledby={`voltage-regulation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `voltage-regulation-tab-${index}`,
    'aria-controls': `voltage-regulation-tabpanel-${index}`,
  };
}

const VoltageRegulationCalculator: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [inputs, setInputs] = useState<VoltageRegulationInputs>({
    systemVoltage: 230,
    loadPower: 2000,
    powerFactor: 0.85,
    conductorLength: 100,
    conductorSize: '12 AWG',
    conductorMaterial: 'copper',
    conduitMaterial: 'PVC',
    phaseConfiguration: 'single-phase',
    temperature: 30
  });
  
  // Calculation results
  const [results, setResults] = useState<VoltageRegulationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [optimizedSize, setOptimizedSize] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setInputs((prev) => ({
        ...prev,
        [name]: value
      }));
      setIsCalculated(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate results
  const handleCalculate = () => {
    try {
      const calculationResults = calculateVoltageRegulation(inputs);
      setResults(calculationResults);
      
      // Find optimized conductor size
      const optimized = findMinimumConductorSize(
        {
          systemVoltage: inputs.systemVoltage,
          loadPower: inputs.loadPower,
          powerFactor: inputs.powerFactor,
          conductorLength: inputs.conductorLength,
          conductorMaterial: inputs.conductorMaterial,
          conduitMaterial: inputs.conduitMaterial,
          phaseConfiguration: inputs.phaseConfiguration,
          temperature: inputs.temperature
        },
        VOLTAGE_DROP_LIMITS.feeder
      );
      setOptimizedSize(optimized);
      
      setIsCalculated(true);
    } catch (error) {
      console.error('Calculation error:', error);
      // Handle error appropriately
    }
  };

  // Save calculation results
  const handleSave = () => {
    if (results) {
      saveCalculation(
        'voltage-regulation', 
        `Voltage Regulation - ${new Date().toLocaleDateString()}`,
        {
          inputs,
          results
        }
      );
      // Show success notification or feedback
    }
  };

  // Render the results section
  const renderResults = () => {
    if (!results) return null;

    const complianceColor = results.compliance === 'compliant' 
      ? theme.palette.success.main 
      : theme.palette.error.main;

    return (
      <Box mt={2}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Calculation Results
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Voltage Drop
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    Percentage: <strong>{results.voltageDropPercent.toFixed(2)}%</strong>
                  </Typography>
                  <Typography variant="body1">
                    Absolute: <strong>{results.voltageDrop.toFixed(2)} V</strong>
                  </Typography>
                  <Typography variant="body1">
                    Receiving End Voltage: <strong>{results.receivingEndVoltage.toFixed(2)} V</strong>
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Power Losses
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    Resistive Loss: <strong>{results.resistiveLoss.toFixed(2)} W</strong>
                  </Typography>
                  <Typography variant="body1">
                    Reactive Loss: <strong>{results.reactiveLoss.toFixed(2)} VAR</strong>
                  </Typography>
                  <Typography variant="body1">
                    Total Loss: <strong>{results.totalLoss.toFixed(2)} VA</strong>
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: results.compliance === 'compliant' ? 'success.light' : 'error.light', 
                  borderRadius: 1 
                }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: results.compliance === 'compliant' ? 'success.dark' : 'error.dark' 
                    }}
                  >
                    {results.compliance === 'compliant' ? 
                      <CheckCircleIcon sx={{ mr: 1 }} /> : 
                      <ErrorIcon sx={{ mr: 1 }} />
                    }
                    <strong>
                      {results.compliance === 'compliant' ? 
                        'Compliant with PEC 2017 Section 2.30' : 
                        'Non-compliant with PEC 2017 Section 2.30'
                      }
                    </strong>
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommendations
                </Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <ul>
                    {results.recommendations.map((rec, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{rec}</Typography>
                      </li>
                    ))}
                  </ul>
                </Paper>
              </Grid>
              
              {optimizedSize && optimizedSize !== inputs.conductorSize && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'info.light', 
                      color: 'info.contrastText',
                      borderRadius: 1,
                      mt: 1 
                    }}
                  >
                    <Typography variant="body1">
                      <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Recommended minimum conductor size for compliance: <strong>{optimizedSize}</strong>
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
        
        <Box mt={3}>
          <VoltageDropVisualization inputs={inputs} results={results} />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Voltage Regulation Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Calculate voltage drop and regulation according to PEC 2017 Section 2.30.
        This calculator helps you determine if your electrical system meets the voltage drop limits.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="voltage regulation calculator tabs">
          <Tab label="Calculator" {...a11yProps(0)} />
          <Tab label="Reference" {...a11yProps(1)} />
          <Tab label="Help" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* System Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                System Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="System Voltage"
                    name="systemVoltage"
                    value={inputs.systemVoltage}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">V</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" margin="normal">
                    <Typography variant="body2" gutterBottom>
                      Phase Configuration
                    </Typography>
                    <RadioGroup
                      name="phaseConfiguration"
                      value={inputs.phaseConfiguration}
                      onChange={handleInputChange}
                      row
                    >
                      <FormControlLabel 
                        value="single-phase" 
                        control={<Radio />} 
                        label="Single Phase" 
                      />
                      <FormControlLabel 
                        value="three-phase" 
                        control={<Radio />} 
                        label="Three Phase" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Load Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Load Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Load Power"
                    name="loadPower"
                    value={inputs.loadPower}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">W</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Power Factor"
                    name="powerFactor"
                    value={inputs.powerFactor}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Conductor Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Conductor Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Conductor Length"
                    name="conductorLength"
                    value={inputs.conductorLength}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <Typography variant="body2" gutterBottom>
                      Conductor Size
                    </Typography>
                    <Select
                      name="conductorSize"
                      value={inputs.conductorSize}
                      onChange={(e: SelectChangeEvent) => {
                        setInputs(prev => ({
                          ...prev,
                          conductorSize: e.target.value
                        }));
                        setIsCalculated(false);
                      }}
                    >
                      {Object.keys(CONDUCTOR_SIZES).map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <Typography variant="body2" gutterBottom>
                      Conductor Material
                    </Typography>
                    <RadioGroup
                      name="conductorMaterial"
                      value={inputs.conductorMaterial}
                      onChange={handleInputChange}
                      row
                    >
                      <FormControlLabel 
                        value="copper" 
                        control={<Radio />} 
                        label="Copper" 
                      />
                      <FormControlLabel 
                        value="aluminum" 
                        control={<Radio />} 
                        label="Aluminum" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <Typography variant="body2" gutterBottom>
                      Conduit Material
                    </Typography>
                    <RadioGroup
                      name="conduitMaterial"
                      value={inputs.conduitMaterial}
                      onChange={handleInputChange}
                      row
                    >
                      <FormControlLabel 
                        value="PVC" 
                        control={<Radio />} 
                        label="PVC" 
                      />
                      <FormControlLabel 
                        value="steel" 
                        control={<Radio />} 
                        label="Steel" 
                      />
                      <FormControlLabel 
                        value="aluminum" 
                        control={<Radio />} 
                        label="Aluminum" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Environmental Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Environmental Parameters
              </Typography>
              <Box sx={{ width: '100%', p: 2 }}>
                <Typography id="temperature-slider" gutterBottom>
                  Ambient Temperature: {inputs.temperature}°C
                </Typography>
                <Slider
                  value={inputs.temperature}
                  onChange={(_, newValue) => {
                    setInputs(prev => ({
                      ...prev,
                      temperature: newValue as number
                    }));
                    setIsCalculated(false);
                  }}
                  aria-labelledby="temperature-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={50}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Conductor temperature affects resistance and voltage drop.
                  Default temperature coefficient values will be applied based on conductor material.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  startIcon={<CalculateIcon />}
                >
                  Calculate
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  disabled={!isCalculated}
                >
                  Save Results
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Section */}
        {isCalculated && renderResults()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            PEC 2017 Section 2.30 - Voltage Drop
          </Typography>
          
          <Typography variant="body1" paragraph>
            The Philippine Electrical Code (PEC) 2017 Section 2.30 specifies requirements for voltage drop in electrical installations:
          </Typography>
          
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Voltage Drop Limits:
            </Typography>
            <ul>
              <li>
                <Typography variant="body1">
                  Branch Circuits: Maximum {VOLTAGE_DROP_LIMITS.branch}% voltage drop
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Feeders: Maximum {VOLTAGE_DROP_LIMITS.feeder}% voltage drop
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Total (Service to Farthest Outlet): Maximum {VOLTAGE_DROP_LIMITS.total}% voltage drop
                </Typography>
              </li>
            </ul>
          </Box>
          
          <Typography variant="body1" paragraph>
            The code requires that conductors be sized to provide adequate voltage at terminals of equipment.
            Excessive voltage drop can lead to poor equipment performance, overheating, and power quality issues.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            Key Factors Affecting Voltage Drop:
          </Typography>
          
          <ol>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Length:</strong> Longer conductors have more resistance and greater voltage drop.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Size:</strong> Smaller conductors have higher resistance and greater voltage drop.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Material:</strong> Aluminum has approximately 1.6 times the resistance of copper.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Power Factor:</strong> Lower power factor increases the current for the same load power, increasing voltage drop.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Temperature:</strong> Higher ambient temperature increases conductor resistance.
              </Typography>
            </li>
          </ol>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Using the Voltage Regulation Calculator
          </Typography>
          
          <Typography variant="body1" paragraph>
            This calculator helps you determine the voltage drop in electrical circuits and check compliance with PEC 2017 requirements.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            Input Guidelines:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>System Voltage:</strong> Enter the nominal system voltage (e.g., 230V for typical residential, 400V for three-phase).
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Phase Configuration:</strong> Select single-phase for residential circuits or three-phase for industrial applications.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Load Power:</strong> Enter the power in watts (W) of the connected load.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Power Factor:</strong> Enter the power factor (0-1) of the load. Typical values:
                <ul>
                  <li>Resistive loads (heaters, incandescent): 1.0</li>
                  <li>Motors: 0.7-0.9</li>
                  <li>Fluorescent lighting: 0.8-0.9</li>
                  <li>LED lighting: 0.9-1.0</li>
                </ul>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Length:</strong> Enter the one-way length of the conductor in meters.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Size:</strong> Select the size from standard AWG/MCM sizes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Conductor Material:</strong> Choose copper or aluminum.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>Conduit Material:</strong> Select the conduit material, which affects the circuit reactance.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                <strong>Temperature:</strong> Enter the ambient temperature in °C. Higher temperatures increase conductor resistance.
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Interpreting Results:
            </Typography>
            
            <Typography variant="body1" paragraph>
              After calculation, you'll see:
            </Typography>
            
            <ul>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Voltage Drop (%):</strong> The percentage voltage drop in the circuit.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Voltage Drop (V):</strong> The absolute voltage drop in volts.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Receiving End Voltage:</strong> The voltage at the load terminals.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Power Losses:</strong> The resistive and reactive power losses in the circuit.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Compliance Status:</strong> Whether the circuit meets PEC 2017 requirements.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>
                  <strong>Recommendations:</strong> Suggestions to improve the design if needed.
                </Typography>
              </li>
            </ul>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default VoltageRegulationCalculator; 