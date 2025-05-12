import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  IconButton,
  Divider,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  Alert,
  Menu,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Refresh,
  ZoomIn,
  ZoomOut,
  Close,
  ColorLens,
  FormatShapes,
  LightbulbOutlined,
  Visibility,
  VisibilityOff,
  Save,
  Upload,
  Download,
  SquareFoot,
  SettingsApplications,
  OpenInNew,
  Image,
  Straighten,
  GridOn,
  GridOff,
  PanTool,
  Search,
  Autorenew,
  ViewComfy
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

// Define interfaces
interface RoomCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RoomDetail {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  roomType: string;
  coords: RoomCoords;
  lightingLoad?: number;
  requiredLux?: number;
  recommendedFixtures?: number;
  actualFixtures?: number;
  compliance?: number;
  notes?: string;
}

interface LoadItem {
  description: string;
  quantity: number;
  rating: number;
  demandFactor: number;
  current: number;
  voltAmpere: number;
  circuitBreaker: string;
  conductorSize: string;
}

interface LoadSchedule {
  id: string;
  panelName: string;
  floorName: string;
  voltage: number;
  powerFactor: number;
  totalConnectedLoad: number;
  totalDemandLoad: number;
  current: number;
  circuitBreaker: string;
  conductorSize: string;
  incomingFeederSize: string;
  feederProtectionSize: string;
  loads: LoadItem[];
}

interface BuildingData {
  name: string;
  floors: {
    [key: string]: {
      name: string;
      rooms: RoomDetail[];
      loadSchedules: LoadSchedule[];
    };
  };
}

// Define non-compliant area interface for better typing
interface NonCompliantArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'lighting' | 'power';
  compliance: number;
  title: string;
  description: string;
  isEditable?: boolean;
  isDragging?: boolean;
}

// Add CNN interfaces for image processing
interface DetectedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type?: string;
}

interface ImageDetectionResult {
  rooms: DetectedRoom[];
  orientation: 'landscape' | 'portrait';
  confidenceScore: number;
}

// Sample constants - these would be replaced with data from your actual application
const ROOM_TYPE_COLORS = {
  'office': '#4CAF50',
  'conference': '#2196F3',
  'restroom': '#9C27B0',
  'kitchen': '#FF9800',
  'storage': '#795548',
  'electrical': '#F44336',
  'hallway': '#607D8B',
  'default': '#9E9E9E'
};

const FLOOR_PLAN_IMAGES = {
  'ground': {
    'lighting': '/floorplan/ground_lighting.jpg',
    'power': '/floorplan/ground_power.jpg'
  },
  'second': {
    'lighting': '/floorplan/second_lighting.jpg',
    'power': '/floorplan/second_power.jpg'
  }
};

