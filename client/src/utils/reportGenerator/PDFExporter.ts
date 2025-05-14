import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Report, 
  ReportContent, 
  ReportMetadata, 
  ChartReportContent,
  TableReportContent,
  TextReportContent,
  ImageReportContent,
  SectionHeaderReportContent,
  TocReportContent
} from '../../types/reports';

/**
 * PDF Export Options
 */
export interface PDFExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  quality?: 'draft' | 'standard' | 'high';
  fileName?: string;
}

/**
 * PDFExporter utility for exporting reports to PDF format
 */
export class PDFExporter {
  private pdf: jsPDF;
  private report: Report;
  private options: PDFExportOptions;
  private currentPage: number = 1;
  private totalPages: number = 1;
  private yPosition: number = 0;
  private pageHeight: number = 0;
  private pageWidth: number = 0;
  private margins = { top: 20, right: 20, bottom: 30, left: 20 };
  private tocItems: { title: string; page: number; level: number }[] = [];
  private defaultStyles = {
    header: { fontSize: 22, textColor: [44, 62, 80] },
    subheader: { fontSize: 16, textColor: [52, 73, 94] },
    body: { fontSize: 12, textColor: [0, 0, 0] },
    caption: { fontSize: 10, textColor: [96, 96, 96] },
  };

