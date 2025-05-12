import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSnackbar } from 'notistack';

import SavedCalculationsViewer from './SavedCalculationsViewer';
import { saveCalculation } from './utils/storage';
import { generateReport } from '../../../../utils/reportGenerator/pdfGenerator';

interface IlluminationCalculatorProps {
  onSave?: (data: IlluminationCalculationResult) => void;
}

// Define interfaces for calculation inputs and results
interface IlluminationCalculationInputs {
  roomLength: string;
  roomWidth: string;
  roomHeight: string;
  workPlaneHeight: string;
  roomType: string;
  ceilingReflectance: string;
  wallReflectance: string;
  floorReflectance: string;
  maintenanceFactor: string;
  luminaireType: string;
  lampLumens: string;
  lampsPerLuminaire: string;
}

interface IlluminationCalculationResult {
  requiredIlluminance: number;
  roomIndex: number;
  utilizationFactor: number;
  totalLumens: number;
  requiredLuminaires: number;
  actualIlluminance: number;
  uniformityRatio: number;
  complianceStatus: 'compliant' | 'non-compliant';
  energyEfficiency: 'good' | 'average' | 'poor';
  recommendations: string[];
}

// Sample room types from PEC Rule 1075
const roomTypes = [
  { value: 'classroom', label: 'Classroom', requiredLux: 300 },
  { value: 'office', label: 'Office', requiredLux: 500 },
  { value: 'laboratory', label: 'Laboratory', requiredLux: 500 },
  { value: 'library', label: 'Library', requiredLux: 500 },
  { value: 'auditorium', label: 'Auditorium', requiredLux: 200 },
  { value: 'corridor', label: 'Corridor', requiredLux: 100 },
  { value: 'stairway', label: 'Stairway', requiredLux: 150 },
  { value: 'computerLab', label: 'Computer Laboratory', requiredLux: 500 },
  { value: 'workshop', label: 'Workshop', requiredLux: 500 },
  { value: 'conferenceRoom', label: 'Conference Room', requiredLux: 300 },
];

// Sample luminaire types
const luminaireTypes = [
  { value: 'ledPanel', label: 'LED Panel (2x2)', efficacy: 100, uf: 0.8 },
  { value: 'ledTube', label: 'LED Tube (4ft)', efficacy: 90, uf: 0.75 },
  { value: 'fluorescent', label: 'T8 Fluorescent', efficacy: 80, uf: 0.7 },
  { value: 'ledTroffer', label: 'LED Troffer (2x4)', efficacy: 110, uf: 0.85 },
  { value: 'ledDownlight', label: 'LED Downlight', efficacy: 85, uf: 0.65 },
];

// Standard maintenance factors based on environment
const maintenanceFactors = [
  { value: '0.8', label: 'Clean environment (0.8)' },
  { value: '0.7', label: 'Normal environment (0.7)' },
  { value: '0.6', label: 'Dirty environment (0.6)' },
];

