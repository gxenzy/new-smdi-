/**
 * Types for report management system
 */

export enum ReportType {
  ENERGY_AUDIT = 'ENERGY_AUDIT',
  ILLUMINATION = 'ILLUMINATION',
  LOAD_ANALYSIS = 'LOAD_ANALYSIS',
  POWER_QUALITY = 'POWER_QUALITY',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  created_by: string;
  assigned_to?: string;
  created_at: Date | string;
  updated_at: Date | string;
  published_at?: Date | string;
  client_name?: string;
  facility_name?: string;
  cover_image?: string;
  tags?: string[];
  version: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
  content: string; // JSON structure or template definition
  is_default: boolean;
  tags?: string[];
  version: number;
}

export interface ReportSection {
  id: string;
  report_id: string;
  title: string;
  content: any; // JSON or HTML content
  order: number;
  type: string; // e.g., 'text', 'chart', 'table', 'image', etc.
  created_at: Date | string;
  updated_at: Date | string;
  metadata?: any; // Optional metadata specific to section type
}

export interface ReportChart {
  id: string;
  report_id: string;
  section_id?: string;
  title: string;
  description?: string;
  chart_type: string; // e.g., 'bar', 'line', 'pie', etc.
  data: any; // JSON structure with chart data
  options: any; // Chart.js options
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ReportTable {
  id: string;
  report_id: string;
  section_id?: string;
  title: string;
  description?: string;
  headers: string[];
  rows: any[][]; // Array of row data
  created_at: Date | string;
  updated_at: Date | string;
  styling?: any; // Optional styling configuration
}

export interface ReportImage {
  id: string;
  report_id: string;
  section_id?: string;
  title: string;
  description?: string;
  file_path: string;
  alt_text?: string;
  created_at: Date | string;
  updated_at: Date | string;
  width?: number;
  height?: number;
}

export interface ReportComment {
  id: string;
  report_id: string;
  section_id?: string;
  content: string;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
  parent_id?: string; // For threaded comments
  status: 'open' | 'addressed' | 'closed';
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: string;
  created_at: Date | string;
}

export interface ReportExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'excel';
  includeCharts: boolean;
  includeTables: boolean;
  includeImages: boolean;
  paperSize?: 'letter' | 'legal' | 'a4' | 'a3';
  orientation?: 'portrait' | 'landscape';
  headerFooter?: boolean;
  companyLogo?: boolean;
  watermark?: string;
}

export interface ReportQueryParams {
  type?: ReportType;
  status?: ReportStatus;
  created_by?: string;
  assigned_to?: string;
  client_name?: string;
  facility_name?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} 