import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Done, Edit } from '@mui/icons-material';
import { AreaPoint, RoomDetail } from '../interfaces';

interface PolygonRoomEditorProps {
  room: RoomDetail;
  isEditMode: boolean;
  onPointsChange: (roomId: string, points: AreaPoint[]) => void;
  onShapeChange: (roomId: string, shape: 'rect' | 'polygon') => void;
}

const PolygonRoomEditor: React.FC<PolygonRoomEditorProps> = ({
  room,
  isEditMode,
  onPointsChange,
  onShapeChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [points, setPoints] = useState<AreaPoint[]>(
    room.points || generateRectPoints(room.coords.x, room.coords.y, room.coords.width, room.coords.height)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate rectangle points from coords
  function generateRectPoints(x: number, y: number, width: number, height: number): AreaPoint[] {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
      { x: x - halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y + halfHeight },
      { x: x - halfWidth, y: y + halfHeight }
    ];
  }
  
  // Convert polygon back to rectangle
  const convertToRectangle = () => {
    const points = generateRectPoints(room.coords.x, room.coords.y, room.coords.width, room.coords.height);
    setPoints(points);
    onPointsChange(room.id, points);
    onShapeChange(room.id, 'rect');
    setIsEditing(false);
  };
  
  // Convert rectangle to polygon
  const convertToPolygon = () => {
    onShapeChange(room.id, 'polygon');
    setIsEditing(true);
  };
  
  // Add a new point
  const addPoint = (e: React.MouseEvent) => {
    if (!isEditing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add point at nearest edge
    const newPoints = [...points];
    let minDist = Infinity;
    let insertIndex = 0;
    
    // Find the edge with minimum distance
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const p1 = points[i];
      const p2 = points[j];
      
      // Calculate the closest point on the line
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const u = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len);
      
      let closestX, closestY;
      if (u < 0) {
        closestX = p1.x;
        closestY = p1.y;
      } else if (u > 1) {
        closestX = p2.x;
        closestY = p2.y;
      } else {
        closestX = p1.x + u * dx;
        closestY = p1.y + u * dy;
      }
      
      const distance = Math.sqrt(
        Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2)
      );
      
      if (distance < minDist) {
        minDist = distance;
        insertIndex = j;
      }
    }
    
    // Insert the new point at the found position
    newPoints.splice(insertIndex, 0, { x, y });
    setPoints(newPoints);
    onPointsChange(room.id, newPoints);
  };
  
  // Remove a point
  const removePoint = (index: number) => {
    if (points.length <= 3) return; // Maintain minimum triangle
    
    const newPoints = [...points];
    newPoints.splice(index, 1);
    setPoints(newPoints);
    onPointsChange(room.id, newPoints);
  };
  
  // Move a point
  const movePoint = (index: number, newX: number, newY: number) => {
    const newPoints = [...points];
    newPoints[index] = { x: newX, y: newY };
    setPoints(newPoints);
    onPointsChange(room.id, newPoints);
  };
  
  // Handle point drag
  const handlePointDragStart = (index: number) => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      movePoint(index, x, y);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Calculate the polygon's SVG path
  const getPolygonPath = (): string => {
    if (points.length < 3) return '';
    
    return points.map((point, i) => 
      (i === 0 ? 'M ' : 'L ') + point.x + ' ' + point.y
    ).join(' ') + ' Z';
  };
  
  // Finish editing
  const finishEditing = () => {
    setIsEditing(false);
  };
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        pointerEvents: 'none'
      }}
    >
      {/* Polygon path */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          pointerEvents: 'none' 
        }}
      >
        <path 
          d={getPolygonPath()} 
          fill={`${room.color || '#4CAF50'}40`} 
          stroke={room.color || '#4CAF50'} 
          strokeWidth="2"
          strokeDasharray={isEditing ? "4 4" : "none"}
        />
      </svg>
      
      {/* Point markers (only visible in edit mode) */}
      {isEditMode && isEditing && points.map((point, index) => (
        <Box 
          key={`point-${index}`}
          sx={{
            position: 'absolute',
            top: point.y,
            left: point.x,
            width: 12,
            height: 12,
            backgroundColor: 'primary.main',
            border: '2px solid white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'move',
            zIndex: 10,
            pointerEvents: 'auto'
          }}
          onMouseDown={() => handlePointDragStart(index)}
        >
          <Tooltip title="Remove point">
            <IconButton 
              size="small" 
              onClick={() => removePoint(index)}
              sx={{ 
                position: 'absolute', 
                top: -16, 
                left: -10, 
                width: 16, 
                height: 16, 
                color: 'error.main',
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f8f8f8' }
              }}
            >
              <Delete sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ))}
      
      {/* Controls (only visible in edit mode) */}
      {isEditMode && (
        <Box
          sx={{
            position: 'absolute',
            top: room.coords.y - 20,
            left: room.coords.x,
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 11,
            pointerEvents: 'auto'
          }}
        >
          {isEditing ? (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Done />}
                onClick={finishEditing}
              >
                Done
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={addPoint}
              >
                Add Point
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={convertToRectangle}
              >
                To Rectangle
              </Button>
            </>
          ) : (
            room.shape === 'rect' && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
                onClick={convertToPolygon}
              >
                To Polygon
              </Button>
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default PolygonRoomEditor; 