// After the existing state and before the main component functions
  
  // Utility function to calculate energy consumption
  const calculateEnergyConsumption = (rooms: RoomDetail[], mode: 'lighting' | 'power' = 'lighting') => {
    let totalConsumption = 0;
    let totalArea = 0;
    let compliantRooms = 0;
    
    // Calculate energy consumption based on room data
    rooms.forEach(room => {
      const area = room.area || (room.length * room.width);
      totalArea += area;
      
      if (mode === 'lighting') {
        // For lighting mode, use lighting load or estimate based on area and room type
        const lightingLoad = room.lightingLoad || estimateLightingLoad(room.roomType, area);
        totalConsumption += lightingLoad;
        
        // Check compliance based on required lux and actual fixtures
        if (room.compliance && room.compliance >= 85) {
          compliantRooms++;
        }
      } else {
        // For power mode, calculate based on outlets and equipment
        // This would be based on your actual power calculation logic
        const powerLoad = estimatePowerLoad(room.roomType, area);
        totalConsumption += powerLoad;
      }
    });
    
    // Calculate daily consumption (assuming 8 hours of operation)
    const dailyConsumption = totalConsumption * 8 / 1000; // kWh
    
    // Calculate monthly consumption (assuming 22 working days)
    const monthlyConsumption = dailyConsumption * 22;
    
    // Calculate annual consumption
    const annualConsumption = monthlyConsumption * 12;
    
    // Energy cost calculation (assuming rate of ₱10 per kWh)
    const annualCost = annualConsumption * 10;
    
    // Compliance percentage
    const compliancePercentage = rooms.length > 0 ? (compliantRooms / rooms.length) * 100 : 0;
    
    return {
      totalConsumption,
      totalArea,
      dailyConsumption,
      monthlyConsumption,
      annualConsumption,
      annualCost,
      energyDensity: totalArea > 0 ? totalConsumption / totalArea : 0,
      compliancePercentage
    };
  };
  
  // Helper function to estimate lighting load based on room type and area
  const estimateLightingLoad = (roomType: string, area: number) => {
    // Lighting power density values by room type (W/m²)
    const lightingDensity: {[key: string]: number} = {
      'office': 12,
      'conference': 14,
      'restroom': 10,
      'kitchen': 12,
      'storage': 8,
      'electrical': 6,
      'hallway': 9,
      'default': 10
    };
    
    const density = lightingDensity[roomType] || lightingDensity.default;
    return density * area;
  };
  
  // Helper function to estimate power load based on room type and area
  const estimatePowerLoad = (roomType: string, area: number) => {
    // Power density values by room type (W/m²)
    const powerDensity: {[key: string]: number} = {
      'office': 15,
      'conference': 12,
      'restroom': 8,
      'kitchen': 25,
      'storage': 5,
      'electrical': 20,
      'hallway': 6,
      'default': 10
    };
    
    const density = powerDensity[roomType] || powerDensity.default;
    return density * area;
  };
  
  // Generate sample consumption data for charts
  const generateConsumptionData = (baseValue: number, fluctuation: number, periods: number) => {
    return Array.from({ length: periods }).map((_, i) => {
      const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
      return Math.round(baseValue * randomFactor);
    });
  };

