import React, { useRef, useEffect, useState } from 'react';
import { 
  useTheme, 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Tooltip, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Stack,
  SelectChangeEvent 
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { UnifiedCircuitData } from './utils/CircuitSynchronization';
import { VoltageDropCalculationResult } from './utils/voltageDropRecalculator';
import { generateCircuitDiagram, CircuitDiagramData, CircuitComponent } from './utils/circuitDiagramUtils';

export interface CircuitDiagramProps {
  circuitData: UnifiedCircuitData;
  voltageDropResult: VoltageDropCalculationResult;
  highlightMode?: 'voltage' | 'current' | 'power';
  showAnimation?: boolean;
  animationSpeed?: number;
  showLabels?: boolean;
  interactive?: boolean;
  height?: number;
  width?: number;
  onComponentClick?: (componentId: string) => void;
}

/**
 * CircuitDiagram component renders a visual representation of an electrical circuit
 * with voltage drop indicators at key points
 */
const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  circuitData,
  voltageDropResult,
  highlightMode = 'voltage',
  showAnimation = false,
  animationSpeed = 1,
  showLabels = true,
  interactive = true,
  height = 300,
  width = 800,
  onComponentClick
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // State for diagram data, animation, zoom, etc.
  const [diagramData, setDiagramData] = useState<CircuitDiagramData | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(showAnimation);
  const [animationFrame, setAnimationFrame] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  
  // Get colors from theme
  const sourceColor = theme.palette.primary.main;
  const loadColor = theme.palette.secondary.main;
  const conductorColor = theme.palette.text.secondary;
  const compliantColor = theme.palette.success.main;
  const nonCompliantColor = theme.palette.error.main;
  const backgroundColor = theme.palette.background.paper;
  
  // Generate circuit diagram data when circuit data or result changes
  useEffect(() => {
    if (circuitData && voltageDropResult) {
      const diagram = generateCircuitDiagram(circuitData, voltageDropResult);
      setDiagramData(diagram);
    }
  }, [circuitData, voltageDropResult]);
  
  // Handle animation
  useEffect(() => {
    if (!isAnimating || !diagramData) return;
    
    // Set up animation loop
    const framesPerSecond = 30;
    const animationDuration = 3; // seconds for one complete cycle
    const totalFrames = framesPerSecond * animationDuration;
    
    const animationTimer = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % totalFrames);
    }, 1000 / (framesPerSecond * animationSpeed));
    
    return () => {
      clearInterval(animationTimer);
    };
  }, [isAnimating, diagramData, animationSpeed]);
  
  // Handle zoom level change
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Handle highlight mode change
  const handleHighlightModeChange = (event: SelectChangeEvent<string>) => {
    const mode = event.target.value as 'voltage' | 'current' | 'power';
    // The parent component should handle this through props update
    // This is just a placeholder for the component interface
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };
  
  // Reset animation
  const resetAnimation = () => {
    setAnimationFrame(0);
    setIsAnimating(true);
  };
  
  // Handle component click
  const handleComponentClick = (componentId: string) => {
    setSelectedComponent(componentId);
    if (onComponentClick) {
      onComponentClick(componentId);
    }
  };
  
  // Render component based on its type
  const renderComponent = (component: CircuitComponent) => {
    const { id, type, position, size, properties, voltage, isCompliant } = component;
    
    // Determine color based on highlight mode and component properties
    let fillColor = conductorColor;
    if (type === 'source') {
      fillColor = sourceColor;
    } else if (type === 'load') {
      fillColor = loadColor;
    } else if (highlightMode === 'voltage' && voltage !== undefined && isCompliant !== undefined) {
      fillColor = isCompliant ? compliantColor : nonCompliantColor;
    }
    
    // Determine opacity based on selection/hover state
    const opacity = 
      selectedComponent === id || hoveredComponent === id 
        ? 1 
        : (selectedComponent ? 0.6 : 0.9);
    
    // Render different shapes based on component type
    switch (type) {
      case 'source':
        return (
          <g 
            key={id}
            onClick={() => handleComponentClick(id)}
            onMouseEnter={() => setHoveredComponent(id)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <rect
              x={position.x}
              y={position.y}
              width={size.width}
              height={size.height}
              fill={fillColor}
              stroke={theme.palette.divider}
              strokeWidth={2}
              opacity={opacity}
              rx={2}
              ry={2}
            />
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height + 20}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={12}
              >
                Source ({properties.voltage || ''}V)
              </text>
            )}
          </g>
        );
        
      case 'conductor':
        // For conductors, we'll draw a line
        return (
          <g 
            key={id}
            onClick={() => handleComponentClick(id)}
            onMouseEnter={() => setHoveredComponent(id)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <line
              x1={position.x}
              y1={position.y + size.height / 2}
              x2={position.x + size.width}
              y2={position.y + size.height / 2}
              stroke={fillColor}
              strokeWidth={Math.max(2, size.height / 3)}
              opacity={opacity}
            />
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height + 20}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={12}
              >
                {properties.size || ''} {properties.material || ''}
              </text>
            )}
            
            {/* Add animation dots for current flow if animating */}
            {isAnimating && (
              <>
                {[...Array(Math.ceil(size.width / 50))].map((_, index) => {
                  const dotPosition = 
                    ((position.x + (index * 50) + (animationFrame * 2)) % (size.width)) + position.x;
                  
                  // Only show dots that are within the conductor
                  if (dotPosition >= position.x && dotPosition <= position.x + size.width) {
                    return (
                      <circle
                        key={`dot-${id}-${index}`}
                        cx={dotPosition}
                        cy={position.y + size.height / 2}
                        r={4}
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
          </g>
        );
        
      case 'load':
        return (
          <g 
            key={id}
            onClick={() => handleComponentClick(id)}
            onMouseEnter={() => setHoveredComponent(id)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <rect
              x={position.x}
              y={position.y}
              width={size.width}
              height={size.height}
              fill={fillColor}
              stroke={theme.palette.divider}
              strokeWidth={2}
              opacity={opacity}
              rx={4}
              ry={4}
            />
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme.palette.background.paper}
                fontSize={12}
                fontWeight="bold"
              >
                Load
              </text>
            )}
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height + 20}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={12}
              >
                {properties.description || ''} ({properties.current || ''}A)
              </text>
            )}
          </g>
        );
        
      case 'junction':
        return (
          <g 
            key={id}
            onClick={() => handleComponentClick(id)}
            onMouseEnter={() => setHoveredComponent(id)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <circle
              cx={position.x + size.width / 2}
              cy={position.y + size.height / 2}
              r={size.width / 2}
              fill={fillColor}
              stroke={theme.palette.divider}
              strokeWidth={1}
              opacity={opacity}
            />
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height + 15}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={10}
              >
                Junction
              </text>
            )}
          </g>
        );
        
      case 'device':
        // For devices, we'll use a special symbol based on the device type
        return (
          <g 
            key={id}
            onClick={() => handleComponentClick(id)}
            onMouseEnter={() => setHoveredComponent(id)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <rect
              x={position.x}
              y={position.y}
              width={size.width}
              height={size.height}
              fill={fillColor}
              stroke={theme.palette.divider}
              strokeWidth={1}
              opacity={opacity}
              rx={2}
              ry={2}
            />
            {showLabels && (
              <text
                x={position.x + size.width / 2}
                y={position.y + size.height + 15}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontSize={10}
              >
                {properties.deviceType || 'Device'}
              </text>
            )}
          </g>
        );
        
      default:
        return null;
    }
  };
  
  // Render connections between components
  const renderConnections = () => {
    if (!diagramData) return null;
    
    return diagramData.connections.map((connection, index) => {
      // Find the connected components
      const fromComponent = diagramData.components.find(comp => comp.id === connection.from);
      const toComponent = diagramData.components.find(comp => comp.id === connection.to);
      
      if (!fromComponent || !toComponent) return null;
      
      // Calculate connection points
      const fromX = fromComponent.position.x + fromComponent.size.width;
      const fromY = fromComponent.position.y + fromComponent.size.height / 2;
      const toX = toComponent.position.x;
      const toY = toComponent.position.y + toComponent.size.height / 2;
      
      // If there's a custom path, use it
      if (connection.path && connection.path.length > 0) {
        // Create SVG path command
        let pathCommand = `M ${fromX} ${fromY}`;
        connection.path.forEach(point => {
          pathCommand += ` L ${point.x} ${point.y}`;
        });
        pathCommand += ` L ${toX} ${toY}`;
        
        return (
          <path
            key={`connection-${index}`}
            d={pathCommand}
            stroke={theme.palette.text.secondary}
            strokeWidth={1}
            fill="none"
          />
        );
      }
      
      // Otherwise, draw a simple line
      return (
        <line
          key={`connection-${index}`}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={theme.palette.text.secondary}
          strokeWidth={1}
        />
      );
    });
  };
  
  // Calculate viewBox based on diagram data and zoom level
  const calculateViewBox = () => {
    if (!diagramData || diagramData.components.length === 0) {
      return "0 0 800 300";
    }
    
    // Find the bounding box of all components
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    diagramData.components.forEach(component => {
      const { position, size } = component;
      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + size.width);
      maxY = Math.max(maxY, position.y + size.height);
    });
    
    // Add some padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding + (showLabels ? 30 : 0); // Extra space for labels
    
    // Apply zoom
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = (maxX - minX) / zoomLevel;
    const height = (maxY - minY) / zoomLevel;
    
    // Calculate new viewBox corners
    const viewMinX = centerX - width / 2;
    const viewMinY = centerY - height / 2;
    
    return `${viewMinX} ${viewMinY} ${width} ${height}`;
  };
  
  // Render voltage, current, or power indicators
  const renderIndicators = () => {
    if (!diagramData || !voltageDropResult) return null;
    
    switch (highlightMode) {
      case 'voltage':
        // Add voltage indicators at key points
        return diagramData.components
          .filter(comp => comp.voltage !== undefined && comp.type !== 'source')
          .map(comp => {
            const isCompliant = comp.isCompliant || false;
            const color = isCompliant ? compliantColor : nonCompliantColor;
            const voltage = comp.voltage || 0;
            
            return (
              <g key={`voltage-${comp.id}`}>
                <circle
                  cx={comp.position.x}
                  cy={comp.position.y - 15}
                  r={10}
                  fill={color}
                  opacity={0.6}
                />
                <text
                  x={comp.position.x}
                  y={comp.position.y - 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme.palette.background.paper}
                  fontSize={8}
                  fontWeight="bold"
                >
                  {voltage.toFixed(0)}V
                </text>
              </g>
            );
          });
      
      case 'current':
        // Add current indicators
        return diagramData.components
          .filter(comp => comp.current !== undefined)
          .map(comp => {
            const current = comp.current || 0;
            
            return (
              <g key={`current-${comp.id}`}>
                <rect
                  x={comp.position.x + comp.size.width / 2 - 15}
                  y={comp.position.y - 20}
                  width={30}
                  height={15}
                  fill={theme.palette.info.main}
                  opacity={0.6}
                  rx={3}
                  ry={3}
                />
                <text
                  x={comp.position.x + comp.size.width / 2}
                  y={comp.position.y - 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme.palette.background.paper}
                  fontSize={8}
                  fontWeight="bold"
                >
                  {current.toFixed(1)}A
                </text>
              </g>
            );
          });
      
      case 'power':
        // Add power loss indicators
        return diagramData.components
          .filter(comp => comp.powerLoss !== undefined)
          .map(comp => {
            const powerLoss = comp.powerLoss || 0;
            
            return (
              <g key={`power-${comp.id}`}>
                <polygon
                  points={`
                    ${comp.position.x + comp.size.width / 2},${comp.position.y - 25}
                    ${comp.position.x + comp.size.width / 2 - 15},${comp.position.y - 10}
                    ${comp.position.x + comp.size.width / 2 + 15},${comp.position.y - 10}
                  `}
                  fill={theme.palette.warning.main}
                  opacity={0.6}
                />
                <text
                  x={comp.position.x + comp.size.width / 2}
                  y={comp.position.y - 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme.palette.background.paper}
                  fontSize={8}
                  fontWeight="bold"
                >
                  {powerLoss.toFixed(1)}W
                </text>
              </g>
            );
          });
      
      default:
        return null;
    }
  };
  
  // Render voltage drop gradient along conductors
  const renderVoltageGradients = () => {
    if (!diagramData || highlightMode !== 'voltage') return null;
    
    // Find conductor components
    const conductors = diagramData.components.filter(comp => comp.type === 'conductor');
    
    // Define gradients for each conductor
    return (
      <>
        {/* Define gradients */}
        <defs>
          {conductors.map(conductor => {
            // Check if conductor has voltage information
            if (conductor.voltage === undefined) return null;
            
            const isCompliant = conductor.isCompliant || false;
            const startColor = sourceColor;
            const endColor = isCompliant ? compliantColor : nonCompliantColor;
            
            return (
              <linearGradient
                key={`gradient-${conductor.id}`}
                id={`gradient-${conductor.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            );
          })}
        </defs>
        
        {/* Apply gradients to conductors */}
        {conductors.map(conductor => {
          if (conductor.voltage === undefined) return null;
          
          return (
            <line
              key={`voltage-gradient-${conductor.id}`}
              x1={conductor.position.x}
              y1={conductor.position.y + conductor.size.height / 2}
              x2={conductor.position.x + conductor.size.width}
              y2={conductor.position.y + conductor.size.height / 2}
              stroke={`url(#gradient-${conductor.id})`}
              strokeWidth={Math.max(2, conductor.size.height / 2)}
              opacity={0.6}
            />
          );
        })}
      </>
    );
  };
  
  return (
    <Paper elevation={1} sx={{ p: 2, height: height + 80, width: '100%', maxWidth: width }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">
          Circuit Diagram
          <Tooltip title="Visualizes voltage drop at different points in the circuit">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Controls for animation and zoom */}
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          {showAnimation && (
            <>
              <Tooltip title={isAnimating ? "Pause Animation" : "Play Animation"}>
                <IconButton onClick={toggleAnimation} size="small">
                  {isAnimating ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Animation">
                <IconButton onClick={resetAnimation} size="small">
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {/* Highlight mode selector */}
          <FormControl size="small" sx={{ ml: 2, minWidth: 120 }}>
            <InputLabel id="highlight-mode-label">Highlight</InputLabel>
            <Select
              labelId="highlight-mode-label"
              value={highlightMode}
              label="Highlight"
              onChange={handleHighlightModeChange}
              size="small"
            >
              <MenuItem value="voltage">Voltage</MenuItem>
              <MenuItem value="current">Current</MenuItem>
              <MenuItem value="power">Power Loss</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* SVG circuit diagram */}
      <Box 
        sx={{ 
          width: '100%', 
          height, 
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          backgroundColor
        }}
      >
        {diagramData ? (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={calculateViewBox()}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Render voltage gradients */}
            {renderVoltageGradients()}
            
            {/* Render connections between components */}
            {renderConnections()}
            
            {/* Render circuit components */}
            {diagramData.components.map(renderComponent)}
            
            {/* Render indicators */}
            {renderIndicators()}
          </svg>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No circuit data available
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Component details if a component is selected */}
      {selectedComponent && diagramData && (
        <Box sx={{ mt: 1, p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          <Typography variant="subtitle2">
            {diagramData.components.find(c => c.id === selectedComponent)?.properties.description || 'Component Details'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {diagramData.components.find(c => c.id === selectedComponent)?.type || 'Unknown'} - 
            {diagramData.components.find(c => c.id === selectedComponent)?.properties.size || ''} 
            {diagramData.components.find(c => c.id === selectedComponent)?.properties.material || ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CircuitDiagram; 