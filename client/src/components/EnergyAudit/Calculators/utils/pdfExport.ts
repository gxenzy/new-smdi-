/**
 * PDF Export Utilities
 * 
 * This module provides functions for exporting calculator results to PDF format
 * using jsPDF library.
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { RoomData, LPDResult, Fixture } from './lightingPowerDensityUtils';

/**
 * Interface defining options for jsPDF autoTable plugin
 * Used for creating tables in PDF documents
 */
interface AutoTableOptions {
  startY: number;
  head: string[][];
  body: string[][];
  theme: string;
  headStyles: { fillColor: number[] };
  [key: string]: any;
}

/**
 * Extended jsPDF interface with autoTable plugin and tracking properties
 * This allows for proper TypeScript typing when using the autoTable plugin
 */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
  autoTable: (...args: any[]) => any;
}

/**
 * Interface for data required to export LPD calculations to PDF
 */
interface LPDExportData {
  roomData: RoomData;
  results: LPDResult;
  timestamp: string;
}

/**
 * Format a number as a string with specified decimal places
 */
const formatNumber = (value: number, decimalPlaces: number = 2): string => {
  return value.toFixed(decimalPlaces);
};

/**
 * Generate a filename based on calculation type and room name
 */
const generateFilename = (roomName: string): string => {
  const sanitizedName = roomName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  return `lpd_calculation_${sanitizedName}_${timestamp}.pdf`;
};

/**
 * Export LPD calculation results to PDF
 * 
 * @param data - The calculation data to export
 * @returns The filename of the generated PDF
 */
export const exportLPDToPDF = (data: LPDExportData): string => {
  const { roomData, results, timestamp } = data;
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const filename = generateFilename(roomData.name);
  
  // Title
  doc.setFontSize(20);
  doc.text('Lighting Power Density Calculation Report', 105, 15, { align: 'center' });
  
  // Date and Time
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date(timestamp).toLocaleString()}`, 105, 22, { align: 'center' });
  
  // Room Information Section
  doc.setFontSize(14);
  doc.text('Room Information', 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Room Name: ${roomData.name}`, 14, 38);
  doc.text(`Room Area: ${formatNumber(roomData.area)} m²`, 14, 44);
  doc.text(`Building Type: ${results.buildingTypeLabel}`, 14, 50);
  
  // Fixtures Table
  doc.setFontSize(14);
  doc.text('Fixtures', 14, 60);
  
  const fixtureTableData = roomData.fixtures.map((fixture: Fixture) => {
    const totalWattage = fixture.wattage * fixture.ballastFactor * fixture.quantity;
    return [
      fixture.name,
      formatNumber(fixture.wattage),
      formatNumber(fixture.ballastFactor),
      fixture.quantity.toString(),
      formatNumber(totalWattage)
    ];
  });
  
  doc.autoTable({
    startY: 65,
    head: [['Fixture Type', 'Wattage (W)', 'Ballast Factor', 'Quantity', 'Total Wattage (W)']],
    body: fixtureTableData,
    theme: 'striped',
    headStyles: { fillColor: [51, 122, 183] }
  });
  
  // Results Section
  const resultsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 120;
  doc.setFontSize(14);
  doc.text('Calculation Results', 14, resultsY);
  
  doc.setFontSize(10);
  doc.text(`Total Lighting Power: ${formatNumber(results.totalWattage)} W`, 14, resultsY + 8);
  doc.text(`Lighting Power Density (LPD): ${formatNumber(results.lpd)} W/m²`, 14, resultsY + 14);
  doc.text(`Standard LPD for ${results.buildingTypeLabel}: ${formatNumber(results.standardLPD)} W/m²`, 14, resultsY + 20);
  
  // Compliance Status
  const complianceY = resultsY + 30;
  doc.setFontSize(12);
  if (results.isCompliant) {
    doc.setTextColor(0, 128, 0); // Green color for compliant
    doc.text('COMPLIANT with PEC 2017 Standards', 14, complianceY);
    doc.text(`${formatNumber((1 - results.lpd / results.standardLPD) * 100)}% below limit`, 14, complianceY + 6);
  } else {
    doc.setTextColor(220, 53, 69); // Red color for non-compliant
    doc.text('NON-COMPLIANT with PEC 2017 Standards', 14, complianceY);
    doc.text(`${formatNumber((results.lpd / results.standardLPD - 1) * 100)}% above limit`, 14, complianceY + 6);
  }
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Recommendations
  const recsY = complianceY + 16;
  doc.setFontSize(14);
  doc.text('Recommendations', 14, recsY);
  
  doc.setFontSize(10);
  results.recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 14, recsY + 8 + (index * 6));
  });
  
  // Footer with disclaimer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('This report was generated automatically by the Energy Audit Platform.', 105, pageHeight - 10, { align: 'center' });
  doc.text('Results should be verified by a qualified professional.', 105, pageHeight - 6, { align: 'center' });
  
  // Save the PDF
  doc.save(filename);
  
  return filename;
};

