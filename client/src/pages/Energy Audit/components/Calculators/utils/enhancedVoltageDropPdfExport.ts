/**
 * Enhanced PDF Export Utilities for Enhanced Voltage Drop Analysis
 * 
 * This module extends the base voltage drop PDF export with additional features:
 * - Conductor comparison visualizations
 * - Enhanced voltage drop profile visualization
 * - PEC 2017 compliance details
 * - Economic analysis information
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VoltageDropResult } from './voltageDropUtils';
import { EnhancedVoltageDropInputs, InsulationType } from './enhancedVoltageDropUtils';
import { Chart } from 'chart.js/auto';
import { createOptimizedChartImage } from '../../../../../utils/reportGenerator/chartExportOptimizer';
import { LoadItem, LoadSchedule } from '../ScheduleOfLoads/types';

/**
 * Options for Enhanced Voltage Drop PDF export
 */
export interface EnhancedPdfExportOptions {
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
  // Enhanced options
  includeConductorComparison?: boolean;
  includeVoltageProfile?: boolean;
  includeEconomicAnalysis?: boolean;
  includeCircuitDiagram?: boolean;
  includeCompleteComplianceDetails?: boolean;
  batchMode?: boolean; // For exporting multiple circuits at once
}

/**
 * Options for chart capture
 */
export interface ChartCaptureOptions {
  width?: number;
  height?: number;
  quality?: number;
  optimizeForPrint?: boolean;
  backgroundColor?: string;
}

/**
 * Temperature rating display names for insulation types
 */
const INSULATION_TEMP_DISPLAY: Record<InsulationType, string> = {
  'THHN': 'THHN (90°C)',
  'THWN': 'THWN (75°C)',
  'XHHW': 'XHHW (90°C)',
  'RHW': 'RHW (75°C)',
  'USE': 'USE (75°C)'
};

/**
 * Export enhanced voltage drop calculation results to PDF
 * 
 * @param inputs - Enhanced voltage drop calculation inputs
 * @param results - Voltage drop calculation results
 * @param voltageProfileChart - Optional Chart.js instance for voltage profile
 * @param conductorComparisonChart - Optional Chart.js instance for conductor comparison
 * @param circuitDiagramImage - Optional base64 image string for circuit diagram
 * @param options - PDF export options
 * @returns The generated PDF document
 */
