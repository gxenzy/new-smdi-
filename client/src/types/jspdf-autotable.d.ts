/**
 * Type definitions for jspdf-autotable
 */

declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';

  interface AutoTableStyles {
    cellPadding?: number;
    fontSize?: number;
    font?: string;
    lineColor?: number | number[];
    lineWidth?: number;
    cellWidth?: number;
    fontStyle?: string;
    fillColor?: number | number[];
    textColor?: number | number[];
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    fillStyle?: 'F' | 'S' | 'DF';
    minCellHeight?: number;
    minCellWidth?: number;
  }

  interface AutoTableColumnStyles {
    [key: string]: AutoTableStyles;
  }

  interface AutoTableColumn {
    title?: string;
    dataKey?: string | number;
    header?: string;
    footer?: string;
    width?: number;
    style?: AutoTableStyles;
  }

  interface AutoTableSettings {
    theme?: 'striped' | 'grid' | 'plain';
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid' | 'always';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineWidth?: number;
    tableLineColor?: number | number[];
    styles?: AutoTableStyles;
    columnStyles?: AutoTableColumnStyles;
    head?: Array<Array<string | number>>;
    body?: Array<Array<string | number>>;
    foot?: Array<Array<string | number>>;
    headStyles?: AutoTableStyles;
    bodyStyles?: AutoTableStyles;
    footStyles?: AutoTableStyles;
    html?: string | HTMLTableElement;
    didParseCell?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
    columns?: AutoTableColumn[];
    willDrawCell?: (data: any) => void;
  }

  interface JsPDFWithAutoTable extends jsPDF {
    autoTable: (options: AutoTableSettings) => jsPDF;
    lastAutoTable?: { finalY: number };
  }

  function autoTable(options: AutoTableSettings): jsPDF;

  export default autoTable;
} 