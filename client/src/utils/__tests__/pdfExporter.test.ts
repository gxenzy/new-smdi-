import { PDFExporter } from '../pdfExporter';
import { Report, ReportContentType } from '../../types/reports';

// Mock jsPDF
jest.mock('jspdf', () => {
  const mockJsPDF = {
    text: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    addPage: jest.fn(),
    splitTextToSize: jest.fn().mockImplementation((text) => [text]),
    output: jest.fn().mockReturnValue(new Blob([])),
    autoTable: jest.fn()
  };

  return { 
    jsPDF: jest.fn().mockImplementation(() => mockJsPDF)
  };
});

describe('PDFExporter', () => {
  // Sample report for testing
  const mockReport: Report = {
    id: 1,
    title: 'Test Report',
    description: 'Test description',
    type: 'energy_audit',
    status: 'published',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    created_by: 1,
    is_template: false,
    is_public: false,
    version: 1,
    contents: [
      {
        id: 1,
        report_id: 1,
        content_type: 'text',
        order_index: 0,
        content: {
          text: 'Sample text content',
          isHtml: false
        }
      },
      {
        id: 2,
        report_id: 1,
        content_type: 'section_header',
        order_index: 1,
        content: {
          title: 'Sample Section',
          level: 2
        }
      },
      {
        id: 3,
        report_id: 1,
        content_type: 'table',
        order_index: 2,
        content: {
          caption: 'Sample Table',
          headers: ['Header 1', 'Header 2'],
          rows: [
            ['Cell 1', 'Cell 2'],
            ['Cell 3', 'Cell 4']
          ]
        }
      }
    ],
    metadata: {
      client_name: 'Test Client',
      facility_name: 'Test Facility',
      audit_date: '2023-01-01',
      auditor_name: 'Test Auditor',
      executive_summary: 'This is a test executive summary',
      include_toc: false,
      include_appendices: false
    },
    public_link: null,
    shares: []
  };

  it('should generate a PDF successfully', async () => {
    // Execute
    const result = await PDFExporter.generatePDF(mockReport);
    
    // Verify
    expect(result).toBeInstanceOf(Blob);
  });

  it('should handle errors during PDF generation', async () => {
    // Mock implementation to throw error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock jsPDF to throw an error
    const mockJsPDF = require('jspdf').jsPDF;
    mockJsPDF.mockImplementationOnce(() => {
      return {
        text: jest.fn(),
        setFontSize: jest.fn(),
        setTextColor: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
        addPage: jest.fn(),
        splitTextToSize: jest.fn(),
        output: jest.fn()
      };
    });

    // Execute and verify
    await expect(PDFExporter.generatePDF(mockReport)).rejects.toThrow('Failed to generate PDF');
  });

  it('should render all content types', async () => {
    // Create a mock report with all content types
    const fullContentReport: Report = {
      ...mockReport,
      contents: [
        {
          id: 1,
          report_id: 1,
          content_type: 'text',
          order_index: 0,
          content: {
            text: 'Sample text content',
            isHtml: false
          }
        },
        {
          id: 2,
          report_id: 1,
          content_type: 'text',
          order_index: 1,
          content: {
            text: '<p>Sample HTML content</p>',
            isHtml: true
          }
        },
        {
          id: 3,
          report_id: 1,
          content_type: 'section_header',
          order_index: 2,
          content: {
            title: 'Sample Section',
            level: 2
          }
        },
        {
          id: 4,
          report_id: 1,
          content_type: 'table',
          order_index: 3,
          content: {
            caption: 'Sample Table',
            headers: ['Header 1', 'Header 2'],
            rows: [
              ['Cell 1', 'Cell 2'],
              ['Cell 3', 'Cell 4']
            ]
          }
        },
        {
          id: 5,
          report_id: 1,
          content_type: 'image',
          order_index: 4,
          content: {
            url: 'https://example.com/image.jpg',
            caption: 'Sample Image',
            altText: 'Alt text',
            width: 300,
            height: 200
          }
        },
        {
          id: 6,
          report_id: 1,
          content_type: 'chart',
          order_index: 5,
          content: {
            chartType: 'bar',
            caption: 'Sample Chart',
            data: {},
            options: {},
            height: 300
          }
        },
        {
          id: 7,
          report_id: 1,
          content_type: 'page_break',
          order_index: 6,
          content: {
            type: 'page'
          }
        },
        {
          id: 8,
          report_id: 1,
          content_type: 'custom' as ReportContentType,
          order_index: 7,
          content: {}
        }
      ]
    };
    
    // Spy on console.warn for unknown content type
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Execute
    const result = await PDFExporter.generatePDF(fullContentReport);
    
    // Verify
    expect(result).toBeInstanceOf(Blob);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unsupported content type'));
  });
}); 