# Enhanced PDF Export Implementation Plan

## Overview

This document outlines the plan for significantly improving the PDF export capabilities across all calculators in the Energy Audit Platform, with initial focus on the Schedule of Loads calculator. The enhanced PDF exports will include comprehensive analysis, visualizations, and compliance information.

## Current Status (40% Complete)

- [x] Basic PDF generation functionality
- [x] Table-based data export for Schedule of Loads 
- [x] Simple compliance status indicators
- [ ] Data visualizations and charts
- [ ] Comprehensive analysis sections
- [ ] Multi-panel support
- [ ] Executive summary
- [ ] Unified branding and styling

## Architecture

### Core Components

1. **PDFGenerator Service**
   - Common interface for all calculator exports
   - Template-based generation for consistency
   - Configurable sections and layouts

2. **Visualization Renderer**
   - Canvas-based chart rendering for PDF
   - Support for different chart types (bar, pie, line)
   - Theme-aware color schemes

3. **Analysis Engine**
   - Standardized analysis sections
   - Compliance checking against standards
   - Recommendation generation

4. **Template System**
   - Header/footer templates
   - Section templates
   - Page layout management

## Implementation Plan

### Phase 1: Schedule of Loads PDF Export Enhancement (1 week)

1. **Improved Layout and Structure**
   - Create professional cover page with project info
   - Add executive summary section
   - Organize into logical sections (panel info, load schedule, analysis)
   - Add proper headers, footers, and page numbering

2. **Data Visualization Components**
   - Add load distribution pie chart
   - Add voltage drop analysis chart
   - Add economic sizing comparison chart
   - Add phase balance visualization (for 3-phase panels)

3. **Enhanced Analysis Sections**
   - Add comprehensive voltage drop analysis with recommendations
   - Add economic sizing analysis with ROI calculations
   - Add PEC compliance analysis with reference to specific code sections
   - Add energy consumption projections and cost analysis

4. **Multi-Panel Support**
   - Enable exporting multiple panels in a single report
   - Add panel comparison section
   - Implement summary of all panels

### Phase 2: Core PDF Export Framework (1 week)

1. **Create Common PDF Generation Service**
   - Develop reusable PDF generation service
   - Implement template system for consistency
   - Create shared components (headers, footers, charts)

2. **Visualization Component Library**
   - Implement reusable chart components for PDF
   - Create table formatting utilities
   - Add image embedding support for floor plans

3. **Styling and Branding**
   - Create consistent styling across all reports
   - Implement theme support (light/dark)
   - Add configurable branding elements

4. **Integration with Standards Reference**
   - Link analysis to specific code sections
   - Include relevant standard references
   - Add code compliance explanations

### Phase 3: Cross-Calculator Implementation (2 weeks)

1. **Update Each Calculator's PDF Export**
   - Lighting calculator export
   - HVAC calculator export
   - Equipment calculator export
   - Power factor calculator export
   - Voltage drop calculator export

2. **Calculator-Specific Visualizations**
   - Add lighting distribution charts
   - Add HVAC load profile visualizations
   - Add equipment duty cycle visualizations
   - Add power factor triangle diagram
   - Add voltage profile charts

3. **Integration with Saved Calculations**
   - Add ability to include historical data
   - Enable comparison with previous calculations
   - Support batch export of saved calculations

4. **User Customization Options**
   - Allow selecting sections to include
   - Provide detail level options
   - Enable custom notes and annotations

## Technical Implementation Details

### PDF Generation Library

We'll use the existing PDF generation library with the following enhancements:

