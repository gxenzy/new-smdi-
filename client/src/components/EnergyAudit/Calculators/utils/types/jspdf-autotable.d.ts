/**
 * Type declarations for jspdf-autotable
 * This allows TypeScript to properly understand the autotable plugin for jsPDF
 */

import jsPDF from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

interface AutoTableOptions {
  startY?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  head?: any[][];
  body: any[][];
  foot?: any[][];
  headStyles?: Partial<AutoTableStyles>;
  bodyStyles?: Partial<AutoTableStyles>;
  footStyles?: Partial<AutoTableStyles>;
  alternateRowStyles?: Partial<AutoTableStyles>;
  columnStyles?: { [key: string]: Partial<AutoTableStyles> };
  theme?: 'striped' | 'grid' | 'plain';
  tableWidth?: 'auto' | 'wrap' | number;
  showHead?: 'everyPage' | 'firstPage' | 'never';
  showFoot?: 'everyPage' | 'lastPage' | 'never';
  didDrawPage?: (data: any) => void;
  didParseCell?: (data: any) => void;
  willDrawCell?: (data: any) => void;
  didDrawCell?: (data: any) => void;
  [key: string]: any;
}

interface AutoTableStyles {
  font?: string;
  fontStyle?: string;
  fontSize?: number;
  lineColor?: number[] | number | string;
  lineWidth?: number;
  cellPadding?: number;
  fillColor?: number[] | number | string;
  textColor?: number[] | number | string;
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
  cellWidth?: 'auto' | 'wrap' | number;
  minCellHeight?: number;
  minCellWidth?: number;
} 