import {
  Fixture,
  RoomData,
  calculateTotalLightingPower,
  calculateLPD,
  checkCompliance,
  generateRecommendations,
  calculateLPDResults,
  BUILDING_TYPES
} from '../';
import { BuildingStandardsType } from '../standards';

// Mock the standards module
jest.mock('../standards', () => ({
  fetchLPDStandards: jest.fn().mockResolvedValue({
    office: { label: 'Office', maxLPD: 10.5 },
    classroom: { label: 'Classroom', maxLPD: 10.5 }
  })
}));

describe('Lighting Power Density Utilities', () => {
  // Sample fixtures for testing
  const testFixtures: Fixture[] = [
    { id: 'fixture-1', name: 'LED Panel', wattage: 45, ballastFactor: 1.0, quantity: 4 },
    { id: 'fixture-2', name: 'T8 Fluorescent', wattage: 32, ballastFactor: 0.88, quantity: 6 }
  ];

  // Sample room data for testing
  const testRoomData: RoomData = {
    name: 'Test Room',
    area: 100,
    buildingType: 'office',
    fixtures: testFixtures
  };

  describe('calculateTotalLightingPower', () => {
    it('should correctly calculate total power for multiple fixtures', () => {
      // Expected: (45 * 1.0 * 4) + (32 * 0.88 * 6) = 180 + 168.96 = 348.96
      const result = calculateTotalLightingPower(testFixtures);
      expect(result).toBeCloseTo(348.96, 2);
    });

    it('should return 0 for empty fixtures array', () => {
      const result = calculateTotalLightingPower([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateLPD', () => {
    it('should calculate LPD by dividing total wattage by area', () => {
      // 348.96 watts / 100 sq meters = 3.4896 W/m²
      const result = calculateLPD(348.96, 100);
      expect(result).toBeCloseTo(3.4896, 4);
    });

    it('should throw error for zero area', () => {
      expect(() => calculateLPD(100, 0)).toThrow('Room area must be greater than zero');
    });

    it('should throw error for negative area', () => {
      expect(() => calculateLPD(100, -10)).toThrow('Room area must be greater than zero');
    });
  });

  describe('checkCompliance', () => {
    it('should return true when LPD is below standard', () => {
      // Office standard is 10.5 W/m²
      expect(checkCompliance(8.5, 'office')).toBe(true);
    });

    it('should return true when LPD is equal to standard', () => {
      expect(checkCompliance(10.5, 'office')).toBe(true);
    });

    it('should return false when LPD exceeds standard', () => {
      expect(checkCompliance(12.0, 'office')).toBe(false);
    });

    it('should throw error for unknown building type', () => {
      expect(() => checkCompliance(5.0, 'invalidType')).toThrow('Unknown building type: invalidType');
    });
  });

  describe('generateRecommendations', () => {
    it('should provide recommendations for non-compliant results', () => {
      const nonCompliantResult = {
        totalWattage: 1200,
        lpd: 12.0,
        isCompliant: false,
        standardLPD: 10.5,
        buildingTypeLabel: 'Office',
        recommendations: []
      };

      const recommendations = generateRecommendations(nonCompliantResult);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toContain('exceeds the Office standard');
    });

    it('should provide recommendations for compliant results', () => {
      const compliantResult = {
        totalWattage: 800,
        lpd: 8.0,
        isCompliant: true,
        standardLPD: 10.5,
        buildingTypeLabel: 'Office',
        recommendations: []
      };

      const recommendations = generateRecommendations(compliantResult);
      
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should suggest different recommendations based on how much the LPD exceeds the standard', () => {
      // Just slightly exceeding
      const slightlyOver = {
        totalWattage: 1100,
        lpd: 11.0,
        isCompliant: false,
        standardLPD: 10.5,
        buildingTypeLabel: 'Office',
        recommendations: []
      };
      
      // Moderately exceeding (over 15%)
      const moderatelyOver = {
        totalWattage: 1300,
        lpd: 13.0,
        isCompliant: false,
        standardLPD: 10.5,
        buildingTypeLabel: 'Office',
        recommendations: []
      };
      
      // Significantly exceeding (over 30%)
      const significantlyOver = {
        totalWattage: 1500,
        lpd: 15.0,
        isCompliant: false,
        standardLPD: 10.5,
        buildingTypeLabel: 'Office',
        recommendations: []
      };
      
      const slightRecommendations = generateRecommendations(slightlyOver);
      const moderateRecommendations = generateRecommendations(moderatelyOver);
      const significantRecommendations = generateRecommendations(significantlyOver);
      
      // Should have different second recommendations
      expect(slightRecommendations[1]).not.toEqual(moderateRecommendations[1]);
      expect(moderateRecommendations[1]).not.toEqual(significantRecommendations[1]);
    });
  });

  describe('calculateLPDResults', () => {
    it('should calculate comprehensive results for valid room data', async () => {
      const results = await calculateLPDResults(testRoomData);
      
      expect(results.totalWattage).toBeCloseTo(348.96, 2);
      expect(results.lpd).toBeCloseTo(3.4896, 4);
      expect(results.isCompliant).toBe(true);
      expect(results.standardLPD).toBe(10.5);
      expect(results.buildingTypeLabel).toBe('Office');
      expect(results.recommendations.length).toBeGreaterThan(0);
    });

    it('should throw error when area is zero', async () => {
      const invalidData = { ...testRoomData, area: 0 };
      await expect(calculateLPDResults(invalidData)).rejects.toThrow('Room area must be greater than zero');
    });

    it('should throw error when no fixtures are provided', async () => {
      const invalidData = { ...testRoomData, fixtures: [] };
      await expect(calculateLPDResults(invalidData)).rejects.toThrow('At least one fixture is required for calculation');
    });

    it('should throw error for unknown building type', async () => {
      const invalidData = { ...testRoomData, buildingType: 'unknownType' };
      await expect(calculateLPDResults(invalidData)).rejects.toThrow('Unknown building type: unknownType');
    });
  });

  describe('Building types constants', () => {
    it('should include all required building types with correct max LPD values', () => {
      expect(BUILDING_TYPES.office.maxLPD).toBe(10.5);
      expect(BUILDING_TYPES.classroom.maxLPD).toBe(10.5);
      expect(BUILDING_TYPES.hospital.maxLPD).toBe(11.2);
      expect(BUILDING_TYPES.retail.maxLPD).toBe(14.5);
      expect(BUILDING_TYPES.warehouse.maxLPD).toBe(8.0);
      
      // Each building type should have a label property
      Object.entries(BUILDING_TYPES).forEach(([key, value]) => {
        const typeValue = value as {label: string, maxLPD: number};
        expect(typeValue).toHaveProperty('label');
        expect(typeValue).toHaveProperty('maxLPD');
        expect(typeof typeValue.label).toBe('string');
        expect(typeof typeValue.maxLPD).toBe('number');
      });
    });
  });
}); 