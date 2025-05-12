import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Report, ReportContent, ChartReportContent, TableReportContent, TextReportContent, ImageReportContent } from '../types/reports';

/**
 * Utility for exporting reports to PDF format
 */
export class PDFExporter {
  // Define constants for PDF layout
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20; // margin in mm
  private static readonly CONTENT_WIDTH = 170; // width of content area in mm

  /**
   * Generate a PDF document from a report
   * @param report The report to export
   * @returns Promise with the generated PDF as Blob
   */
  static async generatePDF(report: Report): Promise<Blob> {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    try {
      // Add cover page
      await this.addCoverPage(doc, report);
      
      // Add table of contents if enabled
      if (report.metadata?.include_toc) {
        await this.addTableOfContents(doc, report);
      }
      
      // Start content on new page
      doc.addPage();
      let yPos = this.MARGIN;

      // Process report contents
      if (report.contents && report.contents.length > 0) {
        // Sort by order index
        const sortedContents = [...report.contents].sort((a, b) => a.order_index - b.order_index);
        
        for (const content of sortedContents) {
          // Check if we need to add a new page
          if (yPos > this.PAGE_HEIGHT - this.MARGIN * 2) {
            doc.addPage();
            yPos = this.MARGIN;
          }
          
          // Process different content types
          yPos = await this.renderContent(doc, content, yPos);
          yPos += 10; // Add space between content sections
        }
      }

      // Add page numbers
      this.addPageNumbers(doc);
      
      // Return as Blob
      return doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Add a cover page to the PDF
   * @param doc PDF document
   * @param report Report data
   */
  private static async addCoverPage(doc: jsPDF, report: Report): Promise<void> {
    // Add report title
    doc.setFontSize(28);
    doc.setTextColor(20, 40, 100);
    
    // Center title
    const titleLines = doc.splitTextToSize(report.title, this.CONTENT_WIDTH);
    const titleHeight = titleLines.length * 10;
    let yPos = 60; // Start position for title
    
    doc.text(titleLines, this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += titleHeight + 20;

    // Add company logo if exists
    if (report.metadata?.company_logo) {
      try {
        const logoWidth = 60;
        doc.addImage(
          report.metadata.company_logo,
          'PNG',
          (this.PAGE_WIDTH - logoWidth) / 2, // center horizontally
          20, // top position
          logoWidth, 
          20
        );
      } catch (err) {
        console.warn('Failed to add company logo to PDF', err);
      }
    }
    
    // Add cover image if exists
    if (report.metadata?.cover_image) {
      try {
        const coverWidth = 120;
        const coverHeight = 80;
        doc.addImage(
          report.metadata.cover_image,
          'PNG',
          (this.PAGE_WIDTH - coverWidth) / 2, // center horizontally
          yPos,
          coverWidth,
          coverHeight
        );
        yPos += coverHeight + 15;
      } catch (err) {
        console.warn('Failed to add cover image to PDF', err);
      }
    }
    
    // Add metadata
    if (report.metadata) {
      const metadataYPos = yPos;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      let metadataText = '';
      if (report.metadata.client_name) {
        metadataText += `Client: ${report.metadata.client_name}\n`;
      }
      if (report.metadata.facility_name) {
        metadataText += `Facility: ${report.metadata.facility_name}\n`;
      }
      if (report.metadata.audit_date) {
        metadataText += `Audit Date: ${new Date(report.metadata.audit_date).toLocaleDateString()}\n`;
      }
      if (report.metadata.auditor_name) {
        metadataText += `Auditor: ${report.metadata.auditor_name}\n`;
      }
      
      doc.text(metadataText, this.PAGE_WIDTH / 2, metadataYPos, { align: 'center' });
    }
    
    // Add date at bottom
    const footerYPos = this.PAGE_HEIGHT - 30;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      this.PAGE_WIDTH / 2,
      footerYPos,
      { align: 'center' }
    );
  }
  
  /**
   * Add table of contents page
   * @param doc PDF document
   * @param report Report data
   */
  private static async addTableOfContents(doc: jsPDF, report: Report): Promise<void> {
    doc.addPage();
    
    // TOC Title
    doc.setFontSize(20);
    doc.setTextColor(20, 40, 100);
    doc.text('Table of Contents', this.MARGIN, this.MARGIN);
    
    let yPos = this.MARGIN + 15;
    
    // Find all section headers
    if (report.contents) {
      const sections = report.contents
        .filter(content => content.content_type === 'section_header')
        .sort((a, b) => a.order_index - b.order_index);
      
      if (sections.length > 0) {
        // TOC Entries
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        sections.forEach((section, index) => {
          const sectionContent = (section as any).content;
          const level = sectionContent.level || 1;
          const indent = (level - 1) * 5;
          
          doc.text(sectionContent.title, this.MARGIN + indent, yPos);
          // Would add page numbers here in a full implementation
          doc.text(`…`, this.PAGE_WIDTH - this.MARGIN, yPos);
          
          yPos += 7;
        });
      } else {
        // No sections found
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('No sections found in this report.', this.MARGIN, yPos);
      }
    }
  }
  
  /**
   * Add page numbers to all pages
   * @param doc PDF document
   */
  private static addPageNumbers(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    // For each page
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Skip page numbers on cover and TOC
      if (i > 2) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        
        // Footer with page numbers
        doc.text(
          `Page ${i - 2} of ${pageCount - 2}`, 
          this.PAGE_WIDTH / 2, 
          this.PAGE_HEIGHT - 10, 
          { align: 'center' }
        );
      }
    }
  }