  /**
   * Constructor
   * @param report Report to export
   * @param options PDF export options
   */
  constructor(report: Report, options: PDFExportOptions = {}) {
    this.report = report;
    this.options = {
      includeHeader: options.includeHeader !== undefined ? options.includeHeader : true,
      includeFooter: options.includeFooter !== undefined ? options.includeFooter : true,
      includePageNumbers: options.includePageNumbers !== undefined ? options.includePageNumbers : true,
      includeTableOfContents: options.includeTableOfContents !== undefined ? options.includeTableOfContents : true,
      includeCoverPage: options.includeCoverPage !== undefined ? options.includeCoverPage : true,
      pageSize: options.pageSize || 'a4',
      orientation: options.orientation || 'portrait',
      quality: options.quality || 'standard',
      fileName: options.fileName || `${report.title.replace(/\s+/g, '_')}_report.pdf`,
    };

    // Initialize PDF
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize,
    });

    // Set page dimensions
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    
    // Initialize y position to top margin
    this.yPosition = this.margins.top;
  }

  /**
   * Generate PDF from report
   * @returns Promise with PDF blob
   */
  public async generatePDF(): Promise<Blob> {
    try {
      // Set PDF properties
      this.pdf.setProperties({
        title: this.report.title,
        subject: `Energy Audit Report: ${this.report.type}`,
        author: `Energy Audit Platform`,
        keywords: 'energy audit, report, analysis',
        creator: 'Energy Audit Platform'
      });

      // Add cover page if enabled
      if (this.options.includeCoverPage && this.report.metadata) {
        await this.addCoverPage();
      }

      // Collect TOC items first
      if (this.options.includeTableOfContents) {
        this.collectTocItems();
      }

      // Add table of contents if enabled
      if (this.options.includeTableOfContents && this.tocItems.length > 0) {
        this.addTableOfContents();
      }

      // Add content
      if (this.report.contents && this.report.contents.length > 0) {
        await this.addContents();
      }

      // Add page numbers
      if (this.options.includePageNumbers) {
        this.addPageNumbers();
      }

      // Return PDF as blob
      return this.pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * Add cover page to PDF
   */
  private async addCoverPage(): Promise<void> {
    const metadata = this.report.metadata;
    if (!metadata) return;

    // Set background color for cover
    this.pdf.setFillColor(244, 247, 250);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Add company logo if available
    if (metadata.company_logo) {
      try {
        const logoWidth = 60;
        const logoHeight = 30;
        const logoX = (this.pageWidth - logoWidth) / 2;
        
        this.pdf.addImage(
          metadata.company_logo,
          'PNG',
          logoX,
          30,
          logoWidth,
          logoHeight
        );
      } catch (error) {
        console.error('Error adding logo:', error);
      }
    }

    // Add title
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(44, 62, 80);
    
    const titleLines = this.pdf.splitTextToSize(
      this.report.title,
      this.pageWidth - (this.margins.left + this.margins.right) * 2
    );
    
    const titleY = metadata.company_logo ? 80 : 60;
    this.pdf.text(titleLines, this.pageWidth / 2, titleY, { align: 'center' });

    // Add report type
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(70, 90, 110);
    this.pdf.text(
      `${this.report.type.replace('_', ' ').toUpperCase()} Report`,
      this.pageWidth / 2,
      titleY + (titleLines.length * 10) + 20,
      { align: 'center' }
    );

    // Add cover image if available
    if (metadata.cover_image) {
      try {
        const imageWidth = this.pageWidth - (this.margins.left + this.margins.right) * 2;
        const imageHeight = 80;
        const imageX = this.margins.left * 2;
        const imageY = titleY + (titleLines.length * 10) + 40;
        
        this.pdf.addImage(
          metadata.cover_image,
          'JPEG',
          imageX,
          imageY,
          imageWidth,
          imageHeight
        );
      } catch (error) {
        console.error('Error adding cover image:', error);
      }
    }

    // Add metadata
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(60, 60, 60);
    
    const metadataY = this.pageHeight - 80;
    
    if (metadata.client_name) {
      this.pdf.text(`Client: ${metadata.client_name}`, this.margins.left, metadataY);
    }
    
    if (metadata.facility_name) {
      this.pdf.text(`Facility: ${metadata.facility_name}`, this.margins.left, metadataY + 8);
    }
    
    if (metadata.audit_date) {
      this.pdf.text(`Audit Date: ${metadata.audit_date}`, this.margins.left, metadataY + 16);
    }
    
    if (metadata.auditor_name) {
      this.pdf.text(`Auditor: ${metadata.auditor_name}`, this.margins.left, metadataY + 24);
    }

    // Add new page
    this.pdf.addPage();
    this.currentPage++;
    this.yPosition = this.margins.top;
  }

  /**
   * Collect table of contents items from report contents
   */
  private collectTocItems(): void {
    if (!this.report.contents) return;
    
    this.report.contents.forEach((content) => {
      if (content.content_type === 'section_header') {
        const headerContent = content.content as SectionHeaderReportContent['content'];
        this.tocItems.push({
          title: headerContent.title,
          page: this.currentPage,
          level: headerContent.level,
        });
      }
    });
  }

  /**
   * Add table of contents to PDF
   */
  private addTableOfContents(): void {
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(44, 62, 80);
    this.pdf.text('Table of Contents', this.margins.left, this.yPosition);
    
    this.yPosition += 15;
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    
    this.tocItems.forEach((item) => {
      // Check if we need a new page
      if (this.yPosition > this.pageHeight - this.margins.bottom - 10) {
        this.pdf.addPage();
        this.currentPage++;
        this.yPosition = this.margins.top;
      }
      
      // Indent based on level
      const indent = (item.level - 1) * 5;
      
      // Draw dots between title and page number
      const title = item.title;
      const pageNum = item.page.toString();
      const titleWidth = this.pdf.getTextWidth(title);
      const pageNumWidth = this.pdf.getTextWidth(pageNum);
      const dotsWidth = this.pageWidth - this.margins.left - this.margins.right - indent - titleWidth - pageNumWidth - 5;
      
      let dots = '';
      const dotWidth = this.pdf.getTextWidth('.');
      const numDots = Math.floor(dotsWidth / dotWidth);
      for (let i = 0; i < numDots; i++) {
        dots += '.';
      }
      
      // Draw title, dots, and page number
      this.pdf.text(title, this.margins.left + indent, this.yPosition);
      this.pdf.text(dots, this.margins.left + indent + titleWidth, this.yPosition);
      this.pdf.text(pageNum, this.pageWidth - this.margins.right - pageNumWidth, this.yPosition);
      
      this.yPosition += 8;
    });
    
    // Add extra space after TOC
    this.yPosition += 10;
    
    // Add a page break after TOC
    this.pdf.addPage();
    this.currentPage++;
    this.yPosition = this.margins.top;
  }

  /**
   * Add report contents to PDF
   */
  private async addContents(): Promise<void> {
    if (!this.report.contents) return;
    
    for (const content of this.report.contents) {
      switch (content.content_type) {
        case 'text':
          this.addTextContent(content as TextReportContent);
          break;
        case 'chart':
          await this.addChartContent(content as ChartReportContent);
          break;
        case 'table':
          this.addTableContent(content as TableReportContent);
          break;
        case 'image':
          await this.addImageContent(content as ImageReportContent);
          break;
        case 'section_header':
          this.addSectionHeader(content as SectionHeaderReportContent);
          break;
        case 'page_break':
          this.addPageBreak();
          break;
        case 'toc':
          // TOC is handled separately
          break;
        default:
          console.warn(`Unsupported content type: ${content.content_type}`);
      }
    }
  }

  /**
   * Add text content to PDF
   * @param content Text content
   */
  private addTextContent(content: TextReportContent): void {
    const textContent = content.content;
    
    // Set text style
    this.pdf.setFontSize(this.defaultStyles.body.fontSize);
    this.pdf.setTextColor(
      this.defaultStyles.body.textColor[0],
      this.defaultStyles.body.textColor[1],
      this.defaultStyles.body.textColor[2]
    );
    
    // Split text to fit within margins
    const text = textContent.isHtml 
      ? this.stripHtmlTags(textContent.text) 
      : textContent.text;
    
    const textLines = this.pdf.splitTextToSize(
      text,
      this.pageWidth - this.margins.left - this.margins.right
    );
    
    // Check if we need a new page
    const textHeight = textLines.length * 7; // Approximate height based on font size
    if (this.yPosition + textHeight > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    // Add text
    this.pdf.text(textLines, this.margins.left, this.yPosition);
    
    // Update y position
    this.yPosition += textHeight + 10;
  }

  /**
   * Add chart content to PDF
   * @param content Chart content
   */
  private async addChartContent(content: ChartReportContent): Promise<void> {
    const chartContent = content.content;
    
    try {
      // Calculate chart dimensions
      let chartWidth = this.pageWidth - this.margins.left - this.margins.right;
      let chartHeight = 0;
      
      switch (chartContent.sizePreset) {
        case 'small':
          chartHeight = 60;
          break;
        case 'medium':
          chartHeight = 100;
          break;
        case 'large':
          chartHeight = 150;
          break;
        case 'full-width':
          chartHeight = 200;
          break;
        default:
          chartHeight = chartContent.height || 100;
      }
      
      // Check if we need a new page
      if (this.yPosition + chartHeight + 30 > this.pageHeight - this.margins.bottom) {
        this.pdf.addPage();
        this.currentPage++;
        this.yPosition = this.margins.top;
      }
      
      // Placeholder for chart - in real implementation, this would convert Chart.js to an image
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.roundedRect(
        this.margins.left,
        this.yPosition,
        chartWidth,
        chartHeight,
        3,
        3,
        'F'
      );
      
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        'Chart: ' + (chartContent.data.labels?.join(', ') || 'Data Visualization'),
        this.margins.left + 10,
        this.yPosition + chartHeight / 2
      );
      
      // Add caption if available
      if (chartContent.caption) {
        this.pdf.setFontSize(this.defaultStyles.caption.fontSize);
        this.pdf.setTextColor(
          this.defaultStyles.caption.textColor[0],
          this.defaultStyles.caption.textColor[1],
          this.defaultStyles.caption.textColor[2]
        );
        
        const captionLines = this.pdf.splitTextToSize(
          chartContent.caption,
          chartWidth
        );
        
        this.pdf.text(
          captionLines,
          this.margins.left,
          this.yPosition + chartHeight + 5
        );
        
        this.yPosition += captionLines.length * 5;
      }
      
      // Update y position
      this.yPosition += chartHeight + 15;
    } catch (error) {
      console.error('Error adding chart:', error);
    }
  }

  /**
   * Add table content to PDF
   * @param content Table content
   */
  private addTableContent(content: TableReportContent): void {
    const tableContent = content.content;
    
    try {
      // Check if we need a new page
      const estimatedRowHeight = 8; // Approximate height for each row
      const estimatedTableHeight = (tableContent.rows.length + 1) * estimatedRowHeight;
      
      if (this.yPosition + estimatedTableHeight + 20 > this.pageHeight - this.margins.bottom) {
        this.pdf.addPage();
        this.currentPage++;
        this.yPosition = this.margins.top;
      }
      
      // Add table using jspdf-autotable
      (this.pdf as any).autoTable({
        head: [tableContent.headers],
        body: tableContent.rows,
        startY: this.yPosition,
        margin: { left: this.margins.left, right: this.margins.right },
        headStyles: { fillColor: [70, 90, 110], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        tableWidth: 'auto',
        styles: { fontSize: 10 },
      });
      
      // Get the final y position after table rendering
      const finalY = (this.pdf as any).lastAutoTable.finalY || this.yPosition;
      
      // Add caption if available
      if (tableContent.caption) {
        this.pdf.setFontSize(this.defaultStyles.caption.fontSize);
        this.pdf.setTextColor(
          this.defaultStyles.caption.textColor[0],
          this.defaultStyles.caption.textColor[1],
          this.defaultStyles.caption.textColor[2]
        );
        
        const captionLines = this.pdf.splitTextToSize(
          tableContent.caption,
          this.pageWidth - this.margins.left - this.margins.right
        );
        
        this.pdf.text(captionLines, this.margins.left, finalY + 5);
        
        this.yPosition = finalY + 5 + captionLines.length * 5 + 10;
      } else {
        this.yPosition = finalY + 10;
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  }

  /**
   * Add image content to PDF
   * @param content Image content
   */
  private async addImageContent(content: ImageReportContent): Promise<void> {
    const imageContent = content.content;
    
    try {
      // Calculate image dimensions
      let imageWidth = imageContent.width || 100;
      let imageHeight = imageContent.height || 100;
      
      // Scale image to fit within margins while maintaining aspect ratio
      const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
      if (imageWidth > maxWidth) {
        const ratio = maxWidth / imageWidth;
        imageWidth = maxWidth;
        imageHeight = imageHeight * ratio;
      }
      
      // Check if we need a new page
      if (this.yPosition + imageHeight + 20 > this.pageHeight - this.margins.bottom) {
        this.pdf.addPage();
        this.currentPage++;
        this.yPosition = this.margins.top;
      }
      
      // Calculate centering
      const imageX = (this.pageWidth - imageWidth) / 2;
      
      // Add image
      this.pdf.addImage(
        imageContent.url,
        'JPEG',
        imageX,
        this.yPosition,
        imageWidth,
        imageHeight
      );
      
      // Add caption if available
      if (imageContent.caption) {
        this.pdf.setFontSize(this.defaultStyles.caption.fontSize);
        this.pdf.setTextColor(
          this.defaultStyles.caption.textColor[0],
          this.defaultStyles.caption.textColor[1],
          this.defaultStyles.caption.textColor[2]
        );
        
        const captionLines = this.pdf.splitTextToSize(
          imageContent.caption,
          this.pageWidth - this.margins.left - this.margins.right
        );
        
        this.pdf.text(
          captionLines,
          this.margins.left,
          this.yPosition + imageHeight + 5,
          { align: 'left' }
        );
        
        this.yPosition += captionLines.length * 5;
      }
      
      // Update y position
      this.yPosition += imageHeight + 15;
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }

  /**
   * Add section header to PDF
   * @param content Section header content
   */
  private addSectionHeader(content: SectionHeaderReportContent): void {
    const headerContent = content.content;
    
    // Set header style based on level
    let fontSize = 18;
    switch (headerContent.level) {
      case 1:
        fontSize = 18;
        break;
      case 2:
        fontSize = 16;
        break;
      case 3:
        fontSize = 14;
        break;
      case 4:
      case 5:
      case 6:
        fontSize = 12;
        break;
    }
    
    // Check if we need a new page - for level 1 headers, always start on a new page
    if (headerContent.level === 1 || this.yPosition > this.pageHeight - this.margins.bottom - 30) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    // Update TOC entry with correct page number
    const tocIndex = this.tocItems.findIndex(
      item => item.title === headerContent.title && item.level === headerContent.level
    );
    if (tocIndex !== -1) {
      this.tocItems[tocIndex].page = this.currentPage;
    }
    
    // Add header
    this.pdf.setFontSize(fontSize);
    this.pdf.setTextColor(
      this.defaultStyles.header.textColor[0],
      this.defaultStyles.header.textColor[1],
      this.defaultStyles.header.textColor[2]
    );
    
    this.pdf.text(headerContent.title, this.margins.left, this.yPosition);
    
    // Add underline for level 1 and 2 headers
    if (headerContent.level <= 2) {
      const lineWidth = this.pdf.getTextWidth(headerContent.title);
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(
        this.margins.left,
        this.yPosition + 1,
        this.margins.left + lineWidth,
        this.yPosition + 1
      );
    }
    
    // Update y position
    this.yPosition += 15;
  }

  /**
   * Add page break to PDF
   */
  private addPageBreak(): void {
    this.pdf.addPage();
    this.currentPage++;
    this.yPosition = this.margins.top;
  }

  /**
   * Add page numbers to PDF
   */
  private addPageNumbers(): void {
    // Get total pages
    this.totalPages = this.pdf.getNumberOfPages();
    
    // Add page numbers to each page
    for (let i = 1; i <= this.totalPages; i++) {
      this.pdf.setPage(i);
      
      // Skip cover page if included
      if (i === 1 && this.options.includeCoverPage) continue;
      
      // Add page number
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        `Page ${i} of ${this.totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      
      // Add header if enabled
      if (this.options.includeHeader) {
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(120, 120, 120);
        this.pdf.text(
          this.report.title,
          this.pageWidth / 2,
          8,
          { align: 'center' }
        );
      }
      
      // Add footer if enabled
      if (this.options.includeFooter && this.report.metadata) {
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(120, 120, 120);
        
        const footerText = this.report.metadata.facility_name 
          ? `${this.report.metadata.facility_name} - Energy Audit Report`
          : 'Energy Audit Report';
        
        this.pdf.text(
          footerText,
          this.pageWidth / 2,
          this.pageHeight - 5,
          { align: 'center' }
        );
      }
    }
  }

  /**
   * Strip HTML tags from text
   * @param html HTML text
   * @returns Plain text
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, '');
  }

  /**
   * Save PDF to file
   */
  public save(): void {
    this.pdf.save(this.options.fileName);
  }
}

/**
 * Get a PDFExporter service instance
 * 
 * @returns PDFExporter service
 */
export function getPDFExportService(): {
  generatePDF: (report: Report, fileName?: string) => Promise<void>;
} {
  return {
    generatePDF: async (report: Report, fileName?: string): Promise<void> => {
      const options: PDFExportOptions = {
        fileName: fileName || `${report.title.replace(/\s+/g, '_')}_report.pdf`
      };
      
      const exporter = new PDFExporter(report, options);
      const pdfBlob = await exporter.generatePDF();
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = options.fileName || 'report.pdf';
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
    }
  };
} 