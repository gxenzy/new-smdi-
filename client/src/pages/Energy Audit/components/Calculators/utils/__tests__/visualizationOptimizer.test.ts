import {
  lttbDownsample,
  minMaxDownsample,
  downsampleVoltageProfile,
  estimateOptimalPointCount
} from '../visualizationOptimizer';
import { VoltageDropInputs, VoltageDropResult } from '../voltageDropUtils';

describe('Visualization Optimizer Utilities', () => {
  describe('lttbDownsample', () => {
    test('returns original data if threshold is greater than or equal to data length', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ];
      
      const result = lttbDownsample(data, 5);
      
      expect(result).toBe(data);
    });
    
    test('downsamples data to specified threshold', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i * 0.1)
      }));
      
      const threshold = 20;
      const result = lttbDownsample(data, threshold);
      
      expect(result.length).toBe(threshold);
      expect(result[0]).toBe(data[0]); // First point should be preserved
      expect(result[result.length - 1]).toBe(data[data.length - 1]); // Last point should be preserved
    });
  });

  describe('minMaxDownsample', () => {
    test('preserves min and max values', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i * 0.1)
      }));
      
      // Find min and max points in original data
      let minPoint = data[0];
      let maxPoint = data[0];
      
      for (const point of data) {
        if (point.y < minPoint.y) minPoint = point;
        if (point.y > maxPoint.y) maxPoint = point;
      }
      
      const threshold = 20;
      const result = minMaxDownsample(data, threshold);
      
      expect(result.length).toBe(threshold);
      
      // Check if min and max points are included
      const resultContainsMin = result.some(p => p.y === minPoint.y);
      const resultContainsMax = result.some(p => p.y === maxPoint.y);
      
      expect(resultContainsMin).toBe(true);
      expect(resultContainsMax).toBe(true);
    });
  });

  describe('downsampleVoltageProfile', () => {
    test('generates and downsamples voltage profile data correctly', () => {
      // Mock voltage drop inputs and results
      const inputs: VoltageDropInputs = {
        systemVoltage: 230,
        loadCurrent: 20,
        conductorLength: 100,
        conductorSize: '12 AWG',
        conductorMaterial: 'copper',
        conduitMaterial: 'PVC',
        phaseConfiguration: 'single-phase',
        temperature: 30,
        powerFactor: 0.85,
        circuitConfiguration: {
          circuitType: 'branch',
          wireway: 'conduit'
        }
      };
      
      const results: VoltageDropResult = {
        voltageDrop: 10,
        voltageDropPercent: 4.35,
        receivingEndVoltage: 220,
        resistiveLoss: 200,
        reactiveLoss: 50,
        totalLoss: 250,
        compliance: 'compliant',
        maxAllowedDrop: 5,
        recommendations: [],
        wireRating: {
          ampacity: 25,
          isAdequate: true
        }
      };
      
      // Test with LTTB algorithm
      const lttbResult = downsampleVoltageProfile(results, inputs, {
        maxPoints: 30,
        algorithm: 'lttb'
      });
      
      expect(lttbResult.labels.length).toBe(30);
      expect(lttbResult.voltageValues.length).toBe(30);
      expect(lttbResult.distanceValues.length).toBe(30);
      
      // Test with min-max algorithm
      const minMaxResult = downsampleVoltageProfile(results, inputs, {
        maxPoints: 25,
        algorithm: 'min-max'
      });
      
      expect(minMaxResult.labels.length).toBe(25);
      
      // Test with every-nth algorithm
      const everyNthResult = downsampleVoltageProfile(results, inputs, {
        maxPoints: 20,
        algorithm: 'every-nth'
      });
      
      expect(everyNthResult.labels.length).toBe(20);
    });
  });

  describe('estimateOptimalPointCount', () => {
    test('returns reasonable point counts based on container width', () => {
      // Small container
      expect(estimateOptimalPointCount(300)).toBeLessThanOrEqual(50);
      
      // Medium container
      expect(estimateOptimalPointCount(600)).toBeGreaterThan(30);
      
      // Large container
      expect(estimateOptimalPointCount(1200)).toBeGreaterThan(50);
      
      // Very large container should still have a reasonable limit
      expect(estimateOptimalPointCount(3000)).toBeLessThanOrEqual(300);
      
      // Complexity factor should affect point count
      expect(estimateOptimalPointCount(500, 2)).toBeGreaterThan(
        estimateOptimalPointCount(500, 1)
      );
    });
  });
}); 