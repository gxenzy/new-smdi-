import { PDFExporter, PDFExportOptions } from '../utils/reportGenerator/PDFExporter';
import { Report } from '../types/reports';
import reportService from './reportService';

/**
 * Service for generating PDF files from reports
 */
const pdfService = {
  /**
   * Generate PDF from a report
   * @param reportId Report ID
   * @param options PDF export options
   * @returns Promise with PDF blob
   */
  generatePDF: async (reportId: number, options: PDFExportOptions = {}): Promise<Blob> => {
    try {
      // Get the report data
      const report = await reportService.getReportById(reportId);
      
      // Create PDF exporter
      const exporter = new PDFExporter(report, options);
      
      // Generate PDF
      return await exporter.generatePDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  },
  
  /**
   * Download PDF file from a report
   * @param reportId Report ID
   * @param options PDF export options
   */
  downloadPDF: async (reportId: number, options: PDFExportOptions = {}): Promise<void> => {
    try {
      // Get the report data
      const report = await reportService.getReportById(reportId);
      
      // Set default filename if not provided
      if (!options.fileName) {
        options.fileName = `${report.title.replace(/\s+/g, '_')}_report.pdf`;
      }
      
      // Create PDF exporter
      const exporter = new PDFExporter(report, options);
      
      // Generate PDF blob
      const pdfBlob = await exporter.generatePDF();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  },
  
  /**
   * Open PDF in new tab
   * @param reportId Report ID
   * @param options PDF export options
   */
  openPDFInNewTab: async (reportId: number, options: PDFExportOptions = {}): Promise<void> => {
    try {
      // Generate PDF blob
      const pdfBlob = await pdfService.generatePDF(reportId, options);
      
      // Create URL from blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw new Error('Failed to open PDF');
    }
  }
};

export default pdfService; 