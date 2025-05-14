// Simple script to test the emergency-db-update endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/emergency-db-update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const data = JSON.stringify({
  userId: 10,
  userData: {
    first_name: 'Emergency Test',
    last_name: 'Direct Update',
    student_id: 'EMG' + Date.now().toString().slice(-5)
  }
});

console.log('Sending update request:', data);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.success) {
        console.log('✅ UPDATE SUCCESSFUL!');
      } else {
        console.log('❌ UPDATE FAILED!');
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

// Write data to request body
req.write(data);
req.end(); 