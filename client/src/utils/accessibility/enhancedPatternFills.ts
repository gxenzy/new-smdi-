/**
 * Enhanced Pattern Fills Utility
 * 
 * This file provides enhanced pattern fill capabilities for charts, extending
 * the basic patternomaly implementation with:
 * 1. Composite patterns that combine multiple patterns for better distinction
 * 2. Pattern rotation variations
 * 3. Pattern size variations
 * 4. Pattern density variations
 * 5. Optimized pattern sequences for different types of color blindness
 */

import * as pattern from 'patternomaly';
import { PatternType, createPatternFill, PatternFillConfig } from './patternFills';
import { ColorBlindnessType } from './colorBlindnessSimulation';

/**
 * Extended pattern configuration with rotation and other options
 */
export interface EnhancedPatternConfig extends PatternFillConfig {
  /** 
   * Rotation angle in degrees (0-360) 
   * Note: This is applied via canvas transformation
   */
  rotation?: number;
  
  /** 
   * Pattern density multiplier (0.5-2)
   * Lower values create sparser patterns, higher values create denser patterns
   */
  density?: number;
  
  /**
   * Whether to add a border to the pattern elements
   */
  withBorder?: boolean;
  
  /**
   * Border color for pattern elements (if withBorder is true)
   */
  borderColor?: string;

  /**
   * Secondary pattern to overlay (for composite patterns)
   */
  secondaryPattern?: PatternType;
  
  /**
   * Secondary pattern color
   */
  secondaryColor?: string;
}

/**
 * Class to create enhanced patterns with more options
 */
