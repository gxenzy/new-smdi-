import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { RoomDetail } from '../interfaces';

interface LightingSimulationProps {
  roomData: RoomDetail[];
  selectedRoomId?: string | null;
  width: number;
  height: number;
  viewMode: 'lighting' | 'power';
}

/**
 * Component for visualizing lighting levels and distribution in the floor plan
 */
const LightingSimulation: React.FC<LightingSimulationProps> = ({
  roomData,
  selectedRoomId,
  width,
  height,
  viewMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  
  // Color codes for lighting levels
  const getLightingColor = (lux: number, requiredLux: number): string => {
    if (!lux || !requiredLux) return 'rgba(200, 200, 200, 0.5)';
    
    const ratio = lux / requiredLux;
    
    if (ratio >= 1.2) return 'rgba(0, 255, 0, 0.7)'; // More than needed
    if (ratio >= 0.9) return 'rgba(144, 238, 144, 0.7)'; // Good
    if (ratio >= 0.7) return 'rgba(255, 255, 0, 0.7)'; // Acceptable
    if (ratio >= 0.5) return 'rgba(255, 165, 0, 0.7)'; // Low
    return 'rgba(255, 0, 0, 0.7)'; // Too low
  };
  
  // Calculate lighting points for a room
  const calculateLightingPoints = (room: RoomDetail): {x: number, y: number, intensity: number}[] => {
    if (!room.actualFixtures || !room.requiredLux) return [];
    
    const points: {x: number, y: number, intensity: number}[] = [];
    const { x, y, width, height } = room.coords;
    
    // Only show lighting points in lighting view
    if (viewMode !== 'lighting') return [];
    
    // For rectangular rooms, create a grid of lighting fixtures
    const fixturesCount = room.actualFixtures || 0;
    
    if (fixturesCount <= 0) return [];
    
    // Calculate grid dimensions - try to make it square-ish
    const aspectRatio = width / height;
    let cols = Math.round(Math.sqrt(fixturesCount * aspectRatio));
    let rows = Math.round(fixturesCount / cols);
    
    // Adjust if needed
    while (cols * rows < fixturesCount) {
      cols += 1;
    }
    
    // Calculate spacing
    const spacingX = width / (cols + 1);
    const spacingY = height / (rows + 1);
    
    // Generate grid of points
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        // Don't add more points than fixtures
        if (points.length >= fixturesCount) break;
        
        const pointX = x - width/2 + c * spacingX;
        const pointY = y - height/2 + r * spacingY;
        
        points.push({
          x: pointX,
          y: pointY,
          intensity: 1.0 // Full intensity
        });
      }
    }
    
    return points;
  };
  
  // Initialize canvas once rendered
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    if (width > 0 && height > 0) {
      canvas.width = width;
      canvas.height = height;
      setCanvasReady(true);
    } else {
      console.warn('Invalid dimensions for lighting simulation:', { width, height });
      setCanvasReady(false);
    }
  }, [width, height]);
  
  // Render the lighting simulation
  useEffect(() => {
    // Skip rendering if not in lighting mode
    if (viewMode !== 'lighting') return;
    
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Verify canvas dimensions are valid
    if (canvas.width <= 0 || canvas.height <= 0) {
      console.warn('Invalid canvas dimensions for lighting simulation:', { 
        width: canvas.width, 
        height: canvas.height 
      });
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Direct rendering approach without off-screen canvas
    roomData.forEach(room => {
      // Skip rooms without actual fixtures or required lux
      if (!room.actualFixtures || !room.requiredLux) return;
      
      // Get lighting points for the room
      const lightingPoints = calculateLightingPoints(room);
      
      // Fill the room with base lighting color
      const actualLux = room.actualFixtures * 100; // Simplified calculation
      const lightingColor = getLightingColor(actualLux, room.requiredLux);
      
      ctx.save();
      
      // Define clipping region for the room
      ctx.beginPath();
      
      if (room.shape === 'polygon' && room.points && room.points.length >= 3) {
        // Draw polygon path
        ctx.moveTo(room.points[0].x, room.points[0].y);
        for (let i = 1; i < room.points.length; i++) {
          ctx.lineTo(room.points[i].x, room.points[i].y);
        }
      } else {
        // Draw rectangle
        ctx.rect(
          room.coords.x - room.coords.width / 2,
          room.coords.y - room.coords.height / 2,
          room.coords.width,
          room.coords.height
        );
      }
      
      ctx.closePath();
      ctx.clip();
      
      // Fill with room lighting level color
      ctx.fillStyle = lightingColor;
      ctx.fillRect(
        room.coords.x - room.coords.width / 2,
        room.coords.y - room.coords.height / 2,
        room.coords.width,
        room.coords.height
      );
      
      // Draw light sources
      lightingPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, 30
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 30, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    });
    
    // Highlight selected room if any
    if (selectedRoomId) {
      const selectedRoom = roomData.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          selectedRoom.coords.x - selectedRoom.coords.width / 2 - 5,
          selectedRoom.coords.y - selectedRoom.coords.height / 2 - 5,
          selectedRoom.coords.width + 10,
          selectedRoom.coords.height + 10
        );
      }
    }
  }, [roomData, selectedRoomId, width, height, viewMode, canvasReady]);
  
  // Only render in lighting mode
  if (viewMode !== 'lighting') {
    return null;
  }
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {/* Only render canvas if dimensions are valid */}
      {width > 0 && height > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      )}
      
      {/* Legend */}
      <Paper 
        elevation={3}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          padding: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          maxWidth: 180
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
          Lighting Levels
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(0, 255, 0, 0.7)', mr: 1 }} />
          <Typography variant="caption">Above required</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(144, 238, 144, 0.7)', mr: 1 }} />
          <Typography variant="caption">Good (90-120%)</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(255, 255, 0, 0.7)', mr: 1 }} />
          <Typography variant="caption">Acceptable (70-90%)</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(255, 165, 0, 0.7)', mr: 1 }} />
          <Typography variant="caption">Low (50-70%)</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(255, 0, 0, 0.7)', mr: 1 }} />
          <Typography variant="caption">Critical (&lt;50%)</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LightingSimulation; 