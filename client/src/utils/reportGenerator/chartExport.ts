/**
 * Utility functions for exporting Chart.js charts as images
 */

/**
 * Exports a chart canvas as a PNG image and triggers a download
 * @param canvas The chart canvas element
 * @param fileName The name of the file to be downloaded (without extension)
 */
export const exportChartAsPNG = (canvas: HTMLCanvasElement, fileName: string = 'chart'): void => {
  try {
    // Create a URL for the canvas image
    const url = canvas.toDataURL('image/png');
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = url;
    link.download = `${fileName}.png`;
    
    // Append to document to enable click
    document.body.appendChild(link);
    
    // Programmatically click the link to trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    throw new Error('Failed to export chart as PNG');
  }
};

/**
 * Exports a chart canvas as a JPEG image and triggers a download
 * @param canvas The chart canvas element
 * @param fileName The name of the file to be downloaded (without extension)
 * @param quality JPEG quality (0-1)
 */
export const exportChartAsJPEG = (
  canvas: HTMLCanvasElement, 
  fileName: string = 'chart',
  quality: number = 0.95
): void => {
  try {
    // Create a URL for the canvas image
    const url = canvas.toDataURL('image/jpeg', quality);
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = url;
    link.download = `${fileName}.jpg`;
    
    // Append to document to enable click
    document.body.appendChild(link);
    
    // Programmatically click the link to trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting chart as JPEG:', error);
    throw new Error('Failed to export chart as JPEG');
  }
};

/**
 * Exports a chart canvas as an SVG image (for better quality in reports)
 * Note: This requires the canvg library for full browser compatibility
 * @param canvas The chart canvas element 
 * @param fileName The name of the file to be downloaded (without extension)
 */
export const exportChartAsSVG = (canvas: HTMLCanvasElement, fileName: string = 'chart'): void => {
  try {
    // Get canvas data
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Create an SVG element
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    
    // Set SVG attributes
    svg.setAttribute('width', canvas.width.toString());
    svg.setAttribute('height', canvas.height.toString());
    svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
    
    // Create a foreign object to embed the canvas
    const foreignObject = document.createElementNS(svgNamespace, 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    
    // Create an img element with the canvas data
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    
    // Append elements
    foreignObject.appendChild(img);
    svg.appendChild(foreignObject);
    
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    
    // Create a blob with the SVG data
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = url;
    link.download = `${fileName}.svg`;
    
    // Append to document to enable click
    document.body.appendChild(link);
    
    // Programmatically click the link to trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting chart as SVG:', error);
    throw new Error('Failed to export chart as SVG');
  }
};

/**
 * Converts chart to an image object for later use (e.g., in PDF generation)
 * @param canvas The chart canvas element
 * @returns Promise that resolves to an Image object
 */
export const chartToImage = (canvas: HTMLCanvasElement): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to convert chart to image'));
      img.src = canvas.toDataURL('image/png');
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper function to get a chart's canvas from its container element
 * @param container The container element that holds the chart
 * @returns The canvas element or null if not found
 */
export const getChartCanvas = (container: HTMLElement): HTMLCanvasElement | null => {
  return container.querySelector('canvas');
}; 