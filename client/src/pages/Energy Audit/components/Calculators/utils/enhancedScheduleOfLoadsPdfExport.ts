/**
 * Enhanced Schedule of Loads PDF Export
 * 
 * This module provides an improved PDF export for the Schedule of Loads calculator
 * with better visualizations, analysis sections, and compliance information.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadSchedule, LoadItem } from '../ScheduleOfLoads/types';
import Chart from 'chart.js/auto';
import { analyzeLoadScheduleForEconomicSizing } from './economicSizingUtils';

// Enhanced types for LoadItem with voltage drop and compliance information
interface EnhancedLoadItem extends LoadItem {
  voltageDropResults?: {
    voltageDropPercent: number;
    voltageDropVolts?: number;
    isCompliant?: boolean;
  };
  complianceStatus?: {
    isCompliant: boolean;
    issues?: string[];
    recommendations?: string[];
  };
}

// Define ProjectInfo interface for project information in PDF exports
export interface ProjectInfo {
  projectName: string;
  projectNumber: string;
  clientName: string;
  preparedBy: string;
  reviewedBy: string;
  projectDate: string;
  buildingName: string;
  buildingAddress: string;
}

// Extended LoadItem with additional properties
export interface ExtendedLoadItem extends LoadItem {
  power?: number;
  va?: number;
  category?: string;
  circuitNumber?: string;
  pecCompliance?: {
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
    complianceDetails?: Array<{
      requirement: string;
      standard: string;
      isCompliant: boolean;
      actualValue: string;
      recommendation?: string;
    }>;
  };
  optimalConductorSize?: string;
}

// Types for PDF export options
export interface ExportOptions {
  title?: string;
  fileName?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  includeEconomicAnalysis?: boolean;
  includeVoltageDropAnalysis?: boolean;
  includePhaseBalanceAnalysis?: boolean;
  includeComplianceDetails?: boolean;
  companyName?: string;
  companyLogo?: string;
  theme?: 'light' | 'dark';
  projectInfo?: ProjectInfo;
}

// Default options for PDF export
const defaultOptions: ExportOptions = {
  title: 'Schedule of Loads Analysis',
  fileName: 'schedule-of-loads-report.pdf',
  paperSize: 'a4',
  orientation: 'landscape',
  includeEconomicAnalysis: true,
  includeVoltageDropAnalysis: true,
  includePhaseBalanceAnalysis: true,
  includeComplianceDetails: true,
  theme: 'light'
};

/**
 * Format a number with specified decimal places
 */
const formatNumber = (value: number | undefined, decimalPlaces: number = 2): string => {
  if (value === undefined || value === null) return '-';
  return value.toFixed(decimalPlaces);
};

/**
 * Helper function to create a default ProjectInfo object 
 */
function createDefaultProjectInfo(loadSchedule: LoadSchedule): ProjectInfo {
  return {
    projectName: `Electrical Load Analysis - ${loadSchedule.panelName || 'Panel'}`,
    projectNumber: 'N/A',
    clientName: 'N/A',
    preparedBy: 'Energy Audit Platform',
    reviewedBy: '',
    projectDate: new Date().toLocaleDateString(),
    buildingName: 'N/A',
    buildingAddress: 'N/A'
  };
}

/**
 * Generate color palette for chart visualizations
 */
function generateColorPalette(count: number): string[] {
  const baseColors = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
    '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const r = Math.floor(Math.random() * 200) + 55;
    const g = Math.floor(Math.random() * 200) + 55;
    const b = Math.floor(Math.random() * 200) + 55;
    colors.push(`rgb(${r},${g},${b})`);
  }
  
  return colors;
}

/**
 * Export Schedule of Loads to enhanced PDF with visualizations and analysis
 * 
 * @param loadSchedule The load schedule data to export
 * @param calculationResults Optional calculation results to include
 * @param options PDF export options
 * @returns Promise that resolves when the PDF is generated
 */
