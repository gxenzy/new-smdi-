import { 
  createVoltageDropProfileConfig,
  createConductorComparisonConfig,
  VoltageDropVisualizationOptions
} from '../utils/voltageDropVisualization';
import { VoltageRegulationInputs, VoltageRegulationResult } from '../utils/voltageRegulationUtils';

describe('Voltage Drop Visualization Utilities', () => {
  // Mock inputs and results
  const mockInputs: VoltageRegulationInputs = {
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
  
  const mockResults: VoltageRegulationResult = {
    voltageDrop: 6.9,
    voltageDropPercent: 3.0,
    receivingEndVoltage: 223.1,
    resistiveLoss: 150,
    reactiveLoss: 50,
    totalLoss: 158,
    compliance: 'non-compliant',
    recommendations: ['Consider using a larger conductor size to reduce voltage drop.']
  };
  
  describe('createVoltageDropProfileConfig', () => {
    test('should create a valid chart configuration for voltage profile', () => {
      const options: VoltageDropVisualizationOptions = {
        showLimits: true,
        colorScheme: 'default',
        darkMode: false
      };
      
      const chartConfig = createVoltageDropProfileConfig(mockResults, mockInputs, options);
      
      // Check chart type
      expect(chartConfig.type).toBe('line');
      
      // Check data structure
      expect(chartConfig.data).toBeDefined();
      expect(chartConfig.data?.labels).toBeDefined();
      expect(chartConfig.data?.labels?.length).toBeGreaterThan(0);
      expect(chartConfig.data?.datasets).toBeDefined();
      
      // With showLimits = true, we should have 3 datasets (voltage + 2 limits)
      expect(chartConfig.data?.datasets?.length).toBe(3);
      
      // First dataset should be the voltage profile
      expect(chartConfig.data?.datasets?.[0].label).toContain('Voltage Profile');
      
      // Check options
      expect(chartConfig.options).toBeDefined();
      expect(chartConfig.options?.scales).toBeDefined();
      expect(chartConfig.options?.plugins).toBeDefined();
    });
    
    test('should respect showLimits option', () => {
      const withLimits = createVoltageDropProfileConfig(mockResults, mockInputs, { showLimits: true });
      const withoutLimits = createVoltageDropProfileConfig(mockResults, mockInputs, { showLimits: false });
      
      // With limits should have more datasets than without
      expect(withLimits.data?.datasets?.length).toBeGreaterThan(withoutLimits.data?.datasets?.length || 0);
    });
    
    test('should apply color scheme correctly', () => {
      const defaultScheme = createVoltageDropProfileConfig(mockResults, mockInputs, { colorScheme: 'default' });
      const accessibilityScheme = createVoltageDropProfileConfig(mockResults, mockInputs, { colorScheme: 'accessibility' });
      
      // Color schemes should result in different colors
      expect(defaultScheme.data?.datasets?.[0].borderColor).not.toBe(accessibilityScheme.data?.datasets?.[0].borderColor);
    });
  });
  
  describe('createConductorComparisonConfig', () => {
    test('should create a valid chart configuration for conductor comparison', () => {
      const conductorSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG'];
      const options: VoltageDropVisualizationOptions = {
        showLimits: true,
        colorScheme: 'default',
        darkMode: false
      };
      
      const chartConfig = createConductorComparisonConfig(mockInputs, conductorSizes, options);
      
      // Check chart type
      expect(chartConfig.type).toBe('bar');
      
      // Check data structure
      expect(chartConfig.data).toBeDefined();
      expect(chartConfig.data?.labels).toBeDefined();
      expect(chartConfig.data?.datasets).toBeDefined();
      
      // With showLimits = true and 4 conductor sizes, we should have 6 datasets
      // (4 conductors + 2 limits)
      expect(chartConfig.data?.datasets?.length).toBe(6);
      
      // Check options
      expect(chartConfig.options).toBeDefined();
      expect(chartConfig.options?.scales).toBeDefined();
      expect(chartConfig.options?.plugins).toBeDefined();
    });
    
    test('should respect showLimits option', () => {
      const conductorSizes = ['14 AWG', '12 AWG', '10 AWG'];
      const withLimits = createConductorComparisonConfig(mockInputs, conductorSizes, { showLimits: true });
      const withoutLimits = createConductorComparisonConfig(mockInputs, conductorSizes, { showLimits: false });
      
      // With limits should have more datasets than without
      expect(withLimits.data?.datasets?.length || 0).toBeGreaterThan(withoutLimits.data?.datasets?.length || 0);
      expect((withLimits.data?.datasets?.length || 0) - (withoutLimits.data?.datasets?.length || 0)).toBe(2); // 2 limit lines
    });
    
    test('should sort datasets by voltage drop in descending order', () => {
      const conductorSizes = ['14 AWG', '12 AWG', '10 AWG', '8 AWG'];
      const chartConfig = createConductorComparisonConfig(mockInputs, conductorSizes, { showLimits: false });
      
      // Get voltage drop values from datasets
      const voltageDrops = chartConfig.data?.datasets?.map(ds => ds.data?.[0] as number);
      
      // Check they're sorted in descending order
      if (voltageDrops) {
        for (let i = 1; i < voltageDrops.length; i++) {
          if (voltageDrops[i - 1] !== undefined && voltageDrops[i] !== undefined) {
            expect(voltageDrops[i - 1]).toBeGreaterThanOrEqual(voltageDrops[i]);
          }
        }
      }
    });
  });
}); 