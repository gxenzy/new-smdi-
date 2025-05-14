/**
 * Chart Export Optimizer Utilities
 * 
 * This module provides utilities for optimizing Chart.js charts for PDF export
 */

import { Chart, ChartConfiguration } from 'chart.js';

/**
 * Options for optimizing Chart.js charts for export
 */
export interface ChartExportOptions {
  width?: number;
  height?: number;
  devicePixelRatio?: number;
  backgroundColor?: string;
  fontColor?: string;
  borderColor?: string;
  quality?: number;
  imageFormat?: 'png' | 'jpeg';
  optimizeForPrint?: boolean;
}

/**
 * Create an optimized chart for export based on an existing chart
 * 
 * @param sourceChart - Source Chart.js instance
 * @param options - Export options
 * @returns Promise that resolves to an optimized chart image as data URL
 */
export async function createOptimizedChartImage(
  sourceChart: Chart | null,
  options: ChartExportOptions = {}
): Promise<string> {
  if (!sourceChart) return '';
  
  const {
    width = 800,
    height = 500,
    devicePixelRatio = 2,
    backgroundColor = '#ffffff',
    fontColor = '#333333',
    borderColor = '#dddddd',
    quality = 0.95,
    imageFormat = 'png',
    optimizeForPrint = true
  } = options;
  
  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  // Get source chart configuration
  const sourceConfig = sourceChart.config as any;
  
  try {
    // Clone the chart configuration
    const exportConfig: ChartConfiguration = JSON.parse(JSON.stringify(sourceConfig));
    
    // Apply optimizations for export
    
    // 1. Set explicit dimensions
    if (!exportConfig.options) exportConfig.options = {};
    exportConfig.options.responsive = false;
    exportConfig.options.maintainAspectRatio = false;
    
    // 2. Optimize for print if needed
    if (optimizeForPrint) {
      // Set background color using custom property
      if (!exportConfig.options.plugins) exportConfig.options.plugins = {};
      (exportConfig.options.plugins as any).backgroundColor = backgroundColor;
      
      // Apply print-friendly colors recursively
      applyPrintColors(exportConfig, fontColor, borderColor);
    }
    
    // Create the export chart
    const exportChart = new Chart(tempCanvas, exportConfig);
    
    // Wait for chart animation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate image with high quality
    const imageUrl = tempCanvas.toDataURL(
      imageFormat === 'png' ? 'image/png' : 'image/jpeg',
      quality
    );
    
    // Clean up
    exportChart.destroy();
    
    return imageUrl;
  } catch (error) {
    console.error('Error creating optimized chart image:', error);
    
    // Fallback to original chart's image
    const canvas = sourceChart.canvas;
    if (canvas) {
      return canvas.toDataURL(
        imageFormat === 'png' ? 'image/png' : 'image/jpeg',
        quality
      );
    }
    return '';
  }
}

/**
 * Recursively apply print-friendly colors to chart configuration
 * 
 * @param obj - Object to process
 * @param fontColor - Color for text
 * @param borderColor - Color for borders and lines
 */
function applyPrintColors(obj: any, fontColor: string, borderColor: string): void {
  if (!obj || typeof obj !== 'object') return;
  
  // Apply colors to specific properties
  if (obj.hasOwnProperty('color') && typeof obj.color === 'string' && obj.color.includes('rgb')) {
    obj.color = fontColor;
  }
  
  if (obj.hasOwnProperty('borderColor') && typeof obj.borderColor === 'string' && obj.borderColor.includes('rgb')) {
    obj.borderColor = borderColor;
  }
  
  if (obj.hasOwnProperty('backgroundColor') && typeof obj.backgroundColor === 'string' && obj.backgroundColor.includes('rgba')) {
    // Make background colors more solid for print
    obj.backgroundColor = obj.backgroundColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, 'rgba($1, $2, $3, 0.8)');
  }
  
  // Process datasets specially
  if (Array.isArray(obj.datasets)) {
    obj.datasets.forEach((dataset: any, index: number) => {
      if (dataset.borderColor && typeof dataset.borderColor === 'string') {
        // Generate print-friendly colors
        const hue = (index * 40) % 360;
        dataset.borderColor = `hsl(${hue}, 60%, 40%)`;
        dataset.backgroundColor = `hsla(${hue}, 60%, 70%, 0.5)`;
      }
    });
  }
  
  // Process children recursively
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      applyPrintColors(obj[key], fontColor, borderColor);
    }
  });
}

/**
 * Create a printable image from Chart.js charts
 * 
 * @param charts - Array of Chart.js instances to include
 * @param options - Export options
 * @returns Promise that resolves to data URL for complete image
 */
export async function createPrintableChartImage(
  charts: (Chart | null)[],
  options: ChartExportOptions = {}
): Promise<string> {
  const validCharts = charts.filter(c => c !== null) as Chart[];
  if (validCharts.length === 0) return '';
  
  const {
    width = 800,
    height = 500 * validCharts.length,
    quality = 0.95,
    backgroundColor = '#ffffff',
    optimizeForPrint = true
  } = options;
  
  // Create optimized images for each chart
  const optimizedCharts = await Promise.all(
    validCharts.map(chart => 
      createOptimizedChartImage(chart, {
        ...options,
        optimizeForPrint,
        width,
        height: height / validCharts.length
      })
    )
  );
  
  // Create a canvas to combine all charts
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = width;
  combinedCanvas.height = height;
  
  const ctx = combinedCanvas.getContext('2d');
  if (!ctx) return '';
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Load and draw each chart
  const chartHeight = height / validCharts.length;
  
  for (let i = 0; i < optimizedCharts.length; i++) {
    const img = new Image();
    img.src = optimizedCharts[i];
    
    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load chart image ${i}`));
    });
    
    // Draw image
    ctx.drawImage(img, 0, i * chartHeight, width, chartHeight);
  }
  
  // Return combined image
  return combinedCanvas.toDataURL(
    'image/png',
    quality
  );
} 