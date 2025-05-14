import axios from 'axios';
import {
  fetchStandards,
  fetchBuildingStandardsByType,
  fetchLPDStandards,
  clearStandardsCache,
  BuildingStandard,
  BuildingStandardsType
} from '../';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Standards API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStandardsCache();
  });

  describe('fetchStandards', () => {
    it('should fetch all standards', async () => {
      const standardsData = [
        {
          id: 'std-1',
          standardCode: 'PEC-2017',
          standardName: 'Philippine Electrical Code',
          version: '2017',
          category: 'electrical',
          dateEffective: '2017-01-01'
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: standardsData });

      const result = await fetchStandards();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(standardsData);
    });

    it('should use cached data if available', async () => {
      const standardsData = [{ id: 'std-1', standardCode: 'PEC-2017' }];
      
      // First call populates the cache
      mockedAxios.get.mockResolvedValueOnce({ data: standardsData });
      await fetchStandards();
      
      // Second call should use cache
      const result = await fetchStandards();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(standardsData);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      
      await expect(fetchStandards()).rejects.toThrow('Failed to fetch standards data');
    });
  });

  describe('fetchBuildingStandardsByType', () => {
    it('should fetch standards by type', async () => {
      const lpdStandards = [
        {
          id: 'lpd-1',
          buildingType: 'Office',
          standardType: 'lpd',
          standardCode: 'PEC-2017',
          minimumValue: null,
          maximumValue: 10.5,
          unit: 'W/m²',
          description: 'Maximum LPD for office spaces',
          sourceStandardId: 'std-1'
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: lpdStandards });

      const result = await fetchBuildingStandardsByType('lpd');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        params: { standardType: 'lpd' }
      });
      expect(result).toEqual(lpdStandards);
    });

    it('should use cached data if available', async () => {
      const lpdStandards = [{ id: 'lpd-1', buildingType: 'Office' }];
      
      // First call populates the cache
      mockedAxios.get.mockResolvedValueOnce({ data: lpdStandards });
      await fetchBuildingStandardsByType('lpd');
      
      // Second call should use cache
      const result = await fetchBuildingStandardsByType('lpd');
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(lpdStandards);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      
      await expect(fetchBuildingStandardsByType('lpd')).rejects.toThrow('Failed to fetch lpd standards');
    });
  });

  describe('fetchLPDStandards', () => {
    it('should fetch and format LPD standards', async () => {
      const lpdStandards = [
        {
          id: 'lpd-1',
          buildingType: 'Office',
          standardType: 'lpd',
          standardCode: 'PEC-2017',
          minimumValue: null,
          maximumValue: 10.5,
          unit: 'W/m²',
          description: 'Maximum LPD for office spaces',
          sourceStandardId: 'std-1'
        },
        {
          id: 'lpd-2',
          buildingType: 'Classroom',
          standardType: 'lpd',
          standardCode: 'PEC-2017',
          minimumValue: null,
          maximumValue: 10.5,
          unit: 'W/m²',
          description: 'Maximum LPD for classroom spaces',
          sourceStandardId: 'std-1'
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: lpdStandards });

      const result = await fetchLPDStandards();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        office: { label: 'Office', maxLPD: 10.5 },
        classroom: { label: 'Classroom', maxLPD: 10.5 }
      });
    });

    it('should return fallback values if API fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      
      const result = await fetchLPDStandards();
      
      // Should return fallback values
      expect(result.office.maxLPD).toBe(10.5);
      expect(result.classroom.maxLPD).toBe(10.5);
      expect(result.hospital.maxLPD).toBe(11.2);
      expect(Object.keys(result).length).toBeGreaterThan(5);
    });

    it('should filter out standards with no maximum value', async () => {
      const mixedStandards = [
        {
          id: 'lpd-1',
          buildingType: 'Office',
          standardType: 'lpd',
          standardCode: 'PEC-2017',
          minimumValue: null,
          maximumValue: 10.5,
          unit: 'W/m²',
          description: 'Maximum LPD for office spaces',
          sourceStandardId: 'std-1'
        },
        {
          id: 'lpd-2',
          buildingType: 'Incomplete',
          standardType: 'lpd',
          standardCode: 'PEC-2017',
          minimumValue: 5.0,
          maximumValue: null, // No maximum value, should be excluded
          unit: 'W/m²',
          description: 'Incomplete standard',
          sourceStandardId: 'std-1'
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mixedStandards });

      const result = await fetchLPDStandards();

      expect(Object.keys(result)).toContain('office');
      expect(Object.keys(result)).not.toContain('incomplete');
    });
  });

  describe('clearStandardsCache', () => {
    it('should clear the cache', async () => {
      const standardsData = [{ id: 'std-1' }];
      
      // Populate cache
      mockedAxios.get.mockResolvedValue({ data: standardsData });
      await fetchStandards();
      
      // Clear cache
      clearStandardsCache();
      
      // Should make a new API call
      await fetchStandards();
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
}); 