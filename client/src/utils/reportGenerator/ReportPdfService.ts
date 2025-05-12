import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ChartConfiguration } from 'chart.js';
import { ChartGenerator } from './chartGenerator';

// Define interfaces for report data
interface ReportMetadata {
  title: string;
  author: string;
  date: string;
  company: string;
  logo?: string;
  calculatorType: string;
}

interface TextSection {
  title: string;
  content: string;
}

interface ChartSection {
  title: string;
  description?: string;
  chartConfig: {
    configuration: ChartConfiguration;
    theme: string;
    size: 'small' | 'medium' | 'large' | 'full-width';
  };
}

interface TableSection {
  title: string;
  headers: string[];
  rows: string[][];
}

type ReportSection = TextSection | ChartSection | TableSection;

interface ReportData {
  metadata: ReportMetadata;
  sections: ReportSection[];
}

interface PdfOptions {
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  companyLogo?: string;
  includePageNumbers: boolean;
  includeTableOfContents: boolean;
  quality: 'draft' | 'standard' | 'high';
}

/**
 * Service for generating PDF reports with embedded charts
 */
export class ReportPdfService {
  private pdf: jsPDF;
  private options: PdfOptions;
  private currentPage: number = 1;
  private totalPages: number = 1;
  private yPosition: number = 0;
  private pageHeight: number = 0;
  private pageWidth: number = 0;
  private margins = { top: 20, right: 20, bottom: 20, left: 20 };
  private chartImages: Map<string, string> = new Map();

