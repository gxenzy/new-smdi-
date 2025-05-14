/**
 * Integrated Report Generator
 * 
 * Combines Schedule of Loads and Voltage Drop analysis data into comprehensive reports
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LoadSchedule, LoadItem } from '../ScheduleOfLoads/types';
import { exportBatchVoltageDropToPdf } from './batchVoltageDropReport';
import { VoltageDropResult } from './voltageDropUtils';
import { CircuitOptimizationResult } from './circuitOptimizationUtils';

export interface IntegratedReportOptions {
  title?: string;
  client?: string;
  project?: string;
  preparedBy?: string;
  date?: string;
  includeVoltageDropAnalysis?: boolean;
  includePowerCalculations?: boolean;
  includeLoadDetails?: boolean;
  includeOptimizationSuggestions?: boolean;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  includeLogo?: boolean;
  logoUrl?: string;
  includeCompanyInfo?: boolean;
  companyInfo?: {
    name?: string;
    address?: string;
    contact?: string;
    email?: string;
    website?: string;
  };
  includeTableOfContents?: boolean;
  customFooter?: string;
  optimizationParams?: {
    operatingHoursPerYear?: number;
    energyCostPerKwh?: number;
  };
}

interface VoltageDropDataForSchedule {
  [loadItemId: string]: {
    voltageDropPercent: number | null;
    isCompliant: boolean | null;
    optimizedSize: string | null;
    optimizationResult?: CircuitOptimizationResult | null;
  };
}

/**
 * Generate a comprehensive integrated report combining Schedule of Loads and Voltage Drop data
 * 
 * @param params Report generation parameters
 */
