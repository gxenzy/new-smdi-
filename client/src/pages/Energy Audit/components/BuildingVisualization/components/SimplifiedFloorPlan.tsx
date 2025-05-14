import React from 'react';
import { Box, Typography } from '@mui/material';
import { RoomDetail, NonCompliantArea, Point } from '../interfaces/buildingInterfaces';

interface SimplifiedFloorPlanProps {
  floorPlanImage: string;
  roomData: RoomDetail[];
  nonCompliantAreas: NonCompliantArea[];
  selectedRoom: RoomDetail | null;
  zoomLevel: number;
  panOffset: Point;
  isPanMode: boolean;
  showGridLines: boolean;
  showLabels: boolean;
  viewMode: 'lighting' | 'power';
  onRoomClick: (room: RoomDetail) => void;
  onPanChange: (offset: Point) => void;
}

const SimplifiedFloorPlan: React.FC<SimplifiedFloorPlanProps> = ({
  floorPlanImage,
  roomData,
  nonCompliantAreas,
  selectedRoom,
  zoomLevel,
  panOffset,
  isPanMode,
  showGridLines,
  showLabels,
  viewMode,
  onRoomClick,
  onPanChange
}) => {
  // Helper functions
  const getComplianceColor = (compliance: number | undefined): string => {
    if (compliance === undefined) return 'rgba(128, 128, 128, 0.3)';
    if (compliance >= 85) return 'rgba(76, 175, 80, 0.3)';
    if (compliance >= 70) return 'rgba(255, 152, 0, 0.3)';
    return 'rgba(244, 67, 54, 0.3)';
  };

  // Pan handler
  const handlePanStart = (e: React.MouseEvent) => {
    if (!isPanMode) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPanX = panOffset.x;
    const startPanY = panOffset.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onPanChange({
        x: startPanX + dx / zoomLevel,
        y: startPanY + dy / zoomLevel
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background image with zoom and pan */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${floorPlanImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: '0 0',
          transition: isPanMode ? 'none' : 'transform 0.2s ease'
        }}
      />
      
      {/* Transformable container for rooms and areas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        {/* Rooms */}
        {roomData.map(room => {
          const isSelected = selectedRoom?.id === room.id;
          return (
            <Box
              key={room.id}
              sx={{
                position: 'absolute',
                top: room.coords.y,
                left: room.coords.x,
                width: room.coords.width,
                height: room.coords.height,
                backgroundColor: getComplianceColor(room.compliance),
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'text.secondary',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'auto',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 0 8px rgba(0,0,0,0.5)'
                }
              }}
              onClick={() => onRoomClick(room)}
            >
              {showLabels && (
                <>
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    {room.name}
                  </Typography>
                  
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      mt: 1
                    }}
                  >
                    {room.area.toFixed(1)} m²
                  </Typography>
                </>
              )}
            </Box>
          );
        })}
        
        {/* Non-compliant areas */}
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
                borderColor: area.compliance >= 85 ? 'success.main' : 
                           area.compliance >= 70 ? 'warning.main' : 'error.main',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                pointerEvents: 'auto',
                cursor: 'help'
              }}
            >
              {showLabels && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '0 4px',
                    borderRadius: '2px',
                    fontSize: '0.7rem'
                  }}
                >
                  {area.title}
                </Typography>
              )}
            </Box>
          ))}
      </Box>
      
      {/* Grid lines */}
      {showGridLines && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: '0 0'
          }}
        />
      )}
      
      {/* Pan area - captures mouse events for panning */}
      {isPanMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'grab',
          }}
          onMouseDown={handlePanStart}
        />
      )}
    </Box>
  );
};

export default SimplifiedFloorPlan; 