import * as pattern from 'patternomaly';

/**
 * Pattern types available in patternomaly
 */
export type PatternType = 
  | 'plus'
  | 'cross'
  | 'dash'
  | 'cross-dash'
  | 'dot'
  | 'dot-dash'
  | 'disc'
  | 'ring'
  | 'line'
  | 'line-vertical'
  | 'weave'
  | 'zigzag'
  | 'zigzag-vertical'
  | 'diagonal'
  | 'diagonal-right-left'
  | 'square'
  | 'box'
  | 'triangle'
  | 'triangle-inverted'
  | 'diamond'
  | 'diamond-box';

/**
 * Configuration for pattern fills
 */
export interface PatternFillConfig {
  backgroundColor: string;
  patternColor: string;
  patternType: PatternType;
  patternSize?: number;
}

/**
 * Default pattern types to use in sequence for chart datasets
 */
export const DEFAULT_PATTERN_SEQUENCE: PatternType[] = [
  'line',         // Horizontal lines - very distinct
  'line-vertical', // Vertical lines - also very distinct
  'diagonal',     // Diagonal lines - distinct from horizontal/vertical
  'cross',        // Cross pattern - very visible
  'dot',          // Dots - distinct from lines
  'diamond',      // Diamond pattern - distinct shape
  'zigzag',       // Zigzag pattern - clearly different
  'triangle',     // Triangle pattern - distinct shape
  'square',       // Square pattern - simple and clear
  'plus',         // Plus pattern - distinct from crosses
  'disc',         // Filled circles - good contrast
  'ring',         // Rings - hollow circles
  'weave',        // Weave pattern - complex but visible
  'zigzag-vertical' // Vertical zigzag - alternative to horizontal
];

/**
 * Create a pattern fill using patternomaly
 */
export const createPatternFill = (config: PatternFillConfig): CanvasPattern => {
  const { backgroundColor, patternColor, patternType, patternSize = 20 } = config;
  return pattern.draw(patternType, patternColor, backgroundColor, patternSize);
};

/**
 * Generate a sequence of pattern fills for chart datasets
 * @param colors Array of colors to use as pattern colors
 * @param backgroundColor Background color for the patterns
 * @param customPatterns Optional custom pattern sequence
 * @returns Array of CanvasPattern objects
 */
export const generatePatternSequence = (
  colors: string[],
  backgroundColor: string,
  customPatterns?: PatternType[]
): CanvasPattern[] => {
  const patternTypes = customPatterns || DEFAULT_PATTERN_SEQUENCE;
  
  return colors.map((color, index) => {
    const patternType = patternTypes[index % patternTypes.length];
    return createPatternFill({
      backgroundColor,
      patternColor: color,
      patternType,
      patternSize: 15 // Slightly smaller than default for better visibility in charts
    });
  });
};

/**
 * Apply pattern fills to Chart.js dataset background colors
 * @param datasets Chart.js datasets array
 * @param colors Color array to use for patterns
 * @param backgroundColor Background color for patterns
 * @returns Updated datasets array with pattern fills
 */
export const applyPatternFillsToDatasets = (
  datasets: any[],
  colors: string[],
  backgroundColor: string = '#000000'
): any[] => {
  if (!datasets || datasets.length === 0) {
    return datasets;
  }
  
  // Generate patterns for each color
  const patterns = generatePatternSequence(colors, backgroundColor);
  
  // Clone datasets to avoid modifying the original
  const updatedDatasets = [...datasets];
  
  // Apply patterns to each dataset
  updatedDatasets.forEach((dataset, index) => {
    const patternIndex = index % patterns.length;
    
    // Handle both array and single color backgrounds
    if (Array.isArray(dataset.backgroundColor)) {
      dataset.backgroundColor = dataset.backgroundColor.map((_: any, i: number) => 
        patterns[(patternIndex + i) % patterns.length]
      );
    } else {
      dataset.backgroundColor = patterns[patternIndex];
    }
  });
  
  return updatedDatasets;
}; 