export function generateIntegratedReport(params: {
  loadSchedule: LoadSchedule;
  voltageDropData?: VoltageDropDataForSchedule;
  options?: IntegratedReportOptions;
  optimizationParams?: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
  };
}): void {
  const { loadSchedule, voltageDropData, options = {}, optimizationParams } = params;

  const {
    title = `Electrical Analysis Report - ${loadSchedule.panelName}`,
    client = 'Client Name',
    project = 'Project Name',
    preparedBy = 'Engineer Name',
    date = new Date().toLocaleDateString(),
    includeVoltageDropAnalysis = true,
    includePowerCalculations = true,
    includeLoadDetails = true,
    includeOptimizationSuggestions = true,
    paperSize = 'a4',
    orientation = 'portrait',
    includeLogo = false,
    logoUrl = '',
    includeCompanyInfo = false,
    companyInfo = {},
    includeTableOfContents = true,
    customFooter = '',
    optimizationParams: providedOptimizationParams
  } = options;

  // Set default company info values
  const defaultCompanyInfo = {
    name: 'Company Name',
    address: 'Company Address',
    contact: 'Contact Number',
    email: 'Email Address',
    website: 'Website'
  };

  // Merge with provided values
  const mergedCompanyInfo = {
    ...defaultCompanyInfo,
    ...companyInfo
  };

  // Create new PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize
  });

  const pageWidth = orientation === 'portrait' ? (paperSize === 'a4' ? 210 : 216) : (paperSize === 'a4' ? 297 : 279);
  const pageHeight = orientation === 'portrait' ? (paperSize === 'a4' ? 297 : 279) : (paperSize === 'a4' ? 210 : 216);
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Track pages for table of contents
  const tocReferences = {
    scheduleOfLoads: 0,
    voltageDropAnalysis: 0,
    powerCalculations: 0,
    optimizationSuggestions: 0
  };

  // Add document info
  pdf.setProperties({
    title: title,
    subject: `Electrical Analysis for ${loadSchedule.panelName}`,
    author: preparedBy,
    keywords: 'Schedule of Loads, Voltage Drop, Electrical Analysis',
    creator: 'Energy Audit Platform'
  });

  // Add cover page
  addCoverPage(pdf, {
    title, 
    client, 
    project, 
    preparedBy, 
    date, 
    includeLogo, 
    logoUrl,
    includeCompanyInfo,
    companyInfo: mergedCompanyInfo,
    pageWidth,
    pageHeight,
    margin
  });

  // Add table of contents placeholder if required
  let tocPageCount = 0;
  if (includeTableOfContents) {
    pdf.addPage();
    tocPageCount = 1;
    pdf.setFontSize(18);
    pdf.text('Table of Contents', margin, margin + 10);
  }

  // Generate Schedule of Loads section
  pdf.addPage();
  tocReferences.scheduleOfLoads = pdf.getNumberOfPages();
  addScheduleOfLoadsSection(pdf, loadSchedule, {
    margin,
    contentWidth,
    pageWidth,
    pageHeight,
    customFooter
  }, voltageDropData);

  // Generate Voltage Drop Analysis section if requested
  if (includeVoltageDropAnalysis && voltageDropData) {
    pdf.addPage();
    tocReferences.voltageDropAnalysis = pdf.getNumberOfPages();
    addVoltageDropSection(pdf, loadSchedule, {
      margin,
      contentWidth,
      pageWidth,
      pageHeight,
      customFooter
    }, voltageDropData);
  }

  // Generate Optimization Suggestions section if requested
  if (includeOptimizationSuggestions && voltageDropData) {
    pdf.addPage();
    tocReferences.optimizationSuggestions = pdf.getNumberOfPages();
    addOptimizationSection(pdf, loadSchedule, {
      margin,
      contentWidth,
      pageWidth,
      pageHeight,
      customFooter
    }, voltageDropData);
  }

  // Generate Power Calculations section if requested
  if (includePowerCalculations) {
    pdf.addPage();
    tocReferences.powerCalculations = pdf.getNumberOfPages();
    addPowerCalculationsSection(pdf, loadSchedule, {
      margin,
      contentWidth,
      pageWidth,
      pageHeight,
      customFooter
    });
  }

  // Fill in table of contents if required
  if (includeTableOfContents) {
    const currentPage = pdf.getNumberOfPages();
    pdf.setPage(tocPageCount + 1);
    
    pdf.setFontSize(12);
    pdf.text(`1. Schedule of Loads Analysis ................................. Page ${tocReferences.scheduleOfLoads}`, margin, margin + 30);
    
    if (includeVoltageDropAnalysis && voltageDropData) {
      pdf.text(`2. Voltage Drop Analysis ......................................... Page ${tocReferences.voltageDropAnalysis}`, margin, margin + 40);
    }
    
    if (includeOptimizationSuggestions && voltageDropData) {
      pdf.text(`3. Circuit Optimization Recommendations ................ Page ${tocReferences.optimizationSuggestions}`, margin, margin + 50);
    }
    
    if (includePowerCalculations) {
      pdf.text(`4. Power Consumption Analysis .............................. Page ${tocReferences.powerCalculations}`, margin, margin + 60);
    }
    
    pdf.setPage(currentPage);
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    if (i > tocPageCount + 1) { // Skip cover page and TOC
      pdf.setFontSize(10);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - margin);
      
      if (customFooter) {
        pdf.text(customFooter, margin, pageHeight - margin);
      }
    }
  }

  // Save or return the PDF
  pdf.save(`${loadSchedule.panelName.replace(/\s+/g, '_')}_integrated_report.pdf`);
}

/**
 * Add the cover page to the report
 */
