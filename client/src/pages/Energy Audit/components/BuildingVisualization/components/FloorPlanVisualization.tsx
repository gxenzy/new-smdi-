import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Save, 
  CheckCircle, 
  Warning,
  ErrorOutline,
  Edit,
  Delete
} from '@mui/icons-material';
import { 
  DetectedRoom, 
  RoomDetail,
  NonCompliantArea,
  Point
} from '../interfaces/buildingInterfaces';
import { useTheme } from '@mui/material/styles';

interface FloorPlanVisualizationProps {
  floorPlanImage: string;
  roomData: RoomDetail[];
  detectedRooms: DetectedRoom[];
  nonCompliantAreas: NonCompliantArea[];
  isProcessingImage: boolean;
  showGridLines: boolean;
  showLabels: boolean;
  zoomLevel: number;
  panOffset: Point;
  isPanMode: boolean;
  onPanStart: (e: React.MouseEvent) => void;
  onPanMove: (e: React.MouseEvent) => void;
  onPanEnd: () => void;
  detectionConfidence: number;
  viewMode: 'lighting' | 'power';
  isEditMode: boolean;
  onApplyDetections: () => void;
  onRoomClick: (roomId: string) => void;
  onRoomDragStart: (roomId: string, e: React.MouseEvent) => void;
  onRoomDragMove: (e: React.MouseEvent) => void;
  onRoomDragEnd: () => void;
  onEditMenuOpen: (roomId: string) => void;
  onHotspotDragStart: (hotspotId: string, position: string, e: React.MouseEvent) => void;
  onHotspotDragMove: (e: React.MouseEvent) => void;
  onHotspotDragEnd: () => void;
  onDelete: (roomId: string) => void;
  selectedRoom: RoomDetail | null;
  onSelectRoom: (room: RoomDetail) => void;
}

