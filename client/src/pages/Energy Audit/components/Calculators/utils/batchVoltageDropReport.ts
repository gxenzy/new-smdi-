import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LoadSchedule, LoadItem } from '../ScheduleOfLoads/types';
import { VoltageDropResult } from './voltageDropUtils';
import { CircuitOptimizationResult } from './circuitOptimizationUtils';

interface BatchAnalysisResult {
  loadItem: LoadItem;
  result: VoltageDropResult | null;
  optimizedSize: string | null;
  error: string | null;
  voltageDropPercent: number | null;
  isCompliant: boolean | null;
  optimizationResult?: CircuitOptimizationResult | null;
}

interface SummaryStats {
  totalCircuits: number;
  compliantCircuits: number;
  nonCompliantCircuits: number;
  errorCircuits: number;
  avgVoltageDropPercent: number;
  maxVoltageDropPercent: number;
  circuitsNeedingOptimization?: number;
  totalMaterialCostChange?: number;
  totalEnergySavingsAnnual?: number;
}

interface BatchReportOptions {
  title?: string;
  includeOptimizationSuggestions?: boolean;
  includeNoncompliantOnly?: boolean;
  fileName?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Exports batch voltage drop analysis results to PDF
 */
export const exportBatchVoltageDropToPdf = (
  loadSchedule: LoadSchedule,
  analysisResults: BatchAnalysisResult[],
  summaryStats: SummaryStats,
  analysisParams: {
    conductorLength: number;
    conductorMaterial: string;
    conduitMaterial: string;
    temperature: number;
    phaseConfiguration: string;
    circuitType: string;
  },
  options: BatchReportOptions = {},
  optimizationParams?: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
    includeOptimization: boolean;
  }
) => {
  const {
    title = 'Batch Voltage Drop Analysis Report',
    includeOptimizationSuggestions = true,
    includeNoncompliantOnly = false,
    fileName = `batch-voltage-drop-${new Date().toISOString().slice(0, 10)}.pdf`,
    paperSize = 'a4',
    orientation = 'landscape'
  } = options;

  // Filter results based on options
  const resultsToInclude = includeNoncompliantOnly
    ? analysisResults.filter(r => r.isCompliant === false || r.error !== null)
    : analysisResults;

  // Create new PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize
  });

  const pageWidth = orientation === 'portrait' ? (paperSize === 'a4' ? 210 : 216) : (paperSize === 'a4' ? 297 : 279);
  const pageHeight = orientation === 'portrait' ? (paperSize === 'a4' ? 297 : 279) : (paperSize === 'a4' ? 210 : 216);
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);

  // Add title and date
  pdf.setFontSize(16);
  pdf.text(title, margin, margin + 10);

  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 16);

  // Add panel information
  pdf.setFontSize(12);
  pdf.text('Panel Information', margin, margin + 26);
  
  pdf.setFontSize(10);
  pdf.text(`Panel: ${loadSchedule.panelName}`, margin, margin + 32);
  pdf.text(`Description: ${loadSchedule.name}`, margin, margin + 38);
  pdf.text(`System Voltage: ${loadSchedule.voltage}V`, margin, margin + 44);
  pdf.text(`Power Factor: ${loadSchedule.powerFactor}`, margin, margin + 50);

  // Add analysis parameters
  pdf.setFontSize(12);
  pdf.text('Analysis Parameters', margin, margin + 60);
  
  pdf.setFontSize(10);
  pdf.text(`Conductor Length: ${analysisParams.conductorLength}m`, margin, margin + 66);
  pdf.text(`Circuit Type: ${analysisParams.circuitType}`, margin, margin + 72);
  pdf.text(`Conductor Material: ${analysisParams.conductorMaterial}`, margin, margin + 78);
  pdf.text(`Conduit Material: ${analysisParams.conduitMaterial}`, margin, margin + 84);
  pdf.text(`Phase Configuration: ${analysisParams.phaseConfiguration}`, margin, margin + 90);
  pdf.text(`Ambient Temperature: ${analysisParams.temperature}°C`, margin, margin + 96);

  // Add summary statistics
  pdf.setFontSize(12);
  pdf.text('Analysis Summary', margin, margin + 106);
  
  pdf.setFontSize(10);
  const compliancePercentage = summaryStats.totalCircuits > 0 
    ? ((summaryStats.compliantCircuits / (summaryStats.totalCircuits - summaryStats.errorCircuits)) * 100).toFixed(1)
    : '0.0';

  pdf.text(`Total Circuits: ${summaryStats.totalCircuits}`, margin, margin + 112);
  pdf.text(`Compliant Circuits: ${summaryStats.compliantCircuits} (${compliancePercentage}%)`, margin, margin + 118);
  pdf.text(`Non-Compliant Circuits: ${summaryStats.nonCompliantCircuits}`, margin, margin + 124);
  pdf.text(`Circuits with Errors: ${summaryStats.errorCircuits}`, margin, margin + 130);
  pdf.text(`Average Voltage Drop: ${summaryStats.avgVoltageDropPercent.toFixed(2)}%`, margin, margin + 136);
  pdf.text(`Maximum Voltage Drop: ${summaryStats.maxVoltageDropPercent.toFixed(2)}%`, margin, margin + 142);
  
  // Add optimization statistics if available
  if (optimizationParams?.includeOptimization && summaryStats.circuitsNeedingOptimization !== undefined) {
    pdf.text(`Circuits Needing Optimization: ${summaryStats.circuitsNeedingOptimization}`, margin, margin + 148);
    
    if (summaryStats.totalMaterialCostChange !== undefined) {
      pdf.text(
        `Material Cost Change: ${summaryStats.totalMaterialCostChange > 0 ? '+' : ''}$${summaryStats.totalMaterialCostChange.toFixed(2)}`,
        margin,
        margin + 154
      );
    }
    
    if (summaryStats.totalEnergySavingsAnnual !== undefined && optimizationParams.energyCostPerKwh !== undefined) {
      pdf.text(
        `Annual Energy Savings: ${summaryStats.totalEnergySavingsAnnual.toFixed(2)} kWh ($${(summaryStats.totalEnergySavingsAnnual * optimizationParams.energyCostPerKwh).toFixed(2)}/year)`,
        margin,
        margin + 160
      );
    }
  }

  // Add results table
  pdf.addPage();
  pdf.setFontSize(12);
  pdf.text('Analysis Results', margin, margin + 10);

  const tableData = resultsToInclude.map(item => {
    const optimizationRow = [
      item.loadItem.id.split('-')[0] || 'N/A',
      item.loadItem.description,
      item.loadItem.connectedLoad.toFixed(2) + ' W',
      (item.loadItem.current?.toFixed(2) || 'N/A') + ' A',
      item.loadItem.conductorSize || 'N/A',
      item.error ? 'Error' : (item.voltageDropPercent?.toFixed(2) || 'N/A') + '%',
      item.error ? 'Error' : (item.isCompliant ? 'Compliant' : 'Non-Compliant'),
      item.optimizedSize || 'N/A'
    ];
    
    // Add optimization details if available
    if (optimizationParams?.includeOptimization && item.optimizationResult) {
      optimizationRow.push(
        item.optimizationResult.priority.toUpperCase(),
        `$${Math.abs(item.optimizationResult.materialCostChange).toFixed(2)}`,
        `${item.optimizationResult.energySavingsAnnual.toFixed(2)} kWh`
      );
    } else {
      optimizationRow.push(
        item.error ? item.error : (item.optimizedSize && item.loadItem.conductorSize && item.optimizedSize !== item.loadItem.conductorSize) ? 'Upgrade recommended' : ''
      );
    }
    
    return optimizationRow;
  });

  // Prepare table columns based on whether optimization data is included
  let tableColumns = [
    { header: 'Circuit', dataKey: 'circuit' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Load', dataKey: 'load' },
    { header: 'Current', dataKey: 'current' },
    { header: 'Conductor Size', dataKey: 'conductorSize' },
    { header: 'Voltage Drop', dataKey: 'voltageDrop' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Optimized Size', dataKey: 'optimizedSize' }
  ];
  
  if (optimizationParams?.includeOptimization) {
    tableColumns = tableColumns.concat([
      { header: 'Priority', dataKey: 'priority' },
      { header: 'Material Cost', dataKey: 'materialCost' },
      { header: 'Energy Savings', dataKey: 'energySavings' }
    ]);
  } else {
    tableColumns.push({ header: 'Notes', dataKey: 'notes' });
  }

  (pdf as any).autoTable({
    head: [tableColumns.map(col => col.header)],
    body: tableData,
    startY: margin + 16,
    margin: { left: margin, right: margin },
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: optimizationParams?.includeOptimization ? {
      0: { cellWidth: 15 }, // Circuit number
      1: { cellWidth: 35 }, // Description
      2: { cellWidth: 25 }, // Load
      3: { cellWidth: 20 }, // Current
      4: { cellWidth: 25 }, // Conductor Size
      5: { cellWidth: 25 }, // Voltage Drop
      6: { cellWidth: 25 }, // Status
      7: { cellWidth: 25 }, // Optimized Size
      8: { cellWidth: 20 }, // Priority
      9: { cellWidth: 25 }, // Material Cost
      10: { cellWidth: 30 } // Energy Savings
    } : {
      0: { cellWidth: 20 }, // Circuit number
      1: { cellWidth: 50 }, // Description
      2: { cellWidth: 30 }, // Load
      3: { cellWidth: 25 }, // Current
      4: { cellWidth: 30 }, // Conductor Size
      5: { cellWidth: 25 }, // Voltage Drop
      6: { cellWidth: 30 }, // Status
      7: { cellWidth: 30 }, // Optimized Size
      8: { cellWidth: 40 }  // Notes
    },
    didDrawPage: (data: any) => {
      // Add header and footer on each page
      pdf.setFontSize(8);
      pdf.text(`${title} - Page ${data.pageNumber}`, margin, pageHeight - 5);
    }
  });

  // Add optimization recommendations if requested
  if (includeOptimizationSuggestions) {
    const needOptimization = analysisResults.filter(item => {
      if (item.error !== null) return false;
      
      // If optimization data is available, use priority to determine if optimization is needed
      if (optimizationParams?.includeOptimization && item.optimizationResult) {
        return item.optimizationResult.priority === 'critical' || item.optimizationResult.priority === 'high';
      }
      
      // Otherwise fall back to basic checks
      return item.isCompliant === false && 
             item.optimizedSize && 
             item.loadItem.conductorSize && 
             item.optimizedSize !== item.loadItem.conductorSize;
    });

    if (needOptimization.length > 0) {
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text('Optimization Recommendations', margin, margin + 10);
      
      pdf.setFontSize(10);
      pdf.text(
        'The following circuits would benefit from optimization:',
        margin,
        margin + 20
      );

      const recommendationData = needOptimization.map(item => {
        const baseData = [
          item.loadItem.id.split('-')[0] || 'N/A',
          item.loadItem.description,
          item.loadItem.conductorSize || 'N/A',
          item.optimizedSize || 'N/A',
          (item.voltageDropPercent?.toFixed(2) || 'N/A') + '%'
        ];
        
        if (optimizationParams?.includeOptimization && item.optimizationResult) {
          return [
            ...baseData,
            item.optimizationResult.priority.toUpperCase(),
            `$${Math.abs(item.optimizationResult.materialCostChange).toFixed(2)}`,
            `${item.optimizationResult.energySavingsAnnual.toFixed(2)} kWh`,
            item.optimizationResult.optimizationReason
          ];
        }
        
        return [...baseData, 'Upgrade conductor size'];
      });

      const recommendationColumns = optimizationParams?.includeOptimization ? 
        ['Circuit', 'Description', 'Current Size', 'Recommended Size', 'Voltage Drop', 'Priority', 'Material Cost', 'Energy Savings', 'Reason'] :
        ['Circuit', 'Description', 'Current Size', 'Recommended Size', 'Voltage Drop', 'Action'];

      (pdf as any).autoTable({
        head: [recommendationColumns],
        body: recommendationData,
        startY: margin + 26,
        margin: { left: margin, right: margin },
        styles: { overflow: 'linebreak', cellWidth: 'wrap' }
      });
      
      // Add notes about optimization if optimization data is available
      if (optimizationParams?.includeOptimization) {
        const tableEndY = (pdf as any).lastAutoTable.finalY + 10;
        
        pdf.setFontSize(12);
        pdf.text('Notes on Optimization Priorities:', margin, tableEndY);
        
        pdf.setFontSize(10);
        pdf.text('CRITICAL: Non-compliant with PEC requirements - immediate action recommended', margin, tableEndY + 10);
        pdf.text('HIGH: Positive ROI within reasonable timeframe - economically beneficial', margin, tableEndY + 18);
        pdf.text('MEDIUM: Close to voltage drop limits - consider upgrading during next maintenance', margin, tableEndY + 26);
        pdf.text('LOW: Already optimized or minimal benefit from changes', margin, tableEndY + 34);
        
        pdf.text(`Calculations based on: ${optimizationParams.operatingHoursPerYear} operating hours/year, $${optimizationParams.energyCostPerKwh}/kWh energy cost`, margin, tableEndY + 46);
      }
    }
  }

  // Save the PDF
  pdf.save(fileName);
};

export default exportBatchVoltageDropToPdf; 