export async function exportScheduleOfLoadsToPdf(
  loadSchedule: LoadSchedule,
  calculationResults: any = null,
  options: ExportOptions = {}
): Promise<void> {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    // Initialize jsPDF with proper orientation
    const doc = new jsPDF({
      orientation: mergedOptions.orientation,
      unit: 'mm',
      format: mergedOptions.paperSize
    });
    
    // Add autoTable plugin to jsPDF
    (doc as any).autoTable = autoTable;
    
    // Set metadata
    doc.setProperties({
      title: mergedOptions.title,
      subject: 'Schedule of Loads Analysis',
      author: 'Energy Audit Platform',
      keywords: 'schedule of loads, electrical, PEC 2017, energy audit',
      creator: 'Energy Audit Platform'
    });

    // Calculate page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Add basic cover page
    doc.setFillColor(60, 130, 190);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SCHEDULE OF LOADS ANALYSIS', margin, 40);
    
    // Add subtitle
    doc.setFontSize(14);
    doc.text(`Panel: ${loadSchedule.panelName || 'Unnamed Panel'}`, margin, 55);
    
    // Add basic panel information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Panel Information', margin, 80);
    doc.setFontSize(10);
    doc.text(`Voltage: ${loadSchedule.voltage}V`, margin, 90);
    doc.text(`Phase Configuration: ${loadSchedule.phaseConfiguration || 'Single-phase'}`, margin, 100);
    doc.text(`Connected Load: ${formatNumber(loadSchedule.totalConnectedLoad)} W`, margin, 110);
    doc.text(`Demand Load: ${formatNumber(loadSchedule.totalDemandLoad)} W`, margin, 120);
    doc.text(`Total Current: ${formatNumber(loadSchedule.current)} A`, margin, 130);
    doc.text(`Power Factor: ${formatNumber(loadSchedule.powerFactor)}`, margin, 140);
    
    // Add loads table with extended information
    const tableHeaders = [
      'Description', 
      'Qty', 
      'Rating (W)', 
      'Connected (W)', 
      'Demand (W)', 
      'Current (A)', 
      'CB Size', 
      'Conductor', 
      'VD %',
      'Compliance'
    ];
    
    const tableRows = loadSchedule.loads.map(load => {
      const enhancedLoad = load as EnhancedLoadItem;
      const voltageDropPercent = enhancedLoad.voltageDropResults?.voltageDropPercent || '-';
      const compliance = enhancedLoad.complianceStatus?.isCompliant === true ? 'Pass' : 
                         enhancedLoad.complianceStatus?.isCompliant === false ? 'Fail' : '-';
      
      return [
        load.description,
        load.quantity.toString(),
        formatNumber(load.rating),
        formatNumber(load.connectedLoad),
        formatNumber(load.demandLoad),
        formatNumber(load.current),
        load.circuitBreaker || '-',
        load.conductorSize || '-',
        voltageDropPercent !== '-' ? `${formatNumber(voltageDropPercent as number)}%` : '-',
        compliance
      ];
    });
    
    // Add a new page for the table
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Schedule of Loads', margin, margin);
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: margin + 10,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Description
        8: { cellWidth: 15 }, // VD %
        9: { cellWidth: 20 }  // Compliance
      },
      headStyles: {
        fillColor: [60, 130, 190],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Add voltage drop analysis section if enabled
    if (mergedOptions.includeVoltageDropAnalysis) {
      try {
        // Count circuits with voltage drop information
        const circuitsWithVoltageDropInfo = loadSchedule.loads.filter(
          load => (load as EnhancedLoadItem).voltageDropResults?.voltageDropPercent !== undefined
        );
        
        if (circuitsWithVoltageDropInfo.length > 0) {
          // Create a new page for voltage drop analysis
          doc.addPage();
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Voltage Drop Analysis', margin, margin);
          
          // Summary text
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(
            'This section provides an analysis of voltage drop in the circuits. According to PEC 2017, ' +
            'the recommended maximum voltage drop is 3% for branch circuits and 5% for the total drop including feeders.',
            margin, margin + 10, { maxWidth: pageWidth - (2 * margin) }
          );
          
          // Prepare data for voltage drop chart
          const circuitsWithHighVD = circuitsWithVoltageDropInfo.filter(load => 
            ((load as EnhancedLoadItem).voltageDropResults?.voltageDropPercent || 0) > 3);
          
          // Add summary statistics
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Voltage Drop Summary:', margin, margin + 25);
          doc.setFont('helvetica', 'normal');
          doc.text(`- Total circuits analyzed: ${circuitsWithVoltageDropInfo.length}`, margin + 5, margin + 35);
          doc.text(`- Circuits exceeding 3% voltage drop: ${circuitsWithHighVD.length}`, margin + 5, margin + 43);
          
          if (circuitsWithHighVD.length > 0) {
            doc.setTextColor(200, 0, 0);
            doc.text('⚠️ Attention required: Some circuits exceed recommended voltage drop limits.', margin + 5, margin + 51);
            doc.setTextColor(0, 0, 0);
          } else {
            doc.setTextColor(0, 100, 0);
            doc.text('✓ All circuits are within recommended voltage drop limits.', margin + 5, margin + 51);
            doc.setTextColor(0, 0, 0);
          }
          
          // Add table of circuits with high voltage drop
          if (circuitsWithHighVD.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Circuits Requiring Attention:', margin, margin + 65);
            
            const highVDHeaders = ['Description', 'Current (A)', 'Length (m)', 'Conductor', 'VD%', 'Recommendation'];
            const highVDRows = circuitsWithHighVD.map(load => {
              const enhancedLoad = load as EnhancedLoadItem;
              let recommendation = 'Consider increasing conductor size';
              if (load.circuitDetails?.wireType?.includes('ALUMINUM')) {
                recommendation += ' or switching to copper conductor';
              }
              if (load.conductorLength && load.conductorLength > 50) {
                recommendation += ' or reducing conductor length if possible';
              }
              return [
                load.description,
                formatNumber(load.current),
                formatNumber(load.conductorLength),
                load.conductorSize || '-',
                formatNumber(enhancedLoad.voltageDropResults?.voltageDropPercent),
                recommendation
              ];
            });
            
            doc.autoTable({
              head: [highVDHeaders],
              body: highVDRows,
              startY: margin + 70,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              columnStyles: {
                0: { cellWidth: 35 }, // Description
                5: { cellWidth: 50 }  // Recommendation
              },
              headStyles: {
                fillColor: [180, 50, 50],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              }
            });
          }
          
          // Create voltage drop chart in canvas for better quality
          const chartCanvas = document.createElement('canvas');
          chartCanvas.width = 500;
          chartCanvas.height = 300;
          const ctx = chartCanvas.getContext('2d');
          
          if (ctx) {
            // Prepare data for voltage drop visualization
            const labels = circuitsWithVoltageDropInfo.map(load => 
              load.description.length > 15 ? load.description.substring(0, 15) + '...' : load.description
            );
            const data = circuitsWithVoltageDropInfo.map(load => 
              (load as EnhancedLoadItem).voltageDropResults?.voltageDropPercent || 0
            );
            const colors = data.map(vd => vd > 3 ? '#DC3912' : '#3366CC');
            
            // Create horizontal bar chart
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels,
                datasets: [{
                  label: 'Voltage Drop (%)',
                  data,
                  backgroundColor: colors,
                  borderColor: colors,
                  borderWidth: 1
                }]
              },
              options: {
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Voltage Drop (%)'
                    }
                  }
                },
                plugins: {
                  annotation: {
                    annotations: {
                      line1: {
                        type: 'line',
                        xMin: 3,
                        xMax: 3,
                        borderColor: 'rgba(255, 0, 0, 0.5)',
                        borderWidth: 2
                      }
                    }
                  } as any
                }
              }
            });
            
            // Add chart to PDF
            // Get chart position after the high VD table or after the summary if no high VD
            const lastTableHeight = circuitsWithHighVD.length > 0 ? 
              (doc as any).lastAutoTable.finalY + 10 : // Add 10mm margin
              margin + 60; // Position if no table
            
            const imgData = chartCanvas.toDataURL('image/png');
            try {
              // Add the chart image to the PDF
              const imgWidth = pageWidth - (2 * margin);
              const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
              
              // Check if chart fits on current page, if not add a new page
              if (lastTableHeight + imgHeight > pageHeight - margin) {
                doc.addPage();
                doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
              } else {
                doc.addImage(imgData, 'PNG', margin, lastTableHeight, imgWidth, imgHeight);
              }
            } catch (error) {
              console.error('Error adding chart to PDF:', error);
              doc.text('Error generating voltage drop chart visualization', margin, lastTableHeight);
            }
          }
        } else {
          // No voltage drop data
          doc.setFontSize(10);
          doc.text('No voltage drop analysis data available for circuits.', margin, 
            (doc as any).lastAutoTable.finalY + 10);
        }
      } catch (error) {
        console.error('Error generating voltage drop analysis section:', error);
      }
    }
    
    // Add economic sizing analysis section if enabled
    if (mergedOptions.includeEconomicAnalysis) {
      try {
        // Run economic sizing analysis
        const economicAnalysis = analyzeLoadScheduleForEconomicSizing(
          loadSchedule,
          10.5, // Default electricity rate
          1000, // Base conductor cost
          20,   // Years of operation
          3000  // Operating hours per year
        );
        
        // Add a new page for economic analysis
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Economic Conductor Sizing Analysis', margin, margin);
        
        // Add summary text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
          'This section analyzes the economic aspects of conductor sizing, comparing initial costs with ' +
          'long-term energy savings from reduced conductor losses. The analysis helps identify optimization ' +
          'opportunities with favorable ROI.',
          margin, margin + 10, { maxWidth: pageWidth - (2 * margin) }
        );
        
        // Add summary metrics
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Metrics:', margin, margin + 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Potential Savings: ${formatNumber(economicAnalysis.totalPotentialSavings)} PHP/year`, margin + 5, margin + 35);
        doc.text(`Required Investment: ${formatNumber(economicAnalysis.totalUpfrontCost)} PHP`, margin + 5, margin + 43);
        doc.text(`Average Payback Period: ${formatNumber(economicAnalysis.averagePaybackPeriod)} years`, margin + 5, margin + 51);
        
        const savingsPercent = (economicAnalysis.totalPotentialSavings / Math.max(economicAnalysis.totalCurrentEnergyCost, 0.01)) * 100;
        doc.text(`Potential Energy Cost Reduction: ${formatNumber(savingsPercent)}%`, margin + 5, margin + 59);
        
        // Add recommendations
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations:', margin, margin + 75);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        economicAnalysis.recommendations.forEach((recommendation, index) => {
          doc.text(`${index + 1}. ${recommendation}`, margin + 5, margin + 85 + (index * 8), 
            { maxWidth: pageWidth - (2 * margin) - 5 });
        });
        
        // If there are optimization opportunities, add a table
        if (economicAnalysis.optimizationOpportunities.length > 0) {
          const opportunitiesHeaders = [
            'Circuit Description', 
            'Current Size', 
            'Recommended Size', 
            'Annual Savings', 
            'Investment', 
            'Payback Period'
          ];
          
          const opportunitiesRows = economicAnalysis.optimizationOpportunities.map(opp => [
            opp.description,
            opp.currentSize,
            opp.recommendedSize,
            `${formatNumber(opp.potentialAnnualSavings)} PHP`,
            `${formatNumber(opp.upfrontCost)} PHP`,
            `${formatNumber(opp.paybackPeriodYears)} years`
          ]);
          
          // Get position after the recommendations text
          const lastTextY = margin + 85 + (economicAnalysis.recommendations.length * 8) + 10;
          
          // Check if table fits on current page, if not add a new page
          if (lastTextY + 10 + (opportunitiesRows.length * 8) > pageHeight - margin) {
            doc.addPage();
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Optimization Opportunities:', margin, margin);
            
            doc.autoTable({
              head: [opportunitiesHeaders],
              body: opportunitiesRows,
              startY: margin + 10,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              headStyles: {
                fillColor: [60, 130, 190],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              }
            });
          } else {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Optimization Opportunities:', margin, lastTextY);
            
            doc.autoTable({
              head: [opportunitiesHeaders],
              body: opportunitiesRows,
              startY: lastTextY + 5,
              theme: 'grid',
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              headStyles: {
                fillColor: [60, 130, 190],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              }
            });
          }
        }
      } catch (error) {
        console.error('Error generating economic analysis section:', error);
      }
    }
    
    // Add compliance analysis section on a new page
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PEC 2017 Compliance Analysis', margin, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Check if any loads have compliance information
    const loadsWithCompliance = loadSchedule.loads.filter(load => 
      load.pecCompliance !== undefined
    );
    
    if (loadsWithCompliance.length > 0) {
      // Calculate compliance statistics
      const compliantLoads = loadsWithCompliance.filter(load => 
        load.pecCompliance && load.pecCompliance.isCompliant
      ).length;
      
      const compliancePercentage = (compliantLoads / loadsWithCompliance.length) * 100;
      
      doc.text(`Overall Compliance: ${formatNumber(compliancePercentage)}%`, margin, 40);
      doc.text(`Compliant Circuits: ${compliantLoads} of ${loadsWithCompliance.length}`, margin, 50);
      
      // Add compliance issues table
      const complianceHeaders = [
        'Description', 
        'Status', 
        'Issues', 
        'Recommendations'
      ];
      
      const complianceData = loadsWithCompliance.map(load => {
        const compliance = load.pecCompliance || { isCompliant: false, issues: [], recommendations: [] };
        return [
          load.description,
          compliance.isCompliant ? 'Compliant' : 'Non-compliant',
          compliance.issues.join('; '),
          compliance.recommendations.join('; ')
        ];
      });
      
      doc.autoTable({
        startY: 60,
        head: [complianceHeaders],
        body: complianceData,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 2
        },
        margin: { 
          left: margin, 
          right: margin 
        },
        didDrawCell: (data: any) => {
          // Highlight non-compliant cells
          if (data.column.index === 1 && data.cell.text[0] === 'Non-compliant') {
            doc.setFillColor(255, 200, 200);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(200, 0, 0);
            doc.text('Non-compliant', data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1);
            doc.setTextColor(0, 0, 0);
          }
        }
      });
    } else {
      doc.text('No compliance analysis data available.', margin, 60);
    }
    
    // Add circuit type distribution chart
    if (loadSchedule.loads.length > 0) {
      const circuitTypes: Record<string, number> = {};
      
      // Count circuit types
      loadSchedule.loads.forEach(load => {
        const type = load.circuitDetails?.type || 'unknown';
        circuitTypes[type] = (circuitTypes[type] || 0) + 1;
      });
      
      // Create chart data
      const chartLabels = Object.keys(circuitTypes);
      const chartData = Object.values(circuitTypes);
      const colors = generateColorPalette(chartLabels.length);
      
      doc.setFontSize(12);
      doc.text('Circuit Type Distribution', margin, 170);
      
      const chartText = `Circuit types: ${chartLabels.map((label, i) => 
        `${label} (${chartData[i]})`
      ).join(', ')}`;
      
      // Add text-based representation of the chart (since we can't directly add charts to jsPDF)
      doc.setFontSize(9);
      doc.text(chartText, margin, 180, { maxWidth: pageWidth - (margin * 2) });
    }
    
    // Add additional calculation results if provided
    if (calculationResults) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Power Consumption Analysis', margin, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      doc.text(`Monthly Energy Consumption: ${formatNumber(calculationResults.monthlyEnergyConsumption)} kWh`, margin, 45);
      doc.text(`Annual Energy Consumption: ${formatNumber(calculationResults.annualEnergyConsumption)} kWh`, margin, 55);
      doc.text(`Monthly Cost: ₱${formatNumber(calculationResults.monthlyCost)}`, margin, 65);
      doc.text(`Annual Cost: ₱${formatNumber(calculationResults.annualCost)}`, margin, 75);
      doc.text(`Peak Demand: ${formatNumber(calculationResults.peakDemand)} kW`, margin, 85);
      doc.text(`Load Factor: ${formatNumber(calculationResults.loadFactor)}%`, margin, 95);
      
      // Add energy consumption by load type
      doc.setFontSize(12);
      doc.text('Energy Consumption by Load Type', margin, 115);
      
      if (calculationResults.consumptionByType) {
        const consumptionHeaders = ['Load Type', 'Monthly Consumption (kWh)', 'Annual Consumption (kWh)', 'Percentage (%)'];
        const consumptionData = Object.entries(calculationResults.consumptionByType).map(([type, consumption]) => {
          const monthlyConsumption = consumption as number;
          const annualConsumption = monthlyConsumption * 12;
          const percentage = (monthlyConsumption / calculationResults.monthlyEnergyConsumption) * 100;
          return [
            type,
            formatNumber(monthlyConsumption),
            formatNumber(annualConsumption),
            formatNumber(percentage)
          ];
        });
        
        doc.autoTable({
          startY: 125,
          head: [consumptionHeaders],
          body: consumptionData,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 2
          },
          margin: { 
            left: margin, 
            right: margin 
          }
        });
      } else {
        doc.text('No consumption by type data available.', margin, 125);
      }
    }
    
    // Add footer with page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, {
        align: 'right'
      });
      doc.text(`Generated: ${new Date().toLocaleDateString()} - Energy Audit Platform`, margin, pageHeight - 10);
    }
    
    // Save the PDF
    doc.save(mergedOptions.fileName || 'schedule-of-loads-report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generate an enhanced PDF export of the load schedule
 * This is a promise-based version that returns a Blob
 */
export async function generateEnhancedScheduleOfLoadsPdf(
  loadSchedule: LoadSchedule, 
  projectInfo?: ProjectInfo
): Promise<Blob> {
  try {
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add basic content
    doc.setFontSize(16);
    doc.text(`Schedule of Loads: ${loadSchedule.panelName || 'Unnamed Panel'}`, 15, 20);
    
    // Return PDF blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating enhanced PDF:', error);
    throw new Error(`Failed to generate enhanced PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a multi-panel PDF export that returns a Blob
 */
export async function generateMultiPanelScheduleOfLoadsPdf(
  loadSchedules: LoadSchedule[], 
  projectInfo?: ProjectInfo
): Promise<Blob> {
  try {
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add basic content
    doc.setFontSize(16);
    doc.text('Multiple Panel Schedule of Loads', 15, 20);
    
    // Return PDF blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating multi-panel PDF:', error);
    throw new Error(`Failed to generate multi-panel PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
} 