function addCoverPage(
  pdf: jsPDF,
  options: {
    title: string;
    client: string;
    project: string;
    preparedBy: string;
    date: string;
    includeLogo: boolean;
    logoUrl: string;
    includeCompanyInfo: boolean;
    companyInfo: {
      name: string;
      address: string;
      contact: string;
      email: string;
      website: string;
    };
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { 
    title, 
    client, 
    project, 
    preparedBy, 
    date, 
    includeLogo, 
    logoUrl,
    includeCompanyInfo,
    companyInfo,
    pageWidth,
    pageHeight,
    margin
  } = options;

  // Add logo if requested
  let yOffset = margin + 20;
  if (includeLogo && logoUrl) {
    try {
      // Logo would be added here with proper image handling
      // This is a placeholder for actual image insertion
      yOffset += 40;
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  // Add title
  pdf.setFontSize(24);
  pdf.text(title, pageWidth / 2, yOffset, { align: 'center' });
  
  // Add project info
  yOffset += 40;
  pdf.setFontSize(14);
  pdf.text(`Project: ${project}`, pageWidth / 2, yOffset, { align: 'center' });
  
  yOffset += 10;
  pdf.text(`Client: ${client}`, pageWidth / 2, yOffset, { align: 'center' });
  
  yOffset += 30;
  pdf.setFontSize(12);
  pdf.text(`Prepared By: ${preparedBy}`, pageWidth / 2, yOffset, { align: 'center' });
  
  yOffset += 10;
  pdf.text(`Date: ${date}`, pageWidth / 2, yOffset, { align: 'center' });

  // Add company info if requested
  if (includeCompanyInfo) {
    yOffset = pageHeight - margin - 60;
    pdf.setFontSize(12);
    pdf.text(companyInfo.name, pageWidth / 2, yOffset, { align: 'center' });
    
    yOffset += 8;
    pdf.setFontSize(10);
    pdf.text(companyInfo.address, pageWidth / 2, yOffset, { align: 'center' });
    
    yOffset += 8;
    pdf.text(`Contact: ${companyInfo.contact}`, pageWidth / 2, yOffset, { align: 'center' });
    
    yOffset += 8;
    pdf.text(`Email: ${companyInfo.email}`, pageWidth / 2, yOffset, { align: 'center' });
    
    yOffset += 8;
    pdf.text(`Website: ${companyInfo.website}`, pageWidth / 2, yOffset, { align: 'center' });
  }
}

/**
 * Add the Schedule of Loads section to the report
 */
function addScheduleOfLoadsSection(
  pdf: jsPDF,
  loadSchedule: LoadSchedule,
  options: {
    margin: number;
    contentWidth: number;
    pageWidth: number;
    pageHeight: number;
    customFooter: string;
  },
  voltageDropData?: VoltageDropDataForSchedule
) {
  const { margin, contentWidth, pageWidth, pageHeight } = options;
  
  // Add section title
  pdf.setFontSize(18);
  pdf.text('Schedule of Loads Analysis', margin, margin + 10);
  
  // Add schedule info
  pdf.setFontSize(12);
  pdf.text('Panel Information:', margin, margin + 20);
  
  pdf.setFontSize(10);
  pdf.text(`Panel Name: ${loadSchedule.panelName}`, margin, margin + 30);
  pdf.text(`Description: ${loadSchedule.name}`, margin, margin + 38);
  pdf.text(`System Voltage: ${loadSchedule.voltage}V`, margin, margin + 46);
  pdf.text(`Power Factor: ${loadSchedule.powerFactor}`, margin, margin + 54);
  pdf.text(`Total Connected Load: ${loadSchedule.totalConnectedLoad.toFixed(2)} W`, margin, margin + 62);
  pdf.text(`Total Demand Load: ${loadSchedule.totalDemandLoad.toFixed(2)} W`, margin, margin + 70);
  pdf.text(`Current: ${loadSchedule.current.toFixed(2)} A`, margin, margin + 78);
  
  if (loadSchedule.circuitBreaker) {
    pdf.text(`Circuit Breaker: ${loadSchedule.circuitBreaker}`, margin, margin + 86);
  }
  
  if (loadSchedule.conductorSize) {
    pdf.text(`Conductor Size: ${loadSchedule.conductorSize}`, margin, margin + 94);
  }
  
  // Add loads table
  pdf.setFontSize(12);
  pdf.text('Circuit Details:', margin, margin + 110);
  
  const tableData = loadSchedule.loads.map(load => {
    const voltageDropInfo = voltageDropData?.[load.id];
    return [
      load.id.split('-')[0] || 'N/A',
      load.description,
      `${load.quantity}`,
      `${load.rating.toFixed(0)} W`,
      `${load.demandFactor.toFixed(2)}`,
      `${load.connectedLoad.toFixed(0)} W`,
      `${load.demandLoad.toFixed(0)} W`,
      load.current ? `${load.current.toFixed(2)} A` : 'N/A',
      load.conductorSize || 'N/A',
      voltageDropInfo?.voltageDropPercent !== undefined && voltageDropInfo.voltageDropPercent !== null ? 
        `${voltageDropInfo.voltageDropPercent.toFixed(2)}%` : 'N/A',
      voltageDropInfo?.isCompliant !== undefined && voltageDropInfo.isCompliant !== null ?
        (voltageDropInfo.isCompliant ? 'Yes' : 'No') : 'N/A'
    ];
  });
  
  const tableColumns = [
    'Circuit',
    'Description',
    'Qty',
    'Rating',
    'D.F.',
    'Connected',
    'Demand',
    'Current',
    'Wire Size',
    'V-Drop %',
    'Compliant'
  ];
  
  (pdf as any).autoTable({
    head: [tableColumns],
    body: tableData,
    startY: margin + 116,
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 10 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 15 },
      10: { cellWidth: 15 }
    }
  });
}

/**
 * Add the Voltage Drop Analysis section to the report
 */
function addVoltageDropSection(
  pdf: jsPDF,
  loadSchedule: LoadSchedule,
  options: {
    margin: number;
    contentWidth: number;
    pageWidth: number;
    pageHeight: number;
    customFooter: string;
  },
  voltageDropData: VoltageDropDataForSchedule
) {
  const { margin, contentWidth, pageWidth, pageHeight } = options;
  
  // Add section title
  pdf.setFontSize(18);
  pdf.text('Voltage Drop Analysis', margin, margin + 10);
  
  // Add voltage drop analysis info
  pdf.setFontSize(12);
  pdf.text('Analysis Parameters:', margin, margin + 25);
  
  pdf.setFontSize(10);
  pdf.text(`System Voltage: ${loadSchedule.voltage}V`, margin, margin + 35);
  pdf.text(`Phase Configuration: ${loadSchedule.phaseConfiguration || 'single-phase'}`, margin, margin + 43);
  
  if (loadSchedule.conductorLength) {
    pdf.text(`Conductor Length: ${loadSchedule.conductorLength}m`, margin, margin + 51);
  }
  
  // Add summary statistics
  pdf.setFontSize(12);
  pdf.text('Compliance Summary:', margin, margin + 65);
  
  // Calculate compliance statistics
  const totalCircuits = Object.keys(voltageDropData).length;
  const compliantCircuits = Object.values(voltageDropData).filter(data => data.isCompliant === true).length;
  const nonCompliantCircuits = Object.values(voltageDropData).filter(data => data.isCompliant === false).length;
  const undeterminedCircuits = totalCircuits - compliantCircuits - nonCompliantCircuits;
  
  const compliancePercentage = totalCircuits > 0 ? 
    ((compliantCircuits / (totalCircuits - undeterminedCircuits)) * 100).toFixed(1) : '0.0';
  
  pdf.setFontSize(10);
  pdf.text(`Total Circuits: ${totalCircuits}`, margin, margin + 75);
  pdf.text(`Compliant Circuits: ${compliantCircuits} (${compliancePercentage}%)`, margin, margin + 83);
  pdf.text(`Non-Compliant Circuits: ${nonCompliantCircuits}`, margin, margin + 91);
  pdf.text(`Circuits with Undetermined Compliance: ${undeterminedCircuits}`, margin, margin + 99);
  
  // Add voltage drop results table
  pdf.setFontSize(12);
  pdf.text('Voltage Drop Analysis Results:', margin, margin + 115);
  
  const tableData = loadSchedule.loads.map(load => {
    const voltageDropInfo = voltageDropData?.[load.id];
    return [
      load.id.split('-')[0] || 'N/A',
      load.description,
      load.current ? `${load.current.toFixed(2)} A` : 'N/A',
      load.conductorSize || 'N/A',
      voltageDropInfo?.voltageDropPercent !== undefined && voltageDropInfo.voltageDropPercent !== null ?
        `${voltageDropInfo.voltageDropPercent.toFixed(2)}%` : 'N/A',
      load.voltageDrop !== undefined ? `${load.voltageDrop.toFixed(2)}V` : 'N/A',
      load.receivingEndVoltage !== undefined ? `${load.receivingEndVoltage.toFixed(1)}V` : 'N/A',
      voltageDropInfo?.isCompliant !== undefined && voltageDropInfo.isCompliant !== null ?
        (voltageDropInfo.isCompliant ? 'Yes' : 'No') : 'N/A',
      voltageDropInfo?.optimizedSize || 'N/A'
    ];
  });
  
  const tableColumns = [
    'Circuit',
    'Description',
    'Current',
    'Wire Size',
    'V-Drop %',
    'V-Drop',
    'Receiving Voltage',
    'PEC Compliant',
    'Optimal Size'
  ];
  
  (pdf as any).autoTable({
    head: [tableColumns],
    body: tableData,
    startY: margin + 121,
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 15 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 }
    }
  });
}

