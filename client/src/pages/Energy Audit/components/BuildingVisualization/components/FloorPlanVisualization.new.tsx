import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { RoomDetail, NonCompliantArea, Point, DetectedRoom } from '../interfaces/buildingInterfaces';

interface FloorPlanVisualizationProps {
  floorPlanImage: string;
  fallbackImage: string;
  roomData: RoomDetail[];
  detectedRooms: DetectedRoom[];
  nonCompliantAreas: NonCompliantArea[];
  selectedRoom: RoomDetail | null;
  zoomLevel: number;
  panOffset: Point;
  isPanMode: boolean;
  showGridLines: boolean;
  showLabels: boolean;
  isEditMode: boolean;
  isLoading?: boolean;
  isProcessingImage: boolean;
  detectionConfidence: number;
  viewMode: 'lighting' | 'power';
  onPanStart: (e: React.MouseEvent) => void;
  onPanMove: (e: React.MouseEvent) => void;
  onPanEnd: () => void;
  onRoomClick: (room: RoomDetail) => void;
  onPanChange?: (offset: Point) => void;
  onApplyDetections: () => void;
  onRoomDragStart: (roomId: string, e: React.MouseEvent) => void;
  onRoomDragMove: (e: React.MouseEvent) => void;
  onRoomDragEnd: () => void;
  onEditMenuOpen: (roomId: string) => void;
  onHotspotDragStart: (hotspotId: string, position: string, e: React.MouseEvent) => void;
  onHotspotDragMove: (e: React.MouseEvent) => void;
  onHotspotDragEnd: () => void;
  onDelete: (roomId: string) => void;
  onSelectRoom: (room: RoomDetail) => void;
}

/**
 * FloorPlanVisualization Component
 * 
 * Renders a floor plan with interactive rooms and non-compliant areas
 */
