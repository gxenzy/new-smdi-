const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8000';
const username = 'admin';
const password = 'password123';

async function testAuth() {
  console.log('Testing authentication endpoints...');
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Test direct auth endpoint
    console.log('\n1. Testing /api/auth/login endpoint...');
    const authResponse = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    
    console.log('Auth Response Status:', authResponse.status);
    console.log('Auth Response Data:', JSON.stringify(authResponse.data, null, 2));
    
    return { success: true, data: authResponse.data };
  } catch (error) {
    console.error('Auth Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    // Try alternative endpoint
    try {
      console.log('\n2. Testing alternative /auth/login endpoint...');
      const altResponse = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      console.log('Alternative Auth Response Status:', altResponse.status);
      console.log('Alternative Auth Response Data:', JSON.stringify(altResponse.data, null, 2));
      
      return { success: true, alternativeWorked: true, data: altResponse.data };
    } catch (altError) {
      console.error('Alternative Auth Error:', altError.message);
      
      if (altError.response) {
        console.error('Response Status:', altError.response.status);
        console.error('Response Data:', altError.response.data);
      }
      
      return { success: false, error: error.message, altError: altError.message };
    }
  }
}

// Run the test
testAuth()
  .then(result => {
    if (result.success) {
      console.log('\nAuth test completed successfully!');
    } else {
      console.log('\nAuth test failed!');
    }
  })
  .catch(error => {
    console.error('\nUnexpected error during testing:', error);
  }); 