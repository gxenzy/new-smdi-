import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ChartGenerator } from './chartGenerator';

// Declare the autotable plugin for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (...args: any[]) => any;
  }
}

// Interface for PDF generation options
interface PDFGeneratorOptions {
  title: string;
  fileName?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  includeTimestamp?: boolean;
  includeLogo?: boolean;
  orientation?: 'portrait' | 'landscape';
}

abstract class PDFGenerator {
  protected doc!: jsPDF;
  protected options: PDFGeneratorOptions;
  protected pageWidth!: number;
  protected pageHeight!: number;

  constructor(options: PDFGeneratorOptions) {
    this.options = {
      ...options
    };
    
    // Initialize PDF document
    this.initDocument();
  }

  // Initialize the PDF document
  protected initDocument(): void {
    // Create jsPDF instance
    this.doc = new jsPDF({
      orientation: this.options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    this.doc.setProperties({
      title: this.options.title,
      author: this.options.author || 'Energy Audit Platform',
      subject: this.options.subject || 'Energy Audit Report',
      keywords: this.options.keywords || 'energy, audit, report',
      creator: this.options.creator || 'Energy Audit Platform'
    });
    
    // Get page dimensions
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    
    // Add header with title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.options.title, this.pageWidth / 2, 15, { align: 'center' });
    
    // Add timestamp if enabled
    if (this.options.includeTimestamp) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const today = new Date();
      this.doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, this.pageWidth - 15, 10, { align: 'right' });
    }
    
    // Add logo if enabled
    // TODO: Implement logo addition
  }
  
  // Abstract method for generating the report content
  public abstract generate(): Promise<void>;
  
  // Add a section heading
  protected addSectionHeading(title: string, y: number): number {
    // Check if heading would appear at the bottom of the page
    if (y > this.pageHeight - 30) {
      this.doc.addPage();
      y = 30; // Start at the top of the new page with some margin
    }
    
    this.doc.setFontSize(12); // Reduced from 14 for better spacing
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 15, y);
    
    // Add underline
    this.doc.setLineWidth(0.5);
    this.doc.line(15, y + 1, this.pageWidth - 15, y + 1);
    
