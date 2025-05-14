import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  PanTool,
  Save,
  FitScreen,
  Grid4x4,
  Label,
  Refresh,
  Fullscreen,
  FullscreenExit,
  CameraAlt
} from '@mui/icons-material';

/**
 * BuildingVisualization Component
 * 
 * A comprehensive floor plan visualization tool for energy audits.
 * Includes features for viewing, editing, and analyzing building data.
 */
const BuildingVisualization: React.FC = () => {
  // Visualization state
  const [floorPlanImage, setFloorPlanImage] = useState('/floorplan/sample-floor-plan.png');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showGridLines, setShowGridLines] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'lighting' | 'power'>('lighting');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Data state 
  const [roomData, setRoomData] = useState<any[]>([]);
  const [nonCompliantAreas, setNonCompliantAreas] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    loadSampleData();
  }, []);
  
  // Load sample data
  const loadSampleData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create sample rooms
      const rooms = [
        {
          id: 'room-1',
          name: 'Main Office',
          length: 10,
          width: 8,
          height: 3,
          area: 80,
          roomType: 'office',
          coords: { x: 200, y: 150, width: 200, height: 160 },
          requiredLux: 500,
          recommendedFixtures: 8,
          actualFixtures: 8,
          compliance: 95,
          reflectanceCeiling: 0.7,
          reflectanceWalls: 0.5,
          reflectanceFloor: 0.2,
          maintenanceFactor: 0.8,
          energyUsage: 450
        },
        {
          id: 'room-2',
          name: 'Conference Room',
          length: 6,
          width: 5,
          height: 3,
          area: 30,
          roomType: 'meeting',
          coords: { x: 400, y: 150, width: 150, height: 120 },
          requiredLux: 300,
          recommendedFixtures: 4,
          actualFixtures: 4,
          compliance: 100,
          reflectanceCeiling: 0.7,
          reflectanceWalls: 0.5,
          reflectanceFloor: 0.2,
          maintenanceFactor: 0.8,
          energyUsage: 275
        },
        {
          id: 'room-3',
          name: 'Reception',
          length: 5,
          width: 4,
          height: 3,
          area: 20,
          roomType: 'reception',
          coords: { x: 200, y: 310, width: 130, height: 100 },
          requiredLux: 300,
          recommendedFixtures: 3,
          actualFixtures: 2,
          compliance: 75,
          reflectanceCeiling: 0.7,
          reflectanceWalls: 0.5,
          reflectanceFloor: 0.2,
          maintenanceFactor: 0.8,
          energyUsage: 180
        }
      ];
      
      // Create non-compliant areas
      const areas = [
        {
          id: 'non-compliant-1',
          type: 'lighting',
          x: 300,
          y: 200,
          width: 100,
          height: 80,
          title: 'Insufficient Lighting',
          description: 'This area has insufficient lighting levels compared to standards',
          compliance: 65,
          recommendations: ['Increase number of fixtures', 'Use higher lumen output bulbs'],
          severity: 'medium'
        },
        {
          id: 'non-compliant-2',
          type: 'power',
          x: 450,
          y: 350,
          width: 120,
          height: 90,
          title: 'Overloaded Circuit',
          description: 'This area has too many devices on a single circuit',
          compliance: 70,
          recommendations: ['Redistribute loads', 'Add additional circuit'],
          severity: 'high'
        }
      ];
      
      setRoomData(rooms);
      setNonCompliantAreas(areas);
      setIsLoading(false);
      showSnackbar('Building data loaded successfully', 'success');
    }, 1000);
  };
  
  // Save floor plan data
  const saveFloorData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      showSnackbar('Data saved successfully', 'success');
      setIsLoading(false);
    }, 1000);
  };
  
  // Zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
    showSnackbar('Zoomed in', 'info');
  };
  
  // Zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    showSnackbar('Zoomed out', 'info');
  };
  
  // Reset view
  const handleFitToView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    showSnackbar('View reset', 'info');
  };
  
  // Toggle pan mode
  const handleTogglePanMode = () => {
    setIsPanMode(prev => !prev);
    if (!isPanMode) {
      showSnackbar('Pan mode enabled', 'info');
    }
  };
  
  // Toggle grid lines
  const handleToggleGridLines = () => {
    setShowGridLines(prev => !prev);
  };
  
  // Toggle labels
  const handleToggleLabels = () => {
    setShowLabels(prev => !prev);
  };
  
  // Handle room click
  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    showSnackbar(`Selected room: ${room.name}`, 'info');
  };
  
  // Toggle fullscreen
  const handleToggleFullScreen = () => {
    const container = containerRef.current;
    
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          showSnackbar('Failed to enter fullscreen mode', 'error');
        });
        setIsFullScreen(true);
      } else {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message}`);
        });
        setIsFullScreen(false);
      }
    }
  };
  
  // Save screenshot
  const handleSaveScreenshot = () => {
    showSnackbar('Screenshot saved', 'success');
  };
  
  // Pan handlers
  const handlePanStart = () => {
    // Implementation would go here
  };
  
  const handlePanMove = (e: any) => {
    setPanOffset({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handlePanEnd = () => {
    // Implementation would go here
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Render floor plan
  const renderFloorPlan = () => {
    return (
      <div 
        style={{ 
          position: 'relative',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 100
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading...
            </Typography>
          </Box>
        )}
        
        {/* This would be the actual floor plan implementation */}
        <Box
          sx={{
            position: 'relative',
            height: 'calc(100% - 48px)',
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: 'transform 0.1s ease-out',
            backgroundImage: `url(${floorPlanImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#f5f5f5'
          }}
        >
          {/* Rooms would be rendered here */}
          {roomData.map(room => (
            <Box
              key={room.id}
              sx={{
                position: 'absolute',
                top: room.coords.y,
                left: room.coords.x,
                width: room.coords.width,
                height: room.coords.height,
                border: '2px solid',
                borderColor: room.id === selectedRoom?.id ? 'primary.main' : 'text.secondary',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              }}
              onClick={() => handleRoomClick(room)}
            >
              {showLabels && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '2px 4px',
                    borderRadius: 1
                  }}
                >
                  {room.name}
                </Typography>
              )}
            </Box>
          ))}
          
          {/* Non-compliant areas would be rendered here */}
          {nonCompliantAreas
            .filter(area => area.type === viewMode)
            .map(area => (
              <Box
                key={area.id}
                sx={{
                  position: 'absolute',
                  top: area.y,
                  left: area.x,
                  width: area.width,
                  height: area.height,
                  border: '2px dashed',
                  borderColor: 
                    area.compliance >= 85 ? 'success.main' :
                    area.compliance >= 70 ? 'warning.main' : 
                    'error.main',
                  backgroundColor:
                    area.compliance >= 85 ? 'rgba(76, 175, 80, 0.1)' :
                    area.compliance >= 70 ? 'rgba(255, 152, 0, 0.1)' :
                    'rgba(244, 67, 54, 0.1)',
                  cursor: 'pointer'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '0px 4px',
                    borderRadius: 1,
                    fontSize: '0.7rem'
                  }}
                >
                  {area.title}
                </Typography>
              </Box>
            ))}
            
          {/* Grid lines would be rendered here if enabled */}
          {showGridLines && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none'
              }}
            />
          )}
        </Box>
      </div>
    );
  };
  
  // Render controls
  const renderControls = () => {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 1,
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            Floor Plan
          </Typography>
          
          <Button
            variant="outlined"
            size="small"
            color={viewMode === 'lighting' ? 'primary' : 'inherit'}
            onClick={() => setViewMode('lighting')}
          >
            Lighting
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            color={viewMode === 'power' ? 'primary' : 'inherit'}
            onClick={() => setViewMode('power')}
          >
            Power
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fit to View">
            <IconButton onClick={handleFitToView} size="small">
              <FitScreen />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isPanMode ? 'Exit Pan Mode' : 'Enter Pan Mode'}>
            <IconButton
              onClick={handleTogglePanMode}
              size="small"
              color={isPanMode ? 'primary' : 'inherit'}
            >
              <PanTool />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={showGridLines ? 'Hide Grid' : 'Show Grid'}>
            <IconButton
              onClick={handleToggleGridLines}
              size="small"
              color={showGridLines ? 'primary' : 'inherit'}
            >
              <Grid4x4 />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={showLabels ? 'Hide Labels' : 'Show Labels'}>
            <IconButton
              onClick={handleToggleLabels}
              size="small"
              color={showLabels ? 'primary' : 'inherit'}
            >
              <Label />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <IconButton
              onClick={handleToggleFullScreen}
              size="small"
            >
              {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Save Screenshot">
            <IconButton
              onClick={handleSaveScreenshot}
              size="small"
            >
              <CameraAlt />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsEditMode(prev => !prev)}
            color={isEditMode ? 'primary' : 'inherit'}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Save />}
            onClick={saveFloorData}
            disabled={isLoading}
          >
            Save
          </Button>
        </Box>
      </Paper>
    );
  };
  
  // Render tabs
  const renderTabs = () => {
    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Floor plan tabs"
        >
          <Tab label="Floor Plan" />
          <Tab label="Energy Analysis" />
          <Tab label="Room Details" />
        </Tabs>
      </Box>
    );
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderFloorPlan();
      case 1:
        return (
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Energy Analysis
            </Typography>
            <Typography>
              Energy analysis content would go here
            </Typography>
          </Paper>
        );
      case 2:
        return (
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Room Details
            </Typography>
            {selectedRoom ? (
              <Box>
                <Typography variant="subtitle1">
                  {selectedRoom.name}
                </Typography>
                <Typography>
                  Type: {selectedRoom.roomType}
                </Typography>
                <Typography>
                  Dimensions: {selectedRoom.length}m x {selectedRoom.width}m x {selectedRoom.height}m
                </Typography>
                <Typography>
                  Area: {selectedRoom.area} m²
                </Typography>
                <Typography>
                  Energy Usage: {selectedRoom.energyUsage} kWh/month
                </Typography>
              </Box>
            ) : (
              <Typography>
                Select a room to view details
              </Typography>
            )}
          </Paper>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box 
      ref={containerRef}
      id="building-visualization-container"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' 
      }}
    >
      {renderControls()}
      {renderTabs()}
      {renderTabContent()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuildingVisualization; 