```typescript
// Enhanced PDF generation service
class EnhancedPDFGenerator {
  private doc: jsPDF;
  private currentPage: number = 1;
  private totalPages: number = 1;
  private config: PDFGenerationConfig;
  
  constructor(config: PDFGenerationConfig) {
    this.config = config;
    this.doc = new jsPDF({
      orientation: config.orientation || 'portrait',
      unit: 'mm',
      format: config.format || 'a4'
    });
    
    // Initialize document with styles
    this.initializeDocument();
  }
  
  private initializeDocument() {
    // Set fonts, colors, etc.
    this.doc.setFont('helvetica');
    this.doc.setFontSize(10);
    
    // Add metadata
    this.doc.setProperties({
      title: this.config.title || 'Energy Audit Report',
      subject: this.config.subject || 'Analysis and Recommendations',
      author: this.config.author || 'Energy Audit Platform',
      keywords: this.config.keywords || 'energy, audit, analysis',
      creator: 'Energy Audit Platform PDF Generator'
    });
  }
  
  // Add a cover page with project information
  public addCoverPage(projectInfo: ProjectInfo) {
    this.doc.setFontSize(24);
    this.doc.setTextColor(0, 51, 102);
    this.doc.text(this.config.title || 'Energy Audit Report', 105, 60, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text(projectInfo.name || '', 105, 75, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 85, { align: 'center' });
    
    // Add logo if provided
    if (this.config.logoUrl) {
      this.doc.addImage(this.config.logoUrl, 'PNG', 80, 20, 50, 20);
    }
    
    this.addFooter();
    this.doc.addPage();
    this.currentPage++;
  }
  
  // Add an executive summary
  public addExecutiveSummary(summary: ExecutiveSummary) {
    this.addSectionHeader('Executive Summary');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(summary.overview || '', 20, 40, { maxWidth: 170 });
    
    // Add key findings
    if (summary.keyFindings && summary.keyFindings.length > 0) {
      this.doc.setFontSize(11);
      this.doc.text('Key Findings:', 20, 70);
      
      this.doc.setFontSize(10);
      let yPos = 80;
      for (const finding of summary.keyFindings) {
        this.doc.text('• ' + finding, 25, yPos, { maxWidth: 165 });
        yPos += 10;
        
        if (yPos > 270) {
          this.addFooter();
          this.doc.addPage();
          this.currentPage++;
          yPos = 30;
        }
      }
    }
    
    this.addFooter();
    this.doc.addPage();
    this.currentPage++;
  }
  
  // Add a chart to the PDF
  public addChart(chartType: 'pie'|'bar'|'line', data: any, options: ChartOptions) {
    const canvas = document.createElement('canvas');
    canvas.width = options.width || 500;
    canvas.height = options.height || 300;
    
    // Create chart using Chart.js
    const chart = new Chart(canvas.getContext('2d'), {
      type: chartType,
      data: data,
      options: {
        ...options.chartOptions,
        animation: false,
        responsive: false
      }
    });
    
    // Wait for chart rendering
    setTimeout(() => {
      const imageData = canvas.toDataURL('image/png');
      this.doc.addImage(
        imageData,
        'PNG',
        options.x || 20,
        options.y || 60,
        options.width / 5 || 100,
        options.height / 5 || 60
      );
      
      // Add chart title
      if (options.title) {
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(options.title, (options.x || 20) + (options.width / 10), (options.y || 60) - 5);
      }
      
      // Clean up
      chart.destroy();
    }, 100);
  }
  
  // Add analysis section
  public addAnalysisSection(title: string, content: string, recommendations: string[]) {
    this.addSectionHeader(title);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(content, 20, 40, { maxWidth: 170 });
    
    // Add recommendations
    if (recommendations && recommendations.length > 0) {
      this.doc.setFontSize(11);
      this.doc.text('Recommendations:', 20, 90);
      
      this.doc.setFontSize(10);
      let yPos = 100;
      for (const recommendation of recommendations) {
        this.doc.text('• ' + recommendation, 25, yPos, { maxWidth: 165 });
        yPos += 10;
        
        if (yPos > 270) {
          this.addFooter();
          this.doc.addPage();
          this.currentPage++;
          yPos = 30;
        }
      }
    }
  }
  
  // Helper for section headers
  private addSectionHeader(title: string) {
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(10, 20, 190, 10, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 51, 102);
    this.doc.text(title, 15, 27);
  }
  
  // Add footer with page numbers
  private addFooter() {
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Page ${this.currentPage} of ${this.totalPages}`, 105, 290, { align: 'center' });
    
    const now = new Date();
    this.doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, 290);
    
    if (this.config.companyName) {
      this.doc.text(this.config.companyName, 190, 290, { align: 'right' });
    }
  }
  
  // Calculate total pages based on content
  public calculateTotalPages(contentSections: number) {
    // Approximate calculation - will need refinement based on actual content
    this.totalPages = 2 + Math.ceil(contentSections / 2); // Cover + Summary + Content
    return this.totalPages;
  }
  
  // Generate and save the PDF
  public generatePDF(): Blob {
    // Update all footers with correct total page count
    // Would need to be implemented based on specific PDF library capabilities
    
    return this.doc.output('blob');
  }
}
```

## Schedule of Loads Specific Implementation

For the Schedule of Loads calculator, we'll create the following specialized sections:

1. **Panel Information**
   - Panel details (name, voltage, etc.)
   - Main breaker and feeder information
   - Location and purpose 

2. **Load Schedule Table**
   - Complete load schedule with all circuit details
   - Highlight critical or non-compliant circuits
   - Include calculated values (connected load, demand load, current)

3. **Voltage Drop Analysis**
   - Voltage drop for each circuit
   - Summary of circuits exceeding PEC limits
   - Recommendations for problematic circuits

4. **Economic Sizing Analysis**
   - Comparison of current vs. recommended conductor sizes
   - ROI and payback period calculations
   - Potential energy and cost savings

5. **Phase Balance Analysis** (for 3-phase panels)
   - Phase loading comparison
   - Unbalance calculations
   - Recommendations for rebalancing

6. **Compliance Summary**
   - PEC 2017 compliance status
   - List of non-compliant items with code references
   - Recommended corrective actions

## Timeline

- **Week 1:** Complete Schedule of Loads PDF enhancements
- **Week 2:** Build core PDF framework and components
- **Week 3-4:** Implement for remaining calculators

## Success Criteria

1. Professional-quality PDFs with consistent branding and formatting
2. Rich visualizations that effectively communicate analysis results
3. Comprehensive analysis sections with actionable recommendations
4. Clear compliance status and references to standards
5. Consistent implementation across all calculators
6. User-friendly export process with options for customization

## Future Enhancements

1. **Interactive PDF features**
   - Bookmarks and table of contents
   - Hyperlinks to reference materials
   - Form fields for annotations

2. **Batch Export**
   - Generate reports for multiple calculations
   - Create comprehensive project-wide reports

3. **External Integrations**
   - Email delivery of reports
   - Cloud storage integration
   - Collaboration features 