    return y + 8; // Return the new y position
  }

  // Add a table to the document
  protected addTable(headers: string[], data: any[][], y: number, options: any = {}): number {
    // Check if table might go off page (rough estimate)
    const estimatedTableHeight = (data.length + 1) * 8; // Rough height estimate
    if (y + estimatedTableHeight > this.pageHeight - 20) {
      this.doc.addPage();
      y = 30; // Start at the top of the new page with some margin
    }
    
    const defaultOptions = {
      startY: y,
      head: [headers],
      body: data,
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8, // Reduced font size for tables
        cellPadding: 2, // Reduced padding for better cell sizing
        overflow: 'linebreak' // Force line breaks for long content
      },
      columnStyles: {} as Record<number, any>, // Will be populated for columns with potentially long content
      theme: 'grid'
    };
    
    // Apply column styles based on content type
    if (headers.includes('Description') || headers.includes('Recommendations') || 
        headers.includes('Notes') || headers.includes('Comments')) {
      // Find index of description column to apply specific styling
      const descColIndex = headers.findIndex(h => 
        h === 'Description' || h === 'Recommendations' || h === 'Notes' || h === 'Comments');
      
      if (descColIndex !== -1) {
        defaultOptions.columnStyles[descColIndex] = {
          cellWidth: 'auto', // Allow description columns to wrap text
          overflow: 'linebreak'
        };
      }
    }

    const tableOptions = { ...defaultOptions, ...options };
    this.doc.autoTable(tableOptions);
    
    // Return the new y position after the table
    return (this.doc as any).lastAutoTable.finalY + 10;
  }

  // Add a text paragraph
  protected addParagraph(text: string, y: number): number {
    // Set default font size for paragraph text
    this.doc.setFontSize(10); // Reduced from default to prevent overlapping
    this.doc.setFont('helvetica', 'normal');
    
    // Calculate available width for text (adjust margins for better readability)
    const availableWidth = this.pageWidth - 35; // Slightly wider margins
    
    // Split text to fit available width
    const splitText = this.doc.splitTextToSize(text, availableWidth);
    
    // Check if paragraph would go beyond page boundary
    const lineHeight = 5; // Line height in mm
    const totalTextHeight = splitText.length * lineHeight;
    
    // Add page break if needed
    if (y + totalTextHeight > this.pageHeight - 20) {
      this.doc.addPage();
      y = 30; // Start at the top of the new page with some margin
    }
    
    // Add text with proper alignment
    this.doc.text(splitText, 15, y);
    
    // Return the new y position with proper spacing
    return y + totalTextHeight + 5; // 5mm margin after paragraph
  }

  // Add a key-value section (for summary data)
  protected addKeyValueSection(data: { key: string, value: string | number | any }[], y: number, columns: number = 2): number {
    // Set smaller font size for key-value pairs
    this.doc.setFontSize(9); // Reduced font size for better readability in tables
    
    const columnWidth = (this.pageWidth - 40) / columns; // Wider margins for better spacing
    let currentY = y;
    let columnIndex = 0;
    
    // Calculate if we need a page break before starting
    const estimatedHeight = Math.ceil(data.length / columns) * 7 + 5;
    if (y + estimatedHeight > this.pageHeight - 20) {
      this.doc.addPage();
      currentY = 30; // Start at the top of the new page with some margin
    }
    
    data.forEach((item, index) => {
      const x = 15 + (columnIndex * columnWidth);
      
      // Key in bold
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${item.key}: `, x, currentY);
      
      // Value in normal font - ensure it's a string
      const keyWidth = this.doc.getTextWidth(`${item.key}: `);
      this.doc.setFont('helvetica', 'normal');
      
      // Handle long values - check if value would exceed column width
      const valueStr = String(item.value);
      const valueWidth = this.doc.getTextWidth(valueStr);
      
      if (keyWidth + valueWidth > columnWidth - 5) {
        // Value is too long, split it
        const availableWidthForValue = columnWidth - keyWidth - 5;
        const splitValue = this.doc.splitTextToSize(valueStr, availableWidthForValue);
        
        // Print first line after key
        this.doc.text(splitValue[0], x + keyWidth, currentY);
        
        // Print remaining lines with proper indentation if any
        for (let i = 1; i < splitValue.length; i++) {
          currentY += 5; // Move to next line
          this.doc.text(splitValue[i], x + keyWidth, currentY);
          
          // If we've hit a column break, reset column and keep going
          if (currentY > this.pageHeight - 20) {
            this.doc.addPage();
            currentY = 30;
            columnIndex = 0;
          }
        }
      } else {
        // Value fits, print it normally
        this.doc.text(valueStr, x + keyWidth, currentY);
      }
      
      // Move to next column or row
      columnIndex++;
      if (columnIndex >= columns) {
        columnIndex = 0;
        currentY += 7;
      }
    });
    
    // Ensure we return the correct y position even if we ended mid-row
    if (columnIndex !== 0) {
      currentY += 7;
    }
    
    return currentY + 5;
  }

  // Add a chart to the document
  protected async addChart(chartDataUrl: string, y: number, options: { width?: number, height?: number, caption?: string } = {}): Promise<number> {
    // Set default options
    const width = options.width || this.pageWidth - 40;
    const height = options.height || 120;
    
    // Check if we need to add a page break
    if (y + height + 15 > this.pageHeight) {
      this.doc.addPage();
      y = 20; // Reset y to top of new page
    }
    
    // Add the chart image
    this.doc.addImage(chartDataUrl, 'PNG', 20, y, width, height);
    
    // Add optional caption
    if (options.caption) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(options.caption, this.pageWidth / 2, y + height + 5, { align: 'center' });
      return y + height + 15; // Return the new y position after chart and caption
    }
    
    return y + height + 10; // Return the new y position after chart
  }

  // Add a bar chart
  protected async addBarChart(
    labels: string[], 
    data: number[], 
    y: number, 
    title?: string, 
    color?: string,
    options: { width?: number, height?: number, caption?: string } = {}
  ): Promise<number> {
    // Using generateChartForPDF instead of generateBarChart for better PDF rendering with visible axes
    const chartUrl = await ChartGenerator.generateChartForPDF({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title || '',
          data,
          backgroundColor: color || '#2196F3',
          borderColor: color || '#2196F3',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            },
            title: {
              display: true,
              text: 'Value',
              color: 'rgba(0, 0, 0, 0.9)',
              font: { size: 10, weight: 'bold' }
            }
          },
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            }
          }
        },
        plugins: {
          title: {
            display: !!title,
            text: title || '',
            font: { size: 14, weight: 'bold' },
            color: 'rgba(0, 0, 0, 0.9)'
          },
          legend: {
            display: false
          }
        }
      }
    }, 'default', options.width || 500, options.height || 250);
    
    return this.addChart(chartUrl, y, options);
  }

  // Add a pie chart
  protected async addPieChart(
    labels: string[], 
    data: number[], 
    y: number, 
    title?: string, 
    colors?: string[],
    options: { width?: number, height?: number, caption?: string } = {}
  ): Promise<number> {
    // Using generateChartForPDF for better PDF rendering
    const pieColors = colors || ChartGenerator.getThemeColors(data.length);
    
    const chartUrl = await ChartGenerator.generateChartForPDF({
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: pieColors.slice(0, data.length),
          borderWidth: 1,
          borderColor: 'white'
        }]
      },
      options: {
        plugins: {
          title: {
            display: !!title,
            text: title || '',
            font: { size: 14, weight: 'bold' },
            color: 'rgba(0, 0, 0, 0.9)'
          },
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(0, 0, 0, 0.8)',
              font: { size: 10, weight: 'bold' },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.dataset.data.reduce(
                  (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 
                  0
                );
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    }, 'default', options.width || 500, options.height || 250);
    
    return this.addChart(chartUrl, y, options);
  }

  // Add a line chart
  protected async addLineChart(
    labels: string[], 
    datasets: Array<{ data: number[], label: string, color?: string }>, 
    y: number, 
    title?: string,
    options: { width?: number, height?: number, caption?: string } = {}
  ): Promise<number> {
    // Using generateChartForPDF for better PDF rendering
    const themeColors = ChartGenerator.getThemeColors(datasets.length);
    
    const chartUrl = await ChartGenerator.generateChartForPDF({
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, index) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || themeColors[index],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: ds.color || themeColors[index],
          tension: 0.1
        }))
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            },
            title: {
              display: true,
              text: 'Value',
              color: 'rgba(0, 0, 0, 0.9)',
              font: { size: 10, weight: 'bold' }
            }
          },
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            }
          }
        },
        plugins: {
          title: {
            display: !!title,
            text: title || '',
            font: { size: 14, weight: 'bold' },
            color: 'rgba(0, 0, 0, 0.9)'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgba(0, 0, 0, 0.8)',
              font: { size: 10 },
              boxWidth: 12,
              padding: 10
            }
          }
        }
      }
    }, 'default', options.width || 500, options.height || 250);
    
    return this.addChart(chartUrl, y, options);
  }

  // Add a comparison chart
  protected async addComparisonChart(
    labels: string[], 
    beforeData: number[], 
    afterData: number[], 
    y: number, 
    title?: string,
    options: { width?: number, height?: number, caption?: string } = {}
  ): Promise<number> {
    // Using generateChartForPDF for better PDF rendering
    const chartUrl = await ChartGenerator.generateChartForPDF({
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Before',
            data: beforeData,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'After',
            data: afterData,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            },
            title: {
              display: true,
              text: 'Value',
              color: 'rgba(0, 0, 0, 0.9)',
              font: { size: 10, weight: 'bold' }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: { size: 10 }
            }
          }
        },
        plugins: {
          title: {
            display: !!title,
            text: title || 'Before/After Comparison',
            font: { size: 14, weight: 'bold' },
            color: 'rgba(0, 0, 0, 0.9)'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgba(0, 0, 0, 0.8)',
              font: { size: 10 },
              boxWidth: 12,
              padding: 10
            }
          }
        }
      }
    }, 'default', options.width || 500, options.height || 250);
    
    return this.addChart(chartUrl, y, options);
  }

  // Add a page break
  protected addPageBreak(): void {
    this.doc.addPage();
  }

  // Save the PDF
  public save(): void {
    const fileName = this.options.fileName || 'report.pdf';
    this.doc.save(fileName);
  }

  // Get the PDF as a blob (for preview or advanced handling)
  public getBlob(): Blob {
    return this.doc.output('blob');
  }

  // Open the PDF in a new tab
  public openInNewTab(): void {
    const blobUrl = URL.createObjectURL(this.doc.output('blob'));
    window.open(blobUrl, '_blank');
  }
}

// Lighting Calculator Report Generator
export class LightingReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'lighting-report.pdf',
      subject: 'Lighting Energy Calculation Report'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add calculation details section
    yPos = this.addSectionHeading('Lighting Calculation Details', yPos);
    
    // Get fixture data - handle both naming conventions for backward compatibility
    const fixtures = this.data.fixtures || this.data.fixtureCount || 0;
    const wattsPerFixture = this.data.wattsPerFixture || this.data.fixtureWattage || 0;
    const totalWattage = fixtures * wattsPerFixture;
    const lightingType = this.data.lightingType || 'Standard Lighting';
    
    const details = [
      { key: 'Lighting Type', value: lightingType },
      { key: 'No. of Fixtures', value: fixtures },
      { key: 'Watts per Fixture', value: `${wattsPerFixture} W` },
      { key: 'Hours per Day', value: `${this.data.hoursPerDay} hours` },
      { key: 'Days per Year', value: `${this.data.daysPerYear} days` },
      { key: 'Electricity Rate', value: `₱${this.data.electricityRate}/kWh` }
    ];
    
    yPos = this.addKeyValueSection(details, yPos);
    
    // Add results section
    yPos = this.addSectionHeading('Energy Consumption Results', yPos);
    
    const results = [
      { key: 'Total Connected Load', value: `${totalWattage.toFixed(2)} W` },
      { key: 'Daily Consumption', value: `${this.data.dailyConsumption.toFixed(2)} kWh/day` },
      { key: 'Annual Consumption', value: `${this.data.annualConsumption.toFixed(2)} kWh/year` },
      { key: 'Annual Energy Cost', value: `₱${this.data.annualCost.toFixed(2)}/year` }
    ];
    
    yPos = this.addKeyValueSection(results, yPos);

    // Add energy consumption chart
    yPos = await this.addBarChart(
      ['Daily (kWh)', 'Monthly (kWh)', 'Annual (kWh/10)'],
      [
        this.data.dailyConsumption,
        this.data.dailyConsumption * 30,
        this.data.annualConsumption / 10 // Scale down for visualization
      ],
      yPos,
      'Energy Consumption Summary',
      '#2196F3',
      { caption: 'Annual values are scaled for visualization purposes' }
    );

    // Calculate LED savings data
    const ledWattage = wattsPerFixture * 0.4; // Assume LED is 40% of original wattage
    const ledTotalWattage = ledWattage * fixtures;
    const ledConsumption = (ledTotalWattage * this.data.hoursPerDay) / 1000; // Daily in kWh
    const ledAnnualConsumption = ledConsumption * this.data.daysPerYear;
    const ledAnnualCost = ledAnnualConsumption * this.data.electricityRate;
    
    yPos = this.addSectionHeading('Potential LED Savings Analysis', yPos);
    
    // Add a comparison table
    const comparisonData = [
      [
        'Current System',
        `${wattsPerFixture} W`,
        this.data.dailyConsumption.toFixed(2),
        this.data.annualConsumption.toFixed(2),
        this.data.annualCost.toFixed(2)
      ],
      [
        'LED Alternative',
        `${ledWattage.toFixed(1)} W`,
        ledConsumption.toFixed(2),
        ledAnnualConsumption.toFixed(2),
        ledAnnualCost.toFixed(2)
      ]
    ];
    
    // Calculate percentage savings
    const savingsPercentage = ((this.data.annualCost - ledAnnualCost) / this.data.annualCost * 100).toFixed(1);
    
    // Add a savings row
    comparisonData.push([
      'Potential Savings',
      `${(100 - (ledWattage / wattsPerFixture * 100)).toFixed(1)}%`,
      `${(this.data.dailyConsumption - ledConsumption).toFixed(2)}`,
      `${(this.data.annualConsumption - ledAnnualConsumption).toFixed(2)}`,
      `${(this.data.annualCost - ledAnnualCost).toFixed(2)} (${savingsPercentage}%)`
    ]);
    
    // Customize table options for better readability
    const tableOptions = {
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 'auto' },  // System description
        1: { halign: 'center' },   // Wattage - center align
        2: { halign: 'right' },    // Daily - right align
        3: { halign: 'right' },    // Annual - right align
        4: { halign: 'right' }     // Cost - right align
      },
      // Highlight the savings row
      rowStyles: {
        2: { 
          fillColor: [220, 240, 220],
          textColor: [0, 100, 0]
        }
      }
    };
    
    yPos = this.addTable(
      ['System', 'Wattage per Fixture', 'Daily (kWh)', 'Annual (kWh)', 'Annual Cost (₱)'],
      comparisonData,
      yPos,
      tableOptions
    );
    
    // Visual comparison chart
    yPos = await this.addComparisonChart(
      ['Daily Consumption (kWh)', 'Annual Consumption (kWh/10)', 'Annual Cost (₱/100)'],
      [
        this.data.dailyConsumption,
        this.data.annualConsumption / 10,
        this.data.annualCost / 100
      ],
      [
        ledConsumption,
        ledAnnualConsumption / 10,
        ledAnnualCost / 100
      ],
      yPos,
      'Current vs. LED Lighting Comparison',
      { caption: 'Annual values are scaled for visualization purposes' }
    );
    
    // Add energy saving recommendations
    yPos = this.addSectionHeading('Energy Saving Recommendations', yPos);
    
    // Calculate potential savings with LED replacement
    const savings = this.data.annualCost - ledAnnualCost;
    
    yPos = this.addParagraph(
      `1. LED Replacement: Consider replacing current fixtures with LED alternatives. Estimated savings: ₱${savings.toFixed(2)}/year.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `2. Occupancy Sensors: Install occupancy sensors to automatically control lighting in less frequently used areas.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `3. Daylight Harvesting: Implement daylight sensors to dim artificial lighting when natural light is available.`, 
      yPos
    );
    
    // Add reference notes
    yPos = this.addSectionHeading('Reference Notes', yPos);
    yPos = this.addParagraph(
      'Calculations are based on PEC 2017 methods for load calculation. For more accurate results, consider measuring actual fixture wattage using a power meter.', 
      yPos
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Confidential', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }
}

// HVAC Calculator Report Generator
export class HVACReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'hvac-report.pdf',
      subject: 'HVAC Energy Calculation Report'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add calculation details section
    yPos = this.addSectionHeading('Calculation Details', yPos);
    
    const details = [
      { key: 'Floor Area', value: `${this.data.floorArea} m²` },
      { key: 'Cooling Load', value: `${this.data.coolingLoad} W/m²` },
      { key: 'System COP', value: this.data.cop.toString() },
      { key: 'Hours per Day', value: `${this.data.hoursPerDay} hours` },
      { key: 'Days per Year', value: `${this.data.daysPerYear} days` },
      { key: 'Electricity Rate', value: `₱${this.data.electricityRate}/kWh` }
    ];
    
    yPos = this.addKeyValueSection(details, yPos);
    
    // Add results section
    yPos = this.addSectionHeading('Energy Consumption Results', yPos);
    
    const results = [
      { key: 'Daily Energy Consumption', value: `${this.data.dailyConsumption.toFixed(2)} kWh/day` },
      { key: 'Annual Energy Consumption', value: `${this.data.annualConsumption.toFixed(2)} kWh/year` },
      { key: 'Annual Energy Cost', value: `₱${this.data.annualCost.toFixed(2)}/year` }
    ];
    
    yPos = this.addKeyValueSection(results, yPos);

    // Add energy consumption chart
    yPos = await this.addBarChart(
      ['Daily Consumption (kWh)', 'Annual Consumption (kWh/10)', 'Annual Cost (₱/100)'],
      [
        this.data.dailyConsumption,
        this.data.annualConsumption / 10, // Scale down to fit chart
        this.data.annualCost / 100 // Scale down to fit chart
      ],
      yPos,
      'Energy Consumption Summary',
      '#2196F3',
      { caption: 'Annual values are scaled for visualization purposes' }
    );
    
    // Add system efficiency analysis
    yPos = this.addSectionHeading('System Efficiency Analysis', yPos);
    
    // Calculate values for different COP scenarios
    const totalLoad = this.data.floorArea * this.data.coolingLoad;
    const scenarios = [
      { cop: 2.5, description: 'Low Efficiency' },
      { cop: 3.5, description: 'Average Efficiency' },
      { cop: 5.0, description: 'High Efficiency' }
    ];
    
    const scenarioData = scenarios.map(scenario => {
      const power = totalLoad / scenario.cop;
      const daily = (power * this.data.hoursPerDay) / 1000;
      const annual = daily * this.data.daysPerYear;
      const cost = annual * this.data.electricityRate;
      
      return [
        scenario.description,
        scenario.cop.toString(),
        daily.toFixed(2),
        annual.toFixed(2),
        cost.toFixed(2)
      ];
    });
    
    // Customize table options for better readability
    const tableOptions = {
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },  // System type column
        1: { halign: 'center' },   // COP - center align
        2: { halign: 'right' },    // Daily Energy - right align
        3: { halign: 'right' },    // Annual Energy - right align
        4: { halign: 'right' }     // Annual Cost - right align
      }
    };
    
    yPos = this.addTable(
      ['System Type', 'COP', 'Daily Energy (kWh)', 'Annual Energy (kWh)', 'Annual Cost (₱)'],
      scenarioData,
      yPos,
      tableOptions
    );

    // Add COP comparison chart
    const scenarioLabels = scenarios.map(s => s.description);
    const dailyConsumptionData = scenarios.map(s => totalLoad / s.cop * this.data.hoursPerDay / 1000);
    const annualCostData = scenarios.map(s => {
      const power = totalLoad / s.cop;
      const daily = (power * this.data.hoursPerDay) / 1000;
      const annual = daily * this.data.daysPerYear;
      return annual * this.data.electricityRate / 1000; // Scale down for visualization
    });
    
    yPos = await this.addBarChart(
      scenarioLabels,
      dailyConsumptionData,
      yPos,
      'Daily Energy Consumption by System Efficiency',
      '#2196F3'
    );
    
    yPos = await this.addBarChart(
      scenarioLabels,
      annualCostData,
      yPos,
      'Annual Cost by System Efficiency (₱/1000)',
      '#FF5722',
      { caption: 'Annual costs are divided by 1000 for visualization purposes' }
    );
    
    // Add energy saving recommendations
    yPos = this.addSectionHeading('Energy Saving Recommendations', yPos);
    
    yPos = this.addParagraph(
      `1. System Upgrade: Consider upgrading to a high-efficiency system with COP of 5.0 or higher for maximum energy savings.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `2. Regular Maintenance: Ensure regular cleaning of filters and coils to maintain system efficiency.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `3. Temperature Setpoints: Optimize temperature setpoints to 24-26°C for cooling to balance comfort and energy efficiency.`, 
      yPos
    );
    
    // Add reference notes
    yPos = this.addSectionHeading('Reference Notes', yPos);
    yPos = this.addParagraph(
      'Calculations are based on ASHRAE 90.1 methodology. For educational buildings in the Philippines, cooling loads typically range from 150-250 W/m².', 
      yPos
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Confidential', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }
}

// Equipment Calculator Report Generator
export class EquipmentReportGenerator extends PDFGenerator {
  private data: any[];
  private summaryData: any;
  private electricityRate: number;

  constructor(data: any[], summaryData: any, electricityRate: number, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'equipment-report.pdf',
      subject: 'Equipment Energy Calculation Report',
      orientation: 'landscape'
    });
    this.data = data;
    this.summaryData = summaryData;
    this.electricityRate = electricityRate;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add summary section
    yPos = this.addSectionHeading('Equipment Energy Summary', yPos);
    
    // Ensure summary data has expected properties
    const totalDailyConsumption = this.summaryData.totalDailyConsumption || this.summaryData.dailyTotal || 0;
    const totalAnnualConsumption = this.summaryData.totalAnnualConsumption || this.summaryData.annualTotal || 0;
    const totalAnnualCost = this.summaryData.totalAnnualCost || this.summaryData.costTotal || 0;
    
    const summary = [
      { key: 'Total Daily Energy Consumption', value: `${totalDailyConsumption.toFixed(2)} kWh/day` },
      { key: 'Total Annual Energy Consumption', value: `${totalAnnualConsumption.toFixed(2)} kWh/year` },
      { key: 'Total Annual Energy Cost', value: `₱${totalAnnualCost.toFixed(2)}/year` },
      { key: 'Number of Equipment Types', value: this.data.length.toString() },
      { key: 'Electricity Rate', value: `₱${this.electricityRate}/kWh` }
    ];
    
    yPos = this.addKeyValueSection(summary, yPos, 3);
    
    // Add equipment details table
    yPos = this.addSectionHeading('Equipment Details', yPos);
    
    // Create table headers
    const tableHeaders = ['Equipment', 'Quantity', 'Power (W)', 'Hours/Day', 'Daily (kWh)', 'Annual (kWh)', 'Annual Cost (₱)'];
    
    // Create table rows - handle both field name variations
    const tableData = this.data.map(item => [
      item.name || item.type,
      (item.quantity || 0).toString(),
      (item.wattage || item.power || 0).toString(),
      (item.hoursPerDay || item.hours || 0).toString(),
      (item.dailyConsumption || 0).toFixed(2),
      (item.annualConsumption || 0).toFixed(2),
      (item.annualCost || 0).toFixed(2)
    ]);
    
    // Customize table options for better readability
    const tableOptions = {
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Equipment name column
        1: { halign: 'center' },  // Quantity - center align
        2: { halign: 'center' },  // Power - center align
        3: { halign: 'center' },  // Hours - center align
        4: { halign: 'right' },   // Daily - right align
        5: { halign: 'right' },   // Annual - right align
        6: { halign: 'right' }    // Cost - right align
      }
    };
    
    yPos = this.addTable(tableHeaders, tableData, yPos, tableOptions);
    
    // Add energy distribution chart - Pie chart showing energy by equipment type
    yPos = this.addSectionHeading('Energy Distribution', yPos);
    
    // Prepare data for pie chart - show distribution by equipment type
    const equipmentLabels = this.data.map(item => item.name || item.type);
    const energyConsumption = this.data.map(item => item.annualConsumption || 0);
    
    yPos = await this.addPieChart(
      equipmentLabels,
      energyConsumption,
      yPos,
      'Annual Energy Consumption by Equipment Type (kWh/year)'
    );
    
    // Add cost distribution chart - Bar chart showing cost by equipment type
    const annualCosts = this.data.map(item => item.annualCost || 0);
    
    yPos = await this.addBarChart(
      equipmentLabels,
      annualCosts,
      yPos,
      'Annual Cost by Equipment Type (₱/year)',
      '#FF5722'
    );
    
    // Add energy saving recommendations
    yPos = this.addSectionHeading('Energy Saving Recommendations', yPos);
    
    yPos = this.addParagraph(
      `1. Equipment Scheduling: Set automatic power-off times for equipment during non-operational hours.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `2. Energy Star Equipment: Replace older equipment with Energy Star rated alternatives to reduce energy consumption.`, 
      yPos
    );
    
    yPos = this.addParagraph(
      `3. Power Management: Implement power management policies for computers and office equipment.`, 
      yPos
    );

    // Add estimated savings section
    yPos = this.addSectionHeading('Estimated Savings Potential', yPos);
    
    // Calculate potential savings with power management (assume 15% savings)
    const powerMgmtSavings = totalAnnualCost * 0.15;
    
    // Calculate potential savings with Energy Star equipment (assume 25% savings)
    const energyStarSavings = totalAnnualCost * 0.25;
    
    // Calculate potential savings with equipment scheduling (assume 10% savings)
    const schedulingSavings = totalAnnualCost * 0.10;
    
    // Add savings comparison chart
    const savingsLabels = ['Power Management', 'Energy Star Equipment', 'Equipment Scheduling'];
    const savingsData = [powerMgmtSavings, energyStarSavings, schedulingSavings];
    
    yPos = await this.addBarChart(
      savingsLabels,
      savingsData,
      yPos,
      'Potential Annual Savings (₱/year)',
      '#4CAF50'
    );
    
    // Add reference notes
    yPos = this.addSectionHeading('Reference Notes', yPos);
    yPos = this.addParagraph(
      'Equipment power ratings should be verified from nameplate data or manufacturer specifications. For educational energy audits, consider diversity and utilization factors.', 
      yPos
    );
    
    // Add reference to standard - new information about IEEE 739
    yPos = this.addParagraph(
      'The IEEE 739 (Bronze Book) provides recommendations for energy-efficient equipment selection and operation in educational facilities.', 
      yPos
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Confidential', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }
}

// Power Factor Calculator Report Generator
export class PowerFactorReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'power-factor-report.pdf',
      subject: 'Power Factor Analysis Report'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add calculation details section
    yPos = this.addSectionHeading('Measurement Details', yPos);
    
    const details = [
      { key: 'Voltage', value: `${this.data.voltage} V` },
      { key: 'Current', value: `${this.data.current} A` },
      { key: 'Active Power', value: `${this.data.activePower} W` },
      { key: 'Connection Type', value: this.data.connectionType === 'single-phase' ? 'Single-Phase' : 'Three-Phase' },
      { key: 'Target Power Factor', value: this.data.targetPowerFactor }
    ];
    
    yPos = this.addKeyValueSection(details, yPos);
    
    // Add results section
    yPos = this.addSectionHeading('Power Factor Analysis', yPos);
    
    const results = [
      { key: 'Apparent Power', value: `${this.data.apparentPower.toFixed(2)} VA` },
      { key: 'Reactive Power', value: `${this.data.reactivePower.toFixed(2)} VAR` },
      { key: 'Current Power Factor', value: this.data.calculatedPowerFactor.toFixed(3) },
      { key: 'Required Capacitance', value: `${this.data.requiredCapacitance.toFixed(2)} μF` },
      { key: 'Compliance Status', value: this.data.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant' }
    ];
    
    yPos = this.addKeyValueSection(results, yPos);

    // Add power triangle visualization
    yPos = this.addSectionHeading('Power Triangle Visualization', yPos);
    
    // Calculate power triangle values
    const activePower = parseFloat(this.data.activePower);
    const reactivePower = this.data.reactivePower;
    const apparentPower = this.data.apparentPower;
    const currentPF = this.data.calculatedPowerFactor;
    const targetPF = parseFloat(this.data.targetPowerFactor);
    
    // Calculate new reactive power after correction
    const newReactivePower = activePower * Math.tan(Math.acos(targetPF));
    const capacitanceReduction = reactivePower - newReactivePower;
    
    // Create data for the power factor comparison chart
    const pfChartLabels = ['Current', 'Target'];
    const pfChartData = [currentPF, targetPF];
    
    yPos = await this.addBarChart(
      pfChartLabels,
      pfChartData,
      yPos,
      'Power Factor Comparison',
      '#3F51B5'
    );
    
    // Create data for the power components chart
    const powerLabels = ['Active Power (W)', 'Reactive Power (VAR)', 'Apparent Power (VA)'];
    const currentPowerData = [activePower / 1000, reactivePower / 1000, apparentPower / 1000];
    const targetPowerData = [activePower / 1000, newReactivePower / 1000, activePower / targetPF / 1000];
    
    yPos = await this.addComparisonChart(
      powerLabels,
      currentPowerData,
      targetPowerData,
      yPos,
      'Power Components Before/After Correction (kVA)',
      { caption: 'Values shown in kilovolt-amperes (kVA) for better visualization' }
    );
    
    // Add financial analysis
    yPos = this.addSectionHeading('Financial Analysis', yPos);
    
    const financial = [
      { key: 'Annual Savings', value: `₱${this.data.annualSavings.toFixed(2)}/year` },
      { key: 'Estimated Payback Period', value: `${this.data.paybackPeriod.toFixed(1)} months` }
    ];
    
    yPos = this.addKeyValueSection(financial, yPos, 2);
    
    // Add ROI visualization
    const yearsToShow = 5;
    const yearLabels = Array.from({length: yearsToShow}, (_, i) => `Year ${i+1}`);
    const cumulativeSavings = Array.from({length: yearsToShow}, (_, i) => this.data.annualSavings * (i+1));
    
    yPos = await this.addBarChart(
      yearLabels,
      cumulativeSavings,
      yPos,
      'Cumulative Savings Over 5 Years',
      '#4CAF50'
    );
    
    // Add recommendations
    yPos = this.addSectionHeading('Recommendations', yPos);
    
    if (this.data.recommendations && this.data.recommendations.length > 0) {
      this.data.recommendations.forEach((recommendation: string, index: number) => {
        yPos = this.addParagraph(`${index + 1}. ${recommendation}`, yPos);
      });
    } else {
      yPos = this.addParagraph('No specific recommendations available.', yPos);
    }
    
    // Add reference notes
    yPos = this.addSectionHeading('Reference Notes', yPos);
    yPos = this.addParagraph(
      'Calculations are based on PEC 2017 Section 4.30 requirements for power factor correction. ' +
      'The minimum power factor for most installations should be 0.85 lagging or higher according to utility standards.',
      yPos
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Confidential', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }
}

// Harmonic Distortion Calculator Report Generator
export class HarmonicDistortionReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'harmonic-distortion-report.pdf',
      subject: 'Harmonic Distortion Analysis Report',
      orientation: 'landscape'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add calculation details section
    yPos = this.addSectionHeading('System Details', yPos);
    
    const details = [
      { key: 'System Voltage', value: `${this.data.systemVoltage} V` },
      { key: 'Fundamental Voltage', value: `${this.data.fundamentalVoltage} V` },
      { key: 'Fundamental Current', value: `${this.data.fundamentalCurrent} A` },
      { key: 'Short Circuit Ratio', value: this.data.shortCircuitRatio.toString() },
      { key: 'System Type', value: this.data.systemType === 'general' ? 'General Distribution System' : 'Special Applications' }
    ];
    
    yPos = this.addKeyValueSection(details, yPos, 3);
    
    // Add summary results section
    yPos = this.addSectionHeading('Harmonic Distortion Summary', yPos);
    
    const results = [
      { key: 'Total Harmonic Distortion (Voltage)', value: `${this.data.thdVoltage.toFixed(2)}%` },
      { key: 'Total Harmonic Distortion (Current)', value: `${this.data.thdCurrent.toFixed(2)}%` },
      { key: 'Overall Compliance Status', value: this.data.overallCompliance === 'compliant' ? 'Compliant with IEEE 519-2014' : 'Non-Compliant with IEEE 519-2014' }
    ];
    
    yPos = this.addKeyValueSection(results, yPos, 1);

    // Add THD visualization
    const thdLabels = ['Voltage THD', 'Current THD'];
    const thdValues = [this.data.thdVoltage, this.data.thdCurrent];
    const thdLimits = [5.0, 8.0]; // Example limits, should be based on actual system
    
    yPos = await this.addBarChart(
      thdLabels,
      thdValues,
      yPos,
      'Total Harmonic Distortion (%)',
      '#FF5722'
    );
    
    // Add comparison chart of THD vs Limits
    yPos = await this.addComparisonChart(
      thdLabels,
      thdValues,
      thdLimits,
      yPos,
      'Harmonic Distortion vs IEEE Limits',
      { caption: 'Values in % of fundamental component' }
    );
    
    // Add harmonic components table
    yPos = this.addSectionHeading('Individual Harmonic Analysis', yPos);
    
    const tableData = this.data.individualHarmonics.map((harmonic: any) => [
      harmonic.order.toString(),
      `${harmonic.voltageDistortion.toFixed(2)}%`,
      `${harmonic.voltageLimit.toFixed(2)}%`,
      harmonic.voltageCompliance === 'compliant' ? 'Compliant' : 'Non-Compliant',
      `${harmonic.currentDistortion.toFixed(2)}%`,
      `${harmonic.currentLimit.toFixed(2)}%`,
      harmonic.currentCompliance === 'compliant' ? 'Compliant' : 'Non-Compliant'
    ]);
    
    yPos = this.addTable(
      ['Harmonic Order', 'Voltage THD', 'Voltage Limit', 'Voltage Status', 'Current THD', 'Current Limit', 'Current Status'],
      tableData,
      yPos
    );
    
    // Add harmonic spectrum visualization
    yPos = this.addSectionHeading('Harmonic Spectrum', yPos);
    
    // Prepare data for harmonic spectrum chart
    const harmonicOrders = this.data.individualHarmonics.map((h: any) => `H${h.order}`);
    const voltageDistortion = this.data.individualHarmonics.map((h: any) => h.voltageDistortion);
    const currentDistortion = this.data.individualHarmonics.map((h: any) => h.currentDistortion);
    
    // Prepare datasets for line chart
    const harmonicDatasets = [
      { data: voltageDistortion, label: 'Voltage Distortion (%)', color: '#3F51B5' },
      { data: currentDistortion, label: 'Current Distortion (%)', color: '#FF5722' }
    ];
    
    yPos = await this.addLineChart(
      harmonicOrders,
      harmonicDatasets,
      yPos,
      'Harmonic Spectrum Analysis'
    );
    
    // Add recommendations
    yPos = this.addSectionHeading('Recommendations', yPos);
    
    if (this.data.recommendations && this.data.recommendations.length > 0) {
      this.data.recommendations.forEach((recommendation: string, index: number) => {
        yPos = this.addParagraph(`${index + 1}. ${recommendation}`, yPos);
      });
    } else {
      yPos = this.addParagraph('No specific recommendations available.', yPos);
    }
    
    // Add reference notes
    yPos = this.addSectionHeading('Reference Notes', yPos);
    yPos = this.addParagraph(
      'Calculations are based on IEEE 519-2014 standards for harmonic control in electrical power systems. ' +
      'Voltage distortion limits depend on the system voltage level, while current distortion limits depend on the ratio of short circuit current to load current.',
      yPos
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Confidential', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }
}

// Schedule of Loads Report Generator
export class ScheduleOfLoadsReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'schedule-of-loads-report.pdf',
      subject: 'Schedule of Loads Calculation Report',
      orientation: 'landscape'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add unified font size setting at the beginning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Add title page
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Schedule of Loads Report', this.pageWidth / 2, 60, { align: 'center' });
    
    // Add report date
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, 75, { align: 'center' });
    
    // Add panel name
    this.doc.setFontSize(18);
    this.doc.text(`Panel: ${this.data.panelName || 'Main Panel'}`, this.pageWidth / 2, 100, { align: 'center' });
    
    // Add location info if available
    if (this.data.floorName || this.data.roomId) {
      this.doc.setFontSize(14);
      const locationText = `Location: ${this.data.floorName || ''} ${this.data.roomId ? `, ${this.data.roomId}` : ''}`;
      this.doc.text(locationText, this.pageWidth / 2, 115, { align: 'center' });
    }
    
    // Add panel summary in a box
    this.doc.setDrawColor(70, 130, 180); // Steel blue
    this.doc.setFillColor(240, 248, 255); // Alice blue
    
    const boxWidth = 250;
    const boxHeight = 70;
    const boxX = (this.pageWidth - boxWidth) / 2;
    const boxY = 130;
    
    this.doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Total Connected Load: ${this.data.totalConnectedLoad.toFixed(0)} W (${(this.data.totalConnectedLoad/1000).toFixed(2)} kW)`, boxX + 20, boxY + 20);
    this.doc.text(`Total Demand Load: ${this.data.totalDemandLoad.toFixed(0)} W (${(this.data.totalDemandLoad/1000).toFixed(2)} kW)`, boxX + 20, boxY + 35);
    this.doc.text(`Main Circuit Breaker: ${this.data.circuitBreaker || 'Not specified'}`, boxX + 20, boxY + 50);
    
    // Add PEC compliance note
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('This Schedule of Loads complies with Philippine Electrical Code (PEC) 2017 requirements.', 
      this.pageWidth / 2, this.pageHeight - 30, { align: 'center' });
    
    // Add page break after title page
    this.addPageBreak();
    yPos = 35;
    
    // Reset text properties
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // Add title and panel information
    yPos = this.addSectionHeading('Schedule of Loads - ' + this.data.name, yPos);
    
    const panelDetails = [
      { key: 'Panel Name', value: this.data.panelName },
      { key: 'Location', value: `${this.data.floorName || '-'} ${this.data.roomId ? `, ${this.data.roomId}` : ''}` },
      { key: 'Voltage', value: `${this.data.voltage} V` },
      { key: 'Power Factor', value: this.data.powerFactor.toFixed(2) },
      { key: 'Total Connected Load', value: `${this.data.totalConnectedLoad.toFixed(0)} W (${(this.data.totalConnectedLoad/1000).toFixed(2)} kW)` },
      { key: 'Total Demand Load', value: `${this.data.totalDemandLoad.toFixed(0)} W (${(this.data.totalDemandLoad/1000).toFixed(2)} kW)` },
      { key: 'Main Circuit Breaker', value: this.data.circuitBreaker || 'Not specified' },
      { key: 'Main Conductor Size', value: this.data.conductorSize || 'Not specified' }
    ];
    
    yPos = this.addKeyValueSection(panelDetails, yPos, 3);
    
    // Add load items table
    yPos = this.addSectionHeading('Load Items', yPos);
    
    const tableHeaders = [
      'Description',
      'Qty',
      'Rating (W)',
      'D.F.',
      'Connected (W)',
      'Demand (W)',
      'Current (A)',
      'VA',
      'Circuit Breaker',
      'Conductor'
    ];
    
    const tableData = this.data.loads.map((item: any) => [
      item.description,
      item.quantity.toString(),
      item.rating.toString(),
      item.demandFactor.toFixed(2),
      item.connectedLoad.toFixed(0),
      item.demandLoad.toFixed(0),
      item.current ? item.current.toFixed(2) : '-',
      item.voltAmpere ? item.voltAmpere.toFixed(0) : '-',
      item.circuitBreaker || '-',
      item.conductorSize || '-'
    ]);
    
    // Add total row
    tableData.push([
      'TOTAL',
      '',
      '',
      '',
      this.data.totalConnectedLoad.toFixed(0),
      this.data.totalDemandLoad.toFixed(0),
      this.data.current ? this.data.current.toFixed(2) : '-',
      this.data.totalDemandLoad && this.data.powerFactor ? 
        (this.data.totalDemandLoad / this.data.powerFactor).toFixed(0) : '-',
      this.data.circuitBreaker || '-',
      this.data.conductorSize || '-'
    ]);
    
    // Customize table options for better readability
    const tableOptions = {
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },  // Description
        1: { halign: 'center' },   // Qty
        2: { halign: 'center' },   // Rating
        3: { halign: 'center' },   // D.F.
        4: { halign: 'right' },    // Connected
        5: { halign: 'right' },    // Demand
        6: { halign: 'right' },    // Current
        7: { halign: 'right' },    // VA
      }
    };
    
    yPos = this.addTable(tableHeaders, tableData, yPos, tableOptions);
    
    // Add chart showing connected vs demand load for top items
    yPos = this.addSectionHeading('Load Distribution', yPos);
    
    // Prepare top 5 loads (or fewer if there are less items)
    const sortedLoads = [...this.data.loads].sort((a, b) => b.connectedLoad - a.connectedLoad);
    const topLoads = sortedLoads.slice(0, Math.min(5, sortedLoads.length));
    
    // Prepare data for chart
    const loadLabels = topLoads.map((item: any) => item.description);
    const connectedValues = topLoads.map((item: any) => item.connectedLoad / 1000); // Convert to kW
    const demandValues = topLoads.map((item: any) => item.demandLoad / 1000); // Convert to kW
    
    // Add a comparison chart showing connected vs demand load
    if (loadLabels.length > 0) {
      yPos = await this.addComparisonChart(
        loadLabels,
        connectedValues,
        demandValues,
        yPos,
        'Connected vs Demand Load (kW) - Top Loads',
        { 
          height: 160,
          caption: 'The difference between connected and demand load shows the effect of demand factors.'
        }
      );
    }
    
    // If we have energy consumption data
    if (this.data.energyConsumption) {
      yPos = this.addSectionHeading('Energy Consumption Estimate', yPos);
      
      const energyDetails = [
        { key: 'Daily Operating Hours', value: `${this.data.energyConsumption.dailyOperatingHours} hours` },
        { key: 'Monthly Consumption', value: `${this.data.energyConsumption.monthlyEnergyConsumption.toFixed(2)} kWh` },
        { key: 'Annual Consumption', value: `${this.data.energyConsumption.annualEnergyConsumption.toFixed(2)} kWh` },
        { key: 'Monthly Cost', value: `PHP ${this.data.energyConsumption.monthlyCost.toFixed(2)}` },
        { key: 'Annual Cost', value: `PHP ${this.data.energyConsumption.annualCost.toFixed(2)}` },
        { key: 'Electricity Rate', value: `PHP ${this.data.energyConsumption.electricityRate.toFixed(2)}/kWh` }
      ];
      
      yPos = this.addKeyValueSection(energyDetails, yPos, 3);
      
      // Add cost projection chart if we have at least 2 items
      if (this.data.loads.length >= 2) {
        // Create data for energy consumption pie chart
        const consumptionLabels = this.data.loads.map((item: any) => item.description);
        const consumptionData = this.data.loads.map((item: any) => {
          // Calculate kWh for each load item based on its demand load
          const hourlyConsumption = item.demandLoad / 1000; // kW
          const dailyConsumption = hourlyConsumption * this.data.energyConsumption.dailyOperatingHours;
          const monthlyConsumption = dailyConsumption * 30; // Approximate
          return monthlyConsumption;
        });
        
        yPos = await this.addPieChart(
          consumptionLabels,
          consumptionData,
          yPos,
          'Monthly Energy Consumption Distribution (kWh)',
          undefined,
          { height: 180 }
        );
      }
    }
    
    // Add a page break before technical details
    this.addPageBreak();
    yPos = 35;
    
    // Add sizing calculations section
    yPos = this.addSectionHeading('Technical Calculations', yPos);
    
    // Add explanation of calculations
    yPos = this.addParagraph(
      'The following technical calculations are based on the Philippine Electrical Code (PEC) 2017 and standard electrical engineering practices:',
      yPos
    );
    
    // Current calculation explanation
    yPos = this.addParagraph(
      `• Current Calculation (Single Phase): I = P / (V × PF) = ${this.data.totalDemandLoad.toFixed(0)} W / (${this.data.voltage} V × ${this.data.powerFactor.toFixed(2)}) = ${this.data.current ? this.data.current.toFixed(2) : '-'} A`,
      yPos + 5
    );
    
    // Circuit breaker sizing
    yPos = this.addParagraph(
      `• Circuit Breaker Sizing: Circuit breakers are sized based on the calculated current with appropriate safety factors according to PEC Article 2.40.`,
      yPos + 5
    );
    
    // Conductor sizing
    yPos = this.addParagraph(
      `• Conductor Sizing: Conductors are sized based on ampacity requirements per PEC Tables 2.2 to 2.6, with consideration for voltage drop and ambient temperature.`,
      yPos + 5
    );
    
    // Add notes
    yPos = this.addSectionHeading('Notes', yPos + 10);
    yPos = this.addParagraph('1. D.F. = Demand Factor', yPos);
    yPos = this.addParagraph(`2. Power factor used for calculations: ${this.data.powerFactor.toFixed(2)}`, yPos + 5);
    yPos = this.addParagraph(`3. Voltage: ${this.data.voltage} V (${this.data.voltage > 200 ? 'Three' : 'Single'}-Phase)`, yPos + 5);
    yPos = this.addParagraph(`4. All calculations comply with PEC 2017 requirements for electrical installations.`, yPos + 5);
    
    // Add reference to standards
    yPos = this.addSectionHeading('Reference Standards', yPos + 10);
    yPos = this.addParagraph(
      'This Schedule of Loads is prepared in accordance with Philippine Electrical Code (PEC) 2017 Section 2.4 requirements. ' +
      'Load calculations comply with standard electrical engineering practices for power distribution systems.',
      yPos
    );
    
    // Add specific code references
    yPos = this.addParagraph(
      '• PEC 2017 Article 2.10 - Calculations',
      yPos + 10
    );
    
    yPos = this.addParagraph(
      '• PEC 2017 Article 2.40 - Overcurrent Protection',
      yPos + 5
    );
    
    yPos = this.addParagraph(
      '• PEC 2017 Article 2.50 - Grounding',
      yPos + 5
    );
    
    // Add footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Energy Audit Platform | Schedule of Loads Report', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    this.doc.text(`Page ${this.doc.getNumberOfPages()}`, this.pageWidth - 20, this.pageHeight - 10);
  }
}

// Illumination Calculator Report Generator
export class IlluminationReportGenerator extends PDFGenerator {
  private data: any;

  constructor(data: any, options: PDFGeneratorOptions) {
    super({
      ...options,
      fileName: options.fileName || 'illumination-report.pdf',
      subject: 'Illumination Calculation Report'
    });
    this.data = data;
  }

  // Generate the report content
  public async generate(): Promise<void> {
    let yPos = 35;

    // Add a title page
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Illumination Calculation Report', this.pageWidth / 2, 60, { align: 'center' });
    
    // Add report date
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, 70, { align: 'center' });
    
    // Add room type and dimensions below the title
    this.doc.setFontSize(16);
    this.doc.text(`${this.data.roomType}`, this.pageWidth / 2, 90, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.text(`Room Dimensions: ${this.data.roomLength}m × ${this.data.roomWidth}m × ${this.data.roomHeight}m`, this.pageWidth / 2, 100, { align: 'center' });
    
    // Add compliance status to title page
    this.doc.setFontSize(16);
    this.doc.setTextColor(
      this.data.complianceStatus === 'compliant' ? 0 : 180,
      this.data.complianceStatus === 'compliant' ? 100 : 0, 
      this.data.complianceStatus === 'compliant' ? 0 : 0
    );
    
    const complianceText = this.data.complianceStatus === 'compliant' 
      ? 'COMPLIANT with PEC Rule 1075' 
      : 'NON-COMPLIANT with PEC Rule 1075';
      
    // Draw a rectangle around compliance status
    this.doc.setDrawColor(
      this.data.complianceStatus === 'compliant' ? 0 : 180,
      this.data.complianceStatus === 'compliant' ? 100 : 0, 
      this.data.complianceStatus === 'compliant' ? 0 : 0
    );
    this.doc.setFillColor(
      this.data.complianceStatus === 'compliant' ? 230 : 255,
      this.data.complianceStatus === 'compliant' ? 250 : 240, 
      this.data.complianceStatus === 'compliant' ? 230 : 240
    );
    
    const textWidth = this.doc.getTextWidth(complianceText) + 20;
    const rectX = (this.pageWidth - textWidth) / 2;
    this.doc.roundedRect(rectX, 118, textWidth, 16, 3, 3, 'FD');
    this.doc.text(complianceText, this.pageWidth / 2, 128, { align: 'center' });
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
    
    // Add a page break after the title page
    this.addPageBreak();
    yPos = 35;

    // Add unified font size setting for subsequent pages
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    // Add calculation details section
    yPos = this.addSectionHeading('Room Specifications', yPos);
    
    // Create key-value pairs for room details
    const roomDetails = [
      { key: 'Room Type', value: this.data.roomType },
      { key: 'Room Dimensions', value: `${this.data.roomLength}m × ${this.data.roomWidth}m × ${this.data.roomHeight}m` },
      { key: 'Room Area', value: `${(parseFloat(this.data.roomLength) * parseFloat(this.data.roomWidth)).toFixed(2)} m²` },
      { key: 'Work Plane Height', value: `${this.data.workPlaneHeight} m` },
      { key: 'Ceiling Reflectance', value: `${(parseFloat(this.data.ceilingReflectance) * 100).toFixed(0)}%` },
      { key: 'Wall Reflectance', value: `${(parseFloat(this.data.wallReflectance) * 100).toFixed(0)}%` },
      { key: 'Floor Reflectance', value: `${(parseFloat(this.data.floorReflectance) * 100).toFixed(0)}%` },
      { key: 'Maintenance Factor', value: this.data.maintenanceFactor },
    ];
    
    yPos = this.addKeyValueSection(roomDetails, yPos);
    
    // Add room visualization with dimensions
    yPos += 5;
    this.doc.setDrawColor(100, 100, 100);
    this.doc.setFillColor(240, 240, 240);
    
    // Calculate scaled room dimensions for visualization (keeping aspect ratio)
    const roomVisWidth = 120; // max width in pts
    const roomVisHeight = (parseFloat(this.data.roomWidth) / parseFloat(this.data.roomLength)) * roomVisWidth;
    
    // Center the visualization
    const startX = (this.pageWidth - roomVisWidth) / 2;
    
    // Draw the room
    this.doc.rect(startX, yPos, roomVisWidth, roomVisHeight, 'FD');
    
    // Add room dimensions as text
    this.doc.setFontSize(8);
    this.doc.text(`${this.data.roomLength}m`, startX + roomVisWidth/2, yPos + roomVisHeight + 5, { align: 'center' });
    this.doc.text(`${this.data.roomWidth}m`, startX - 5, yPos + roomVisHeight/2, { align: 'right' });
    
    // Draw work plane height line on the left side
    this.doc.setDrawColor(255, 0, 0);
    this.doc.setLineDashPattern([1, 1], 0);
    const workHeight = (parseFloat(this.data.workPlaneHeight) / parseFloat(this.data.roomHeight)) * roomVisHeight;
    this.doc.line(startX - 10, yPos + roomVisHeight - workHeight, startX, yPos + roomVisHeight - workHeight);
    this.doc.text(`Work Plane\n${this.data.workPlaneHeight}m`, startX - 12, yPos + roomVisHeight - workHeight, { align: 'right' });
    this.doc.setLineDashPattern([], 0);
    
    // Draw simulated luminaires in a grid
    const numRows = Math.ceil(Math.sqrt(this.data.requiredLuminaires));
    const numCols = Math.ceil(this.data.requiredLuminaires / numRows);
    const spacingX = roomVisWidth / (numCols + 1);
    const spacingY = roomVisHeight / (numRows + 1);
    
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setFillColor(255, 215, 0); // Gold color for luminaires
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const count = row * numCols + col;
        if (count < Math.ceil(this.data.requiredLuminaires)) {
          const centerX = startX + (col + 1) * spacingX;
          const centerY = yPos + (row + 1) * spacingY;
          this.doc.circle(centerX, centerY, 3, 'FD');
        }
      }
    }
    
    // Add legend
    this.doc.setFillColor(255, 215, 0);
    this.doc.circle(startX + roomVisWidth + 10, yPos + 8, 3, 'FD');
    this.doc.setFontSize(8);
    this.doc.text('Luminaire', startX + roomVisWidth + 15, yPos + 8);
    
    yPos += roomVisHeight + 15;
    
    // Add fixture details
    yPos = this.addSectionHeading('Lighting Fixture Specifications', yPos);
    
    const fixtureDetails = [
      { key: 'Luminaire Type', value: this.data.luminaireType },
      { key: 'Lamp Lumens', value: `${this.data.lampLumens} lumens` },
      { key: 'Lamps per Luminaire', value: this.data.lampsPerLuminaire },
      { key: 'Total Lumens per Luminaire', value: `${(parseFloat(this.data.lampLumens) * parseFloat(this.data.lampsPerLuminaire)).toFixed(0)} lumens` },
    ];
    
    yPos = this.addKeyValueSection(fixtureDetails, yPos);
    
    // Add calculation results section
    yPos = this.addSectionHeading('Calculation Results', yPos);
    
    const calculationResults = [
      { key: 'Required Illuminance', value: `${this.data.requiredIlluminance} lux` },
      { key: 'Room Index (K)', value: this.data.roomIndex.toFixed(2) },
      { key: 'Utilization Factor', value: this.data.utilizationFactor.toFixed(2) },
      { key: 'Total Lumens Required', value: `${this.data.totalLumens.toFixed(0)} lumens` },
      { key: 'Required Luminaires', value: `${Math.ceil(this.data.requiredLuminaires)}` },
      { key: 'Actual Illuminance', value: `${this.data.actualIlluminance.toFixed(0)} lux` },
      { key: 'Uniformity Ratio', value: this.data.uniformityRatio.toFixed(2) },
      { key: 'Compliance Status', value: this.data.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant' },
      { key: 'Energy Efficiency', value: this.data.energyEfficiency.charAt(0).toUpperCase() + this.data.energyEfficiency.slice(1) }
    ];
    
    yPos = this.addKeyValueSection(calculationResults, yPos);
    
    // Add illuminance comparison chart with enhanced visualization
    yPos = this.addSectionHeading('Illuminance Analysis', yPos);
    
    // Prepare data for comparison chart
    const illuminanceLabels = ['Required', 'Actual'];
    const illuminanceValues = [
      this.data.requiredIlluminance, 
      this.data.actualIlluminance
    ];
    
    // Use the ChartGenerator class to generate a better quality chart
    const chartConfig = {
      type: 'bar' as const,
      data: {
        labels: illuminanceLabels,
        datasets: [{
          label: 'Illuminance (lux)',
          data: illuminanceValues,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            this.data.actualIlluminance >= this.data.requiredIlluminance 
              ? 'rgba(75, 192, 92, 0.7)'
              : 'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            this.data.actualIlluminance >= this.data.requiredIlluminance 
              ? 'rgba(75, 192, 92, 1)'
              : 'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              display: true
            },
            ticks: {
              precision: 0
            },
            title: {
              display: true,
              text: 'Illuminance (lux)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Required vs. Actual Illuminance',
            font: {
              size: 16
            }
          }
        }
      }
    };
    
    // Import ChartGenerator
    const { ChartGenerator } = await import('./chartGenerator');
    const chartDataUrl = await ChartGenerator.generateChartForPDF(chartConfig, 'default', 500, 250);
    
    yPos = await this.addChart(chartDataUrl, yPos, { 
      width: 160, 
      height: 120,
      caption: 'Comparison of required and achieved illumination levels'
    });
    
    // Add a page break before recommendations
    this.addPageBreak();
    yPos = 35;
    
    // Add recommendations section
    yPos = this.addSectionHeading('Recommendations', yPos);
    
    if (this.data.recommendations && this.data.recommendations.length > 0) {
      this.doc.setFontSize(10);
      for (let i = 0; i < this.data.recommendations.length; i++) {
        this.doc.text(`${i + 1}. ${this.data.recommendations[i]}`, 20, yPos);
        yPos += 10;
      }
    } else {
      this.doc.text('No specific recommendations.', 20, yPos);
      yPos += 10;
    }
    
    // Add energy efficiency analysis visualization
    yPos = this.addSectionHeading('Energy Efficiency Analysis', yPos + 5);
    
    // Create different lighting efficiency datasets for comparison
    const lightingTypes = ['Incandescent', 'Halogen', 'Fluorescent', 'LED'];
    const efficiencies = [15, 25, 60, 100]; // Lumens per watt, approximate values
    
    // Show relative efficacy compared to current selection
    const selectedType = this.data.luminaireType.toLowerCase();
    let currentEfficacy = 80; // Default efficacy
    
    if (selectedType.includes('led')) {
      currentEfficacy = 100;
    } else if (selectedType.includes('fluorescent')) {
      currentEfficacy = 60;
    } else if (selectedType.includes('halogen')) {
      currentEfficacy = 25;
    } else if (selectedType.includes('incandescent')) {
      currentEfficacy = 15;
    }
    
    // Create enhanced efficacy chart with better grid lines and scaling
    const efficacyChartConfig = {
      type: 'bar' as const,
      data: {
        labels: lightingTypes,
        datasets: [{
          label: 'Efficacy (lm/W)',
          data: efficiencies,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 92, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 92, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              display: true
            },
            title: {
              display: true,
              text: 'Efficacy (lumens/watt)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Lighting Technology Efficacy Comparison',
            font: {
              size: 16
            }
          }
        }
      }
    };
    
    const efficacyChartUrl = await ChartGenerator.generateChartForPDF(efficacyChartConfig, 'default', 500, 250);
    
    yPos = await this.addChart(efficacyChartUrl, yPos, { 
      width: 160, 
      height: 120,
      caption: 'Comparison of efficacy across different lighting technologies'
    });
    
    // Add energy analysis text
    yPos += 5;
    if (currentEfficacy < 100) {
      const text = [
        `The currently selected ${this.data.luminaireType} has an approximate efficacy of ${currentEfficacy} lumens/watt.`,
        `Upgrading to high-efficiency LED luminaires (100 lumens/watt) could reduce energy consumption by approximately`,
        `${(((100 - currentEfficacy) / currentEfficacy) * 100).toFixed(0)}%, resulting in significant energy cost savings over time.`
      ].join(' ');
      
      yPos = this.addParagraph(text, yPos);
    } else {
      yPos = this.addParagraph(
        `The selected LED luminaires have excellent energy efficiency. Continue with the current specification to maximize energy savings.`,
        yPos
      );
    }
    
    yPos += 5;
    
    // Add note about PEC Rule 1075
    yPos = this.addSectionHeading('Standards Reference', yPos + 5);
    
    const standardsText = [
      "This calculation is based on the illumination requirements specified in Philippine Electrical Code (PEC) Rule 1075.",
      "The results provide guidance for compliance with electrical safety and energy efficiency standards.",
      "The calculation methodology uses the lumen method which is widely accepted for general lighting design purposes."
    ].join(" ");
    
    yPos = this.addParagraph(standardsText, yPos);
    
    // Add a footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Illumination Calculator | Energy Audit Platform', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth - 15, this.pageHeight - 10, { align: 'right' });
  }
}

// Main export function for choosing the right report generator
export const generateReport = async (type: string, data: any, options: PDFGeneratorOptions) => {
  let generator: PDFGenerator;
  
  switch (type) {
    case 'lighting':
      generator = new LightingReportGenerator(data, options);
      break;
    case 'hvac':
      generator = new HVACReportGenerator(data, options);
      break;
    case 'equipment':
      generator = new EquipmentReportGenerator(data.equipmentList, data.summary, data.electricityRate, options);
      break;
    case 'power-factor':
      generator = new PowerFactorReportGenerator(data, options);
      break;
    case 'harmonic-distortion':
      generator = new HarmonicDistortionReportGenerator(data, options);
      break;
    case 'schedule-of-loads':
      generator = new ScheduleOfLoadsReportGenerator(data, options);
      break;
    case 'illumination':
      generator = new IlluminationReportGenerator(data, options);
      break;
    default:
      throw new Error(`Report type ${type} not supported`);
  }
  
  // Now calling generate as an async method
  await generator.generate();
  
  return generator;
}; 