export class EnhancedPatternGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor() {
    // Create a canvas for pattern generation
    this.canvas = document.createElement('canvas');
    this.canvas.width = 40;  // Large enough for rotated patterns
    this.canvas.height = 40;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot get canvas context for pattern generation');
    }
    this.ctx = ctx;
  }
  
  /**
   * Create an enhanced pattern with rotation and other options
   */
  public createPattern(config: EnhancedPatternConfig): CanvasPattern {
    const { 
      backgroundColor, 
      patternColor, 
      patternType, 
      patternSize = 20,
      rotation = 0,
      density = 1,
      withBorder = false,
      borderColor = '#000000',
      secondaryPattern,
      secondaryColor
    } = config;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fill background
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply rotation if needed
    if (rotation !== 0) {
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }
    
    // Calculate adjusted pattern size based on density
    const adjustedSize = patternSize * (1 / density);
    
    // Draw primary pattern
    this.drawPattern(
      patternType, 
      patternColor, 
      adjustedSize, 
      withBorder, 
      borderColor
    );
    
    // Draw secondary pattern if specified
    if (secondaryPattern && secondaryColor) {
      this.drawPattern(
        secondaryPattern, 
        secondaryColor, 
        adjustedSize * 1.5, // Make secondary pattern larger
        false, 
        ''
      );
    }
    
    // Restore context if rotated
    if (rotation !== 0) {
      this.ctx.restore();
    }
    
    // Create pattern from canvas
    const canvasPattern = this.ctx.createPattern(this.canvas, 'repeat');
    if (!canvasPattern) {
      throw new Error('Failed to create canvas pattern');
    }
    
    return canvasPattern;
  }
  
  /**
   * Draw a specific pattern on the canvas
   */
  private drawPattern(
    patternType: PatternType, 
    color: string, 
    size: number,
    withBorder: boolean,
    borderColor: string
  ): void {
    this.ctx.fillStyle = color;
    if (withBorder) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 1;
    }
    
    const center = size / 2;
    
    switch (patternType) {
      case 'plus':
        this.drawPlus(center, center, size / 3, withBorder);
        break;
      case 'cross':
        this.drawCross(center, center, size / 3, withBorder);
        break;
      case 'dash':
        this.drawDash(center, center, size / 2, withBorder);
        break;
      case 'cross-dash':
        this.drawCrossDash(center, center, size / 3, withBorder);
        break;
      case 'dot':
        this.drawDot(center, center, size / 6, withBorder);
        break;
      case 'dot-dash':
        this.drawDotDash(center, center, size / 4, size / 6, withBorder);
        break;
      case 'disc':
        this.drawDisc(center, center, size / 3, withBorder);
        break;
      case 'ring':
        this.drawRing(center, center, size / 3, withBorder);
        break;
      case 'line':
        this.drawLine(center, center, size / 2, 0, withBorder);
        break;
      case 'line-vertical':
        this.drawLine(center, center, size / 2, 90, withBorder);
        break;
      case 'weave':
        this.drawWeave(center, center, size / 2, withBorder);
        break;
      case 'zigzag':
        this.drawZigzag(center, center, size / 2, 0, withBorder);
        break;
      case 'zigzag-vertical':
        this.drawZigzag(center, center, size / 2, 90, withBorder);
        break;
      case 'diagonal':
        this.drawLine(center, center, size / 2, 45, withBorder);
        break;
      case 'diagonal-right-left':
        this.drawLine(center, center, size / 2, 135, withBorder);
        break;
      case 'square':
        this.drawSquare(center, center, size / 3, withBorder);
        break;
      case 'box':
        this.drawBox(center, center, size / 3, withBorder);
        break;
      case 'triangle':
        this.drawTriangle(center, center, size / 3, withBorder);
        break;
      case 'triangle-inverted':
        this.drawTriangleInverted(center, center, size / 3, withBorder);
        break;
      case 'diamond':
        this.drawDiamond(center, center, size / 3, withBorder);
        break;
      case 'diamond-box':
        this.drawDiamondBox(center, center, size / 3, withBorder);
        break;
      default:
        this.drawDot(center, center, size / 4, withBorder);
    }
  }
  
  // Pattern drawing methods
  private drawPlus(x: number, y: number, size: number, withBorder: boolean): void {
    const halfSize = size / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize, y);
    this.ctx.lineTo(x + halfSize, y);
    this.ctx.moveTo(x, y - halfSize);
    this.ctx.lineTo(x, y + halfSize);
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  private drawCross(x: number, y: number, size: number, withBorder: boolean): void {
    const halfSize = size / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize, y - halfSize);
    this.ctx.lineTo(x + halfSize, y + halfSize);
    this.ctx.moveTo(x + halfSize, y - halfSize);
    this.ctx.lineTo(x - halfSize, y + halfSize);
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  private drawDash(x: number, y: number, size: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size / 2, y);
    this.ctx.lineTo(x + size / 2, y);
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  private drawCrossDash(x: number, y: number, size: number, withBorder: boolean): void {
    this.drawCross(x, y, size, withBorder);
    this.drawDash(x, y, size, withBorder);
  }
  
  private drawDot(x: number, y: number, radius: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    if (withBorder) {
      this.ctx.stroke();
    }
  }
  
  private drawDotDash(x: number, y: number, dashSize: number, dotRadius: number, withBorder: boolean): void {
    this.drawDash(x, y, dashSize, withBorder);
    this.drawDot(x, y, dotRadius, withBorder);
  }
  
  private drawDisc(x: number, y: number, radius: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    if (withBorder) {
      this.ctx.stroke();
    }
  }
  
  private drawRing(x: number, y: number, radius: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (withBorder) {
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.stroke();
    }
  }
  
  private drawLine(x: number, y: number, length: number, angle: number, withBorder: boolean): void {
    const radians = (angle * Math.PI) / 180;
    const dx = (length / 2) * Math.cos(radians);
    const dy = (length / 2) * Math.sin(radians);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x - dx, y - dy);
    this.ctx.lineTo(x + dx, y + dy);
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  private drawWeave(x: number, y: number, size: number, withBorder: boolean): void {
    const quarterSize = size / 4;
    
    this.ctx.beginPath();
    // Horizontal lines
    this.ctx.moveTo(x - size / 2, y - quarterSize);
    this.ctx.lineTo(x + size / 2, y - quarterSize);
    this.ctx.moveTo(x - size / 2, y + quarterSize);
    this.ctx.lineTo(x + size / 2, y + quarterSize);
    
    // Vertical lines
    this.ctx.moveTo(x - quarterSize, y - size / 2);
    this.ctx.lineTo(x - quarterSize, y + size / 2);
    this.ctx.moveTo(x + quarterSize, y - size / 2);
    this.ctx.lineTo(x + quarterSize, y + size / 2);
    
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
  }
  
  private drawZigzag(x: number, y: number, size: number, angle: number, withBorder: boolean): void {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    const zigzagWidth = size / 2;
    const zigzagHeight = size / 3;
    
    this.ctx.beginPath();
    this.ctx.moveTo(
      x - zigzagWidth * cos,
      y - zigzagWidth * sin
    );
    this.ctx.lineTo(
      x - zigzagWidth * cos / 2 + zigzagHeight * sin,
      y - zigzagWidth * sin / 2 - zigzagHeight * cos
    );
    this.ctx.lineTo(
      x + zigzagWidth * cos / 2 + zigzagHeight * sin,
      y + zigzagWidth * sin / 2 - zigzagHeight * cos
    );
    this.ctx.lineTo(
      x + zigzagWidth * cos,
      y + zigzagWidth * sin
    );
    
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
  }
  
  private drawSquare(x: number, y: number, size: number, withBorder: boolean): void {
    const halfSize = size / 2;
    this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
    if (withBorder) {
      this.ctx.strokeRect(x - halfSize, y - halfSize, size, size);
    }
  }
  
  private drawBox(x: number, y: number, size: number, withBorder: boolean): void {
    const halfSize = size / 2;
    this.ctx.beginPath();
    this.ctx.rect(x - halfSize, y - halfSize, size, size);
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.stroke();
    }
  }
  
  private drawTriangle(x: number, y: number, size: number, withBorder: boolean): void {
    const height = size * Math.sqrt(3) / 2;
    const halfSize = size / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - height / 2);
    this.ctx.lineTo(x + halfSize, y + height / 2);
    this.ctx.lineTo(x - halfSize, y + height / 2);
    this.ctx.closePath();
    
    this.ctx.fill();
    if (withBorder) {
      this.ctx.stroke();
    }
  }
  
  private drawTriangleInverted(x: number, y: number, size: number, withBorder: boolean): void {
    const height = size * Math.sqrt(3) / 2;
    const halfSize = size / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height / 2);
    this.ctx.lineTo(x + halfSize, y - height / 2);
    this.ctx.lineTo(x - halfSize, y - height / 2);
    this.ctx.closePath();
    
    this.ctx.fill();
    if (withBorder) {
      this.ctx.stroke();
    }
  }
  
  private drawDiamond(x: number, y: number, size: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size / 2);
    this.ctx.lineTo(x + size / 2, y);
    this.ctx.lineTo(x, y + size / 2);
    this.ctx.lineTo(x - size / 2, y);
    this.ctx.closePath();
    
    this.ctx.fill();
    if (withBorder) {
      this.ctx.stroke();
    }
  }
  
  private drawDiamondBox(x: number, y: number, size: number, withBorder: boolean): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size / 2);
    this.ctx.lineTo(x + size / 2, y);
    this.ctx.lineTo(x, y + size / 2);
    this.ctx.lineTo(x - size / 2, y);
    this.ctx.closePath();
    
    if (withBorder) {
      this.ctx.stroke();
    } else {
      this.ctx.stroke();
    }
  }
}

