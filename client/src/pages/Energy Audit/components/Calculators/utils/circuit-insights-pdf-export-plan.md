# Circuit Insights Dashboard PDF Export Implementation Plan

## Overview

This plan outlines the implementation of PDF export capabilities for the Circuit Insights Dashboard. The PDF export feature will allow users to generate comprehensive reports of circuit analysis results, compliance status, and optimization recommendations.

## Current Status (40% Complete)

- [x] Basic PDF export button in CircuitInsightsDashboardDialog
- [x] Mock implementation with user feedback
- [x] Fixed variable initialization issues in enhancedVoltageDropPdfExport.ts
- [ ] Actual PDF generation for dashboard data
- [ ] Chart visualization exports
- [ ] Critical circuits table export
- [ ] Recommendations export
- [ ] Customization options

## Implementation Details

### 1. Create CircuitInsightsPdfExport Utility (Based on enhancedVoltageDropPdfExport)

```typescript
// New file: circuitInsightsPdfExport.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart, ChartTypeRegistry } from 'chart.js/auto';
import { CircuitAnalysisSummary, CircuitInfo, OptimizationOpportunity } from './circuitInsightsTypes';
import { LoadSchedule } from '../ScheduleOfLoads/types';

export interface CircuitInsightsPdfOptions {
  title: string;
  fileName: string;
  paperSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  includeSummary: boolean;
  includeCharts: boolean;
  includeCriticalCircuits: boolean;
  includeRecommendations: boolean;
  includeComplianceDetails: boolean;
  maxCriticalCircuits?: number;
  companyLogo?: string;
  includeTimestamp: boolean;
}

/**
 * Exports Circuit Insights Dashboard data to PDF
 */
export function exportCircuitInsightsToPdf(
  title: string,
  loadSchedules: LoadSchedule[],
  circuitAnalysisSummary: CircuitAnalysisSummary,
  voltageDropChart: Chart<keyof ChartTypeRegistry> | null,
  complianceChart: Chart<keyof ChartTypeRegistry> | null,
  options: CircuitInsightsPdfOptions
): jsPDF {
  // Implementation details
}
```

### 2. PDF Content Sections

The PDF export will include the following sections:

1. **Header Section**
   - Report title
   - Date and time of generation
   - Optional company logo
   - Summary statistics (total circuits, compliance percentages)

2. **Charts Section**
   - Export voltage drop bar chart as image
   - Export compliance status donut chart as image
   - Add captions and explanations

3. **Critical Circuits Table**
   - Table of critical circuits with voltage drop values
   - Highlighted non-compliant circuits
   - Conductor size recommendations

4. **Recommendations Section**
   - List of actionable recommendations
   - Prioritized by impact
   - Include PEC 2017 references

5. **Panel Details Section**
   - Panel-by-panel breakdown for multi-panel analysis
   - Key statistics for each panel

### 3. Implementation Steps

#### Step 1: Chart Export Function

```typescript
/**
 * Converts Chart.js chart to image for PDF export
 */
function chartToImage(chart: Chart<keyof ChartTypeRegistry>): string {
  return chart.toBase64Image();
}
```

#### Step 2: Header and Summary Section

```typescript
/**
 * Adds header and summary section to PDF
 */
function addHeaderAndSummary(
  pdf: jsPDF,
  title: string,
  summary: CircuitAnalysisSummary,
  options: CircuitInsightsPdfOptions
): number {
  const margin = 15;
  let currentY = margin;
  
  // Add title
  pdf.setFontSize(18);
  pdf.text(title, margin, currentY);
  currentY += 10;
  
  // Add timestamp if requested
  if (options.includeTimestamp) {
    pdf.setFontSize(10);
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, margin, currentY);
    currentY += 8;
  }
  
  // Add company logo if provided
  if (options.companyLogo) {
    try {
      pdf.addImage(options.companyLogo, 'PNG', pdf.internal.pageSize.width - 50, margin, 35, 15);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }
  
  // Add summary table
  pdf.setFontSize(12);
  pdf.text('Analysis Summary', margin, currentY);
  currentY += 8;
  
  const summaryData = [
    ['Total Circuits', summary.totalCircuits.toString()],
    ['Compliant Circuits', summary.compliantCircuits.toString()],
    ['Non-Compliant Circuits', summary.nonCompliantCircuits.toString()],
    ['Compliance Rate', `${((summary.compliantCircuits / summary.totalCircuits) * 100).toFixed(1)}%`],
    ['Average Voltage Drop', `${summary.averageVoltageDrop.toFixed(2)}%`],
    ['Highest Voltage Drop', `${summary.highestVoltageDrop.value.toFixed(2)}% (${summary.highestVoltageDrop.circuitName})`]
  ];
  
  (pdf as any).autoTable({
    startY: currentY,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: margin }
  });
  
  return (pdf as any).lastAutoTable.finalY + 10;
}
```