// Basic structure for the component
const BuildingVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState('ground');
  const [selectedTimeRange, setSelectedTimeRange] = useState('monthly');
  const [viewMode, setViewMode] = useState<'lighting' | 'power'>('lighting');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showGridLines, setShowGridLines] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetRoomsDialog, setShowResetRoomsDialog] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [detectedRooms, setDetectedRooms] = useState<DetectedRoom[]>([]);
  
  // Refs for CNN processing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle floor change
  const handleFloorChange = (event: SelectChangeEvent) => {
    setSelectedFloor(event.target.value);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setSelectedTimeRange(event.target.value);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Function to detect rooms from image using CNN
  const detectRoomsFromImage = async () => {
    try {
      setIsProcessingImage(true);
      
      // In a real implementation, this would call a machine learning API
      // For now, we'll simulate the detection process with a timeout
      
      // Load the current floor plan image
      const img = imageRef.current;
      if (!img || !containerRef.current) {
        console.error('Image or container reference not found');
        setIsProcessingImage(false);
        return;
      }
      
      // Get the container dimensions for relative positioning
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // Simulate CNN processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample detected room data (would come from ML model in real implementation)
      const simulatedDetections: DetectedRoom[] = [
        {
          id: `detected-room-${Date.now()}-1`,
          name: 'Office 101',
          x: containerWidth * 0.2,
          y: containerHeight * 0.3,
          width: 120,
          height: 90,
          confidence: 0.92,
          type: 'office'
        },
        {
          id: `detected-room-${Date.now()}-2`,
          name: 'Conference Room',
          x: containerWidth * 0.6,
          y: containerHeight * 0.3,
          width: 180,
          height: 120,
          confidence: 0.88,
          type: 'conference'
        },
        {
          id: `detected-room-${Date.now()}-3`,
          name: 'Restroom',
          x: containerWidth * 0.2,
          y: containerHeight * 0.6,
          width: 90,
          height: 80,
          confidence: 0.95,
          type: 'restroom'
        }
      ];
      
      setDetectedRooms(simulatedDetections);
      setDetectionConfidence(0.92); // Average confidence score
      
    } catch (error) {
      console.error('Error detecting rooms:', error);
    } finally {
      setIsProcessingImage(false);
    }
  };
  
  // Function to apply detected rooms to the current floor plan
  const applyDetectedRooms = () => {
    if (detectedRooms.length === 0) return;
    
    // In a real implementation, this would update your building data structure
    // For now, we'll just log the detected rooms
    console.log('Applying detected rooms:', detectedRooms);
    
    // This would update your actual room data
    // const updatedRooms = [...currentRooms, ...detectedRooms.map(room => ({
    //   id: room.id,
    //   name: room.name,
    //   length: room.width / 100, // Convert to meters
    //   width: room.height / 100, // Convert to meters
    //   height: 3, // Default height
    //   area: (room.width / 100) * (room.height / 100),
    //   roomType: room.type || 'default',
    //   coords: {
    //     x: room.x,
    //     y: room.y,
    //     width: room.width,
    //     height: room.height
    //   }
    // }))];
    
    // Reset detection state
    setDetectedRooms([]);
    setDetectionConfidence(0);
  };
  
  // Function to reset room positions to ensure visibility
  const resetRoomPositions = () => {
    setIsResetting(true);
    
    // In a real implementation, this would reorganize your room positions
    // based on the floor plan boundaries
    
    // Sample implementation:
    // 1. Get the container dimensions
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    
    // 2. Calculate grid positions based on the number of rooms
    // const roomCount = currentRooms.length;
    // const cols = Math.ceil(Math.sqrt(roomCount));
    // const rows = Math.ceil(roomCount / cols);
    
    // 3. Position each room in a grid pattern
    // const updatedRooms = currentRooms.map((room, index) => {
    //   const col = index % cols;
    //   const row = Math.floor(index / cols);
    //   
    //   const x = (containerWidth / cols) * col + (containerWidth / cols / 2);
    //   const y = (containerHeight / rows) * row + (containerHeight / rows / 2);
    //   
    //   return {
    //     ...room,
    //     coords: {
    //       ...room.coords,
    //       x,
    //       y
    //     }
    //   };
    // });
    
    // 4. Update the rooms data
    // setCurrentRooms(updatedRooms);
    
    // Animation delay before completion
    setTimeout(() => {
      setIsResetting(false);
      setShowResetRoomsDialog(false);
    }, 500);
  };
  
  // Function to synchronize data between visual components and data structures
  const synchronizeRoomData = () => {
    // This function would be called whenever visual elements are updated
    // It ensures that all data representations stay in sync
    
    // Example implementation:
    // 1. Update room position coordinates in the building data
    // 2. Recalculate energy consumption based on updated room data
    // 3. Update compliance status based on calculations
    // 4. Refresh all visual indicators
    
    console.log('Synchronizing room data...');
  };
  
  // Handle image loading
  const handleImageLoad = () => {
    if (imageRef.current) {
      // Get actual dimensions from the loaded image
      const width = imageRef.current.naturalWidth || imageRef.current.width;
      const height = imageRef.current.naturalHeight || imageRef.current.height;
      
      // Only update if we have valid dimensions
      if (width > 0 && height > 0) {
        setCanvasDimensions({
          width,
          height
        });
        console.log(`Image loaded with dimensions: ${width}x${height}`);
        setImageLoaded(true);
      } else {
        console.warn('Image loaded but has invalid dimensions:', {
          naturalWidth: imageRef.current.naturalWidth,
          width: imageRef.current.width,
          naturalHeight: imageRef.current.naturalHeight,
          height: imageRef.current.height
        });
      }
    }
  };

  // Initial canvas setup
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || canvasDimensions.width <= 0 || canvasDimensions.height <= 0) {
      return;
    }
    
    const canvas = canvasRef.current;
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;
    
    console.log(`Canvas dimensions set: ${canvas.width}x${canvas.height}`);
  }, [imageLoaded, canvasDimensions]);
  
  // The main render function
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Building Visualization" />
          <Tab label="Energy Consumption" />
          <Tab label="Compliance Analysis" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="h6">Floor Plan Visualization</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="floor-select-label">Floor</InputLabel>
                  <Select
                    labelId="floor-select-label"
                    value={selectedFloor}
                    label="Floor"
                    onChange={handleFloorChange}
                  >
                    <MenuItem value="ground">Ground Floor</MenuItem>
                    <MenuItem value="second">Second Floor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" justifyContent="flex-end">
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={isEditMode} 
                        onChange={toggleEditMode}
                        color="primary"
                      />
                    }
                    label="Edit Mode"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Visualization Toolbar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <ButtonGroup variant="outlined">
                  <Tooltip title="View Lighting Layout">
                    <Button 
                      onClick={() => setViewMode('lighting')}
                      variant={viewMode === 'lighting' ? 'contained' : 'outlined'}
                      startIcon={<LightbulbOutlined />}
                    >
                      Lighting
                    </Button>
                  </Tooltip>
                  <Tooltip title="View Power Layout">
                    <Button 
                      onClick={() => setViewMode('power')}
                      variant={viewMode === 'power' ? 'contained' : 'outlined'}
                      startIcon={<SettingsApplications />}
                    >
                      Power
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Grid>
              
              <Grid item>
                <ButtonGroup variant="outlined">
                  <Tooltip title="Toggle Grid">
                    <Button 
                      onClick={() => setShowGridLines(!showGridLines)}
                      color={showGridLines ? 'primary' : 'inherit'}
                      startIcon={showGridLines ? <GridOn /> : <GridOff />}
                    >
                      Grid
                    </Button>
                  </Tooltip>
                  <Tooltip title="Pan Mode">
                    <Button 
                      onClick={() => setIsPanMode(!isPanMode)}
                      color={isPanMode ? 'primary' : 'inherit'}
                      startIcon={<PanTool />}
                    >
                      Pan
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Grid>
              
              <Grid item>
                <ButtonGroup variant="outlined">
                  <Tooltip title="Detect Rooms with CNN">
                    <Button 
                      onClick={detectRoomsFromImage}
                      startIcon={<Image />}
                      disabled={isProcessingImage}
                    >
                      {isProcessingImage ? 'Processing...' : 'Detect Rooms'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Reset Room Positions">
                    <Button 
                      onClick={() => setShowResetRoomsDialog(true)}
                      startIcon={<Autorenew />}
                      disabled={isResetting}
                    >
                      Reset
                    </Button>
                  </Tooltip>
                  <Tooltip title="Synchronize Data">
                    <Button 
                      onClick={synchronizeRoomData}
                      startIcon={<Refresh />}
                    >
                      Sync
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Floor Plan Visualization */}
          <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
            <Box ref={containerRef} sx={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
              {/* Background Floor Plan Image */}
              <img 
                ref={imageRef}
                src={FLOOR_PLAN_IMAGES[selectedFloor as keyof typeof FLOOR_PLAN_IMAGES][viewMode]}
                alt={`${selectedFloor} floor ${viewMode} layout`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  filter: isProcessingImage ? 'brightness(0.7)' : 'none'
                }}
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
              
              {/* Overlay canvas for room detection - only render if image is loaded and dimensions are valid */}
              {imageLoaded && canvasDimensions.width > 0 && canvasDimensions.height > 0 && (
                <canvas 
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                />
              )}
              
              {/* Detected Rooms Overlay (visible during processing) */}
              {isProcessingImage && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 10
                  }}
                >
                  <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <CircularProgress color="inherit" size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Detecting Rooms with CNN...
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Detected Rooms Visualization */}
              {detectedRooms.length > 0 && !isProcessingImage && (
                <>
                  {detectedRooms.map(room => (
                    <Box
                      key={room.id}
                      sx={{
                        position: 'absolute',
                        top: room.y,
                        left: room.x,
                        width: room.width,
                        height: room.height,
                        border: '2px dashed #2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5,
                        padding: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                        {room.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2196F3' }}>
                        {Math.round(room.confidence * 100)}% confidence
                      </Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 20 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detected {detectedRooms.length} rooms
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Average confidence: {Math.round(detectionConfidence * 100)}%
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={applyDetectedRooms}
                        startIcon={<Save />}
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        Apply Detections
                      </Button>
                    </Paper>
                  </Box>
                </>
              )}
              
              {/* Grid Lines (when enabled) */}
              {showGridLines && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
            </Box>
          </Paper>
          
          {/* Room Information Table */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Room Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This table is synchronized with the visual representation above.
              {detectedRooms.length > 0 && ' Click "Apply Detections" to add detected rooms to this table.'}
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Room Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Area (m²)</TableCell>
                    <TableCell>Required Lux</TableCell>
                    <TableCell>Fixtures</TableCell>
                    <TableCell>Compliance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Sample room data - would be populated from your actual data store */}
                  <TableRow>
                    <TableCell>Office 101</TableCell>
                    <TableCell>Office</TableCell>
                    <TableCell>25.0</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>6</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 5,
                            mr: 1,
                            height: 10
                          }}
                        >
                          <Box
                            sx={{
                              width: `${90}%`,
                              backgroundColor: 90 >= 85 ? 'success.main' : 90 >= 70 ? 'warning.main' : 'error.main',
                              borderRadius: 5,
                              height: 10
                            }}
                          />
                        </Box>
                        <Typography variant="body2">90%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Conference Room</TableCell>
                    <TableCell>Conference</TableCell>
                    <TableCell>40.0</TableCell>
                    <TableCell>300</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 5,
                            mr: 1,
                            height: 10
                          }}
                        >
                          <Box
                            sx={{
                              width: `${75}%`,
                              backgroundColor: 75 >= 85 ? 'success.main' : 75 >= 70 ? 'warning.main' : 'error.main',
                              borderRadius: 5,
                              height: 10
                            }}
                          />
                        </Box>
                        <Typography variant="body2">75%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button startIcon={<Add />} variant="outlined">
                Add Room
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Energy Consumption Analytics</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="time-range-label">Time Range</InputLabel>
                  <Select
                    labelId="time-range-label"
                    value={selectedTimeRange}
                    label="Time Range"
                    onChange={handleTimeRangeChange}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
  
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Energy Consumption Trends
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedTimeRange === 'monthly' 
                    ? 'Monthly energy usage for the past year'
                    : selectedTimeRange === 'quarterly'
                    ? 'Quarterly energy usage for the past 2 years'
                    : 'Yearly energy usage for the past 5 years'}
                </Typography>
                
                {/* Energy consumption chart would go here */}
                <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', mt: 2 }}>
                  {generateConsumptionData(500, 0.2, 12).map((value, index) => (
                    <Box
                      key={`bar-${index}`}
                      sx={{
                        height: `${value / 10}%`,
                        width: `${100 / 12}%`,
                        backgroundColor: 'primary.main',
                        mx: 0.5,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          '& .tooltipText': {
                            display: 'block'
                          }
                        }
                      }}
                    >
                      <Box
                        className="tooltipText"
                        sx={{
                          position: 'absolute',
                          top: -28,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          display: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {value} kWh
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                    <Typography key={month} variant="caption" sx={{ width: `${100 / 12}%`, textAlign: 'center' }}>
                      {month}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Energy Distribution by Category
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Breakdown of energy usage by system type
                </Typography>
                
                {/* Energy distribution chart would go here */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {[
                    { name: 'Lighting', value: 35, color: '#4CAF50' },
                    { name: 'HVAC', value: 40, color: '#2196F3' },
                    { name: 'Equipment', value: 25, color: '#FF9800' }
                  ].map(item => (
                    <Grid item xs={4} key={item.name}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: `conic-gradient(${item.color} 0% ${item.value}%, #e0e0e0 ${item.value}% 100%)`,
                            margin: '0 auto',
                            position: 'relative'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="h6" color="text.secondary">
                              {item.value}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(item.value * 5)} kWh/day
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Energy Efficiency Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Daily Consumption:</Typography>
                      <Typography variant="body1">500 kWh</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Monthly Average:</Typography>
                      <Typography variant="body1">15,000 kWh</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Energy Intensity:</Typography>
                      <Typography variant="body1">12.5 kWh/m²</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Annual Cost:</Typography>
                      <Typography variant="body1">₱1,800,000</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Overall Compliance Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Summary of compliance with Philippine Electrical Code (PEC) standards
                </Typography>
                
                {/* Overall compliance visualization */}
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Overall Building Compliance
                  </Typography>
                  <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                    <Box
                      sx={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `conic-gradient(#4CAF50 0% 85%, #FFC107 85% 90%, #F44336 90% 100%)`,
                        transform: 'rotate(-90deg)'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="h4" color={85 >= 85 ? 'success.main' : 85 >= 70 ? 'warning.main' : 'error.main'}>
                        85%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {85 >= 85 ? 'Good' : 85 >= 70 ? 'Needs Improvement' : 'Critical'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Lighting
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={90 >= 85 ? 'success.main' : 90 >= 70 ? 'warning.main' : 'error.main'}
                        >
                          90%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Power
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={82 >= 85 ? 'success.main' : 82 >= 70 ? 'warning.main' : 'error.main'}
                        >
                          82%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Protection
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={78 >= 85 ? 'success.main' : 78 >= 70 ? 'warning.main' : 'error.main'}
                        >
                          78%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Lighting System Compliance
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Analysis of lighting system compliance with PEC requirements
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Requirement</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Actual</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Illuminance Levels</TableCell>
                        <TableCell>Per PEC Table 3.2.5</TableCell>
                        <TableCell>90% compliant</TableCell>
                        <TableCell>
                          <Tooltip title="Compliant with PEC standards">
                            <Box component="span" sx={{ color: 'success.main' }}>✓</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Energy Efficiency</TableCell>
                        <TableCell>≤ 10 W/m²</TableCell>
                        <TableCell>8.5 W/m²</TableCell>
                        <TableCell>
                          <Tooltip title="Compliant with PEC standards">
                            <Box component="span" sx={{ color: 'success.main' }}>✓</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Visual Comfort</TableCell>
                        <TableCell>UGR ≤ 19</TableCell>
                        <TableCell>UGR 18</TableCell>
                        <TableCell>
                          <Tooltip title="Compliant with PEC standards">
                            <Box component="span" sx={{ color: 'success.main' }}>✓</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Emergency Lighting</TableCell>
                        <TableCell>Required in escape routes</TableCell>
                        <TableCell>Partially implemented</TableCell>
                        <TableCell>
                          <Tooltip title="Needs improvement">
                            <Box component="span" sx={{ color: 'warning.main' }}>!</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              
              <Paper sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Protection Device Compliance
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Analysis of electrical protection systems against PEC standards
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Protection Type</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Overcurrent Protection</TableCell>
                        <TableCell>All circuits</TableCell>
                        <TableCell>
                          <Tooltip title="Compliant with PEC standards">
                            <Box component="span" sx={{ color: 'success.main' }}>✓</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ground Fault Protection</TableCell>
                        <TableCell>Wet areas</TableCell>
                        <TableCell>
                          <Tooltip title="Compliant with PEC standards">
                            <Box component="span" sx={{ color: 'success.main' }}>✓</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Surge Protection</TableCell>
                        <TableCell>Main distribution</TableCell>
                        <TableCell>
                          <Tooltip title="Not implemented">
                            <Box component="span" sx={{ color: 'error.main' }}>✗</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Emergency Shutoff</TableCell>
                        <TableCell>Key locations</TableCell>
                        <TableCell>
                          <Tooltip title="Partially implemented">
                            <Box component="span" sx={{ color: 'warning.main' }}>!</Box>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Energy Efficiency Improvements
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Recommended improvements to increase energy efficiency and compliance
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Lighting System Upgrade
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Replace T8 fluorescent fixtures with LED alternatives in office areas.
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Estimated Savings
                            </Typography>
                            <Typography variant="body2">
                              ₱120,000 / year
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Implementation Cost
                            </Typography>
                            <Typography variant="body2">
                              ₱350,000
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Payback Period
                            </Typography>
                            <Typography variant="body2">
                              2.9 years
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Occupancy Sensors
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Install occupancy sensors in conference rooms, restrooms, and storage areas.
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Estimated Savings
                            </Typography>
                            <Typography variant="body2">
                              ₱85,000 / year
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Implementation Cost
                            </Typography>
                            <Typography variant="body2">
                              ₱180,000
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Payback Period
                            </Typography>
                            <Typography variant="body2">
                              2.1 years
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Power Factor Correction
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Install capacitor banks to improve power factor from 0.85 to 0.95+.
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Estimated Savings
                            </Typography>
                            <Typography variant="body2">
                              ₱95,000 / year
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Implementation Cost
                            </Typography>
                            <Typography variant="body2">
                              ₱250,000
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Payback Period
                            </Typography>
                            <Typography variant="body2">
                              2.6 years
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Reset Room Positions Dialog */}
      <Dialog
        open={showResetRoomsDialog}
        onClose={() => setShowResetRoomsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset Room Positions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            This action will reset the positions of all rooms to ensure they are visible within the floor plan area. 
            Any custom placements will be lost. Are you sure you want to continue?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The rooms will be arranged using automatic layout based on room names and types.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetRoomsDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={resetRoomPositions}
          >
            Reset Positions
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
};

export default BuildingVisualization; 