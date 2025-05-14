/**
 * Test Script for Compliance Verification API
 * 
 * Run with: node src/scripts/test-compliance-api.js
 */

const axios = require('axios');
const logger = require('../utils/logger');

// Configuration
const API_URL = 'http://localhost:8000/api'; // Make sure this matches your server port
const TEST_BUILDING_TYPE = 'office';
const TEST_PROJECT_TYPE = 'lighting_retrofit';

// For testing purposes, we'll skip authentication and use direct API calls
// In a real environment, you would authenticate properly

// Test data for verification
const testCalculationData = {
  illumination: {
    calculationId: 'test-illum-001',
    calculationType: 'illumination',
    calculationData: {
      calculatedLux: 450, // Below office standard of 500 lux
      area: 100,
      fixtures: 10
    },
    buildingType: TEST_BUILDING_TYPE
  },
  lpd: {
    calculationId: 'test-lpd-001',
    calculationType: 'lpd',
    calculationData: {
      totalWattage: 1200,
      area: 100, // LPD = 12 W/m², which exceeds standard
      roomType: 'open_office'
    },
    buildingType: TEST_BUILDING_TYPE
  },
  roi: {
    calculationId: 'test-roi-001',
    calculationType: 'roi',
    calculationData: {
      implementationCost: 10000,
      annualSavings: 1400, // ROI = 14%, below 15% standard
      lifetime: 10
    },
    projectType: TEST_PROJECT_TYPE
  }
};

// Test API endpoints
async function testComplianceAPI() {
  try {
    logger.info('Starting Compliance API Tests...');
    
    // 1. Test getting building type standards
    logger.info('1. Testing GET /compliance/building-standards');
    const buildingStandards = await axios.get(`${API_URL}/compliance/building-standards`, {
      params: { buildingType: TEST_BUILDING_TYPE }
    });
    logger.info(`✅ Successfully retrieved ${buildingStandards.data.length} building standards`);
    logger.info(JSON.stringify(buildingStandards.data, null, 2));
    
    // 2. Test getting project type standards
    logger.info('\n2. Testing GET /compliance/project-standards');
    const projectStandards = await axios.get(`${API_URL}/compliance/project-standards`, {
      params: { projectType: TEST_PROJECT_TYPE }
    });
    logger.info(`✅ Successfully retrieved ${projectStandards.data.length} project standards`);
    logger.info(JSON.stringify(projectStandards.data, null, 2));
    
    // 3. Test getting compliance rules
    logger.info('\n3. Testing GET /compliance/rules');
    const rules = await axios.get(`${API_URL}/compliance/rules`);
    logger.info(`✅ Successfully retrieved ${rules.data.length} compliance rules`);
    logger.info(JSON.stringify(rules.data, null, 2));
    
    // 4. Test getting compliance recommendations
    logger.info('\n4. Testing GET /compliance/recommendations');
    const recommendations = await axios.get(`${API_URL}/compliance/recommendations`, {
      params: { calculatorType: 'illumination' }
    });
    logger.info(`✅ Successfully retrieved ${recommendations.data.length} recommendations`);
    logger.info(JSON.stringify(recommendations.data, null, 2));
    
    // 5. Test verification for illumination calculation
    logger.info('\n5. Testing POST /compliance/verify-calculation (Illumination)');
    const illuminationVerification = await axios.post(
      `${API_URL}/compliance/verify-calculation`,
      testCalculationData.illumination
    );
    logger.info('✅ Successfully verified illumination calculation');
    logger.info(JSON.stringify(illuminationVerification.data, null, 2));
    
    // 6. Test verification for LPD calculation
    logger.info('\n6. Testing POST /compliance/verify-calculation (LPD)');
    const lpdVerification = await axios.post(
      `${API_URL}/compliance/verify-calculation`,
      testCalculationData.lpd
    );
    logger.info('✅ Successfully verified LPD calculation');
    logger.info(JSON.stringify(lpdVerification.data, null, 2));
    
    // 7. Test verification for ROI calculation
    logger.info('\n7. Testing POST /compliance/verify-calculation (ROI)');
    const roiVerification = await axios.post(
      `${API_URL}/compliance/verify-calculation`,
      testCalculationData.roi
    );
    logger.info('✅ Successfully verified ROI calculation');
    logger.info(JSON.stringify(roiVerification.data, null, 2));
    
    logger.info('\nAll compliance API tests completed successfully!');
    
  } catch (error) {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      logger.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
        method: error.config.method
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      logger.error('Request error:', error.message);
    }
  }
}

// Run the test
testComplianceAPI(); 