import axios from 'axios';

interface IlluminationRequirement {
  roomType: string;
  requiredIlluminance: number;
  notes: string;
  tableNumber: string;
  tableTitle: string;
  standard: string;
  standardFullName: string;
}

interface Standard {
  id: string;
  code_name: string;
  full_name: string;
  version: string;
  issuing_body: string;
  description?: string;
  publication_date?: string;
  effective_date?: string;
}

interface Section {
  id: string;
  standard_id: string;
  section_number: string;
  title: string;
  content: string;
  parent_section_id: string | null;
  has_tables: boolean;
  has_figures: boolean;
  tables?: TableData[];
  figures?: FigureData[];
  compliance_requirements?: RequirementData[];
  educational_resources?: ResourceData[];
}

interface TableData {
  id: string;
  table_number: string;
  title: string;
  content: any;
  notes?: string;
}

interface FigureData {
  id: string;
  figure_number: string;
  title: string;
  image_path: string;
  caption?: string;
}

interface RequirementData {
  id: string;
  requirement_type: 'mandatory' | 'prescriptive' | 'performance';
  description: string;
  verification_method?: string;
  severity: 'critical' | 'major' | 'minor';
}

interface ResourceData {
  id: string;
  resource_type: 'video' | 'article' | 'case_study' | 'guide';
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

interface SearchResult {
  id: string;
  standard_id: string;
  section_number: string;
  title: string;
  content: string;
  code_name: string;
  full_name: string;
  relevance?: number;
}

interface SearchOptions {
  standardId?: string;
  exactMatch?: boolean;
  fields?: string[];
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'title' | 'section_number' | 'standard';
  sortDirection?: 'asc' | 'desc';
  relevanceThreshold?: number;
  tags?: string[];
}

interface Tag {
  id: string;
  name: string;
  created_at?: string;
}

/**
 * Service for interacting with the Standards Reference System
 */
class StandardsService {
  /**
   * Get all available standards
   */
  async getStandards(): Promise<Standard[]> {
    try {
      // Try to fetch from API first
      try {
        const response = await axios.get('/api/standards-api/standards');
        return response.data.map((item: any) => ({
          id: item._id || item.id,
          code_name: item.code_name,
          full_name: item.full_name,
          version: item.version,
          issuing_body: item.issuing_body,
          description: item.description,
          publication_date: item.publication_date,
          effective_date: item.effective_date
        }));
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Return mock data as fallback
        return [
          {
            id: "1",
            code_name: "PEC-2017",
            full_name: "Philippine Electrical Code",
            version: "2017",
            issuing_body: "IIEE",
            description: "The Philippine Electrical Code"
          },
          {
            id: "2",
            code_name: "PEEP",
            full_name: "Philippine Energy Efficiency Project",
            version: "2020",
            issuing_body: "DOE",
            description: "Energy efficiency standards for buildings"
          },
          {
            id: "3",
            code_name: "NFPA-70",
            full_name: "National Electrical Code",
            version: "2020",
            issuing_body: "NFPA",
            description: "National Fire Protection Association electrical standards"
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching standards:', error);
      throw error;
    }
  }

  /**
   * Get a standard by ID
   */
  async getStandardById(id: string): Promise<Standard> {
    try {
      const response = await axios.get(`/api/standards-api/standards/${id}`);
      const data = response.data;
      return {
        id: data._id || data.id,
        code_name: data.code_name,
        full_name: data.full_name,
        version: data.version,
        issuing_body: data.issuing_body,
        description: data.description,
        publication_date: data.publication_date,
        effective_date: data.effective_date
      };
    } catch (error) {
      console.error('Error fetching standard:', error);
      throw error;
    }
  }

  /**
   * Get sections for a standard
   */
  async getSections(standardId: string, parentId?: string): Promise<Section[]> {
    try {
      // Try to fetch from API first
      try {
        const url = `/api/standards-api/standards/${standardId}/sections${parentId ? `?parentId=${parentId}` : ''}`;
        const response = await axios.get(url);
        return response.data.map((item: any) => ({
          id: item._id || item.id,
          standard_id: item.standard_id,
          section_number: item.section_number,
          title: item.title,
          content: item.content || '',
          parent_section_id: item.parent_section_id,
          has_tables: item.has_tables || false,
          has_figures: item.has_figures || false
        }));
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Return mock data as fallback
        let mockSections: Section[] = [];
        
        if (standardId === "1") { // PEC
          mockSections = [
            {
              id: "101",
              standard_id: "1",
              section_number: "1.0",
              title: "General Requirements",
              content: "This section covers general requirements for electrical installations.",
              parent_section_id: null,
              has_tables: false,
              has_figures: false
            },
            {
              id: "102",
              standard_id: "1",
              section_number: "2.0",
              title: "Wiring and Protection",
              content: "Requirements for electrical wiring and protection methods.",
              parent_section_id: null,
              has_tables: true,
              has_figures: true
            }
          ];
        } else if (standardId === "2") { // PEEP
          mockSections = [
            {
              id: "201",
              standard_id: "2",
              section_number: "1.0",
              title: "Energy Efficiency in Buildings",
              content: "Standards for energy efficiency in buildings.",
              parent_section_id: null,
              has_tables: false,
              has_figures: false
            },
            {
              id: "202",
              standard_id: "2",
              section_number: "2.0",
              title: "Lighting Systems",
              content: "Energy efficient lighting system requirements.",
              parent_section_id: null,
              has_tables: true,
              has_figures: false
            }
          ];
        } else {
          mockSections = [
            {
              id: "301",
              standard_id: standardId,
              section_number: "1.0",
              title: "Introduction",
              content: "Introduction to the standard.",
              parent_section_id: null,
              has_tables: false,
              has_figures: false
            },
            {
              id: "302",
              standard_id: standardId,
              section_number: "2.0",
              title: "Requirements",
              content: "General requirements of the standard.",
              parent_section_id: null,
              has_tables: true,
              has_figures: true
            }
          ];
        }
        
        // Filter by parent ID if provided
        if (parentId) {
          mockSections = mockSections.filter(s => s.parent_section_id === parentId);
        }
        
        return mockSections;
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  /**
   * Get a section by ID
   */
  async getSectionById(id: string): Promise<Section> {
    try {
      // Try to fetch from API first
      try {
        const response = await axios.get(`/api/standards-api/sections/${id}`);
        const data = response.data;
        return {
          id: data._id || data.id,
          standard_id: data.standard_id,
          section_number: data.section_number,
          title: data.title,
          content: data.content || '',
          parent_section_id: data.parent_section_id,
          has_tables: data.has_tables || false,
          has_figures: data.has_figures || false,
          tables: data.tables || [],
          figures: data.figures || [],
          compliance_requirements: data.compliance_requirements || [],
          educational_resources: data.educational_resources || []
        };
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Return mock data as fallback
        // Basic template for mock section
        const mockSection: Section = {
          id: id,
          standard_id: "",
          section_number: "",
          title: "",
          content: "",
          parent_section_id: null,
          has_tables: false,
          has_figures: false,
          tables: [],
          figures: [],
          compliance_requirements: [],
          educational_resources: []
        };
        
        // Fill with specific content based on ID
        if (id === "101") {
          mockSection.standard_id = "1";
          mockSection.section_number = "1.0";
          mockSection.title = "General Requirements";
          mockSection.content = "This section covers general requirements for electrical installations. It includes specifications for materials, wiring methods, and safety procedures.";
        } else if (id === "102") {
          mockSection.standard_id = "1";
          mockSection.section_number = "2.0";
          mockSection.title = "Wiring and Protection";
          mockSection.content = "Requirements for electrical wiring and protection methods. This includes circuit protection, grounding requirements, and wire sizing guidelines.";
          mockSection.has_tables = true;
          mockSection.tables = [
            {
              id: "t1",
              table_number: "2.1",
              title: "Conductor Sizing Chart",
              content: {
                headers: ["AWG Size", "Current Rating (A)", "Maximum Length (m)"],
                rows: [
                  ["14", "15", "30"],
                  ["12", "20", "45"],
                  ["10", "30", "75"]
                ]
              }
            }
          ];
        } else if (id === "201") {
          mockSection.standard_id = "2";
          mockSection.section_number = "1.0";
          mockSection.title = "Energy Efficiency in Buildings";
          mockSection.content = "Standards for energy efficiency in buildings. This section provides guidelines for energy conservation in new and existing structures.";
        } else if (id === "202") {
          mockSection.standard_id = "2";
          mockSection.section_number = "2.0";
          mockSection.title = "Lighting Systems";
          mockSection.content = "Energy efficient lighting system requirements. This includes specifications for lumens per watt, color temperature, and control systems.";
          mockSection.has_tables = true;
          mockSection.tables = [
            {
              id: "t2",
              table_number: "2.1",
              title: "Minimum Lighting Efficiency Requirements",
              content: {
                headers: ["Application", "Minimum Efficacy (lm/W)", "Maximum Power Density (W/m²)"],
                rows: [
                  ["Office", "90", "10"],
                  ["Retail", "80", "16"],
                  ["Educational", "95", "8"]
                ]
              }
            }
          ];
        } else {
          mockSection.standard_id = "3";
          mockSection.section_number = "1.0";
          mockSection.title = "Generic Section";
          mockSection.content = "This is a generic standard section with placeholder content.";
        }
        
        return mockSection;
      }
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
    }
  }

  /**
   * Get tags for a section
   */
  async getSectionTags(sectionId: string): Promise<Tag[]> {
    try {
      const response = await axios.get(`/api/standards-api/sections/${sectionId}/tags`);
      return response.data.map((tag: any) => ({
        id: tag._id || tag.id,
        name: tag.name,
        created_at: tag.created_at
      }));
    } catch (error) {
      console.error('Error fetching section tags:', error);
      throw error;
    }
  }

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await axios.get('/api/standards-api/tags');
      return response.data.map((tag: any) => ({
        id: tag._id || tag.id,
        name: tag.name,
        created_at: tag.created_at
      }));
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  /**
   * Add a tag to a section
   */
  async addSectionTag(sectionId: string, tagName: string): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`/api/standards-api/sections/${sectionId}/tags`, {
        tagName
      });
      return response.data;
    } catch (error) {
      console.error('Error adding section tag:', error);
      throw error;
    }
  }

  /**
   * Remove a tag from a section
   */
  async removeSectionTag(sectionId: string, tagId: string): Promise<{ success: boolean }> {
    try {
      const response = await axios.delete(`/api/standards-api/sections/${sectionId}/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing section tag:', error);
      throw error;
    }
  }

  /**
   * Search for sections matching a query
   */
  async searchSections(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // Try to fetch from API first
      try {
        const queryParams = new URLSearchParams({
          q: query,
          ...options.standardId && { standardId: options.standardId },
          ...options.exactMatch && { exactMatch: 'true' },
          ...options.fields && { fields: options.fields.join(',') },
          ...options.page && { page: options.page.toString() },
          ...options.limit && { limit: options.limit.toString() },
          ...options.sort && { sort: options.sort },
          ...options.sortDirection && { sortDirection: options.sortDirection },
          ...options.relevanceThreshold && { relevanceThreshold: options.relevanceThreshold.toString() },
          ...options.tags && options.tags.length > 0 && { tags: options.tags.join(',') }
        });

        const response = await axios.get(`/api/standards-api/search/sections?${queryParams}`);
        return response.data;
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Return mock data as fallback
        return [
          {
            id: "101",
            standard_id: "1",
            section_number: "1.3",
            title: "General Requirements",
            content: `This section contains requirements related to: ${query}`,
            code_name: "PEC-2017",
            full_name: "Philippine Electrical Code",
            relevance: 0.85
          },
          {
            id: "202",
            standard_id: "2",
            section_number: "2.1",
            title: "Lighting Systems",
            content: `Energy efficient lighting requirements including: ${query}`,
            code_name: "PEEP",
            full_name: "Philippine Energy Efficiency Project",
            relevance: 0.72
          }
        ];
      }
    } catch (error) {
      console.error('Error searching sections:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await axios.get(`/api/search/suggestions?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  }

  /**
   * Get recent search terms
   */
  async getRecentSearchTerms(): Promise<string[]> {
    try {
      const response = await axios.get('/api/search/recent-terms');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent search terms:', error);
      throw error;
    }
  }

  /**
   * Get illumination requirements for a room type
   */
  async getIlluminationRequirement(roomType: string): Promise<IlluminationRequirement> {
    try {
      const response = await axios.get(`/api/standards-api/lookup/illumination?roomType=${encodeURIComponent(roomType)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching illumination requirement:', error);
      throw error;
    }
  }

  /**
   * Save a bookmark
   */
  async saveBookmark(sectionId: string): Promise<{ success: boolean; id: string }> {
    // For now, we're using localStorage in the components
    // In the future, this would make an API call
    return { success: true, id: String(Date.now()) };
  }

  /**
   * Get user bookmarks
   */
  async getBookmarks(): Promise<string[]> {
    // For now, we're using localStorage in the components
    // In the future, this would make an API call
    return [];
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(bookmarkId: string): Promise<{ success: boolean }> {
    // For now, we're using localStorage in the components
    // In the future, this would make an API call
    return { success: true };
  }
}

export default new StandardsService(); 