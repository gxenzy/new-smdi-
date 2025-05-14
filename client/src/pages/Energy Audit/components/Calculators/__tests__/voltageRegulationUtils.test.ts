import {
  calculateVoltageDrop,
  calculateVoltageDropPercentage,
  calculatePowerLoss,
  calculateVoltageRegulation,
  findMinimumConductorSize,
  VoltageRegulationInputs
} from '../utils/voltageRegulationUtils';

describe('Voltage Regulation Utilities', () => {
  // Standard test input values
  const singlePhaseInputs: VoltageRegulationInputs = {
    systemVoltage: 230,
    loadPower: 2000,
    powerFactor: 0.85,
    conductorLength: 100,
    conductorSize: '12 AWG',
    conductorMaterial: 'copper',
    conduitMaterial: 'PVC',
    phaseConfiguration: 'single-phase',
    temperature: 30
  };

  const threePhaseInputs: VoltageRegulationInputs = {
    ...singlePhaseInputs,
    systemVoltage: 400,
    phaseConfiguration: 'three-phase'
  };

  describe('calculateVoltageDrop', () => {
    test('should calculate voltage drop for single-phase circuit', () => {
      const voltageDrop = calculateVoltageDrop(singlePhaseInputs);
      
      // Expect a reasonable voltage drop value (can be verified by hand calculation)
      expect(voltageDrop).toBeGreaterThan(0);
      expect(voltageDrop).toBeLessThan(singlePhaseInputs.systemVoltage); // Drop should be less than system voltage
    });

    test('should calculate voltage drop for three-phase circuit', () => {
      const voltageDrop = calculateVoltageDrop(threePhaseInputs);
      
      // Verify the drop is within reasonable limits
      expect(voltageDrop).toBeGreaterThan(0);
      expect(voltageDrop).toBeLessThan(threePhaseInputs.systemVoltage);
    });

    test('should increase voltage drop with increased conductor length', () => {
      const standardDrop = calculateVoltageDrop(singlePhaseInputs);
      const longerDrop = calculateVoltageDrop({
        ...singlePhaseInputs,
        conductorLength: singlePhaseInputs.conductorLength * 2
      });
      
      // Double length should approximately double voltage drop
      expect(longerDrop).toBeGreaterThan(standardDrop * 1.9); // Allow for some flexibility in calculation
      expect(longerDrop).toBeLessThan(standardDrop * 2.1);
    });

    test('should decrease voltage drop with increased conductor size', () => {
      const smallerSizeDrop = calculateVoltageDrop(singlePhaseInputs);
      const largerSizeDrop = calculateVoltageDrop({
        ...singlePhaseInputs,
        conductorSize: '8 AWG' // Larger size
      });
      
      // Larger size should decrease voltage drop
      expect(largerSizeDrop).toBeLessThan(smallerSizeDrop);
    });
  });

  describe('calculateVoltageDropPercentage', () => {
    test('should calculate percentage voltage drop', () => {
      const voltageDrop = calculateVoltageDrop(singlePhaseInputs);
      const expectedPercentage = (voltageDrop / singlePhaseInputs.systemVoltage) * 100;
      const calculatedPercentage = calculateVoltageDropPercentage(singlePhaseInputs);
      
      expect(calculatedPercentage).toBeCloseTo(expectedPercentage, 5);
    });
  });

  describe('calculatePowerLoss', () => {
    test('should calculate power losses for a circuit', () => {
      const { resistiveLoss, reactiveLoss, totalLoss } = calculatePowerLoss(singlePhaseInputs);
      
      // Verify the losses are positive values
      expect(resistiveLoss).toBeGreaterThan(0);
      expect(reactiveLoss).toBeGreaterThan(0);
      expect(totalLoss).toBeGreaterThan(0);
      
      // Total loss should be related to the component losses
      const calculatedTotal = Math.sqrt(resistiveLoss * resistiveLoss + reactiveLoss * reactiveLoss);
      expect(totalLoss).toBeCloseTo(calculatedTotal, 5);
    });

    test('should increase power loss with increased circuit length', () => {
      const standardLoss = calculatePowerLoss(singlePhaseInputs).resistiveLoss;
      const longerLoss = calculatePowerLoss({
        ...singlePhaseInputs,
        conductorLength: singlePhaseInputs.conductorLength * 2
      }).resistiveLoss;
      
      // Double length should approximately double resistive loss
      expect(longerLoss).toBeGreaterThan(standardLoss * 1.9);
      expect(longerLoss).toBeLessThan(standardLoss * 2.1);
    });
  });

  describe('calculateVoltageRegulation', () => {
    test('should return comprehensive voltage regulation results', () => {
      const results = calculateVoltageRegulation(singlePhaseInputs);
      
      // Check that all required fields are present and have reasonable values
      expect(results.voltageDropPercent).toBeDefined();
      expect(results.voltageDrop).toBeDefined();
      expect(results.receivingEndVoltage).toBeDefined();
      expect(results.resistiveLoss).toBeDefined();
      expect(results.reactiveLoss).toBeDefined();
      expect(results.totalLoss).toBeDefined();
      expect(results.compliance).toBeDefined();
      expect(results.recommendations).toBeDefined();
      expect(results.recommendations.length).toBeGreaterThan(0);
      
      // Verify receiving end voltage calculation
      expect(results.receivingEndVoltage).toBeCloseTo(
        singlePhaseInputs.systemVoltage - results.voltageDrop, 
        5
      );
    });

    test('should correctly determine compliance status', () => {
      // Test a likely compliant case
      const compliantResults = calculateVoltageRegulation({
        ...singlePhaseInputs,
        conductorSize: '4 AWG' // Large conductor should result in small voltage drop
      });
      
      // Test a likely non-compliant case
      const nonCompliantResults = calculateVoltageRegulation({
        ...singlePhaseInputs,
        conductorSize: '14 AWG', // Small conductor
        conductorLength: 200 // Long distance
      });
      
      expect(compliantResults.compliance).toBe('compliant');
      expect(nonCompliantResults.compliance).toBe('non-compliant');
    });
  });

  describe('findMinimumConductorSize', () => {
    test('should find the minimum conductor size that meets voltage drop requirements', () => {
      const { conductorSize, ...restOfInputs } = singlePhaseInputs;
      const recommendedSize = findMinimumConductorSize(restOfInputs);
      
      // Verify that the recommended size exists and is a string
      expect(recommendedSize).toBeDefined();
      expect(typeof recommendedSize).toBe('string');
      
      // Verify that using the recommended size results in a compliant circuit
      const resultsWithRecommendedSize = calculateVoltageRegulation({
        ...restOfInputs,
        conductorSize: recommendedSize
      });
      
      expect(resultsWithRecommendedSize.compliance).toBe('compliant');
    });
  });
}); 