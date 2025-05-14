/**
 * PDF Export Utilities for Voltage Drop Calculator
 * 
 * This module provides functions for exporting voltage drop calculation results to PDF.
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VoltageDropInputs, VoltageDropResult, CircuitType } from './voltageDropUtils';
import { Chart } from 'chart.js/auto';
import { createOptimizedChartImage } from '../../../../../utils/reportGenerator/chartExportOptimizer';

/**
 * Options for PDF export
 */
export interface PdfExportOptions {
  title?: string;
  showVisualization?: boolean;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  fileName?: string;
  includeRecommendations?: boolean;
  companyName?: string;
  companyLogo?: string;
  optimizeVisualization?: boolean;
  visualizationQuality?: number;
}

/**
 * Circuit type names for display in PDF
 */
const circuitTypeNames: Record<CircuitType, string> = {
  'branch': 'Branch Circuit',
  'feeder': 'Feeder',
  'service': 'Service',
  'motor': 'Motor Circuit'
};

/**
 * Export voltage drop calculation results to PDF
 * 
 * @param inputs - Voltage drop calculation inputs
 * @param results - Voltage drop calculation results
 * @param visualizationImage - Optional base64 image string for visualization
 * @param options - PDF export options
 * @returns The generated PDF document
 */
export const exportVoltageDropToPdf = (
  inputs: VoltageDropInputs,
  results: VoltageDropResult,
  visualizationImage?: string,
  options: PdfExportOptions = {}
): jsPDF => {
  const {
    title = 'Voltage Drop Calculation Report',
    showVisualization = true,
    paperSize = 'a4',
    orientation = 'portrait',
    fileName = 'voltage-drop-report.pdf',
    includeRecommendations = true,
    companyName = '',
    companyLogo = '',
    optimizeVisualization = true,
    visualizationQuality = 1.0
  } = options;
  
  // Initialize jsPDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize
  });
  
  // Calculate page width and height
  const pageWidth = orientation === 'portrait' ? 
    (paperSize === 'a4' ? 210 : 216) : 
    (paperSize === 'a4' ? 297 : 279);
  const pageHeight = orientation === 'portrait' ? 
    (paperSize === 'a4' ? 297 : 279) : 
    (paperSize === 'a4' ? 210 : 216);
    
  // Margins
  const margin = 14;
  
  // Add title
  pdf.setFontSize(18);
  pdf.text(title, margin, margin);
  
  // Add company name if provided
  if (companyName) {
    pdf.setFontSize(12);
    pdf.text(companyName, margin, margin + 8);
  }
  
  // Add company logo if provided
  if (companyLogo) {
    try {
      pdf.addImage(companyLogo, 'PNG', pageWidth - 60, margin, 40, 15);
    } catch (error) {
      console.error('Error adding company logo:', error);
    }
  }
  
  // Add date and time
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + (companyName ? 16 : 8));
  
  // Add circuit type
  const circuitTypeName = circuitTypeNames[inputs.circuitConfiguration.circuitType] || 'Unknown Circuit';
  
  pdf.setFontSize(14);
  pdf.text(`Circuit Type: ${circuitTypeName}`, margin, margin + (companyName ? 24 : 16));
  
  // Add compliance status
  pdf.setFontSize(12);
  const yPosition = margin + (companyName ? 32 : 24);
  
  if (results.compliance === 'compliant') {
    pdf.setTextColor(0, 128, 0); // Green for compliant
    pdf.text('Status: Compliant with PEC 2017', margin, yPosition);
  } else {
    pdf.setTextColor(220, 0, 0); // Red for non-compliant
    pdf.text('Status: Non-Compliant with PEC 2017', margin, yPosition);
  }
  pdf.setTextColor(0, 0, 0); // Reset color
  
  // Add input parameters table
  pdf.setFontSize(12);
  pdf.text('Input Parameters', margin, yPosition + 10);
  
  // Prepare circuit-specific parameters
  const circuitSpecificParams: any[] = [];
  
  if (inputs.circuitConfiguration.circuitType === 'branch' && inputs.circuitConfiguration.distanceToFurthestOutlet) {
    circuitSpecificParams.push(['Distance to Furthest Outlet', inputs.circuitConfiguration.distanceToFurthestOutlet.toString(), 'm']);
  }
  
  if (inputs.circuitConfiguration.circuitType === 'motor') {
    if (inputs.circuitConfiguration.startingCurrentMultiplier) {
      circuitSpecificParams.push(['Starting Current Multiplier', inputs.circuitConfiguration.startingCurrentMultiplier.toString(), 'x']);
    }
    if (inputs.circuitConfiguration.serviceFactor) {
      circuitSpecificParams.push(['Service Factor', inputs.circuitConfiguration.serviceFactor.toString(), '']);
    }
    circuitSpecificParams.push(['Has VFD', inputs.circuitConfiguration.hasVFD ? 'Yes' : 'No', '']);
  }
  
  // Generate input parameters table
  const inputParams = [
    ['Parameter', 'Value', 'Unit'],
    ['System Voltage', inputs.systemVoltage.toString(), 'V'],
    ['Load Current', inputs.loadCurrent.toString(), 'A'],
    ['Conductor Length', inputs.conductorLength.toString(), 'm'],
    ['Conductor Size', inputs.conductorSize, ''],
    ['Conductor Material', inputs.conductorMaterial.charAt(0).toUpperCase() + inputs.conductorMaterial.slice(1), ''],
    ['Conduit Material', inputs.conduitMaterial, ''],
    ['Phase Configuration', inputs.phaseConfiguration === 'single-phase' ? 'Single-Phase' : 'Three-Phase', ''],
    ['Ambient Temperature', inputs.temperature.toString(), '°C'],
    ['Power Factor', inputs.powerFactor?.toString() || '0.85', ''],
    ...circuitSpecificParams
  ];
  
  // Add input parameters table
  (pdf as any).autoTable({
    startY: yPosition + 12,
    head: [inputParams[0]],
    body: inputParams.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: margin }
  });
  
  // Add results table
  const currentY = (pdf as any).lastAutoTable.finalY + 10;
  pdf.text('Calculation Results', margin, currentY);
  
  const resultParams = [
    ['Parameter', 'Value', 'Unit'],
    ['Voltage Drop', results.voltageDrop.toFixed(2), 'V'],
    ['Voltage Drop Percentage', results.voltageDropPercent.toFixed(2), '%'],
    ['Maximum Allowed Drop', results.maxAllowedDrop.toFixed(2), '%'],
    ['Receiving End Voltage', results.receivingEndVoltage.toFixed(2), 'V'],
    ['Resistive Loss', results.resistiveLoss.toFixed(2), 'W'],
    ['Reactive Loss', results.reactiveLoss.toFixed(2), 'VAR'],
    ['Total Loss', results.totalLoss.toFixed(2), 'VA'],
    ['Wire Ampacity', results.wireRating.ampacity.toString(), 'A'],
    ['Wire Adequacy', results.wireRating.isAdequate ? 'Adequate' : 'Not Adequate', '']
  ];
  
  (pdf as any).autoTable({
    startY: currentY + 2,
    head: [resultParams[0]],
    body: resultParams.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: margin }
  });
  
  // Add visualization if available
  let finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  if (showVisualization && visualizationImage) {
    pdf.text('Voltage Drop Visualization', margin, finalY);
    
    try {
      // Calculate image dimensions to fit the page
      const imgWidth = pageWidth - (2 * margin);
      // Increased height for better visualization
      const imgHeight = 120; 
      
      pdf.addImage(visualizationImage, 'PNG', margin, finalY + 2, imgWidth, imgHeight);
      finalY += imgHeight + 10;
    } catch (error) {
      console.error('Error adding visualization to PDF:', error);
    }
  }
  
  // Add recommendations if needed
  if (includeRecommendations && results.recommendations.length > 0) {
    // Check if we need a new page
    if (finalY > pageHeight - 60) {
      pdf.addPage();
      finalY = margin;
    }
    
    pdf.text('Recommendations', margin, finalY);
    
    // Create recommendations list
    const recommendations = results.recommendations.map((rec, index) => 
      [`${index + 1}.`, rec]
    );
    
    (pdf as any).autoTable({
      startY: finalY + 2,
      body: recommendations,
      theme: 'plain',
      tableWidth: 'auto',
      styles: { cellPadding: 1 },
      columnStyles: { 
        0: { cellWidth: 8 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin }
    });
  }
  
  // Add PEC reference information
  finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (finalY > pageHeight - 40) {
    pdf.addPage();
    finalY = margin;
  }
  
  pdf.setFontSize(10);
  pdf.text('Reference: Philippine Electrical Code (PEC) 2017 Section 2.30', margin, finalY);
  
  // Add footer with page numbers
  const totalPages = pdf.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }
  
  // Return the PDF document (when using as a service) or save it
  if (fileName) {
    pdf.save(fileName);
  }
  
  return pdf;
};

/**
 * Capture chart as optimized base64 image for PDF export
 * 
 * @param chart - Chart.js chart instance
 * @param options - Options for chart optimization
 * @returns Promise resolving to base64 image string
 */
export const captureChartAsImage = async (
  chart: Chart | null, 
  optimizationOptions = { width: 800, height: 400, quality: 0.95, optimizeForPrint: true }
): Promise<string> => {
  if (!chart) return '';
  
  try {
    // Use optimized chart export if available
    return await createOptimizedChartImage(chart, optimizationOptions);
  } catch (error) {
    console.error('Error optimizing chart image:', error);
    // Fallback to basic method
    const canvas = chart.canvas;
    if (canvas) {
      return canvas.toDataURL('image/png', optimizationOptions.quality);
    }
    return '';
  }
}; 