/**
 * Voltage Drop Calculation Caching Utilities
 * 
 * This module provides utility functions for caching expensive voltage drop calculations
 * to improve performance when dealing with complex or repeated calculations.
 */

import { VoltageDropInputs, VoltageDropResult } from './voltageDropUtils';

/**
 * Cache storage for voltage drop calculations
 */
type VoltageDropCache = {
  [key: string]: VoltageDropResult;
};

// In-memory cache for voltage drop calculations
const calculationCache: VoltageDropCache = {};

/**
 * Generate a cache key for voltage drop inputs
 * 
 * @param inputs Voltage drop calculation inputs
 * @returns A unique string hash for the inputs
 */
export function generateCacheKey(inputs: VoltageDropInputs): string {
  // Create a simplified object with only the properties that affect calculation
  const cacheObject = {
    systemVoltage: inputs.systemVoltage,
    loadCurrent: inputs.loadCurrent,
    conductorLength: inputs.conductorLength,
    conductorSize: inputs.conductorSize,
    conductorMaterial: inputs.conductorMaterial,
    conduitMaterial: inputs.conduitMaterial,
    phaseConfiguration: inputs.phaseConfiguration,
    temperature: inputs.temperature,
    powerFactor: inputs.powerFactor || 0.85,
    circuitType: inputs.circuitConfiguration.circuitType,
    distanceToFurthestOutlet: inputs.circuitConfiguration.distanceToFurthestOutlet,
    startingCurrentMultiplier: inputs.circuitConfiguration.startingCurrentMultiplier,
    serviceFactor: inputs.circuitConfiguration.serviceFactor,
    hasVFD: inputs.circuitConfiguration.hasVFD,
    wireway: inputs.circuitConfiguration.wireway
  };
  
  // Create hash by JSON stringifying the object
  return JSON.stringify(cacheObject);
}

/**
 * Check if a calculation result is cached
 * 
 * @param inputs Voltage drop calculation inputs
 * @returns True if the calculation is cached
 */
export function isCached(inputs: VoltageDropInputs): boolean {
  const cacheKey = generateCacheKey(inputs);
  return cacheKey in calculationCache;
}

/**
 * Get a cached voltage drop calculation result
 * 
 * @param inputs Voltage drop calculation inputs
 * @returns Cached result or null if not found
 */
export function getCachedResult(inputs: VoltageDropInputs): VoltageDropResult | null {
  const cacheKey = generateCacheKey(inputs);
  return calculationCache[cacheKey] || null;
}

/**
 * Cache a voltage drop calculation result
 * 
 * @param inputs Voltage drop calculation inputs
 * @param result Voltage drop calculation result
 */
export function cacheResult(inputs: VoltageDropInputs, result: VoltageDropResult): void {
  const cacheKey = generateCacheKey(inputs);
  calculationCache[cacheKey] = { ...result };
}

/**
 * Clear the voltage drop calculation cache
 */
export function clearCache(): void {
  Object.keys(calculationCache).forEach(key => {
    delete calculationCache[key];
  });
}

/**
 * Get the number of cached results
 * 
 * @returns Number of cached calculations
 */
export function getCacheSize(): number {
  return Object.keys(calculationCache).length;
}

/**
 * Higher-order function that memoizes a voltage drop calculation function
 * 
 * @param calculationFn The function to memoize (must take VoltageDropInputs and return VoltageDropResult)
 * @returns A memoized version of the function
 */
export function memoizeCalculation(
  calculationFn: (inputs: VoltageDropInputs) => VoltageDropResult
): (inputs: VoltageDropInputs) => VoltageDropResult {
  return (inputs: VoltageDropInputs) => {
    // Check if result is already cached
    const cachedResult = getCachedResult(inputs);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Calculate and cache the result
    const result = calculationFn(inputs);
    cacheResult(inputs, result);
    
    return result;
  };
} 