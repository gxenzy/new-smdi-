import axios from 'axios';
import reportService from '../reportService';
import { Report, ReportApiResponse, ReportsApiResponse } from '../../types/reports';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('reportService', () => {
  // Mock response data
  const mockReport: Report = {
    id: 1,
    title: 'Test Report',
    description: 'Test description',
    type: 'energy_audit',
    status: 'published',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    created_by: 1,
    is_template: false,
    is_public: true,
    version: 1,
    public_link: null,
    shares: [],
  };

  const mockReportApiResponse: ReportApiResponse = {
    success: true,
    data: mockReport,
  };

  const mockReportsApiResponse: ReportsApiResponse = {
    success: true,
    count: 1,
    data: [mockReport],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reportService.clearCache();
  });

  describe('getReportById', () => {
    test('fetches report by id and returns data', async () => {
      // Setup mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });

      // Call the function
      const result = await reportService.getReportById(1);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/reports/1'));
      expect(result).toEqual(mockReport);
    });

    test('uses cache when available', async () => {
      // First call to cache the report
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });
      await reportService.getReportById(1);

      // Clear mock to check if second call uses cache
      mockedAxios.get.mockClear();

      // Second call should use cache
      const result = await reportService.getReportById(1);

      // Axios should not be called again
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });

    test('handles error response', async () => {
      // Setup error response
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Call the function and expect it to throw
      await expect(reportService.getReportById(1)).rejects.toThrow('Network error');
    });
  });

  describe('getAllReports', () => {
    test('fetches all reports without filters', async () => {
      // Setup mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportsApiResponse });

      // Call the function
      const result = await reportService.getAllReports();

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/reports'));
      expect(result).toEqual([mockReport]);
    });

    test('fetches reports with filters', async () => {
      // Setup mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportsApiResponse });

      // Call the function with filters
      const filters = { type: 'energy_audit', status: 'published' };
      const result = await reportService.getAllReports(filters);

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reports?type=energy_audit&status=published')
      );
      expect(result).toEqual([mockReport]);
    });
  });

  describe('createReport', () => {
    test('creates a new report', async () => {
      // Setup mock
      mockedAxios.post.mockResolvedValueOnce({ data: mockReportApiResponse });

      // Call the function
      const reportData = {
        title: 'New Report',
        type: 'energy_audit',
      };
      const result = await reportService.createReport(reportData);

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reports'),
        reportData
      );
      expect(result).toEqual(mockReport);
    });

    test('throws error when API call fails', async () => {
      const errorMessage = 'Failed to create report';
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      const reportData = {
        title: 'New Report',
        type: 'energy_audit',
      };

      await expect(reportService.createReport(reportData)).rejects.toThrow();
    });
  });

  describe('updateReport', () => {
    test('updates an existing report', async () => {
      // Setup mock
      mockedAxios.put.mockResolvedValueOnce({ data: mockReportApiResponse });

      // Call the function
      const reportData = {
        title: 'Updated Report',
      };
      const result = await reportService.updateReport(1, reportData);

      // Assertions
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/reports/1'),
        reportData
      );
      expect(result).toEqual(mockReport);
    });

    test('updates cache after updating report', async () => {
      // First call to get the report (and cache it)
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });
      await reportService.getReportById(1);

      // Update the report
      const updatedReport = { ...mockReport, title: 'Updated Report' };
      const updatedResponse = { success: true, data: updatedReport };
      mockedAxios.put.mockResolvedValueOnce({ data: updatedResponse });

      // Call the update function
      const result = await reportService.updateReport(1, { title: 'Updated Report' });

      // Clear get mock to check cache
      mockedAxios.get.mockClear();

      // Get the report again (should use cache with updated value)
      const cachedResult = await reportService.getReportById(1);

      // Assertions
      expect(mockedAxios.get).not.toHaveBeenCalled(); // Didn't fetch, used cache
      expect(cachedResult).toEqual(updatedReport); // Got updated value from cache
    });

    test('throws error when API call fails', async () => {
      const errorMessage = 'Failed to update report';
      mockedAxios.put.mockRejectedValueOnce(new Error(errorMessage));

      await expect(reportService.updateReport(1, { title: 'Updated Report' })).rejects.toThrow();
    });
  });

  describe('deleteReport', () => {
    test('deletes a report', async () => {
      // Setup mock
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      // Call the function
      const result = await reportService.deleteReport(1);

      // Assertions
      expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining('/reports/1'));
      expect(result).toBe(true);
    });

    test('throws error when API call fails', async () => {
      const errorMessage = 'Failed to delete report';
      mockedAxios.delete.mockRejectedValueOnce(new Error(errorMessage));

      await expect(reportService.deleteReport(1)).rejects.toThrow();
    });
  });

  describe('shareReport', () => {
    test('shares a report successfully', async () => {
      // Setup mock
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      // Call the function
      const result = await reportService.shareReport(1, 2, 'view');

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reports/1/share'),
        { userId: 2, permission: 'view' }
      );
      expect(result).toBe(true);
    });

    test('throws error when sharing fails', async () => {
      // Setup error response
      mockedAxios.post.mockRejectedValueOnce(new Error('Failed to share report'));

      // Call the function and expect it to throw
      await expect(reportService.shareReport(1, 2, 'view')).rejects.toThrow();
    });
  });

  describe('revokeReportAccess', () => {
    it('should revoke access to a report successfully', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Access revoked successfully'
        }
      });

      // Execute
      const result = await reportService.revokeReportAccess(1, 2);

      // Verify
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3001/api/reports/1/share/2');
      expect(result).toBe(true);
    });

    it('should handle API errors when revoking access', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Failed to revoke access'
        }
      });

      // Execute and verify
      const result = await reportService.revokeReportAccess(1, 2);
      expect(result).toBe(false);
    });

    it('should handle network errors when revoking access', async () => {
      // Setup
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      // Execute and verify
      await expect(reportService.revokeReportAccess(1, 2)).rejects.toThrow('Network error');
    });

    it('should clear cache for the report after revoking access', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: true
        }
      });
      
      // Create a spy on the clearCache method
      const clearCacheSpy = jest.spyOn(reportService, 'clearCache');

      // Execute
      await reportService.revokeReportAccess(1, 2);

      // Verify
      expect(clearCacheSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('generatePublicLink', () => {
    it('should generate a public link successfully', async () => {
      // Setup
      const mockLink = 'https://example.com/reports/public/abc123';
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          link: mockLink
        }
      });

      // Execute
      const result = await reportService.generatePublicLink(1);

      // Verify
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/api/reports/1/public-link');
      expect(result).toBe(mockLink);
    });

    it('should handle API errors when generating a public link', async () => {
      // Setup
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Failed to generate public link'
        }
      });

      // Execute and verify
      await expect(reportService.generatePublicLink(1)).rejects.toThrow('Failed to generate public link');
    });

    it('should handle network errors when generating a public link', async () => {
      // Setup
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      // Execute and verify
      await expect(reportService.generatePublicLink(1)).rejects.toThrow('Network error');
    });

    it('should clear cache for the report after generating a public link', async () => {
      // Setup
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          link: 'https://example.com/reports/public/abc123'
        }
      });
      
      // Create a spy on the clearCache method
      const clearCacheSpy = jest.spyOn(reportService, 'clearCache');

      // Execute
      await reportService.generatePublicLink(1);

      // Verify
      expect(clearCacheSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('revokePublicLink', () => {
    it('should revoke a public link successfully', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Public link revoked successfully'
        }
      });

      // Execute
      const result = await reportService.revokePublicLink(1);

      // Verify
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3001/api/reports/1/public-link');
      expect(result).toBe(true);
    });

    it('should handle API errors when revoking a public link', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Failed to revoke public link'
        }
      });

      // Execute
      const result = await reportService.revokePublicLink(1);
      
      // Verify
      expect(result).toBe(false);
    });

    it('should handle network errors when revoking a public link', async () => {
      // Setup
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      // Execute and verify
      await expect(reportService.revokePublicLink(1)).rejects.toThrow('Network error');
    });

    it('should clear cache for the report after revoking a public link', async () => {
      // Setup
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          success: true
        }
      });
      
      // Create a spy on the clearCache method
      const clearCacheSpy = jest.spyOn(reportService, 'clearCache');

      // Execute
      await reportService.revokePublicLink(1);

      // Verify
      expect(clearCacheSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('getSharedReports', () => {
    test('fetches shared reports successfully', async () => {
      // Setup mock
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportsApiResponse });

      // Call the function
      const result = await reportService.getSharedReports();

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/reports/shared/list'));
      expect(result).toEqual([mockReport]);
    });

    test('handles error when fetching shared reports', async () => {
      // Setup error response
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed to get shared reports'));

      // Call the function and expect it to throw
      await expect(reportService.getSharedReports()).rejects.toThrow();
    });
  });

  describe('clearCache', () => {
    test('clears specific report from cache', async () => {
      // First call to cache the report
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });
      await reportService.getReportById(1);

      // Clear specific cache
      reportService.clearCache(1);

      // Setup mock for second call
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });

      // Second call should not use cache
      await reportService.getReportById(1);

      // Axios should be called again after cache clear
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    test('clears all cache', async () => {
      // Cache two reports
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: { ...mockReport, id: 2 } } 
      });
      
      await reportService.getReportById(1);
      await reportService.getReportById(2);

      // Clear all cache
      reportService.clearCache();

      // Setup mocks for further calls
      mockedAxios.get.mockClear();
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportApiResponse });
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { success: true, data: { ...mockReport, id: 2 } } 
      });

      // These calls should not use cache
      await reportService.getReportById(1);
      await reportService.getReportById(2);

      // Axios should be called twice after cache clear
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
}); 