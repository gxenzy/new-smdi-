/**
 * Color Blindness Simulation Utilities
 * 
 * This file contains utilities for simulating different types of color blindness and
 * applying these simulations to chart colors.
 */

/**
 * Types of color blindness that can be simulated
 */
export enum ColorBlindnessType {
  NONE = 'none',
  PROTANOPIA = 'protanopia', // Red-blind
  DEUTERANOPIA = 'deuteranopia', // Green-blind
  TRITANOPIA = 'tritanopia', // Blue-blind
  ACHROMATOPSIA = 'achromatopsia', // Monochromacy
  PROTANOMALY = 'protanomaly', // Red-weak
  DEUTERANOMALY = 'deuteranomaly', // Green-weak
  TRITANOMALY = 'tritanomaly' // Blue-weak
}

/**
 * Human-readable labels for color blindness types
 */
export const colorBlindnessLabels = {
  [ColorBlindnessType.NONE]: 'Normal Vision',
  [ColorBlindnessType.PROTANOPIA]: 'Protanopia (Red-Blind)',
  [ColorBlindnessType.DEUTERANOPIA]: 'Deuteranopia (Green-Blind)',
  [ColorBlindnessType.TRITANOPIA]: 'Tritanopia (Blue-Blind)',
  [ColorBlindnessType.ACHROMATOPSIA]: 'Achromatopsia (Monochromacy)',
  [ColorBlindnessType.PROTANOMALY]: 'Protanomaly (Red-Weak)',
  [ColorBlindnessType.DEUTERANOMALY]: 'Deuteranomaly (Green-Weak)',
  [ColorBlindnessType.TRITANOMALY]: 'Tritanomaly (Blue-Weak)'
};

/**
 * Interface for RGB color
 */
interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Parse a CSS color string to RGB components
 */
export const parseColor = (color: string): RGB => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const values = color
      .replace(/rgba?\(|\)/g, '')
      .split(',')
      .map(value => parseFloat(value.trim()));
    
    return {
      r: values[0],
      g: values[1],
      b: values[2],
      a: values.length === 4 ? values[3] : undefined
    };
  }
  
  // Default to black if color format not recognized
  console.warn(`Unrecognized color format: ${color}`);
  return { r: 0, g: 0, b: 0 };
};

/**
 * Convert RGB to hexadecimal string
 */
export const rgbToHex = (rgb: RGB): string => {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  // Include alpha if it exists
  if (rgb.a !== undefined && rgb.a < 1) {
    const alpha = Math.round(rgb.a * 255);
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}${toHex(alpha)}`;
  }
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

/**
 * Convert RGB to rgba string
 */
export const rgbToRgbaString = (rgb: RGB): string => {
  if (rgb.a !== undefined) {
    return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.a})`;
  }
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
};

/**
 * Transformation matrices for different types of color blindness
 * Source: http://www.daltonize.org/2010/05/matrices-for-daltonization-in-daltonize.html
 */
const colorBlindnessMatrices = {
  [ColorBlindnessType.PROTANOPIA]: [
    [0.567, 0.433, 0.000],
    [0.558, 0.442, 0.000],
    [0.000, 0.242, 0.758]
  ],
  [ColorBlindnessType.DEUTERANOPIA]: [
    [0.625, 0.375, 0.000],
    [0.700, 0.300, 0.000],
    [0.000, 0.300, 0.700]
  ],
  [ColorBlindnessType.TRITANOPIA]: [
    [0.950, 0.050, 0.000],
    [0.000, 0.433, 0.567],
    [0.000, 0.475, 0.525]
  ],
  [ColorBlindnessType.ACHROMATOPSIA]: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ],
  [ColorBlindnessType.PROTANOMALY]: [
    [0.817, 0.183, 0.000],
    [0.333, 0.667, 0.000],
    [0.000, 0.125, 0.875]
  ],
  [ColorBlindnessType.DEUTERANOMALY]: [
    [0.800, 0.200, 0.000],
    [0.258, 0.742, 0.000],
    [0.000, 0.142, 0.858]
  ],
  [ColorBlindnessType.TRITANOMALY]: [
    [0.967, 0.033, 0.000],
    [0.000, 0.733, 0.267],
    [0.000, 0.183, 0.817]
  ]
};

/**
 * Apply color blindness simulation to an RGB color
 */
export const simulateColorBlindness = (
  rgb: RGB, 
  type: ColorBlindnessType
): RGB => {
  // Return original color if no simulation required
  if (type === ColorBlindnessType.NONE) {
    return rgb;
  }
  
  // Get transformation matrix for this type
  const matrix = colorBlindnessMatrices[type];
  if (!matrix) {
    console.warn(`No color blindness matrix for type: ${type}`);
    return rgb;
  }
  
  // Apply matrix transformation
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const simR = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
  const simG = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
  const simB = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
  
  // Convert back to 0-255 range
  return {
    r: Math.min(255, Math.max(0, simR * 255)),
    g: Math.min(255, Math.max(0, simG * 255)),
    b: Math.min(255, Math.max(0, simB * 255)),
    a: rgb.a
  };
};