#### Step 3: Charts Section

```typescript
/**
 * Adds charts section to PDF
 */
function addCharts(
  pdf: jsPDF,
  voltageDropChart: Chart<keyof ChartTypeRegistry> | null,
  complianceChart: Chart<keyof ChartTypeRegistry> | null,
  startY: number
): number {
  const margin = 15;
  let currentY = startY;
  
  if (!voltageDropChart && !complianceChart) return currentY;
  
  pdf.setFontSize(14);
  pdf.text('Analysis Charts', margin, currentY);
  currentY += 10;
  
  // Add voltage drop chart
  if (voltageDropChart) {
    const imgData = chartToImage(voltageDropChart);
    const imgWidth = pdf.internal.pageSize.width - (margin * 2);
    const imgHeight = 100;
    
    pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 5;
    
    pdf.setFontSize(10);
    pdf.text('Figure 1: Top Circuits by Voltage Drop Percentage', margin, currentY);
    currentY += 15;
  }
  
  // Add compliance chart
  if (complianceChart) {
    // Check if we need a new page
    if (currentY > pdf.internal.pageSize.height - 120) {
      pdf.addPage();
      currentY = margin;
    }
    
    const imgData = chartToImage(complianceChart);
    const imgWidth = 100;
    const imgHeight = 100;
    
    pdf.addImage(imgData, 'PNG', pdf.internal.pageSize.width / 2 - imgWidth / 2, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 5;
    
    pdf.setFontSize(10);
    pdf.text('Figure 2: PEC 2017 Compliance Status', pdf.internal.pageSize.width / 2 - 50, currentY);
    currentY += 15;
  }
  
  return currentY;
}
```

#### Step 4: Critical Circuits Table

```typescript
/**
 * Adds critical circuits table to PDF
 */
function addCriticalCircuitsTable(
  pdf: jsPDF,
  criticalCircuits: CircuitInfo[],
  startY: number,
  options: CircuitInsightsPdfOptions
): number {
  const margin = 15;
  let currentY = startY;
  
  // Check if we need a new page
  if (currentY > pdf.internal.pageSize.height - 100) {
    pdf.addPage();
    currentY = margin;
  }
  
  pdf.setFontSize(14);
  pdf.text('Critical Circuits Requiring Attention', margin, currentY);
  currentY += 10;
  
  const maxCircuits = options.maxCriticalCircuits || 10;
  const circuitsToShow = criticalCircuits.slice(0, maxCircuits);
  
  const tableData = circuitsToShow.map(circuit => [
    circuit.name,
    circuit.panelName,
    `${circuit.voltageDrop.toFixed(2)}%`,
    circuit.current ? `${circuit.current.toFixed(1)} A` : 'N/A',
    circuit.conductorSize || 'N/A',
    circuit.optimalSize || 'N/A'
  ]);
  
  (pdf as any).autoTable({
    startY: currentY,
    head: [['Circuit', 'Panel', 'Voltage Drop', 'Current', 'Current Size', 'Recommended Size']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [211, 47, 47] },
    margin: { left: margin },
    styles: { overflow: 'linebreak' },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    didParseCell: function(data: any) {
      // Highlight non-compliant voltage drop values
      if (data.column.index === 2) {
        const value = parseFloat(data.cell.text[0].replace('%', ''));
        if (value > 3) {
          data.cell.styles.textColor = [211, 47, 47];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  return (pdf as any).lastAutoTable.finalY + 10;
}
```

#### Step 5: Recommendations Section

