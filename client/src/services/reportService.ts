import axios from 'axios';
import { 
  Report, 
  ReportApiResponse, 
  ReportsApiResponse, 
  ReportContent, 
  ReportMetadata, 
  ReportSharing
} from '../types/reports';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add caching mechanisms
interface ReportCache {
  [key: number]: {
    report: Report;
    timestamp: number;
    expiresIn: number;
  };
}

// Cache for reports
const reportCache: ReportCache = {};

// Cache expiration time (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Service for interacting with the reports API
 */
const reportService = {
  /**
   * Create a new report
   * @param reportData Report data to create
   * @returns Promise with created report
   */
  createReport: async (reportData: {
    title: string;
    description?: string;
    type: string;
    is_template?: boolean;
    is_public?: boolean;
    contents?: ReportContent[];
    metadata?: ReportMetadata;
  }): Promise<Report> => {
    try {
      const response = await axios.post<ReportApiResponse>(
        `${API_URL}/reports`,
        reportData
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create report');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  /**
   * Get a report by ID
   * @param id Report ID
   * @returns Promise with report
   */
  getReportById: async (id: number): Promise<Report> => {
    // Check if the report is in the cache and not expired
    const cachedReport = reportCache[id];
    if (cachedReport && (Date.now() - cachedReport.timestamp) < cachedReport.expiresIn) {
      console.log('Retrieved report from cache:', id);
      return cachedReport.report;
    }

    try {
      const response = await axios.get<ReportApiResponse>(
        `${API_URL}/reports/${id}`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get report');
      }
      
      // Cache the report
      reportCache[id] = {
        report: response.data.data,
        timestamp: Date.now(),
        expiresIn: CACHE_EXPIRATION
      };
      
      return response.data.data;
    } catch (error) {
      console.error(`Error getting report ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all reports with optional filtering
   * @param filters Optional filters for reports
   * @returns Promise with reports array
   */
  getAllReports: async (filters?: {
    created_by?: number;
    type?: string;
    status?: string;
    is_template?: boolean;
    is_public?: boolean;
  }): Promise<Report[]> => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await axios.get<ReportsApiResponse>(
        `${API_URL}/reports${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get reports');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  },

  /**
   * Update an existing report
   * @param id Report ID
   * @param reportData Report data to update
   * @returns Promise with updated report
   */
  updateReport: async (
    id: number,
    reportData: {
      title?: string;
      description?: string;
      type?: string;
      is_template?: boolean;
      is_public?: boolean;
      status?: string;
      version?: number;
      contents?: ReportContent[];
      metadata?: ReportMetadata;
    }
  ): Promise<Report> => {
    try {
      const response = await axios.put<ReportApiResponse>(
        `${API_URL}/reports/${id}`,
        reportData
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update report');
      }
      
      // Update the cache with the new report
      reportCache[id] = {
        report: response.data.data,
        timestamp: Date.now(),
        expiresIn: CACHE_EXPIRATION
      };
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a report
   * @param id Report ID
   * @returns Promise with success status
   */
  deleteReport: async (id: number): Promise<boolean> => {
    try {
      const response = await axios.delete<ReportApiResponse>(
        `${API_URL}/reports/${id}`
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error);
      throw error;
    }
  },

  /**
   * Share a report with another user
   * @param reportId Report ID
   * @param userId User ID to share with
   * @param permission Permission level
   * @returns Promise with success status
   */
  shareReport: async (
    reportId: number,
    userId: number,
    permission: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post<ReportApiResponse>(
        `${API_URL}/reports/${reportId}/share`,
        { userId, permission }
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error sharing report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Get reports shared with the current user
   * @returns Promise with shared reports array
   */
  getSharedReports: async (): Promise<Report[]> => {
    try {
      const response = await axios.get<ReportsApiResponse>(
        `${API_URL}/reports/shared/list`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get shared reports');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting shared reports:', error);
      throw error;
    }
  },

  /**
   * Clear the report cache for a specific report or all reports
   * @param reportId Optional report ID to clear from cache
   */
  clearCache(reportId?: number) {
    if (reportId) {
      delete reportCache[reportId];
    } else {
      // Clear all cache
      Object.keys(reportCache).forEach(key => {
        delete reportCache[parseInt(key)];
      });
    }
  },

  /**
   * Revoke a user's access to a report
   * @param reportId Report ID
   * @param shareId Share ID to revoke
   * @returns Promise with success status
   */
  revokeReportAccess: async (
    reportId: number,
    shareId: number
  ): Promise<boolean> => {
    try {
      const response = await axios.delete<ReportApiResponse>(
        `${API_URL}/reports/${reportId}/share/${shareId}`
      );
      
      // Clear the cache for this report
      reportService.clearCache(reportId);
      
      return response.data.success;
    } catch (error) {
      console.error(`Error revoking access to report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Generate a public link for a report
   * @param reportId Report ID
   * @returns Promise with the public link URL
   */
  generatePublicLink: async (reportId: number): Promise<string> => {
    try {
      const response = await axios.post<{
        success: boolean;
        message?: string;
        link?: string;
        error?: string;
      }>(
        `${API_URL}/reports/${reportId}/public-link`
      );
      
      if (!response.data.success || !response.data.link) {
        throw new Error(response.data.error || 'Failed to generate public link');
      }
      
      // Clear the cache for this report
      reportService.clearCache(reportId);
      
      return response.data.link;
    } catch (error) {
      console.error(`Error generating public link for report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Revoke the public link for a report
   * @param reportId Report ID
   * @returns Promise with success status
   */
  revokePublicLink: async (reportId: number): Promise<boolean> => {
    try {
      const response = await axios.delete<ReportApiResponse>(
        `${API_URL}/reports/${reportId}/public-link`
      );
      
      // Clear the cache for this report
      reportService.clearCache(reportId);
      
      return response.data.success;
    } catch (error) {
      console.error(`Error revoking public link for report ${reportId}:`, error);
      throw error;
    }
  },
};

export default reportService; 