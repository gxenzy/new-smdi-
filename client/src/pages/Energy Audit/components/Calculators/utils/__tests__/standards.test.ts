import axios from 'axios';
import {
  fetchStandards,
  fetchBuildingStandardsByType,
  fetchLPDStandards,
  clearStandardsCache
} from '../standards';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Standards API Utilities', () => {
  beforeEach(() => {
    // Clear the cache before each test
    clearStandardsCache();
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('fetchStandards', () => {
    it('should fetch standards from the API', async () => {
      const mockStandards = [
        { id: '1', standardCode: 'PEC-2017', standardName: 'Philippine Electrical Code', version: '2017' },
        { id: '2', standardCode: 'PGBC', standardName: 'Philippine Green Building Code', version: '2015' }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockStandards });
      
      const result = await fetchStandards();
      
      expect(result).toEqual(mockStandards);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    
    it('should use cached data on subsequent calls', async () => {
      const mockStandards = [{ id: '1', standardCode: 'PEC-2017' }];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockStandards });
      
      // First call should fetch from API
      await fetchStandards();
      
      // Second call should use cache
      await fetchStandards();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    
    it('should throw an error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(fetchStandards()).rejects.toThrow('Failed to fetch standards data');
    });
  });
  
  describe('fetchBuildingStandardsByType', () => {
    it('should fetch building standards for a specific type', async () => {
      const mockStandards = [
        { id: '1', buildingType: 'Office', standardType: 'lpd', maximumValue: 10.5 },
        { id: '2', buildingType: 'Retail', standardType: 'lpd', maximumValue: 14.5 }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockStandards });
      
      const result = await fetchBuildingStandardsByType('lpd');
      
      expect(result).toEqual(mockStandards);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        params: { standardType: 'lpd' }
      });
    });
    
    it('should throw an error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(fetchBuildingStandardsByType('lpd')).rejects.toThrow('Failed to fetch lpd standards');
    });
  });
  
  describe('fetchLPDStandards', () => {
    it('should format API response into the expected structure', async () => {
      const mockStandards = [
        { 
          id: '1', 
          buildingType: 'Office', 
          standardType: 'lpd', 
          maximumValue: 10.5, 
          minimumValue: null,
          unit: 'W/m²',
          description: 'Office LPD',
          standardCode: 'PGBC-LPD-OFFICE',
          sourceStandardId: '1'
        },
        { 
          id: '2', 
          buildingType: 'Retail', 
          standardType: 'lpd', 
          maximumValue: 14.5,
          minimumValue: null,
          unit: 'W/m²',
          description: 'Retail LPD',
          standardCode: 'PGBC-LPD-RETAIL',
          sourceStandardId: '1'
        }
      ];
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockStandards });
      
      const result = await fetchLPDStandards();
      
      expect(result).toEqual({
        office: { label: 'Office', maxLPD: 10.5 },
        retail: { label: 'Retail', maxLPD: 14.5 }
      });
    });
    
    it('should return fallback values when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await fetchLPDStandards();
      
      // Should include fallback values
      expect(result.office).toEqual({ label: 'Office', maxLPD: 10.5 });
      expect(result.classroom).toEqual({ label: 'Classroom', maxLPD: 10.5 });
    });
  });
  
  describe('Cache management', () => {
    it('should clear the cache when clearStandardsCache is called', async () => {
      const mockStandards = [{ id: '1', standardCode: 'PEC-2017' }];
      
      mockedAxios.get.mockResolvedValue({ data: mockStandards });
      
      // First call should fetch from API
      await fetchStandards();
      
      // Clear cache
      clearStandardsCache();
      
      // Second call should fetch from API again
      await fetchStandards();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
}); 