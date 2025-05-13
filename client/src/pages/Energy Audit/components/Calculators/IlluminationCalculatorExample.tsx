import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider
} from '@mui/material';
import StandardValueSelector from '../../../../components/StandardsReference/StandardValueSelector';

/**
 * Example component to demonstrate integrating the StandardValueSelector with an Illumination Calculator
 */
const IlluminationCalculatorExample: React.FC = () => {
  // Calculator state
  const [roomWidth, setRoomWidth] = useState<number | ''>('');
  const [roomLength, setRoomLength] = useState<number | ''>('');
  const [roomHeight, setRoomHeight] = useState<number | ''>('');
  const [maintenanceFactor, setMaintenanceFactor] = useState<number>(0.8);
  const [reflectanceCeiling, setReflectanceCeiling] = useState<number>(70);
  const [reflectanceWalls, setReflectanceWalls] = useState<number>(50);
  const [reflectanceFloor, setReflectanceFloor] = useState<number>(20);
  
  // Standard-based values
  const [requiredIlluminance, setRequiredIlluminance] = useState<number | null>(null);
  const [standardReference, setStandardReference] = useState<string | null>(null);
  
  // Results
  const [calculatedResults, setCalculatedResults] = useState<{
    floorArea: number;
    roomIndex: number;
    requiredLumens: number;
    recommendedLuminaires: number;
    standardCompliance: boolean;
  } | null>(null);
  
  // Handle standard value selection
  const handleStandardValueSelect = (value: any) => {
    setRequiredIlluminance(Number(value.value));
    setStandardReference(`${value.source} ${value.reference}`);
  };
  
  // Calculate illumination requirements
  const calculateIllumination = () => {
    if (!roomWidth || !roomLength || !roomHeight || !requiredIlluminance) {
      return;
    }
    
    // Floor area
    const floorArea = roomWidth * roomLength;
    
    // Room index (k) formula: k = (L × W) / [H × (L + W)]
    const roomIndex = (roomLength * roomWidth) / (roomHeight * (roomLength + roomWidth));
    
    // Calculate utilization factor (UF) based on room index and reflectances
    // Simplified calculation for example purposes
    let utilizationFactor = 0.5;
    if (roomIndex < 1) {
      utilizationFactor = 0.4;
    } else if (roomIndex < 2) {
      utilizationFactor = 0.5;
    } else if (roomIndex < 3) {
      utilizationFactor = 0.6;
    } else {
      utilizationFactor = 0.7;
    }
    
    // Adjust for reflectances
    if (reflectanceCeiling > 60 && reflectanceWalls > 40) {
      utilizationFactor += 0.05;
    }
    
    // Required lumens formula: Lumens = (Illuminance × Area) / (UF × MF)
    const requiredLumens = (requiredIlluminance * floorArea) / (utilizationFactor * maintenanceFactor);
    
    // Assuming 3000 lumens per luminaire for this example
    const lumensPerLuminaire = 3000;
    const recommendedLuminaires = Math.ceil(requiredLumens / lumensPerLuminaire);
    
    // Assume we have verification data for compliance checking
    const actualIlluminance = (recommendedLuminaires * lumensPerLuminaire * utilizationFactor * maintenanceFactor) / floorArea;
    const standardCompliance = actualIlluminance >= requiredIlluminance;
    
    setCalculatedResults({
      floorArea,
      roomIndex: parseFloat(roomIndex.toFixed(2)),
      requiredLumens: Math.round(requiredLumens),
      recommendedLuminaires,
      standardCompliance
    });
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Illumination Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Calculate the number of luminaires required to achieve a target illuminance level based on room dimensions
        and PEC 2017 standards.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Standard-based Value Selector */}
      <StandardValueSelector
        type="illumination"
        label="PEC 2017 Illumination Requirements"
        helperText="Select the space type to get standard-based illuminance requirements"
        onValueSelect={handleStandardValueSelect}
      />
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Room Width"
            type="number"
            InputProps={{ endAdornment: 'm' }}
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Room Length"
            type="number"
            InputProps={{ endAdornment: 'm' }}
            value={roomLength}
            onChange={(e) => setRoomLength(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Ceiling Height"
            type="number"
            InputProps={{ endAdornment: 'm' }}
            value={roomHeight}
            onChange={(e) => setRoomHeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Maintenance Factor</InputLabel>
            <Select
              value={maintenanceFactor}
              label="Maintenance Factor"
              onChange={(e) => setMaintenanceFactor(Number(e.target.value))}
            >
              <MenuItem value={0.7}>0.7 (Dirty Environment)</MenuItem>
              <MenuItem value={0.8}>0.8 (Normal Environment)</MenuItem>
              <MenuItem value={0.9}>0.9 (Clean Environment)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Surface Reflectances
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Ceiling"
                  type="number"
                  size="small"
                  InputProps={{ endAdornment: '%' }}
                  value={reflectanceCeiling}
                  onChange={(e) => setReflectanceCeiling(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Walls"
                  type="number"
                  size="small"
                  InputProps={{ endAdornment: '%' }}
                  value={reflectanceWalls}
                  onChange={(e) => setReflectanceWalls(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Floor"
                  type="number"
                  size="small"
                  InputProps={{ endAdornment: '%' }}
                  value={reflectanceFloor}
                  onChange={(e) => setReflectanceFloor(Number(e.target.value))}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={calculateIllumination}
          disabled={!roomWidth || !roomLength || !roomHeight || !requiredIlluminance}
        >
          Calculate
        </Button>
        <Button variant="outlined">
          Reset
        </Button>
      </Box>
      
      {!requiredIlluminance && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please select a space type from the standards reference to get the required illuminance value.
        </Alert>
      )}
      
      {calculatedResults && (
        <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Calculation Results
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Floor Area:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {calculatedResults.floorArea} m²
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Room Index (k):
              </Typography>
              <Typography variant="body1" gutterBottom>
                {calculatedResults.roomIndex}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Required Illuminance (Standard):
              </Typography>
              <Typography variant="body1" gutterBottom>
                {requiredIlluminance} lux ({standardReference})
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Total Required Lumens:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {calculatedResults.requiredLumens.toLocaleString()} lm
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Recommended Number of Luminaires:
              </Typography>
              <Typography variant="h5" gutterBottom color="primary">
                {calculatedResults.recommendedLuminaires}
              </Typography>
              
              <Alert 
                severity={calculatedResults.standardCompliance ? "success" : "warning"}
                sx={{ mt: 1 }}
              >
                {calculatedResults.standardCompliance 
                  ? "Design meets PEC 2017 illumination requirements" 
                  : "Design does not meet minimum illumination requirements"
                }
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Paper>
  );
};

export default IlluminationCalculatorExample; 
 
 