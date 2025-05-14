const { pool } = require('./config/database');

async function main() {
  try {
    console.log('Testing user data formatting...');
    
    // Get raw data
    const [users] = await pool.query('SELECT * FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    // Show raw data from database
    console.log('Raw user from database:');
    console.log(JSON.stringify(users[0], null, 2));
    
    // Show transformed data - THIS IS WHAT THE FRONTEND EXPECTS
    console.log('\nTransformed user data (what frontend expects):');
    const transformedUser = {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      firstName: users[0].first_name || '',
      lastName: users[0].last_name || '',
      role: users[0].role,
      isActive: users[0].is_active === 1,
      student_id: users[0].student_id,
      createdAt: users[0].created_at,
      updatedAt: users[0].updated_at,
    };
    console.log(JSON.stringify(transformedUser, null, 2));
    
    // Now let's look at the problematic areas in your createUser controller
    console.log('\nIn createUser controller function, the problem might be:');
    
    // Getting user from database
    const [result] = await pool.query('SELECT * FROM users WHERE id = ?', [users[0].id]);
    const user = result[0];
    
    // WRONG WAY: This is probably what's happening in the controller
    console.log('\nWRONG FORMAT - Just sending the raw database fields:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log('\nRIGHT FORMAT - With proper field name transformations:');
    // RIGHT WAY: This is how it should be formatted
    const correctFormat = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role,
      isActive: user.is_active === 1,
      student_id: user.student_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    console.log(JSON.stringify(correctFormat, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Keep the console open
    console.log('\nCheck the data formats above. The issue is in the field name transformation.');
  }
}

main(); 