// Reflectance values
const reflectanceValues = [
  { value: '0.8', label: 'Very Light (80%)' },
  { value: '0.7', label: 'Light (70%)' },
  { value: '0.5', label: 'Medium (50%)' },
  { value: '0.3', label: 'Dark (30%)' },
  { value: '0.1', label: 'Very Dark (10%)' },
];

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
      id={`illumination-tab-${index}`}
      aria-labelledby={`illumination-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Update the state type to include the 'general' key for error messages that aren't tied to specific inputs
interface ErrorState extends Partial<Record<keyof IlluminationCalculationInputs, string>> {
  general?: string;
}

function ErrorHelpDialog({ open, onClose, errors }: { open: boolean, onClose: () => void, errors: ErrorState }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Input Field Guidance</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          Please address the following issues with your inputs:
        </Typography>
        
        <List>
          {Object.entries(errors).map(([field, message]) => (
            <ListItem key={field}>
              <ListItemIcon>
                <ErrorOutlineIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary={field === 'general' ? 'General Error' : getFieldLabel(field as keyof IlluminationCalculationInputs)} 
                secondary={message} 
              />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Guidance for Illumination Calculations:
        </Typography>
        <Typography variant="body2">
          • Room dimensions should be in meters<br />
          • Reflectance values should be between 0 and 1 (e.g., 0.7 for 70%)<br />
          • Maintenance factor typically ranges from 0.6 to 0.8<br />
          • Lamp lumens should be obtained from manufacturer specifications
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper function to get user-friendly field labels
function getFieldLabel(field: keyof IlluminationCalculationInputs): string {
  const labels: Record<keyof IlluminationCalculationInputs, string> = {
    roomLength: 'Room Length',
    roomWidth: 'Room Width',
    roomHeight: 'Room Height',
    workPlaneHeight: 'Work Plane Height',
    roomType: 'Room Type',
    ceilingReflectance: 'Ceiling Reflectance',
    wallReflectance: 'Wall Reflectance',
    floorReflectance: 'Floor Reflectance',
    maintenanceFactor: 'Maintenance Factor',
    luminaireType: 'Luminaire Type',
    lampLumens: 'Lamp Lumens',
    lampsPerLuminaire: 'Lamps per Luminaire'
  };
  
  return labels[field] || field;
}

// Helper function to get guidance for each field
function getFieldGuidance(field: keyof IlluminationCalculationInputs): string {
  const guidance: Record<keyof IlluminationCalculationInputs, string> = {
    roomLength: 'Enter the length in meters. For most educational spaces, this is typically between 5-15 meters.',
    roomWidth: 'Enter the width in meters. For most educational spaces, this is typically between 5-12 meters.',
    roomHeight: 'Enter the height from floor to ceiling in meters. Standard classrooms are usually 2.7-3.5 meters.',
    workPlaneHeight: 'This is the height where tasks are performed (e.g., desk height). Typically 0.75-0.85 meters for seated work.',
    roomType: 'Select the appropriate room function to determine required illumination levels per PEC Rule 1075.',
    ceilingReflectance: 'Enter as a decimal (e.g., 0.7 for 70%). Light-colored ceilings typically have values of 0.7-0.8.',
    wallReflectance: 'Enter as a decimal (e.g., 0.5 for 50%). Light-colored walls typically have values of 0.5-0.7.',
    floorReflectance: 'Enter as a decimal (e.g., 0.2 for 20%). Most floors have values between 0.1-0.3.',
    maintenanceFactor: 'Accounts for light loss due to dust and aging. Clean environments = 0.8, normal = 0.7, dirty = 0.6.',
    luminaireType: 'Select the type of lighting fixture to be used.',
    lampLumens: 'The amount of light produced by each lamp. LED panels typically range from 3000-5000 lumens.',
    lampsPerLuminaire: 'Number of lamps in each fixture. Most modern fixtures have 1-4 lamps.'
  };
  
  return guidance[field] || 'Enter a valid value.';
}

// Add a new quick start guide dialog
function QuickStartGuideDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Illumination Calculator Quick Start Guide
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This calculator helps you determine the number of luminaires needed to achieve required illumination levels for different room types according to PEC Rule 1075 standards.
          </Typography>
        </Alert>
        
        <Typography variant="h6" gutterBottom>Getting Started (3 Simple Steps)</Typography>
        
        <List>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">1. Enter Room Dimensions (Tab 1)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Enter room length, width, height and work plane height in meters. Select the room type to determine the required illumination level per PEC Rule 1075.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">2. Set Surface Properties (Tab 2)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Select reflectance values for ceiling, walls, and floor. These affect how light is distributed in the room. Choose a maintenance factor based on the cleanliness of the environment.
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box>
              <Typography variant="subtitle1">3. Choose Lighting Parameters (Tab 3)</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Select the type of luminaire, specify the lumen output per lamp, and enter the number of lamps per luminaire. Then click "Calculate" to see results.
              </Typography>
            </Box>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Tips for Accurate Calculations</Typography>
        
        <List>
          <ListItem>
            <Typography variant="body2">
              • Enter room dimensions in meters (not feet or inches)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Reflectance values must be entered as decimals (e.g., 0.7 for 70%)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Lamps per luminaire is typically 1-4 for most modern fixtures
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Work plane height should be where tasks are performed (usually 0.75-0.85m for desks)
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              • Click the "Help with Errors" button if you encounter validation issues
            </Typography>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const IlluminationCalculator: React.FC<IlluminationCalculatorProps> = ({ onSave }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State for inputs, results, and UI
  const [inputs, setInputs] = useState<IlluminationCalculationInputs>({
    roomLength: '10',
    roomWidth: '8',
    roomHeight: '3',
    workPlaneHeight: '0.85',
    roomType: 'classroom',
    ceilingReflectance: '0.7',
    wallReflectance: '0.5',
    floorReflectance: '0.2',
    maintenanceFactor: '0.8',
    luminaireType: 'ledPanel',
    lampLumens: '4000',
    lampsPerLuminaire: '1',
  });
  
  const [results, setResults] = useState<IlluminationCalculationResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [standardsInfo, setStandardsInfo] = useState<boolean>(false);
  
  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  
  // Validation state - update the type to use ErrorState instead
  const [errors, setErrors] = useState<ErrorState>({});
  
  // Add new state for error help dialog
  const [errorHelpOpen, setErrorHelpOpen] = useState<boolean>(false);
  
  // Add new state for quick start guide
  const [quickStartOpen, setQuickStartOpen] = useState<boolean>(false);
  
  // Handle input changes
  const handleInputChange = (field: keyof IlluminationCalculationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    // Update inputs state
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate the input
    validateInput(field, value);
  };
  
  // Update the validateNumeric function to provide more specific guidance
  const validateNumeric = (value: string, min: number, max: number, fieldName: string): string | undefined => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    
    // Check if the value has invalid characters
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return `${fieldName} must contain only numbers and decimal points`;
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    
    if (num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    
    if (num > max) {
      return `${fieldName} exceeds maximum value of ${max}`;
    }
    
    return undefined;
  };
  
  // Update the validateReflectance function to be more helpful
  const validateReflectance = (value: string, fieldName: string): string | undefined => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    
    // Check if the value has invalid characters
    if (!/^0*\.?\d*$/.test(value)) {
      return `${fieldName} must be a decimal between 0 and 1 (e.g., 0.7 for 70%)`;
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return `${fieldName} must be a valid decimal number`;
    }
    
    if (num < 0) {
      return `${fieldName} cannot be negative`;
    }
    
    if (num > 1) {
      return `${fieldName} must be a decimal between 0 and 1 (e.g., 0.7 for 70%), not a percentage`;
    }
    
    return undefined;
  };
  
  // Add a new function to validate an input immediately
  const validateInput = (field: keyof IlluminationCalculationInputs, value: string): void => {
    let error: string | undefined;
    
    switch (field) {
      case 'roomLength':
        error = validateNumeric(value, 1, 100, 'Room length');
        break;
      case 'roomWidth':
        error = validateNumeric(value, 1, 100, 'Room width');
        break;
      case 'roomHeight':
        error = validateNumeric(value, 2, 20, 'Room height');
        break;
      case 'workPlaneHeight':
        error = validateNumeric(value, 0.1, 1.5, 'Work plane height');
        // Additional check for work plane height vs room height
        if (!error && parseFloat(value) >= parseFloat(inputs.roomHeight)) {
          error = 'Work plane height must be less than room height';
        }
        break;
      case 'ceilingReflectance':
        error = validateReflectance(value, 'Ceiling reflectance');
        break;
      case 'wallReflectance':
        error = validateReflectance(value, 'Wall reflectance');
        break;
      case 'floorReflectance':
        error = validateReflectance(value, 'Floor reflectance');
        break;
      case 'lampLumens':
        error = validateNumeric(value, 100, 50000, 'Lamp lumens');
        break;
      case 'lampsPerLuminaire':
        error = validateNumeric(value, 1, 8, 'Lamps per luminaire');
        break;
    }
    
    // Update errors state
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        // If there was an error for this field but it's now valid, remove it
        const newErrors = { ...prev };
        if (field in newErrors) {
          delete newErrors[field];
        }
        return newErrors;
      }
    });
  };
  
  // Calculate room index (k) based on dimensions
  const calculateRoomIndex = (): number => {
    const length = parseFloat(inputs.roomLength);
    const width = parseFloat(inputs.roomWidth);
    const height = parseFloat(inputs.roomHeight);
    const workPlane = parseFloat(inputs.workPlaneHeight);
    
    const mountingHeight = height - workPlane;
    return (length * width) / (mountingHeight * (length + width));
  };
  
  // Calculate the utilization factor based on room index and reflectance values
  const calculateUtilizationFactor = (roomIndex: number): number => {
    // This is a simplified calculation - in a real implementation, this would use
    // manufacturer-provided coefficient of utilization tables or a more complex algorithm
    const ceilingReflectance = parseFloat(inputs.ceilingReflectance);
    const wallReflectance = parseFloat(inputs.wallReflectance);
    const floorReflectance = parseFloat(inputs.floorReflectance);
    
    // Average reflectance weighted by approximate surface areas
    const avgReflectance = (ceilingReflectance + wallReflectance * 2 + floorReflectance) / 4;
    
    // Base utilization factor from luminaire type
    const selectedLuminaire = luminaireTypes.find(lt => lt.value === inputs.luminaireType);
    const baseUF = selectedLuminaire?.uf || 0.7;
    
    // Adjust UF based on room index and reflectance
    let uf = baseUF;
    
    // Smaller rooms (lower K) have lower utilization factors
    if (roomIndex < 1) {
      uf *= 0.7 + (roomIndex * 0.2); // Decrease for small rooms
    } else if (roomIndex > 3) {
      uf *= 1.1; // Slight increase for very large rooms
    }
    
    // Reflectance adjustment
    uf *= (0.7 + (avgReflectance * 0.3)); // Higher reflectance improves utilization
    
    return Math.min(uf, 0.95); // Cap at 0.95 - real UF is never 100%
  };
  
  // Validate calculation results against PEC Rule 1075
  const validateCalculationResults = (results: IlluminationCalculationResult): void => {
    // Get required illuminance for the selected room type
    const selectedRoomType = roomTypes.find(rt => rt.value === inputs.roomType);
    
    if (!selectedRoomType) {
      throw new Error('Invalid room type selected');
    }
    
    const requiredLux = selectedRoomType.requiredLux;
    
    // Check if the actual illuminance meets the required standard
    if (results.actualIlluminance < requiredLux) {
      console.warn(`Warning: Calculated illuminance (${results.actualIlluminance.toFixed(2)} lux) is below required standard (${requiredLux} lux)`);
      
      // Add additional recommendations if needed
      if (!results.recommendations.some(rec => rec.includes('Increase the number of luminaires'))) {
        results.recommendations.push(`Increase the number of luminaires to at least ${results.requiredLuminaires + 1} to exceed the required illuminance of ${requiredLux} lux.`);
      }
    }
    
    // Check if the uniformity ratio meets standards
    // PEC Rule 1075 generally requires uniformity ratio > 0.6 for most educational spaces
    if (results.uniformityRatio < 0.6) {
      console.warn(`Warning: Uniformity ratio (${results.uniformityRatio.toFixed(2)}) is below recommended value (0.6)`);
      results.recommendations.push('Improve luminaire layout to achieve better illumination uniformity. Consider more even spacing.');
    }
    
    // Energy efficiency recommendations
    if (results.energyEfficiency !== 'good') {
      const efficacyTarget = results.energyEfficiency === 'average' ? '100+ lm/W' : '80+ lm/W';
      results.recommendations.push(`Consider upgrading to luminaires with efficacy of ${efficacyTarget} to improve energy efficiency.`);
    }
  };

  // Calculate illumination
  const calculateIllumination = () => {
    // Only perform calculation if all inputs are valid
    if (Object.keys(errors).length > 0) {
      enqueueSnackbar('Please correct the errors before calculating. Click the "Help with Errors" button for guidance.', { variant: 'error' });
      return;
    }
    
    setCalculating(true);
    
    // Add a slight delay to show the loading indicator
    setTimeout(() => {
      try {
        // Basic input validation - check for required fields
        if (
          !inputs.roomLength.trim() || 
          !inputs.roomWidth.trim() || 
          !inputs.roomHeight.trim() || 
          !inputs.workPlaneHeight.trim() || 
          !inputs.ceilingReflectance.trim() ||
          !inputs.wallReflectance.trim() ||
          !inputs.floorReflectance.trim() ||
          !inputs.maintenanceFactor.trim() ||
          !inputs.lampLumens.trim() ||
          !inputs.lampsPerLuminaire.trim()
        ) {
          enqueueSnackbar('All input fields are required', { variant: 'error' });
          setCalculating(false);
          return;
        }
        
        // Validate numeric inputs
        const length = parseFloat(inputs.roomLength);
        const width = parseFloat(inputs.roomWidth);
        const height = parseFloat(inputs.roomHeight);
        const workPlane = parseFloat(inputs.workPlaneHeight);
        const maintenanceFactor = parseFloat(inputs.maintenanceFactor);
        const lampLumens = parseFloat(inputs.lampLumens);
        const lampsPerLuminaire = parseInt(inputs.lampsPerLuminaire);
        
        // Validate reflectance values
        const ceilingReflectance = parseFloat(inputs.ceilingReflectance);
        const wallReflectance = parseFloat(inputs.wallReflectance);
        const floorReflectance = parseFloat(inputs.floorReflectance);
        
        // Check for NaN values
        if (
          isNaN(length) || isNaN(width) || isNaN(height) || isNaN(workPlane) || 
          isNaN(maintenanceFactor) || isNaN(lampLumens) || isNaN(lampsPerLuminaire) ||
          isNaN(ceilingReflectance) || isNaN(wallReflectance) || isNaN(floorReflectance)
        ) {
          enqueueSnackbar('One or more inputs are invalid numbers', { variant: 'error' });
          setCalculating(false);
          return;
        }
        
        // Validate dimensions
        const lengthError = validateNumeric(inputs.roomLength, 1, 100, 'Room length');
        const widthError = validateNumeric(inputs.roomWidth, 1, 100, 'Room width');
        const heightError = validateNumeric(inputs.roomHeight, 2, 20, 'Room height');
        const workPlaneError = validateNumeric(inputs.workPlaneHeight, 0.1, 1.5, 'Work plane height');
        
        // Validate reflectance values with the specialized function
        const ceilingReflectanceError = validateReflectance(inputs.ceilingReflectance, 'Ceiling reflectance');
        const wallReflectanceError = validateReflectance(inputs.wallReflectance, 'Wall reflectance');
        const floorReflectanceError = validateReflectance(inputs.floorReflectance, 'Floor reflectance');
        
        // Validate light source
        const lampLumensError = validateNumeric(inputs.lampLumens, 100, 50000, 'Lamp lumens');
        const lampsPerLuminaireError = validateNumeric(inputs.lampsPerLuminaire, 1, 8, 'Lamps per luminaire');
        
        // Consolidate all errors
        const allErrors = {
          ...(lengthError && { roomLength: lengthError }),
          ...(widthError && { roomWidth: widthError }),
          ...(heightError && { roomHeight: heightError }),
          ...(workPlaneError && { workPlaneHeight: workPlaneError }),
          ...(ceilingReflectanceError && { ceilingReflectance: ceilingReflectanceError }),
          ...(wallReflectanceError && { wallReflectance: wallReflectanceError }),
          ...(floorReflectanceError && { floorReflectance: floorReflectanceError }),
          ...(lampLumensError && { lampLumens: lampLumensError }),
          ...(lampsPerLuminaireError && { lampsPerLuminaire: lampsPerLuminaireError })
        };
        
        // If there are errors, set them and stop calculation
        if (Object.keys(allErrors).length > 0) {
          setErrors(allErrors);
          enqueueSnackbar('Please correct the errors before calculating', { variant: 'error' });
          setCalculating(false);
          return;
        }
        
        // Additional validation checks
        if (workPlane >= height) {
          setErrors(prev => ({ 
            ...prev, 
            workPlaneHeight: 'Work plane height must be less than room height' 
          }));
          enqueueSnackbar('Work plane height must be less than room height', { variant: 'error' });
          setCalculating(false);
          return;
        }
        
        // Calculate room index
        const roomIndex = calculateRoomIndex();
        
        // Calculate utilization factor based on room index and reflectance values
        const utilizationFactor = calculateUtilizationFactor(roomIndex);
        
        // Get the required illuminance for the selected room type
        const selectedRoomType = roomTypes.find(rt => rt.value === inputs.roomType);
        if (!selectedRoomType) {
          throw new Error('Invalid room type selected');
        }
        const requiredIlluminance = selectedRoomType.requiredLux;
        
        // Calculate area
        const area = length * width;
        
        // Calculate total lumens needed
        const totalLumensNeeded = (requiredIlluminance * area) / (utilizationFactor * maintenanceFactor);
        
        // Calculate number of luminaires needed
        const lumensPerLuminaire = lampLumens * lampsPerLuminaire;
        
        const requiredLuminaires = totalLumensNeeded / lumensPerLuminaire;
        const roundedLuminaires = Math.ceil(requiredLuminaires);
        
        // Calculate actual illuminance with rounded number of luminaires
        const actualLumens = roundedLuminaires * lumensPerLuminaire;
        const actualIlluminance = (actualLumens * utilizationFactor * maintenanceFactor) / area;
        
        // Determine uniformity ratio (simplified estimation)
        // In a real implementation, this would require point-by-point calculations
        const uniformityRatio = 0.7; // Assumption based on typical values
        
        // Determine compliance status
        const complianceStatus = actualIlluminance >= requiredIlluminance ? 'compliant' : 'non-compliant';
        
        // Determine energy efficiency
        const selectedLuminaire = luminaireTypes.find(lt => lt.value === inputs.luminaireType);
        const efficacy = selectedLuminaire?.efficacy || 80;
        
        let energyEfficiency: 'good' | 'average' | 'poor' = 'average';
        if (efficacy >= 100) {
          energyEfficiency = 'good';
        } else if (efficacy < 70) {
          energyEfficiency = 'poor';
        }
        
        // Generate recommendations
        const recommendations: string[] = [];
        
        if (complianceStatus === 'non-compliant') {
          recommendations.push(`Increase the number of luminaires to at least ${roundedLuminaires} to meet required illuminance levels.`);
        }
        
        if (energyEfficiency === 'poor') {
          recommendations.push('Consider upgrading to more efficient luminaires with higher efficacy ratings.');
        }
        
        if (parseFloat(inputs.ceilingReflectance) < 0.7 || parseFloat(inputs.wallReflectance) < 0.5) {
          recommendations.push('Improve room reflectance by using lighter colors for walls and ceiling to enhance illumination efficiency.');
        }
        
        // Create the results object
        const resultsObject: IlluminationCalculationResult = {
          requiredIlluminance,
          roomIndex,
          utilizationFactor,
          totalLumens: totalLumensNeeded,
          requiredLuminaires: roundedLuminaires,
          actualIlluminance,
          uniformityRatio,
          complianceStatus,
          energyEfficiency,
          recommendations
        };
        
        // Validate results against PEC Rule 1075 standards
        validateCalculationResults(resultsObject);
        
        // Set the results
        setResults(resultsObject);
        
        // Move to results tab
        setActiveTab(2);
        
        enqueueSnackbar('Calculation completed successfully', { variant: 'success' });
      } catch (error) {
        console.error('Calculation error:', error);
        enqueueSnackbar(`Error in calculation: ${error instanceof Error ? error.message : 'Please check your inputs.'}`, { variant: 'error' });
      } finally {
        setCalculating(false);
      }
    }, 800);
  };
  
  // Reset calculation
  const handleReset = () => {
    setInputs({
      roomLength: '10',
      roomWidth: '8',
      roomHeight: '3',
      workPlaneHeight: '0.85',
      roomType: 'classroom',
      ceilingReflectance: '0.7',
      wallReflectance: '0.5',
      floorReflectance: '0.2',
      maintenanceFactor: '0.8',
      luminaireType: 'ledPanel',
      lampLumens: '4000',
      lampsPerLuminaire: '1',
    });
    setResults(null);
    setActiveTab(0);
    setErrors({});
    enqueueSnackbar('Calculator reset successfully', { variant: 'info' });
  };
  
  // Open save dialog
  const handleOpenSaveDialog = () => {
    // Generate a default name based on room type and dimensions
    const roomType = roomTypes.find(rt => rt.value === inputs.roomType)?.label || 'Room';
    const defaultName = `${roomType} ${inputs.roomLength}×${inputs.roomWidth}m`;
    setSaveName(defaultName);
    setSaveDialogOpen(true);
  };
  
  // Close save dialog
  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };
  
  // Save calculation to local storage
  const handleSaveToStorage = () => {
    if (results) {
      const id = saveCalculation('illumination', saveName, {
        inputs,
        results
      });
      
      if (id) {
        enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
        setSaveDialogOpen(false);
      } else {
        enqueueSnackbar('Error saving calculation', { variant: 'error' });
      }
    }
  };
  
  // Handle loading a saved calculation
  const handleLoadCalculation = (data: any) => {
    if (data && data.inputs && data.results) {
      setInputs(data.inputs);
      setResults(data.results);
      setActiveTab(2); // Go to results tab
      enqueueSnackbar('Calculation loaded successfully', { variant: 'success' });
    }
  };
  
  // Save calculation
  const handleSave = () => {
    if (results && onSave) {
      onSave(results);
      enqueueSnackbar('Calculation saved successfully', { variant: 'success' });
    } else if (results) {
      // If no onSave provided, open the save dialog to save to local storage
      handleOpenSaveDialog();
    }
  };
  
  // Add a helper function to get input helper text
  const getHelperText = (field: keyof IlluminationCalculationInputs): string => {
    if (field in errors) {
      return errors[field] as string;
    }
    
    // Return default helper text for each field
    switch (field) {
      case 'roomLength':
      case 'roomWidth':
        return 'Enter value in meters';
      case 'roomHeight':
        return 'Floor to ceiling height in meters';
      case 'workPlaneHeight':
        return 'Height of work surface above floor in meters';
      case 'ceilingReflectance':
      case 'wallReflectance':
      case 'floorReflectance':
        return 'Enter as decimal (e.g., 0.7 for 70%)';
      case 'lampLumens':
        return 'Light output per lamp in lumens';
      case 'lampsPerLuminaire':
        return 'Number of lamps in each fixture';
      default:
        return '';
    }
  };
  
  // Add the handleExportPdf function
  const handleExportPdf = async () => {
    if (!results) {
      setErrors({ ...errors, general: 'Please calculate results before generating a report' });
      return;
    }
    
    setCalculating(true);
    
    try {
      // Prepare data for report
      const reportData = {
        ...inputs,
        ...results,
        roomType: roomTypes.find(rt => rt.value === inputs.roomType)?.label || inputs.roomType,
        luminaireType: luminaireTypes.find(lt => lt.value === inputs.luminaireType)?.label || inputs.luminaireType
      };
      
      // Generate and open the report
      const report = await generateReport('illumination', reportData, {
        title: 'Illumination Calculation Report',
        fileName: 'illumination-calculation-report.pdf'
      });
      
      report.openInNewTab();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setErrors({ ...errors, general: 'Error generating PDF report' });
    } finally {
      setCalculating(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Illumination Calculator (PEC Rule 1075)
        </Typography>
        <Box>
          <Tooltip title="Quick Start Guide">
            <IconButton onClick={() => setQuickStartOpen(true)} sx={{ mr: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          {results && (
            <Tooltip title="Save calculation">
              <IconButton onClick={handleOpenSaveDialog} sx={{ mr: 1 }}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          <SavedCalculationsViewer 
            calculationType="illumination"
            onLoadCalculation={handleLoadCalculation}
          />
        </Box>
      </Box>
      
      {standardsInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Philippine Electrical Code (PEC) Rule 1075 - Illumination Requirements
          </Typography>
          <Typography variant="body2">
            This standard specifies the required illumination levels for various spaces to ensure
            visual comfort, safety, and productivity. The calculator helps verify compliance with
            these requirements for educational facilities.
          </Typography>
        </Alert>
      )}
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Room Information" />
        <Tab label="Lighting Parameters" />
        <Tab label="Results" disabled={!results} />
      </Tabs>
      
      {/* Add error guidance panel when there are errors */}
      {Object.keys(errors).length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setErrorHelpOpen(true)}
            >
              Help with Errors
            </Button>
          }
        >
          <Typography variant="body2">
            There are input errors that need to be fixed before calculation. Click "Help with Errors" for detailed guidance.
          </Typography>
        </Alert>
      )}
      
      {/* Room Information Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Room Dimensions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Room Length"
                      variant="outlined"
                      value={inputs.roomLength}
                      onChange={handleInputChange('roomLength')}
                      error={!!errors.roomLength}
                      helperText={getHelperText('roomLength')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>,
                      }}
                      onBlur={() => validateInput('roomLength', inputs.roomLength)}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Room Width"
                      variant="outlined"
                      value={inputs.roomWidth}
                      onChange={handleInputChange('roomWidth')}
                      error={!!errors.roomWidth}
                      helperText={getHelperText('roomWidth')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>,
                      }}
                      onBlur={() => validateInput('roomWidth', inputs.roomWidth)}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Room Height"
                      variant="outlined"
                      value={inputs.roomHeight}
                      onChange={handleInputChange('roomHeight')}
                      error={!!errors.roomHeight}
                      helperText={getHelperText('roomHeight')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>,
                      }}
                      onBlur={() => validateInput('roomHeight', inputs.roomHeight)}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Work Plane Height"
                      variant="outlined"
                      value={inputs.workPlaneHeight}
                      onChange={handleInputChange('workPlaneHeight')}
                      error={!!errors.workPlaneHeight}
                      helperText={getHelperText('workPlaneHeight')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>,
                      }}
                      onBlur={() => validateInput('workPlaneHeight', inputs.workPlaneHeight)}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Room Type"
                      variant="outlined"
                      value={inputs.roomType}
                      onChange={handleInputChange('roomType')}
                      helperText="Select the room type to determine required illumination level"
                    >
                      {roomTypes.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label} ({option.requiredLux} lux)
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Surface Reflectance Values
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Ceiling Reflectance"
                      variant="outlined"
                      value={inputs.ceilingReflectance}
                      onChange={handleInputChange('ceilingReflectance')}
                      helperText={getHelperText('ceilingReflectance')}
                    >
                      {reflectanceValues.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Wall Reflectance"
                      variant="outlined"
                      value={inputs.wallReflectance}
                      onChange={handleInputChange('wallReflectance')}
                      helperText={getHelperText('wallReflectance')}
                    >
                      {reflectanceValues.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Floor Reflectance"
                      variant="outlined"
                      value={inputs.floorReflectance}
                      onChange={handleInputChange('floorReflectance')}
                      helperText={getHelperText('floorReflectance')}
                    >
                      {reflectanceValues.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Maintenance Factor"
                      variant="outlined"
                      value={inputs.maintenanceFactor}
                      onChange={handleInputChange('maintenanceFactor')}
                      helperText={getHelperText('maintenanceFactor')}
                    >
                      {maintenanceFactors.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
              
              <Button 
                variant="contained" 
                endIcon={<CalculateIcon />}
                onClick={() => setActiveTab(1)}
              >
                Next: Lighting Parameters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Lighting Parameters Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Luminaire Selection
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Luminaire Type"
                      variant="outlined"
                      value={inputs.luminaireType}
                      onChange={handleInputChange('luminaireType')}
                      helperText={getHelperText('luminaireType')}
                    >
                      {luminaireTypes.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label} ({option.efficacy} lm/W)
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Lamp Lumens"
                      variant="outlined"
                      value={inputs.lampLumens}
                      onChange={handleInputChange('lampLumens')}
                      error={!!errors.lampLumens}
                      helperText={getHelperText('lampLumens')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">lm</InputAdornment>,
                      }}
                      onBlur={() => validateInput('lampLumens', inputs.lampLumens)}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Lamps per Luminaire"
                      variant="outlined"
                      value={inputs.lampsPerLuminaire}
                      onChange={handleInputChange('lampsPerLuminaire')}
                      error={!!errors.lampsPerLuminaire}
                      helperText={getHelperText('lampsPerLuminaire')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Box mt={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Room Index Preview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" gutterBottom>
                        Room Index (K) is a factor used in lighting calculations that relates the dimensions of a room to the height of the luminaires above the work plane.
                      </Typography>
                      
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: 'background.paper', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Typography variant="subtitle1">
                          Calculated Room Index (K):
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {calculateRoomIndex().toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        K = (L × W) / [Hm × (L + W)]
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Where: L = Length, W = Width, Hm = Mounting height above working plane
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  PEC Rule 1075 Standards Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Required Illuminance Levels for Educational Facilities:
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Area Type</TableCell>
                        <TableCell align="right">Required (lux)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomTypes.map((type) => (
                        <TableRow 
                          key={type.value}
                          sx={{ 
                            bgcolor: inputs.roomType === type.value ? 'action.selected' : 'inherit',
                            '&:last-child td, &:last-child th': { border: 0 }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {type.label}
                          </TableCell>
                          <TableCell align="right">{type.requiredLux}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                  Calculation Formula:
                </Typography>
                
                <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography fontFamily="monospace" variant="body2">
                    E = (Φ × n × UF × MF) / A
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2">
                    Where:
                  </Typography>
                  <Typography variant="body2">
                    E = Illuminance level (lux)
                  </Typography>
                  <Typography variant="body2">
                    Φ = Luminous flux per lamp (lumens)
                  </Typography>
                  <Typography variant="body2">
                    n = Number of lamps
                  </Typography>
                  <Typography variant="body2">
                    UF = Utilization factor
                  </Typography>
                  <Typography variant="body2">
                    MF = Maintenance factor
                  </Typography>
                  <Typography variant="body2">
                    A = Area of the working plane (m²)
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  The Philippine Electrical Code (PEC) Rule 1075 specifies minimum illumination levels to ensure adequate lighting for visual tasks, comfort, and safety in various spaces.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setActiveTab(0)}
              >
                Back to Room Information
              </Button>
              
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                  sx={{ mr: 2 }}
                >
                  Reset
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<CalculateIcon />}
                  onClick={calculateIllumination}
                  disabled={calculating}
                >
                  {calculating ? <CircularProgress size={24} /> : 'Calculate Illumination'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Results Tab */}
      <TabPanel value={activeTab} index={2}>
        {results && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Calculation Results
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 
                          results.complianceStatus === 'compliant' ? 'success.light' : 'error.light',
                        color: 'white',
                        borderRadius: 1,
                        mb: 2
                      }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {results.complianceStatus === 'compliant' 
                            ? 'COMPLIANT with PEC Rule 1075' 
                            : 'NON-COMPLIANT with PEC Rule 1075'}
                        </Typography>
                        <Typography variant="body2">
                          {results.complianceStatus === 'compliant'
                            ? `The design provides adequate illumination of ${Math.round(results.actualIlluminance)} lux (required: ${results.requiredIlluminance} lux)`
                            : `The design provides only ${Math.round(results.actualIlluminance)} lux (required: ${results.requiredIlluminance} lux)`}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Required Illuminance
                              </TableCell>
                              <TableCell align="right">
                                {results.requiredIlluminance} lux
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Actual Illuminance
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: results.actualIlluminance >= results.requiredIlluminance 
                                  ? 'success.main' 
                                  : 'error.main',
                                fontWeight: 'bold'
                              }}>
                                {Math.round(results.actualIlluminance)} lux
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Room Index (K)
                              </TableCell>
                              <TableCell align="right">
                                {results.roomIndex.toFixed(2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Utilization Factor
                              </TableCell>
                              <TableCell align="right">
                                {results.utilizationFactor.toFixed(2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Required Luminaires
                              </TableCell>
                              <TableCell align="right">
                                {results.requiredLuminaires} fixtures
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Total Lumens Required
                              </TableCell>
                              <TableCell align="right">
                                {Math.round(results.totalLumens).toLocaleString()} lumens
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Uniformity Ratio
                              </TableCell>
                              <TableCell align="right">
                                {results.uniformityRatio.toFixed(2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                Energy Efficiency
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: 
                                  results.energyEfficiency === 'good' ? 'success.main' : 
                                  results.energyEfficiency === 'poor' ? 'error.main' : 
                                  'warning.main',
                                fontWeight: 'bold'
                              }}>
                                {results.energyEfficiency.toUpperCase()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Luminaire Layout Recommendation
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    A regular grid pattern is recommended for uniform illumination. Based on the room dimensions and required illuminance:
                  </Typography>
                  
                  <Box sx={{ 
                    my: 2, 
                    p: 2, 
                    border: '1px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Recommended Layout
                    </Typography>
                    
                    {/* Simplified luminaire layout visualization */}
                    <Box sx={{ 
                      display: 'inline-flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                      width: '80%',
                      aspect: '4/3'
                    }}>
                      {Array.from({ length: Math.min(5, Math.ceil(Math.sqrt(results.requiredLuminaires))) }).map((_, rowIndex) => (
                        <Box 
                          key={rowIndex} 
                          sx={{ 
                            display: 'flex', 
                            width: '100%', 
                            justifyContent: 'space-around',
                            my: 1
                          }}
                        >
                          {Array.from({ length: Math.min(5, Math.ceil(results.requiredLuminaires / Math.ceil(Math.sqrt(results.requiredLuminaires)))) }).map((_, colIndex) => (
                            <Box 
                              key={colIndex} 
                              sx={{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '10px'
                              }}
                            >
                              ×
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Room dimensions: {inputs.roomLength}m × {inputs.roomWidth}m
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Total fixtures: <strong>{results.requiredLuminaires}</strong>
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Recommendations:
                  </Typography>
                  
                  {results.recommendations.length > 0 ? (
                    <List>
                      {results.recommendations.map((recommendation, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <Typography variant="body2">• {recommendation}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      The current design meets all requirements. No additional recommendations needed.
                    </Typography>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Standards Reference:
                  </Typography>
                  <Typography variant="body2">
                    This calculation is based on the illumination requirements specified in Philippine Electrical Code (PEC) Rule 1075. The results provide guidance for compliance with electrical safety and energy efficiency standards.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setActiveTab(1)}
                >
                  Back to Lighting Parameters
                </Button>
                
                <Box>
                  <Button 
                    variant="outlined" 
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                    sx={{ mr: 2 }}
                  >
                    New Calculation
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mr: 2 }}
                  >
                    Save Results
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<PdfIcon />}
                    onClick={handleExportPdf}
                  >
                    Export PDF Report
                  </Button>
                  
                  <Box ml={2} display="inline-block">
                    <SavedCalculationsViewer 
                      calculationType="illumination"
                      onLoadCalculation={handleLoadCalculation}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </TabPanel>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog}>
        <DialogTitle>Save Calculation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Enter a name for this calculation to save it for future reference.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Calculation Name"
            fullWidth
            variant="outlined"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveToStorage} 
            variant="contained"
            disabled={!saveName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add the error help dialog */}
      <ErrorHelpDialog 
        open={errorHelpOpen} 
        onClose={() => setErrorHelpOpen(false)} 
        errors={errors} 
      />
      
      {/* Add the quick start guide dialog */}
      <QuickStartGuideDialog 
        open={quickStartOpen} 
        onClose={() => setQuickStartOpen(false)} 
      />
    </Paper>
  );
};

export default IlluminationCalculator; 