/**
 * Add the Optimization Suggestions section to the report
 */
function addOptimizationSection(
  pdf: jsPDF,
  loadSchedule: LoadSchedule,
  options: {
    margin: number;
    contentWidth: number;
    pageWidth: number;
    pageHeight: number;
    customFooter: string;
  },
  voltageDropData: VoltageDropDataForSchedule
) {
  const { margin, contentWidth, pageWidth, pageHeight } = options;
  
  // Add section title
  pdf.setFontSize(18);
  pdf.text('Circuit Optimization Recommendations', margin, margin + 10);
  
  // Find circuits needing optimization
  const circuitsNeedingOptimization = loadSchedule.loads.filter(load => {
    const voltageDropInfo = voltageDropData?.[load.id];
    return (
      (voltageDropInfo?.isCompliant === false ||
      (voltageDropInfo?.optimizationResult?.priority === 'critical' || 
       voltageDropInfo?.optimizationResult?.priority === 'high')) &&
      voltageDropInfo?.optimizedSize &&
      load.conductorSize &&
      voltageDropInfo.optimizedSize !== load.conductorSize
    );
  });
  
  // Add optimization summary
  pdf.setFontSize(12);
  pdf.text('Optimization Summary:', margin, margin + 25);
  
  pdf.setFontSize(10);
  pdf.text(`Total Circuits Requiring Optimization: ${circuitsNeedingOptimization.length}`, margin, margin + 35);
  
  if (circuitsNeedingOptimization.length === 0) {
    pdf.text('All circuits are compliant or require no conductor size modifications.', margin, margin + 45);
    return;
  }
  
  // Calculate total material cost change and energy savings
  let totalMaterialCostChange = 0;
  let totalEnergySavingsAnnual = 0;
  let criticalCircuits = 0;
  let highPriorityCircuits = 0;
  
  circuitsNeedingOptimization.forEach(load => {
    const optimizationResult = voltageDropData[load.id]?.optimizationResult;
    if (optimizationResult) {
      totalMaterialCostChange += optimizationResult.materialCostChange;
      totalEnergySavingsAnnual += optimizationResult.energySavingsAnnual;
      
      if (optimizationResult.priority === 'critical') {
        criticalCircuits++;
      } else if (optimizationResult.priority === 'high') {
        highPriorityCircuits++;
      }
    }
  });
  
  // Add recommendation statistics
  pdf.text(`Critical Priority Circuits (Non-Compliant): ${criticalCircuits}`, margin, margin + 45);
  pdf.text(`High Priority Circuits (ROI Positive): ${highPriorityCircuits}`, margin, margin + 53);
  pdf.text(`Total Material Cost Change: $${totalMaterialCostChange.toFixed(2)}`, margin, margin + 61);
  pdf.text(`Annual Energy Savings: ${totalEnergySavingsAnnual.toFixed(2)} kWh/year`, margin, margin + 69);
  
  // Add recommendations explanation
  pdf.setFontSize(10);
  pdf.text(
    'The following circuits would benefit from optimization to improve compliance and/or efficiency:',
    margin,
    margin + 85
  );
  
  // Add optimization recommendations table
  const tableData = circuitsNeedingOptimization.map(load => {
    const voltageDropInfo = voltageDropData[load.id];
    const optimizationResult = voltageDropInfo.optimizationResult;
    
    return [
      load.id.split('-')[0] || 'N/A',
      load.description,
      load.current ? `${load.current.toFixed(2)} A` : 'N/A',
      load.conductorSize || 'N/A',
      voltageDropInfo.optimizedSize || 'N/A',
      voltageDropInfo.voltageDropPercent ? `${voltageDropInfo.voltageDropPercent.toFixed(2)}%` : 'N/A',
      optimizationResult ? optimizationResult.priority.toUpperCase() : 'MEDIUM',
      optimizationResult ? `$${Math.abs(optimizationResult.materialCostChange).toFixed(2)}` : 'N/A',
      optimizationResult ? `${optimizationResult.energySavingsAnnual.toFixed(2)} kWh` : 'N/A'
    ];
  });
  
  const tableColumns = [
    'Circuit',
    'Description',
    'Current',
    'Current Size',
    'Recommended Size',
    'Voltage Drop',
    'Priority',
    'Material Cost',
    'Annual Savings'
  ];
  
  (pdf as any).autoTable({
    head: [tableColumns],
    body: tableData,
    startY: margin + 95,
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 30 },
      2: { cellWidth: 12 },
      3: { cellWidth: 15 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 18 }
    }
  });
  
  // Add implementation notes
  const tableEndY = (pdf as any).lastAutoTable.finalY + 10;
  
  pdf.setFontSize(12);
  pdf.text('Implementation Notes:', margin, tableEndY);
  
  pdf.setFontSize(10);
  pdf.text(
    '1. Critical priority circuits should be addressed immediately to ensure voltage drop compliance.',
    margin,
    tableEndY + 10
  );
  
  pdf.text(
    '2. High priority circuits offer positive returns on investment through energy savings.',
    margin,
    tableEndY + 18
  );
  
  pdf.text(
    '3. Material costs represent the incremental cost of upgrading conductors.',
    margin,
    tableEndY + 26
  );
  
  pdf.text(
    '4. Annual savings are based on reduced resistive losses in the conductors.',
    margin,
    tableEndY + 34
  );
  
  pdf.text(
    '5. After implementing changes, revalidate the entire panel to ensure compliance.',
    margin,
    tableEndY + 42
  );
}

