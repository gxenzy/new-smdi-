/**
 * Visualization Optimizer Utilities
 * 
 * This module provides utilities for optimizing chart visualizations
 * through techniques like data downsampling, progressive rendering,
 * and performance optimizations.
 */

import { VoltageDropResult, VoltageDropInputs } from './voltageDropUtils';

/**
 * Interface for data point with distance and value
 */
interface DataPoint {
  x: number;
  y: number;
  [key: string]: any;
}

/**
 * Options for downsampling data
 */
export interface DownsampleOptions {
  maxPoints?: number;
  preserveExtremes?: boolean;
  preserveShape?: boolean;
  algorithm?: 'lttb' | 'min-max' | 'every-nth';
}

/**
 * Downsample a large dataset to a smaller number of points
 * using the Largest-Triangle-Three-Buckets algorithm.
 * 
 * This algorithm preserves the visual shape of the data.
 * 
 * @param data - Original data points array
 * @param threshold - Target number of data points
 * @returns Downsampled data points
 */
export function lttbDownsample(data: DataPoint[], threshold: number): DataPoint[] {
  const dataLength = data.length;
  
  // If we have fewer points than the threshold, return all points
  if (threshold >= dataLength || threshold === 0) {
    return data;
  }
  
  // Bucket size
  const bucketSize = (dataLength - 2) / (threshold - 2);
  
  // Always include first and last points
  const sampled: DataPoint[] = [data[0]];
  
  // Process buckets
  for (let i = 1; i < threshold - 1; i++) {
    // Calculate current bucket range
    const startIdx = Math.floor((i - 1) * bucketSize) + 1;
    const endIdx = Math.floor(i * bucketSize) + 1;
    const rangeBuckets = data.slice(startIdx, endIdx);
    
    // Get the point from the previous bucket we retained
    const prevPoint = sampled[sampled.length - 1];
    // Get the point from the next bucket we will always retain (last bucket)
    const nextPoint = data[Math.floor(i * bucketSize) + 1];
    
    // Find the point in this bucket that forms the largest triangle
    let maxArea = -1;
    let maxAreaIndex = startIdx;
    
    for (let j = startIdx; j < endIdx; j++) {
      // Calculate triangle area using the formula 0.5 * |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)|
      const area = Math.abs(
        (prevPoint.x * (data[j].y - nextPoint.y) +
        data[j].x * (nextPoint.y - prevPoint.y) +
        nextPoint.x * (prevPoint.y - data[j].y)) * 0.5
      );
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    // Add the point with the largest triangle to our sampled set
    sampled.push(data[maxAreaIndex]);
  }
  
  // Always add the last point
  sampled.push(data[dataLength - 1]);
  
  return sampled;
}

/**
 * Downsample data by taking every nth point, plus extremes (min/max)
 * 
 * @param data - Original data points array
 * @param threshold - Target number of data points
 * @returns Downsampled data points
 */
export function minMaxDownsample(data: DataPoint[], threshold: number): DataPoint[] {
  const dataLength = data.length;
  
  // If we have fewer points than the threshold, return all points
  if (threshold >= dataLength || threshold === 0) {
    return data;
  }
  
  // Always include first and last points
  const sampled: DataPoint[] = [data[0]];
  
  // Find min and max points
  let minPoint = data[0];
  let maxPoint = data[0];
  
  for (let i = 1; i < dataLength - 1; i++) {
    if (data[i].y < minPoint.y) minPoint = data[i];
    if (data[i].y > maxPoint.y) maxPoint = data[i];
  }
  
  // Add min and max if they're not the first or last point
  if (minPoint !== data[0] && minPoint !== data[dataLength - 1]) {
    sampled.push(minPoint);
  }
  
  if (maxPoint !== data[0] && maxPoint !== data[dataLength - 1] && maxPoint !== minPoint) {
    sampled.push(maxPoint);
  }
  
  // Number of points we still need to sample
  const remainingPoints = threshold - sampled.length - 1; // -1 for the last point
  
  // Calculate step size
  const step = Math.max(1, Math.floor((dataLength - 2) / remainingPoints));
  
  // Add evenly spaced points
  for (let i = step; i < dataLength - 1; i += step) {
    // Skip if this point is already in our set (min or max)
    if (data[i] !== minPoint && data[i] !== maxPoint) {
      sampled.push(data[i]);
    }
    
    // Stop if we've reached our threshold
    if (sampled.length >= threshold - 1) break;
  }
  
  // Add the last point
  sampled.push(data[dataLength - 1]);
  
  // Sort by x-value to maintain original order
  return sampled.sort((a, b) => a.x - b.x);
}

/**
 * Downsample a voltage drop profile to optimize chart rendering
 * 
 * @param result - Voltage drop calculation result
 * @param inputs - Voltage drop calculation inputs
 * @param options - Downsampling options
 * @returns Downsampled points for visualization
 */
export function downsampleVoltageProfile(
  result: VoltageDropResult,
  inputs: VoltageDropInputs,
  options: DownsampleOptions = {}
): { labels: string[]; voltageValues: number[]; distanceValues: number[] } {
  const {
    maxPoints = 50,
    preserveExtremes = true,
    algorithm = 'lttb'
  } = options;
  
  // Generate full dataset
  const numOriginalPoints = Math.min(inputs.conductorLength * 2, 200); // cap at 200 points to avoid slowdown
  const stepSize = inputs.conductorLength / numOriginalPoints;
  
  const fullDataset: DataPoint[] = Array.from({ length: numOriginalPoints + 1 }, (_, i) => {
    const distance = i * stepSize;
    const voltageDrop = (distance / inputs.conductorLength) * result.voltageDrop;
    return {
      x: distance,
      y: inputs.systemVoltage - voltageDrop,
      original: true
    };
  });
  
  // Apply downsampling algorithm
  let sampledData: DataPoint[];
  
  switch (algorithm) {
    case 'lttb':
      sampledData = lttbDownsample(fullDataset, maxPoints);
      break;
    case 'min-max':
      sampledData = minMaxDownsample(fullDataset, maxPoints);
      break;
    case 'every-nth':
      const step = Math.max(1, Math.floor(fullDataset.length / maxPoints));
      sampledData = [fullDataset[0]];
      for (let i = step; i < fullDataset.length - 1; i += step) {
        sampledData.push(fullDataset[i]);
      }
      sampledData.push(fullDataset[fullDataset.length - 1]);
      break;
    default:
      sampledData = fullDataset;
  }
  
  // Extract values and labels
  return {
    labels: sampledData.map(p => `${p.x.toFixed(0)}m`),
    voltageValues: sampledData.map(p => p.y),
    distanceValues: sampledData.map(p => p.x)
  };
}

/**
 * Estimate the reasonable number of data points based on the
 * container width and chart complexity
 * 
 * @param containerWidth - Width of the chart container in pixels
 * @param dataComplexity - Complexity factor (higher value = more detail needed)
 * @returns Recommended number of data points
 */
export function estimateOptimalPointCount(
  containerWidth: number,
  dataComplexity: number = 1
): number {
  // Base calculation:
  // - Aim for ~1 data point per 10px of width as a starting point
  // - Adjust based on complexity factor
  // - Apply min/max limits
  
  const basePointCount = Math.floor(containerWidth / 10);
  const adjustedCount = Math.floor(basePointCount * dataComplexity);
  
  // Apply reasonable limits
  return Math.max(20, Math.min(200, adjustedCount));
} 