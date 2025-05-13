/**
 * Types for search functionality
 */

export interface SearchResult {
  id: string;
  title: string;
  section_number: string;
  content: string;
  standard_id: string;
  code_name: string;
  full_name: string;
  relevance?: number;
  tags?: Tag[];
}

export interface SearchOptions {
  q?: string;
  standardId?: string;
  exactMatch?: boolean;
  fields?: string;
  page?: number | string;
  limit?: number | string;
  sort?: 'relevance' | 'title' | 'section_number' | 'standard';
  sortDirection?: 'asc' | 'desc';
  relevanceThreshold?: number | string;
  tags?: string[] | string;
}

export interface SearchSuggestion {
  title: string;
}

export interface Tag {
  id: number;
  name: string;
}

export type SearchTerms = string[]; 