const FloorPlanVisualization: React.FC<FloorPlanVisualizationProps> = ({
  floorPlanImage,
  roomData,
  detectedRooms,
  nonCompliantAreas,
  isProcessingImage,
  showGridLines,
  showLabels,
  zoomLevel,
  panOffset,
  isPanMode,
  onPanStart,
  onPanMove,
  onPanEnd,
  detectionConfidence,
  viewMode,
  isEditMode,
  onApplyDetections,
  onRoomClick,
  onRoomDragStart,
  onRoomDragMove,
  onRoomDragEnd,
  onEditMenuOpen,
  onHotspotDragStart,
  onHotspotDragMove,
  onHotspotDragEnd,
  onDelete,
  selectedRoom,
  onSelectRoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const theme = useTheme();
  
  // Color mapping for room types
  const ROOM_TYPE_COLORS: {[key: string]: string} = {
    'office': '#4CAF50',
    'conference': '#2196F3',
    'restroom': '#9C27B0',
    'kitchen': '#FF9800',
    'storage': '#795548',
    'electrical': '#F44336',
    'hallway': '#607D8B',
    'server': '#E91E63',
    'classroom': '#00BCD4',
    'reception': '#8BC34A',
    'lobby': '#3F51B5',
    'default': '#9E9E9E'
  };
  
  // Get room color based on room type or compliance
  const getRoomColor = (room: RoomDetail): string => {
    if (viewMode === 'lighting') {
      // For lighting view, use compliance values to shade the room
      const compliance = room.compliance || 0;
      if (compliance < 50) return '#DB4437'; // Red for poor compliance
      if (compliance < 75) return '#F4B400'; // Yellow for moderate compliance
      if (compliance < 90) return '#0F9D58'; // Green for good compliance
      return '#4285F4'; // Blue for excellent compliance
    }
    
    // For power view or default, use room type
    const type = room.roomType?.toLowerCase() || 'default';
    return ROOM_TYPE_COLORS[type] || ROOM_TYPE_COLORS['default'];
  };
  
  // Update container dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Set dimensions initially
    updateDimensions();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Handle image loading
  useEffect(() => {
    const img = new Image();
    img.src = floorPlanImage;
    
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      console.error("Failed to load image:", floorPlanImage);
      setImageError(true);
      setImageLoaded(false);
    };
    
    // Set a timeout to prevent hanging forever
    const timeout = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        console.warn('Image loading timed out');
        setImageError(true);
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [floorPlanImage]);
  
  // Handle room click
  const handleRoomClick = (room: RoomDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isEditMode) {
      // Update selected room
      onSelectRoom(room);
      
      // Call the parent's room click handler
      onRoomClick(room.id);
    }
  };
  
  // Render rooms
  const renderRooms = () => {
    return roomData.map(room => {
      const isSelected = selectedRoom?.id === room.id;
      
      // Determine indicator for compliance
      let ComplianceIcon = null;
      let complianceColor = '';
      
      if (room.compliance !== undefined) {
        if (room.compliance >= 90) {
          ComplianceIcon = CheckCircle;
          complianceColor = 'success.main';
        } else if (room.compliance >= 70) {
          ComplianceIcon = Warning;
          complianceColor = 'warning.main';
        } else {
          ComplianceIcon = ErrorOutline;
          complianceColor = 'error.main';
        }
      }
      
      return (
        <Box
          key={room.id}
          data-id={room.id}
          sx={{
            position: 'absolute',
            top: room.coords.y,
            left: room.coords.x,
            width: room.coords.width,
            height: room.coords.height,
            backgroundColor: `${getRoomColor(room)}40`, // 40 is hex for 25% opacity
            border: `2px solid ${getRoomColor(room)}`,
            borderRadius: '4px',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isEditMode ? 'move' : 'pointer',
            boxShadow: isSelected ? '0 0 8px rgba(0,0,0,0.5)' : 'none',
            userSelect: 'none',
            zIndex: isSelected ? 10 : 1,
            transition: isEditMode ? 'none' : 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              zIndex: 5
            }
          }}
          onClick={(e) => handleRoomClick(room, e)}
          onMouseDown={(e) => isEditMode && onRoomDragStart(room.id, e)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (isEditMode) {
              onEditMenuOpen(room.id);
            }
          }}
        >
          {/* Room label */}
          {showLabels && (
            <Box
              sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '2px 6px',
                borderRadius: '4px',
                maxWidth: '90%',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {room.name}
              </Typography>
              
              {ComplianceIcon && (
                <Tooltip title={`${room.compliance}% compliant with standards`}>
                  <ComplianceIcon
                    fontSize="small"
                    color={complianceColor as any}
                    sx={{ fontSize: '14px' }}
                  />
                </Tooltip>
              )}
            </Box>
          )}
          
          {/* Area/dimension details */}
          {showLabels && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(0,0,0,0.7)',
                fontSize: '0.7rem',
                backgroundColor: 'rgba(255,255,255,0.5)',
                padding: '1px 4px',
                borderRadius: '2px',
                marginTop: '2px'
              }}
            >
              {room.area.toFixed(1)} m²
            </Typography>
          )}
          
          {/* Resize handles for selected room in edit mode */}
          {isEditMode && isSelected && (
            <>
              {/* Top-left handle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.primary.main,
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'nwse-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHotspotDragStart(room.id, 'nw', e);
                }}
              />
              
              {/* Top-right handle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.primary.main,
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'nesw-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHotspotDragStart(room.id, 'ne', e);
                }}
              />
              
              {/* Bottom-left handle */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  left: -6,
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.primary.main,
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'nesw-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHotspotDragStart(room.id, 'sw', e);
                }}
              />
              
              {/* Bottom-right handle */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 12,
                  height: 12,
                  backgroundColor: theme.palette.primary.main,
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'nwse-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onHotspotDragStart(room.id, 'se', e);
                }}
              />
              
              {/* Edit controls */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-10px',
                  display: 'flex',
                  gap: '2px',
                  zIndex: 20
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMenuOpen(room.id);
                  }}
                  sx={{ bgcolor: 'white', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete room: ${room.name}?`)) {
                      onDelete(room.id);
                    }
                  }}
                  sx={{ bgcolor: 'white', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      );
    });
  };
  
  // Render detected rooms
  const renderDetectedRooms = () => {
    if (!detectedRooms.length) return null;
    
    return (
      <>
        {detectedRooms.map(room => (
          <Box
            key={`detected-${room.id}`}
            sx={{
              position: 'absolute',
              left: room.x,
              top: room.y,
              width: room.width,
              height: room.height,
              border: '2px dashed',
              borderColor: 'primary.main',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                '70%': { boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
              }
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(33, 150, 243, 0.7)',
                padding: '2px 4px',
                borderRadius: '2px',
                fontWeight: 'bold'
              }}
            >
              {room.name}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '1px 3px',
                borderRadius: '2px',
                fontSize: '0.7rem'
              }}
            >
              {Math.round(room.confidence * 100)}% confidence
            </Typography>
          </Box>
        ))}
        
        {/* Button to apply detected rooms */}
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={onApplyDetections}
          startIcon={<CheckCircle />}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 10,
            boxShadow: 2
          }}
        >
          Apply {detectedRooms.length} Detected Rooms
        </Button>
      </>
    );
  };
  
  // Render non-compliant areas
  const renderNonCompliantAreas = () => {
    if (!nonCompliantAreas.length) return null;
    
    return nonCompliantAreas
      .filter(area => area.type === viewMode)
      .map(area => {
        // Determine color based on compliance
        const getComplianceColor = (compliance: number) => {
          if (compliance >= 85) return { border: 'success.main', bg: 'rgba(76, 175, 80, 0.1)' };
          if (compliance >= 70) return { border: 'warning.main', bg: 'rgba(255, 152, 0, 0.1)' };
          return { border: 'error.main', bg: 'rgba(244, 67, 54, 0.1)' };
        };
        
        const colors = getComplianceColor(area.compliance);
        
        return (
          <Box
            key={area.id}
            data-id={area.id}
            sx={{
              position: 'absolute',
              top: area.y,
              left: area.x,
              width: area.width,
              height: area.height,
              border: '2px dashed',
              borderColor: colors.border,
              backgroundColor: colors.bg,
              borderRadius: '4px',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '2px 4px',
                borderRadius: '2px'
              }}
            >
              {area.title}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: '1px 3px',
                borderRadius: '2px',
                marginTop: '2px'
              }}
            >
              {area.compliance}% compliant
            </Typography>
          </Box>
        );
      });
  };
  
  // Render processing overlay
  const renderProcessingOverlay = () => {
    if (!isProcessingImage) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
          Processing Floor Plan
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '80%' }}>
          Detecting rooms and analyzing layout. This may take a few moments.
        </Typography>
      </Box>
    );
  };
  
  // Render grid lines
  const renderGridLines = () => {
    if (!showGridLines) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    );
  };
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        cursor: isPanMode ? 'grab' : 'default'
      }}
      onMouseDown={isPanMode ? onPanStart : undefined}
      onMouseMove={isPanMode ? onPanMove : onRoomDragMove}
      onMouseUp={isPanMode ? onPanEnd : onRoomDragEnd}
    >
      {/* Background image */}
      {imageLoaded && !imageError ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${floorPlanImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: '0 0',
            transition: isPanMode ? 'none' : 'transform 0.2s ease'
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          {imageError ? (
            <>
              <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.main">
                Failed to load floor plan image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please check the image path and try again
              </Typography>
            </>
          ) : (
            <CircularProgress />
          )}
        </Box>
      )}
      
      {/* Grid lines */}
      {renderGridLines()}
      
      {/* Content container with pan and zoom */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: '0 0',
          transition: isPanMode ? 'none' : 'transform 0.2s ease',
          pointerEvents: 'none' // Let background handle events
        }}
      >
        {/* Render rooms and other elements */}
        {renderRooms()}
        {renderNonCompliantAreas()}
        {renderDetectedRooms()}
      </Box>
      
      {/* Detection confidence indicator */}
      {detectionConfidence > 0 && (
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            padding: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 100
          }}
        >
          <Typography variant="caption">Detection Confidence:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {(detectionConfidence * 100).toFixed(0)}%
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 6,
              backgroundColor: '#e0e0e0',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${detectionConfidence * 100}%`,
                height: '100%',
                backgroundColor:
                  detectionConfidence > 0.8
                    ? 'success.main'
                    : detectionConfidence > 0.6
                    ? 'warning.main'
                    : 'error.main'
              }}
            />
          </Box>
        </Paper>
      )}
      
      {/* Processing overlay */}
      {renderProcessingOverlay()}
    </Box>
  );
};

export default FloorPlanVisualization; 