const axios = require('axios');

// Emergency user update test
async function testEmergencyUpdate() {
  console.log('Testing emergency user update...');
  
  try {
    // Replace with a valid user ID from your database
    const userId = 10; // Change this to a valid user ID 
    const userData = {
      first_name: "Emergency Direct",
      last_name: "Database Update",
      student_id: "EMP" + Math.floor(Math.random() * 10000).toString().padStart(5, '0')
    };
    
    console.log(`Updating user ${userId} with:`, userData);
    
    // Try the emergency endpoint
    const response = await axios.post('http://localhost:8000/emergency-db-update', {
      userId,
      userData
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Emergency update response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Emergency update SUCCESSFUL');
    } else {
      console.log('❌ Emergency update FAILED');
    }
  } catch (error) {
    console.error('Error testing emergency update:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testEmergencyUpdate(); 