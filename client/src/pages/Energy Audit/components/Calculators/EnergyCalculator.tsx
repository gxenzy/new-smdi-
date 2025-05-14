import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';

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
}

function a11yProps(index: number) {
  return {
    id: `calculator-tab-${index}`,
    'aria-controls': `calculator-tabpanel-${index}`,
  };
}

// PEC 2017 and other standards references
const STANDARDS = {
  powerFactor: {
    min: 0.85,
    reference: 'PEC 2017 4.30'
  },
  lighting: {
    officeLux: 500,
    classroomLux: 500,
    corridorLux: 100,
    reference: 'PEC 2017 5.20'
  },
  voltage: {
    nominal: 230,
    minPercent: -10, // 207V
    maxPercent: 10, // 253V
    reference: 'PEC 2017 2.30'
  },
  grounding: {
    maxResistance: 25, // ohms
    reference: 'PEC 2017 4.10'
  }
};

const EnergyCalculator: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Power calculation state
  const [powerInputs, setPowerInputs] = useState({
    voltage: '230',
    current: '',
    powerFactor: '0.85',
    hours: '8',
    days: '22',
    rate: '6.50'
  });
  
  // Lighting calculation state
  const [lightingInputs, setLightingInputs] = useState({
    area: '100',
    fixtureCount: '10',
    fixtureWattage: '36',
    luxLevel: '',
    roomType: 'office'
  });
  
  // HVAC calculation state
  const [hvacInputs, setHvacInputs] = useState({
    btuRating: '12000',
    eerRating: '10',
    hours: '8',
    days: '22',
    rate: '6.50'
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle power input changes
  const handlePowerInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPowerInputs({
      ...powerInputs,
      [field]: event.target.value
    });
  };
  
  // Handle lighting input changes
  const handleLightingInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLightingInputs({
      ...lightingInputs,
      [field]: event.target.value
    });
  };
  
  // Handle room type change
  const handleRoomTypeChange = (event: SelectChangeEvent) => {
    setLightingInputs({
      ...lightingInputs,
      roomType: event.target.value
    });
  };
  
  // Handle HVAC input changes
  const handleHvacInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setHvacInputs({
      ...hvacInputs,
      [field]: event.target.value
    });
  };
  
  // Power calculations
  const calculatePower = () => {
    const voltage = parseFloat(powerInputs.voltage);
    const current = parseFloat(powerInputs.current);
    const powerFactor = parseFloat(powerInputs.powerFactor);
    const hours = parseFloat(powerInputs.hours);
    const days = parseFloat(powerInputs.days);
    const rate = parseFloat(powerInputs.rate);
    
    // Apparent power (VA)
    const apparentPower = voltage * current;
    
    // Real power (W)
    const realPower = voltage * current * powerFactor;
    
    // Reactive power (VAR)
    const reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(realPower, 2));
    
    // Daily energy consumption (kWh)
    const dailyEnergy = (realPower * hours) / 1000;
    
    // Monthly energy consumption (kWh)
    const monthlyEnergy = dailyEnergy * days;
    
    // Monthly cost
    const monthlyCost = monthlyEnergy * rate;
    
    // Power factor assessment
    const powerFactorStatus = powerFactor >= STANDARDS.powerFactor.min ? 'Compliant' : 'Non-compliant';
    
    return {
      apparentPower,
      realPower,
      reactivePower,
      dailyEnergy,
      monthlyEnergy,
      monthlyCost,
      powerFactorStatus
    };
  };
  
  // Lighting calculations
  const calculateLighting = () => {
    const area = parseFloat(lightingInputs.area);
    const fixtureCount = parseFloat(lightingInputs.fixtureCount);
    const fixtureWattage = parseFloat(lightingInputs.fixtureWattage);
    const luxLevel = lightingInputs.luxLevel ? parseFloat(lightingInputs.luxLevel) : 0;
    
    // Total lighting power (W)
    const totalPower = fixtureCount * fixtureWattage;
    
    // Lighting power density (W/m²)
    const lpd = totalPower / area;
    
    // Required lux level based on room type
    let requiredLux = 0;
    switch (lightingInputs.roomType) {
      case 'office':
        requiredLux = STANDARDS.lighting.officeLux;
        break;
      case 'classroom':
        requiredLux = STANDARDS.lighting.classroomLux;
        break;
      case 'corridor':
        requiredLux = STANDARDS.lighting.corridorLux;
        break;
      default:
        requiredLux = 500;
    }
    
    // Lighting adequacy assessment
    const luxStatus = luxLevel >= requiredLux ? 'Adequate' : 'Inadequate';
    
    // Estimated energy efficiency (lumens per watt)
    // Assuming 70 lm/W for fluorescent and 100 lm/W for LED
    const efficiency = 70;
    
    // Estimated total lumens
    const totalLumens = totalPower * efficiency;
    
    // Estimated average illuminance (lux)
    const estimatedLux = totalLumens / area;
    
    return {
      totalPower,
      lpd,
      requiredLux,
      luxStatus,
      efficiency,
      totalLumens,
      estimatedLux
    };
  };
  
  // HVAC calculations
  const calculateHVAC = () => {
    const btuRating = parseFloat(hvacInputs.btuRating);
    const eerRating = parseFloat(hvacInputs.eerRating);
    const hours = parseFloat(hvacInputs.hours);
    const days = parseFloat(hvacInputs.days);
    const rate = parseFloat(hvacInputs.rate);
    
    // Convert BTU/h to kW
    const coolingCapacityKW = btuRating / 3412;
    
    // Power consumption (kW)
    const powerConsumption = btuRating / (eerRating * 1000);
    
    // Daily energy consumption (kWh)
    const dailyEnergy = powerConsumption * hours;
    
    // Monthly energy consumption (kWh)
    const monthlyEnergy = dailyEnergy * days;
    
    // Monthly cost
    const monthlyCost = monthlyEnergy * rate;
    
    // EER assessment (typical good EER is 11+)
    const eerStatus = eerRating >= 11 ? 'Efficient' : 'Inefficient';
    
    return {
      coolingCapacityKW,
      powerConsumption,
      dailyEnergy,
      monthlyEnergy,
      monthlyCost,
      eerStatus
    };
  };
  
  // Calculate results based on current inputs
  const powerResults = calculatePower();
  const lightingResults = calculateLighting();
  const hvacResults = calculateHVAC();
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Energy Audit Calculator
      </Typography>
      
      <Typography variant="body1" paragraph>
        Use these calculators to perform manual energy audit calculations based on field measurements.
        All calculations reference PEC 2017 standards where applicable.
      </Typography>
      
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="energy calculator tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ElectricalServicesIcon />} label="Power & Energy" {...a11yProps(0)} />
            <Tab icon={<LightbulbIcon />} label="Lighting" {...a11yProps(1)} />
            <Tab icon={<AcUnitIcon />} label="HVAC" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        {/* Power & Energy Calculator */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Power & Energy Inputs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Voltage (V)"
                      type="number"
                      value={powerInputs.voltage}
                      onChange={handlePowerInputChange('voltage')}
                      fullWidth
                      helperText={`Nominal: ${STANDARDS.voltage.nominal}V (±${STANDARDS.voltage.maxPercent}%)`}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Current (A)"
                      type="number"
                      value={powerInputs.current}
                      onChange={handlePowerInputChange('current')}
                      fullWidth
                      required
                      error={!powerInputs.current}
                      helperText="Measured with clamp meter"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Power Factor"
                      type="number"
                      value={powerInputs.powerFactor}
                      onChange={handlePowerInputChange('powerFactor')}
                      fullWidth
                      inputProps={{ min: 0, max: 1, step: 0.01 }}
                      helperText={`Min: ${STANDARDS.powerFactor.min} (${STANDARDS.powerFactor.reference})`}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Operating Hours/Day"
                      type="number"
                      value={powerInputs.hours}
                      onChange={handlePowerInputChange('hours')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Operating Days/Month"
                      type="number"
                      value={powerInputs.days}
                      onChange={handlePowerInputChange('days')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Electricity Rate (₱/kWh)"
                      type="number"
                      value={powerInputs.rate}
                      onChange={handlePowerInputChange('rate')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Power & Energy Results
                </Typography>
                
                {!powerInputs.current ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enter current measurement to calculate results
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Apparent Power
                          </Typography>
                          <Typography variant="h5">
                            {powerResults.apparentPower.toFixed(2)} VA
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Real Power
                          </Typography>
                          <Typography variant="h5">
                            {powerResults.realPower.toFixed(2)} W
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Reactive Power
                          </Typography>
                          <Typography variant="h5">
                            {powerResults.reactivePower.toFixed(2)} VAR
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Power Factor Status
                          </Typography>
                          <Typography 
                            variant="h5" 
                            color={powerResults.powerFactorStatus === 'Compliant' ? 'success.main' : 'error.main'}
                          >
                            {powerResults.powerFactorStatus}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Energy Consumption
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Daily Energy
                          </Typography>
                          <Typography variant="h5">
                            {powerResults.dailyEnergy.toFixed(2)} kWh
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Monthly Energy
                          </Typography>
                          <Typography variant="h5">
                            {powerResults.monthlyEnergy.toFixed(2)} kWh
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Monthly Cost
                          </Typography>
                          <Typography variant="h5">
                            ₱{powerResults.monthlyCost.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Lighting Calculator */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Lighting Inputs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Room Area (m²)"
                      type="number"
                      value={lightingInputs.area}
                      onChange={handleLightingInputChange('area')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={lightingInputs.roomType}
                        label="Room Type"
                        onChange={handleRoomTypeChange}
                      >
                        <MenuItem value="office">Office</MenuItem>
                        <MenuItem value="classroom">Classroom</MenuItem>
                        <MenuItem value="corridor">Corridor/Hallway</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Number of Fixtures"
                      type="number"
                      value={lightingInputs.fixtureCount}
                      onChange={handleLightingInputChange('fixtureCount')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Wattage per Fixture (W)"
                      type="number"
                      value={lightingInputs.fixtureWattage}
                      onChange={handleLightingInputChange('fixtureWattage')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Measured Illuminance (lux)"
                      type="number"
                      value={lightingInputs.luxLevel}
                      onChange={handleLightingInputChange('luxLevel')}
                      fullWidth
                      helperText="Optional - measured with light meter"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Lighting Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Lighting Power
                        </Typography>
                        <Typography variant="h5">
                          {lightingResults.totalPower.toFixed(0)} W
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Lighting Power Density
                        </Typography>
                        <Typography variant="h5">
                          {lightingResults.lpd.toFixed(2)} W/m²
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Required Illuminance
                        </Typography>
                        <Typography variant="h5">
                          {lightingResults.requiredLux} lux
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {STANDARDS.lighting.reference}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Estimated Illuminance
                        </Typography>
                        <Typography variant="h5">
                          {lightingResults.estimatedLux.toFixed(0)} lux
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Based on typical efficiency
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {lightingInputs.luxLevel && (
                    <Grid item xs={12}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          bgcolor: lightingResults.luxStatus === 'Adequate' ? 'success.50' : 'error.50',
                          borderColor: lightingResults.luxStatus === 'Adequate' ? 'success.main' : 'error.main'
                        }}
                      >
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Lighting Adequacy Assessment
                          </Typography>
                          <Typography 
                            variant="h5" 
                            color={lightingResults.luxStatus === 'Adequate' ? 'success.main' : 'error.main'}
                          >
                            {lightingResults.luxStatus} ({lightingInputs.luxLevel} lux measured)
                          </Typography>
                          {lightingResults.luxStatus === 'Inadequate' && (
                            <Typography variant="body2" color="error">
                              Lighting level is below the required {lightingResults.requiredLux} lux for this space type.
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* HVAC Calculator */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  HVAC Inputs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Cooling Capacity (BTU/h)"
                      type="number"
                      value={hvacInputs.btuRating}
                      onChange={handleHvacInputChange('btuRating')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Energy Efficiency Ratio (EER)"
                      type="number"
                      value={hvacInputs.eerRating}
                      onChange={handleHvacInputChange('eerRating')}
                      fullWidth
                      inputProps={{ step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Operating Hours/Day"
                      type="number"
                      value={hvacInputs.hours}
                      onChange={handleHvacInputChange('hours')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Operating Days/Month"
                      type="number"
                      value={hvacInputs.days}
                      onChange={handleHvacInputChange('days')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Electricity Rate (₱/kWh)"
                      type="number"
                      value={hvacInputs.rate}
                      onChange={handleHvacInputChange('rate')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  HVAC Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Cooling Capacity
                        </Typography>
                        <Typography variant="h5">
                          {hvacResults.coolingCapacityKW.toFixed(2)} kW
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Converted from {hvacInputs.btuRating} BTU/h
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Power Consumption
                        </Typography>
                        <Typography variant="h5">
                          {hvacResults.powerConsumption.toFixed(2)} kW
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Daily Energy Consumption
                        </Typography>
                        <Typography variant="h5">
                          {hvacResults.dailyEnergy.toFixed(2)} kWh
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Monthly Energy Consumption
                        </Typography>
                        <Typography variant="h5">
                          {hvacResults.monthlyEnergy.toFixed(2)} kWh
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Monthly Cost
                        </Typography>
                        <Typography variant="h5">
                          ₱{hvacResults.monthlyCost.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        bgcolor: hvacResults.eerStatus === 'Efficient' ? 'success.50' : 'warning.50',
                        borderColor: hvacResults.eerStatus === 'Efficient' ? 'success.main' : 'warning.main'
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Efficiency Assessment
                        </Typography>
                        <Typography 
                          variant="h5" 
                          color={hvacResults.eerStatus === 'Efficient' ? 'success.main' : 'warning.main'}
                        >
                          {hvacResults.eerStatus}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          EER: {hvacInputs.eerRating} (Good: 11+)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Energy Audit Calculations
        </Typography>
        <Typography variant="body2" paragraph>
          These calculators provide a way to analyze field measurements taken during an energy audit. All calculations reference Philippine Electrical Code (PEC) 2017 standards where applicable.
        </Typography>
        <Typography variant="body2">
          For comprehensive energy audits, these calculations should be supplemented with detailed inspection of electrical systems, thermal imaging, power quality analysis, and other specialized tests as needed.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EnergyCalculator;