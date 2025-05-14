import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadSchedule } from '../ScheduleOfLoads/types';
import { BatchOptimizationResult, CircuitOptimizationResult } from './circuitOptimizationUtils';
import Chart from 'chart.js/auto';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';

interface BatchSizingExportOptions {
  title?: string;
  includeNonOptimizedCircuits?: boolean;
  includeCharts?: boolean;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

const defaultExportOptions: BatchSizingExportOptions = {
  title: 'Batch Sizing Optimization Report',
  includeNonOptimizedCircuits: false,
  includeCharts: true,
  paperSize: 'a4',
  orientation: 'landscape'
};

/**
 * Export batch sizing optimization results to PDF
 * 
 * @param loadSchedule The load schedule that was optimized
 * @param optimizationResults The batch optimization results
 * @param optimizationParams Parameters used for optimization
 * @param options PDF export options
 */
export async function exportBatchSizingToPdf(
  loadSchedule: LoadSchedule,
  optimizationResults: BatchOptimizationResult,
  optimizationParams: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
    analysisTimeframeYears: number;
    maxVoltageDropPercent: number;
  },
  options: BatchSizingExportOptions = {}
): Promise<void> {
  // Merge default options with provided options
  const mergedOptions = { ...defaultExportOptions, ...options };
  
  try {
    // Setup PDF document
    const orientation = mergedOptions.orientation || 'landscape';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: mergedOptions.paperSize || 'a4'
    });
    
    // Add autoTable plugin to jsPDF
    (pdf as any).autoTable = autoTable;
    
    // Get page dimensions
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    const margin = 10;
    
    // Add title and basic information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(mergedOptions.title || 'Batch Sizing Optimization Report', margin, margin + 5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Panel: ${loadSchedule.panelName || 'Unnamed Panel'}`, margin, margin + 12);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, margin + 17);
    pdf.text(`System Voltage: ${loadSchedule.voltage}V`, margin, margin + 22);
    
    // Add summary section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Optimization Summary', margin, margin + 30);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Circuits', optimizationResults.results.length.toString()],
      ['Non-Compliant Circuits', optimizationResults.totalNonCompliantCircuits.toString()],
      ['Optimizable Circuits', optimizationResults.totalOptimizedCircuits.toString()],
      ['Material Cost Change', `$${Math.abs(optimizationResults.totalMaterialCostChange).toFixed(2)}`],
      ['Annual Energy Savings', `$${Math.abs(optimizationResults.totalEnergySavingsAnnual).toFixed(2)}`],
      ['Average Payback Period', `${(optimizationResults.results.reduce((sum, r) => sum + (r.breakEvenTimeMonths || 0), 0) / optimizationResults.results.length / 12).toFixed(1)} years`]
    ];
    
    // Create summary table
    (pdf as any).autoTable({
      startY: margin + 35,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 }
      },
      margin: { left: margin },
      tableWidth: 'auto'
    });
    
    // Add optimization parameters
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Optimization Parameters', margin, (pdf as any).lastAutoTable.finalY + 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const paramsData = [
      ['Operating Hours per Year', optimizationParams.operatingHoursPerYear.toString()],
      ['Energy Cost per kWh', `$${optimizationParams.energyCostPerKwh.toFixed(2)}`],
      ['Analysis Timeframe', `${optimizationParams.analysisTimeframeYears} years`],
      ['Maximum Voltage Drop', `${optimizationParams.maxVoltageDropPercent}%`]
    ];
    
    // Create parameters table
    (pdf as any).autoTable({
      startY: (pdf as any).lastAutoTable.finalY + 15,
      head: [['Parameter', 'Value']],
      body: paramsData,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 }
      },
      margin: { left: margin },
      tableWidth: 'auto'
    });
    
    // Create charts if enabled
    if (mergedOptions.includeCharts) {
      await addChartsSection(pdf, optimizationResults, pageWidth, margin);
    }
    
    // Add optimization results table
    pdf.addPage();
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Circuit Optimization Results', margin, margin + 5);
    
    // Filter results based on options
    const filteredResults = mergedOptions.includeNonOptimizedCircuits 
      ? optimizationResults.results 
      : optimizationResults.results.filter(r => r.optimizedConductorSize !== r.originalConductorSize);
    
    // Sort results by priority (critical, high, medium, low)
    const sortedResults = [...filteredResults].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });
    
    // Create table data
    const tableData = sortedResults.map(result => {
      const loadItem = loadSchedule.loads.find(l => l.id === result.loadId);
      
      // Determine if circuit needs optimization
      const needsOptimization = result.optimizedConductorSize !== result.originalConductorSize;
      
      return [
        loadItem?.description || 'Unknown Circuit',
        result.originalConductorSize,
        `${result.originalVoltageDropPercent.toFixed(2)}%`,
        result.optimizedConductorSize,
        `${result.optimizedVoltageDropPercent.toFixed(2)}%`,
        result.priority,
        `$${Math.abs(result.materialCostChange).toFixed(2)}`,
        `$${result.energySavingsAnnual.toFixed(2)}/yr`,
        `${(result.breakEvenTimeMonths / 12).toFixed(1)} yrs`,
        needsOptimization ? 'Yes' : 'No'
      ];
    });
    
    // Create main results table
    (pdf as any).autoTable({
      startY: margin + 10,
      head: [['Circuit', 'Current Size', 'Current VD%', 'Recommended', 'New VD%', 'Priority', 'Material Cost', 'Annual Savings', 'ROI Period', 'Optimize?']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 }, // Circuit description
        5: { cellWidth: 20 }, // Priority
        8: { cellWidth: 20 }  // ROI Period
      },
      headStyles: {
        fillColor: [60, 130, 190],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      didDrawPage: (data: any) => {
        // Add header and footer on each page
        pdf.setFontSize(8);
        pdf.text(`${mergedOptions.title} - Page ${data.pageNumber}`, margin, pageHeight - 5);
      }
    });
    
    // Add summary text
    const finalY = (pdf as any).lastAutoTable.finalY;
    pdf.setFontSize(10);
    pdf.text(`Total optimizable circuits: ${optimizationResults.totalOptimizedCircuits} out of ${optimizationResults.results.length}`, margin, finalY + 10);
    pdf.text(`Potential annual savings: $${Math.abs(optimizationResults.totalEnergySavingsAnnual).toFixed(2)}`, margin, finalY + 15);
    
    // Save the PDF
    pdf.save(`${loadSchedule.panelName || 'panel'}-sizing-optimization.pdf`);
  } catch (error) {
    console.error('Error generating batch sizing PDF report:', error);
    throw error;
  }
}