/**
 * Lazy-loaded singleton instance of EnhancedPatternGenerator
 */
let patternGenerator: EnhancedPatternGenerator | null = null;

/**
 * Get the pattern generator instance
 */
export const getPatternGenerator = (): EnhancedPatternGenerator => {
  if (!patternGenerator) {
    patternGenerator = new EnhancedPatternGenerator();
  }
  return patternGenerator;
};

/**
 * Create an enhanced pattern fill with additional options
 */
export const createEnhancedPatternFill = (config: EnhancedPatternConfig): CanvasPattern => {
  return getPatternGenerator().createPattern(config);
};

/**
 * Optimized pattern combinations for different types of color blindness
 */
export const COLORBLIND_OPTIMIZED_PATTERNS: Record<ColorBlindnessType, PatternType[]> = {
  [ColorBlindnessType.NONE]: [
    'line',
    'line-vertical',
    'cross',
    'dot',
    'diamond',
    'zigzag',
    'triangle',
    'square',
    'plus',
    'disc'
  ],
  [ColorBlindnessType.PROTANOPIA]: [  // Red-blind
    'line',           // Horizontal lines - very distinct
    'line-vertical',  // Vertical lines - also very distinct
    'cross',          // Cross pattern - very visible
    'dot',            // Dots - small and distinct
    'zigzag',         // Zigzag pattern - clearly different
    'diamond',        // Diamond - distinctive shape
    'triangle',       // Triangle - distinctive shape
    'square',         // Square - simple and clear
    'plus',           // Plus - distinct from crosses
    'disc'            // Filled circles - good contrast
  ],
  [ColorBlindnessType.DEUTERANOPIA]: [  // Green-blind
    'line',           // Horizontal lines
    'cross',          // Cross pattern
    'line-vertical',  // Vertical lines
    'dot',            // Dots
    'diamond',        // Diamond
    'zigzag',         // Zigzag
    'triangle',       // Triangle
    'plus',           // Plus
    'square',         // Square
    'disc'            // Disc
  ],
  [ColorBlindnessType.TRITANOPIA]: [  // Blue-blind
    'line',           // Horizontal lines
    'line-vertical',  // Vertical lines
    'dot',            // Dots
    'cross',          // Cross
    'diamond',        // Diamond
    'zigzag',         // Zigzag
    'square',         // Square
    'triangle',       // Triangle
    'plus',           // Plus
    'disc'            // Disc
  ],
  [ColorBlindnessType.ACHROMATOPSIA]: [  // Complete color blindness
    'line',           // Horizontal lines
    'cross',          // Cross pattern (very distinct)
    'dot',            // Dots (small shape)
    'line-vertical',  // Vertical lines
    'zigzag',         // Zigzag (complex pattern)
    'diamond',        // Diamond shape
    'square',         // Square
    'triangle',       // Triangle
    'plus',           // Plus
    'disc'            // Disc
  ],
  [ColorBlindnessType.PROTANOMALY]: [  // Red-weak
    'line',           // Horizontal lines
    'line-vertical',  // Vertical lines
    'cross',          // Cross pattern
    'dot',            // Dots
    'zigzag',         // Zigzag
    'diamond',        // Diamond
    'triangle',       // Triangle
    'square',         // Square
    'plus',           // Plus
    'disc'            // Disc
  ],
  [ColorBlindnessType.DEUTERANOMALY]: [  // Green-weak
    'line',           // Horizontal lines
    'cross',          // Cross pattern
    'line-vertical',  // Vertical lines
    'dot',            // Dots
    'diamond',        // Diamond
    'zigzag',         // Zigzag
    'triangle',       // Triangle
    'plus',           // Plus
    'square',         // Square
    'disc'            // Disc
  ],
  [ColorBlindnessType.TRITANOMALY]: [  // Blue-weak
    'line',           // Horizontal lines
    'line-vertical',  // Vertical lines
    'dot',            // Dots
    'cross',          // Cross
    'diamond',        // Diamond
    'zigzag',         // Zigzag
    'square',         // Square
    'triangle',       // Triangle
    'plus',           // Plus
    'disc'            // Disc
  ]
};