const FloorPlanVisualization: React.FC<FloorPlanVisualizationProps> = ({
  floorPlanImage,
  fallbackImage,
  roomData,
  detectedRooms,
  nonCompliantAreas,
  selectedRoom,
  zoomLevel,
  panOffset,
  isPanMode,
  showGridLines,
  showLabels,
  isEditMode,
  isLoading = false,
  isProcessingImage,
  detectionConfidence,
  viewMode,
  onPanStart,
  onPanMove,
  onPanEnd,
  onRoomClick,
  onPanChange,
  onApplyDetections,
  onRoomDragStart,
  onRoomDragMove,
  onRoomDragEnd,
  onEditMenuOpen,
  onHotspotDragStart,
  onHotspotDragMove,
  onHotspotDragEnd,
  onDelete,
  onSelectRoom
}) => {
  // State for image loading
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const currentOffset = useRef<Point>({ x: panOffset.x, y: panOffset.y });
  
  // Load image effect
  useEffect(() => {
    const img = new Image();
    img.src = floorPlanImage;
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      
      // Try fallback image
      const fallbackImg = new Image();
      fallbackImg.src = fallbackImage;
      fallbackImg.onload = () => {
        setImageLoaded(true);
      };
      fallbackImg.onerror = () => {
        setImageLoaded(false);
      };
    };
  }, [floorPlanImage, fallbackImage]);
  
  // Sync panOffset with ref
  useEffect(() => {
    currentOffset.current = panOffset;
  }, [panOffset]);
  
  // Determine which image to display
  const displayImage = imageError ? fallbackImage : floorPlanImage;
  
  // Calculate compliance color
  const getComplianceColor = (compliance: number | undefined): string => {
    if (compliance === undefined) return 'rgba(128, 128, 128, 0.3)';
    if (compliance >= 85) return 'rgba(76, 175, 80, 0.3)';
    if (compliance >= 70) return 'rgba(255, 152, 0, 0.3)';
    return 'rgba(244, 67, 54, 0.3)';
  };
  
  // Pan handlers - use the provided handlers but also implement local ones for internal state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode || isLoading || isProcessingImage) return;
    
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    // Call provided pan start handler
    onPanStart(e);
    
    // Prevent default behavior
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanMode || !isDragging.current || isLoading || isProcessingImage) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    const newOffset = {
      x: currentOffset.current.x + deltaX / zoomLevel,
      y: currentOffset.current.y + deltaY / zoomLevel
    };
    
    // Update last mouse position
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    // Update pan offset
    currentOffset.current = newOffset;
    
    // Call provided pan move handler
    onPanMove(e);
    
    // Also call onPanChange if available
    if (onPanChange) {
      onPanChange(newOffset);
    }
    
    // Prevent default behavior
    e.preventDefault();
  };
  
  const handleMouseUp = () => {
    if (!isPanMode || isLoading || isProcessingImage) return;
    isDragging.current = false;
    
    // Call provided pan end handler
    onPanEnd();
  };
  
  // Add mouse leave handler
  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      onPanEnd();
    }
  };

  // Room click handler
  const handleRoomClick = (room: RoomDetail, e: React.MouseEvent) => {
    if (isPanMode || isLoading || isProcessingImage) return;
    
    // Update selection using onSelectRoom
    onSelectRoom(room);
    
    // Also call the click handler with the room
    onRoomClick(room);
    
    e.stopPropagation();
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading overlay */}
      {(isLoading || isProcessingImage) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 100
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isProcessingImage ? 'Processing Image...' : 'Loading...'}
          </Typography>
        </Box>
      )}
      
      {/* Floor plan image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: isPanMode ? 'none' : 'transform 0.2s ease-out',
          transformOrigin: 'center',
          backgroundImage: `url(${displayImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Grid lines */}
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
        
        {/* Rooms */}
        {roomData.map(room => (
          <Box
            key={room.id}
            data-id={room.id}
            sx={{
              position: 'absolute',
              top: room.coords.y,
              left: room.coords.x,
              width: room.coords.width,
              height: room.coords.height,
              border: '2px solid',
              borderColor: selectedRoom?.id === room.id ? 'primary.main' : 'text.secondary',
              backgroundColor: getComplianceColor(room.compliance),
              cursor: isPanMode ? 'grab' : isEditMode ? 'move' : 'pointer',
              '&:hover': {
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)'
              }
            }}
            onClick={(e) => handleRoomClick(room, e)}
            onMouseDown={(e) => isEditMode && onRoomDragStart(room.id, e)}
            onContextMenu={(e) => {
              if (isEditMode) {
                e.preventDefault();
                onEditMenuOpen(room.id);
              }
            }}
          >
            {/* Room labels */}
            {showLabels && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '2px 6px',
                  borderRadius: 1,
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold'
                }}
              >
                {room.name}
              </Typography>
            )}
            
            {/* Resize handles when in edit mode */}
            {isEditMode && selectedRoom?.id === room.id && (
              <>
                <Box 
                  className="resize-handle nw"
                  sx={{
                    position: 'absolute', 
                    top: -5, left: -5, 
                    width: 10, height: 10, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%',
                    cursor: 'nwse-resize'
                  }}
                  onMouseDown={(e) => onHotspotDragStart(room.id, 'nw', e)}
                />
                <Box 
                  className="resize-handle ne"
                  sx={{
                    position: 'absolute', 
                    top: -5, right: -5, 
                    width: 10, height: 10, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%',
                    cursor: 'nesw-resize'
                  }}
                  onMouseDown={(e) => onHotspotDragStart(room.id, 'ne', e)}
                />
                <Box 
                  className="resize-handle sw"
                  sx={{
                    position: 'absolute', 
                    bottom: -5, left: -5, 
                    width: 10, height: 10, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%',
                    cursor: 'nesw-resize'
                  }}
                  onMouseDown={(e) => onHotspotDragStart(room.id, 'sw', e)}
                />
                <Box 
                  className="resize-handle se"
                  sx={{
                    position: 'absolute', 
                    bottom: -5, right: -5, 
                    width: 10, height: 10, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%',
                    cursor: 'nwse-resize'
                  }}
                  onMouseDown={(e) => onHotspotDragStart(room.id, 'se', e)}
                />
              </>
            )}
          </Box>
        ))}
        
        {/* Detected Rooms */}
        {detectedRooms.map(room => (
          <Box
            key={`detected-${room.id}`}
            sx={{
              position: 'absolute',
              top: room.y,
              left: room.x,
              width: room.width,
              height: room.height,
              border: '2px dashed',
              borderColor: 'primary.main',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              cursor: 'pointer',
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
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
        
        {/* Apply detected rooms button */}
        {detectedRooms.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10
            }}
          >
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={onApplyDetections}
            >
              Apply {detectedRooms.length} Detected Rooms
            </Button>
          </Box>
        )}
        
        {/* Non-compliant areas */}
        {nonCompliantAreas.map(area => (
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
              cursor: isPanMode ? 'grab' : 'help',
              zIndex: 10
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
                fontSize: '0.7rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              {area.title}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Error message if image failed to load */}
      {!imageLoaded && !isLoading && !isProcessingImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="h6" color="error">
            Failed to load floor plan image
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please check that the image path is correct and the file exists
          </Typography>
        </Box>
      )}
      
      {/* Detection confidence indicator */}
      {detectionConfidence > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 1,
            padding: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="caption">Detection Confidence:</Typography>
          <Typography variant="body2" fontWeight="bold">
            {Math.round(detectionConfidence * 100)}%
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
                backgroundColor: detectionConfidence > 0.8 
                  ? 'success.main' 
                  : detectionConfidence > 0.6 
                    ? 'warning.main' 
                    : 'error.main'
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FloorPlanVisualization; 