  /**
   * Render content to PDF based on content type
   * @param doc PDF document
   * @param content Report content
   * @param yPos Current Y position
   * @returns New Y position after adding content
   */
  private static async renderContent(
    doc: jsPDF,
    content: ReportContent,
    yPos: number
  ): Promise<number> {
    try {
      switch (content.content_type) {
        case 'text':
          return this.renderTextContent(doc, content as TextReportContent, yPos);
        
        case 'section_header':
          return this.renderSectionHeader(doc, content, yPos);
        
        case 'table':
          return this.renderTableContent(doc, content as TableReportContent, yPos);
        
        case 'chart':
          return await this.renderChartContent(doc, content as ChartReportContent, yPos);
        
        case 'image':
          return await this.renderImageContent(doc, content as ImageReportContent, yPos);
        
        case 'page_break':
          doc.addPage();
          return this.MARGIN; // Reset to top of new page
        
        default:
          console.warn(`Unsupported content type: ${content.content_type}`);
          return yPos;
      }
    } catch (error) {
      console.error(`Error rendering content (${content.content_type}):`, error);
      return yPos;
    }
  }

  /**
   * Render section header to PDF
   */
  private static renderSectionHeader(doc: jsPDF, content: ReportContent, yPos: number): number {
    const headerContent = (content as any).content;
    const level = headerContent.level || 1;
    
    // Style based on header level
    let fontSize = 20;
    let color = [20, 40, 100]; // RGB for headers
    
    switch (level) {
      case 1:
        fontSize = 20;
        break;
      case 2:
        fontSize = 16;
        color = [40, 60, 120];
        break;
      case 3:
        fontSize = 14;
        color = [60, 80, 140];
        break;
      default:
        fontSize = 12;
        color = [80, 100, 160];
    }
    
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(headerContent.title, this.MARGIN, yPos);
    
    // Add more space for larger headers
    return yPos + (fontSize / 2) + 5;
  }

  /**
   * Render text content to PDF
   */
  private static renderTextContent(doc: jsPDF, content: TextReportContent, yPos: number): number {
    const text = content.content.text;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    if (content.content.isHtml) {
      // For HTML content, we'd need to strip tags in this basic version
      // A full implementation would use HTML parsing
      const strippedText = text.replace(/<[^>]*>/g, '');
      const lines = doc.splitTextToSize(strippedText, this.CONTENT_WIDTH);
      doc.text(lines, this.MARGIN, yPos);
      return yPos + lines.length * 5;
    } else {
      const lines = doc.splitTextToSize(text, this.CONTENT_WIDTH);
      doc.text(lines, this.MARGIN, yPos);
      return yPos + lines.length * 5;
    }
  }

