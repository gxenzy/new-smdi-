import BuildingVisualization from './components/BuildingVisualization';

// Re-export all interfaces and utils for external usage
export * from './interfaces/buildingInterfaces';
export * from './utils/typeGuards';

/**
 * Export the BuildingVisualization component
 * 
 * This represents a complete implementation of the floor plan visualization
 * functionality including:
 * 
 * - Floor plan visualization
 * - Room detection
 * - Energy analysis
 * - Interactive controls
 * - Fullscreen mode
 */
export default BuildingVisualization; 