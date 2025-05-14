import React from 'react';
import BuildingVisualizationImpl from './BuildingVisualizationImpl';
import { BuildingProvider } from './contexts/BuildingContext';

/**
 * BuildingVisualization component for energy audit application
 * Provides visualization and analysis tools for building floor plans
 * 
 * Features include:
 * - Fast room detection from floor plan images
 * - Interactive room positioning and editing with polygon support
 * - Energy consumption calculation and visualization
 * - Room illumination requirements based on PEC standards
 * - Load schedule analysis with compliance tracking
 * - Real-time lighting simulation
 */
const BuildingVisualization: React.FC = () => {
  return (
    <BuildingProvider>
      <BuildingVisualizationImpl />
    </BuildingProvider>
  );
};

export default BuildingVisualization;
