import {
  generateCacheKey,
  isCached,
  getCachedResult,
  cacheResult,
  clearCache,
  getCacheSize,
  memoizeCalculation
} from '../utils/voltageDropCaching';
import { VoltageDropInputs, VoltageDropResult, CircuitType } from '../utils/voltageDropUtils';

describe('Voltage Drop Caching Utilities', () => {
  // Sample inputs and results for testing
  const sampleInputs: VoltageDropInputs = {
    systemVoltage: 230,
    loadCurrent: 20,
    conductorLength: 50,
    conductorSize: '12 AWG',
    conductorMaterial: 'copper',
    conduitMaterial: 'PVC',
    phaseConfiguration: 'single-phase',
    temperature: 30,
    powerFactor: 0.85,
    circuitConfiguration: {
      circuitType: 'branch' as CircuitType,
      wireway: 'conduit'
    }
  };
  
  const sampleResult: VoltageDropResult = {
    voltageDrop: 3.45,
    voltageDropPercent: 1.5,
    receivingEndVoltage: 226.55,
    resistiveLoss: 69,
    reactiveLoss: 23,
    totalLoss: 72.8,
    compliance: 'compliant',
    maxAllowedDrop: 3.0,
    recommendations: ['The voltage drop is within acceptable limits.'],
    wireRating: {
      ampacity: 20,
      isAdequate: true
    }
  };
  
  // Clear cache before each test
  beforeEach(() => {
    clearCache();
  });
  
  describe('generateCacheKey', () => {
    test('should generate consistent keys for identical inputs', () => {
      const key1 = generateCacheKey(sampleInputs);
      const key2 = generateCacheKey({ ...sampleInputs });
      expect(key1).toBe(key2);
    });
    
    test('should generate different keys for different inputs', () => {
      const key1 = generateCacheKey(sampleInputs);
      const key2 = generateCacheKey({
        ...sampleInputs,
        loadCurrent: 25 // Different load current
      });
      expect(key1).not.toBe(key2);
    });
  });
  
  describe('cache operations', () => {
    test('should store and retrieve results correctly', () => {
      // Initially not cached
      expect(isCached(sampleInputs)).toBe(false);
      expect(getCachedResult(sampleInputs)).toBeNull();
      
      // Cache the result
      cacheResult(sampleInputs, sampleResult);
      
      // Now should be cached
      expect(isCached(sampleInputs)).toBe(true);
      expect(getCachedResult(sampleInputs)).toEqual(sampleResult);
      expect(getCacheSize()).toBe(1);
    });
    
    test('clearCache should remove all cached results', () => {
      // Add multiple cache entries
      cacheResult(sampleInputs, sampleResult);
      cacheResult({ ...sampleInputs, loadCurrent: 25 }, { ...sampleResult, voltageDropPercent: 2.0 });
      
      expect(getCacheSize()).toBe(2);
      
      // Clear cache
      clearCache();
      
      expect(getCacheSize()).toBe(0);
      expect(isCached(sampleInputs)).toBe(false);
    });
  });
  
  describe('memoizeCalculation', () => {
    test('should memoize calculation function correctly', () => {
      // Mock calculation function that counts calls
      let callCount = 0;
      const mockCalculation = (inputs: VoltageDropInputs): VoltageDropResult => {
        callCount++;
        return sampleResult;
      };
      
      // Create memoized version
      const memoizedCalculation = memoizeCalculation(mockCalculation);
      
      // First call should execute the function
      const result1 = memoizedCalculation(sampleInputs);
      expect(result1).toEqual(sampleResult);
      expect(callCount).toBe(1);
      
      // Second call with same inputs should use cached result
      const result2 = memoizedCalculation(sampleInputs);
      expect(result2).toEqual(sampleResult);
      expect(callCount).toBe(1); // Still 1, didn't call again
      
      // Call with different inputs should execute the function again
      const differentInputs = { ...sampleInputs, loadCurrent: 30 };
      const result3 = memoizedCalculation(differentInputs);
      expect(result3).toEqual(sampleResult);
      expect(callCount).toBe(2); // Incremented to 2
    });
  });
}); 