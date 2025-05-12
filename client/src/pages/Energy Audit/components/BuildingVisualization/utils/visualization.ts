/**
 * Utility functions for visual aspects of the BuildingVisualization component
 */

/**
 * Convert hex color to rgba
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  const hexValue = hex.replace('#', '');
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get color for different compliance levels
 */
export const getComplianceColor = (compliancePercentage: number): string => {
  if (compliancePercentage >= 85) {
    return '#4CAF50'; // Green (success)
  } else if (compliancePercentage >= 70) {
    return '#FFC107'; // Yellow (warning)
  } else {
    return '#F44336'; // Red (error)
  }
};

/**
 * Get energy efficiency rating
 */
export const getEnergyEfficiencyRating = (energyIntensity: number, roomType: string): string => {
  // Energy intensity thresholds by room type (kWh/m²)
  const efficiencyThresholds: {[key: string]: {excellent: number, good: number, fair: number}} = {
    'office': {excellent: 8, good: 12, fair: 16},
    'conference': {excellent: 10, good: 14, fair: 18},
    'restroom': {excellent: 6, good: 10, fair: 14},
    'kitchen': {excellent: 15, good: 20, fair: 25},
    'storage': {excellent: 4, good: 8, fair: 12},
    'electrical': {excellent: 5, good: 10, fair: 15},
    'hallway': {excellent: 5, good: 9, fair: 13},
    'default': {excellent: 8, good: 12, fair: 16}
  };
  
  const thresholds = efficiencyThresholds[roomType] || efficiencyThresholds.default;
  
  if (energyIntensity <= thresholds.excellent) {
    return 'Excellent';
  } else if (energyIntensity <= thresholds.good) {
    return 'Good';
  } else if (energyIntensity <= thresholds.fair) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

/**
 * Calculate scale factor for floor plan
 */
export const calculateScaleFactor = (
  containerWidth: number, 
  containerHeight: number, 
  imageWidth: number, 
  imageHeight: number
): number => {
  const widthRatio = containerWidth / imageWidth;
  const heightRatio = containerHeight / imageHeight;
  
  // Use the smaller ratio to ensure the image fits completely
  return Math.min(widthRatio, heightRatio);
};

/**
 * Position element within a container
 */
export const positionElement = (
  element: HTMLElement, 
  x: number, 
  y: number, 
  containerRect: DOMRect
): void => {
  // Keep the element within the container bounds
  const elementRect = element.getBoundingClientRect();
  const halfWidth = elementRect.width / 2;
  const halfHeight = elementRect.height / 2;
  
  let newX = x;
  let newY = y;
  
  // Limit x position
  if (newX - halfWidth < 0) {
    newX = halfWidth;
  } else if (newX + halfWidth > containerRect.width) {
    newX = containerRect.width - halfWidth;
  }
  
  // Limit y position
  if (newY - halfHeight < 0) {
    newY = halfHeight;
  } else if (newY + halfHeight > containerRect.height) {
    newY = containerRect.height - halfHeight;
  }
  
  // Apply position
  element.style.left = `${newX}px`;
  element.style.top = `${newY}px`;
}; 