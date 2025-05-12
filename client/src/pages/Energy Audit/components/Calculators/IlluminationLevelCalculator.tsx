import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  InputAdornment,
  List
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSnackbar } from 'notistack';
import { generateReport } from '../../../../utils/reportGenerator/pdfGenerator';
import { saveCalculation } from './utils/storage';

// Interfaces for the calculator
interface IlluminationLevelCalculatorProps {
  onSave?: (data: IlluminationLevelResult) => void;
}

interface IlluminationLevelInputs {
  roomLength: string;
  roomWidth: string;
  roomHeight: string;
  workPlaneHeight: string;
  lampLumens: string;
  numberOfLamps: string;
  numberOfFixtures: string;
  maintenanceFactor: string;
  roomType: string;
  ceilingReflectance: string;
  wallReflectance: string;
  floorReflectance: string;
}

interface IlluminationLevelResult {
  roomIndex: number;
  utilizationFactor: number;
  illuminanceLevel: number;
  requiredIlluminance: number;
  complianceStatus: 'compliant' | 'non-compliant';
  uniformityRatio: number;
  recommendations: string[];
  timestamp: number;
}

// Room types with required illuminance levels per PEC Rule 1075
const roomTypes = [
  { value: 'classroom', label: 'Classroom', requiredLux: 300 },
  { value: 'computerLab', label: 'Computer Laboratory', requiredLux: 500 },
  { value: 'scienceLab', label: 'Science Laboratory', requiredLux: 500 },
  { value: 'library', label: 'Library', requiredLux: 500 },
  { value: 'officeGeneral', label: 'Office (General)', requiredLux: 500 },
  { value: 'corridor', label: 'Corridor', requiredLux: 100 },
  { value: 'conferenceRoom', label: 'Conference Room', requiredLux: 300 },
  { value: 'auditorium', label: 'Auditorium', requiredLux: 200 },
  { value: 'cafeteria', label: 'Cafeteria', requiredLux: 200 },
  { value: 'gymnasium', label: 'Gymnasium', requiredLux: 300 }
];

// Standard maintenance factors
const maintenanceFactors = [
  { value: '0.8', label: 'Clean Environment (0.8)' },
  { value: '0.7', label: 'Average Environment (0.7)' },
  { value: '0.6', label: 'Dirty Environment (0.6)' }
];

// Reflectance values
const reflectanceValues = [
  { value: '0.8', label: 'Very Light (80%)' },
  { value: '0.7', label: 'Light (70%)' },
  { value: '0.5', label: 'Medium (50%)' },
  { value: '0.3', label: 'Dark (30%)' },
  { value: '0.1', label: 'Very Dark (10%)' }
];