/**
 * Add the Power Calculations section to the report
 */
function addPowerCalculationsSection(
  pdf: jsPDF,
  loadSchedule: LoadSchedule,
  options: {
    margin: number;
    contentWidth: number;
    pageWidth: number;
    pageHeight: number;
    customFooter: string;
  }
) {
  const { margin, contentWidth, pageWidth, pageHeight } = options;
  
  // Add section title
  pdf.setFontSize(18);
  pdf.text('Power Consumption Analysis', margin, margin + 10);
  
  // Add summary information
  pdf.setFontSize(12);
  pdf.text('Load Summary:', margin, margin + 25);
  
  pdf.setFontSize(10);
  pdf.text(`Total Connected Load: ${loadSchedule.totalConnectedLoad.toFixed(2)} W`, margin, margin + 35);
  pdf.text(`Total Demand Load: ${loadSchedule.totalDemandLoad.toFixed(2)} W`, margin, margin + 43);
  pdf.text(`Total Current: ${loadSchedule.current.toFixed(2)} A`, margin, margin + 51);
  
  // Calculate apparent power
  const apparentPower = loadSchedule.totalDemandLoad / loadSchedule.powerFactor;
  pdf.text(`Apparent Power: ${apparentPower.toFixed(2)} VA`, margin, margin + 59);
  
  // Add operating hours information if available
  if (loadSchedule.hours) {
    pdf.setFontSize(12);
    pdf.text('Operating Schedule:', margin, margin + 75);
    
    pdf.setFontSize(10);
    let yOffset = margin + 85;
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    daysOfWeek.forEach(day => {
      if (loadSchedule.hours?.[day]) {
        const dayHours = loadSchedule.hours[day];
        const hoursText = dayHours.map(h => `${h.start} - ${h.end}`).join(', ');
        pdf.text(`${day}: ${hoursText}`, margin, yOffset);
        yOffset += 8;
      }
    });
  }
  
  // Add estimated consumption information (placeholder - would need actual data)
  pdf.setFontSize(12);
  pdf.text('Estimated Energy Consumption:', margin, margin + 130);
  
  // This would ideally use actual consumption data, but for now we'll calculate an estimate
  const estimatedHoursPerDay = 8; // Assumption
  const estimatedDaysPerMonth = 22; // Assumption
  
  const dailyConsumption = (loadSchedule.totalDemandLoad / 1000) * estimatedHoursPerDay; // kWh
  const monthlyConsumption = dailyConsumption * estimatedDaysPerMonth; // kWh
  const annualConsumption = monthlyConsumption * 12; // kWh
  
  pdf.setFontSize(10);
  pdf.text(`Estimated Daily Consumption: ${dailyConsumption.toFixed(2)} kWh/day`, margin, margin + 140);
  pdf.text(`Estimated Monthly Consumption: ${monthlyConsumption.toFixed(2)} kWh/month`, margin, margin + 148);
  pdf.text(`Estimated Annual Consumption: ${annualConsumption.toFixed(2)} kWh/year`, margin, margin + 156);
  
  // Add notes about assumptions
  pdf.setFontSize(8);
  pdf.text(
    'Note: Consumption estimates are based on assumed operating hours and may not reflect actual usage patterns.',
    margin,
    margin + 170
  );
} 