/**
 * Pattern variations with rotations and densities
 */
export const PATTERN_VARIATIONS: EnhancedPatternConfig[] = [
  // Basic patterns
  { patternType: 'line', patternColor: '#000000', backgroundColor: '#FFFFFF' },
  { patternType: 'line-vertical', patternColor: '#000000', backgroundColor: '#FFFFFF' },
  { patternType: 'cross', patternColor: '#000000', backgroundColor: '#FFFFFF' },
  { patternType: 'dot', patternColor: '#000000', backgroundColor: '#FFFFFF' },
  { patternType: 'diamond', patternColor: '#000000', backgroundColor: '#FFFFFF' },
  
  // Rotated patterns
  { patternType: 'line', patternColor: '#000000', backgroundColor: '#FFFFFF', rotation: 30 },
  { patternType: 'line', patternColor: '#000000', backgroundColor: '#FFFFFF', rotation: 60 },
  { patternType: 'zigzag', patternColor: '#000000', backgroundColor: '#FFFFFF', rotation: 45 },
  { patternType: 'diamond', patternColor: '#000000', backgroundColor: '#FFFFFF', rotation: 45 },
  
  // Density variations
  { patternType: 'dot', patternColor: '#000000', backgroundColor: '#FFFFFF', density: 0.7 },
  { patternType: 'dot', patternColor: '#000000', backgroundColor: '#FFFFFF', density: 1.5 },
  { patternType: 'line', patternColor: '#000000', backgroundColor: '#FFFFFF', density: 1.5 },
  
  // With borders
  { patternType: 'square', patternColor: '#000000', backgroundColor: '#FFFFFF', withBorder: true },
  { patternType: 'disc', patternColor: '#000000', backgroundColor: '#FFFFFF', withBorder: true },
  { patternType: 'triangle', patternColor: '#000000', backgroundColor: '#FFFFFF', withBorder: true },
  
  // Composite patterns
  { 
    patternType: 'line', 
    patternColor: '#000000', 
    backgroundColor: '#FFFFFF',
    secondaryPattern: 'line-vertical',
    secondaryColor: '#555555'
  },
  { 
    patternType: 'dot', 
    patternColor: '#000000', 
    backgroundColor: '#FFFFFF',
    secondaryPattern: 'diamond',
    secondaryColor: '#555555'
  }
];