  /**
   * Render table content to PDF
   */
  private static renderTableContent(doc: jsPDF, content: TableReportContent, yPos: number): number {
    const tableContent = content.content;
    
    // Add caption if exists
    if (tableContent.caption) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(tableContent.caption, this.MARGIN, yPos);
      yPos += 7;
    }
    
    // Generate table with autoTable plugin
    (doc as any).autoTable({
      startY: yPos,
      head: [tableContent.headers],
      body: tableContent.rows,
      theme: 'grid',
      margin: { left: this.MARGIN, right: this.MARGIN },
      headStyles: { fillColor: [60, 130, 200], textColor: [255, 255, 255] },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 'auto' }
      }
    });
    
    // Return the new position after table
    return (doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Render chart content to PDF
   */
  private static async renderChartContent(doc: jsPDF, content: ChartReportContent, yPos: number): Promise<number> {
    const chartContent = content.content;
    
    // Add caption if exists
    if (chartContent.caption) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(chartContent.caption, this.MARGIN, yPos);
      yPos += 7;
    }

    // In a real implementation, we would render the chart to an image
    // and then include it in the PDF. For now, we'll use a placeholder.
    try {
      // This would typically involve:
      // 1. Getting a canvas element with the chart
      // 2. Converting it to base64 image data
      // 3. Adding it to the PDF
      
      // Placeholder text for now
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Chart: ${chartContent.chartType}`, this.MARGIN, yPos);
      
      // Draw placeholder chart box
      const chartHeight = chartContent.height || 100;
      const chartWidth = this.CONTENT_WIDTH;
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(this.MARGIN, yPos + 5, chartWidth, chartHeight, 'FD');
      
      // Add chart type text in center
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${chartContent.chartType.toUpperCase()} CHART`,
        this.MARGIN + chartWidth / 2,
        yPos + 5 + chartHeight / 2,
        { align: 'center' }
      );
      
      return yPos + chartHeight + 15;
    } catch (error) {
      console.error('Error rendering chart to PDF:', error);
      
      // Fallback text if chart rendering fails
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('(Chart could not be rendered)', this.MARGIN, yPos + 5);
      return yPos + 20;
    }
  }

  /**
   * Render image content to PDF
   */
  private static async renderImageContent(doc: jsPDF, content: ImageReportContent, yPos: number): Promise<number> {
    const imageContent = content.content;
    
    // Add caption if exists
    if (imageContent.caption) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(imageContent.caption, this.MARGIN, yPos);
      yPos += 7;
    }
    
    // In a real implementation, we would load the image and add it to the PDF
    try {
      // This would fetch the image from the URL and convert to base64
      // For now, we'll use a placeholder
      
      // Get image dimensions
      const maxWidth = this.CONTENT_WIDTH;
      const imageWidth = Math.min(imageContent.width || 150, maxWidth);
      const imageHeight = imageContent.height || 100;
      
      // Draw placeholder image box
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.rect(this.MARGIN, yPos, imageWidth, imageHeight, 'FD');
      
      // Add image placeholder text
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('IMAGE PLACEHOLDER', this.MARGIN + imageWidth / 2, yPos + imageHeight / 2, { align: 'center' });
      
      if (imageContent.altText) {
        doc.setFontSize(9);
        doc.text(`Alt: ${imageContent.altText}`, this.MARGIN, yPos + imageHeight + 5);
      }
      
      return yPos + imageHeight + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      
      // Fallback if image loading fails
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('(Image could not be loaded)', this.MARGIN, yPos + 5);
      return yPos + 20;
    }
  }
} 