export const exportEnhancedVoltageDropToPdf = async (
  inputs: EnhancedVoltageDropInputs,
  results: VoltageDropResult,
  voltageProfileChart?: Chart | null,
  conductorComparisonChart?: Chart | null,
  circuitDiagramImage?: string,
  options: EnhancedPdfExportOptions = {}
): Promise<jsPDF> => {
  const {
    title = 'Enhanced Voltage Drop Analysis Report',
    showVisualization = true,
    paperSize = 'a4',
    orientation = 'portrait',
    fileName = 'enhanced-voltage-drop-report.pdf',
    includeRecommendations = true,
    companyName = '',
    companyLogo = '',
    optimizeVisualization = true,
    visualizationQuality = 1.0,
    includeConductorComparison = true,
    includeVoltageProfile = true,
    includeEconomicAnalysis = false,
    includeCircuitDiagram = true,
    includeCompleteComplianceDetails = true
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
  const circuitTypeName = inputs.circuitConfiguration.circuitType.charAt(0).toUpperCase() + 
    inputs.circuitConfiguration.circuitType.slice(1);
  
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
  
  // Build enhanced input parameters table with enhanced parameters
  const inputParams = [
    ['Parameter', 'Value', 'Unit'],
    ['System Voltage', inputs.systemVoltage.toString(), 'V'],
    ['Load Current', inputs.loadCurrent.toString(), 'A'],
    ['Conductor Length', inputs.conductorLength.toString(), 'm'],
    ['Conductor Size', inputs.conductorSize, ''],
    ['Conductor Material', inputs.conductorMaterial.charAt(0).toUpperCase() + inputs.conductorMaterial.slice(1), ''],
    ['Conduit Material', inputs.conduitMaterial, ''],
    ['Phase Configuration', inputs.phaseConfiguration === 'single-phase' ? 'Single-Phase' : 'Three-Phase', ''],
    ['Ambient Temperature', inputs.ambientTemperature.toString(), '°C'],
    ['Power Factor', inputs.powerFactor?.toString() || '0.85', ''],
    ['Insulation Type', INSULATION_TEMP_DISPLAY[inputs.insulationType] || inputs.insulationType, ''],
    ['Harmonic Factor', inputs.harmonicFactor.toString(), ''],
    ['Parallel Sets', inputs.parallelSets.toString(), ''],
    ['Bundle Adjustment', inputs.bundleAdjustmentFactor.toString(), '']
  ];
  
  // Add circuit-specific parameters
  if (inputs.circuitConfiguration.circuitType === 'branch' && inputs.circuitConfiguration.distanceToFurthestOutlet) {
    inputParams.push(['Distance to Outlet', inputs.circuitConfiguration.distanceToFurthestOutlet.toString(), 'm']);
  }
  
  if (inputs.circuitConfiguration.circuitType === 'motor') {
    if (inputs.circuitConfiguration.startingCurrentMultiplier) {
      inputParams.push(['Starting Current', inputs.circuitConfiguration.startingCurrentMultiplier.toString(), 'x']);
    }
    if (inputs.circuitConfiguration.serviceFactor) {
      inputParams.push(['Service Factor', inputs.circuitConfiguration.serviceFactor.toString(), '']);
    }
    inputParams.push(['Has VFD', inputs.circuitConfiguration.hasVFD ? 'Yes' : 'No', '']);
  }
  
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
  
  // Capture charts as images if they exist
  let voltageProfileImage: string | undefined;
  let conductorComparisonImage: string | undefined;
  
  if (showVisualization) {
    if (includeVoltageProfile && voltageProfileChart) {
      voltageProfileImage = await captureEnhancedChartAsImage(voltageProfileChart, {
        width: 800,
        height: 400,
        quality: visualizationQuality,
        optimizeForPrint: optimizeVisualization
      });
    }
    
    if (includeConductorComparison && conductorComparisonChart) {
      conductorComparisonImage = await captureEnhancedChartAsImage(conductorComparisonChart, {
        width: 800,
        height: 400,
        quality: visualizationQuality,
        optimizeForPrint: optimizeVisualization
      });
    }
  }
  
  // Add visualizations
  let finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  // Add voltage profile visualization
  if (showVisualization && includeVoltageProfile && voltageProfileImage) {
    // Check if we need a new page
    if (finalY > pageHeight - 140) {
      pdf.addPage();
      finalY = margin;
    }
    
    pdf.text('Voltage Profile Along Conductor', margin, finalY);
    
    try {
      // Calculate image dimensions to fit the page
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = 100; 
      
      pdf.addImage(voltageProfileImage, 'PNG', margin, finalY + 2, imgWidth, imgHeight);
      finalY += imgHeight + 10;
    } catch (error) {
      console.error('Error adding voltage profile to PDF:', error);
    }
  }
  
  // Add conductor comparison visualization
  if (showVisualization && includeConductorComparison && conductorComparisonImage) {
    // Check if we need a new page
    if (finalY > pageHeight - 140) {
      pdf.addPage();
      finalY = margin;
    }
    
    pdf.text('Conductor Size Comparison', margin, finalY);
    
    try {
      // Calculate image dimensions to fit the page
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = 100; 
      
      pdf.addImage(conductorComparisonImage, 'PNG', margin, finalY + 2, imgWidth, imgHeight);
      finalY += imgHeight + 10;
    } catch (error) {
      console.error('Error adding conductor comparison to PDF:', error);
    }
  }
  
  // Add circuit diagram if available
  if (showVisualization && includeCircuitDiagram && circuitDiagramImage) {
    // Check if we need a new page
    if (finalY > pageHeight - 140) {
      pdf.addPage();
      finalY = margin;
    }
    
    pdf.text('Circuit Diagram with Voltage Drop', margin, finalY);
    
    try {
      // Calculate image dimensions to fit the page
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = 100; 
      
      pdf.addImage(circuitDiagramImage, 'PNG', margin, finalY + 2, imgWidth, imgHeight);
      finalY += imgHeight + 10;
    } catch (error) {
      console.error('Error adding circuit diagram to PDF:', error);
    }
  }
  
  // Add recommendations if needed
  if (includeRecommendations && results.recommendations.length > 0) {
    // Check if we need a new page
    if (finalY > pageHeight - 80) {
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
  
  // Add compliance details
  if (includeCompleteComplianceDetails) {
    finalY = (pdf as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (finalY > pageHeight - 80) {
      pdf.addPage();
      finalY = margin;
    }
    
    pdf.text('Compliance Details', margin, finalY);
    
    // PEC 2017 voltage drop limits
    const complianceDetails = [
      ['Circuit Type', 'Maximum Allowed Voltage Drop', 'Reference'],
      ['Branch Circuit', '3%', 'PEC 2017 Sec. 2.30.1'],
      ['Feeder', '2%', 'PEC 2017 Sec. 2.30.1'],
      ['Service', '2%', 'PEC 2017 Sec. 2.30.1'],
      ['Combined', '5%', 'PEC 2017 Sec. 2.30.1']
    ];
    
    (pdf as any).autoTable({
      startY: finalY + 2,
      head: [complianceDetails[0]],
      body: complianceDetails.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: margin }
    });
    
    // Add additional information about PEC 2017 requirements
    finalY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.setFontSize(10);
    
    const pecInfo = 
      'According to PEC 2017 Section 2.30.1, the voltage drop should not exceed 3% ' +
      'for branch circuits and 2% for feeders. The combined voltage drop should not ' +
      'exceed 5% from the service entrance to the farthest outlet.';
    
    pdf.text(pecInfo, margin, finalY, { 
      maxWidth: pageWidth - (2 * margin),
      align: 'justify'
    });
  }
  
  return pdf;
};

/**
 * Export enhanced voltage drop analysis for a batch of circuits
 * 
 * @param loadSchedule - Load schedule containing multiple circuits
 * @param results - Map of circuit IDs to their voltage drop results
 * @param options - PDF export options
 * @returns The generated PDF document
 */
export const exportBatchVoltageDropToPdf = async (
  loadSchedule: LoadSchedule,
  results: Record<string, { inputs: EnhancedVoltageDropInputs, results: VoltageDropResult }>,
  options: EnhancedPdfExportOptions = {}
): Promise<jsPDF> => {
  const {
    title = `Panel ${loadSchedule.panelName} - Voltage Drop Analysis`,
    paperSize = 'a4',
    orientation = 'landscape',
    fileName = 'batch-voltage-drop-report.pdf',
    includeRecommendations = true,
    companyName = '',
    companyLogo = '',
    includeCompleteComplianceDetails = true
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
  
  // Add panel information
  pdf.setFontSize(14);
  const yPosition = margin + (companyName ? 24 : 16);
  pdf.text(`Panel Information: ${loadSchedule.panelName}`, margin, yPosition);
  
  // Add panel details
  const panelDetails = [
    ['Parameter', 'Value', 'Unit'],
    ['Panel Name', loadSchedule.panelName, ''],
    ['Voltage', loadSchedule.voltage.toString(), 'V'],
    ['Power Factor', loadSchedule.powerFactor.toString(), ''],
    ['Total Connected Load', loadSchedule.totalConnectedLoad.toFixed(2), 'W'],
    ['Total Demand Load', loadSchedule.totalDemandLoad.toFixed(2), 'W'],
    ['Current', loadSchedule.current.toFixed(2), 'A'],
    ['Phase Configuration', loadSchedule.phaseConfiguration || 'single-phase', '']
  ];
  
  // Add panel details table
  (pdf as any).autoTable({
    startY: yPosition + 5,
    head: [panelDetails[0]],
    body: panelDetails.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: margin }
  });
  
  // Add circuit voltage drop summary table
  let currentY = (pdf as any).lastAutoTable.finalY + 10;
  pdf.setFontSize(14);
  pdf.text('Circuit Voltage Drop Summary', margin, currentY);
  
  // Prepare circuit summary data
  const circuitSummary = [
    ['Circuit', 'Description', 'Current (A)', 'Length (m)', 'Size', 'VD (%)', 'Status', 'Recommended']
  ];
  
  // Add circuit data
  const circuitIds = Object.keys(results);
  
  // Find matching load items for circuit IDs
  for (const circuitId of circuitIds) {
    // Find matching load item 
    const loadItem = loadSchedule.loads.find(item => item.id === circuitId);
    const circuitResult = results[circuitId];
    
    if (loadItem && circuitResult) {
      const { inputs, results: vdResults } = circuitResult;
      
      circuitSummary.push([
        circuitId.substring(0, 8) + '...',  // Truncate ID for display
        loadItem.description,
        inputs.loadCurrent.toFixed(1),
        inputs.conductorLength.toString(),
        inputs.conductorSize,
        vdResults.voltageDropPercent.toFixed(2),
        vdResults.compliance === 'compliant' ? 'Compliant' : 'Non-Compliant',
        vdResults.voltageDropPercent > vdResults.maxAllowedDrop ? 
          findRecommendedConductorSize(vdResults.recommendations) : 
          inputs.conductorSize
      ]);
    }
  }
  
  // Add circuit summary table
  (pdf as any).autoTable({
    startY: currentY + 5,
    head: [circuitSummary[0]],
    body: circuitSummary.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: margin },
    styles: { overflow: 'ellipsize' },
    columnStyles: {
      0: { cellWidth: 25 },  // Circuit ID
      1: { cellWidth: 'auto' }, // Description
      2: { cellWidth: 20 },  // Current
      3: { cellWidth: 20 },  // Length
      4: { cellWidth: 20 },  // Size
      5: { cellWidth: 20 },  // VD %
      6: { cellWidth: 25 },  // Status
      7: { cellWidth: 25 }   // Recommended
    }
  });
  
  // Add non-compliant circuits section if any exist
  const nonCompliantCircuits = circuitSummary.slice(1).filter(
    circuit => circuit[6] === 'Non-Compliant'
  );
  
  // Initialize detailY variable that will be used later
  let detailY = (pdf as any).lastAutoTable.finalY + 10;
  
  if (nonCompliantCircuits.length > 0) {
    currentY = (pdf as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(14);
    pdf.text('Non-Compliant Circuits', margin, currentY);
    
    // Add detail for each non-compliant circuit
    pdf.setFontSize(10);
    detailY = currentY + 10; // Update detailY
    
    for (let i = 0; i < Math.min(nonCompliantCircuits.length, 5); i++) {
      const circuitRow = nonCompliantCircuits[i];
      const circuitId = circuitIds[circuitSummary.findIndex(row => row[0] === circuitRow[0])];
      const circuitData = results[circuitId];
      
      if (circuitData) {
        pdf.setFontSize(12);
        pdf.text(`Circuit: ${circuitRow[1]} (${circuitRow[0]})`, margin, detailY);
        pdf.setFontSize(10);
        
        // Add recommended actions
        if (includeRecommendations && circuitData.results.recommendations.length > 0) {
          pdf.text('Recommended Actions:', margin, detailY + 5);
          
          // Add only the first 2 recommendations for brevity
          for (let j = 0; j < Math.min(circuitData.results.recommendations.length, 2); j++) {
            pdf.text(`• ${circuitData.results.recommendations[j]}`, margin + 5, detailY + 10 + (j * 5));
          }
        }
        
        detailY += 25;
        
        // Check if we need a new page
        if (detailY > pageHeight - 20) {
          pdf.addPage();
          detailY = margin;
        }
      }
    }
    
    // Add note if there are more non-compliant circuits
    if (nonCompliantCircuits.length > 5) {
      pdf.text(
        `Note: ${nonCompliantCircuits.length - 5} more non-compliant circuits. See detailed circuit reports.`,
        margin,
        detailY
      );
    }
  }
  
  // Add compliance details if requested
  if (includeCompleteComplianceDetails) {
    // Use current detail Y position if we have non-compliant circuits, otherwise use the last table position
    currentY = nonCompliantCircuits.length > 0 ? (detailY + 10) : ((pdf as any).lastAutoTable.finalY + 10);
    
    // Check if we need a new page
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(14);
    pdf.text('PEC 2017 Compliance Reference', margin, currentY);
    
    // PEC 2017 voltage drop limits
    const complianceDetails = [
      ['Circuit Type', 'Maximum Allowed Voltage Drop', 'Reference'],
      ['Branch Circuit', '3%', 'PEC 2017 Sec. 2.30.1'],
      ['Feeder', '2%', 'PEC 2017 Sec. 2.30.1'],
      ['Service', '2%', 'PEC 2017 Sec. 2.30.1'],
      ['Combined', '5%', 'PEC 2017 Sec. 2.30.1']
    ];
    
    (pdf as any).autoTable({
      startY: currentY + 5,
      head: [complianceDetails[0]],
      body: complianceDetails.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: margin }
    });
  }
  
  return pdf;
};

/**
 * Capture a Chart.js chart as an image
 * 
 * @param chart - Chart.js chart instance
 * @param options - Chart capture options
 * @returns Base64 encoded PNG image
 */
export const captureEnhancedChartAsImage = async (
  chart: Chart | null, 
  options: ChartCaptureOptions = {}
): Promise<string> => {
  if (!chart) {
    throw new Error('Chart instance is required');
  }
  
  const {
    width = 800,
    height = 400,
    quality = 0.95,
    optimizeForPrint = true,
    backgroundColor = '#ffffff'
  } = options;
  
  try {
    // Use the optimized chart image creator
    return await createOptimizedChartImage(chart, {
      width,
      height,
      quality,
      optimizeForPrint,
      backgroundColor
    });
  } catch (error) {
    console.error('Error capturing chart as image:', error);
    // Fallback to base64 URL from chart
    return chart.toBase64Image('image/png', quality);
  }
};

/**
 * Extract recommended conductor size from recommendations text
 * 
 * @param recommendations - Array of recommendation strings
 * @returns Recommended conductor size or empty string if not found
 */
function findRecommendedConductorSize(recommendations: string[]): string {
  // Look for recommendation about increasing conductor size
  const sizeRecommendation = recommendations.find(
    rec => rec.includes('Consider increasing conductor size from')
  );
  
  if (sizeRecommendation) {
    // Extract the recommended size using regex
    const match = sizeRecommendation.match(/to\s+([0-9/]+\s+[A-Z]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
} 