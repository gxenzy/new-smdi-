/**
 * Types for the Report Management System
 */

export type ReportType = 'energy_audit' | 'lighting' | 'hvac' | 'equipment' | 'power_factor' | 'harmonic' | 'schedule_of_loads' | 'custom';
export type ReportStatus = 'draft' | 'published' | 'archived';
export type ReportContentType = 'text' | 'chart' | 'table' | 'image' | 'section_header' | 'page_break' | 'toc' | 'custom';
export type ReportPermission = 'view' | 'edit' | 'admin';

/**
 * Report interface
 */
export interface Report {
  id: number;
  title: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  created_by: number;
  is_template: boolean;
  is_public: boolean;
  version: number;
  contents?: ReportContent[];
  metadata?: ReportMetadata;
  public_link: string | null;
  shares: ReportSharing[];
  comments_count?: number;
  unresolved_comments_count?: number;
}

/**
 * Report content interface
 */
export interface ReportContent {
  id?: number;
  report_id?: number;
  content_type: ReportContentType;
  content: any; // The actual content data (varies by type)
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Chart content specific interface
 */
export interface ChartReportContent extends ReportContent {
  content_type: 'chart';
  content: {
    chartType: string;
    data: any;
    options: any;
    themeName?: string;
    sizePreset?: string;
    height?: number;
    caption?: string;
  };
}

/**
 * Table content specific interface
 */
export interface TableReportContent extends ReportContent {
  content_type: 'table';
  content: {
    headers: string[];
    rows: any[][];
    caption?: string;
  };
}

/**
 * Text content specific interface
 */
export interface TextReportContent extends ReportContent {
  content_type: 'text';
  content: {
    text: string;
    isHtml?: boolean;
  };
}

/**
 * Image content specific interface
 */
export interface ImageReportContent extends ReportContent {
  content_type: 'image';
  content: {
    url: string;
    caption?: string;
    altText?: string;
    width?: number;
    height?: number;
  };
}

/**
 * Section header content specific interface
 */
export interface SectionHeaderReportContent extends ReportContent {
  content_type: 'section_header';
  content: {
    title: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

/**
 * Page break content specific interface
 */
export interface PageBreakReportContent extends ReportContent {
  content_type: 'page_break';
  content: {
    type?: 'standard' | 'section';
  };
}

/**
 * Table of contents content specific interface
 */
export interface TocReportContent extends ReportContent {
  content_type: 'toc';
  content: {
    title?: string;
    maxDepth?: number;
  };
}

/**
 * Report metadata interface
 */
export interface ReportMetadata {
  id?: number;
  report_id?: number;
  client_name?: string;
  facility_name?: string;
  audit_date?: string;
  auditor_name?: string;
  company_logo?: string;
  executive_summary?: string;
  cover_image?: string;
  include_appendices: boolean;
  include_toc: boolean;
  company_contact?: string;
  company_address?: string;
  company_website?: string;
  project_number?: string;
  custom_fields?: { [key: string]: string };
}

/**
 * Report sharing interface
 */
export interface ReportSharing {
  id: number;
  report_id: number;
  user_id: number;
  permission: ReportPermission;
  created_by: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Report template interface
 */
export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  report_type: ReportType;
  is_default: boolean;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Report API response interfaces
 */
export interface ReportApiResponse {
  success: boolean;
  message?: string;
  data?: Report;
  error?: string;
}

export interface ReportsApiResponse {
  success: boolean;
  count: number;
  data: Report[];
  error?: string;
}

/**
 * Report comment interface
 */
export interface ReportComment {
  id: number;
  report_id: number;
  user_id: number;
  content: string;
  content_index?: number;  // Optional reference to specific content item
  parent_id?: number;      // For threaded comments
  created_at: string;
  updated_at: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  replies?: ReportComment[];
}

/**
 * Report comments API response interface
 */
export interface CommentsApiResponse {
  success: boolean;
  data: ReportComment[];
  count: number;
  error?: string;
}

/**
 * Comment API response interface
 */
export interface CommentApiResponse {
  success: boolean;
  data?: ReportComment;
  error?: string;
} 