/**
 * Add charts to the PDF
 */
async function addChartsSection(
  pdf: jsPDF,
  optimizationResults: BatchOptimizationResult,
  pageWidth: number,
  margin: number
): Promise<void> {
  // Calculate chart sizes
  const chartWidth = pageWidth / 2 - margin * 2;
  const chartHeight = 70;
  
  // Add charts section title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Optimization Analysis', margin, (pdf as any).lastAutoTable.finalY + 15);
  
  try {
    // Create canvas for charts
    const canvas = document.createElement('canvas');
    canvas.width = chartWidth * 4; // High resolution for better image quality
    canvas.height = chartHeight * 4;
    document.body.appendChild(canvas);
    
    // Create priority distribution chart
    const priorities = optimizationResults.results.reduce((acc, result) => {
      acc[result.priority] = (acc[result.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const priorityChartConfig: ChartConfiguration<'pie', number[], string> = {
      type: 'pie',
      data: {
        labels: Object.keys(priorities),
        datasets: [{
          data: Object.values(priorities),
          backgroundColor: [
            '#ff6384', // Critical
            '#ffcd56', // High
            '#36a2eb', // Medium
            '#8ee7f9'  // Low
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Circuit Optimization Priority Distribution'
          },
          legend: {
            position: 'right'
          }
        }
      }
    };
    
    // Create chart instance
    new Chart(canvas, priorityChartConfig);
    
    // Add chart to PDF
    const chartImage = canvas.toDataURL('image/png');
    pdf.addImage(
      chartImage,
      'PNG',
      margin,
      (pdf as any).lastAutoTable.finalY + 20,
      chartWidth,
      chartHeight
    );
    
    // Clean up canvas
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create ROI chart
    const roiBuckets = {
      'Less than 1 year': 0,
      '1-2 years': 0,
      '2-3 years': 0,
      '3-5 years': 0,
      'Over 5 years': 0
    };
    
    optimizationResults.results.forEach(result => {
      const roiYears = result.breakEvenTimeMonths / 12;
      if (roiYears < 1) roiBuckets['Less than 1 year']++;
      else if (roiYears < 2) roiBuckets['1-2 years']++;
      else if (roiYears < 3) roiBuckets['2-3 years']++;
      else if (roiYears < 5) roiBuckets['3-5 years']++;
      else roiBuckets['Over 5 years']++;
    });
    
    const roiChartConfig: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: Object.keys(roiBuckets),
        datasets: [{
          label: 'Number of Circuits',
          data: Object.values(roiBuckets),
          backgroundColor: '#4caf50'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'ROI Distribution'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Circuits'
            },
            ticks: {
              precision: 0
            }
          }
        }
      }
    };
    
    // Create ROI chart instance
    new Chart(canvas, roiChartConfig);
    
    // Add ROI chart to PDF
    const roiChartImage = canvas.toDataURL('image/png');
    pdf.addImage(
      roiChartImage,
      'PNG',
      margin + chartWidth + margin,
      (pdf as any).lastAutoTable.finalY + 20,
      chartWidth,
      chartHeight
    );
    
    // Clean up and remove canvas
    document.body.removeChild(canvas);
  } catch (error) {
    console.error('Error creating charts:', error);
    // Continue with PDF generation even if charts fail
  }
} 