/**
 * Apply color blindness simulation to a CSS color string
 */
export const simulateColorString = (
  color: string,
  type: ColorBlindnessType
): string => {
  const rgb = parseColor(color);
  const simulated = simulateColorBlindness(rgb, type);
  
  // Return in the same format as input
  if (color.startsWith('#')) {
    return rgbToHex(simulated);
  }
  return rgbToRgbaString(simulated);
};

/**
 * Apply color blindness simulation to an array of colors
 */
export const simulateColorArray = (
  colors: string[],
  type: ColorBlindnessType
): string[] => {
  return colors.map(color => simulateColorString(color, type));
};

/**
 * Get highly distinguishable colors for a specific color blindness type
 * These colors are chosen to be distinguishable even with color blindness
 */
export const getAccessibleColorSet = (
  type: ColorBlindnessType,
  count: number = 10
): string[] => {
  // Base set of accessible colors for all types of color blindness
  const baseColors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#0072B2', // Blue
    '#E69F00', // Orange
    '#56B4E9', // Light blue
    '#009E73', // Green
    '#F0E442', // Yellow
    '#D55E00', // Red/orange
    '#CC79A7', // Pink
    '#999999'  // Grey
  ];
  
  // For monochromacy (complete color blindness), use patterns instead of colors
  if (type === ColorBlindnessType.ACHROMATOPSIA) {
    return [
      '#000000', // Black
      '#FFFFFF', // White
      '#333333', // Dark grey
      '#666666', // Medium grey
      '#999999', // Light grey
      '#CCCCCC', // Very light grey
      '#111111', // Very dark grey
      '#555555', // Another dark grey
      '#AAAAAA', // Another light grey
      '#EEEEEE'  // Almost white
    ];
  }
  
  // For other types, return the base set
  return baseColors.slice(0, count);
};

/**
 * Apply color blindness simulation to a Chart.js configuration
 * Note: This modifies the configuration object
 */
export const simulateChartColors = (
  chartConfig: any,
  type: ColorBlindnessType
): any => {
  if (type === ColorBlindnessType.NONE) {
    return chartConfig;
  }
  
  // Create a deep copy to avoid modifying the original
  const config = JSON.parse(JSON.stringify(chartConfig));
  
  // Process datasets
  if (config.data && config.data.datasets) {
    config.data.datasets.forEach((dataset: any) => {
      // Handle backgroundColor
      if (dataset.backgroundColor) {
        if (Array.isArray(dataset.backgroundColor)) {
          dataset.backgroundColor = simulateColorArray(dataset.backgroundColor, type);
        } else if (typeof dataset.backgroundColor === 'string') {
          dataset.backgroundColor = simulateColorString(dataset.backgroundColor, type);
        }
      }
      
      // Handle borderColor
      if (dataset.borderColor) {
        if (Array.isArray(dataset.borderColor)) {
          dataset.borderColor = simulateColorArray(dataset.borderColor, type);
        } else if (typeof dataset.borderColor === 'string') {
          dataset.borderColor = simulateColorString(dataset.borderColor, type);
        }
      }
      
      // Handle pointBackgroundColor
      if (dataset.pointBackgroundColor) {
        if (Array.isArray(dataset.pointBackgroundColor)) {
          dataset.pointBackgroundColor = simulateColorArray(
            dataset.pointBackgroundColor, 
            type
          );
        } else if (typeof dataset.pointBackgroundColor === 'string') {
          dataset.pointBackgroundColor = simulateColorString(
            dataset.pointBackgroundColor, 
            type
          );
        }
      }
      
      // Handle other color properties as needed
    });
  }
  
  return config;
};

/**
 * Generate an accessible color palette for charts based on color blindness type
 */
export const generateAccessibleChartPalette = (
  type: ColorBlindnessType,
  count: number = 10
): string[] => {
  // Get a base accessible color set
  const accessibleColors = getAccessibleColorSet(type, count);
  
  // If we need more colors than the base set, generate them
  if (count > accessibleColors.length) {
    // Create additional colors with varying luminance
    const additionalColors: string[] = [];
    const baseCount = accessibleColors.length;
    
    for (let i = 0; i < count - baseCount; i++) {
      // Get a base color and modify its luminance
      const baseIndex = i % baseCount;
      const baseRgb = parseColor(accessibleColors[baseIndex]);
      
      // Adjust luminance based on position
      const luminanceAdjust = 0.2 + (i / (count - baseCount)) * 0.6;
      const adjustedRgb = {
        r: Math.min(255, baseRgb.r * luminanceAdjust),
        g: Math.min(255, baseRgb.g * luminanceAdjust),
        b: Math.min(255, baseRgb.b * luminanceAdjust)
      };
      
      additionalColors.push(rgbToHex(adjustedRgb));
    }
    
    return [...accessibleColors, ...additionalColors];
  }
  
  return accessibleColors.slice(0, count);
}; 