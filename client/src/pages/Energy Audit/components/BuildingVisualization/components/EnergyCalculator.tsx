import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert
} from '@mui/material';
import { Calculate, LightbulbOutlined, ElectricBolt } from '@mui/icons-material';

// Interface for Lighting Calculator form
interface LightingCalculatorForm {
  roomType: string;
  area: number;
  ceilingHeight: number;
  targetLux: number;
  reflectance: string;
}

// Interface for Power Calculator form
interface PowerCalculatorForm {
  circuitName: string;
  circuitType: string;
  voltage: number;
  totalWattage: number;
  powerFactor: number;
  operatingHours: number;
  daysPerMonth: number;
}

// Interface for LoadSchedule (simplified version)
interface LoadSchedule {
  id: string;
  roomId: string;
  name: string;
  scheduleType: string;
  operatingHours?: {
    weekday?: { start?: string; end?: string };
    weekend?: { start?: string; end?: string };
  };
  details?: {
    fixtures?: number;
    wattsPerFixture?: number;
    totalWattage?: number;
  };
}

// Utility functions for calculations
const calculateLightingRequirements = (
  area: number,
  roomType: string,
  ceilingHeight: number,
  targetLux: number
): {
  requiredLux: number;
  totalLumens: number;
  recommendedFixtures: number;
  wattsPerFixture: number;
  totalWattage: number;
  energyConsumption: number;
} => {
  // Base lighting requirements by room type (lux)
  const baseRequirements: Record<string, number> = {
    'classroom': 300,
    'lab': 500,
    'office': 350,
    'common': 150,
    'utility': 200,
    'corridor': 100,
    'default': 250
  };
  
  // Utilize factor based on ceiling height
  const utilizationFactor = ceilingHeight <= 2.5 ? 0.5 : 
                            ceilingHeight <= 3.0 ? 0.45 : 
                            ceilingHeight <= 3.5 ? 0.4 : 0.35;
  
  // Maintenance factor
  const maintenanceFactor = 0.8;
  
  // Required lux (either from parameter or default for room type)
  const requiredLux = targetLux || baseRequirements[roomType] || baseRequirements.default;
  
  // Calculate total lumens required
  const totalLumens = (requiredLux * area) / (utilizationFactor * maintenanceFactor);
  
  // Average lumens per fixture based on room type
  const lumensPerFixture: Record<string, number> = {
    'classroom': 3000,
    'lab': 4000,
    'office': 2500,
    'common': 2000,
    'utility': 3000,
    'corridor': 1500,
    'default': 2500
  };
  
  const fixtureLumens = lumensPerFixture[roomType] || lumensPerFixture.default;
  
  // Calculate recommended number of fixtures
  const recommendedFixtures = Math.ceil(totalLumens / fixtureLumens);
  
  // Average watts per fixture based on lumens (LED efficiency)
  const wattsPerFixture = Math.round(fixtureLumens / 100); // Assumes 100 lm/W efficiency
  
  // Calculate total wattage
  const totalWattage = recommendedFixtures * wattsPerFixture;
  
  // Calculate monthly energy consumption (assuming 8 hours/day, 22 days/month)
  const energyConsumption = (totalWattage * 8 * 22) / 1000; // kWh
  
  return {
    requiredLux,
    totalLumens,
    recommendedFixtures,
    wattsPerFixture,
    totalWattage,
    energyConsumption
  };
};

const calculatePowerConsumption = (loadSchedule: LoadSchedule): {
  peakDemand: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  costPerMonth: number;
} => {
  // Default operating hours if not specified in load schedule
  const operatingHours = 8; // Default 8 hours per day
  const daysPerMonth = 22; // Typical working days
  
  // Get total wattage from the schedule
  const totalWattage = loadSchedule.details?.totalWattage || 1000; // Default to 1000W if not specified
  
  // Calculate peak demand in kW
  const peakDemand = totalWattage / 1000;
  
  // Calculate energy consumption
  const dailyConsumption = peakDemand * operatingHours;
  const monthlyConsumption = dailyConsumption * daysPerMonth;
  const annualConsumption = monthlyConsumption * 12;
  
  // Calculate cost (assume PHP 10 per kWh)
  const energyRate = 10; // PHP per kWh
  const costPerMonth = monthlyConsumption * energyRate;
  
  return {
    peakDemand,
    dailyConsumption,
    monthlyConsumption,
    annualConsumption,
    costPerMonth
  };
};

