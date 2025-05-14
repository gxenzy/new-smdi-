# Chart PDF Export Integration - Next Steps

## Overview

To complete the PDF export integration for reports with interactive charts, we need to implement the following components and functionalities:

1. PDF Report Generator Service
2. Chart Image Rendering for PDF
3. Report Template System
4. Company Branding Integration
5. Report Saving & Management

## 1. PDF Report Generator Service

### Implementation Tasks

- [ ] Create a `ReportPdfService` class with methods for generating PDFs
- [ ] Implement page layout and sectioning for multi-page reports
- [ ] Add support for headers, footers, and page numbers
- [ ] Handle different paper sizes (A4, Letter, etc.) and orientations
- [ ] Implement text formatting (headings, paragraphs, lists)
- [ ] Add table generation with row/column spanning

### Technical Requirements

```typescript
// ReportPdfService.ts
export class ReportPdfService {
  // Main method to generate PDF from report data
  public async generatePdf(reportData: ReportData): Promise<Blob> {
    // Implementation
  }
  
  // Handle chart image embedding
  private async embedCharts(charts: ChartConfig[]): Promise<void> {
    // Call ChartGenerator.generateChartForPDF for each chart
  }
  
  // Add text content with formatting
  private addFormattedText(section: TextSection): void {
    // Implementation
  }
  
  // Add tables from data
  private addTable(tableData: TableData): void {
    // Implementation
  }
}
```

## 2. Chart Image Rendering for PDF

### Implementation Tasks

- [x] Create methods in ChartGenerator for PDF-optimized rendering (DONE)
- [x] Implement chart resolution and quality setting controls
- [x] Handle chart scaling for different report layouts 
- [x] Add batch processing for multiple chart generation
- [x] Add type-safe tooltip formatting for numerical operations
- [x] Fix export issues with chartThemes and type definitions
- [ ] Test chart image quality at different resolutions
- [ ] Add caching mechanism for generated chart images

### Technical Requirements

- [x] Implement quality levels (draft, standard, high) with different devicePixelRatio values
- [x] Ensure font sizes are appropriate when rendered in PDF
- [x] Optimize PDF charts with serif fonts for better print rendering
- [x] Properly implement Chart.js integration with TypeScript
- [ ] Verify colors display correctly in printed output
- [ ] Test memory usage during batch chart generation

## 3. Report Template System

### Implementation Tasks

- [ ] Create predefined report templates for different calculator types
- [ ] Define standard section layouts (intro, methodology, findings, recommendations)
- [ ] Implement template selection in ReportBuilder
- [ ] Add template preview functionality
- [ ] Create a template customization interface

### Technical Requirements

```typescript
// Template types
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  calculatorType: string[];
  sections: SectionTemplate[];
  chartLayouts: ChartLayout[];
}

// Template selection component
const TemplateSelector: React.FC<{
  calculatorType: string;
  onSelectTemplate: (template: ReportTemplate) => void;
}> = ({ calculatorType, onSelectTemplate }) => {
  // Implementation
}
```

## 4. Company Branding Integration

### Implementation Tasks

- [ ] Add company logo upload and storage
- [ ] Implement color scheme customization based on company branding
- [ ] Create header and footer templates with company info
- [ ] Add document properties (author, company, keywords) to PDF metadata
- [ ] Implement watermarking options for draft reports

### Technical Requirements

- Support common image formats (PNG, JPEG, SVG) for logos
- Implement image resizing and optimization
- Store logo/branding settings in user preferences
- Apply branding consistently across all report pages

## 5. Report Saving & Management

### Implementation Tasks

- [ ] Design database schema for storing reports
- [ ] Implement report saving functionality
- [ ] Create report browsing interface
- [ ] Add report versioning capabilities
- [ ] Implement report sharing via email or link
- [ ] Add report export options (PDF, DOCX, etc.)

### Technical Requirements

```typescript
// Report data schema
interface SavedReport {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  calculatorType: string;
  calculatorData: any;
  reportData: ReportData;
  userId: string;
  companyId: string;
  isTemplate: boolean;
}

// Report repository interface
interface ReportRepository {
  saveReport(report: SavedReport): Promise<string>;
  getReportById(id: string): Promise<SavedReport>;
  listReports(filters: ReportFilters): Promise<SavedReport[]>;
  updateReport(id: string, report: Partial<SavedReport>): Promise<void>;
  deleteReport(id: string): Promise<void>;
}
```

## Integration with ReportBuilder

To integrate these features with the existing ReportBuilder:

1. Add PDF preview and export button to the preview step
2. Connect template selection to chart generation
3. Add company branding section to the report info step
4. Implement save/load functionality in the report actions
5. Add export options dialog with quality settings

## Testing Plan

1. Test chart rendering quality at different resolutions
2. Verify PDF layout across different devices and printers
3. Test report generation with large datasets
4. Verify performance with multiple charts
5. Test accessibility features of generated PDFs

## Deployment Considerations

1. Monitor client-side memory usage during PDF generation
2. Consider implementing server-side PDF generation for complex reports
3. Add error handling and retry logic for PDF generation
4. Implement progress indicators for long-running operations
5. Add analytics to track PDF generation success rates 