// Tab panel component
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
      id={`illumination-level-tab-${index}`}
      aria-labelledby={`illumination-level-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const IlluminationLevelCalculator: React.FC<IlluminationLevelCalculatorProps> = ({ onSave }) => {
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // State for inputs
  const [inputs, setInputs] = useState<IlluminationLevelInputs>({
    roomLength: '',
    roomWidth: '',
    roomHeight: '',
    workPlaneHeight: '0.8',
    lampLumens: '',
    numberOfLamps: '1',
    numberOfFixtures: '',
    maintenanceFactor: '0.7',
    roomType: 'classroom',
    ceilingReflectance: '0.7',
    wallReflectance: '0.5',
    floorReflectance: '0.3'
  });

  // State for calculation results
  const [results, setResults] = useState<IlluminationLevelResult | null>(null);
  
  // State for errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for calculation status
  const [calculating, setCalculating] = useState(false);
  
  // Handle input changes
  const handleInputChange = (field: keyof IlluminationLevelInputs) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when the user makes a change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate numeric input
  const validateNumeric = (value: string, min: number, max: number, fieldName: string): string | undefined => {
    const numValue = parseFloat(value);
    if (value.trim() === '') {
      return `${fieldName} is required`;
    }
    if (isNaN(numValue)) {
      return `${fieldName} must be a number`;
    }
    if (numValue < min || numValue > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return undefined;
  };

  // Validate reflectance value
  const validateReflectance = (value: string, fieldName: string): string | undefined => {
    const numValue = parseFloat(value);
    if (value.trim() === '') {
      return `${fieldName} is required`;
    }
    if (isNaN(numValue)) {
      return `${fieldName} must be a number`;
    }
    if (numValue < 0 || numValue > 1) {
      return `${fieldName} must be between 0 and 1`;
    }
    return undefined;
  };

  // Validate all inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Room dimensions
    const lengthError = validateNumeric(inputs.roomLength, 1, 100, 'Room length');
    if (lengthError) newErrors.roomLength = lengthError;
    
    const widthError = validateNumeric(inputs.roomWidth, 1, 100, 'Room width');
    if (widthError) newErrors.roomWidth = widthError;
    
    const heightError = validateNumeric(inputs.roomHeight, 1, 30, 'Room height');
    if (heightError) newErrors.roomHeight = heightError;
    
    const workPlaneError = validateNumeric(inputs.workPlaneHeight, 0, 2, 'Work plane height');
    if (workPlaneError) newErrors.workPlaneHeight = workPlaneError;
    
    // Check if work plane height is less than room height
    if (!heightError && !workPlaneError && parseFloat(inputs.workPlaneHeight) >= parseFloat(inputs.roomHeight)) {
      newErrors.workPlaneHeight = 'Work plane height must be less than room height';
    }
    
    // Lamp and fixture details
    const lampLumensError = validateNumeric(inputs.lampLumens, 100, 50000, 'Lamp lumens');
    if (lampLumensError) newErrors.lampLumens = lampLumensError;
    
    const numberOfLampsError = validateNumeric(inputs.numberOfLamps, 1, 100, 'Number of lamps');
    if (numberOfLampsError) newErrors.numberOfLamps = numberOfLampsError;
    
    const numberOfFixturesError = validateNumeric(inputs.numberOfFixtures, 1, 1000, 'Number of fixtures');
    if (numberOfFixturesError) newErrors.numberOfFixtures = numberOfFixturesError;
    
    // Reflectance values
    const ceilingReflectanceError = validateReflectance(inputs.ceilingReflectance, 'Ceiling reflectance');
    if (ceilingReflectanceError) newErrors.ceilingReflectance = ceilingReflectanceError;
    
    const wallReflectanceError = validateReflectance(inputs.wallReflectance, 'Wall reflectance');
    if (wallReflectanceError) newErrors.wallReflectance = wallReflectanceError;
    
    const floorReflectanceError = validateReflectance(inputs.floorReflectance, 'Floor reflectance');
    if (floorReflectanceError) newErrors.floorReflectance = floorReflectanceError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate room index (K)
  const calculateRoomIndex = (): number => {
    const length = parseFloat(inputs.roomLength);
    const width = parseFloat(inputs.roomWidth);
    const height = parseFloat(inputs.roomHeight);
    const workPlane = parseFloat(inputs.workPlaneHeight);
    
    const mountingHeight = height - workPlane;
    const roomIndex = (length * width) / (mountingHeight * (length + width));
    
    return roomIndex;
  };

  // Calculate utilization factor based on room index and reflectances
  const calculateUtilizationFactor = (roomIndex: number): number => {
    const ceiling = parseFloat(inputs.ceilingReflectance);
    const walls = parseFloat(inputs.wallReflectance);
    
    // This is a simplified approach. A complete implementation would use
    // coefficient of utilization tables based on luminaire type and room index
    // Here, we're using an approximation formula
    
    let baseUF = 0;
    
    if (roomIndex < 1) {
      baseUF = 0.4;
    } else if (roomIndex < 2) {
      baseUF = 0.5;
    } else if (roomIndex < 3) {
      baseUF = 0.6;
    } else if (roomIndex < 4) {
      baseUF = 0.7;
    } else {
      baseUF = 0.8;
    }
    
    // Adjust based on ceiling and wall reflectances
    const reflectanceAdjustment = (ceiling * 0.3) + (walls * 0.2);
    const adjustedUF = baseUF * (1 + reflectanceAdjustment);
    
    // Ensure UF is between 0.3 and 0.85 (typical range)
    return Math.max(0.3, Math.min(0.85, adjustedUF));
  };

  // Calculate illuminance level
  const calculateIlluminanceLevel = () => {
    if (!validateInputs()) {
      setTabValue(0); // Go back to inputs tab if there are errors
      return;
    }
    
    setCalculating(true);
    
    // Simulating a calculation delay for better UX
    setTimeout(() => {
      try {
        // Get room index
        const roomIndex = calculateRoomIndex();
        
        // Calculate utilization factor
        const utilizationFactor = calculateUtilizationFactor(roomIndex);
        
        // Calculate total lumens
        const lumensPerLamp = parseFloat(inputs.lampLumens);
        const lampsPerFixture = parseFloat(inputs.numberOfLamps);
        const numberOfFixtures = parseFloat(inputs.numberOfFixtures);
        const totalLumens = lumensPerLamp * lampsPerFixture * numberOfFixtures;
        
        // Calculate room area
        const roomArea = parseFloat(inputs.roomLength) * parseFloat(inputs.roomWidth);
        
        // Get maintenance factor
        const maintenanceFactor = parseFloat(inputs.maintenanceFactor);
        
        // Calculate illuminance level using the formula:
        // E = (Φ × n × UF × MF) / A
        const illuminanceLevel = (totalLumens * utilizationFactor * maintenanceFactor) / roomArea;
        
        // Get required illuminance for the selected room type
        const roomType = roomTypes.find(rt => rt.value === inputs.roomType);
        const requiredIlluminance = roomType ? roomType.requiredLux : 300; // Default to 300 lux
        
        // Determine compliance
        const complianceStatus = illuminanceLevel >= requiredIlluminance ? 'compliant' : 'non-compliant';
        
        // Calculate uniformity ratio (simplified approximation)
        // Typically this would require a more complex calculation with point-by-point analysis
        const uniformityRatio = 0.7; // Simplified assumption
        
        // Generate recommendations
        const recommendations = [];
        
        if (complianceStatus === 'non-compliant') {
          const shortfall = requiredIlluminance - illuminanceLevel;
          const percentShortfall = (shortfall / requiredIlluminance) * 100;
          
          if (percentShortfall < 10) {
            recommendations.push('Slightly increase the number of fixtures or use higher lumen lamps to meet the required illuminance level.');
          } else if (percentShortfall < 30) {
            recommendations.push('Consider adding more fixtures or upgrading to higher efficiency lamps to improve illuminance levels.');
          } else {
            recommendations.push('Significant improvement needed. Redesign the lighting layout with more fixtures or higher output lamps.');
          }
        } else {
          const surplus = illuminanceLevel - requiredIlluminance;
          const percentSurplus = (surplus / requiredIlluminance) * 100;
          
          if (percentSurplus > 50) {
            recommendations.push('The current design significantly exceeds requirements. Consider reducing the number of fixtures or using lower wattage lamps to save energy.');
          } else if (percentSurplus > 20) {
            recommendations.push('Illuminance level is higher than required. Consider minor adjustments to improve energy efficiency.');
          } else {
            recommendations.push('Illuminance level meets requirements. No immediate changes necessary.');
          }
        }
        
        if (parseFloat(inputs.maintenanceFactor) < 0.7) {
          recommendations.push('The low maintenance factor indicates a challenging environment. Implement a regular cleaning schedule to maintain illumination levels.');
        }
        
        // Set results
        setResults({
          roomIndex,
          utilizationFactor,
          illuminanceLevel,
          requiredIlluminance,
          complianceStatus,
          uniformityRatio,
          recommendations,
          timestamp: Date.now()
        });
        
        // Switch to results tab
        setTabValue(2);
      } catch (error) {
        console.error('Calculation error:', error);
        setErrors({ general: 'An error occurred during calculation. Please check your inputs.' });
      } finally {
        setCalculating(false);
      }
    }, 500);
  };

  // Reset calculator
  const handleReset = () => {
    setInputs({
      roomLength: '',
      roomWidth: '',
      roomHeight: '',
      workPlaneHeight: '0.8',
      lampLumens: '',
      numberOfLamps: '1',
      numberOfFixtures: '',
      maintenanceFactor: '0.7',
      roomType: 'classroom',
      ceilingReflectance: '0.7',
      wallReflectance: '0.5',
      floorReflectance: '0.3'
    });
    setResults(null);
    setErrors({});
    setTabValue(0);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle saving results
  const handleSave = () => {
    if (results) {
      if (onSave) {
        onSave(results);
      }
      
      // Open save dialog or directly save with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const roomType = roomTypes.find(rt => rt.value === inputs.roomType)?.label || 'Room';
      const defaultName = `${roomType} Illumination Calculation - ${timestamp}`;
      
      const id = saveCalculation('illumination', defaultName, {
        ...inputs,
        ...results,
        timestamp: Date.now()
      });
      
      enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!results) return;
    
    try {
      const roomType = roomTypes.find(rt => rt.value === inputs.roomType)?.label || 'Room';
      
      // Prepare data for PDF report
      const reportData = {
        roomType,
        roomLength: inputs.roomLength,
        roomWidth: inputs.roomWidth,
        roomHeight: inputs.roomHeight,
        workPlaneHeight: inputs.workPlaneHeight,
        ceilingReflectance: inputs.ceilingReflectance,
        wallReflectance: inputs.wallReflectance,
        floorReflectance: inputs.floorReflectance,
        maintenanceFactor: inputs.maintenanceFactor,
        lampLumens: inputs.lampLumens,
        numberOfLamps: inputs.numberOfLamps,
        numberOfFixtures: inputs.numberOfFixtures,
        roomIndex: results.roomIndex,
        utilizationFactor: results.utilizationFactor,
        averageIlluminance: results.illuminanceLevel,
        requiredIlluminance: results.requiredIlluminance,
        complianceStatus: results.complianceStatus,
        uniformityRatio: results.uniformityRatio,
        recommendations: results.recommendations
      };
      
      // Generate PDF report
      const report = await generateReport('illumination', reportData, {
        title: 'Illumination Level Calculation Report',
        fileName: `illumination-level-calculation-${new Date().toISOString().slice(0, 10)}.pdf`
      });
      
      enqueueSnackbar('PDF report generated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      enqueueSnackbar('Error generating PDF report', { variant: 'error' });
    }
  };

  // Function to get a helper text for a field
  const getHelperText = (field: keyof IlluminationLevelInputs): string => {
    if (errors[field]) {
      return errors[field];
    }
    
    // Return appropriate helper text based on the field
    switch (field) {
      case 'roomLength':
      case 'roomWidth':
      case 'roomHeight':
        return 'Enter value in meters';
      case 'workPlaneHeight':
        return 'Typically 0.8m for desks, 0.1m for floors';
      case 'lampLumens':
        return 'Total lumens output per lamp';
      case 'numberOfLamps':
        return 'Number of lamps per fixture';
      case 'numberOfFixtures':
        return 'Total number of fixtures in the room';
      default:
        return '';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Illumination Level Calculator
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Calculate illumination levels based on room dimensions, fixture specifications, and reflectance values
        according to Philippine Electrical Code (PEC) Rule 1075 requirements.
      </Alert>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="illumination calculator tabs"
        >
          <Tab label="Room & Fixtures" id="illumination-level-tab-0" />
          <Tab label="Reflectance & Materials" id="illumination-level-tab-1" />
          <Tab label="Results" id="illumination-level-tab-2" disabled={!results} />
        </Tabs>
      </Box>
      
      {/* Room and fixtures tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Room Dimensions
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Room Length"
              value={inputs.roomLength}
              onChange={handleInputChange('roomLength')}
              fullWidth
              error={!!errors.roomLength}
              helperText={getHelperText('roomLength')}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Room Width"
              value={inputs.roomWidth}
              onChange={handleInputChange('roomWidth')}
              fullWidth
              error={!!errors.roomWidth}
              helperText={getHelperText('roomWidth')}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Room Height"
              value={inputs.roomHeight}
              onChange={handleInputChange('roomHeight')}
              fullWidth
              error={!!errors.roomHeight}
              helperText={getHelperText('roomHeight')}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Work Plane Height"
              value={inputs.workPlaneHeight}
              onChange={handleInputChange('workPlaneHeight')}
              fullWidth
              error={!!errors.workPlaneHeight}
              helperText={getHelperText('workPlaneHeight')}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Room Type"
              value={inputs.roomType}
              onChange={handleInputChange('roomType')}
              fullWidth
              helperText={`Required Illuminance: ${roomTypes.find(rt => rt.value === inputs.roomType)?.requiredLux || 0} lux`}
            >
              {roomTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Lighting Fixtures
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lamp Lumens"
              value={inputs.lampLumens}
              onChange={handleInputChange('lampLumens')}
              fullWidth
              error={!!errors.lampLumens}
              helperText={getHelperText('lampLumens')}
              InputProps={{
                endAdornment: <InputAdornment position="end">lm</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lamps per Fixture"
              value={inputs.numberOfLamps}
              onChange={handleInputChange('numberOfLamps')}
              fullWidth
              error={!!errors.numberOfLamps}
              helperText={getHelperText('numberOfLamps')}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Number of Fixtures"
              value={inputs.numberOfFixtures}
              onChange={handleInputChange('numberOfFixtures')}
              fullWidth
              error={!!errors.numberOfFixtures}
              helperText={getHelperText('numberOfFixtures')}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTabValue(1)}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      </TabPanel>
      
      {/* Reflectance tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Surface Reflectance Values
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The reflectance values represent the percentage of light reflected by surfaces in the room.
              Higher values indicate lighter colors that reflect more light.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Ceiling Reflectance"
              value={inputs.ceilingReflectance}
              onChange={handleInputChange('ceilingReflectance')}
              fullWidth
              error={!!errors.ceilingReflectance}
              helperText={errors.ceilingReflectance || "Typically 0.7-0.8 for white ceilings"}
            >
              {reflectanceValues.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Wall Reflectance"
              value={inputs.wallReflectance}
              onChange={handleInputChange('wallReflectance')}
              fullWidth
              error={!!errors.wallReflectance}
              helperText={errors.wallReflectance || "Typically 0.5-0.7 for light walls"}
            >
              {reflectanceValues.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Floor Reflectance"
              value={inputs.floorReflectance}
              onChange={handleInputChange('floorReflectance')}
              fullWidth
              error={!!errors.floorReflectance}
              helperText={errors.floorReflectance || "Typically 0.1-0.3 for floors"}
            >
              {reflectanceValues.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Maintenance Factor
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The maintenance factor accounts for light loss due to dirt accumulation and lamp aging.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Maintenance Factor"
              value={inputs.maintenanceFactor}
              onChange={handleInputChange('maintenanceFactor')}
              fullWidth
              error={!!errors.maintenanceFactor}
              helperText={errors.maintenanceFactor || "Accounts for light loss due to aging and dirt"}
            >
              {maintenanceFactors.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setTabValue(0)}
          >
            Previous
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              startIcon={<RestartAltIcon />}
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={calculateIlluminanceLevel}
              startIcon={<CalculateIcon />}
              disabled={calculating}
            >
              {calculating ? 'Calculating...' : 'Calculate'}
            </Button>
          </Box>
        </Box>
      </TabPanel>
      
      {/* Results tab */}
      <TabPanel value={tabValue} index={2}>
        {results && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert 
                severity={results.complianceStatus === 'compliant' ? 'success' : 'warning'}
                sx={{ mb: 3 }}
              >
                <Typography variant="subtitle2">
                  {results.complianceStatus === 'compliant' 
                    ? 'The lighting design meets the PEC Rule 1075 illumination requirements.' 
                    : 'The lighting design does not meet the minimum illumination requirements.'}
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Illumination Analysis
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Room Index (K)</TableCell>
                          <TableCell align="right">{results.roomIndex.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Utilization Factor</TableCell>
                          <TableCell align="right">{results.utilizationFactor.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Average Illuminance</TableCell>
                          <TableCell align="right">
                            <Typography
                              color={results.illuminanceLevel >= results.requiredIlluminance ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {results.illuminanceLevel.toFixed(1)} lux
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Required Illuminance</TableCell>
                          <TableCell align="right">{results.requiredIlluminance} lux</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Uniformity Ratio</TableCell>
                          <TableCell align="right">{results.uniformityRatio.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  
                  <List>
                    {results.recommendations.map((recommendation, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">• {recommendation}</Typography>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => setTabValue(1)}
                >
                  Previous
                </Button>
                
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ mr: 1 }}
                    onClick={handleExportPDF}
                  >
                    Export PDF
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                  >
                    New Calculation
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </TabPanel>
      
      {/* Error message display */}
      {errors.general && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.general}
        </Alert>
      )}
    </Paper>
  );
};

export default IlluminationLevelCalculator; 