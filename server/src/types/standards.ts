/**
 * Types for standards reference system
 */

export interface Standard {
  id: string;
  code_name: string;
  full_name: string;
  version: string;
  issuing_body: string;
  description?: string;
  publication_date?: Date | string;
  effective_date?: Date | string;
}

export interface Section {
  id: string;
  standard_id: string;
  section_number: string;
  title: string;
  content: string;
  parent_section_id: string | null;
  has_tables: boolean;
  has_figures: boolean;
}

export interface SectionDetail extends Section {
  tables?: TableData[];
  figures?: FigureData[];
  compliance_requirements?: ComplianceRequirement[];
  educational_resources?: EducationalResource[];
}

export interface TableData {
  id: string;
  section_id: string;
  table_number: string;
  title: string;
  content: any; // Usually JSON structure of the table
  notes?: string;
}

export interface FigureData {
  id: string;
  section_id: string;
  figure_number: string;
  title: string;
  image_path: string;
  caption?: string;
}

export interface ComplianceRequirement {
  id: string;
  section_id: string;
  requirement_type: 'mandatory' | 'prescriptive' | 'performance';
  description: string;
  verification_method?: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface EducationalResource {
  id: string;
  section_id: string;
  resource_type: 'video' | 'article' | 'case_study' | 'guide';
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at?: Date | string;
}

export interface SectionTag {
  section_id: string;
  tag_id: string;
}

export interface StandardsQueryParams {
  issuing_body?: string;
  effective_after?: string;
  version?: string;
}

export interface SectionsQueryParams {
  parentId?: string;
  has_tables?: boolean;
  has_figures?: boolean;
} 