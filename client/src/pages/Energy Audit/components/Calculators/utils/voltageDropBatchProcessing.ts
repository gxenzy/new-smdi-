/**
 * Voltage Drop Batch Processing Utilities
 * 
 * This module provides functionality for processing multiple voltage drop calculations
 * in batches to improve performance for complex scenarios.
 */

import { VoltageDropInputs, VoltageDropResult, CircuitConfiguration, calculateVoltageDropResults } from './voltageDropUtils';

/**
 * Interface for batch calculation job
 */
export interface BatchCalculationJob {
  id: string;
  inputs: VoltageDropInputs;
  result?: VoltageDropResult;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * Interface for batch calculation result
 */
export interface BatchCalculationResult {
  jobId: string;
  result: VoltageDropResult;
}

/**
 * Batch calculation options
 */
export interface BatchProcessingOptions {
  concurrentJobs?: number;
  prioritizeJobs?: boolean;
  onProgress?: (completedJobs: number, totalJobs: number) => void;
  onJobComplete?: (result: BatchCalculationResult) => void;
}

/**
 * Default batch processing options
 */
const DEFAULT_OPTIONS: BatchProcessingOptions = {
  concurrentJobs: 4,
  prioritizeJobs: false
};

/**
 * Process multiple voltage drop calculations in batches
 * 
 * @param jobs Array of batch calculation jobs
 * @param options Batch processing options
 * @returns Promise that resolves when all jobs are complete
 */
export async function processBatch(
  jobs: BatchCalculationJob[],
  options: BatchProcessingOptions = {}
): Promise<BatchCalculationResult[]> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { concurrentJobs = 4, onProgress, onJobComplete } = mergedOptions;
  
  const results: BatchCalculationResult[] = [];
  const totalJobs = jobs.length;
  let completedJobs = 0;
  
  // Create a copy of the jobs array to avoid modifying the original
  const pendingJobs = [...jobs];
  
  // Process jobs in batches
  const processNextBatch = async () => {
    // Get next batch of jobs
    const batch = pendingJobs.splice(0, concurrentJobs);
    if (batch.length === 0) return;
    
    // Process jobs in parallel
    const batchPromises = batch.map(async (job) => {
      try {
        // Update job status
        job.status = 'processing';
        
        // Perform calculation
        const result = calculateVoltageDropResults(job.inputs);
        
        // Update job with result
        job.result = result;
        job.status = 'completed';
        
        // Create batch result
        const batchResult: BatchCalculationResult = {
          jobId: job.id,
          result
        };
        
        // Add to results
        results.push(batchResult);
        
        // Call job complete callback if provided
        if (onJobComplete) {
          onJobComplete(batchResult);
        }
      } catch (error) {
        // Update job with error
        job.status = 'error';
        job.error = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        // Update progress
        completedJobs++;
        if (onProgress) {
          onProgress(completedJobs, totalJobs);
        }
      }
    });
    
    // Wait for batch to complete
    await Promise.all(batchPromises);
    
    // Process next batch if there are more jobs
    if (pendingJobs.length > 0) {
      await processNextBatch();
    }
  };
  
  // Start processing
  await processNextBatch();
  
  return results;
}

/**
 * Create a batch of voltage drop calculation jobs
 * 
 * @param baseInputs Base inputs to use for all jobs
 * @param variations Array of objects with properties to vary for each job
 * @returns Array of batch calculation jobs
 */
export function createBatchJobs(
  baseInputs: VoltageDropInputs,
  variations: Partial<Omit<VoltageDropInputs, 'circuitConfiguration'> & { 
    circuitConfiguration?: Partial<CircuitConfiguration> 
  }>[]
): BatchCalculationJob[] {
  return variations.map((variation, index) => {
    // Create merged circuit configuration
    const circuitConfiguration = variation.circuitConfiguration 
      ? { ...baseInputs.circuitConfiguration, ...variation.circuitConfiguration }
      : baseInputs.circuitConfiguration;
    
    // Merge base inputs with variation (excluding circuitConfiguration)
    const { circuitConfiguration: _, ...variationWithoutCircuitConfig } = variation as any;
    
    // Create final merged inputs
    const inputs: VoltageDropInputs = {
      ...baseInputs,
      ...variationWithoutCircuitConfig,
      circuitConfiguration
    };
    
    return {
      id: `job-${index + 1}`,
      inputs,
      status: 'pending'
    };
  });
}

/**
 * Helper function to create conductor size variations
 * 
 * @param baseInputs Base inputs
 * @param conductorSizes Array of conductor sizes to vary
 * @returns Array of batch calculation jobs with different conductor sizes
 */
export function createConductorSizeVariations(
  baseInputs: VoltageDropInputs,
  conductorSizes: string[]
): BatchCalculationJob[] {
  const variations = conductorSizes.map(size => ({
    conductorSize: size
  }));
  
  return createBatchJobs(baseInputs, variations);
}

/**
 * Helper function to create conductor length variations
 * 
 * @param baseInputs Base inputs
 * @param minLength Minimum conductor length
 * @param maxLength Maximum conductor length
 * @param steps Number of steps between min and max
 * @returns Array of batch calculation jobs with different conductor lengths
 */
export function createConductorLengthVariations(
  baseInputs: VoltageDropInputs,
  minLength: number,
  maxLength: number,
  steps: number
): BatchCalculationJob[] {
  const variations: Partial<VoltageDropInputs>[] = [];
  const stepSize = (maxLength - minLength) / (steps - 1);
  
  for (let i = 0; i < steps; i++) {
    const conductorLength = minLength + stepSize * i;
    variations.push({ conductorLength });
  }
  
  return createBatchJobs(baseInputs, variations);
} 