const recommendCircuitBreaker = (
  wattage: number,
  voltage: number = 220
): number => {
  // Calculate current (I = P/V)
  const current = wattage / voltage;
  
  // Add 25% safety margin
  const safetyMargin = current * 1.25;
  
  // Standard circuit breaker sizes
  const standardSizes = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100];
  
  // Find the smallest circuit breaker that can handle the load
  for (const size of standardSizes) {
    if (size >= safetyMargin) {
      return size;
    }
  }
  
  // If beyond 100A, return the next highest multiple of 10
  return Math.ceil(safetyMargin / 10) * 10;
};

// Tab Panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Lighting Calculator component
const LightingCalculator: React.FC = () => {
  // Default form values
  const initialForm: LightingCalculatorForm = {
    roomType: 'classroom',
    area: 50,
    ceilingHeight: 3,
    targetLux: 300,
    reflectance: 'medium'
  };

  // State
  const [form, setForm] = useState<LightingCalculatorForm>(initialForm);
  const [results, setResults] = useState<any>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'roomType') {
      // Update target lux based on room type
      const luxLevels: Record<string, number> = {
        'classroom': 300,
        'lab': 500,
        'office': 350,
        'common': 150,
        'utility': 200,
        'corridor': 100
      };
      
      setForm({
        ...form,
        [name]: value,
        targetLux: luxLevels[value as keyof typeof luxLevels] || 300
      });
    } else {
      setForm({
        ...form,
        [name]: name === 'reflectance' ? value : Number(value)
      });
    }
  };

  // Calculate lighting requirements
  const calculateLighting = () => {
    const { area, roomType, ceilingHeight, targetLux } = form;
    
    // Validate inputs
    if (area <= 0 || ceilingHeight <= 0 || targetLux <= 0) {
      return;
    }
    
    // Calculate lighting requirements
    const lightingResults = calculateLightingRequirements(
      area,
      roomType,
      ceilingHeight,
      targetLux
    );
    
    setResults(lightingResults);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <LightbulbOutlined sx={{ mr: 1 }} />
        Lighting Calculator
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Calculate lighting requirements and energy consumption based on room specifications
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Input form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Input Parameters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Room Type"
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  margin="normal"
                >
                  <MenuItem value="classroom">Classroom</MenuItem>
                  <MenuItem value="lab">Laboratory</MenuItem>
                  <MenuItem value="office">Office</MenuItem>
                  <MenuItem value="common">Common Area</MenuItem>
                  <MenuItem value="utility">Utility Room</MenuItem>
                  <MenuItem value="corridor">Corridor</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area (m²)"
                  name="area"
                  type="number"
                  value={form.area}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ceiling Height (m)"
                  name="ceilingHeight"
                  type="number"
                  value={form.ceilingHeight}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 2, max: 10, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Illumination (lux)"
                  name="targetLux"
                  type="number"
                  value={form.targetLux}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 50, max: 1000, step: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Surface Reflectance"
                  name="reflectance"
                  value={form.reflectance}
                  onChange={handleChange}
                  margin="normal"
                >
                  <MenuItem value="high">High (Light colors)</MenuItem>
                  <MenuItem value="medium">Medium (Neutral colors)</MenuItem>
                  <MenuItem value="low">Low (Dark colors)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Calculate />}
                onClick={calculateLighting}
              >
                Calculate
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Calculation Results
            </Typography>
            
            {!results ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary">
                  Enter parameters and click Calculate to see results
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Required Illumination</TableCell>
                      <TableCell align="right">{results.requiredLux} lux</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Lumens Required</TableCell>
                      <TableCell align="right">{Math.round(results.totalLumens).toLocaleString()} lumens</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Recommended Fixtures</TableCell>
                      <TableCell align="right">{results.recommendedFixtures}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Watts per Fixture</TableCell>
                      <TableCell align="right">{results.wattsPerFixture} W</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Wattage</TableCell>
                      <TableCell align="right">{results.totalWattage} W</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Monthly Energy Consumption</TableCell>
                      <TableCell align="right">{results.energyConsumption.toFixed(2)} kWh</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Recommended Circuit Breaker</TableCell>
                      <TableCell align="right">{recommendCircuitBreaker(results.totalWattage)} A</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Power Calculator component
const PowerCalculator: React.FC = () => {
  // Default form values
  const initialForm: PowerCalculatorForm = {
    circuitName: 'Main Circuit',
    circuitType: 'lighting',
    voltage: 220,
    totalWattage: 1000,
    powerFactor: 0.85,
    operatingHours: 8,
    daysPerMonth: 22
  };

  // Mock load schedule for calculation
  const [mockSchedule, setMockSchedule] = useState<LoadSchedule>({
    id: 'mock-schedule',
    roomId: 'mock-room',
    name: 'Sample Schedule',
    scheduleType: 'lighting',
    operatingHours: {
      weekday: { start: '08:00', end: '17:00' },
      weekend: { start: '10:00', end: '15:00' }
    },
    details: {
      fixtures: 10,
      wattsPerFixture: 100,
      totalWattage: 1000
    }
  });

  // State
  const [form, setForm] = useState<PowerCalculatorForm>(initialForm);
  const [results, setResults] = useState<any>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: name === 'circuitName' || name === 'circuitType' ? value : Number(value)
    });
    
    // Update mock schedule when form changes
    if (name === 'totalWattage') {
      setMockSchedule(prev => ({
        ...prev,
        details: {
          ...prev.details!,
          totalWattage: Number(value)
        }
      }));
    } else if (name === 'operatingHours') {
      const hours = Number(value);
      setMockSchedule(prev => ({
        ...prev,
        operatingHours: {
          weekday: { 
            start: '08:00', 
            end: `${8 + hours}:00` 
          },
          weekend: { 
            start: '10:00', 
            end: `${Math.min(10 + hours, 23)}:00` 
          }
        }
      }));
    }
  };

  // Calculate power consumption
  const calculatePower = () => {
    // Validate inputs
    if (form.totalWattage <= 0 || form.voltage <= 0 || form.operatingHours <= 0) {
      return;
    }
    
    // Calculate power consumption
    const powerResults = calculatePowerConsumption(mockSchedule);
    
    setResults(powerResults);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <ElectricBolt sx={{ mr: 1 }} />
        Power Calculator
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Calculate power consumption, energy usage and circuit requirements
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Input form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Input Parameters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Circuit Name"
                  name="circuitName"
                  value={form.circuitName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Circuit Type"
                  name="circuitType"
                  value={form.circuitType}
                  onChange={handleChange}
                  margin="normal"
                >
                  <MenuItem value="lighting">Lighting</MenuItem>
                  <MenuItem value="power">Power</MenuItem>
                  <MenuItem value="hvac">HVAC</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Voltage (V)"
                  name="voltage"
                  type="number"
                  value={form.voltage}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 110, max: 440, step: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Wattage (W)"
                  name="totalWattage"
                  type="number"
                  value={form.totalWattage}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Power Factor"
                  name="powerFactor"
                  type="number"
                  value={form.powerFactor}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 0.1, max: 1, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operating Hours (per day)"
                  name="operatingHours"
                  type="number"
                  value={form.operatingHours}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 1, max: 24 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Days per Month"
                  name="daysPerMonth"
                  type="number"
                  value={form.daysPerMonth}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Calculate />}
                onClick={calculatePower}
              >
                Calculate
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Calculation Results
            </Typography>
            
            {!results ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary">
                  Enter parameters and click Calculate to see results
                </Typography>
              </Box>
            ) : (
              <Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Peak Demand</TableCell>
                        <TableCell align="right">{results.peakDemand.toFixed(2)} kW</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Current</TableCell>
                        <TableCell align="right">
                          {(form.totalWattage / (form.voltage * form.powerFactor)).toFixed(2)} A
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Daily Energy Consumption</TableCell>
                        <TableCell align="right">{results.dailyConsumption.toFixed(2)} kWh</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Energy Consumption</TableCell>
                        <TableCell align="right">{results.monthlyConsumption.toFixed(2)} kWh</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annual Energy Consumption</TableCell>
                        <TableCell align="right">{results.annualConsumption.toFixed(2)} kWh</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Estimated Monthly Cost</TableCell>
                        <TableCell align="right">₱{results.costPerMonth.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Recommended Circuit Breaker</TableCell>
                        <TableCell align="right">
                          {recommendCircuitBreaker(form.totalWattage, form.voltage)} A
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 2 }} />
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Based on Philippine Electrical Code standards, this circuit requires a minimum wire size of {' '}
                    {form.totalWattage / form.voltage < 15 ? '2.0mm²' : 
                     form.totalWattage / form.voltage < 20 ? '3.5mm²' : '5.5mm²'} 
                    {' '} THHN wire.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Energy Calculator Component
 * Comprehensive calculator for energy audit applications
 * Includes lighting and power calculation modules
 */
const EnergyCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="energy calculator tabs"
        >
          <Tab label="Lighting Calculator" icon={<LightbulbOutlined />} iconPosition="start" />
          <Tab label="Power Calculator" icon={<ElectricBolt />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <LightingCalculator />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <PowerCalculator />
      </TabPanel>
    </Paper>
  );
};

export default EnergyCalculator; 