/**
 * Generate enhanced pattern sequence for chart datasets
 * @param colors Array of colors to use as pattern colors
 * @param backgroundColor Background color for the patterns
 * @param colorBlindnessType Type of color blindness to optimize for
 * @returns Array of CanvasPattern objects
 */
export const generateEnhancedPatternSequence = (
  colors: string[],
  backgroundColor: string,
  colorBlindnessType: ColorBlindnessType = ColorBlindnessType.NONE
): CanvasPattern[] => {
  // Get optimized patterns for this color blindness type
  const patternTypes = COLORBLIND_OPTIMIZED_PATTERNS[colorBlindnessType] || 
                       COLORBLIND_OPTIMIZED_PATTERNS[ColorBlindnessType.NONE];
  
  // Create variations with rotations for more diversity
  const patterns: CanvasPattern[] = [];
  
  colors.forEach((color, index) => {
    const basePattern = patternTypes[index % patternTypes.length];
    
    // Apply pattern variations based on index
    let config: EnhancedPatternConfig;
    
    // Every third pattern gets a rotation
    if (index % 3 === 1) {
      config = {
        patternType: basePattern,
        patternColor: color,
        backgroundColor,
        rotation: 45,
        patternSize: 15
      };
    } 
    // Every fourth pattern gets a border
    else if (index % 4 === 2) {
      config = {
        patternType: basePattern,
        patternColor: color,
        backgroundColor,
        withBorder: true,
        borderColor: '#000000',
        patternSize: 15
      };
    }
    // Every fifth pattern gets a density change
    else if (index % 5 === 3) {
      config = {
        patternType: basePattern,
        patternColor: color,
        backgroundColor,
        density: 1.3,
        patternSize: 15
      };
    }
    // Special composite patterns for greater distinction
    else if (index % 6 === 0 && index > 0) {
      const secondaryPatternIndex = (index + 3) % patternTypes.length;
      config = {
        patternType: basePattern,
        patternColor: color,
        backgroundColor,
        secondaryPattern: patternTypes[secondaryPatternIndex],
        secondaryColor: color,
        patternSize: 15
      };
    }
    // Basic pattern
    else {
      config = {
        patternType: basePattern,
        patternColor: color,
        backgroundColor,
        patternSize: 15
      };
    }
    
    patterns.push(createEnhancedPatternFill(config));
  });
  
  return patterns;
};

/**
 * Apply enhanced pattern fills to Chart.js dataset background colors
 * @param datasets Chart.js datasets array
 * @param colors Color array to use for patterns
 * @param backgroundColor Background color for patterns
 * @param colorBlindnessType Type of color blindness to optimize for
 * @returns Updated datasets array with pattern fills
 */
export const applyEnhancedPatternFillsToDatasets = (
  datasets: any[],
  colors: string[],
  backgroundColor: string = '#FFFFFF',
  colorBlindnessType: ColorBlindnessType = ColorBlindnessType.NONE
): any[] => {
  if (!datasets || datasets.length === 0) {
    return datasets;
  }
  
  // Generate patterns for each color
  const patterns = generateEnhancedPatternSequence(colors, backgroundColor, colorBlindnessType);
  
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