const axios = require('axios');

// Use the same credentials and endpoint that should work from our tests
const credentials = {
  username: 'renzyadmin',
  password: 'Renz#143'
};

// Test all possible endpoints
async function testEndpoints() {
  console.log('🔑 TESTING LOGIN ENDPOINTS DIRECTLY\n');
  
  const baseUrl = 'http://localhost:8000';
  const endpoints = [
    '/api/auth/login',  // API route with auth prefix
    '/auth/login',      // Direct auth route
    '/api/login',       // API direct login
    '/login'            // Root login
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    try {
      console.log(`Testing ${url}...`);
      const response = await axios.post(url, credentials, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ SUCCESS: ${url}`);
      console.log(`Status: ${response.status}`);
      console.log(`Has token: ${!!response.data.token}`);
      console.log(`Has user: ${!!response.data.user}\n`);
      
      // If we got here, this endpoint works
      console.log('Use this endpoint in your application!\n');
    } catch (error) {
      console.log(`❌ FAILED: ${url}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Error: ${JSON.stringify(error.response.data)}\n`);
      } else {
        console.log(`Error: ${error.message}\n`);
      }
    }
  }
}

testEndpoints().catch(error => {
  console.error('Unexpected error:', error);
}); 