  constructor(options: Partial<PdfOptions> = {}) {
    this.options = {
      pageSize: options.pageSize || 'a4',
      orientation: options.orientation || 'portrait',
      margins: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
      companyLogo: options.companyLogo,
      includePageNumbers: options.includePageNumbers !== undefined ? options.includePageNumbers : true,
      includeTableOfContents: options.includeTableOfContents !== undefined ? options.includeTableOfContents : false,
      quality: options.quality || 'standard'
    };
    
    this.margins = this.options.margins;
    
    // Initialize PDF document
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize
    });
    
    // Set page dimensions
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    
    // Initialize y position to top margin
    this.yPosition = this.margins.top;
  }
  
  /**
   * Generate PDF from report data
   * @param reportData Report data including metadata and sections
   * @returns Promise with PDF blob
   */
  public async generatePdf(reportData: ReportData): Promise<Blob> {
    try {
      // Set document properties
      this.pdf.setProperties({
        title: reportData.metadata.title,
        subject: `Energy Audit Report: ${reportData.metadata.calculatorType}`,
        author: reportData.metadata.author,
        keywords: 'energy audit, report',
        creator: 'Energy Audit Platform'
      });
      
      // Add cover page
      await this.addCoverPage(reportData.metadata);
      
      // Add table of contents if enabled
      if (this.options.includeTableOfContents) {
        this.addTableOfContents(reportData.sections);
      }
      
      // Pregenerate all chart images
      if (reportData.sections.some(section => 'chartConfig' in section)) {
        await this.pregenerateChartImages(reportData.sections.filter(section => 
          'chartConfig' in section
        ) as ChartSection[]);
      }
      
      // Process each section
      for (const section of reportData.sections) {
        if ('content' in section) {
          // Text section
          this.addTextSection(section as TextSection);
        } else if ('chartConfig' in section) {
          // Chart section
          await this.addChartSection(section as ChartSection);
        } else if ('headers' in section) {
          // Table section
          this.addTableSection(section as TableSection);
        }
      }
      
      // Add page numbers if enabled
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
   * @param metadata Report metadata
   */
  private async addCoverPage(metadata: ReportMetadata): Promise<void> {
    // Set background color for cover page
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Add company logo if provided
    if (metadata.logo) {
      try {
        const logoWidth = 60;
        const logoHeight = 30;
        const logoX = (this.pageWidth - logoWidth) / 2;
        
        this.pdf.addImage(
          metadata.logo,
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
    const titleFontSize = 24;
    this.pdf.setFontSize(titleFontSize);
    this.pdf.setTextColor(50, 50, 50);
    
    const titleLines = this.pdf.splitTextToSize(
      metadata.title,
      this.pageWidth - (this.margins.left + this.margins.right) * 2
    );
    
    const titleY = metadata.logo ? 80 : 60;
    this.pdf.text(titleLines, this.pageWidth / 2, titleY, { align: 'center' });
    
    // Add report type
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      `${metadata.calculatorType} Audit Report`,
      this.pageWidth / 2,
      titleY + titleLines.length * titleFontSize / 2 + 20,
      { align: 'center' }
    );
    
    // Add metadata
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(80, 80, 80);
    
    const metadataY = this.pageHeight - 80;
    this.pdf.text(`Author: ${metadata.author}`, this.margins.left, metadataY);
    this.pdf.text(`Company: ${metadata.company}`, this.margins.left, metadataY + 8);
    this.pdf.text(`Date: ${metadata.date}`, this.margins.left, metadataY + 16);
    
    // Add new page for content
    this.pdf.addPage();
    this.currentPage++;
    this.yPosition = this.margins.top;
  }
  
  /**
   * Add table of contents
   * @param sections Report sections
   */
  private addTableOfContents(sections: ReportSection[]): void {
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text('Table of Contents', this.margins.left, this.yPosition);
    
    this.yPosition += 15;
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    
    let tocPage = 2; // Start with page 2 (after cover)
    
    sections.forEach((section, index) => {
      const title = 'title' in section ? section.title : `Section ${index + 1}`;
      
      // Estimate if we need more space
      if (this.yPosition > this.pageHeight - this.margins.bottom - 10) {
        this.pdf.addPage();
        this.currentPage++;
        this.yPosition = this.margins.top;
      }
      
      this.pdf.text(title, this.margins.left, this.yPosition);
      this.pdf.text(`Page ${tocPage}`, this.pageWidth - this.margins.right - 15, this.yPosition, { align: 'right' });
      
      this.yPosition += 8;
      tocPage++; // Increment page counter (simplified, not accurate for large sections)
    });
    
    this.pdf.addPage();
    this.currentPage++;
    this.yPosition = this.margins.top;
  }
  
  /**
   * Add text section to PDF
   * @param section Text section data
   */
  private addTextSection(section: TextSection): void {
    // Add section title
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(60, 60, 60);
    
    // Check if we need to add a page break
    if (this.yPosition > this.pageHeight - this.margins.bottom - 40) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    this.pdf.text(section.title, this.margins.left, this.yPosition);
    this.yPosition += 10;
    
    // Add section content
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    
    const contentLines = this.pdf.splitTextToSize(
      section.content,
      this.pageWidth - this.margins.left - this.margins.right
    );
    
    // Check if content fits on current page, otherwise add new page
    if (this.yPosition + contentLines.length * 5 > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    this.pdf.text(contentLines, this.margins.left, this.yPosition);
    this.yPosition += contentLines.length * 5 + 15; // Add some space after content
  }
  
  /**
   * Add chart section to PDF
   * @param section Chart section data
   */
  private async addChartSection(section: ChartSection): Promise<void> {
    // Add section title
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(60, 60, 60);
    
    // Check if we need to add a page break
    // Charts usually need more space, so add a new page if we're past 1/3 of the page
    if (this.yPosition > this.pageHeight - this.margins.bottom - 100) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    this.pdf.text(section.title, this.margins.left, this.yPosition);
    this.yPosition += 10;
    
    // Add description if provided
    if (section.description) {
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(80, 80, 80);
      
      const descriptionLines = this.pdf.splitTextToSize(
        section.description,
        this.pageWidth - this.margins.left - this.margins.right
      );
      
      this.pdf.text(descriptionLines, this.margins.left, this.yPosition);
      this.yPosition += descriptionLines.length * 5 + 5;
    }
    
    // Use pre-generated chart image if available
    const chartId = `chart-${section.title.replace(/\s+/g, '-').toLowerCase()}`;
    let chartImageData = this.chartImages.get(chartId);
    
    if (!chartImageData) {
      // Generate chart image if not pre-generated
      const devicePixelRatio = this.options.quality === 'high' ? 3 : 
                              this.options.quality === 'standard' ? 2 : 1;
      
      // Determine chart dimensions based on size setting
      let chartWidth = this.pageWidth - this.margins.left - this.margins.right;
      let chartHeight = 120; // Default height
      
      switch (section.chartConfig.size) {
        case 'small':
          chartHeight = 80;
          chartWidth = chartWidth * 0.6;
          break;
        case 'medium':
          chartHeight = 120;
          break;
        case 'large':
          chartHeight = 160;
          break;
        case 'full-width':
          chartHeight = 200;
          break;
      }
      
      try {
        // Convert chart to image
        chartImageData = await ChartGenerator.generateChartForPDF(
          section.chartConfig.configuration,
          section.chartConfig.theme,
          chartWidth * devicePixelRatio,
          chartHeight * devicePixelRatio,
          'png'
        );
      } catch (error) {
        console.error('Error generating chart image:', error);
        this.yPosition += 10;
        this.pdf.setTextColor(255, 0, 0);
        this.pdf.text('Error rendering chart', this.margins.left, this.yPosition);
        this.yPosition += 15;
        return;
      }
    }
    
    if (chartImageData) {
      try {
        // Calculate chart dimensions based on size setting
        let chartWidth = this.pageWidth - this.margins.left - this.margins.right;
        let chartHeight = 120; // Default height
        
        switch (section.chartConfig.size) {
          case 'small':
            chartHeight = 80;
            chartWidth = chartWidth * 0.6;
            break;
          case 'medium':
            chartHeight = 120;
            break;
          case 'large':
            chartHeight = 160;
            break;
          case 'full-width':
            chartHeight = 200;
            break;
        }
        
        // Check if chart fits on current page, otherwise add new page
        if (this.yPosition + chartHeight > this.pageHeight - this.margins.bottom) {
          this.pdf.addPage();
          this.currentPage++;
          this.yPosition = this.margins.top;
        }
        
        // Center the chart horizontally if not full width
        const xPosition = section.chartConfig.size === 'small' ? 
          this.margins.left + (this.pageWidth - this.margins.left - this.margins.right - chartWidth) / 2 : 
          this.margins.left;
        
        // Add chart image to PDF
        this.pdf.addImage(
          chartImageData,
          'PNG',
          xPosition,
          this.yPosition,
          chartWidth,
          chartHeight
        );
        
        this.yPosition += chartHeight + 15; // Add some space after chart
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
        this.pdf.setTextColor(255, 0, 0);
        this.pdf.text('Error embedding chart', this.margins.left, this.yPosition);
        this.yPosition += 15;
      }
    }
  }
  
  /**
   * Add table section to PDF
   * @param section Table section data
   */
  private addTableSection(section: TableSection): void {
    // Add section title
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(60, 60, 60);
    
    // Check if we need to add a page break
    if (this.yPosition > this.pageHeight - this.margins.bottom - 40) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
    
    this.pdf.text(section.title, this.margins.left, this.yPosition);
    this.yPosition += 10;
    
    // Use jsPDF-AutoTable to add table
    (this.pdf as any).autoTable({
      head: [section.headers],
      body: section.rows,
      startY: this.yPosition,
      margin: { left: this.margins.left, right: this.margins.right },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Update y position after table
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
    
    // If table ended near the bottom of the page, add a new page
    if (this.yPosition > this.pageHeight - this.margins.bottom - 30) {
      this.pdf.addPage();
      this.currentPage++;
      this.yPosition = this.margins.top;
    }
  }
  
  /**
   * Pre-generate all chart images for better performance
   * @param chartSections Chart sections to pre-generate
   */
  private async pregenerateChartImages(chartSections: ChartSection[]): Promise<void> {
    const devicePixelRatio = this.options.quality === 'high' ? 3 : 
                           this.options.quality === 'standard' ? 2 : 1;
    
    // Create configuration array for batch generation
    const chartConfigs = chartSections.map(section => {
      const chartWidth = this.pageWidth - this.margins.left - this.margins.right;
      let chartHeight = 120; // Default height
      
      switch (section.chartConfig.size) {
        case 'small':
          chartHeight = 80;
          break;
        case 'medium':
          chartHeight = 120;
          break;
        case 'large':
          chartHeight = 160;
          break;
        case 'full-width':
          chartHeight = 200;
          break;
      }
      
      return {
        configuration: section.chartConfig.configuration,
        theme: section.chartConfig.theme,
        width: chartWidth * devicePixelRatio,
        height: chartHeight * devicePixelRatio
      };
    });
    
    try {
      // Generate all chart images in batch
      const chartImages = await ChartGenerator.batchGenerateChartsForPDF(chartConfigs);
      
      // Store images in map for later use
      chartSections.forEach((section, index) => {
        const chartId = `chart-${section.title.replace(/\s+/g, '-').toLowerCase()}`;
        this.chartImages.set(chartId, chartImages[index]);
      });
    } catch (error) {
      console.error('Error batch generating chart images:', error);
    }
  }
  
  /**
   * Add page numbers to all pages
   */
  private addPageNumbers(): void {
    // Calculate total pages
    this.totalPages = this.currentPage;
    
    // Add page numbers to each page
    for (let i = 1; i <= this.totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        `Page ${i} of ${this.totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}

export default ReportPdfService;
export type { ReportData, ReportMetadata, ReportSection, PdfOptions, TextSection, ChartSection, TableSection }; 