```typescript
/**
 * Adds recommendations section to PDF
 */
function addRecommendations(
  pdf: jsPDF,
  summary: CircuitAnalysisSummary,
  startY: number
): number {
  const margin = 15;
  let currentY = startY;
  
  // Check if we need a new page
  if (currentY > pdf.internal.pageSize.height - 120) {
    pdf.addPage();
    currentY = margin;
  }
  
  pdf.setFontSize(14);
  pdf.text('Optimization Recommendations', margin, currentY);
  currentY += 10;
  
  pdf.setFontSize(10);
  
  const recommendations = [];
  
  if (summary.nonCompliantCircuits > 0) {
    recommendations.push(`${summary.nonCompliantCircuits} circuits exceed PEC 2017 voltage drop limits and require conductor size upgrades.`);
    
    if (summary.criticalCircuits.length > 0) {
      recommendations.push(`${summary.criticalCircuits.length} circuits are in critical condition with voltage drops exceeding 4%.`);
    }
    
    recommendations.push('Prioritize circuits with the highest voltage drop percentage for immediate attention.');
    recommendations.push('Consider increasing conductor sizes or reducing circuit lengths where applicable.');
  } else {
    recommendations.push('All circuits are compliant with PEC 2017 voltage drop limits.');
  }
  
  // Add recommendations as bullet points
  recommendations.forEach((rec, index) => {
    pdf.text(`• ${rec}`, margin + 5, currentY);
    currentY += 7;
  });
  
  currentY += 10;
  
  // Add PEC 2017 reference
  pdf.setFontSize(12);
  pdf.text('PEC 2017 Compliance Reference', margin, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.text('According to PEC 2017 Section 2.30.1, the maximum voltage drop should not exceed:', margin, currentY);
  currentY += 7;
  
  pdf.text('• 3% for branch circuits', margin + 5, currentY);
  currentY += 7;
  pdf.text('• 2% for feeder circuits', margin + 5, currentY);
  currentY += 7;
  pdf.text('• 5% total from service entrance to farthest outlet', margin + 5, currentY);
  currentY += 7;
  
  return currentY;
}
```

### 4. Integration with CircuitInsightsDashboardDialog

The final step is to integrate the PDF export functionality with the CircuitInsightsDashboardDialog component:

```typescript
// In CircuitInsightsDashboardDialog.tsx

import { exportCircuitInsightsToPdf, CircuitInsightsPdfOptions } from '../utils/circuitInsightsPdfExport';

// Update the handleExportReport function
const handleExportReport = async () => {
  if (loadSchedules.length === 0) {
    // Error handling...
    return;
  }
  
  setExporting(true);
  try {
    // Get chart instances from the dashboard component
    // This would require exposing the chart instances via ref or callback
    const chartInstances = dashboardRef.current?.getChartInstances() || { 
      voltageDropChart: null, 
      complianceChart: null 
    };
    
    // Get circuit analysis summary
    const summary = dashboardRef.current?.getCircuitAnalysisSummary();
    
    if (!summary) {
      throw new Error('No analysis data available');
    }
    
    const options: CircuitInsightsPdfOptions = {
      title: `Circuit Insights Report - ${loadSchedules[0].panelName}`,
      fileName: `circuit-insights-${loadSchedules[0].panelName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      paperSize: 'a4',
      orientation: 'landscape',
      includeSummary: true,
      includeCharts: true,
      includeCriticalCircuits: true,
      includeRecommendations: true,
      includeComplianceDetails: true,
      maxCriticalCircuits: 15,
      includeTimestamp: true
    };
    
    const pdf = exportCircuitInsightsToPdf(
      options.title,
      loadSchedules,
      summary,
      chartInstances.voltageDropChart,
      chartInstances.complianceChart,
      options
    );
    
    pdf.save(options.fileName);
    
    setSnackbarMessage('Report exported successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  } catch (error) {
    // Error handling...
  } finally {
    setExporting(false);
  }
};
```

## Timeline

1. **Week 1**
   - Create core PDF export utility
   - Implement header and summary sections
   - Add chart export functionality

2. **Week 2**
   - Implement critical circuits table export
   - Add recommendations section
   - Create customization options

3. **Week 3**
   - Integrate with CircuitInsightsDashboardDialog
   - Add UI for export options
   - Test with different panel configurations

## Success Criteria

1. PDF exports should accurately represent dashboard data
2. Charts should be clearly visible in the exported PDF
3. Critical circuits should be highlighted appropriately
4. Reports should be professional-looking and well-formatted
5. Export process should complete in under 5 seconds for typical panels 