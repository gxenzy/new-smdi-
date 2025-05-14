import {
  processBatch,
  createBatchJobs,
  createConductorSizeVariations,
  createConductorLengthVariations,
  BatchCalculationJob
} from '../utils/voltageDropBatchProcessing';
import { VoltageDropInputs, CircuitType, CircuitConfiguration } from '../utils/voltageDropUtils';

describe('Voltage Drop Batch Processing Utilities', () => {
  // Sample base inputs for testing
  const baseInputs: VoltageDropInputs = {
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
  
  describe('createBatchJobs', () => {
    test('should create correct number of jobs with proper variations', () => {
      const variations = [
        { conductorSize: '10 AWG' },
        { conductorSize: '8 AWG' },
        { conductorSize: '6 AWG' }
      ];
      
      const jobs = createBatchJobs(baseInputs, variations);
      
      expect(jobs.length).toBe(3);
      expect(jobs[0].inputs.conductorSize).toBe('10 AWG');
      expect(jobs[1].inputs.conductorSize).toBe('8 AWG');
      expect(jobs[2].inputs.conductorSize).toBe('6 AWG');
      
      // All other properties should match base inputs
      expect(jobs[0].inputs.systemVoltage).toBe(baseInputs.systemVoltage);
      expect(jobs[0].inputs.loadCurrent).toBe(baseInputs.loadCurrent);
    });
    
    test('should correctly merge circuit configuration', () => {
      const variations = [
        { 
          circuitConfiguration: { 
            distanceToFurthestOutlet: 100 
          }
        }
      ];
      
      const jobs = createBatchJobs(baseInputs, variations);
      
      expect(jobs[0].inputs.circuitConfiguration.circuitType).toBe('branch');
      expect(jobs[0].inputs.circuitConfiguration.distanceToFurthestOutlet).toBe(100);
      expect(jobs[0].inputs.circuitConfiguration.wireway).toBe('conduit');
    });
  });
  
  describe('createConductorSizeVariations', () => {
    test('should create jobs with different conductor sizes', () => {
      const conductorSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG'];
      
      const jobs = createConductorSizeVariations(baseInputs, conductorSizes);
      
      expect(jobs.length).toBe(4);
      expect(jobs[0].inputs.conductorSize).toBe('14 AWG');
      expect(jobs[1].inputs.conductorSize).toBe('12 AWG');
      expect(jobs[2].inputs.conductorSize).toBe('10 AWG');
      expect(jobs[3].inputs.conductorSize).toBe('8 AWG');
    });
  });
  
  describe('createConductorLengthVariations', () => {
    test('should create jobs with evenly spaced conductor lengths', () => {
      const minLength = 10;
      const maxLength = 50;
      const steps = 5;
      
      const jobs = createConductorLengthVariations(baseInputs, minLength, maxLength, steps);
      
      expect(jobs.length).toBe(5);
      expect(jobs[0].inputs.conductorLength).toBe(10);
      expect(jobs[1].inputs.conductorLength).toBe(20);
      expect(jobs[2].inputs.conductorLength).toBe(30);
      expect(jobs[3].inputs.conductorLength).toBe(40);
      expect(jobs[4].inputs.conductorLength).toBe(50);
    });
  });
  
  describe('processBatch', () => {
    test('should process all jobs and return results', async () => {
      const variations = [
        { conductorSize: '14 AWG' },
        { conductorSize: '12 AWG' },
        { conductorSize: '10 AWG' }
      ];
      
      const jobs = createBatchJobs(baseInputs, variations);
      
      // Mock progress callback
      const onProgress = jest.fn();
      
      const results = await processBatch(jobs, { onProgress });
      
      // Should have results for all jobs
      expect(results.length).toBe(3);
      
      // Progress callback should be called for each job
      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenLastCalledWith(3, 3);
      
      // Check if all jobs have been updated
      expect(jobs[0].status).toBe('completed');
      expect(jobs[1].status).toBe('completed');
      expect(jobs[2].status).toBe('completed');
      
      // Results should have different voltage drops due to different conductor sizes
      expect(results[0].result.voltageDropPercent).not.toBe(results[1].result.voltageDropPercent);
      expect(results[1].result.voltageDropPercent).not.toBe(results[2].result.voltageDropPercent);
    });
    
    test('should handle job completion callbacks', async () => {
      const jobs = createConductorSizeVariations(baseInputs, ['14 AWG', '12 AWG']);
      
      // Mock job complete callback
      const onJobComplete = jest.fn();
      
      await processBatch(jobs, { onJobComplete });
      
      // Job complete callback should be called for each job
      expect(onJobComplete).toHaveBeenCalledTimes(2);
      expect(onJobComplete.mock.calls[0][0]).toHaveProperty('jobId', 'job-1');
      expect(onJobComplete.mock.calls[1][0]).toHaveProperty('jobId', 'job-2');
    });
  });
}); 