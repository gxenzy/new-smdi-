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
  _id: string;
  code_name: string;
  full_name: string;
  version: string;
  issuing_body: string;
  description?: string;
  publication_date?: string;
  effective_date?: string;
}

interface Section {
  _id: string;
  standard_id: string;
  section_number: string;
  title: string;
  content: string;
  parent_section_id: string | null;
  has_tables: boolean;
  has_figures: boolean;
  tables?: any[];
  figures?: any[];
  compliance_requirements?: any[];
  educational_resources?: any[];
}

interface SearchResult {
  id: string;
  standard_id: string;
  section_number: string;
  title: string;
  code_name: string;
  full_name: string;
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
      const response = await axios.get('/api/standards-api/standards');
      return response.data;
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
      return response.data;
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
      const url = `/api/standards-api/standards/${standardId}/sections${parentId ? `?parentId=${parentId}` : ''}`;
      const response = await axios.get(url);
      return response.data;
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
      const response = await axios.get(`/api/standards-api/sections/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
    }
  }

  /**
   * Search for sections by query
   */
  async searchSections(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`/api/standards-api/search/sections?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching sections:', error);
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
}

export default new StandardsService(); 