const complianceVerificationController = require('../controllers/complianceVerificationController');
const Compliance = require('../models/Compliance');
const sinon = require('sinon');

// Mock Express request and response
const mockRequest = (body = {}, user = null, query = {}) => ({
  body,
  user,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Compliance Verification Controller', () => {
  let complianceGetRulesByTypeStub;
  let complianceGetGeneralRulesStub;
  let complianceSaveVerificationResultsStub;
  
  beforeEach(() => {
    // Setup stubs for Compliance model methods
    complianceGetRulesByTypeStub = sinon.stub(Compliance, 'getRulesByType');
    complianceGetGeneralRulesStub = sinon.stub(Compliance, 'getGeneralRules');
    complianceSaveVerificationResultsStub = sinon.stub(Compliance, 'saveVerificationResults');
  });
  
  afterEach(() => {
    // Restore stubs
    sinon.restore();
  });
  
  describe('verifyCalculation', () => {
    it('should return 400 if missing required fields', async () => {
      const req = mockRequest({ calculationType: 'illumination' }); // Missing calculationId and calculationData
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
    
    it('should process rules and return compliance results', async () => {
      // Mock rule for testing
      const mockRule = {
        id: 1,
        rule_code: 'PEC-1075',
        title: 'Illumination Requirements',
        evaluation_criteria: 'Minimum 500 lux for offices'
      };
      
      // Setup request with all required fields
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'illumination',
        calculationData: {
          calculatedLux: 600
        }
      });
      
      // Configure stubs to return test data
      complianceGetRulesByTypeStub.resolves([mockRule]);
      complianceSaveVerificationResultsStub.resolves({ id: 1 });
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      expect(complianceGetRulesByTypeStub).toHaveBeenCalledWith('illumination');
      expect(res.json).toHaveBeenCalled();
      
      // Extract the results from the mock
      const results = res.json.mock.calls[0][0];
      
      // Verify the response structure
      expect(results).toHaveProperty('rules');
      expect(results).toHaveProperty('status');
      expect(results).toHaveProperty('compliantCount');
      expect(results).toHaveProperty('nonCompliantCount');
      expect(results).toHaveProperty('needsReviewCount');
    });
    
    it('should use general rules if no specific rules found', async () => {
      // Mock general rule
      const mockGeneralRule = {
        id: 2,
        rule_code: 'GEN-001',
        title: 'General Compliance',
        evaluation_criteria: 'All systems must be properly documented'
      };
      
      // Setup request
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'custom_type',
        calculationData: {}
      });
      
      // Configure stubs - no specific rules for the type, fallback to general rules
      complianceGetRulesByTypeStub.resolves([]);
      complianceGetGeneralRulesStub.resolves([mockGeneralRule]);
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      expect(complianceGetRulesByTypeStub).toHaveBeenCalledWith('custom_type');
      expect(complianceGetGeneralRulesStub).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should save verification results when user is authenticated', async () => {
      // Mock rule
      const mockRule = {
        id: 1,
        rule_code: 'HVAC-001',
        title: 'HVAC Efficiency',
        evaluation_criteria: 'Minimum COP of 3.0'
      };
      
      // Setup request with authenticated user
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'hvac',
        calculationData: {
          cop: 3.5
        }
      }, { id: 101 }); // User ID 101
      
      // Configure stubs
      complianceGetRulesByTypeStub.resolves([mockRule]);
      complianceSaveVerificationResultsStub.resolves({ id: 2 });
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      expect(complianceSaveVerificationResultsStub).toHaveBeenCalled();
      // Verify first parameter (calculationId)
      expect(complianceSaveVerificationResultsStub.args[0][0]).toBe('calc123');
      // Verify second parameter (userId)
      expect(complianceSaveVerificationResultsStub.args[0][1]).toBe(101);
    });
    
    it('should handle server errors', async () => {
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'illumination',
        calculationData: {}
      });
      
      // Configure stub to throw an error
      complianceGetRulesByTypeStub.rejects(new Error('Database error'));
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error during compliance verification' });
    });
  });
  
  describe('getApplicableRules', () => {
    it('should return 400 if calculation type is missing', async () => {
      const req = mockRequest({}, null, {}); // No query parameters
      const res = mockResponse();
      
      await complianceVerificationController.getApplicableRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Calculation type required' });
    });
    
    it('should return rules for the specified calculation type', async () => {
      const mockRules = [
        { id: 1, rule_code: 'PF-001', title: 'Power Factor Requirements' },
        { id: 2, rule_code: 'PF-002', title: 'Power Factor Correction' }
      ];
      
      const req = mockRequest({}, null, { calculationType: 'power_factor' });
      const res = mockResponse();
      
      complianceGetRulesByTypeStub.resolves(mockRules);
      
      await complianceVerificationController.getApplicableRules(req, res);
      
      expect(complianceGetRulesByTypeStub).toHaveBeenCalledWith('power_factor');
      expect(res.json).toHaveBeenCalledWith(mockRules);
    });
    
    it('should handle server errors', async () => {
      const req = mockRequest({}, null, { calculationType: 'hvac' });
      const res = mockResponse();
      
      complianceGetRulesByTypeStub.rejects(new Error('Database error'));
      
      await complianceVerificationController.getApplicableRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error getting applicable rules' });
    });
  });
  
  // Test internal helper functions through the main function
  describe('Internal helper functions', () => {
    it('should extract numeric values with extractNumericValue', async () => {
      const mockRule = {
        id: 1,
        rule_code: 'ASHRAE-90.1-COP',
        title: 'Heat Pump Efficiency',
        evaluation_criteria: 'Minimum COP of 3.5 required for heat pumps'
      };
      
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'hvac',
        calculationData: {
          cop: 3.0 // Below required 3.5
        }
      });
      
      complianceGetRulesByTypeStub.resolves([mockRule]);
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      const results = res.json.mock.calls[0][0];
      
      // Should find one non-compliant rule
      expect(results.nonCompliantCount).toBe(1);
      expect(results.rules[0].status).toBe('non_compliant');
      expect(results.rules[0].details).toContain('3.0'); // Actual value
      expect(results.rules[0].details).toContain('3.5'); // Required value
    });
    
    it('should extract required lux with extractRequiredLux', async () => {
      const mockRule = {
        id: 1,
        rule_code: 'PEC-1075',
        title: 'Office Illumination',
        evaluation_criteria: 'Minimum 500 lux for office spaces'
      };
      
      const req = mockRequest({
        calculationId: 'calc123',
        calculationType: 'illumination',
        calculationData: {
          calculatedLux: 450 // Below required 500
        }
      });
      
      complianceGetRulesByTypeStub.resolves([mockRule]);
      
      const res = mockResponse();
      
      await complianceVerificationController.verifyCalculation(req, res);
      
      const results = res.json.mock.calls[0][0];
      
      // Should find one non-compliant rule
      expect(results.nonCompliantCount).toBe(1);
      expect(results.rules[0].status).toBe('non_compliant');
      expect(results.rules[0].details).toContain('450'); // Actual value
      expect(results.rules[0].details).toContain('500'); // Required value
    });
  });
}); 