/**
 * Create a data URL for a PDF to preview or embed
 * 
 * @param data - The calculation data to export
 * @returns A data URL for the PDF
 */
export const createLPDPDFDataUrl = (data: LPDExportData): string => {
  const { roomData, results, timestamp } = data;
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Title
  doc.setFontSize(20);
  doc.text('Lighting Power Density Calculation Report', 105, 15, { align: 'center' });
  
  // Date and Time
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date(timestamp).toLocaleString()}`, 105, 22, { align: 'center' });
  
  // Room Information Section
  doc.setFontSize(14);
  doc.text('Room Information', 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Room Name: ${roomData.name}`, 14, 38);
  doc.text(`Room Area: ${formatNumber(roomData.area)} m²`, 14, 44);
  doc.text(`Building Type: ${results.buildingTypeLabel}`, 14, 50);
  
  // Fixtures Table
  doc.setFontSize(14);
  doc.text('Fixtures', 14, 60);
  
  const fixtureTableData = roomData.fixtures.map((fixture: Fixture) => {
    const totalWattage = fixture.wattage * fixture.ballastFactor * fixture.quantity;
    return [
      fixture.name,
      formatNumber(fixture.wattage),
      formatNumber(fixture.ballastFactor),
      fixture.quantity.toString(),
      formatNumber(totalWattage)
    ];
  });
  
  doc.autoTable({
    startY: 65,
    head: [['Fixture Type', 'Wattage (W)', 'Ballast Factor', 'Quantity', 'Total Wattage (W)']],
    body: fixtureTableData,
    theme: 'striped',
    headStyles: { fillColor: [51, 122, 183] }
  });
  
  // Results Section
  const resultsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 120;
  doc.setFontSize(14);
  doc.text('Calculation Results', 14, resultsY);
  
  doc.setFontSize(10);
  doc.text(`Total Lighting Power: ${formatNumber(results.totalWattage)} W`, 14, resultsY + 8);
  doc.text(`Lighting Power Density (LPD): ${formatNumber(results.lpd)} W/m²`, 14, resultsY + 14);
  doc.text(`Standard LPD for ${results.buildingTypeLabel}: ${formatNumber(results.standardLPD)} W/m²`, 14, resultsY + 20);
  
  // Compliance Status
  const complianceY = resultsY + 30;
  doc.setFontSize(12);
  if (results.isCompliant) {
    doc.setTextColor(0, 128, 0); // Green color for compliant
    doc.text('COMPLIANT with PEC 2017 Standards', 14, complianceY);
    doc.text(`${formatNumber((1 - results.lpd / results.standardLPD) * 100)}% below limit`, 14, complianceY + 6);
  } else {
    doc.setTextColor(220, 53, 69); // Red color for non-compliant
    doc.text('NON-COMPLIANT with PEC 2017 Standards', 14, complianceY);
    doc.text(`${formatNumber((results.lpd / results.standardLPD - 1) * 100)}% above limit`, 14, complianceY + 6);
  }
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Recommendations
  const recsY = complianceY + 16;
  doc.setFontSize(14);
  doc.text('Recommendations', 14, recsY);
  
  doc.setFontSize(10);
  results.recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 14, recsY + 8 + (index * 6));
  });
  
  // Footer with disclaimer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('This report was generated automatically by the Energy Audit Platform.', 105, pageHeight - 10, { align: 'center' });
  doc.text('Results should be verified by a qualified professional.', 105, pageHeight - 6, { align: 'center' });
  
  // Return as data URL
  return doc.output('datauristring');
}; 